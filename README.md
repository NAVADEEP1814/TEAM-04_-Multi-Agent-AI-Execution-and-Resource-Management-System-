# Multi-Agent AI Execution and Resource Management System
**Course:** Operating Systems and Systems Programming (25CS2104E)  
**Project Category:** Linux Systems Programming & Process Resource Management Platform

---

## 1. Executive Summary & Project Purpose

The **Multi-Agent AI Execution and Resource Management System** is a professional, full-stack systems programming platform designed to demonstrate foundational and advanced Operating System concepts in a cohesive, visual, and interactive environment.

Unlike generic web dashboards, this system is engineered specifically for **Operating Systems and Systems Programming**, providing concrete, tangible demonstrations of:
1. **Process Creation**: Child process initialization via `fork()`.
2. **Process Identification**: Tracking unique kernel Process IDs (`getpid()`) and parent IDs (`getppid()`).
3. **Inter-Process Communication (IPC)**: Kernel-buffered data exchange using **POSIX Named Pipes (FIFO)** (`mkfifo()`, `open()`, `read()`, `write()`).
4. **Signal Handling**: Asynchronous process state control using POSIX signals (`SIGSTOP`, `SIGCONT`, `SIGTERM`, `SIGKILL`) via `kill()` and `sigaction()`.
5. **Process Synchronization & Mutexes**: Coordinating shared file access to prevent race conditions and contention queues using `fcntl()` file locking.
6. **File Access Control & Sandboxing**: Enforcing a restricted workspace (`./workspace/`) with strict validation against path traversal (`../`) and unauthorized system access (`/etc/passwd`, `/etc/shadow`).
7. **Resource Quotas & Monitoring**: Dynamic tracking of CPU utilization and Resident Set Size memory (`VmRSS` via `/proc/[pid]/status`), detecting quota breaches and recommending corrective signals.
8. **Automated Snapshot Backups**: Real-time snapshot generation with SHA-256 integrity verification upon file modification.
9. **Activity & Audit Logging**: Comprehensive, timestamped kernel event logging with CSV and JSON export capabilities.
10. **Safe Process Termination**: Graceful teardown via `SIGTERM` and emergency reaping via `waitpid()`.

---

## 2. System Architecture

The project enforces a strict, layered architecture where the browser **never** executes system calls directly. All operations are mediated through a secure FastAPI backend to either native Linux C++ POSIX processes or a high-fidelity Linux kernel simulation engine:

```
+-------------------------------------------------------------------------+
|                  REACT WEB DASHBOARD (Presentation Layer)               |
|      - Dark / Light Theme Toggle                                        |
|      - 17 Dedicated Management Pages                                     |
|      - Interactive Pipeline Steppers & Live Recharts                    |
+-------------------------------------------------------------------------+
                                    |
                                    | REST API (JWT Bearer Auth)
                                    v
+-------------------------------------------------------------------------+
|                    FASTAPI BACKEND & BRIDGE LAYER                       |
|      - Authentication & Session Protection                              |
|      - Path Traversal Sanitization & ACL Verification                   |
|      - OS Dual-Mode Bridge (Auto-detects Native Linux vs Simulation)   |
+-------------------------------------------------------------------------+
                                    |
             +----------------------+----------------------+
             | (On Linux / WSL)                           | (Windows / macOS Fallback)
             v                                             v
+-----------------------------+               +-----------------------------+
|    NATIVE LINUX C++ ENGINE   |               |   KERNEL SIMULATION ENGINE  |
|  - fork() & execve()        |               |  - Realistic PID allocation |
|  - getpid() & waitpid()     |               |  - FIFO channel queues      |
|  - mkfifo() in /tmp/        |               |  - CPU / Memory noise & ticks|
|  - kill() & sigaction()     |               |  - Mutex lock & wait queues |
|  - /proc/[pid]/status       |               |  - Path sandbox validation  |
+-----------------------------+               +-----------------------------+
             |                                             |
             +----------------------+----------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|               RESTRICTED WORKSPACE & STORAGE LAYER                      |
|      - Authorized Workspace Root: ./workspace/ (main.c, config.json)    |
|      - Backup Archive Storage:    ./backups/   (*.bak + SHA-256)        |
|      - Activity Audit Logs:       ./logs/      (os_engine.log)          |
+-------------------------------------------------------------------------+
```

---

## 3. Dual-Mode Architecture: Simulation Mode vs Live Linux Mode

To ensure the project can be demonstrated seamlessly across multiple environments (including Windows developer workstations, macOS laptops, and native Ubuntu/Debian Linux lab systems), the platform features a **Dual-Mode Engine**:

### 1. Simulation Mode (Default on Windows / non-Linux)
- **Active when:** The native C++ Linux binary is not running or the host OS is not Linux.
- **Visual Indicator:** Amber badge labeled `SIMULATION MODE`.
- **Behavior:** Generates realistic, stateful Linux process behavior:
  - Allocates realistic PIDs (e.g., `28431`, `28432`).
  - Simulates FIFO message queues between agents.
  - Dynamically fluctuates CPU and memory metrics, realistically triggering limit violations (`RESOURCE LIMIT EXCEEDED`).
  - Enforces mutual exclusion locks and wait queues for `./workspace/main.c`.
  - Blocks path traversal attacks (`../../etc/passwd`) with security alerts.
  - Transparently labels all data as simulated—**never** pretending simulated data is native kernel telemetry.

