from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    livekit_url: str
    livekit_api_key: str
    livekit_api_secret: str
    motion_agent_name: str
    motion_min_area: int
    motion_frame_cooldown_sec: float
    motion_blur_size: int


def _get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def load_settings() -> Settings:
    blur_size = int(os.getenv("MOTION_BLUR_SIZE", "21"))
    if blur_size % 2 == 0:
        blur_size += 1

    return Settings(
        livekit_url=_get_required_env("LIVEKIT_URL"),
        livekit_api_key=_get_required_env("LIVEKIT_API_KEY"),
        livekit_api_secret=_get_required_env("LIVEKIT_API_SECRET"),
        motion_agent_name=os.getenv("MOTION_AGENT_NAME", "motion-detector"),
        motion_min_area=int(os.getenv("MOTION_MIN_AREA", "2500")),
        motion_frame_cooldown_sec=float(
            os.getenv("MOTION_FRAME_COOLDOWN_SEC", "3.0")
        ),
        motion_blur_size=blur_size,
    )


settings = load_settings()
