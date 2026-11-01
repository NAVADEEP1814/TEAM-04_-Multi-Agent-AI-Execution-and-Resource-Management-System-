import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/files", tags=["Workspace Security & ACL"])

class ValidateFileRequest(BaseModel):
    agent_id: str = Field(..., example="agent_01")
    path: str = Field(..., example="./workspace/main.c")
    operation: str = Field("READ", example="READ") # READ, WRITE, CREATE, DELETE

@router.get("/tree")
async def get_workspace_tree(user: dict = Depends(get_current_user)):
    workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "workspace"))
    files = []
    if os.path.exists(workspace_dir):
        for root, _, filenames in os.walk(workspace_dir):
            for f in filenames:
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, workspace_dir).replace("\\", "/")
                size = os.path.getsize(full_p)
                files.append({
                    "name": f,
                    "path": f"./workspace/{rel_p}",
                    "size_bytes": size,
                    "permissions": "-rw-r--r--"
                })
    return {"workspace_root": "./workspace", "files": files}

@router.post("/validate")
async def validate_file(req: ValidateFileRequest, user: dict = Depends(get_current_user)):
    res = os_bridge.validate_file(req.agent_id, req.path, req.operation.upper())
    return res

@router.get("/audit-logs")
async def get_audit_logs(user: dict = Depends(get_current_user)):
    return {"audits": os_bridge.get_file_audits()}

@router.get("/security-alerts")
async def get_security_alerts(user: dict = Depends(get_current_user)):
    return {"alerts": os_bridge.get_security_alerts()}
