#ifndef COMMON_H
#define COMMON_H

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <fstream>
#include <mutex>
#include <algorithm>

// POSIX headers for Linux/Ubuntu environment
#ifdef __linux__
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <signal.h>
#endif

namespace os_engine {

enum class ProcessState {
    RUNNING,
    WAITING,
    BLOCKED,
    STOPPED,
    TERMINATED,
    ERROR
};

inline std::string stateToString(ProcessState state) {
    switch (state) {
        case ProcessState::RUNNING: return "RUNNING";
        case ProcessState::WAITING: return "WAITING";
        case ProcessState::BLOCKED: return "BLOCKED";
        case ProcessState::STOPPED: return "STOPPED";
        case ProcessState::TERMINATED: return "TERMINATED";
        case ProcessState::ERROR: return "ERROR";
        default: return "UNKNOWN";
    }
}

enum class FileOp {
    READ,
    WRITE,
    CREATE,
    DELETE
};

inline std::string opToString(FileOp op) {
    switch (op) {
        case FileOp::READ: return "READ";
        case FileOp::WRITE: return "WRITE";
        case FileOp::CREATE: return "CREATE";
        case FileOp::DELETE: return "DELETE";
        default: return "UNKNOWN";
    }
}

struct AgentProcess {
    std::string agentId;
    std::string agentName;
    std::string agentType;
    int pid;
    int ppid;
    ProcessState state;
    double cpuUsage;
    double memoryUsageMb;
    double cpuLimit;
    double memoryLimitMb;
    std::string currentTask;
    std::string fifoChannel;
    std::string startTime;
    std::string lastActivity;
};

struct IpcMessage {
    std::string messageId;
    std::string fromAgent;
    std::string toAgent;
    std::string fifoPath;
    std::string content;
    std::string timestamp;
    bool delivered;
};

struct FileAuditRecord {
    std::string timestamp;
    std::string agentId;
    std::string filePath;
    FileOp operation;
    bool allowed;
    std::string reason;
};

struct SharedFileLock {
    std::string filePath;
    bool isLocked;
    std::string currentOwner;
    std::vector<std::string> waitingQueue;
    std::string lockedAt;
};

inline std::string getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %H:%M:%S");
    return ss.str();
}

} // namespace os_engine

#endif // COMMON_H
