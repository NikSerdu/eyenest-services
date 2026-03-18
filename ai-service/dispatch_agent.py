from __future__ import annotations

import argparse
import asyncio
import json

from livekit import api

from config import settings


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Explicitly dispatch the motion agent to a LiveKit room.",
    )
    parser.add_argument(
        "--room",
        required=True,
        help="Room name. In the current backend this is also the camera identity.",
    )
    parser.add_argument(
        "--camera-identity",
        help="Optional camera identity override. Defaults to the room name.",
    )
    return parser


async def main() -> None:
    args = build_parser().parse_args()
    camera_identity = args.camera_identity or args.room

    async with api.LiveKitAPI(
        settings.livekit_url,
        settings.livekit_api_key,
        settings.livekit_api_secret,
    ) as lkapi:
        dispatch = await lkapi.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name=settings.motion_agent_name,
                room=args.room,
                metadata=json.dumps(
                    {
                        "camera_identity": camera_identity,
                    }
                ),
            )
        )

    print(
        "created_dispatch",
        {
            "agent_name": settings.motion_agent_name,
            "room": args.room,
            "camera_identity": camera_identity,
            "dispatch": str(dispatch),
        },
    )


if __name__ == "__main__":
    asyncio.run(main())
