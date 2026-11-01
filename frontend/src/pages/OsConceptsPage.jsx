import React from 'react';
import { BookOpen, GitFork, Hash, Network, Radio, Lock, ShieldCheck, Activity, Eye, Archive } from 'lucide-react';

const CONCEPTS = [
  {
    title: 'Process Creation',
    syscall: 'fork() / execve()',
    icon: GitFork,
    what: 'The fork() system call duplicates the calling process, creating an exact child process with its own virtual address space, file descriptor table, and registers.',
    why: 'Enables concurrent execution of independent agent tasks without risking parent memory corruption or single-point process crashes.',
    demonstration: 'When a new agent is created, the C++ OS engine / simulation invokes fork(), initializes a dedicated agent execution loop, and registers the child in the process table.'
  },
  {
    title: 'Process Identification',
    syscall: 'getpid() / getppid()',
    icon: Hash,
    what: 'Each process in the Linux kernel is uniquely identified by an integer Process ID (PID) and tracks its parent via Parent Process ID (PPID).',
    why: 'The operating system and operator require unambiguous identifiers to track CPU/memory accounting, route signals, and manage parent-child relationships.',
    demonstration: 'The dashboard displays real PIDs for all agents (e.g. 28431, 28432), and signals/actions are dispatched specifically by referencing the target PID.'
  },
  {
    title: 'Inter-Process Communication',
    syscall: 'mkfifo() / open() / write()',
    icon: Network,
    what: 'Named Pipes (FIFOs) provide bidirectional or unidirectional inter-process communication channels accessible via filesystem paths (e.g. /tmp/agent_01_fifo).',
    why: 'Since processes have separate, isolated address spaces, they cannot share pointers. FIFOs allow kernel-buffered message passing between agents.',
    demonstration: 'The IPC Monitor visualizes the transmission of task payloads from Agent 01 to Agent 02 and beyond using dedicated FIFO pipes in /tmp/.'
  },
  {
    title: 'Signal Handling',
    syscall: 'kill() / sigaction()',
    icon: Radio,
    what: 'Signals are asynchronous notifications sent by the kernel or a process to notify another process of an event (e.g. SIGSTOP, SIGCONT, SIGTERM, SIGKILL).',
    why: 'Provides vital process control mechanisms to pause runaway computations, resume suspended workers, or safely terminate processes.',
    demonstration: 'Operators can pause (SIGSTOP), resume (SIGCONT), or terminate (SIGTERM) agents. When CPU/memory limits are exceeded, kernel signals can be dispatched.'
  },
  {
    title: 'Process Synchronization',
    syscall: 'fcntl(F_SETLK) / flock() / wait()',
    icon: Lock,
    what: 'Synchronization mechanisms ensure that concurrent processes do not simultaneously access shared critical sections or corrupt shared files.',
    why: 'Prevents race conditions, data inconsistencies, and deadlocks when multiple agents attempt to write to shared source files like main.c.',
    demonstration: 'The Synchronization page displays file mutex locks. When Agent 01 locks main.c, subsequent agents (Agent 02 and 04) are placed in a FIFO wait queue.'
  },
  {
    title: 'File Access Control & Sandboxing',
    syscall: 'realpath() / stat() / access()',
    icon: ShieldCheck,
    what: 'Operating system access control policies determine which files and directories a given process is authorized to read, write, create, or delete.',
    why: 'Protects critical host system directories (/etc, /root, /sys) and prevents malicious or misconfigured agents from executing path traversal attacks.',
    demonstration: 'The Workspace Security module strictly sandboxes file operations inside ./workspace/, actively blocking directory traversal (../) and unauthorized access.'
  },
  {
    title: 'Resource Quotas & Monitoring',
    syscall: '/proc/[pid]/stat & status',
    icon: Activity,
    what: 'The Linux kernel accounts for CPU time (jiffies in user/system mode) and memory consumption (VmRSS) through the virtual /proc filesystem.',
    why: 'Enforces fairness, prevents denial-of-service, and ensures that no single agent process exhausts host CPU or memory resources.',
    demonstration: 'The Resource Monitor graphs CPU and memory usage in real time, alerting the operator when an agent breaches its configured quota and recommending SIGSTOP.'
  },
  {
    title: 'Process Monitoring & Accounting',
    syscall: 'ps / top / waitpid()',
    icon: Eye,
    what: 'Process state management tracks whether processes are RUNNING, WAITING, BLOCKED, STOPPED, or ZOMBIE, and reaps exited children with waitpid().',
    why: 'Prevents zombie process accumulation in the kernel process table and provides administrators with continuous operational insight.',
    demonstration: 'The Process Manager mirrors the Linux top/ps command, tracking priority, state transitions, and execution elapsed time.'
  },
  {
    title: 'Activity Logging & File Backups',
    syscall: 'open(O_APPEND) / SHA-256 Checksums',
    icon: Archive,
    what: 'Persistent audit logging and snapshotting records all kernel events and preserves past file versions prior to in-place modification.',
    why: 'Provides non-repudiation, forensics, and reliable disaster recovery if an agent introduces a fatal bug or syntax error.',
    demonstration: 'All file writes automatically generate a timestamped .bak snapshot in ./backups/ with an SHA-256 hash, viewable and restorable via the UI.'
  }
];

export default function OsConceptsPage() {
  return (
    <div className="page-body">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Operating Systems Concepts Demonstrated
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Curriculum reference guide for Course 25CS2104E detailing POSIX APIs, kernel primitives, and system architecture
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {CONCEPTS.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-glow)',
                  color: 'var(--accent)'
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.title}
                  </h3>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {c.syscall}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>What it is:</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>{c.what}</p>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Why it is used in OS:</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>{c.why}</p>
                </div>

                <div style={{
                  marginTop: 'auto',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)'
                }}>
                  <strong style={{ color: 'var(--status-healthy)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    How this project demonstrates it:
                  </strong>
                  <p style={{ color: 'var(--text-primary)', marginTop: '2px', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {c.demonstration}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
