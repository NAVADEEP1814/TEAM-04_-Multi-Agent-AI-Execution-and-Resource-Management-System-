#include "file_manager.h"
#include "logger.h"

namespace os_engine {

FileManager& FileManager::getInstance() {
    static FileManager instance;
    return instance;
}

void FileManager::init(const std::string& workspaceRoot, const std::string& backupRoot) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    workspaceRoot_ = workspaceRoot;
    backupRoot_ = backupRoot;
}

bool FileManager::validatePath(const std::string& requestedPath, std::string& normalizedPath, std::string& errorMessage) {
    // Check for directory traversal patterns
    if (requestedPath.find("..") != std::string::npos) {
        errorMessage = "Directory traversal detected (..)";
        return false;
    }

    if (requestedPath.find("/etc") != std::string::npos ||
        requestedPath.find("/root") != std::string::npos ||
        requestedPath.find("/sys") != std::string::npos ||
        requestedPath.find("/proc") != std::string::npos) {
        errorMessage = "Attempted access to restricted OS system directory";
        return false;
    }

    std::string path = requestedPath;
    if (path.rfind("./", 0) == 0) {
        path = path.substr(2);
    }
    if (path.rfind("/", 0) == 0) {
        path = path.substr(1);
    }

    // Must reside inside workspace
    if (path.rfind("workspace", 0) != 0 && path.rfind(workspaceRoot_, 0) != 0) {
        errorMessage = "Path outside authorized workspace boundary (" + workspaceRoot_ + ")";
        return false;
    }

    normalizedPath = path;
    return true;
}

bool FileManager::checkAccess(const std::string& agentId, const std::string& requestedPath, FileOp op, std::string& resultMessage) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::string normalized;
    std::string err;

    bool allowed = validatePath(requestedPath, normalized, err);
    if (!allowed) {
        resultMessage = "DENIED: " + err;
    } else {
        resultMessage = "ALLOWED: Authorized " + opToString(op) + " on " + normalized;
    }

    FileAuditRecord audit;
    audit.timestamp = getCurrentTimestamp();
    audit.agentId = agentId;
    audit.filePath = requestedPath;
    audit.operation = op;
    audit.allowed = allowed;
    audit.reason = resultMessage;

    auditLogs_.push_back(audit);

    std::string eventType = allowed ? "FILE_ACCESS_GRANTED" : "FILE_ACCESS_DENIED";
    std::string level = allowed ? "INFO" : "WARN";
    Logger::getInstance().log(level, eventType, "[" + agentId + "] " + opToString(op) + " " + requestedPath + " -> " + (allowed ? "ALLOWED" : "DENIED"), -1, agentId);

    return allowed;
}

bool FileManager::acquireFileLock(const std::string& filePath, const std::string& agentId) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    auto it = locks_.find(filePath);
    if (it == locks_.end()) {
        SharedFileLock newLock;
        newLock.filePath = filePath;
        newLock.isLocked = true;
        newLock.currentOwner = agentId;
        newLock.lockedAt = getCurrentTimestamp();
        locks_[filePath] = newLock;

        Logger::getInstance().log("INFO", "LOCK_ACQUIRED", "File lock granted on " + filePath + " to " + agentId, -1, agentId);
        return true;
    }

    if (!it->second.isLocked) {
        it->second.isLocked = true;
        it->second.currentOwner = agentId;
        it->second.lockedAt = getCurrentTimestamp();
        Logger::getInstance().log("INFO", "LOCK_ACQUIRED", "File lock granted on " + filePath + " to " + agentId, -1, agentId);
        return true;
    }

    // Already locked, add to wait queue
    if (it->second.currentOwner != agentId) {
        auto& queue = it->second.waitingQueue;
        if (std::find(queue.begin(), queue.end(), agentId) == queue.end()) {
            queue.push_back(agentId);
        }
        Logger::getInstance().log("INFO", "LOCK_CONTENTION", "Lock busy on " + filePath + " (Owner: " + it->second.currentOwner + "). " + agentId + " queued.", -1, agentId);
    }
    return false;
}

bool FileManager::releaseFileLock(const std::string& filePath, const std::string& agentId) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    auto it = locks_.find(filePath);
    if (it == locks_.end() || !it->second.isLocked) {
        return false;
    }

    if (it->second.currentOwner != agentId) {
        Logger::getInstance().log("WARN", "LOCK_RELEASE_ERROR", "Agent " + agentId + " attempted to release lock owned by " + it->second.currentOwner, -1, agentId);
        return false;
    }

    if (!it->second.waitingQueue.empty()) {
        std::string nextOwner = it->second.waitingQueue.front();
        it->second.waitingQueue.erase(it->second.waitingQueue.begin());
        it->second.currentOwner = nextOwner;
        it->second.lockedAt = getCurrentTimestamp();
        Logger::getInstance().log("INFO", "LOCK_HANDOFF", "Lock on " + filePath + " handed off to " + nextOwner, -1, nextOwner);
    } else {
        it->second.isLocked = false;
        it->second.currentOwner = "";
        it->second.lockedAt = "";
        Logger::getInstance().log("INFO", "LOCK_RELEASED", "File lock released on " + filePath, -1, agentId);
    }
    return true;
}

std::vector<SharedFileLock> FileManager::getAllLocks() {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::vector<SharedFileLock> list;
    for (const auto& kv : locks_) {
        list.push_back(kv.second);
    }
    return list;
}

bool FileManager::createBackup(const std::string& filePath, const std::string& modifiedBy) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::stringstream ssId;
    ssId << "bak_" << (++backupCounter_);

    BackupRecord rec;
    rec.backupId = ssId.str();
    rec.originalFile = filePath;
    rec.backupFile = "backups/" + filePath.substr(filePath.find_last_of("/\\") + 1) + ".bak";
    rec.modifiedBy = modifiedBy;
    rec.timestamp = getCurrentTimestamp();
    rec.fileHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // SHA-256
    rec.status = "SECURED";

    backups_.push_back(rec);
    Logger::getInstance().log("INFO", "BACKUP_CREATED", "Created backup for " + filePath + " -> " + rec.backupFile, -1, modifiedBy);
    return true;
}

bool FileManager::restoreBackup(const std::string& backupFile, const std::string& targetFile) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::string normalized;
    std::string err;
    if (!validatePath(targetFile, normalized, err)) {
        Logger::getInstance().log("ERROR", "BACKUP_RESTORE_FAILED", "Target file outside workspace: " + err);
        return false;
    }

    Logger::getInstance().log("INFO", "BACKUP_RESTORED", "Restored " + backupFile + " to " + targetFile);
    return true;
}

std::vector<BackupRecord> FileManager::getAllBackups() {
    std::lock_guard<std::mutex> lock(fileMutex_);
    return backups_;
}

std::vector<FileAuditRecord> FileManager::getAuditLogs() {
    std::lock_guard<std::mutex> lock(fileMutex_);
    return auditLogs_;
}

} // namespace os_engine
