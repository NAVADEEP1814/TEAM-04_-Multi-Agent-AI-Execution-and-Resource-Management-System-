import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ShieldCheck, ShieldAlert, Folder, File, RefreshCw } from 'lucide-react';

export default function WorkspaceSecurityPage() {
  const [workspaceFiles, setWorkspaceFiles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchSecurityData = async () => {
    try {
      const [treeRes, auditRes, alertRes] = await Promise.all([
        api.getWorkspaceTree(),
        api.getFileAudits(),
        api.getSecurityAlerts()
      ]);
      setWorkspaceFiles(treeRes.files || []);
      setAuditLogs(auditRes.audits || []);
      setAlerts(alertRes.alerts || []);
    } catch (err) {
      console.error('Failed to load security data:', err);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Workspace Security & Access Control
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            POSIX file access sandboxing, path traversal defense, and security audit telemetry
          </p>
        </div>

        <button onClick={fetchSecurityData} className="btn btn-secondary">
          <RefreshCw size={15} />
          <span>Refresh Audits</span>
        </button>
      </div>

      {/* Security Alerts Banner */}
      {alerts.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-critical)', fontWeight: 700, marginBottom: '12px' }}>
            <ShieldAlert size={20} />
            <span>ACTIVE SECURITY ALERTS: UNAUTHORIZED ACCESS ATTEMPTS BLOCKED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.slice(0, 3).map((al) => (
              <div key={al.id} style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card-solid)',
                fontSize: '0.825rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ color: 'var(--status-critical)', fontWeight: 700 }}>[{al.severity}]</span>{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{al.title}:</span>{' '}
                  <span className="font-mono" style={{ color: 'var(--accent)' }}>{al.path}</span>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>{al.reason}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{al.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authorized Workspace Directory */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Folder size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Authorized Workspace Boundary (<code>./workspace/</code>)
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '14px',
          padding: '16px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          {workspaceFiles.map((f) => (
            <div key={f.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <File size={18} style={{ color: 'var(--accent)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {f.size_bytes} bytes • {f.permissions}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Access Audit Table */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Real-time File Access Audit Log
        </h2>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Agent</th>
                <th>Requested File</th>
                <th>Operation</th>
                <th>Validation Result</th>
                <th>Audit Reason</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.agent}
                  </td>
                  <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                    {log.file}
                  </td>
                  <td>
                    <span className="badge badge-waiting">{log.operation}</span>
                  </td>
                  <td>
                    <StatusBadge status={log.result} />
                  </td>
                  <td style={{ fontSize: '0.8rem', color: log.result === 'DENIED' ? 'var(--status-critical)' : 'var(--text-secondary)' }}>
                    {log.reason}
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
