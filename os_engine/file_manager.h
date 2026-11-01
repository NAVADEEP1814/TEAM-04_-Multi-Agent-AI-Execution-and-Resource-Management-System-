#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H

#include "common.h"
#include <map>
#include <vector>
#include <mutex>

namespace os_engine {

struct BackupRecord {
    std::string backupId;
    std::string originalFile;
    std::string backupFile;
    std::string modifiedBy;
    std::string timestamp;
    std::string fileHash;
    std::string status;
};

class FileManager {
public:
    static FileManager& getInstance();

    void init(const std::string& workspaceRoot, const std::string& backupRoot);

    bool validatePath(const std::string& requestedPath, std::string& normalizedPath, std::string& errorMessage);
    bool checkAccess(const std::string& agentId, const std::string& requestedPath, FileOp op, std::string& resultMessage);

    bool acquireFileLock(const std::string& filePath, const std::string& agentId);
    bool releaseFileLock(const std::string& filePath, const std::string& agentId);
    std::vector<SharedFileLock> getAllLocks();

    bool createBackup(const std::string& filePath, const std::string& modifiedBy);
    bool restoreBackup(const std::string& backupFile, const std::string& targetFile);
    std::vector<BackupRecord> getAllBackups();
    std::vector<FileAuditRecord> getAuditLogs();

private:
    FileManager() = default;
    ~FileManager() = default;
    FileManager(const FileManager&) = delete;
    FileManager& operator=(const FileManager&) = delete;

    std::string workspaceRoot_ = "./workspace";
    std::string backupRoot_ = "./backups";
    std::map<std::string, SharedFileLock> locks_;
    std::vector<BackupRecord> backups_;
    std::vector<FileAuditRecord> auditLogs_;
    std::mutex fileMutex_;
    int backupCounter_ = 0;
};

} // namespace os_engine

#endif // FILE_MANAGER_H
