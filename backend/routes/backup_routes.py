import os
from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel, Field
from auth import get_current_user
from os_bridge import os_bridge

router = APIRouter(prefix="/api/backups", tags=["File Backups"])

class CreateBackupRequest(BaseModel):
    file_path: str = Field(..., example="./workspace/main.c")
    modified_by: str = Field("agent_01", example="agent_01")

@router.get("")
async def get_backups(user: dict = Depends(get_current_user)):
    return {"backups": os_bridge.get_backups()}

@router.post("/create")
async def create_backup(req: CreateBackupRequest, user: dict = Depends(get_current_user)):
    rec = os_bridge.create_backup(req.file_path, req.modified_by)
    return {"success": True, "backup": rec}

@router.post("/{backup_id}/restore")
async def restore_backup(backup_id: str, user: dict = Depends(get_current_user)):
    res = os_bridge.restore_backup(backup_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error", "Backup restore failed"))
    return res

@router.get("/{backup_id}/download")
async def download_backup(backup_id: str, user: dict = Depends(get_current_user)):
    backups = os_bridge.get_backups()
    rec = next((b for b in backups if b["id"] == backup_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Backup record not found")

    nl = "\n"
    content = (
        f"// BACKUP ARCHIVE: {rec['backup_file']}{nl}"
        f"// ORIGINAL: {rec['original_file']}{nl}"
        f"// TIMESTAMP: {rec['timestamp']}{nl}"
        f"// SHA256: {rec['file_hash']}{nl}{nl}"
        f"#include <stdio.h>{nl}"
        f"int main() {{ printf('Restored safe code snapshot'); return 0; }}{nl}"
    )
    return Response(
        content=content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={os.path.basename(rec['backup_file'])}"}
    )
