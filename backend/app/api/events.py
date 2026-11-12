from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
import asyncio
import json
from backend.app.services.event_service import event_broadcaster

router = APIRouter(tags=["Real-Time Events"])

@router.get("/api/events")
async def sse_events():
    """Server-Sent Events endpoint streaming real-time execution lifecycle events."""
    queue = event_broadcaster.subscribe_sse()

    async def event_generator():
        try:
            # Yield initial connection heartbeat
            yield f"data: {json.dumps({'type': 'CONNECTED', 'message': 'SSE event stream active'})}\n\n"
            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(payload)}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat comment
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            event_broadcaster.unsubscribe_sse(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint streaming execution events with bidirectional ping."""
    await event_broadcaster.connect_ws(websocket)
    try:
        await websocket.send_json({"type": "CONNECTED", "message": "WebSocket connected"})
        while True:
            # Keep connection alive, listen for client messages or pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        event_broadcaster.disconnect_ws(websocket)
    except Exception:
        event_broadcaster.disconnect_ws(websocket)
