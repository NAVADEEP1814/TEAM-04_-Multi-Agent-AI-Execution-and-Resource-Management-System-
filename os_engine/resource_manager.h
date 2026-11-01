#ifndef RESOURCE_MANAGER_H
#define RESOURCE_MANAGER_H

#include "common.h"
#include <map>
#include <vector>
#include <mutex>

namespace os_engine {

struct ResourceSample {
    std::string timestamp;
    double totalCpuPercent;
    double totalMemoryMb;
    double systemLoad;
    std::map<std::string, double> agentCpuUsage;
    std::map<std::string, double> agentMemoryUsage;
};

struct ResourceViolation {
    int pid;
    std::string agentId;
    std::string resourceType; // "CPU" or "MEMORY"
    double currentValue;
    double limitValue;
    std::string timestamp;
};

class ResourceManager {
public:
    static ResourceManager& getInstance();

    void recordSample();
    std::vector<ResourceSample> getHistory(int count = 20);
    std::vector<ResourceViolation> checkViolations();
    bool enforceLimits(int pid);

private:
    ResourceManager() = default;
    ~ResourceManager() = default;
    ResourceManager(const ResourceManager&) = delete;
    ResourceManager& operator=(const ResourceManager&) = delete;

    std::vector<ResourceSample> history_;
    std::vector<ResourceViolation> violations_;
    std::mutex resMutex_;
};

} // namespace os_engine

#endif // RESOURCE_MANAGER_H
