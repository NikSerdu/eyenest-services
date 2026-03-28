from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Any
from weakref import WeakKeyDictionary

import aio_pika

from config import settings


logger = logging.getLogger("ai-service-rmq")


@dataclass
class _LoopExchangeState:
	connection: aio_pika.RobustConnection | None
	exchange: aio_pika.Exchange | None
	lock: asyncio.Lock


_states: WeakKeyDictionary[asyncio.AbstractEventLoop, _LoopExchangeState] = (
	WeakKeyDictionary()
)


def _get_or_create_state(loop: asyncio.AbstractEventLoop) -> _LoopExchangeState:
	state = _states.get(loop)
	if state is not None:
		return state

	state = _LoopExchangeState(
		connection=None,
		exchange=None,
		lock=asyncio.Lock(),
	)
	_states[loop] = state
	return state


async def ensure_exchange() -> aio_pika.Exchange:
	loop = asyncio.get_running_loop()
	state = _get_or_create_state(loop)

	if state.exchange is not None and state.connection is not None and not state.connection.is_closed:
		return state.exchange

	async with state.lock:
		if (
			state.exchange is not None
			and state.connection is not None
			and not state.connection.is_closed
		):
			return state.exchange

		state.connection = await aio_pika.connect_robust(settings.rmq_url)
		channel = await state.connection.channel()
		state.exchange = await channel.declare_exchange(
			settings.rmq_exchange,
			aio_pika.ExchangeType.TOPIC,
			durable=True,
		)
		return state.exchange


async def publish_motion_event(routing_key: str, payload: dict[str, Any]) -> None:
	try:
		exchange = await ensure_exchange()
		# NestJS RMQ transport expects an envelope with `pattern` and `data`.
		# If we send only raw payload, consumer sees "Event pattern: undefined".
		nest_event = {
			"pattern": routing_key,
			"data": payload,
		}
		body = json.dumps(nest_event).encode("utf-8")
		message = aio_pika.Message(
			body=body,
			content_type="application/json",
			delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
		)
		await exchange.publish(message, routing_key=routing_key)
	except Exception:
		# Reset per-loop cache so next attempt reconnects with fresh channel.
		loop = asyncio.get_running_loop()
		state = _states.get(loop)
		if state is not None:
			state.exchange = None
			if state.connection is not None and not state.connection.is_closed:
				await state.connection.close()
			state.connection = None

		# We don't want to crash motion detection if RMQ is temporarily down.
		logger.exception("Failed to publish motion event routing_key=%s", routing_key)

