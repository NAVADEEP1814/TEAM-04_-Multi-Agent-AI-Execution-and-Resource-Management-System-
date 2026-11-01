#ifndef PROCESS_MANAGER_H
#define PROCESS_MANAGER_H

#include "common.h"
#include <map>
#include <vector>
#include <mutex>

namespace os_engine {

class ProcessManager {
public:
    static ProcessManager& getInstance();

    int createAgentProcess(const std::string& agentName,
                           const std::string& agentType,
                           const std::string& task,
                           double cpuLimit,
                           double memoryLimitMb);

    bool stopProcess(int pid);
    bool resumeProcess(int pid);
    bool terminateProcess(int pid, bool force = false);

    AgentProcess* getProcessByPid(int pid);
    AgentProcess* getProcessByAgentId(const std::string& agentId);
    std::vector<AgentProcess> getAllProcesses();

    void reapZombies();

private:
    ProcessManager() = default;
    ~ProcessManager() = default;
    ProcessManager(const ProcessManager&) = delete;
    ProcessManager& operator=(const ProcessManager&) = delete;

    std::map<int, AgentProcess> processes_;
    std::map<std::string, int> agentToPid_;
    std::mutex procMutex_;
    int nextSimulatedPid_ = 28400;
};

} // namespace os_engine

#endif // PROCESS_MANAGER_H
