from fastapi import APIRouter, Depends
from auth import get_current_user
from os_bridge import os_bridge
from simulation_engine import simulation_engine

router = APIRouter(prefix="/api/resources", tags=["Resource Monitor"])

@router.get("/current")
async def get_current_resources(user: dict = Depends(get_current_user)):
    agents = os_bridge.get_agents()
    total_cpu = sum(a["cpu"] for a in agents if a["status"] in ("RUNNING", "RESOURCE LIMIT EXCEEDED"))
    total_mem = sum(a["memory_mb"] for a in agents)
    return {
        "total_cpu_percent": round(total_cpu, 1),
        "total_memory_mb": round(total_mem, 1),
        "total_memory_gb": round(total_mem / 1024.0, 2),
        "system_memory_limit_gb": 8.0,
        "agents": [
            {
                "id": a["id"],
                "name": a["name"],
                "cpu": a["cpu"],
                "cpu_limit": a["cpu_limit"],
                "memory_mb": a["memory_mb"],
                "memory_limit_mb": a["memory_limit_mb"],
                "status": a["status"]
            }
            for a in agents
        ]
    }

@router.get("/history")
async def get_resource_history(user: dict = Depends(get_current_user)):
    return {"history": os_bridge.get_resource_history()}

@router.get("/violations")
async def get_violations(user: dict = Depends(get_current_user)):
    agents = os_bridge.get_agents()
    violations = []
    for a in agents:
        if a["cpu"] > a["cpu_limit"]:
            violations.append({
                "agent_id": a["id"],
                "agent_name": a["name"],
                "pid": a["pid"],
                "type": "CPU",
                "current": a["cpu"],
                "limit": a["cpu_limit"],
                "unit": "%"
            })
        if a["memory_mb"] > a["memory_limit_mb"]:
            violations.append({
                "agent_id": a["id"],
                "agent_name": a["name"],
                "pid": a["pid"],
                "type": "MEMORY",
                "current": a["memory_mb"],
                "limit": a["memory_limit_mb"],
                "unit": "MB"
            })
    return {"violations": violations}
