import React, { useState } from 'react';
import { Workflow, Layers, ArrowDown, ShieldCheck, Activity, Terminal, Radio, Server } from 'lucide-react';

export default function ArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState('os_controller');

  const NODE_DETAILS = {
    web_dashboard: {
      title: 'React Web Dashboard',
      layer: 'Presentation Layer',
      tech: 'React 19, Lucide Icons, Recharts, Theme Engine',
      description: 'Provides an administrative monitoring console with Dark/Light theme switching, real-time charts, protected routes, and interactive controls for university faculty demonstration.',
      posix: 'None (Browser strictly isolated; never calls syscalls directly)'
    },
    rest_api: {
      title: 'FastAPI Backend & Bridge',
      layer: 'Application Gateway',
      tech: 'Python 3.10, FastAPI, Pydantic, JWT HMAC-SHA256',
      description: 'Validates operator credentials, enforces workspace path sanitization, normalizes endpoints, and bridges telemetry between the browser and the Linux C++ OS engine.',
      posix: 'Path normalization, background simulation thread, socket/pipe bridge'
    },
    os_controller: {
      title: 'OS Controller & Process Manager',
      layer: 'POSIX Core Layer',
      tech: 'C++17, POSIX APIs, pthread',
      description: 'Spawns agents as independent child processes using fork(), tracks process table via getpid(), and manages lifecycle transitions.',
      posix: 'fork(), getpid(), getppid(), waitpid(), execve()'
    },
    agents: {
      title: 'Multi-Agent Child Processes',
      layer: 'Execution Layer',
      tech: 'Isolated Process Images (Agents 01 - 04)',
      description: 'Dedicated processes for Code Generation, Binary Execution, Security Auditing, and Regression Testing. Each process possesses its own virtual address space and PID.',
      posix: 'Virtual Memory (VmRSS), Process Priority (nice), Signal Handlers'
    },
    fifo_ipc: {
      title: 'Named Pipes / FIFO IPC',
      layer: 'Inter-Process Communication',
      tech: 'POSIX mkfifo(), O_NONBLOCK File Descriptors',
      description: 'Enables asynchronous, structured message passing between independent agent processes using kernel-buffered named pipes located in /tmp/agent_xx_fifo.',
      posix: 'mkfifo(), open(), read(), write(), close(), unlink()'
    },
    workspace: {
      title: 'Restricted Workspace Sandbox',
      layer: 'File System & Security',
      tech: 'Canonical Path Resolution (./workspace/)',
      description: 'Restricts all agent file operations to the ./workspace directory. Blocks directory traversal (../) and attempts to access sensitive system paths like /etc/passwd.',
      posix: 'realpath(), stat(), access(), open(O_CREAT | O_WRONLY)'
    },
    acl_monitor: {
      title: 'File ACL & Resource Monitor',
      layer: 'Kernel Security & Resource Quotas',
      tech: '/proc/[pid]/stat, /proc/[pid]/status, fcntl()',
      description: 'Inspects CPU ticks and resident set size (VmRSS) from the Linux /proc filesystem, detects threshold violations, and manages file locks using fcntl().',
      posix: '/proc/[pid]/status, fcntl(F_SETLK, F_UNLCK), flock()'
    },
    signals: {
      title: 'Signal Dispatcher',
      layer: 'Kernel Asynchronous Notifications',
      tech: 'kill(pid, sig), sigaction()',
      description: 'Dispatches POSIX signals to pause (SIGSTOP), resume (SIGCONT), gracefully stop (SIGTERM), or force-kill (SIGKILL) processes upon quota breaches or operator command.',
      posix: 'kill(pid, SIGSTOP), kill(pid, SIGCONT), kill(pid, SIGTERM), kill(pid, SIGKILL)'
    }
  };

  const selected = NODE_DETAILS[selectedNode];

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          System Architecture & Kernel Pipeline
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Interactive schematic illustrating the separation of presentation, API gateway, POSIX process controller, and IPC named pipes
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Interactive Diagram */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
            System Component Hierarchy (Click to Inspect)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            {/* 1. Web Dashboard */}
            <button
              onClick={() => setSelectedNode('web_dashboard')}
              style={{
                width: '80%',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: selectedNode === 'web_dashboard' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                border: `2px solid ${selectedNode === 'web_dashboard' ? 'var(--accent)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              REACT WEB DASHBOARD (Presentation)
            </button>

            <ArrowDown size={18} style={{ color: 'var(--text-muted)' }} />

            {/* 2. REST API */}
            <button
              onClick={() => setSelectedNode('rest_api')}
              style={{
                width: '80%',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: selectedNode === 'rest_api' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                border: `2px solid ${selectedNode === 'rest_api' ? 'var(--accent)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              FASTAPI REST BRIDGE & AUTH
            </button>

            <ArrowDown size={18} style={{ color: 'var(--text-muted)' }} />

            {/* 3. OS Controller */}
            <button
              onClick={() => setSelectedNode('os_controller')}
              style={{
                width: '80%',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: selectedNode === 'os_controller' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                border: `2px solid ${selectedNode === 'os_controller' ? 'var(--accent)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              C++ POSIX OS PROCESS CONTROLLER (fork / getpid)
            </button>

            <ArrowDown size={18} style={{ color: 'var(--text-muted)' }} />

            {/* 4. Agents */}
            <button
              onClick={() => setSelectedNode('agents')}
              style={{
                width: '90%',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: selectedNode === 'agents' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                border: `2px solid ${selectedNode === 'agents' ? 'var(--accent)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              AGENT PROCESSES (Agent 01, 02, 03, 04)
            </button>

            <div style={{ display: 'flex', gap: '16px', width: '90%' }}>
              <button
                onClick={() => setSelectedNode('fifo_ipc')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: selectedNode === 'fifo_ipc' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                  border: `2px solid ${selectedNode === 'fifo_ipc' ? 'var(--accent)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                NAMED PIPES (FIFO)
              </button>

              <button
                onClick={() => setSelectedNode('workspace')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: selectedNode === 'workspace' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                  border: `2px solid ${selectedNode === 'workspace' ? 'var(--accent)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                RESTRICTED WORKSPACE
              </button>
            </div>

            <ArrowDown size={18} style={{ color: 'var(--text-muted)' }} />

            <div style={{ display: 'flex', gap: '16px', width: '90%' }}>
              <button
                onClick={() => setSelectedNode('acl_monitor')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: selectedNode === 'acl_monitor' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                  border: `2px solid ${selectedNode === 'acl_monitor' ? 'var(--accent)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                FILE ACL & RESOURCE MONITOR
              </button>

              <button
                onClick={() => setSelectedNode('signals')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: selectedNode === 'signals' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                  border: `2px solid ${selectedNode === 'signals' ? 'var(--accent)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                POSIX SIGNALS (SIGSTOP / SIGTERM)
              </button>
            </div>
          </div>
        </div>

        {/* Selected Component Inspection Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--accent)'
            }}>
              <Workflow size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selected.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                {selected.layer}
              </span>
            </div>
          </div>

          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-primary)',
            fontSize: '0.85rem'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 700, marginBottom: '4px' }}>
              TECHNOLOGY / STACK:
            </div>
            <div className="font-mono" style={{ color: 'var(--text-primary)' }}>
              {selected.tech}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 700, marginBottom: '6px' }}>
              OPERATIONAL ROLE IN OS SYSTEM:
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {selected.description}
            </p>
          </div>

          <div style={{
            marginTop: 'auto',
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)'
          }}>
            <div style={{ color: 'var(--accent)', fontSize: '0.725rem', fontWeight: 700, marginBottom: '4px' }}>
              RELEVANT POSIX SYSTEM CALLS & APIS:
            </div>
            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              {selected.posix}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
