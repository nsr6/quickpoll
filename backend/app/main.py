from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from .db import init_db, get_session, engine
from .models import Poll, Option
from .schemas import PollCreate, PollOut, OptionOut
from .crud import create_poll, get_polls, get_poll, vote_option, like_poll, delete_poll
from .ws_manager import manager
from fastapi.concurrency import run_in_threadpool
import uvicorn
from typing import Dict

app = FastAPI(title="QuickPoll API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_start():
    init_db()

@app.post("/polls", response_model=Dict)
async def api_create_poll(poll_in: PollCreate, session: Session = Depends(get_session)):
    # run DB work in threadpool to avoid blocking the event loop
    poll = await run_in_threadpool(create_poll, session, poll_in)
    # assemble payload to broadcast
    poll_obj = await run_in_threadpool(get_poll, session, poll.id)
    payload = {"type": "poll_created", "poll": {
        "id": poll_obj.id,
        "question": poll_obj.question,
        "likes": poll_obj.likes,
        "options": [{"id": o.id,"text":o.text,"votes":o.votes} for o in poll_obj.options]
    }}
    # broadcast to connected websocket clients
    await manager.broadcast(payload)
    return {"ok": True, "poll_id": poll.id}

@app.get("/polls")
def api_get_polls(session: Session = Depends(get_session)):
    polls = get_polls(session)
    out = []
    for p in polls:
        out.append({
            "id": p.id,
            "question": p.question,
            "likes": p.likes,
            "options": [{"id": o.id, "text": o.text, "votes": o.votes} for o in p.options]
        })
    return out

@app.post("/polls/{poll_id}/vote")
async def api_vote(poll_id: int, option_id: int, session: Session = Depends(get_session)):
    opt = await run_in_threadpool(vote_option, session, option_id)
    if not opt:
        raise HTTPException(status_code=404, detail="Option not found")
    # fetch poll for broadcasting
    poll = await run_in_threadpool(get_poll, session, poll_id)
    payload = {"type":"vote","poll":{"id": poll.id, "options":[{"id":o.id,"votes":o.votes} for o in poll.options]}}
    await manager.broadcast(payload)
    return {"ok": True}

@app.post("/polls/{poll_id}/like")
async def api_like(poll_id: int, session: Session = Depends(get_session)):
    p = await run_in_threadpool(like_poll, session, poll_id)
    if not p:
        raise HTTPException(status_code=404, detail="Poll not found")
    payload = {"type":"like","poll":{"id": p.id, "likes": p.likes}}
    await manager.broadcast(payload)
    return {"ok": True}

@app.delete("/polls/{poll_id}")
async def api_delete_poll(poll_id: int, session: Session = Depends(get_session)):
    if not delete_poll(session, poll_id):
        raise HTTPException(status_code=404, detail="Poll not found")
    payload = {"type": "poll_deleted", "poll_id": poll_id}
    await manager.broadcast(payload)
    return {"ok": True}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()  # optionally handle client messages
    except WebSocketDisconnect:
        await manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