### 2. Live Linux Mode (Active on Linux / WSL)
- **Active when:** Compiled C++ binary `os_engine/bin/multi_agent_manager` is running on Linux or WSL.
- **Visual Indicator:** Green glowing badge labeled `LIVE LINUX MODE`.
- **Behavior:**
  - Invokes actual `fork()` system calls to spawn child processes.
  - Creates real named pipes in `/tmp/agent_xx_fifo` using `mkfifo()`.
  - Dispatches native kernel signals using `kill(pid, sig)`.
  - Reads live kernel telemetry from `/proc/[pid]/stat` and `/proc/[pid]/status`.
  - Reaps terminated children using `waitpid()`.

---

## 4. Technology Stack

### Frontend
- **Framework:** React 19 + Vite 6
- **Routing:** React Router v7 (Protected routes with automatic `/login` redirects)
- **Styling:** Custom CSS Design System with CSS variables supporting **Dark Theme** (cybersecurity console) and **Light Theme** (high-contrast daylight mode)
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Area charts, Line charts, Bar charts)
- **Interactive Console:** Embedded VT100-style live terminal with command execution (`ps`, `ipc`, `status`, `clear`, `help`)

### Backend
- **Framework:** Python 3.10+ with FastAPI
- **Server:** Uvicorn (ASGI)
- **Authentication:** JWT (HMAC-SHA256) with PBKDF2 password hashing and salt
- **Validation:** Pydantic v2 schemas
- **File Security:** Canonical path resolution and sandbox prefix enforcement

### Native OS Engine
- **Language:** C++17
- **Compiler:** `g++` with flags `-std=c++17 -Wall -Wextra -O2 -pthread`
- **POSIX APIs:** `fork()`, `getpid()`, `getppid()`, `waitpid()`, `mkfifo()`, `open()`, `read()`, `write()`, `kill()`, `sigaction()`, `fcntl()`, `realpath()`

---

## 5. Directory Structure

```
OSSP_PROJECT/
├── frontend/                     # React Frontend Application
│   ├── src/
│   │   ├── components/           # Sidebar, TopBar, StatusBadge, MetricCard, ConfirmModal, TerminalConsole
│   │   ├── context/              # AuthContext, ThemeContext, SystemContext
│   │   ├── pages/                # 17 Dedicated Application Pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AgentsPage.jsx
│   │   │   ├── ProcessManagerPage.jsx
│   │   │   ├── CreateProcessPage.jsx
│   │   │   ├── TaskExecutionPage.jsx
│   │   │   ├── IpcMonitorPage.jsx
│   │   │   ├── ResourceMonitorPage.jsx
│   │   │   ├── WorkspaceSecurityPage.jsx
│   │   │   ├── FileValidationPage.jsx
│   │   │   ├── SynchronizationPage.jsx
│   │   │   ├── SignalControlPage.jsx
│   │   │   ├── ActivityLogsPage.jsx
│   │   │   ├── FileBackupsPage.jsx
│   │   │   ├── ArchitecturePage.jsx
│   │   │   ├── OsConceptsPage.jsx
│   │   │   ├── TerminalPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/             # api.js client with auth token interceptors
│   │   ├── index.css             # Theme variables (dark & light) & design tokens
│   │   ├── App.jsx               # Router & Protected Layout
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                      # Python FastAPI Application
│   ├── main.py                   # App entrypoint, CORS, routes & simulation ticker
│   ├── auth.py                   # JWT auth, PBKDF2 hashing, protected route dependencies
│   ├── os_bridge.py              # Façade unifying native Linux engine & simulation
│   ├── simulation_engine.py      # High-fidelity Linux kernel state manager
│   ├── test_api.py               # 11-suite automated verification script
│   ├── requirements.txt
│   └── routes/                   # Modular REST API endpoints
│       ├── auth_routes.py        # /api/auth/*
│       ├── agent_routes.py       # /api/agents/*
│       ├── process_routes.py     # /api/processes/*
│       ├── ipc_routes.py         # /api/ipc/*
│       ├── resource_routes.py    # /api/resources/*
│       ├── security_routes.py    # /api/files/*
│       ├── sync_routes.py        # /api/sync/*
│       ├── log_routes.py         # /api/logs/*
│       ├── backup_routes.py      # /api/backups/*
│       ├── task_routes.py        # /api/tasks/*
│       └── system_routes.py      # /api/system/* & /api/health
│
├── os_engine/                    # Native Linux C++ POSIX Engine
│   ├── common.h                  # POSIX headers, enums & shared structs
│   ├── logger.h / logger.cpp     # Thread-safe activity logger
│   ├── process_manager.h/.cpp    # fork(), getpid(), waitpid()
│   ├── ipc_manager.h/.cpp        # mkfifo(), named pipe non-blocking read/write
│   ├── resource_manager.h/.cpp   # /proc/[pid]/stat & /proc/[pid]/status reader
│   ├── signal_manager.h/.cpp     # sigaction(), kill(pid, sig)
│   ├── file_manager.h/.cpp       # realpath() canonicalization, fcntl() locking
│   ├── main.cpp                  # CLI / daemon entrypoint
│   └── Makefile                  # Build script for g++
│
├── workspace/                    # Sandboxed workspace (main.c, config.json, dataset.txt)
├── backups/                      # Backup snapshots (*.bak)
├── logs/                         # Execution logs
└── README.md
```

