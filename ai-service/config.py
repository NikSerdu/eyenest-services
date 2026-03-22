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
    rmq_url: str
    rmq_exchange: str
    rmq_ai_queue: str
    motion_on_routing_key: str
    motion_off_routing_key: str
    motion_detected_routing_key: str


def _get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def load_settings() -> Settings:
    blur_size = int(os.getenv("MOTION_BLUR_SIZE", "21"))
    if blur_size % 2 == 0:
        blur_size += 1

    rmq_url = os.getenv("RMQ_URL")
    if not rmq_url:
        rmq_user = os.getenv("RABBITMQ_DEFAULT_USER", "admin")
        rmq_pass = os.getenv("RABBITMQ_DEFAULT_PASS", "admin")
        rmq_host = os.getenv("RABBITMQ_HOST", "localhost")
        rmq_port = int(os.getenv("RABBITMQ_PORT", "5672"))
        rmq_url = f"amqp://{rmq_user}:{rmq_pass}@{rmq_host}:{rmq_port}"

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
        rmq_url=rmq_url,
        rmq_exchange=os.getenv(
            "RMQ_EVENTS_EXCHANGE",
            os.getenv("RMQ_EXCHANGE", "eyenest.events"),
        ),
        rmq_ai_queue=os.getenv("RMQ_AI_QUEUE", "ai.events.queue"),
        motion_on_routing_key=os.getenv("MOTION_ON_RK", "motion.on"),
        motion_off_routing_key=os.getenv("MOTION_OFF_RK", "motion.off"),
        motion_detected_routing_key=os.getenv(
            "MOTION_DETECTED_RK",
            "motion.detected",
        ),
    )


settings = load_settings()
