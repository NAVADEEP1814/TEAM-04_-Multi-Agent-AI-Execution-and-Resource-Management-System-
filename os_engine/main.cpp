#include "common.h"
#include "logger.h"
#include "process_manager.h"
#include "ipc_manager.h"
#include "resource_manager.h"
#include "signal_manager.h"
#include "file_manager.h"

using namespace os_engine;

void printBanner() {
    std::cout << "================================================================" << std::endl;
    std::cout << "  Multi-Agent AI Execution and Resource Management System       " << std::endl;
    std::cout << "  Course: Operating Systems and Systems Programming (25CS2104E) " << std::endl;
    std::cout << "  Linux Native POSIX OS Engine Controller v1.0.0               " << std::endl;
    std::cout << "================================================================" << std::endl;
}

void initializeDemoAgents() {
    std::cout << "[INFO] Initializing system submodules..." << std::endl;
    Logger::getInstance().init("logs/os_engine.log");
    FileManager::getInstance().init("./workspace", "./backups");

    Logger::getInstance().log("INFO", "SYSTEM_BOOT", "OS Engine Controller initialized successfully.");

    // Create 4 initial agents
    ProcessManager::getInstance().createAgentProcess("Code Generator", "Code Generator", "Generate source code", 50.0, 512.0);
    ProcessManager::getInstance().createAgentProcess("Code Executor", "Code Executor", "Execute compiled binaries", 65.0, 768.0);
    ProcessManager::getInstance().createAgentProcess("Code Reviewer", "Code Reviewer", "Static vulnerability review", 40.0, 384.0);
    ProcessManager::getInstance().createAgentProcess("Testing Agent", "Testing Agent", "Run regression & unit test suite", 45.0, 512.0);

    // Initial IPC message
    IpcManager::getInstance().sendMessage("agent_01", "agent_02", "TASK_SUBMISSION: main.c compiled and ready for execution.");
    IpcManager::getInstance().sendMessage("agent_02", "agent_03", "TASK_REVIEW: Reviewing test results for batch execution.");

    // Initial File Security Validation
    std::string msg;
    FileManager::getInstance().checkAccess("agent_01", "./workspace/main.c", FileOp::READ, msg);
    FileManager::getInstance().checkAccess("agent_02", "/etc/shadow", FileOp::READ, msg);

    // Initial File Lock
    FileManager::getInstance().acquireFileLock("./workspace/main.c", "agent_01");

    // Initial Backup
    FileManager::getInstance().createBackup("./workspace/main.c", "agent_01");
}

int main(int argc, char* argv[]) {
    printBanner();
    initializeDemoAgents();

    std::cout << "[INFO] All 4 agents spawned with PIDs and dedicated FIFO channels." << std::endl;
    std::cout << "[INFO] Ready for commands: (ps, ipc, locks, signals, help, exit)" << std::endl;

    if (argc > 1 && std::string(argv[1]) == "--daemon") {
        std::cout << "[INFO] Running in background daemon mode..." << std::endl;
        while (true) {
            ResourceManager::getInstance().recordSample();
            ResourceManager::getInstance().checkViolations();
            ProcessManager::getInstance().reapZombies();
#ifdef __linux__
            sleep(2);
#else
            break;
#endif
        }
        return 0;
    }

    std::string line;
    while (std::cout << "os-engine> " && std::getline(std::cin, line)) {
        if (line == "exit" || line == "quit") {
            break;
        } else if (line == "ps") {
            auto list = ProcessManager::getInstance().getAllProcesses();
            std::cout << std::left << std::setw(8) << "PID"
                      << std::setw(12) << "Agent ID"
                      << std::setw(18) << "Agent Name"
                      << std::setw(12) << "State"
                      << std::setw(10) << "CPU %"
                      << std::setw(12) << "Memory MB"
                      << "FIFO Channel" << std::endl;
            std::cout << std::string(85, '-') << std::endl;
            for (const auto& p : list) {
                std::cout << std::left << std::setw(8) << p.pid
                          << std::setw(12) << p.agentId
                          << std::setw(18) << p.agentName
                          << std::setw(12) << stateToString(p.state)
                          << std::setw(10) << p.cpuUsage
                          << std::setw(12) << p.memoryUsageMb
                          << p.fifoChannel << std::endl;
            }
        } else if (line == "ipc") {
            auto channels = IpcManager::getInstance().getAllChannels();
            for (const auto& ch : channels) {
                std::cout << "[FIFO] " << ch.fifoName << " | Sent: " << ch.messagesSent << " | Recv: " << ch.messagesReceived << " | Status: " << ch.status << std::endl;
            }
        } else if (line == "locks") {
            auto locks = FileManager::getInstance().getAllLocks();
            for (const auto& l : locks) {
                std::cout << "[LOCK] " << l.filePath << " | Owner: " << (l.isLocked ? l.currentOwner : "NONE") << " | Waiting: " << l.waitingQueue.size() << std::endl;
            }
        } else if (line == "help") {
            std::cout << "Commands:" << std::endl;
            std::cout << "  ps       - List all active agent processes" << std::endl;
            std::cout << "  ipc      - List named pipe (FIFO) channels" << std::endl;
            std::cout << "  locks    - List shared file mutex locks" << std::endl;
            std::cout << "  help     - Show this help message" << std::endl;
            std::cout << "  exit     - Stop and exit engine" << std::endl;
        } else if (!line.empty()) {
            std::cout << "Unknown command: " << line << " (type 'help' for command list)" << std::endl;
        }
    }

    std::cout << "[INFO] OS Engine stopping." << std::endl;
    return 0;
}
