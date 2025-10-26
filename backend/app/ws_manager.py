from typing import List, Dict
from fastapi import WebSocket
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self.lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict):
        payload = json.dumps(message, default=str)
        async with self.lock:
            # send concurrently
            await asyncio.gather(*[ws.send_text(payload) for ws in list(self.active_connections)], return_exceptions=True)

manager = ConnectionManager()
