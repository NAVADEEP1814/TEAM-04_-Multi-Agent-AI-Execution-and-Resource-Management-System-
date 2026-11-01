from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/sync", tags=["Process Synchronization"])

class LockRequest(BaseModel):
    file_path: str = Field(..., example="./workspace/main.c")
    agent_id: str = Field(..., example="agent_01")

@router.get("/locks")
async def get_locks(user: dict = Depends(get_current_user)):
    return {"locks": os_bridge.get_locks()}

@router.post("/acquire")
async def acquire_lock(req: LockRequest, user: dict = Depends(get_current_user)):
    res = os_bridge.acquire_lock(req.file_path, req.agent_id)
    return res

@router.post("/release")
async def release_lock(req: LockRequest, user: dict = Depends(get_current_user)):
    res = os_bridge.release_lock(req.file_path, req.agent_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to release lock"))
    return res

@router.post("/simulate-contention")
async def simulate_contention(user: dict = Depends(get_current_user)):
    # Agent 01 locks main.c if not locked
    os_bridge.acquire_lock("./workspace/main.c", "agent_01")
    # Agent 02 and 04 contend
    r1 = os_bridge.acquire_lock("./workspace/main.c", "agent_02")
    r2 = os_bridge.acquire_lock("./workspace/main.c", "agent_04")
    return {
        "success": True,
        "message": "Contention scenario simulated. Agent 02 and Agent 04 placed in FIFO wait queue for main.c.",
        "locks": os_bridge.get_locks()
    }
