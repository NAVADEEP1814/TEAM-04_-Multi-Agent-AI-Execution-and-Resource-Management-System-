from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/agents", tags=["Agents"])

class CreateAgentRequest(BaseModel):
    name: str = Field(..., example="Agent 05 - Security Auditor")
    type: str = Field(..., example="Security Auditor")
    task: Optional[str] = Field("Monitor workspace access patterns", example="Monitor workspace access patterns")
    cpu_limit: float = Field(50.0, ge=1.0, le=100.0)
    memory_limit_mb: float = Field(512.0, ge=32.0, le=4096.0)
    workspace_dir: Optional[str] = Field("./workspace")

@router.get("")
async def get_all_agents(user: dict = Depends(get_current_user)):
    return {"agents": os_bridge.get_agents()}

@router.get("/{agent_id}")
async def get_agent(agent_id: str, user: dict = Depends(get_current_user)):
    agent = os_bridge.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"agent": agent}

@router.post("")
async def create_agent(req: CreateAgentRequest, user: dict = Depends(get_current_user)):
    res = os_bridge.create_agent(
        name=req.name,
        agent_type=req.type,
        task=req.task,
        cpu_limit=req.cpu_limit,
        mem_limit=req.memory_limit_mb,
        workspace_dir=req.workspace_dir or "./workspace"
    )
    return res

@router.post("/{agent_id}/stop")
async def stop_agent(agent_id: str, user: dict = Depends(get_current_user)):
    agent = os_bridge.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    res = os_bridge.send_signal(agent["pid"], "SIGSTOP")
    return res

@router.post("/{agent_id}/resume")
async def resume_agent(agent_id: str, user: dict = Depends(get_current_user)):
    agent = os_bridge.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    res = os_bridge.send_signal(agent["pid"], "SIGCONT")
    return res

@router.post("/{agent_id}/terminate")
async def terminate_agent(agent_id: str, user: dict = Depends(get_current_user)):
    agent = os_bridge.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    res = os_bridge.send_signal(agent["pid"], "SIGTERM")
    return res
