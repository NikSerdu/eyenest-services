from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

import numpy as np
from livekit import rtc
from livekit.agents import AgentServer, JobContext, cli

from config import settings
from motion_detector import MotionDetector
from rmq_motion import publish_motion_event


logger = logging.getLogger("motion-agent")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

server = AgentServer()


def _participant_is_camera(
    participant: rtc.RemoteParticipant,
    *,
    room_name: str,
) -> bool:
    # In the current backend integration, camera identity equals room name.
    return participant.identity == room_name


def _frame_to_bgr(frame: rtc.VideoFrame) -> np.ndarray:
    rgb_frame = frame.convert(rtc.VideoBufferType.RGB24)
    array = np.frombuffer(rgb_frame.data, dtype=np.uint8).reshape(
        (rgb_frame.height, rgb_frame.width, 3)
    )
    return cvt_rgb_to_bgr(array)


def cvt_rgb_to_bgr(array: np.ndarray) -> np.ndarray:
    return array[:, :, ::-1].copy()


async def process_video_track(
    track: rtc.Track,
    *,
    room_name: str,
    participant_identity: str,
) -> None:
    if track.kind != rtc.TrackKind.KIND_VIDEO:
        return

    detector = MotionDetector(
        min_area=settings.motion_min_area,
        frame_cooldown_sec=settings.motion_frame_cooldown_sec,
        blur_size=settings.motion_blur_size,
    )
    stream = rtc.VideoStream(track)

    logger.info(
        "Started video processing room=%s participant=%s",
        room_name,
        participant_identity,
    )

    try:
        async for event in stream:
            frame_bgr = _frame_to_bgr(event.frame)
            motion_event = detector.detect(frame_bgr)

            if motion_event is None:
                continue

            # Notify backend services about motion.
            # For now we only publish cameraId to RabbitMQ.
            asyncio.create_task(
                publish_motion_event(
                    settings.motion_detected_routing_key,
                    {"cameraId": room_name},
                ),
            )

            logger.info(
                "motion_detected room=%s participant=%s ts=%s contour_area=%.2f changed_pixels=%s",
                room_name,
                participant_identity,
                datetime.now(timezone.utc).isoformat(),
                motion_event.contour_area,
                motion_event.changed_pixels,
            )
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception(
            "Video processing failed room=%s participant=%s",
            room_name,
            participant_identity,
        )
    finally:
        await stream.aclose()
        logger.info(
            "Stopped video processing room=%s participant=%s",
            room_name,
            participant_identity,
        )


@server.rtc_session(agent_name=settings.motion_agent_name)
async def motion_agent(ctx: JobContext) -> None:
    room = ctx.room
    room_name = room.name
    active_tasks: dict[str, asyncio.Task[None]] = {}

    def start_processing_if_needed(
        track: rtc.Track,
        participant: rtc.RemoteParticipant,
    ) -> None:
        if not _participant_is_camera(participant, room_name=room_name):
            return

        if track.kind != rtc.TrackKind.KIND_VIDEO:
            return

        task_key = f"{participant.identity}:{track.sid}"
        if task_key in active_tasks and not active_tasks[task_key].done():
            return

        active_tasks[task_key] = asyncio.create_task(
            process_video_track(
                track,
                room_name=room_name,
                participant_identity=participant.identity,
            )
        )

    @room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.RemoteTrackPublication,
        participant: rtc.RemoteParticipant,
    ) -> None:
        logger.info(
            "track_subscribed room=%s participant=%s kind=%s sid=%s",
            room_name,
            participant.identity,
            track.kind,
            publication.sid,
        )
        start_processing_if_needed(track, participant)

    @room.on("track_unsubscribed")
    def on_track_unsubscribed(
        track: rtc.Track,
        publication: rtc.RemoteTrackPublication,
        participant: rtc.RemoteParticipant,
    ) -> None:
        task_key = f"{participant.identity}:{publication.sid}"
        task = active_tasks.pop(task_key, None)
        if task is not None:
            task.cancel()

    await ctx.connect()
    logger.info("Agent connected room=%s", room_name)

    for participant in room.remote_participants.values():
        if not _participant_is_camera(participant, room_name=room_name):
            continue

        for publication in participant.track_publications.values():
            if publication.track is None:
                continue

            start_processing_if_needed(publication.track, participant)

    try:
        await asyncio.Future()
    finally:
        for task in active_tasks.values():
            task.cancel()
        await asyncio.gather(*active_tasks.values(), return_exceptions=True)


if __name__ == "__main__":
    cli.run_app(server)
