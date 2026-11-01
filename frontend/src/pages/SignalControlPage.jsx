import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { Radio, Pause, Play, Square, XCircle, Clock, RefreshCw, ShieldAlert } from 'lucide-react';

export default function SignalControlPage() {
  const [processes, setProcesses] = useState([]);
  const [history, setHistory] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, pid: null, signal: '', agentName: '' });

  const fetchSignalData = async () => {
    try {
      const [procRes, histRes] = await Promise.all([
        api.getProcesses(),
        api.getSignalsHistory()
      ]);
      setProcesses(procRes.processes || []);
      setHistory(histRes.history || []);
    } catch (err) {
      console.error('Failed to load signal data:', err);
    }
  };

  useEffect(() => {
    fetchSignalData();
    const interval = setInterval(fetchSignalData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSignalClick = (pid, signal, agentName) => {
    if (signal === 'SIGTERM' || signal === 'SIGKILL') {
      setModalState({ isOpen: true, pid, signal, agentName });
    } else {
      dispatchSignal(pid, signal);
    }
  };

  const dispatchSignal = async (pid, signal) => {
    try {
      await api.sendProcessSignal(pid, signal);
      await fetchSignalData();
    } catch (err) {
      alert(`Signal dispatch failed: ${err.message}`);
    }
  };

  const confirmAction = async () => {
    if (modalState.pid) {
      await dispatchSignal(modalState.pid, modalState.signal);
      setModalState({ isOpen: false, pid: null, signal: '', agentName: '' });
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Signal Control Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            POSIX kill(pid, sig) kernel signal dispatching & process state control
          </p>
        </div>

        <button onClick={fetchSignalData} className="btn btn-secondary">
          <RefreshCw size={15} />
          <span>Refresh Signals</span>
        </button>
      </div>

      {/* Process Cards Grid with Signal Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {processes.map((proc) => (
          <div key={proc.pid} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {proc.agent_name}
                </div>
                <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '2px' }}>
                  PID: {proc.pid} • {proc.process_name}
                </div>
              </div>
              <StatusBadge status={proc.state} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '8px',
              fontSize: '0.775rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>CPU:</span>{' '}
                <span className="font-mono" style={{ fontWeight: 600 }}>{proc.cpu_percent}%</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Memory:</span>{' '}
                <span className="font-mono" style={{ fontWeight: 600 }}>{proc.memory_mb} MB</span>
              </div>
            </div>

            {/* Signal Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
              <button
                onClick={() => handleSignalClick(proc.pid, 'SIGSTOP', proc.agent_name)}
                disabled={proc.state === 'STOPPED' || proc.state === 'TERMINATED'}
                className="btn btn-warning btn-sm"
                title="Pause process via SIGSTOP (19)"
              >
                <Pause size={13} />
                <span>SIGSTOP</span>
              </button>

              <button
                onClick={() => handleSignalClick(proc.pid, 'SIGCONT', proc.agent_name)}
                disabled={proc.state === 'RUNNING' || proc.state === 'TERMINATED'}
                className="btn btn-success btn-sm"
                title="Resume process via SIGCONT (18)"
              >
                <Play size={13} />
                <span>SIGCONT</span>
              </button>

              <button
                onClick={() => handleSignalClick(proc.pid, 'SIGTERM', proc.agent_name)}
                disabled={proc.state === 'TERMINATED'}
                className="btn btn-danger btn-sm"
                title="Gracefully terminate process via SIGTERM (15)"
              >
                <Square size={13} />
                <span>SIGTERM</span>
              </button>

              <button
                onClick={() => handleSignalClick(proc.pid, 'SIGKILL', proc.agent_name)}
                disabled={proc.state === 'TERMINATED'}
                className="btn btn-danger btn-sm"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.35)' }}
                title="Force kill process via SIGKILL (9)"
              >
                <XCircle size={13} />
                <span>SIGKILL</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Signal History Table */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Signal Dispatch Audit History
        </h2>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Target PID</th>
                <th>Agent</th>
                <th>Signal Dispatched</th>
                <th>State Transition</th>
                <th>Result</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No signals dispatched yet. Use the controls above to send POSIX signals.
                  </td>
                </tr>
              ) : (
                history.map((h, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {h.timestamp}
                    </td>
                    <td className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      {h.pid}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {h.agent_id}
                    </td>
                    <td>
                      <span className="badge badge-warning font-mono">
                        {h.signal}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{h.old_state}</span> →{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{h.new_state}</span>
                    </td>
                    <td>
                      <StatusBadge status={h.success ? 'SUCCESS' : 'FAILED'} />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {h.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={`Confirm Dispatch of ${modalState.signal}`}
        message={`Are you sure you want to send destructive signal ${modalState.signal} to PID ${modalState.pid} (${modalState.agentName})?`}
        confirmText={`Send ${modalState.signal}`}
        onConfirm={confirmAction}
        onCancel={() => setModalState({ isOpen: false, pid: null, signal: '', agentName: '' })}
      />
    </div>
  );
}
