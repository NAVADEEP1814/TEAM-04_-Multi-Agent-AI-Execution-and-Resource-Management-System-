import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Pause, Play, Send } from 'lucide-react';
import { api } from '../services/api';

export default function TerminalConsole({ maxHeight = '400px' }) {
  const [lines, setLines] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const terminalEndRef = useRef(null);

  const fetchTerminalLogs = async () => {
    if (isPaused) return;
    try {
      const res = await api.getTerminalLogs();
      if (res.lines) {
        setLines(res.lines);
      }
    } catch (err) {
      console.error('Failed to fetch terminal logs:', err);
    }
  };

  useEffect(() => {
    fetchTerminalLogs();
    const interval = setInterval(fetchTerminalLogs, 2000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, autoScroll]);

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim().toLowerCase();
    const newLines = [...lines, { timestamp: new Date().toLocaleTimeString(), line: `$ ${commandInput}`, level: 'CMD' }];

    if (cmd === 'clear') {
      setLines([]);
      setCommandInput('');
      return;
    } else if (cmd === 'help') {
      newLines.push({ timestamp: new Date().toLocaleTimeString(), line: 'Available commands: ps, ipc, status, clear, help', level: 'INFO' });
    } else if (cmd === 'ps') {
      try {
        const p = await api.getProcesses();
        (p.processes || []).forEach(proc => {
          newLines.push({
            timestamp: new Date().toLocaleTimeString(),
            line: `[PID ${proc.pid}] ${proc.agent_name} | State: ${proc.state} | CPU: ${proc.cpu_percent}% | Mem: ${proc.memory_mb}MB`,
            level: 'INFO'
          });
        });
      } catch (err) {
        newLines.push({ timestamp: new Date().toLocaleTimeString(), line: `Error: ${err.message}`, level: 'ERROR' });
      }
    } else if (cmd === 'status') {
      try {
        const s = await api.getSystemStatus();
        newLines.push({
          timestamp: new Date().toLocaleTimeString(),
          line: `[SYSTEM] Mode: ${s.mode} | Active Agents: ${s.active_agents} | CPU: ${s.cpu_usage}% | Mem: ${s.memory_usage_gb}GB`,
          level: 'INFO'
        });
      } catch (err) {
        newLines.push({ timestamp: new Date().toLocaleTimeString(), line: `Error: ${err.message}`, level: 'ERROR' });
      }
    } else {
      newLines.push({ timestamp: new Date().toLocaleTimeString(), line: `bash: ${commandInput}: command not recognized. Try 'help'`, level: 'WARN' });
    }

    setLines(newLines);
    setCommandInput('');
  };

  const getLineColor = (level) => {
    switch (level) {
      case 'ERROR': return 'var(--status-critical)';
      case 'WARN': return 'var(--status-warning)';
      case 'CMD': return 'var(--accent)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '8px' }}>
            os-kernel-console :: /dev/pts/1
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
          <button
            onClick={() => setLines([])}
            className="btn btn-secondary btn-sm"
            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="terminal-body" style={{ height: maxHeight }}>
        <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
          $ ./multi_agent_manager --session-init --posix-fifo
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '12px' }}>
          [KERNEL] POSIX Agent Execution & Resource Management Bridge Online
        </div>

        {lines.map((entry, idx) => (
          <div key={idx} style={{ color: getLineColor(entry.level), marginBottom: '4px', wordBreak: 'break-all' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>[{entry.timestamp}]</span>
            {entry.line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <form onSubmit={handleCommand} style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}>
        <span style={{ color: 'var(--accent)', marginRight: '8px', fontWeight: 700 }}>$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Type command (e.g. ps, status, help, clear)..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.85rem'
          }}
        />
        <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
