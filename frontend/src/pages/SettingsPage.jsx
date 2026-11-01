import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSystem } from '../context/SystemContext';
import { Settings, Sun, Moon, RotateCcw, Shield, HardDrive, Info } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { status, resetSystem, loading } = useSystem();

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the demo environment? All dynamic processes and logs will be restored to their baseline state.')) {
      await resetSystem();
      alert('Demo environment reset successfully.');
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Console & System Settings
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Configure user interface theme, OS bridge operational parameters, and environment state
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Theme Settings Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sun size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Appearance & Theme
            </h2>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Switch between the dark cybersecurity console theme (recommended for low-light environments) and the clean, high-contrast light theme.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { if (!isDark) toggleTheme(); }}
              className={`btn ${isDark ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '12px' }}
            >
              <Moon size={16} />
              <span>Dark Theme (Active)</span>
            </button>

            <button
              onClick={() => { if (isDark) toggleTheme(); }}
              className={`btn ${!isDark ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '12px' }}
            >
              <Sun size={16} />
              <span>Light Theme</span>
            </button>
          </div>
        </div>

        {/* Operating System Bridge Mode */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Kernel Engine Bridge Status
            </h2>
          </div>

          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-primary)',
            marginBottom: '14px',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Engine Mode:</span>
              <strong style={{ color: status.is_live_linux ? 'var(--status-healthy)' : 'var(--status-warning)' }}>
                {status.mode}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Native POSIX APIs:</span>
              <span className="font-mono" style={{ fontSize: '0.8rem' }}>
                {status.is_live_linux ? 'Enabled (fork, getpid, kill, mkfifo)' : 'Emulated in Kernel Bridge'}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            To run in <strong>LIVE LINUX MODE</strong>, compile <code>os_engine/</code> using <code>make</code> on Linux/Ubuntu or WSL, then execute the controller binary <code>bin/multi_agent_manager</code>.
          </p>
        </div>

        {/* Reset Demo Environment */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <RotateCcw size={20} style={{ color: 'var(--status-warning)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Environment State Reset
            </h2>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Reset the demo environment back to the 4 canonical agents (Code Generator, Code Executor, Code Reviewer, Testing Agent), clear contentious locks, and refresh all activity logs.
          </p>

          <button
            onClick={handleReset}
            disabled={loading}
            className="btn btn-warning"
            style={{ width: '100%', padding: '12px' }}
          >
            <RotateCcw size={16} />
            <span>Reset Demo State to Initial Baseline</span>
          </button>
        </div>

        {/* Sandbox & Directory Inspection */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <HardDrive size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Filesystem Boundaries
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Workspace Root:</span>{' '}
              <span className="font-mono" style={{ color: 'var(--accent)' }}>./workspace/</span>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Backup Storage:</span>{' '}
              <span className="font-mono" style={{ color: 'var(--accent)' }}>./backups/</span>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Named Pipe Directory:</span>{' '}
              <span className="font-mono" style={{ color: 'var(--accent)' }}>/tmp/agent_xx_fifo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
