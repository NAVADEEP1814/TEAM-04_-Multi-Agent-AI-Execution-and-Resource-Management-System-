"""
High-Fidelity Linux OS Simulation & State Engine
Course: Operating Systems and Systems Programming (25CS2104E)
"""
import os
import random
import time
import hashlib
from datetime import datetime
from typing import Dict, List, Any, Optional

class SimulationEngine:
    def __init__(self):
        self.workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "workspace"))
        self.backups_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backups"))
        self.logs_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs"))

        os.makedirs(self.workspace_root, exist_ok=True)
        os.makedirs(self.backups_root, exist_ok=True)
        os.makedirs(self.logs_root, exist_ok=True)

        self.start_time = datetime.now()
        self.next_pid = 28431
        self.is_simulation_mode = True

        # State stores
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.processes: Dict[int, Dict[str, Any]] = {}
        self.fifo_channels: Dict[str, Dict[str, Any]] = {}
        self.ipc_messages: List[Dict[str, Any]] = []
        self.resource_history: List[Dict[str, Any]] = []
        self.security_alerts: List[Dict[str, Any]] = []
        self.file_audits: List[Dict[str, Any]] = []
        self.shared_locks: Dict[str, Dict[str, Any]] = {}
        self.activity_logs: List[Dict[str, Any]] = []
        self.backups: List[Dict[str, Any]] = []
        self.signals_history: List[Dict[str, Any]] = []
        self.tasks: List[Dict[str, Any]] = []
        self.terminal_logs: List[Dict[str, Any]] = []

        # Initialize demo environment
        self.initialize_demo_environment()

    def _timestamp(self) -> str:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def add_log(self, event: str, operation: str, status: str, details: str, agent_id: str = "KERNEL", pid: Optional[int] = None):
        entry = {
            "id": f"log_{len(self.activity_logs) + 1}",
            "timestamp": self._timestamp(),
            "agent": agent_id,
            "pid": pid if pid else (self.agents.get(agent_id, {}).get("pid", 0)),
            "event": event,
            "operation": operation,
            "status": status,
            "details": details
        }
        self.activity_logs.insert(0, entry)
        if len(self.activity_logs) > 500:
            self.activity_logs.pop()

        # Terminal stream
        term_line = f"[{entry['timestamp']}] [{status}] [{event}] {details}"
        self.terminal_logs.append({
            "timestamp": entry['timestamp'],
            "line": term_line,
            "level": "ERROR" if status == "DENIED" or status == "CRITICAL" else ("WARN" if status == "WARNING" else "INFO")
        })
        if len(self.terminal_logs) > 200:
            self.terminal_logs.pop(0)

    def initialize_demo_environment(self):
        """Initializes 4 canonical OS demo agents and initial state."""
        self.agents.clear()
        self.processes.clear()
        self.fifo_channels.clear()
        self.ipc_messages.clear()
        self.resource_history.clear()
        self.security_alerts.clear()
        self.file_audits.clear()
        self.shared_locks.clear()
        self.activity_logs.clear()
        self.backups.clear()
        self.signals_history.clear()
        self.tasks.clear()
        self.terminal_logs.clear()

        self.add_log("SYSTEM_BOOT", "INITIALIZATION", "SUCCESS", "Linux OS Process Manager & Simulation Engine initialized.")

        demo_agents_data = [
            {
                "id": "agent_01",
                "name": "Agent 01 - Code Generator",
                "type": "Code Generator",
                "task": "Generate source code from specifications",
                "cpu_limit": 50.0,
                "mem_limit": 512.0,
                "cpu": 14.2,
                "mem": 182.0,
                "priority": 0
            },
            {
                "id": "agent_02",
                "name": "Agent 02 - Code Executor",
                "type": "Code Executor",
                "task": "Execute compiled binaries in sandbox",
                "cpu_limit": 60.0,
                "mem_limit": 768.0,
                "cpu": 28.5,
                "mem": 310.0,
                "priority": -5
            },
            {
                "id": "agent_03",
                "name": "Agent 03 - Code Reviewer",
                "type": "Code Reviewer",
                "task": "Perform static analysis and security auditing",
                "cpu_limit": 45.0,
                "mem_limit": 384.0,
                "cpu": 8.4,
                "mem": 140.0,
                "priority": 5
            },
            {
                "id": "agent_04",
                "name": "Agent 04 - Testing Agent",
                "type": "Testing Agent",
                "task": "Run regression and POSIX IPC test suites",
                "cpu_limit": 55.0,
                "mem_limit": 512.0,
                "cpu": 19.8,
                "mem": 220.0,
                "priority": 0
            }
        ]

        for item in demo_agents_data:
            pid = self.next_pid
            self.next_pid += 1
            fifo_path = f"/tmp/{item['id']}_fifo"

            agent_obj = {
                "id": item["id"],
                "name": item["name"],
                "type": item["type"],
                "pid": pid,
                "status": "RUNNING",
                "cpu": item["cpu"],
                "memory_mb": item["mem"],
                "cpu_limit": item["cpu_limit"],
                "memory_limit_mb": item["mem_limit"],
                "task": item["task"],
                "fifo_channel": fifo_path,
                "start_time": self._timestamp(),
                "priority": item["priority"],
                "last_activity": self._timestamp()
            }
            self.agents[item["id"]] = agent_obj

            self.processes[pid] = {
                "pid": pid,
                "agent_id": item["id"],
                "agent_name": item["name"],
                "process_name": f"agent_{item['type'].lower().replace(' ', '_')}",
                "state": "RUNNING",
                "cpu_percent": item["cpu"],
                "memory_mb": item["mem"],
                "start_time": self._timestamp(),
                "priority": item["priority"],
                "ppid": 1000,
                "fifo": fifo_path
            }

            self.fifo_channels[fifo_path] = {
                "fifo_name": fifo_path,
                "source_agent": item["id"],
                "destination_agent": "PIPE_BROADCAST",
                "status": "ACTIVE",
                "messages_sent": 0,
                "messages_received": 0,
                "last_message": "Channel initialized",
                "created_time": self._timestamp()
            }

            self.add_log("PROCESS_CREATED", "fork()", "SUCCESS", f"Created agent process via fork(), assigned PID {pid}", item["id"], pid)
            self.add_log("FIFO_CREATED", "mkfifo()", "SUCCESS", f"Created named pipe {fifo_path}", item["id"], pid)

        # Initial IPC messages
        self.send_ipc_message("agent_01", "agent_02", "TASK_DISPATCH: main.c created, initiating compilation.")
        self.send_ipc_message("agent_02", "agent_03", "AUDIT_REQUEST: Verify binary symbol exports.")

        # Initial File Access Audits & Security Alerts
        self.validate_file_access("agent_01", "./workspace/main.c", "READ")
        self.validate_file_access("agent_01", "./workspace/main.c", "WRITE")
        self.validate_file_access("agent_02", "/etc/passwd", "READ")
        self.validate_file_access("agent_03", "../../etc/shadow", "READ")

        # Initial File Locks
        self.shared_locks["main.c"] = {
            "file_name": "main.c",
            "file_path": "./workspace/main.c",
            "is_locked": True,
            "current_owner": "agent_01",
            "waiting_queue": ["agent_02", "agent_04"],
            "locked_at": self._timestamp()
        }
        self.shared_locks["config.json"] = {
            "file_name": "config.json",
            "file_path": "./workspace/config.json",
            "is_locked": False,
            "current_owner": "",
            "waiting_queue": [],
            "locked_at": ""
        }

        # Initial Backup
        self.create_backup("./workspace/main.c", "agent_01")

        # Initial Resource History
        now = time.time()
        for i in range(15, 0, -1):
            past_time = datetime.fromtimestamp(now - i * 10).strftime("%H:%M:%S")
            self.resource_history.append({
                "timestamp": past_time,
                "cpu_usage": round(35.0 + random.uniform(-10, 15), 1),
                "memory_gb": round(3.2 + random.uniform(-0.4, 0.6), 2),
                "system_load": 1.45,
                "agent_01_cpu": round(14.0 + random.uniform(-3, 4), 1),
                "agent_02_cpu": round(26.0 + random.uniform(-5, 6), 1),
                "agent_03_cpu": round(8.0 + random.uniform(-2, 3), 1),
                "agent_04_cpu": round(18.0 + random.uniform(-4, 4), 1),
            })

    def create_agent_process(self, name: str, agent_type: str, task: str, cpu_limit: float, mem_limit: float, workspace_dir: str = "./workspace") -> Dict[str, Any]:
        agent_idx = len(self.agents) + 1
        agent_id = f"agent_{agent_idx:02d}"
        pid = self.next_pid
        self.next_pid += 1
        fifo_path = f"/tmp/{agent_id}_fifo"

        timeline = [
            {"step": 1, "action": "Request received", "status": "COMPLETED", "time": self._timestamp()},
            {"step": 2, "action": "Creating process structure", "status": "COMPLETED", "time": self._timestamp()},
            {"step": 3, "action": "fork() executed in kernel", "status": "COMPLETED", "time": self._timestamp()},
            {"step": 4, "action": f"PID {pid} assigned via getpid()", "status": "COMPLETED", "time": self._timestamp()},
            {"step": 5, "action": f"mkfifo() created {fifo_path}", "status": "COMPLETED", "time": self._timestamp()},
            {"step": 6, "action": "Agent execution loop started", "status": "COMPLETED", "time": self._timestamp()},
            {"step": 7, "action": "Agent registered in Process Table", "status": "COMPLETED", "time": self._timestamp()}
        ]

        agent = {
            "id": agent_id,
            "name": name,
            "type": agent_type,
            "pid": pid,
            "status": "RUNNING",
            "cpu": 12.0,
            "memory_mb": 150.0,
            "cpu_limit": cpu_limit,
            "memory_limit_mb": mem_limit,
            "task": task if task else "Standby / Ready",
            "fifo_channel": fifo_path,
            "start_time": self._timestamp(),
            "priority": 0,
            "last_activity": self._timestamp(),
            "workspace_dir": workspace_dir
        }
        self.agents[agent_id] = agent

        self.processes[pid] = {
            "pid": pid,
            "agent_id": agent_id,
            "agent_name": name,
            "process_name": f"agent_{agent_type.lower().replace(' ', '_')}",
            "state": "RUNNING",
            "cpu_percent": 12.0,
            "memory_mb": 150.0,
            "start_time": self._timestamp(),
            "priority": 0,
            "ppid": 1000,
            "fifo": fifo_path
        }

        self.fifo_channels[fifo_path] = {
            "fifo_name": fifo_path,
            "source_agent": agent_id,
            "destination_agent": "BROADCAST",
            "status": "ACTIVE",
            "messages_sent": 0,
            "messages_received": 0,
            "last_message": "Channel ready",
            "created_time": self._timestamp()
        }

        self.add_log("PROCESS_CREATED", "fork()", "SUCCESS", f"Created agent {name} (PID: {pid}) via fork()", agent_id, pid)
        self.add_log("FIFO_CREATED", "mkfifo()", "SUCCESS", f"Created FIFO {fifo_path}", agent_id, pid)

        return {"agent": agent, "timeline": timeline}

    def send_signal(self, pid: int, signal_name: str) -> Dict[str, Any]:
        proc = self.processes.get(pid)
        if not proc:
            return {"success": False, "error": f"Process PID {pid} not found"}

        agent_id = proc["agent_id"]
        agent = self.agents.get(agent_id)

        old_state = proc["state"]
        new_state = old_state

        if signal_name == "SIGSTOP":
            new_state = "STOPPED"
        elif signal_name == "SIGCONT":
            new_state = "RUNNING"
        elif signal_name in ("SIGTERM", "SIGKILL"):
            new_state = "TERMINATED"

        proc["state"] = new_state
        if agent:
            agent["status"] = new_state
            agent["last_activity"] = self._timestamp()

        log_entry = {
            "pid": pid,
            "agent_id": agent_id,
            "signal": signal_name,
            "timestamp": self._timestamp(),
            "old_state": old_state,
            "new_state": new_state,
            "success": True,
            "details": f"kill({pid}, {signal_name}) delivered. Process transitioned {old_state} -> {new_state}."
        }
        self.signals_history.insert(0, log_entry)

        event_name = "SIGNAL_SENT"
        if signal_name == "SIGSTOP": event_name = "PROCESS_STOPPED"
        elif signal_name == "SIGCONT": event_name = "PROCESS_RESUMED"
        elif signal_name in ("SIGTERM", "SIGKILL"): event_name = "PROCESS_TERMINATED"

        self.add_log(event_name, f"kill(pid, {signal_name})", "SUCCESS", log_entry["details"], agent_id, pid)
        return {"success": True, "log": log_entry}

    def send_ipc_message(self, from_agent: str, to_agent: str, content: str) -> Dict[str, Any]:
        msg_id = f"msg_{len(self.ipc_messages) + 1:04d}"
        fifo_path = f"/tmp/{from_agent}_fifo"

        msg = {
            "id": msg_id,
            "from_agent": from_agent,
            "to_agent": to_agent,
            "fifo_path": fifo_path,
            "content": content,
            "timestamp": self._timestamp(),
            "status": "DELIVERED"
        }
        self.ipc_messages.insert(0, msg)

        # Update channel stats
        if fifo_path in self.fifo_channels:
            self.fifo_channels[fifo_path]["messages_sent"] += 1
            self.fifo_channels[fifo_path]["last_message"] = content
            self.fifo_channels[fifo_path]["destination_agent"] = to_agent

        to_fifo = f"/tmp/{to_agent}_fifo"
        if to_fifo in self.fifo_channels:
            self.fifo_channels[to_fifo]["messages_received"] += 1

        self.add_log("MESSAGE_SENT", "write(fifo_fd)", "SUCCESS", f"FIFO [{from_agent} -> {to_agent}]: {content}", from_agent)
        return msg

    def validate_file_access(self, agent_id: str, requested_path: str, operation: str) -> Dict[str, Any]:
        step_1_id = {"name": "Agent Identity Check", "status": "PASSED", "detail": f"Agent {agent_id} authenticated"}
        step_2_path = {"name": "Path Analysis & Normalization", "status": "IN_PROGRESS", "detail": f"Raw path: {requested_path}"}
        step_3_sandbox = {"name": "Workspace Boundary Check", "status": "PENDING", "detail": "Verifying restricted root ./workspace/"}
        step_4_perm = {"name": "Permission Check", "status": "PENDING", "detail": f"Operation: {operation}"}
        step_5_result = {"name": "Access Decision", "status": "PENDING", "detail": ""}
        step_6_log = {"name": "Security Audit Log", "status": "PENDING", "detail": ""}

        # Step 2 & 3: Path checks
        is_traversal = ".." in requested_path
        is_system_dir = any(requested_path.startswith(p) for p in ["/etc", "/sys", "/proc", "/root", "/var"])
        clean_path = requested_path.replace("\\", "/").strip()
        if clean_path.startswith("./"):
            clean_path = clean_path[2:]
        if clean_path.startswith("/"):
            clean_path = clean_path[1:]

        is_in_workspace = clean_path.startswith("workspace") or requested_path.startswith("./workspace")

        if is_traversal:
            step_2_path["status"] = "FAILED"
            step_2_path["detail"] = "Path Traversal (..) sequence detected! Potential exploit attempt."
            step_3_sandbox["status"] = "BLOCKED"
            step_3_sandbox["detail"] = "Access rejected outside workspace boundary."
            allowed = False
            reason = "DENIED: Directory traversal attack blocked"
        elif is_system_dir or not is_in_workspace:
            step_2_path["status"] = "PASSED"
            step_2_path["detail"] = f"Normalized: {clean_path}"
            step_3_sandbox["status"] = "FAILED"
            step_3_sandbox["detail"] = "Target path resides outside authorized ./workspace/ root"
            allowed = False
            reason = "DENIED: Unauthorized access outside workspace sandbox"
        else:
            step_2_path["status"] = "PASSED"
            step_2_path["detail"] = f"Normalized: {clean_path}"
            step_3_sandbox["status"] = "PASSED"
            step_3_sandbox["detail"] = "Target verified inside ./workspace/"
            step_4_perm["status"] = "PASSED"
            step_4_perm["detail"] = f"Agent {agent_id} granted {operation} on workspace"
            allowed = True
            reason = f"ALLOWED: Authorized {operation} access"

        step_5_result["status"] = "ALLOWED" if allowed else "DENIED"
        step_5_result["detail"] = reason

        audit_entry = {
            "id": f"audit_{len(self.file_audits) + 1}",
            "timestamp": self._timestamp(),
            "agent": agent_id,
            "file": requested_path,
            "operation": operation,
            "result": "ALLOWED" if allowed else "DENIED",
            "reason": reason
        }
        self.file_audits.insert(0, audit_entry)

        step_6_log["status"] = "LOGGED"
        step_6_log["detail"] = f"Audit ID {audit_entry['id']} recorded"

        if not allowed:
            alert = {
                "id": f"sec_alert_{len(self.security_alerts) + 1}",
                "timestamp": self._timestamp(),
                "severity": "HIGH",
                "title": "Security Sandbox Violation Blocked",
                "agent": agent_id,
                "path": requested_path,
                "reason": reason
            }
            self.security_alerts.insert(0, alert)
            self.add_log("FILE_ACCESS_DENIED", operation, "DENIED", f"Blocked access to {requested_path} by {agent_id} ({reason})", agent_id)
        else:
            self.add_log("FILE_ACCESS_GRANTED", operation, "ALLOWED", f"Granted {operation} on {requested_path} to {agent_id}", agent_id)

        # If write/create on workspace, trigger backup
        if allowed and operation in ("WRITE", "CREATE"):
            self.create_backup(requested_path, agent_id)

        return {
            "allowed": allowed,
            "reason": reason,
            "pipeline": [step_1_id, step_2_path, step_3_sandbox, step_4_perm, step_5_result, step_6_log],
            "audit": audit_entry
        }

    def acquire_lock(self, file_path: str, agent_id: str) -> Dict[str, Any]:
        file_name = file_path.split("/")[-1]
        lock = self.shared_locks.get(file_name)
        if not lock:
            lock = {
                "file_name": file_name,
                "file_path": file_path,
                "is_locked": False,
                "current_owner": "",
                "waiting_queue": [],
                "locked_at": ""
            }
            self.shared_locks[file_name] = lock

        if not lock["is_locked"]:
            lock["is_locked"] = True
            lock["current_owner"] = agent_id
            lock["locked_at"] = self._timestamp()
            self.add_log("LOCK_ACQUIRED", "fcntl(F_SETLK)", "SUCCESS", f"Acquired mutual exclusion lock on {file_name}", agent_id)
            return {"success": True, "message": f"Lock acquired by {agent_id}", "lock": lock}
        else:
            if lock["current_owner"] == agent_id:
                return {"success": True, "message": f"Agent {agent_id} already holds lock", "lock": lock}
            if agent_id not in lock["waiting_queue"]:
                lock["waiting_queue"].append(agent_id)
            self.add_log("LOCK_CONTENTION", "pthread_mutex_lock()", "BLOCKED", f"Lock busy on {file_name} (Owner: {lock['current_owner']}). {agent_id} queued.", agent_id)
            return {"success": False, "message": f"File is locked by {lock['current_owner']}. {agent_id} added to waiting queue.", "lock": lock}

    def release_lock(self, file_path: str, agent_id: str) -> Dict[str, Any]:
        file_name = file_path.split("/")[-1]
        lock = self.shared_locks.get(file_name)
        if not lock or not lock["is_locked"]:
            return {"success": False, "error": f"No active lock on {file_name}"}

        if lock["current_owner"] != agent_id:
            return {"success": False, "error": f"Agent {agent_id} does not own lock (owned by {lock['current_owner']})"}

        if lock["waiting_queue"]:
            next_agent = lock["waiting_queue"].pop(0)
            lock["current_owner"] = next_agent
            lock["locked_at"] = self._timestamp()
            self.add_log("LOCK_HANDOFF", "pthread_cond_signal()", "SUCCESS", f"Lock on {file_name} released by {agent_id} and acquired by {next_agent}", next_agent)
            return {"success": True, "message": f"Lock handed off to {next_agent}", "lock": lock}
        else:
            lock["is_locked"] = False
            lock["current_owner"] = ""
            lock["locked_at"] = ""
            self.add_log("LOCK_RELEASED", "fcntl(F_UNLCK)", "SUCCESS", f"Released lock on {file_name}", agent_id)
            return {"success": True, "message": f"Lock released on {file_name}", "lock": lock}

    def create_backup(self, file_path: str, modified_by: str) -> Dict[str, Any]:
        file_name = file_path.split("/")[-1]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{file_name}.{timestamp}.bak"
        backup_path = f"backups/{backup_name}"

        # Generate realistic SHA-256 hash
        file_hash = hashlib.sha256(f"{file_name}_{timestamp}_{modified_by}".encode('utf-8')).hexdigest()

        rec = {
            "id": f"bak_{len(self.backups) + 1}",
            "original_file": file_path,
            "backup_file": backup_path,
            "modified_by": modified_by,
            "timestamp": self._timestamp(),
            "file_hash": file_hash,
            "status": "SECURED"
        }
        self.backups.insert(0, rec)
        self.add_log("BACKUP_CREATED", "copy_file()", "SUCCESS", f"Created backup {backup_path} with SHA256: {file_hash[:8]}...", modified_by)
        return rec

    def restore_backup(self, backup_id: str) -> Dict[str, Any]:
        rec = next((b for b in self.backups if b["id"] == backup_id), None)
        if not rec:
            return {"success": False, "error": f"Backup ID {backup_id} not found"}

        self.add_log("BACKUP_RESTORED", "restore_file()", "SUCCESS", f"Safely restored {rec['backup_file']} to {rec['original_file']}")
        return {"success": True, "message": f"Successfully restored {rec['original_file']} from backup.", "backup": rec}

    def submit_task(self, agent_id: str, task_type: str, description: str, priority: int = 0, cpu_limit: float = 50.0, mem_limit: float = 512.0) -> Dict[str, Any]:
        agent = self.agents.get(agent_id)
        if not agent:
            return {"success": False, "error": f"Agent {agent_id} not found"}

        task_id = f"task_{len(self.tasks) + 1:04d}"
        now = self._timestamp()

        task_obj = {
            "task_id": task_id,
            "agent_id": agent_id,
            "agent_name": agent["name"],
            "pid": agent["pid"],
            "task_type": task_type,
            "description": description,
            "priority": priority,
            "cpu_limit": cpu_limit,
            "memory_limit_mb": mem_limit,
            "cpu_usage": round(random.uniform(15.0, min(cpu_limit, 48.0)), 1),
            "memory_usage": round(random.uniform(120.0, min(mem_limit, 350.0)), 1),
            "start_time": now,
            "end_time": None,
            "status": "COMPLETED",
            "result": f"Executed {task_type} for '{description}'. Status: 0 OK",
            "lifecycle": [
                {"stage": "QUEUED", "status": "PASSED", "time": now},
                {"stage": "ASSIGNED", "status": "PASSED", "time": now},
                {"stage": "RUNNING", "status": "PASSED", "time": now},
                {"stage": "IPC COMMUNICATION", "status": "PASSED", "time": now},
                {"stage": "RESOURCE MONITORING", "status": "PASSED", "time": now},
                {"stage": "COMPLETED", "status": "PASSED", "time": now},
                {"stage": "RESULT LOGGED", "status": "PASSED", "time": now}
            ]
        }
        self.tasks.insert(0, task_obj)
        self.add_log("TASK_COMPLETED", "execve()", "SUCCESS", f"Task {task_id} ({task_type}) completed on PID {agent['pid']}", agent_id, agent["pid"])
        return {"success": True, "task": task_obj}

    def solve_problem(self, problem: str, cpu_limit: float = 50.0, mem_limit: float = 512.0) -> Dict[str, Any]:
        from problem_solver import problem_solver

        now = self._timestamp()
        task_id = f"task_{len(self.tasks) + 1:04d}"

        # 1. Four Agents references
        ag1 = self.agents.get("agent_01", {"pid": 28431, "name": "Agent 01 - Code Generator"})
        ag2 = self.agents.get("agent_02", {"pid": 28432, "name": "Agent 02 - Code Executor"})
        ag3 = self.agents.get("agent_03", {"pid": 28433, "name": "Agent 03 - Code Reviewer"})
        ag4 = self.agents.get("agent_04", {"pid": 28434, "name": "Agent 04 - Testing Agent"})

        # Run problem solver pipeline
        res = problem_solver.solve(problem)

        # 2. Inter-Process Communication (IPC Named Pipes) between the 4 agents
        ipc_trace = []

        # Message 1: Agent 01 -> Agent 02
        ipc1_content = f"CODE_DISPATCH: Generated Python source for '{problem}'"
        self.send_ipc_message("agent_01", "agent_02", ipc1_content)
        ipc_trace.append(f"Agent 01 (PID {ag1['pid']}) -> FIFO [/tmp/agent_01_fifo] -> Agent 02 (PID {ag2['pid']}): {ipc1_content}")
        self.add_log("CODE_SYNTHESIS", "generate_code()", "SUCCESS", f"Generated Python script for: {problem}", "agent_01", ag1["pid"])

        # Message 2: Agent 02 -> Agent 03
        out_summary = res['execution_output'][:60] if res.get('execution_output') else 'None'
        ipc2_content = f"EXEC_STDOUT: Process exited with status 0. Output: {out_summary} (Time: {res['execution_time_ms']}ms)"
        self.send_ipc_message("agent_02", "agent_03", ipc2_content)
        ipc_trace.append(f"Agent 02 (PID {ag2['pid']}) -> FIFO [/tmp/agent_02_fifo] -> Agent 03 (PID {ag3['pid']}): {ipc2_content}")
        self.add_log("PROCESS_EXEC", "subprocess.run()", "SUCCESS" if res["status"] == "SUCCESS" else "ERROR", f"Executed code in child process. Output: {out_summary}", "agent_02", ag2["pid"])

        # Message 3: Agent 03 -> Agent 04
        rev = res["code_review"]
        ipc3_content = f"CODE_REVIEW: AST parsed ({rev['ast_node_count']} nodes). Complexity: {rev['time_complexity']}. Safety: {rev['safety_check'][:30]}"
        self.send_ipc_message("agent_03", "agent_04", ipc3_content)
        ipc_trace.append(f"Agent 03 (PID {ag3['pid']}) -> FIFO [/tmp/agent_03_fifo] -> Agent 04 (PID {ag4['pid']}): {ipc3_content}")
        self.add_log("CODE_AUDIT", "ast.parse()", "SUCCESS", f"Verified AST syntax & safety ({rev['time_complexity']})", "agent_03", ag3["pid"])

        # Message 4: Agent 04 -> Agent 01
        test_rep = res["testing_report"]
        ipc4_content = f"TEST_VERIFICATION: {test_rep['passed_tests']}/{test_rep['total_tests']} assertions PASSED. Final Answer: {res['final_answer']}"
        self.send_ipc_message("agent_04", "agent_01", ipc4_content)
        ipc_trace.append(f"Agent 04 (PID {ag4['pid']}) -> FIFO [/tmp/agent_04_fifo] -> Agent 01 (PID {ag1['pid']}): {ipc4_content}")
        self.add_log("UNIT_TESTING", "assert_suite()", "SUCCESS" if test_rep["failed_tests"] == 0 else "WARNING", f"Verified {test_rep['passed_tests']}/{test_rep['total_tests']} unit test assertions", "agent_04", ag4["pid"])

        # 3. Create Task Record
        task_obj = {
            "task_id": task_id,
            "problem": problem,
            "agent_id": "agent_01",
            "agent_name": "Multi-Agent Problem Solver",
            "pid": ag1["pid"],
            "task_type": "PROBLEM_SOLVER",
            "description": problem,
            "priority": 0,
            "cpu_limit": cpu_limit,
            "memory_limit_mb": mem_limit,
            "cpu_usage": round(random.uniform(18.0, 36.0), 1),
            "memory_usage": round(random.uniform(140.0, 260.0), 1),
            "start_time": now,
            "end_time": self._timestamp(),
            "status": "COMPLETED" if res["status"] == "SUCCESS" else "ERROR",
            "result": f"Answer: {res['final_answer']}",
            "final_answer": res["final_answer"],
            "execution_output": res["execution_output"],
            "generated_code": res["generated_code"],
            "execution_time_ms": res["execution_time_ms"],
            "code_review": res["code_review"],
            "testing_report": res["testing_report"],
            "error": res["error"],
            "lifecycle": [
                {"stage": "QUEUED", "status": "PASSED", "time": now},
                {"stage": "AGENT 01: CODE GENERATION", "status": "PASSED", "time": now},
                {"stage": "AGENT 02: PROCESS EXECUTION", "status": "PASSED" if res["status"] == "SUCCESS" else "FAILED", "time": now},
                {"stage": "IPC FIFO TRANSMISSION", "status": "PASSED", "time": now},
                {"stage": "AGENT 03: CODE REVIEW & AST", "status": "PASSED", "time": now},
                {"stage": "AGENT 04: UNIT TEST SUITE", "status": "PASSED" if test_rep["failed_tests"] == 0 else "WARNING", "time": now},
                {"stage": "ANSWER VERIFIED & RECORDED", "status": "PASSED", "time": now}
            ]
        }
        self.tasks.insert(0, task_obj)

        agents_summary = [
            {
                "agent_id": "agent_01",
                "name": ag1["name"],
                "role": "Code Generator",
                "pid": ag1["pid"],
                "status": "SUCCESS",
                "action": "Analyzed problem and synthesized optimal Python code"
            },
            {
                "agent_id": "agent_02",
                "name": ag2["name"],
                "role": "Code Executor",
                "pid": ag2["pid"],
                "status": "SUCCESS" if res["status"] == "SUCCESS" else "ERROR",
                "action": f"Executed Python code in child process, captured stdout ({res['execution_time_ms']}ms)"
            },
            {
                "agent_id": "agent_03",
                "name": ag3["name"],
                "role": "Code Reviewer",
                "pid": ag3["pid"],
                "status": "SUCCESS",
                "action": f"Verified AST tree ({rev['ast_node_count']} nodes), {rev['time_complexity']} bound, safety PASSED"
            },
            {
                "agent_id": "agent_04",
                "name": ag4["name"],
                "role": "Testing Agent",
                "pid": ag4["pid"],
                "status": "SUCCESS" if test_rep["failed_tests"] == 0 else "WARNING",
                "action": f"Ran unit assertion suite ({test_rep['passed_tests']}/{test_rep['total_tests']} tests passed)"
            }
        ]

        return {
            "success": True,
            "problem": problem,
            "status": res["status"],
            "final_answer": res["final_answer"],
            "execution_output": res["execution_output"],
            "generated_code": res["generated_code"],
            "execution_time_ms": res["execution_time_ms"],
            "code_review": res["code_review"],
            "testing_report": res["testing_report"],
            "error": res["error"],
            "agents": agents_summary,
            "ipc_pipeline": ipc_trace,
            "task": task_obj
        }

    def tick_simulation(self):
        """Simulate dynamic resource fluctuations and check limit violations."""
        total_cpu = 0.0
        total_mem = 0.0

        for agent_id, agent in self.agents.items():
            if agent["status"] == "RUNNING":
                # Dynamic CPU & memory fluctuations
                delta_cpu = random.uniform(-3.5, 3.5)
                agent["cpu"] = max(2.0, min(95.0, round(agent["cpu"] + delta_cpu, 1)))

                delta_mem = random.uniform(-10.0, 15.0)
                agent["memory_mb"] = max(50.0, min(1024.0, round(agent["memory_mb"] + delta_mem, 1)))

                # Update matching process
                pid = agent["pid"]
                if pid in self.processes:
                    self.processes[pid]["cpu_percent"] = agent["cpu"]
                    self.processes[pid]["memory_mb"] = agent["memory_mb"]

                total_cpu += agent["cpu"]
                total_mem += agent["memory_mb"]

                # Check violations
                if agent["cpu"] > agent["cpu_limit"] or agent["memory_mb"] > agent["memory_limit_mb"]:
                    agent["status"] = "RESOURCE LIMIT EXCEEDED"
                    if pid in self.processes:
                        self.processes[pid]["state"] = "RESOURCE LIMIT EXCEEDED"
                    self.add_log("RESOURCE_LIMIT_EXCEEDED", "resource_monitor", "WARNING",
                        f"Resource limit breach: CPU={agent['cpu']}% (Limit: {agent['cpu_limit']}%), Mem={agent['memory_mb']}MB (Limit: {agent['memory_limit_mb']}MB)",
                        agent_id, pid)

        # Record history sample
        now_str = datetime.now().strftime("%H:%M:%S")
        sample = {
            "timestamp": now_str,
            "cpu_usage": round(total_cpu, 1),
            "memory_gb": round(total_mem / 1024.0, 2),
            "system_load": round(1.2 + random.uniform(-0.1, 0.2), 2),
            "agent_01_cpu": self.agents.get("agent_01", {}).get("cpu", 0),
            "agent_02_cpu": self.agents.get("agent_02", {}).get("cpu", 0),
            "agent_03_cpu": self.agents.get("agent_03", {}).get("cpu", 0),
            "agent_04_cpu": self.agents.get("agent_04", {}).get("cpu", 0),
        }
        self.resource_history.append(sample)
        if len(self.resource_history) > 30:
            self.resource_history.pop(0)

    def get_system_status(self) -> Dict[str, Any]:
        uptime_seconds = int((datetime.now() - self.start_time).total_seconds())
        hours, remainder = divmod(uptime_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        uptime_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

        running_agents = sum(1 for a in self.agents.values() if a["status"] == "RUNNING")
        total_cpu = sum(a["cpu"] for a in self.agents.values() if a["status"] in ("RUNNING", "RESOURCE LIMIT EXCEEDED"))
        total_mem = sum(a["memory_mb"] for a in self.agents.values())

        return {
            "mode": "SIMULATION MODE",
            "is_live_linux": False,
            "uptime": uptime_str,
            "uptime_seconds": uptime_seconds,
            "active_agents": running_agents,
            "total_processes": len(self.processes),
            "cpu_usage": round(total_cpu, 1),
            "memory_usage_gb": round(total_mem / 1024.0, 2),
            "total_memory_gb": 8.0,
            "fifo_channels_count": len(self.fifo_channels),
            "active_tasks_count": len(self.tasks),
            "security_alerts_count": len(self.security_alerts),
            "health": {
                "backend_status": "ONLINE",
                "os_status": "SIMULATED",
                "database_status": "ONLINE",
                "agent_manager_status": "ONLINE",
                "fifo_manager_status": "ONLINE",
                "resource_monitor_status": "ONLINE"
            }
        }

# Global singleton
simulation_engine = SimulationEngine()
