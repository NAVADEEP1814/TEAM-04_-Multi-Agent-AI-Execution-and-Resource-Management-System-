from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/ipc", tags=["IPC & FIFO"])

class SendMessageRequest(BaseModel):
    from_agent: str = Field(..., example="agent_01")
    to_agent: str = Field(..., example="agent_02")
    content: str = Field(..., example="EXECUTE_TASK: batch_matrix_multiply")

@router.get("/channels")
async def get_channels(user: dict = Depends(get_current_user)):
    return {"channels": os_bridge.get_fifo_channels()}

@router.get("/messages")
async def get_messages(user: dict = Depends(get_current_user)):
    return {"messages": os_bridge.get_ipc_messages()}

@router.post("/send")
async def send_message(req: SendMessageRequest, user: dict = Depends(get_current_user)):
    if not req.from_agent or not req.to_agent or not req.content:
        raise HTTPException(status_code=400, detail="from_agent, to_agent, and content are required")
    msg = os_bridge.send_ipc(req.from_agent, req.to_agent, req.content)
    return {"success": True, "message": msg}
