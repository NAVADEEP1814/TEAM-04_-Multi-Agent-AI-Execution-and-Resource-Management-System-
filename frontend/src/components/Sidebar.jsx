import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Cpu,
  PlusCircle,
  PlaySquare,
  Network,
  Activity,
  ShieldCheck,
  FileCheck2,
  Lock,
  Radio,
  FileText,
  Archive,
  Workflow,
  BookOpen,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/processes', label: 'Process Manager', icon: Cpu },
  { path: '/create-process', label: 'Create Process', icon: PlusCircle },
  { path: '/tasks', label: 'Task Execution', icon: PlaySquare },
  { path: '/ipc', label: 'IPC Monitor', icon: Network },
  { path: '/resources', label: 'Resource Monitor', icon: Activity },
  { path: '/security', label: 'Workspace Security', icon: ShieldCheck },
  { path: '/file-validation', label: 'File Validation', icon: FileCheck2 },
  { path: '/synchronization', label: 'Synchronization', icon: Lock },
  { path: '/signals', label: 'Signal Control', icon: Radio },
  { path: '/logs', label: 'Activity Logs', icon: FileText },
  { path: '/backups', label: 'File Backups', icon: Archive },
  { path: '/architecture', label: 'Architecture', icon: Workflow },
  { path: '/concepts', label: 'OS Concepts', icon: BookOpen },
  { path: '/terminal', label: 'System Terminal', icon: Terminal },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 0 12px var(--accent-glow)'
            }}>
              OS
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Multi-Agent OS
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em' }}>
                25CS2104E
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
