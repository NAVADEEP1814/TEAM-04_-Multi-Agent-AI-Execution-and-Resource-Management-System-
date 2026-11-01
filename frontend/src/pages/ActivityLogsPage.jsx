import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { FileText, Search, Download, RefreshCw } from 'lucide-react';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (agentFilter) params.agent = agentFilter;
      if (eventFilter) params.event = eventFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.getLogs(params);
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [agentFilter, eventFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Activity & Kernel Logs
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Chronological audit trail of process creation, IPC transfers, signals, and security events
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={api.exportLogsUrl('csv')}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>

          <a
            href={api.exportLogsUrl('json')}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </a>

          <button onClick={fetchLogs} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search details, agent, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
          </div>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="form-select"
            style={{ width: '160px' }}
          >
            <option value="">All Agents</option>
            <option value="KERNEL">KERNEL</option>
            <option value="agent_01">Agent 01</option>
            <option value="agent_02">Agent 02</option>
            <option value="agent_03">Agent 03</option>
            <option value="agent_04">Agent 04</option>
          </select>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="form-select"
            style={{ width: '190px' }}
          >
            <option value="">All Events</option>
            <option value="PROCESS_CREATED">PROCESS_CREATED</option>
            <option value="FIFO_CREATED">FIFO_CREATED</option>
            <option value="MESSAGE_SENT">MESSAGE_SENT</option>
            <option value="FILE_ACCESS_GRANTED">FILE_ACCESS_GRANTED</option>
            <option value="FILE_ACCESS_DENIED">FILE_ACCESS_DENIED</option>
            <option value="RESOURCE_LIMIT_EXCEEDED">RESOURCE_LIMIT_EXCEEDED</option>
            <option value="SIGNAL_SENT">SIGNAL_SENT</option>
            <option value="PROCESS_STOPPED">PROCESS_STOPPED</option>
            <option value="PROCESS_RESUMED">PROCESS_RESUMED</option>
            <option value="BACKUP_CREATED">BACKUP_CREATED</option>
            <option value="PROCESS_TERMINATED">PROCESS_TERMINATED</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '140px' }}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="ALLOWED">ALLOWED</option>
            <option value="DENIED">DENIED</option>
            <option value="WARNING">WARNING</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </div>

      {/* Logs Table */}
      <div className="glass-card">
        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Agent</th>
                <th>PID</th>
                <th>Event</th>
                <th>Operation</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.agent}
                    </td>
                    <td className="font-mono" style={{ color: 'var(--accent)' }}>
                      {log.pid ? log.pid : '—'}
                    </td>
                    <td>
                      <span className="badge badge-waiting font-mono" style={{ fontSize: '0.7rem' }}>
                        {log.event}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {log.operation}
                    </td>
                    <td>
                      <StatusBadge status={log.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '350px' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
