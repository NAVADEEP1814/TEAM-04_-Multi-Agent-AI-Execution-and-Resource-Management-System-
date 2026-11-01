import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Activity, AlertTriangle, Radio, Pause, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function ResourceMonitorPage() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [violations, setViolations] = useState([]);

  const fetchResourceData = async () => {
    try {
      const [currRes, histRes, violRes] = await Promise.all([
        api.getCurrentResources(),
        api.getResourceHistory(),
        api.getResourceViolations()
      ]);
      setCurrent(currRes);
      setHistory(histRes.history || []);
      setViolations(violRes.violations || []);
    } catch (err) {
      console.error('Failed to load resource data:', err);
    }
  };

  useEffect(() => {
    fetchResourceData();
    const interval = setInterval(fetchResourceData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleStopViolator = async (pid) => {
    try {
      await api.sendProcessSignal(pid, 'SIGSTOP');
      alert(`kill(${pid}, SIGSTOP) dispatched. Process suspended.`);
      await fetchResourceData();
    } catch (err) {
      alert(`Signal failed: ${err.message}`);
    }
  };

  const agentComparisonData = (current?.agents || []).map(a => ({
    name: a.id,
    fullName: a.name,
    cpu: a.cpu,
    cpuLimit: a.cpu_limit,
    memory: a.memory_mb,
    memoryLimit: a.memory_limit_mb
  }));

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Resource Monitor & Limit Enforcement
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time CPU and Memory accounting with kernel threshold enforcement
          </p>
        </div>

        <button onClick={fetchResourceData} className="btn btn-secondary">
          <RefreshCw size={15} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Violations Alert Banner if any */}
      {violations.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-warning)', fontWeight: 700 }}>
            <AlertTriangle size={20} />
            <span>RESOURCE LIMIT EXCEEDED - OPERATOR INTERVENTION REQUIRED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {violations.map((v, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-card-solid)',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{v.agent_name}</strong> (PID: {v.pid})
                  exceeded {v.type} limit: <span style={{ color: 'var(--status-critical)', fontWeight: 700 }}>{v.current}{v.unit}</span> / {v.limit}{v.unit}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleStopViolator(v.pid)}
                    className="btn btn-warning btn-sm"
                  >
                    <Pause size={13} />
                    <span>SEND SIGSTOP</span>
                  </button>
                  <button
                    onClick={() => handleStopViolator(v.pid)}
                    className="btn btn-danger btn-sm"
                  >
                    <span>STOP PROCESS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row 1: Time Series */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* CPU Usage vs Time */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            CPU Usage vs Time (%)
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-solid)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend />
                <Line type="monotone" dataKey="cpu_usage" name="Total CPU %" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="agent_01_cpu" name="Agent 01" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="agent_02_cpu" name="Agent 02" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage vs Time */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Memory Usage vs Time (GB)
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 8]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-solid)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend />
                <Line type="monotone" dataKey="memory_gb" name="Used Memory (GB)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Agent Comparisons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Agent CPU Comparison */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Agent CPU Comparison vs Limits (%)
          </h2>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={agentComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-solid)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend />
                <Bar dataKey="cpu" name="Current CPU %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpuLimit" name="Configured Limit %" fill="rgba(245, 158, 11, 0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Memory Comparison */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Agent Memory Comparison vs Limits (MB)
          </h2>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={agentComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-solid)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend />
                <Bar dataKey="memory" name="Current Memory (MB)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="memoryLimit" name="Configured Limit (MB)" fill="rgba(239, 68, 68, 0.6)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agents Resource Limits Table */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Agent Resource Quotas & Threshold Status
        </h2>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Status</th>
                <th>Current CPU</th>
                <th>CPU Limit</th>
                <th>Current Memory</th>
                <th>Memory Limit</th>
                <th>Threshold Result</th>
              </tr>
            </thead>
            <tbody>
              {(current?.agents || []).map((ag) => {
                const isCpuExceeded = ag.cpu > ag.cpu_limit;
                const isMemExceeded = ag.memory_mb > ag.memory_limit_mb;
                const isExceeded = isCpuExceeded || isMemExceeded;

                return (
                  <tr key={ag.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ag.name}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{ag.id}</div>
                    </td>
                    <td>
                      <StatusBadge status={ag.status} />
                    </td>
                    <td className="font-mono" style={{ color: isCpuExceeded ? 'var(--status-critical)' : 'inherit', fontWeight: 600 }}>
                      {ag.cpu}%
                    </td>
                    <td className="font-mono">{ag.cpu_limit}%</td>
                    <td className="font-mono" style={{ color: isMemExceeded ? 'var(--status-critical)' : 'inherit', fontWeight: 600 }}>
                      {ag.memory_mb} MB
                    </td>
                    <td className="font-mono">{ag.memory_limit_mb} MB</td>
                    <td>
                      {isExceeded ? (
                        <span className="badge badge-warning">
                          LIMIT EXCEEDED
                        </span>
                      ) : (
                        <span className="badge badge-running">
                          WITHIN BOUNDS
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
