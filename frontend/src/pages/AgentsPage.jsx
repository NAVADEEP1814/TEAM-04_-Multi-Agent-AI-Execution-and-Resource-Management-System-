import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { Bot, Pause, Play, XCircle, Search, Filter, HardDrive, Cpu, Network, Clock } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, pid: null, agentName: '' });

  const fetchAgents = async () => {
    try {
      const res = await api.getAgents();
      setAgents(res.agents || []);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSignal = async (pid, sig) => {
    try {
      await api.sendProcessSignal(pid, sig);
      await fetchAgents();
    } catch (err) {
      alert(`Signal failed: ${err.message}`);
    }
  };

  const confirmKill = async () => {
    if (modalState.pid) {
      await handleSignal(modalState.pid, 'SIGTERM');
      setModalState({ isOpen: false, pid: null, agentName: '' });
    }
  };

  const filteredAgents = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                          a.id.toLowerCase().includes(search.toLowerCase()) ||
                          String(a.pid).includes(search);
    const matchesFilter = filterState === 'ALL' || a.status === filterState;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Agent Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Linux POSIX multi-agent process control & lifecycle administration
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name, ID, or PID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '34px', width: '240px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="form-select"
            style={{ width: '160px' }}
          >
            <option value="ALL">All States</option>
            <option value="RUNNING">RUNNING</option>
            <option value="STOPPED">STOPPED</option>
            <option value="RESOURCE LIMIT EXCEEDED">EXCEEDED</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-glow)',
                  color: 'var(--accent)'
                }}>
                  <Bot size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {agent.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {agent.id} • {agent.type}
                  </span>
                </div>
              </div>

              <StatusBadge status={agent.status} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>PID</div>
                <div className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {agent.pid}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>PRIORITY (NICE)</div>
                <div className="font-mono" style={{ fontWeight: 600 }}>
                  {agent.priority}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>CPU USAGE</div>
                <div className="font-mono" style={{
                  fontWeight: 600,
                  color: agent.cpu > agent.cpu_limit ? 'var(--status-critical)' : 'var(--text-primary)'
                }}>
                  {agent.cpu}% <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {agent.cpu_limit}%</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>MEMORY RSS</div>
                <div className="font-mono" style={{
                  fontWeight: 600,
                  color: agent.memory_mb > agent.memory_limit_mb ? 'var(--status-critical)' : 'var(--text-primary)'
                }}>
                  {agent.memory_mb} MB <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {agent.memory_limit_mb}MB</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Network size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span className="font-mono" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.fifo_channel}
                </span>
              </div>

              <div style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Task:</strong> {agent.task}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                <Clock size={12} />
                <span>Last Activity: {agent.last_activity}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-color)',
              marginTop: 'auto'
            }}>
              {agent.status === 'RUNNING' ? (
                <button
                  onClick={() => handleSignal(agent.pid, 'SIGSTOP')}
                  className="btn btn-warning btn-sm"
                  style={{ flex: 1 }}
                >
                  <Pause size={14} />
                  <span>Pause (SIGSTOP)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSignal(agent.pid, 'SIGCONT')}
                  className="btn btn-success btn-sm"
                  style={{ flex: 1 }}
                >
                  <Play size={14} />
                  <span>Resume (SIGCONT)</span>
                </button>
              )}

              <button
                onClick={() => setModalState({ isOpen: true, pid: agent.pid, agentName: agent.name })}
                className="btn btn-danger btn-sm"
                style={{ flex: 1 }}
              >
                <XCircle size={14} />
                <span>Kill (SIGTERM)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title="Confirm Process Termination"
        message={`Are you sure you want to terminate PID ${modalState.pid} (${modalState.agentName})? This will send POSIX SIGTERM to the process.`}
        confirmText="Terminate Process"
        onConfirm={confirmKill}
        onCancel={() => setModalState({ isOpen: false, pid: null, agentName: '' })}
      />
    </div>
  );
}
