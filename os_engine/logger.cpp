#include "logger.h"

namespace os_engine {

Logger& Logger::getInstance() {
    static Logger instance;
    return instance;
}

Logger::~Logger() {
    if (logFile_.is_open()) {
        logFile_.close();
    }
}

void Logger::init(const std::string& logFilePath) {
    std::lock_guard<std::mutex> lock(logMutex_);
    logFile_.open(logFilePath, std::ios::out | std::ios::app);
    if (!logFile_.is_open()) {
        std::cerr << "[Logger] Failed to open log file: " << logFilePath << std::endl;
    }
}

void Logger::log(const std::string& level, const std::string& event, const std::string& details, int pid, const std::string& agentId) {
    std::lock_guard<std::mutex> lock(logMutex_);
    std::string timestamp = getCurrentTimestamp();

    std::stringstream ss;
    ss << "[" << timestamp << "] [" << level << "] [" << event << "]";
    if (pid != -1) {
        ss << " [PID: " << pid << "]";
    }
    if (!agentId.empty()) {
        ss << " [Agent: " << agentId << "]";
    }
    ss << " - " << details;

    std::string line = ss.str();
    std::cout << line << std::endl;

    if (logFile_.is_open()) {
        logFile_ << line << std::endl;
        logFile_.flush();
    }
}

} // namespace os_engine
