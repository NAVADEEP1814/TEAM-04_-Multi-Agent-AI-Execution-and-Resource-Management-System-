from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/processes", tags=["Processes"])

class SignalRequest(BaseModel):
    signal: str = Field(..., example="SIGSTOP") # SIGSTOP, SIGCONT, SIGTERM, SIGKILL

@router.get("")
async def get_processes(user: dict = Depends(get_current_user)):
    return {"processes": os_bridge.get_processes()}

@router.post("/{pid}/signal")
async def send_signal_to_process(pid: int, req: SignalRequest, user: dict = Depends(get_current_user)):
    allowed_signals = ["SIGSTOP", "SIGCONT", "SIGTERM", "SIGKILL"]
    if req.signal.upper() not in allowed_signals:
        raise HTTPException(status_code=400, detail=f"Unsupported signal. Allowed: {allowed_signals}")
    res = os_bridge.send_signal(pid, req.signal.upper())
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error", "Process signal dispatch failed"))
    return res
