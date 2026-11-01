import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSystem } from '../context/SystemContext';
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  Menu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server
} from 'lucide-react';

export default function TopBar({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { status, alerts, startDemoEnvironment, loading } = useSystem();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showHealthDropdown, setShowHealthDropdown] = useState(false);

  const isLive = status.is_live_linux;

  return (
    <header className="top-bar">
      {/* Left: Mobile Menu & Mode Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <div className={`mode-badge ${isLive ? 'live' : 'simulation'}`}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isLive ? 'var(--status-healthy)' : 'var(--status-warning)',
            boxShadow: `0 0 8px ${isLive ? 'var(--status-healthy)' : 'var(--status-warning)'}`
          }} />
          {status.mode}
        </div>

        <button
          onClick={startDemoEnvironment}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          title="Refresh demo processes and states"
          style={{ fontSize: '0.75rem' }}
        >
          {loading ? 'Initializing...' : 'Reset Demo State'}
        </button>
      </div>

      {/* Right: Health, Alerts, Theme Toggle, User, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Health Indicators Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowHealthDropdown(!showHealthDropdown); setShowAlertsDropdown(false); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="System Subsystem Health"
          >
            <Server size={15} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.75rem' }}>Subsystems</span>
          </button>

          {showHealthDropdown && (
            <div className="glass-card" style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              width: '240px',
              zIndex: 50,
              padding: '12px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                SUBSYSTEM HEALTH
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                {Object.entries(status.health || {}).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{key.replace('_status', '').replace('_', ' ')}</span>
                    <span style={{
                      color: val === 'ONLINE' || val === 'NATIVE_LINUX_POSIX' ? 'var(--status-healthy)' : 'var(--status-warning)',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Alerts Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowAlertsDropdown(!showAlertsDropdown); setShowHealthDropdown(false); }}
            className="btn btn-secondary btn-sm"
            style={{ position: 'relative', padding: '7px 10px' }}
            title="Security & Resource Alerts"
          >
            <Bell size={16} />
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'var(--status-critical)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {alerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="glass-card" style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              width: '320px',
              zIndex: 50,
              padding: '14px',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '350px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  SECURITY ALERTS ({alerts.length})
                </span>
              </div>
              {alerts.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  No active security alerts
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alerts.map((al) => (
                    <div key={al.id} style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-critical)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <AlertTriangle size={13} />
                        {al.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {al.reason}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {al.timestamp} • Agent: {al.agent}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun size={15} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Light</span>
            </>
          ) : (
            <>
              <Moon size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Dark</span>
            </>
          )}
        </button>

        {/* User Profile Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {user?.username || 'admin'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {user?.role || 'OS_SUPERVISOR'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--status-critical)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          title="Sign out of OS Console"
        >
          <LogOut size={15} />
          <span style={{ fontSize: '0.75rem' }}>Logout</span>
        </button>
      </div>
    </header>
  );
}
