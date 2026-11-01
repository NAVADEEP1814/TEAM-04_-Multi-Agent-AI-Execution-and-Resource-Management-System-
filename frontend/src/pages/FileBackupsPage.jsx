import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Archive, Download, RotateCcw, Eye, ShieldCheck, Plus, RefreshCw } from 'lucide-react';

export default function FileBackupsPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewBackup, setPreviewBackup] = useState(null);
  const [createFile, setCreateFile] = useState('./workspace/main.c');
  const [createAgent, setCreateAgent] = useState('agent_01');

  const fetchBackups = async () => {
    try {
      const res = await api.getBackups();
      setBackups(res.backups || []);
    } catch (err) {
      console.error('Failed to load backups:', err);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createBackup(createFile, createAgent);
      alert(`Backup created successfully for ${createFile}`);
      await fetchBackups();
    } catch (err) {
      alert(`Backup creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId) => {
    if (!window.confirm('Are you sure you want to restore this file to the workspace? Any uncommitted changes will be replaced.')) return;
    try {
      const res = await api.restoreBackup(backupId);
      alert(res.message);
      await fetchBackups();
    } catch (err) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            File Backup & Recovery Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Automated snapshot generation, SHA-256 integrity verification, and safe workspace restoration
          </p>
        </div>

        <button onClick={fetchBackups} className="btn btn-secondary">
          <RefreshCw size={15} />
          <span>Refresh Backups</span>
        </button>
      </div>

      {/* Manual Backup Trigger Card */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Trigger Secure File Snapshot
          </h2>
        </div>

        <form onSubmit={handleCreateBackup} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="backup-file">Target Workspace File</label>
            <select
              id="backup-file"
              className="form-select font-mono"
              value={createFile}
              onChange={(e) => setCreateFile(e.target.value)}
            >
              <option value="./workspace/main.c">./workspace/main.c</option>
              <option value="./workspace/config.json">./workspace/config.json</option>
              <option value="./workspace/agent_task.py">./workspace/agent_task.py</option>
              <option value="./workspace/dataset.txt">./workspace/dataset.txt</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="backup-agent">Initiating Agent</label>
            <select
              id="backup-agent"
              className="form-select"
              value={createAgent}
              onChange={(e) => setCreateAgent(e.target.value)}
            >
              <option value="agent_01">Agent 01 - Code Generator</option>
              <option value="agent_02">Agent 02 - Code Executor</option>
              <option value="agent_03">Agent 03 - Code Reviewer</option>
              <option value="agent_04">Agent 04 - Testing Agent</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '10px' }}>
            <Plus size={16} />
            <span>CREATE BACKUP SNAPSHOT</span>
          </button>
        </form>
      </div>

      {/* Backups Table */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Backup Archive Registry
        </h2>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Original File</th>
                <th>Backup File Path</th>
                <th>Modified By</th>
                <th>Timestamp</th>
                <th>SHA-256 Checksum</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No backup records available.
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {b.original_file}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                      {b.backup_file}
                    </td>
                    <td>{b.modified_by}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {b.timestamp}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                      {b.file_hash.substring(0, 16)}...
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setPreviewBackup(b)}
                          className="btn btn-secondary btn-sm"
                          title="View Snapshot Details"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleRestore(b.id)}
                          className="btn btn-warning btn-sm"
                          title="Restore to Workspace"
                        >
                          <RotateCcw size={13} />
                          <span>Restore</span>
                        </button>

                        <a
                          href={api.downloadBackupUrl(b.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Download Snapshot"
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewBackup && (
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
          <div className="glass-card" style={{ maxWidth: '560px', width: '100%', backgroundColor: 'var(--bg-card-solid)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Snapshot Metadata: {previewBackup.id}
              </h3>
              <button onClick={() => setPreviewBackup(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target:</span> <strong className="font-mono">{previewBackup.original_file}</strong>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Snapshot Archive:</span> <span className="font-mono" style={{ color: 'var(--accent)' }}>{previewBackup.backup_file}</span>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Full SHA-256 Hash:</span>
                <div className="font-mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all', marginTop: '4px' }}>
                  {previewBackup.file_hash}
                </div>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Modified By:</span> {previewBackup.modified_by} at {previewBackup.timestamp}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
