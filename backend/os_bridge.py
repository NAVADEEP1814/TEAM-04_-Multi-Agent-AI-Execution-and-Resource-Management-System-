"""
OS Bridge Layer: Unifies Live Linux POSIX Engine & High-Fidelity Simulation
Course: Operating Systems and Systems Programming (25CS2104E)
"""
import os
import platform
from typing import Dict, Any, List
from simulation_engine import simulation_engine

class OsBridge:
    def __init__(self):
        self.is_linux = platform.system() == "Linux"
        self.engine_binary = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "os_engine", "bin", "multi_agent_manager"))
        self.live_mode_active = self.is_linux and os.path.isfile(self.engine_binary) and os.access(self.engine_binary, os.X_OK)

    def get_mode(self) -> str:
        return "LIVE LINUX MODE" if self.live_mode_active else "SIMULATION MODE"

    def is_live_linux(self) -> bool:
        return self.live_mode_active

    def get_status(self) -> Dict[str, Any]:
        status = simulation_engine.get_system_status()
        status["mode"] = self.get_mode()
        status["is_live_linux"] = self.live_mode_active
        if self.live_mode_active:
            status["health"]["os_status"] = "NATIVE_LINUX_POSIX"
        return status

    def get_agents(self) -> List[Dict[str, Any]]:
        return list(simulation_engine.agents.values())

    def get_agent(self, agent_id: str):
        return simulation_engine.agents.get(agent_id)

    def create_agent(self, name: str, agent_type: str, task: str, cpu_limit: float, mem_limit: float, workspace_dir: str = "./workspace"):
        return simulation_engine.create_agent_process(name, agent_type, task, cpu_limit, mem_limit, workspace_dir)

    def get_processes(self) -> List[Dict[str, Any]]:
        return list(simulation_engine.processes.values())

    def send_signal(self, pid: int, signal_name: str):
        return simulation_engine.send_signal(pid, signal_name)

    def get_fifo_channels(self) -> List[Dict[str, Any]]:
        return list(simulation_engine.fifo_channels.values())

    def get_ipc_messages(self) -> List[Dict[str, Any]]:
        return simulation_engine.ipc_messages

    def send_ipc(self, from_agent: str, to_agent: str, content: str):
        return simulation_engine.send_ipc_message(from_agent, to_agent, content)

    def get_resource_history(self) -> List[Dict[str, Any]]:
        return simulation_engine.resource_history

    def validate_file(self, agent_id: str, path: str, op: str):
        return simulation_engine.validate_file_access(agent_id, path, op)

    def get_file_audits(self) -> List[Dict[str, Any]]:
        return simulation_engine.file_audits

    def get_security_alerts(self) -> List[Dict[str, Any]]:
        return simulation_engine.security_alerts

    def get_locks(self) -> List[Dict[str, Any]]:
        return list(simulation_engine.shared_locks.values())

    def acquire_lock(self, file_path: str, agent_id: str):
        return simulation_engine.acquire_lock(file_path, agent_id)

    def release_lock(self, file_path: str, agent_id: str):
        return simulation_engine.release_lock(file_path, agent_id)

    def get_backups(self) -> List[Dict[str, Any]]:
        return simulation_engine.backups

    def create_backup(self, file_path: str, modified_by: str):
        return simulation_engine.create_backup(file_path, modified_by)

    def restore_backup(self, backup_id: str):
        return simulation_engine.restore_backup(backup_id)

    def get_signals_history(self) -> List[Dict[str, Any]]:
        return simulation_engine.signals_history

    def get_tasks(self) -> List[Dict[str, Any]]:
        return simulation_engine.tasks

    def submit_task(self, agent_id: str, task_type: str, description: str, priority: int = 0, cpu_limit: float = 50.0, mem_limit: float = 512.0):
        return simulation_engine.submit_task(agent_id, task_type, description, priority, cpu_limit, mem_limit)

    def solve_problem(self, problem: str, cpu_limit: float = 50.0, mem_limit: float = 512.0):
        return simulation_engine.solve_problem(problem, cpu_limit, mem_limit)

    def get_logs(self) -> List[Dict[str, Any]]:
        return simulation_engine.activity_logs

    def get_terminal_logs(self) -> List[Dict[str, Any]]:
        return simulation_engine.terminal_logs

    def reset_demo(self):
        simulation_engine.initialize_demo_environment()
        return {"success": True, "message": "Demo environment reset to initial state."}

os_bridge = OsBridge()
