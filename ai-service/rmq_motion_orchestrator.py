from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import aio_pika
from livekit import api

from config import settings


logger = logging.getLogger("motion-orchestrator")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)


def _extract_camera_id(payload: Any) -> str | None:
    if isinstance(payload, str) and payload.strip():
        return payload.strip()

    if not isinstance(payload, dict):
        return None

    camera_id = payload.get("cameraId")
    if isinstance(camera_id, str) and camera_id:
        return camera_id

    # NestJS ClientProxy.emit wraps body as { pattern, data }.
    nested_data = payload.get("data")
    if isinstance(nested_data, dict):
        nested_camera_id = nested_data.get("cameraId")
        if isinstance(nested_camera_id, str) and nested_camera_id:
            return nested_camera_id

    return None


def _extract_dispatch_id(dispatch: Any) -> str | None:
    for field in ("id", "dispatch_id", "dispatchId"):
        value = getattr(dispatch, field, None)
        if isinstance(value, str) and value:
            return value
    return None


def _extract_routing_key(payload: Any, fallback_key: str) -> str:
    if isinstance(payload, dict):
        pattern = payload.get("pattern")
        if isinstance(pattern, str) and pattern:
            return pattern
    return fallback_key


async def main() -> None:
    lkapi = api.LiveKitAPI(
        settings.livekit_url,
        settings.livekit_api_key,
        settings.livekit_api_secret,
    )

    rmq_conn = await aio_pika.connect_robust(settings.rmq_url)
    channel = await rmq_conn.channel()

    exchange = await channel.declare_exchange(
        settings.rmq_exchange,
        aio_pika.ExchangeType.TOPIC,
        durable=True,
    )

    # Dedicated durable queue for ai-service subscriptions.
    queue = await channel.declare_queue(
        settings.rmq_ai_queue,
        durable=True,
        exclusive=False,
        auto_delete=False,
    )
    await queue.bind(exchange, routing_key=settings.motion_on_routing_key)
    await queue.bind(exchange, routing_key=settings.motion_off_routing_key)

    active_dispatches: dict[str, str] = {}

    logger.info("Started RMQ motion orchestrator")

    async with queue.iterator() as iterator:
        async for message in iterator:
            async with message.process():
                try:
                    body = message.body.decode("utf-8")
                    try:
                        payload = json.loads(body)
                    except json.JSONDecodeError:
                        # Fallback: allow simple payload like "<cameraId>".
                        payload = body
                except Exception:
                    logger.exception("Failed to parse RMQ message body: %r", message.body)
                    continue

                camera_id = _extract_camera_id(payload)
                if not camera_id:
                    logger.warning("Skip RMQ message without cameraId: %r", payload)
                    continue

                routing_key = _extract_routing_key(payload, message.routing_key)
                if routing_key == settings.motion_on_routing_key:
                    if camera_id in active_dispatches:
                        continue

                    dispatch = await lkapi.agent_dispatch.create_dispatch(
                        api.CreateAgentDispatchRequest(
                            agent_name=settings.motion_agent_name,
                            room=camera_id,
                            metadata="{}",
                        ),
                    )
                    dispatch_id = _extract_dispatch_id(dispatch)
                    if not dispatch_id:
                        logger.warning("Could not extract dispatch_id: %r", dispatch)
                        continue

                    active_dispatches[camera_id] = dispatch_id
                    logger.info("Dispatch created cameraId=%s dispatchId=%s", camera_id, dispatch_id)

                elif routing_key == settings.motion_off_routing_key:
                    dispatch_id = active_dispatches.pop(camera_id, None)
                    if not dispatch_id:
                        # If we lost state (restart), attempt cleanup by deleting existing dispatches.
                        try:
                            existing = await lkapi.agent_dispatch.list_dispatch(camera_id)
                            for d in existing:
                                if getattr(d, "agent_name", None) != settings.motion_agent_name:
                                    continue
                                existing_id = _extract_dispatch_id(d)
                                if existing_id:
                                    await lkapi.agent_dispatch.delete_dispatch(
                                        existing_id, camera_id
                                    )
                        except Exception:
                            logger.exception("Failed cleanup after motion.off cameraId=%s", camera_id)
                        continue

                    await lkapi.agent_dispatch.delete_dispatch(dispatch_id, camera_id)
                    logger.info("Dispatch deleted cameraId=%s dispatchId=%s", camera_id, dispatch_id)

                else:
                    logger.debug("Unknown routing_key=%s payload=%r", routing_key, payload)


if __name__ == "__main__":
    asyncio.run(main())

