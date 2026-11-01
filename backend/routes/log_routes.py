import io
import csv
import json
from fastapi import APIRouter, Depends, Query, Response
from typing import Optional
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/logs", tags=["Activity Logs"])

@router.get("")
async def get_logs(
    agent: Optional[str] = Query(None),
    event: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    all_logs = os_bridge.get_logs()
    filtered = all_logs

    if agent:
        filtered = [l for l in filtered if l.get("agent") == agent]
    if event:
        filtered = [l for l in filtered if l.get("event") == event]
    if status:
        filtered = [l for l in filtered if l.get("status") == status]
    if search:
        s_lower = search.lower()
        filtered = [
            l for l in filtered
            if s_lower in str(l.get("details", "")).lower() or
               s_lower in str(l.get("event", "")).lower() or
               s_lower in str(l.get("agent", "")).lower()
        ]

    return {"logs": filtered, "total": len(filtered)}

@router.get("/terminal")
async def get_terminal_logs(user: dict = Depends(get_current_user)):
    return {"lines": os_bridge.get_terminal_logs()}

@router.get("/export")
async def export_logs(
    format: str = Query("csv", pattern="^(csv|json)$"),
    user: dict = Depends(get_current_user)
):
    logs = os_bridge.get_logs()
    if format == "json":
        return Response(
            content=json.dumps(logs, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=os_activity_logs.json"}
        )
    else:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["id", "timestamp", "agent", "pid", "event", "operation", "status", "details"])
        writer.writeheader()
        for row in logs:
            writer.writerow(row)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=os_activity_logs.csv"}
        )
