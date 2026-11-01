import React, { useState } from 'react';
import { api } from '../services/api';
import { PlusCircle, CheckCircle2, Clock, GitFork, ArrowRight, Bot } from 'lucide-react';

export default function CreateProcessPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Code Generator',
    task: '',
    cpu_limit: 50.0,
    memory_limit_mb: 512.0,
    workspace_dir: './workspace'
  });

  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [createdAgent, setCreatedAgent] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeline(null);
    setCreatedAgent(null);

    try {
      const res = await api.createAgent(formData);
      setCreatedAgent(res.agent);
      setTimeline(res.timeline);
      setFormData({
        name: '',
        type: 'Code Generator',
        task: '',
        cpu_limit: 50.0,
        memory_limit_mb: 512.0,
        workspace_dir: './workspace'
      });
    } catch (err) {
      setError(err.message || 'Process creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Create Agent Process
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Spawn a new Linux agent child process via kernel fork(), assign PID, and configure IPC channel
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Creation Form */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <GitFork size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Process Specification
            </h2>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--status-critical)',
              fontSize: '0.825rem',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="agent-name">Agent Name</label>
              <input
                id="agent-name"
                type="text"
                className="form-input"
                placeholder="e.g. Agent 05 - Memory Optimizer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agent-type">Agent Type</label>
              <select
                id="agent-type"
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Code Generator">Code Generator</option>
                <option value="Code Executor">Code Executor</option>
                <option value="Code Reviewer">Code Reviewer</option>
                <option value="Testing Agent">Testing Agent</option>
                <option value="Custom Agent">Custom Agent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Assigned Task</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                rows="2"
                placeholder="e.g. Perform heap profiling and detect memory leaks in main.c"
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cpu-limit">CPU Limit (%)</label>
                <input
                  id="cpu-limit"
                  type="number"
                  min="5"
                  max="100"
                  step="5"
                  className="form-input font-mono"
                  value={formData.cpu_limit}
                  onChange={(e) => setFormData({ ...formData, cpu_limit: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mem-limit">Memory Limit (MB)</label>
                <input
                  id="mem-limit"
                  type="number"
                  min="64"
                  max="2048"
                  step="64"
                  className="form-input font-mono"
                  value={formData.memory_limit_mb}
                  onChange={(e) => setFormData({ ...formData, memory_limit_mb: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="workspace-dir">Restricted Workspace Root</label>
              <input
                id="workspace-dir"
                type="text"
                className="form-input font-mono"
                value={formData.workspace_dir}
                onChange={(e) => setFormData({ ...formData, workspace_dir: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                POSIX Sandbox enforces restricted boundary at ./workspace/
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              <PlusCircle size={16} />
              <span>{loading ? 'Executing fork() in Kernel...' : 'CREATE PROCESS'}</span>
            </button>
          </form>
        </div>

        {/* Timeline and Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {timeline ? (
            <div className="glass-card" style={{ borderColor: 'var(--status-healthy)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--status-healthy)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Process Spawned Successfully: PID {createdAgent?.pid}
                </h3>
              </div>

              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{createdAgent?.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ID: {createdAgent?.id}</div>
                <div className="font-mono" style={{ color: 'var(--accent)', marginTop: '4px' }}>
                  FIFO Channel: {createdAgent?.fifo_channel}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                KERNEL EXECUTION TIMELINE:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {timeline.map((item) => (
                  <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: 'var(--status-healthy)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {item.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {item.action}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        {item.time} • Status: {item.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', minHeight: '300px' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                marginBottom: '16px'
              }}>
                <GitFork size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Linux fork() Process Creation Flow
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.6 }}>
                Submit the form on the left to trigger an API call. The backend will invoke <code>fork()</code>, assign a unique PID, create a named pipe (FIFO) at <code>/tmp/agent_xx_fifo</code>, and register the agent in the process table.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
