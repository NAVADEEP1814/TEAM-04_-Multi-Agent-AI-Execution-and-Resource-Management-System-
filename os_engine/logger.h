#ifndef LOGGER_H
#define LOGGER_H

#include "common.h"

namespace os_engine {

class Logger {
public:
    static Logger& getInstance();

    void init(const std::string& logFilePath);
    void log(const std::string& level, const std::string& event, const std::string& details, int pid = -1, const std::string& agentId = "");

private:
    Logger() = default;
    ~Logger();
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

    std::ofstream logFile_;
    std::mutex logMutex_;
};

} // namespace os_engine

#endif // LOGGER_H
