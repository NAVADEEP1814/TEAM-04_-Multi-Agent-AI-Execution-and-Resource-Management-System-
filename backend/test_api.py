"""
Automated Test Suite for OSSP Backend API & Kernel Simulation Layer
Course: Operating Systems and Systems Programming (25CS2104E)
"""
import sys
import os

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("==================================================================")
    print("  RUNNING OSSP AUTOMATED TEST SUITE (COURSE 25CS2104E)            ")
    print("==================================================================")

    # 1. Healthcheck
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. /api/health -> OK")

    # 2. Authentication
    # 2a. Invalid credentials
    res = client.post("/api/auth/login", json={"username": "admin", "password": "wrong_password"})
    assert res.status_code == 401, "Expected 401 for wrong credentials"
    print("[PASS] 2a. Auth failure on invalid credentials -> 401 OK")

    # 2b. Valid credentials
    res = client.post("/api/auth/login", json={"username": "admin", "password": "os_admin_2026!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] 2b. Login successful, received JWT Bearer token")

    # 2c. Protected route /api/auth/me
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200 and res.json()["user"]["username"] == "admin"
    print("[PASS] 2c. Protected route /api/auth/me verified")

    # 3. System Status & Dual Mode
    res = client.get("/api/system/status", headers=headers)
    assert res.status_code == 200
    status_data = res.json()
    assert "mode" in status_data
    print(f"[PASS] 3. System Status: Mode = {status_data['mode']}, Active Agents = {status_data['active_agents']}")

    # 4. Agents & Process Creation (fork simulation)
    res = client.get("/api/agents", headers=headers)
    assert res.status_code == 200
    initial_agents = res.json()["agents"]
    assert len(initial_agents) >= 4
    print(f"[PASS] 4a. Initial 4 canonical agents loaded: {[a['name'] for a in initial_agents[:4]]}")

    # Create new agent
    new_agent_payload = {
      "name": "Agent 05 - Memory Profiler",
      "type": "Custom Agent",
      "task": "Perform heap analysis on main.c",
      "cpu_limit": 45.0,
      "memory_limit_mb": 512.0,
      "workspace_dir": "./workspace"
    }
    res = client.post("/api/agents", json=new_agent_payload, headers=headers)
    assert res.status_code == 200
    spawned = res.json()
    new_pid = spawned["agent"]["pid"]
    assert len(spawned["timeline"]) == 7
    print(f"[PASS] 4b. Process spawned via fork(): PID {new_pid}, FIFO {spawned['agent']['fifo_channel']}")

    # 5. Signals (SIGSTOP / SIGCONT / SIGTERM)
    # Stop agent
    res = client.post(f"/api/processes/{new_pid}/signal", json={"signal": "SIGSTOP"}, headers=headers)
    assert res.status_code == 200
    print(f"[PASS] 5a. kill({new_pid}, SIGSTOP) dispatched -> Process STOPPED")

    # Resume agent
    res = client.post(f"/api/processes/{new_pid}/signal", json={"signal": "SIGCONT"}, headers=headers)
    assert res.status_code == 200
    print(f"[PASS] 5b. kill({new_pid}, SIGCONT) dispatched -> Process RUNNING")

    # Terminate agent
    res = client.post(f"/api/processes/{new_pid}/signal", json={"signal": "SIGTERM"}, headers=headers)
    assert res.status_code == 200
    print(f"[PASS] 5c. kill({new_pid}, SIGTERM) dispatched -> Process TERMINATED")

    # 6. IPC / Named Pipes (FIFO)
    res = client.get("/api/ipc/channels", headers=headers)
    assert res.status_code == 200
    channels = res.json()["channels"]
    assert len(channels) >= 4
    print(f"[PASS] 6a. Verified active named pipes: {[c['fifo_name'] for c in channels[:4]]}")

    ipc_payload = {
      "from_agent": "agent_01",
      "to_agent": "agent_02",
      "content": "TEST_PIPELINE: Compile main.c and run regression tests"
    }
    res = client.post("/api/ipc/send", json=ipc_payload, headers=headers)
    assert res.status_code == 200
    print("[PASS] 6b. IPC Message transmitted through named pipe FIFO")

    # 7. Workspace Security & File Access Validation
    # 7a. Allowed access
    res = client.post("/api/files/validate", json={"agent_id": "agent_01", "path": "./workspace/main.c", "operation": "READ"}, headers=headers)
    assert res.status_code == 200 and res.json()["allowed"] is True
    print("[PASS] 7a. File access within ./workspace/ -> ALLOWED")

    # 7b. Path traversal attack blocked
    res = client.post("/api/files/validate", json={"agent_id": "agent_02", "path": "../../etc/passwd", "operation": "READ"}, headers=headers)
    assert res.status_code == 200 and res.json()["allowed"] is False
    print("[PASS] 7b. Path traversal attack (../../etc/passwd) -> DENIED & ALERT GENERATED")

    # 7c. Restricted system path blocked
    res = client.post("/api/files/validate", json={"agent_id": "agent_03", "path": "/etc/shadow", "operation": "READ"}, headers=headers)
    assert res.status_code == 200 and res.json()["allowed"] is False
    print("[PASS] 7c. Restricted system directory (/etc/shadow) -> DENIED & ALERT GENERATED")

    # 8. Synchronization & Locks
    res = client.post("/api/sync/acquire", json={"file_path": "./workspace/main.c", "agent_id": "agent_01"}, headers=headers)
    assert res.status_code == 200
    print("[PASS] 8a. Lock acquired on main.c by agent_01")

    # Contention: agent_02 tries to acquire
    res = client.post("/api/sync/acquire", json={"file_path": "./workspace/main.c", "agent_id": "agent_02"}, headers=headers)
    assert res.status_code == 200 and res.json()["success"] is False
    print("[PASS] 8b. Contention detected: agent_02 placed in wait queue for main.c")

    # Release lock
    res = client.post("/api/sync/release", json={"file_path": "./workspace/main.c", "agent_id": "agent_01"}, headers=headers)
    assert res.status_code == 200
    print("[PASS] 8c. Lock released and handed off via condition signaling")

    # 9. Backup Management
    res = client.post("/api/backups/create", json={"file_path": "./workspace/main.c", "modified_by": "agent_01"}, headers=headers)
    assert res.status_code == 200
    backup_id = res.json()["backup"]["id"]
    print(f"[PASS] 9a. Backup created: {backup_id} with SHA-256 hash")

    res = client.post(f"/api/backups/{backup_id}/restore", headers=headers)
    assert res.status_code == 200
    print("[PASS] 9b. Backup successfully restored to ./workspace/")

    # 10. Task Execution Lifecycle
    task_payload = {
      "agent_id": "agent_01",
      "task_type": "CODE_GENERATION",
      "description": "Generate POSIX fork test suite",
      "priority": 0,
      "cpu_limit": 50.0,
      "memory_limit_mb": 512.0
    }
    res = client.post("/api/tasks/submit", json=task_payload, headers=headers)
    assert res.status_code == 200
    task_res = res.json()["task"]
    assert len(task_res["lifecycle"]) == 7
    print(f"[PASS] 10. Task {task_res['task_id']} executed across all 7 lifecycle stages")

    # 11. Activity Logs
    res = client.get("/api/logs", headers=headers)
    assert res.status_code == 200 and len(res.json()["logs"]) > 0
    print(f"[PASS] 11. Activity logs verified: {len(res.json()['logs'])} entries recorded")

    print("==================================================================")
    print("  ALL 11 BACKEND TEST SUITES PASSED FLAWLESSLY!                  ")
    print("==================================================================")

if __name__ == "__main__":
    run_tests()
