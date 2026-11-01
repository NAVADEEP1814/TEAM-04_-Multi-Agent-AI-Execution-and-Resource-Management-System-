#include "process_manager.h"
#include "logger.h"
#include "ipc_manager.h"

namespace os_engine {

ProcessManager& ProcessManager::getInstance() {
    static ProcessManager instance;
    return instance;
}

int ProcessManager::createAgentProcess(const std::string& agentName,
                                       const std::string& agentType,
                                       const std::string& task,
                                       double cpuLimit,
                                       double memoryLimitMb) {
    std::lock_guard<std::mutex> lock(procMutex_);

    int agentIndex = static_cast<int>(processes_.size()) + 1;
    std::stringstream ssId;
    ssId << "agent_" << std::setw(2) << std::setfill('0') << agentIndex;
    std::string agentId = ssId.str();

    int pid = -1;

#ifdef __linux__
    pid_t forkPid = fork();
    if (forkPid < 0) {
        Logger::getInstance().log("ERROR", "PROCESS_CREATION_FAILED", "fork() system call failed", -1, agentId);
        return -1;
    } else if (forkPid == 0) {
        // Child process execution
        pid_t childPid = getpid();
        std::cout << "[Child Process " << childPid << "] Initialized for " << agentName << std::endl;
        
        // Setup child process loop
        while (true) {
            pause(); // Wait for signals or tasks
        }
        _exit(0);
    } else {
        // Parent process
        pid = forkPid;
        Logger::getInstance().log("INFO", "PROCESS_CREATED", "fork() executed successfully. Child PID assigned", pid, agentId);
    }
#else
    // Simulated PID generation on non-Linux platforms
    pid = ++nextSimulatedPid_;
    Logger::getInstance().log("INFO", "PROCESS_CREATED", "Process creation simulated. Assigned PID", pid, agentId);
#endif

    std::string fifoPath = "/tmp/" + agentId + "_fifo";
    IpcManager::getInstance().createFifoChannel(fifoPath, agentId);

    AgentProcess proc;
    proc.agentId = agentId;
    proc.agentName = agentName;
    proc.agentType = agentType;
    proc.pid = pid;
    proc.ppid = 1000; // Simulated/Parent PID
    proc.state = ProcessState::RUNNING;
    proc.cpuUsage = 12.5;
    proc.memoryUsageMb = 145.0;
    proc.cpuLimit = cpuLimit;
    proc.memoryLimitMb = memoryLimitMb;
    proc.currentTask = task.empty() ? "Idle / Standby" : task;
    proc.fifoChannel = fifoPath;
    proc.startTime = getCurrentTimestamp();
    proc.lastActivity = getCurrentTimestamp();

    processes_[pid] = proc;
    agentToPid_[agentId] = pid;

    Logger::getInstance().log("INFO", "AGENT_REGISTERED", "Agent registered in Process Table with FIFO " + fifoPath, pid, agentId);
    return pid;
}

bool ProcessManager::stopProcess(int pid) {
    std::lock_guard<std::mutex> lock(procMutex_);
    auto it = processes_.find(pid);
    if (it == processes_.end()) return false;

#ifdef __linux__
    if (kill(pid, SIGSTOP) == 0) {
        it->second.state = ProcessState::STOPPED;
        Logger::getInstance().log("INFO", "PROCESS_STOPPED", "kill(pid, SIGSTOP) delivered", pid, it->second.agentId);
        return true;
    }
    return false;
#else
    it->second.state = ProcessState::STOPPED;
    Logger::getInstance().log("INFO", "PROCESS_STOPPED", "Simulated SIGSTOP signal delivered", pid, it->second.agentId);
    return true;
#endif
}

bool ProcessManager::resumeProcess(int pid) {
    std::lock_guard<std::mutex> lock(procMutex_);
    auto it = processes_.find(pid);
    if (it == processes_.end()) return false;

#ifdef __linux__
    if (kill(pid, SIGCONT) == 0) {
        it->second.state = ProcessState::RUNNING;
        Logger::getInstance().log("INFO", "PROCESS_RESUMED", "kill(pid, SIGCONT) delivered", pid, it->second.agentId);
        return true;
    }
    return false;
#else
    it->second.state = ProcessState::RUNNING;
    Logger::getInstance().log("INFO", "PROCESS_RESUMED", "Simulated SIGCONT signal delivered", pid, it->second.agentId);
    return true;
#endif
}

bool ProcessManager::terminateProcess(int pid, bool force) {
    std::lock_guard<std::mutex> lock(procMutex_);
    auto it = processes_.find(pid);
    if (it == processes_.end()) return false;

#ifdef __linux__
    int sig = force ? SIGKILL : SIGTERM;
    std::string sigName = force ? "SIGKILL" : "SIGTERM";
    if (kill(pid, sig) == 0) {
        it->second.state = ProcessState::TERMINATED;
        Logger::getInstance().log("WARN", "PROCESS_TERMINATED", "kill(pid, " + sigName + ") delivered", pid, it->second.agentId);
        return true;
    }
    return false;
#else
    it->second.state = ProcessState::TERMINATED;
    std::string sigName = force ? "SIGKILL" : "SIGTERM";
    Logger::getInstance().log("WARN", "PROCESS_TERMINATED", "Simulated " + sigName + " delivered", pid, it->second.agentId);
    return true;
#endif
}

AgentProcess* ProcessManager::getProcessByPid(int pid) {
    std::lock_guard<std::mutex> lock(procMutex_);
    auto it = processes_.find(pid);
    if (it != processes_.end()) {
        return &(it->second);
    }
    return nullptr;
}

AgentProcess* ProcessManager::getProcessByAgentId(const std::string& agentId) {
    std::lock_guard<std::mutex> lock(procMutex_);
    auto it = agentToPid_.find(agentId);
    if (it != agentToPid_.end()) {
        return &(processes_[it->second]);
    }
    return nullptr;
}

std::vector<AgentProcess> ProcessManager::getAllProcesses() {
    std::lock_guard<std::mutex> lock(procMutex_);
    std::vector<AgentProcess> list;
    for (const auto& kv : processes_) {
        list.push_back(kv.second);
    }
    return list;
}

void ProcessManager::reapZombies() {
#ifdef __linux__
    int status;
    pid_t pid;
    while ((pid = waitpid(-1, &status, WNOHANG)) > 0) {
        std::lock_guard<std::mutex> lock(procMutex_);
        auto it = processes_.find(pid);
        if (it != processes_.end()) {
            it->second.state = ProcessState::TERMINATED;
            Logger::getInstance().log("INFO", "PROCESS_REAPED", "waitpid() collected terminated child process", pid, it->second.agentId);
        }
    }
#endif
}

} // namespace os_engine
