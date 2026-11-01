import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Lock, Unlock, Users, ShieldAlert, Zap, RefreshCw } from 'lucide-react';

export default function SynchronizationPage() {
  const [locks, setLocks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('agent_02');
  const [selectedFile, setSelectedFile] = useState('./workspace/main.c');
  const [loading, setLoading] = useState(false);

  const fetchLocks = async () => {
    try {
      const [lockRes, agRes] = await Promise.all([
        api.getLocks(),
        api.getAgents()
      ]);
      setLocks(lockRes.locks || []);
      setAgents(agRes.agents || []);
    } catch (err) {
      console.error('Failed to load locks:', err);
    }
  };

  useEffect(() => {
    fetchLocks();
    const interval = setInterval(fetchLocks, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleAcquire = async () => {
    setLoading(true);
    try {
      const res = await api.acquireLock(selectedFile, selectedAgent);
      alert(res.message);
      await fetchLocks();
    } catch (err) {
      alert(`Lock acquire error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (filePath, agentId) => {
    setLoading(true);
    try {
      const res = await api.releaseLock(filePath, agentId);
      alert(res.message);
      await fetchLocks();
    } catch (err) {
      alert(`Lock release error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateContention = async () => {
    setLoading(true);
    try {
      const res = await api.simulateContention();
      alert(res.message);
      await fetchLocks();
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Process Synchronization & File Mutex Locks
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            POSIX file locking (fcntl / flock) demonstrating mutual exclusion and race condition prevention
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSimulateContention}
            disabled={loading}
            className="btn btn-warning"
          >
            <Zap size={16} />
            <span>Simulate Contention Scenario</span>
          </button>

          <button onClick={fetchLocks} className="btn btn-secondary">
            <RefreshCw size={15} />
            <span>Refresh Locks</span>
          </button>
        </div>
      </div>

      {/* Conceptual Explanation Card */}
      <div className="glass-card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Operating System Concept: Mutual Exclusion (Mutex)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          When multiple concurrent agent processes (e.g. Code Generator and Code Executor) attempt to write to the same file simultaneously (e.g. <code>main.c</code>), an uncoordinated race condition would corrupt the file data. The OS kernel enforces <strong>mutual exclusion</strong> using file lock primitives (<code>fcntl()</code> with <code>F_SETLK</code>). Any subsequent agent attempting to acquire an already locked file is placed in a synchronized FIFO wait queue until the current lock owner releases it.
        </p>
      </div>

      {/* Interactive Lock Controls */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Manual Lock Management Console
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sync-file">Target Shared File</label>
            <select
              id="sync-file"
              className="form-select font-mono"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              <option value="./workspace/main.c">./workspace/main.c</option>
              <option value="./workspace/config.json">./workspace/config.json</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sync-agent">Requesting Agent</label>
            <select
              id="sync-agent"
              className="form-select"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleAcquire}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px' }}
            >
              <Lock size={15} />
              <span>Acquire Lock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shared Locks Table */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Shared Resource Mutex Table
        </h2>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Shared File</th>
                <th>Lock Status</th>
                <th>Current Owner Agent</th>
                <th>Waiting Queue</th>
                <th>Acquired Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locks.map((lk) => (
                <tr key={lk.file_name}>
                  <td className="font-mono" style={{ fontWeight: 600, color: 'var(--accent)' }}>
                    {lk.file_path}
                  </td>
                  <td>
                    {lk.is_locked ? (
                      <span className="badge badge-locked">
                        <Lock size={12} />
                        LOCKED
                      </span>
                    ) : (
                      <span className="badge badge-running">
                        <Unlock size={12} />
                        UNLOCKED
                      </span>
                    )}
                  </td>
                  <td>
                    {lk.is_locked ? (
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lk.current_owner}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None (Free)</span>
                    )}
                  </td>
                  <td>
                    {lk.waiting_queue?.length > 0 ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {lk.waiting_queue.map((agId, idx) => (
                          <span key={idx} className="badge badge-waiting" style={{ fontSize: '0.7rem' }}>
                            {agId} (Pos {idx + 1})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Empty (No Contention)</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {lk.locked_at || '—'}
                  </td>
                  <td>
                    {lk.is_locked ? (
                      <button
                        onClick={() => handleRelease(lk.file_path, lk.current_owner)}
                        className="btn btn-warning btn-sm"
                      >
                        <Unlock size={13} />
                        <span>Release Lock ({lk.current_owner})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelectedFile(lk.file_path); handleAcquire(); }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Lock size={13} />
                        <span>Acquire Lock</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
