import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from backend.app.services.event_bus import event_bus

router = APIRouter(prefix="/realtime", tags=["Realtime"])

@router.get("/stream")
async def realtime_stream():
    """
    Server-Sent Events endpoint streaming live AI orchestrator events,
    demand prediction updates, notifications, and inventory changes.
    """
    async def event_generator():
        q = event_bus.subscribe()
        try:
            # Send initial handshake ping
            yield f"event: connected\ndata: {json.dumps({'message': 'Connected to TECHZ Autonomous AI Real-Time Stream'})}\n\n"

            while True:
                try:
                    # Wait for next event with a 25-second keepalive heartbeat
                    msg = await asyncio.wait_for(q.get(), timeout=25.0)
                    yield f"event: {msg['event']}\ndata: {json.dumps(msg['data'])}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive-heartbeat\n\n"
        finally:
            event_bus.unsubscribe(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
