from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/tasks", tags=["Task Execution Center"])

class SubmitTaskRequest(BaseModel):
    agent_id: str = Field(..., example="agent_01")
    task_type: str = Field(..., example="CODE_GENERATION") # CODE_GENERATION, CODE_EXECUTION, CODE_REVIEW, TESTING
    description: str = Field(..., example="Compile and analyze memory bounds on main.c")
    priority: int = Field(0, ge=-20, le=19)
    cpu_limit: float = Field(50.0, ge=1.0, le=100.0)
    memory_limit_mb: float = Field(512.0, ge=32.0, le=4096.0)

class SolveProblemRequest(BaseModel):
    problem: str = Field(..., example="Add two numbers: 25 and 35")
    cpu_limit: float = Field(50.0, ge=1.0, le=100.0)
    memory_limit_mb: float = Field(512.0, ge=32.0, le=4096.0)

@router.get("")
async def get_tasks(user: dict = Depends(get_current_user)):
    return {"tasks": os_bridge.get_tasks()}

@router.get("/{task_id}")
async def get_task_detail(task_id: str, user: dict = Depends(get_current_user)):
    tasks = os_bridge.get_tasks()
    t = next((x for x in tasks if x["task_id"] == task_id), None)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task": t}

@router.post("/submit")
async def submit_task(req: SubmitTaskRequest, user: dict = Depends(get_current_user)):
    res = os_bridge.submit_task(
        agent_id=req.agent_id,
        task_type=req.task_type,
        description=req.description,
        priority=req.priority,
        cpu_limit=req.cpu_limit,
        mem_limit=req.memory_limit_mb
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Task submission failed"))
    return res

@router.post("/solve-problem")
async def solve_problem(req: SolveProblemRequest, user: dict = Depends(get_current_user)):
    if not req.problem or not req.problem.strip():
        raise HTTPException(status_code=400, detail="Problem description cannot be empty")
    res = os_bridge.solve_problem(
        problem=req.problem.strip(),
        cpu_limit=req.cpu_limit,
        mem_limit=req.memory_limit_mb
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Problem solving failed"))
    return res
