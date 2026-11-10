import asyncio
import json
import logging
from datetime import datetime
from typing import AsyncGenerator, Dict, Any, List

logger = logging.getLogger("techz.event_bus")

class EventBus:
    def __init__(self):
        self._subscribers: List[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self._subscribers.append(q)
        logger.info(f"New SSE client subscribed. Total active listeners: {len(self._subscribers)}")
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self._subscribers:
            self._subscribers.remove(q)
            logger.info(f"Client disconnected. Remaining active listeners: {len(self._subscribers)}")

    async def publish(self, event_type: str, data: Dict[str, Any]):
        message = {
            "event": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        dead_queues = []
        for q in self._subscribers:
            try:
                q.put_nowait(message)
            except Exception:
                dead_queues.append(q)

        for dq in dead_queues:
            self.unsubscribe(dq)

event_bus = EventBus()
