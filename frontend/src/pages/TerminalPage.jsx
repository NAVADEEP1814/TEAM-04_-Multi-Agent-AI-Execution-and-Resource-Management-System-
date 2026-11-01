import React from 'react';
import TerminalConsole from '../components/TerminalConsole';
import { Terminal, Shield, Info } from 'lucide-react';

export default function TerminalPage() {
  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          System Terminal & Live Console
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Real-time kernel log streaming, POSIX process telemetry, and interactive bash-style command console
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <TerminalConsole maxHeight="550px" />
      </div>

      <div className="glass-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Info size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Terminal Console Capabilities:</strong> This terminal connects directly to the backend activity telemetry buffer. You can run commands such as <code>ps</code> to inspect processes, <code>ipc</code> to check named pipe statuses, <code>status</code> for system load metrics, or <code>clear</code> to purge the screen buffer.
        </div>
      </div>
    </div>
  );
}
