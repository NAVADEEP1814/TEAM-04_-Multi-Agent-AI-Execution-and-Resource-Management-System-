#ifndef SIGNAL_MANAGER_H
#define SIGNAL_MANAGER_H

#include "common.h"
#include <map>
#include <vector>
#include <mutex>

namespace os_engine {

struct SignalLog {
    int pid;
    std::string agentId;
    std::string signalName;
    int signalNumber;
    std::string timestamp;
    bool success;
    std::string notes;
};

class SignalManager {
public:
    static SignalManager& getInstance();

    bool sendSignal(int pid, const std::string& signalName);
    std::vector<SignalLog> getSignalHistory();

private:
    SignalManager() = default;
    ~SignalManager() = default;
    SignalManager(const SignalManager&) = delete;
    SignalManager& operator=(const SignalManager&) = delete;

    std::vector<SignalLog> history_;
    std::mutex sigMutex_;
};

} // namespace os_engine

#endif // SIGNAL_MANAGER_H
