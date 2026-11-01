#include "resource_manager.h"
#include "process_manager.h"
#include "logger.h"

namespace os_engine {

ResourceManager& ResourceManager::getInstance() {
    static ResourceManager instance;
    return instance;
}

void ResourceManager::recordSample() {
    std::lock_guard<std::mutex> lock(resMutex_);
    auto processes = ProcessManager::getInstance().getAllProcesses();

    ResourceSample sample;
    sample.timestamp = getCurrentTimestamp();
    sample.totalCpuPercent = 0.0;
    sample.totalMemoryMb = 0.0;
    sample.systemLoad = 1.45;

    for (const auto& proc : processes) {
        if (proc.state == ProcessState::RUNNING) {
            double cpu = proc.cpuUsage;
            double mem = proc.memoryUsageMb;

#ifdef __linux__
            // Read from /proc/[pid]/status
            std::stringstream ssPath;
            ssPath << "/proc/" << proc.pid << "/status";
            std::ifstream statusFile(ssPath.str());
            if (statusFile.is_open()) {
                std::string line;
                while (std::getline(statusFile, line)) {
                    if (line.rfind("VmRSS:", 0) == 0) {
                        std::istringstream iss(line);
                        std::string key, unit;
                        long kb = 0;
                        iss >> key >> kb >> unit;
                        mem = static_cast<double>(kb) / 1024.0;
                        break;
                    }
                }
            }
#endif

            sample.totalCpuPercent += cpu;
            sample.totalMemoryMb += mem;
            sample.agentCpuUsage[proc.agentId] = cpu;
            sample.agentMemoryUsage[proc.agentId] = mem;
        }
    }

    history_.push_back(sample);
    if (history_.size() > 50) {
        history_.erase(history_.begin());
    }
}

std::vector<ResourceSample> ResourceManager::getHistory(int count) {
    std::lock_guard<std::mutex> lock(resMutex_);
    if (history_.size() <= static_cast<size_t>(count)) {
        return history_;
    }
    return std::vector<ResourceSample>(history_.end() - count, history_.end());
}

std::vector<ResourceViolation> ResourceManager::checkViolations() {
    std::lock_guard<std::mutex> lock(resMutex_);
    violations_.clear();

    auto processes = ProcessManager::getInstance().getAllProcesses();
    for (const auto& proc : processes) {
        if (proc.state == ProcessState::RUNNING) {
            if (proc.cpuUsage > proc.cpuLimit) {
                ResourceViolation v;
                v.pid = proc.pid;
                v.agentId = proc.agentId;
                v.resourceType = "CPU";
                v.currentValue = proc.cpuUsage;
                v.limitValue = proc.cpuLimit;
                v.timestamp = getCurrentTimestamp();
                violations_.push_back(v);

                Logger::getInstance().log("WARN", "RESOURCE_LIMIT_EXCEEDED",
                    "CPU limit exceeded: " + std::to_string(proc.cpuUsage) + "% > " + std::to_string(proc.cpuLimit) + "%",
                    proc.pid, proc.agentId);
            }
            if (proc.memoryUsageMb > proc.memoryLimitMb) {
                ResourceViolation v;
                v.pid = proc.pid;
                v.agentId = proc.agentId;
                v.resourceType = "MEMORY";
                v.currentValue = proc.memoryUsageMb;
                v.limitValue = proc.memoryLimitMb;
                v.timestamp = getCurrentTimestamp();
                violations_.push_back(v);

                Logger::getInstance().log("WARN", "RESOURCE_LIMIT_EXCEEDED",
                    "Memory limit exceeded: " + std::to_string(proc.memoryUsageMb) + "MB > " + std::to_string(proc.memoryLimitMb) + "MB",
                    proc.pid, proc.agentId);
            }
        }
    }
    return violations_;
}

bool ResourceManager::enforceLimits(int pid) {
    // When limit is exceeded, pause or throttle the process via SIGSTOP
    return ProcessManager::getInstance().stopProcess(pid);
}

} // namespace os_engine
