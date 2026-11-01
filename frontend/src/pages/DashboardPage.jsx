import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import {
  Users,
  Cpu,
  Activity,
  HardDrive,
  Network,
  PlaySquare,
  ShieldAlert,
  Clock,
  Play,
  Pause,
  XCircle,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const { status, startDemoEnvironment, loading } = useSystem();
  const [agents, setAgents] = useState([]);
  const [history, setHistory] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, pid: null, action: null, agentName: '' });

  const fetchDashboardData = async () => {
    try {
      const [agRes, resHist] = await Promise.all([
        api.getAgents(),
        api.getResourceHistory()
      ]);
      setAgents(agRes.agents || []);
      setHistory(resHist.history || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleActionClick = (pid, action, agentName) => {
    if (action === 'TERMINATE') {
      setModalState({ isOpen: true, pid, action, agentName });
    } else {
      executeSignal(pid, action === 'PAUSE' ? 'SIGSTOP' : 'SIGCONT');
    }
  };

  const executeSignal = async (pid, signal) => {
    try {
      await api.sendProcessSignal(pid, signal);
      await fetchDashboardData();
    } catch (err) {
      alert(`Signal dispatch failed: ${err.message}`);
    }
  };

  const confirmTermination = async () => {
    if (modalState.pid) {
      await executeSignal(modalState.pid, 'SIGTERM');
      setModalState({ isOpen: false, pid: null, action: null, agentName: '' });
    }
  };

  return (
    <div className="page-body">
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            OS Execution Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time multi-agent execution pipeline & POSIX process monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={startDemoEnvironment}
            disabled={loading}
            className="btn btn-primary"
            style={{ boxShadow: '0 0 16px var(--accent-glow)' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Initializing Demo...' : 'Start Demo Environment'}</span>
          </button>
        </div>
      </div>

      {/* 8 Statistics Cards */}
      <div className="stat-grid">
        <MetricCard
          title="Active Agents"
          value={status.active_agents}
          subtext={`${agents.length} Registered`}
          statusType={status.active_agents > 0 ? 'healthy' : 'warning'}
          icon={Users}
        />
        <MetricCard
          title="Total Processes"
          value={status.total_processes}
          subtext="Kernel Process Table"
          statusType="info"
          icon={Cpu}
        />
        <MetricCard
          title="CPU Usage"
          value={`${status.cpu_usage}%`}
          subtext={status.cpu_usage > 75 ? 'High Load' : 'Normal Load'}
          statusType={status.cpu_usage > 75 ? 'critical' : (status.cpu_usage > 50 ? 'warning' : 'healthy')}
          icon={Activity}
        />
        <MetricCard
          title="Memory Usage"
          value={`${status.memory_usage_gb} GB`}
          subtext={`of ${status.total_memory_gb} GB Total`}
          statusType="info"
          icon={HardDrive}
        />
        <MetricCard
          title="FIFO Channels"
          value={status.fifo_channels_count}
          subtext="Named Pipes Active"
          statusType="healthy"
          icon={Network}
        />
        <MetricCard
          title="Active Tasks"
          value={status.active_tasks_count}
          subtext="In Execution Pool"
          statusType="info"
          icon={PlaySquare}
        />
        <MetricCard
          title="Security Alerts"
          value={status.security_alerts_count}
          subtext="Path / ACL Triggers"
          statusType={status.security_alerts_count > 0 ? 'critical' : 'healthy'}
          icon={ShieldAlert}
        />
        <MetricCard
          title="System Uptime"
          value={status.uptime}
          subtext="Controller Elapsed"
          statusType="info"
          icon={Clock}
        />
      </div>

      {/* Real-time Resource Chart */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Live System Load & Memory Utilization
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Dynamic process telemetry monitored from POSIX system accounting
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
            POLLING: 2.5s INTERVAL
          </span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card-solid)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Area type="monotone" dataKey="cpu_usage" name="CPU Usage (%)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
              <Area type="monotone" dataKey="memory_gb" name="Memory (GB)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#memGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Agents Management Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Multi-Agent Processes
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Individual process execution states, memory allocation, and signal handlers
            </p>
          </div>
        </div>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>PID</th>
                <th>State</th>
                <th>CPU %</th>
                <th>Memory</th>
                <th>FIFO Channel</th>
                <th>Current Task</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agent.id} • {agent.type}</div>
                  </td>
                  <td className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {agent.pid}
                  </td>
                  <td>
                    <StatusBadge status={agent.status} />
                  </td>
                  <td className="font-mono">
                    <span style={{ color: agent.cpu > agent.cpu_limit ? 'var(--status-critical)' : 'inherit' }}>
                      {agent.cpu}%
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      / {agent.cpu_limit}%
                    </span>
                  </td>
                  <td className="font-mono">
                    {agent.memory_mb} MB
                  </td>
                  <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {agent.fifo_channel}
                  </td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {agent.task}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {agent.status === 'RUNNING' ? (
                        <button
                          onClick={() => handleActionClick(agent.pid, 'PAUSE', agent.name)}
                          className="btn btn-warning btn-sm"
                          title="kill(pid, SIGSTOP)"
                        >
                          <Pause size={13} />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick(agent.pid, 'RESUME', agent.name)}
                          className="btn btn-success btn-sm"
                          title="kill(pid, SIGCONT)"
                        >
                          <Play size={13} />
                          <span>Resume</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleActionClick(agent.pid, 'TERMINATE', agent.name)}
                        className="btn btn-danger btn-sm"
                        title="kill(pid, SIGTERM)"
                      >
                        <XCircle size={13} />
                        <span>Kill</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title="Confirm Process Termination"
        message={`Are you sure you want to dispatch SIGTERM to terminate PID ${modalState.pid} (${modalState.agentName})? This will immediately halt all task execution and release associated resources.`}
        confirmText="Terminate Process"
        onConfirm={confirmTermination}
        onCancel={() => setModalState({ isOpen: false, pid: null, action: null, agentName: '' })}
      />
    </div>
  );
}
