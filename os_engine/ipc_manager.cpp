#include "ipc_manager.h"
#include "logger.h"

namespace os_engine {

IpcManager& IpcManager::getInstance() {
    static IpcManager instance;
    return instance;
}

bool IpcManager::createFifoChannel(const std::string& fifoPath, const std::string& ownerAgent) {
    std::lock_guard<std::mutex> lock(ipcMutex_);

#ifdef __linux__
    // Unlink if already exists
    unlink(fifoPath.c_str());
    if (mkfifo(fifoPath.c_str(), 0666) == -1) {
        Logger::getInstance().log("ERROR", "FIFO_CREATION_FAILED", "mkfifo() failed for " + fifoPath, -1, ownerAgent);
        return false;
    }
    Logger::getInstance().log("INFO", "FIFO_CREATED", "mkfifo() created named pipe at " + fifoPath, -1, ownerAgent);
#else
    Logger::getInstance().log("INFO", "FIFO_CREATED", "Simulated named pipe created at " + fifoPath, -1, ownerAgent);
#endif

    FifoChannelInfo info;
    info.fifoName = fifoPath;
    info.sourceAgent = ownerAgent;
    info.destinationAgent = "BROADCAST / PIPELINE";
    info.status = "ACTIVE";
    info.messagesSent = 0;
    info.messagesReceived = 0;
    info.lastMessage = "Channel initialized";
    info.createdTime = getCurrentTimestamp();

    channels_[fifoPath] = info;
    return true;
}

bool IpcManager::sendMessage(const std::string& fromAgent, const std::string& toAgent, const std::string& content) {
    std::lock_guard<std::mutex> lock(ipcMutex_);
    std::string fifoPath = "/tmp/" + fromAgent + "_fifo";

    std::stringstream ssMsg;
    ssMsg << "msg_" << (++messageCounter_);
    std::string msgId = ssMsg.str();

    IpcMessage msg;
    msg.messageId = msgId;
    msg.fromAgent = fromAgent;
    msg.toAgent = toAgent;
    msg.fifoPath = fifoPath;
    msg.content = content;
    msg.timestamp = getCurrentTimestamp();
    msg.delivered = true;

    messages_.push_back(msg);

    // Update channel stats
    auto it = channels_.find(fifoPath);
    if (it != channels_.end()) {
        it->second.messagesSent++;
        it->second.lastMessage = content;
        it->second.destinationAgent = toAgent;
    }

    std::string toFifo = "/tmp/" + toAgent + "_fifo";
    auto itTo = channels_.find(toFifo);
    if (itTo != channels_.end()) {
        itTo->second.messagesReceived++;
    }

#ifdef __linux__
    // Non-blocking write to FIFO if active
    int fd = open(fifoPath.c_str(), O_WRONLY | O_NONBLOCK);
    if (fd != -1) {
        write(fd, content.c_str(), content.length());
        close(fd);
    }
#endif

    Logger::getInstance().log("INFO", "MESSAGE_SENT", "IPC FIFO transfer: [" + fromAgent + " -> " + toAgent + "]: " + content, -1, fromAgent);
    return true;
}

std::vector<IpcMessage> IpcManager::getMessagesForAgent(const std::string& agentId) {
    std::lock_guard<std::mutex> lock(ipcMutex_);
    std::vector<IpcMessage> filtered;
    for (const auto& msg : messages_) {
        if (msg.toAgent == agentId || msg.fromAgent == agentId) {
            filtered.push_back(msg);
        }
    }
    return filtered;
}

std::vector<FifoChannelInfo> IpcManager::getAllChannels() {
    std::lock_guard<std::mutex> lock(ipcMutex_);
    std::vector<FifoChannelInfo> list;
    for (const auto& kv : channels_) {
        list.push_back(kv.second);
    }
    return list;
}

std::vector<IpcMessage> IpcManager::getAllMessages() {
    std::lock_guard<std::mutex> lock(ipcMutex_);
    return messages_;
}

} // namespace os_engine
