from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import aio_pika

from config import settings


logger = logging.getLogger("ai-service-rmq")

_exchange: aio_pika.Exchange | None = None
_connection: aio_pika.RobustConnection | None = None
_lock = asyncio.Lock()


async def ensure_exchange() -> aio_pika.Exchange:
	global _exchange, _connection
	if _exchange is not None:
		return _exchange

	async with _lock:
		if _exchange is not None:
			return _exchange

		_connection = await aio_pika.connect_robust(settings.rmq_url)
		channel = await _connection.channel()
		_exchange = await channel.declare_exchange(
			settings.rmq_exchange,
			aio_pika.ExchangeType.TOPIC,
			durable=True,
		)
		return _exchange


async def publish_motion_event(routing_key: str, payload: dict[str, Any]) -> None:
	try:
		exchange = await ensure_exchange()
		body = json.dumps(payload).encode("utf-8")
		message = aio_pika.Message(
			body=body,
			content_type="application/json",
			delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
		)
		await exchange.publish(message, routing_key=routing_key)
	except Exception:
		# We don't want to crash motion detection if RMQ is temporarily down.
		logger.exception("Failed to publish motion event routing_key=%s", routing_key)

