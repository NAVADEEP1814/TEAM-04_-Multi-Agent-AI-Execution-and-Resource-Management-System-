import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Network, Send, ArrowRight, MessageSquare, RefreshCw } from 'lucide-react';

export default function IpcMonitorPage() {
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendForm, setSendForm] = useState({
    from_agent: 'agent_01',
    to_agent: 'agent_02',
    content: ''
  });

  const fetchIpcData = async () => {
    try {
      const [chRes, msgRes, agRes] = await Promise.all([
        api.getIpcChannels(),
        api.getIpcMessages(),
        api.getAgents()
      ]);
      setChannels(chRes.channels || []);
      setMessages(msgRes.messages || []);
      setAgents(agRes.agents || []);
    } catch (err) {
      console.error('Failed to load IPC data:', err);
    }
  };

  useEffect(() => {
    fetchIpcData();
    const interval = setInterval(fetchIpcData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!sendForm.content.trim()) return;
    setLoading(true);
    try {
      await api.sendIpcMessage(sendForm.from_agent, sendForm.to_agent, sendForm.content);
      setSendForm({ ...sendForm, content: '' });
      await fetchIpcData();
    } catch (err) {
      alert(`IPC send failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            IPC Monitor (Named Pipes / FIFO)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            POSIX mkfifo() named pipe channels, inter-process messaging & buffer telemetry
          </p>
        </div>

        <button onClick={fetchIpcData} className="btn btn-secondary">
          <RefreshCw size={15} />
          <span>Refresh Channels</span>
        </button>
      </div>

      {/* Visual Pipeline Representation */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Inter-Process Communication Pipeline
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '24px 16px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
          gap: '12px'
        }}>
          {/* Agent 01 */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Agent 01
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code Gen</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>/tmp/agent_01_fifo</span>
            <ArrowRight size={20} style={{ color: 'var(--accent)' }} />
          </div>

          {/* Agent 02 */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid #3b82f6',
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Agent 02
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Executor</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>/tmp/agent_02_fifo</span>
            <ArrowRight size={20} style={{ color: '#3b82f6' }} />
          </div>

          {/* Agent 03 */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--status-healthy)',
              color: 'var(--status-healthy)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Agent 03
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reviewer</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>/tmp/agent_03_fifo</span>
            <ArrowRight size={20} style={{ color: 'var(--status-healthy)' }} />
          </div>

          {/* Agent 04 */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--status-warning)',
              color: 'var(--status-warning)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Agent 04
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Testing</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Send Task Interface */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Send Task / Message via FIFO
            </h2>
          </div>

          <form onSubmit={handleSendMessage}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="from-agent">From Agent (Source)</label>
                <select
                  id="from-agent"
                  className="form-select"
                  value={sendForm.from_agent}
                  onChange={(e) => setSendForm({ ...sendForm, from_agent: e.target.value })}
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>{ag.id} ({ag.name})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="to-agent">To Agent (Destination)</label>
                <select
                  id="to-agent"
                  className="form-select"
                  value={sendForm.to_agent}
                  onChange={(e) => setSendForm({ ...sendForm, to_agent: e.target.value })}
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>{ag.id} ({ag.name})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ipc-content">Task Message Payload</label>
              <textarea
                id="ipc-content"
                className="form-textarea"
                rows="3"
                placeholder="e.g. EXECUTE_PIPELINE: Run test suite on /workspace/main.c"
                value={sendForm.content}
                onChange={(e) => setSendForm({ ...sendForm, content: e.target.value })}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              <Send size={16} />
              <span>{loading ? 'Transmitting via FIFO Pipe...' : 'SEND MESSAGE'}</span>
            </button>
          </form>
        </div>

        {/* Message Stream */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Live FIFO Message Buffer
          </h2>

          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No messages sent yet. Use the form to transmit data.
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.825rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      {m.from_agent} → {m.to_agent}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {m.timestamp}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>{m.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FIFO Channels Table */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Registered Named Pipes Table
        </h2>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>FIFO Name</th>
                <th>Source Agent</th>
                <th>Destination Agent</th>
                <th>Status</th>
                <th>Messages Sent</th>
                <th>Messages Received</th>
                <th>Last Message</th>
                <th>Created Time</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => (
                <tr key={ch.fifo_name}>
                  <td className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {ch.fifo_name}
                  </td>
                  <td>{ch.source_agent}</td>
                  <td>{ch.destination_agent}</td>
                  <td>
                    <StatusBadge status={ch.status} />
                  </td>
                  <td className="font-mono">{ch.messages_sent}</td>
                  <td className="font-mono">{ch.messages_received}</td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ch.last_message}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ch.created_time}
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
