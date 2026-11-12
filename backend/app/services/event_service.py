import asyncio
import json
from datetime import datetime
from typing import Dict, List, Any, Set, Optional
from fastapi import WebSocket

class EventBroadcaster:
    def __init__(self):
        self._active_websockets: Set[WebSocket] = set()
        self._sse_subscribers: List[asyncio.Queue] = []
        self._recent_events: List[Dict[str, Any]] = []

    async def connect_ws(self, websocket: WebSocket):
        await websocket.accept()
        self._active_websockets.add(websocket)

    def disconnect_ws(self, websocket: WebSocket):
        self._active_websockets.discard(websocket)

    def subscribe_sse(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self._sse_subscribers.append(queue)
        return queue

    def unsubscribe_sse(self, queue: asyncio.Queue):
        if queue in self._sse_subscribers:
            self._sse_subscribers.remove(queue)

    async def broadcast_event(self, event_type: str, session_id: Optional[str] = None, data: Optional[Dict[str, Any]] = None):
        """
        Broadcasts an execution event to all connected WebSockets and SSE queues.
        """
        payload = {
            "type": event_type,
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": data or {}
        }

        # Save to recent events cache (keep last 50)
        self._recent_events.append(payload)
        if len(self._recent_events) > 50:
            self._recent_events.pop(0)

        # Broadcast to WebSockets
        dead_ws = set()
        for ws in self._active_websockets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead_ws.add(ws)
        for ws in dead_ws:
            self._active_websockets.discard(ws)

        # Broadcast to SSE queues
        for queue in self._sse_subscribers:
            try:
                await queue.put(payload)
            except Exception:
                pass

    def get_recent_events(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if session_id:
            return [e for e in self._recent_events if e.get("session_id") == session_id]
        return self._recent_events

event_broadcaster = EventBroadcaster()
