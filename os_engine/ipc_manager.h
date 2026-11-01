#ifndef IPC_MANAGER_H
#define IPC_MANAGER_H

#include "common.h"
#include <map>
#include <vector>
#include <mutex>

namespace os_engine {

struct FifoChannelInfo {
    std::string fifoName;
    std::string sourceAgent;
    std::string destinationAgent;
    std::string status;
    int messagesSent;
    int messagesReceived;
    std::string lastMessage;
    std::string createdTime;
};

class IpcManager {
public:
    static IpcManager& getInstance();

    bool createFifoChannel(const std::string& fifoPath, const std::string& ownerAgent);
    bool sendMessage(const std::string& fromAgent, const std::string& toAgent, const std::string& content);
    std::vector<IpcMessage> getMessagesForAgent(const std::string& agentId);
    std::vector<FifoChannelInfo> getAllChannels();
    std::vector<IpcMessage> getAllMessages();

private:
    IpcManager() = default;
    ~IpcManager() = default;
    IpcManager(const IpcManager&) = delete;
    IpcManager& operator=(const IpcManager&) = delete;

    std::map<std::string, FifoChannelInfo> channels_;
    std::vector<IpcMessage> messages_;
    std::mutex ipcMutex_;
    int messageCounter_ = 0;
};

} // namespace os_engine

#endif // IPC_MANAGER_H
