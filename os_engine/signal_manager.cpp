#include "signal_manager.h"
#include "process_manager.h"
#include "logger.h"

namespace os_engine {

SignalManager& SignalManager::getInstance() {
    static SignalManager instance;
    return instance;
}

bool SignalManager::sendSignal(int pid, const std::string& signalName) {
    std::lock_guard<std::mutex> lock(sigMutex_);
    auto proc = ProcessManager::getInstance().getProcessByPid(pid);
    std::string agentId = proc ? proc->agentId : "unknown";

    int sigNum = 0;
    bool success = false;

#ifdef __linux__
    if (signalName == "SIGSTOP") sigNum = SIGSTOP;
    else if (signalName == "SIGCONT") sigNum = SIGCONT;
    else if (signalName == "SIGTERM") sigNum = SIGTERM;
    else if (signalName == "SIGKILL") sigNum = SIGKILL;
    else sigNum = SIGTERM;

    if (kill(pid, sigNum) == 0) {
        success = true;
    }
#else
    if (signalName == "SIGSTOP") sigNum = 19;
    else if (signalName == "SIGCONT") sigNum = 18;
    else if (signalName == "SIGTERM") sigNum = 15;
    else if (signalName == "SIGKILL") sigNum = 9;
    else sigNum = 15;
    success = true;
#endif

    if (signalName == "SIGSTOP") {
        ProcessManager::getInstance().stopProcess(pid);
    } else if (signalName == "SIGCONT") {
        ProcessManager::getInstance().resumeProcess(pid);
    } else if (signalName == "SIGTERM") {
        ProcessManager::getInstance().terminateProcess(pid, false);
    } else if (signalName == "SIGKILL") {
        ProcessManager::getInstance().terminateProcess(pid, true);
    }

    SignalLog entry;
    entry.pid = pid;
    entry.agentId = agentId;
    entry.signalName = signalName;
    entry.signalNumber = sigNum;
    entry.timestamp = getCurrentTimestamp();
    entry.success = success;
    entry.notes = "Signal " + signalName + " dispatched to PID " + std::to_string(pid);

    history_.push_back(entry);
    Logger::getInstance().log("INFO", "SIGNAL_SENT", entry.notes, pid, agentId);
    return success;
}

std::vector<SignalLog> SignalManager::getSignalHistory() {
    std::lock_guard<std::mutex> lock(sigMutex_);
    return history_;
}

} // namespace os_engine
