from fastapi import APIRouter, Depends
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/system", tags=["System & Health"])

@router.get("/status")
async def get_system_status(user: dict = Depends(get_current_user)):
    return os_bridge.get_status()

@router.post("/demo-init")
async def init_demo_environment(user: dict = Depends(get_current_user)):
    return os_bridge.reset_demo()

@router.post("/reset")
async def reset_system(user: dict = Depends(get_current_user)):
    return os_bridge.reset_demo()

@router.get("/signals-history")
async def get_signals_history(user: dict = Depends(get_current_user)):
    return {"history": os_bridge.get_signals_history()}

@router.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "OSSP Multi-Agent System Backend",
        "mode": os_bridge.get_mode(),
        "timestamp": os_bridge.get_status()["uptime"]
    }