---

## 6. Installation & Execution Guide

### Prerequisites
- Python 3.10 or higher
- Node.js v18 or higher (tested on Node v24)
- (Optional for Live Linux Mode): GCC / G++ with make on Linux or WSL

---

### Step 1: Start the Backend Server

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the automated test suite to verify all 11 subsystems:
   ```bash
   python test_api.py
   ```
4. Start the FastAPI server on port 8000:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend API documentation is available at `http://127.0.0.1:8000/docs`.*

---

### Step 2: Start the React Frontend

1. Open a second terminal:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

---

### Step 3: Login to the Dashboard

- **Login Page:** `http://localhost:5173/login`
- **Authorized Username:** `admin`
- **Authorized Password:** `os_admin_2026!`

*(Note: Credentials are never exposed in UI text or client code. They are securely verified via server-side PBKDF2 hash comparison).*

---

### Step 4 (Optional): Running the Native C++ Linux OS Engine

If running on Linux, Ubuntu, or Windows Subsystem for Linux (WSL):

1. Open a terminal in the `os_engine/` directory:
   ```bash
   cd os_engine
   make clean
   make
   ```
2. Run the engine interactively:
   ```bash
   ./bin/multi_agent_manager
   ```
3. Or run as a background daemon:
   ```bash
   ./bin/multi_agent_manager --daemon
   ```
4. When the engine is active on Linux, the web dashboard automatically switches its status badge to:
   ```
   ● LIVE LINUX MODE
   ```

---

## 7. Faculty Demonstration Walkthrough

When presenting this project to faculty or examiners, follow this 10-step demonstration path:

1. **Login & Security Protection**: Show that attempting to access `/dashboard` without authentication redirects to `/login`. Log in with `admin` / `os_admin_2026!`.
2. **Dashboard & Demo Environment**: Point out the **SIMULATION MODE** or **LIVE LINUX MODE** indicator and the 8 statistics cards. Click **"Start Demo Environment"** to populate the 4 canonical agents (Code Generator, Code Executor, Code Reviewer, Testing Agent).
3. **Theme Switch**: Click the **Theme Toggle** button in the top navigation bar to showcase seamless transitions between **Dark Mode** and **Light Mode**.
4. **Process Creation (`fork()`)**: Navigate to **"Create Process"**. Fill in the form for a new agent. Click **"CREATE PROCESS"** and watch the 7-step kernel timeline illuminate (`fork() -> PID assigned -> FIFO created -> Agent registered`).
5. **IPC / Named Pipes (`mkfifo()`)**: Navigate to **"IPC Monitor"**. Demonstrate the visual pipeline `Agent 01 -> FIFO -> Agent 02`. Send a message from Agent 01 to Agent 02 and observe the FIFO message buffer update.
6. **Resource Quotas & Enforcement**: Navigate to **"Resource Monitor"**. Point out the real-time CPU and Memory graphs. When a process exceeds its quota, demonstrate the **"SEND SIGSTOP"** or **"STOP PROCESS"** intervention buttons.
7. **Workspace Security & Path Traversal Defense**: Navigate to **"File Validation"**. Test `./workspace/main.c` (ALLOWED), then test `../../etc/passwd` and `/etc/shadow` (DENIED). Show how the 6-step validation pipeline blocks the traversal attack and triggers a **Security Alert**.
8. **Process Synchronization (Mutexes)**: Navigate to **"Synchronization"**. Click **"Simulate Contention Scenario"**. Show that Agent 01 acquires the lock on `main.c`, while Agent 02 and Agent 04 are placed in a waiting queue. Click **"Release Lock"** to demonstrate condition signaling and handoff.
9. **Backups & Restores**: Navigate to **"File Backups"**. Create a backup snapshot of `main.c`. Show the calculated SHA-256 checksum and click **"Restore"** to safely restore the file.
10. **Terminal & Live Console**: Navigate to **"System Terminal"**. Type commands like `ps`, `status`, and `ipc` to interact directly with the kernel bridge.

---

## 8. Academic Integrity & Course Information

- **Course:** Operating Systems and Systems Programming (25CS2104E)
- **Institution:** Department of Computer Science & Engineering
- **Project Title:** Multi-Agent AI Execution and Resource Management System
- **Key Concepts Covered:** POSIX System Calls (`fork`, `getpid`, `kill`, `mkfifo`, `fcntl`, `waitpid`), Process Scheduling & Priorities, Virtual Address Space Isolation, Mutex File Locks, Path Traversal Defense, `/proc` Resource Accounting.
