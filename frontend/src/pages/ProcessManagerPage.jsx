import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { Cpu, Eye, Pause, Play, Square, XCircle, RefreshCw, Layers } from 'lucide-react';

export default function ProcessManagerPage() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProc, setSelectedProc] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, pid: null, signal: '', agentName: '' });

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const res = await api.getProcesses();
      setProcesses(res.processes || []);
    } catch (err) {
      console.error('Failed to load processes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSignalClick = (pid, signal, agentName) => {
    if (signal === 'SIGTERM' || signal === 'SIGKILL') {
      setModalConfig({ isOpen: true, pid, signal, agentName });
    } else {
      dispatchSignal(pid, signal);
    }
  };

  const dispatchSignal = async (pid, signal) => {
    try {
      await api.sendProcessSignal(pid, signal);
      await fetchProcesses();
    } catch (err) {
      alert(`Signal dispatch failed: ${err.message}`);
    }
  };

  const confirmModalAction = async () => {
    if (modalConfig.pid) {
      await dispatchSignal(modalConfig.pid, modalConfig.signal);
      setModalConfig({ isOpen: false, pid: null, signal: '', agentName: '' });
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Process Manager
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Linux POSIX process table, CPU/Memory telemetry & kernel signal handling
          </p>
        </div>

        <button onClick={fetchProcesses} className="btn btn-secondary">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* POSIX Process Table */}
      <div className="glass-card">
        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>Agent</th>
                <th>Process Name</th>
                <th>State</th>
                <th>CPU %</th>
                <th>Memory</th>
                <th>Start Time</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p) => (
                <tr key={p.pid}>
                  <td className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {p.pid}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.agent_name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{p.agent_id}</div>
                  </td>
                  <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.process_name}
                  </td>
                  <td>
                    <StatusBadge status={p.state} />
                  </td>
                  <td className="font-mono" style={{ fontWeight: 600 }}>
                    {p.cpu_percent}%
                  </td>
                  <td className="font-mono">
                    {p.memory_mb} MB
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.start_time}
                  </td>
                  <td className="font-mono">
                    {p.priority}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedProc(p)}
                        className="btn btn-secondary btn-sm"
                        title="View Process Hierarchy & Info"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      {p.state === 'RUNNING' ? (
                        <button
                          onClick={() => handleSignalClick(p.pid, 'SIGSTOP', p.agent_name)}
                          className="btn btn-warning btn-sm"
                          title="kill(pid, SIGSTOP)"
                        >
                          <Pause size={13} />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSignalClick(p.pid, 'SIGCONT', p.agent_name)}
                          className="btn btn-success btn-sm"
                          title="kill(pid, SIGCONT)"
                        >
                          <Play size={13} />
                          <span>Resume</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSignalClick(p.pid, 'SIGTERM', p.agent_name)}
                        className="btn btn-danger btn-sm"
                        title="kill(pid, SIGTERM)"
                      >
                        <Square size={13} />
                        <span>Stop</span>
                      </button>

                      <button
                        onClick={() => handleSignalClick(p.pid, 'SIGKILL', p.agent_name)}
                        className="btn btn-danger btn-sm"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                        title="kill(pid, SIGKILL)"
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

      {/* View Process Details Modal */}
      {selectedProc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'var(--bg-card-solid)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Process Inspection: PID {selectedProc.pid}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProc(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Process Name:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{selectedProc.process_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Parent PID (PPID):</span>
                <span className="font-mono">{selectedProc.ppid || 1000}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>State:</span>
                <StatusBadge status={selectedProc.state} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>CPU Utilization:</span>
                <span className="font-mono">{selectedProc.cpu_percent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Resident Memory (VmRSS):</span>
                <span className="font-mono">{selectedProc.memory_mb} MB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dedicated FIFO Channel:</span>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{selectedProc.fifo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>POSIX Signal Handler:</span>
                <span className="font-mono" style={{ fontSize: '0.75rem' }}>sigaction(SIGSTOP, SIGCONT, SIGTERM, SIGKILL)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={`Confirm ${modalConfig.signal}`}
        message={`Are you sure you want to send ${modalConfig.signal} to PID ${modalConfig.pid} (${modalConfig.agentName})? This is an irreversible POSIX signal action.`}
        confirmText={`Dispatch ${modalConfig.signal}`}
        onConfirm={confirmModalAction}
        onCancel={() => setModalConfig({ isOpen: false, pid: null, signal: '', agentName: '' })}
      />
    </div>
  );
}
