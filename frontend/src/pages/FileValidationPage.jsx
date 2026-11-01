import React, { useState } from 'react';
import { api } from '../services/api';
import { FileCheck2, CheckCircle2, XCircle, ArrowRight, Shield, Play } from 'lucide-react';

export default function FileValidationPage() {
  const [agentId, setAgentId] = useState('agent_01');
  const [path, setPath] = useState('./workspace/main.c');
  const [operation, setOperation] = useState('READ');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.validateFileAccess(agentId, path, operation);
      setResult(res);
    } catch (err) {
      alert(`Validation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setSamplePath = (p, op) => {
    setPath(p);
    if (op) setOperation(op);
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          File Access Validation Engine
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Step-by-step kernel validation pipeline preventing path traversal, symlink escapes, and unauthorized I/O
        </p>
      </div>

      {/* Interactive Test Runner */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Shield size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Interactive Security Validator
          </h2>
        </div>

        <form onSubmit={handleValidate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="val-agent">Requesting Agent</label>
              <select
                id="val-agent"
                className="form-select"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                <option value="agent_01">Agent 01 - Code Generator</option>
                <option value="agent_02">Agent 02 - Code Executor</option>
                <option value="agent_03">Agent 03 - Code Reviewer</option>
                <option value="agent_04">Agent 04 - Testing Agent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="val-op">Requested Operation</label>
              <select
                id="val-op"
                className="form-select"
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
              >
                <option value="READ">READ</option>
                <option value="WRITE">WRITE</option>
                <option value="CREATE">CREATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="val-path">Target File Path</label>
              <input
                id="val-path"
                type="text"
                className="form-input font-mono"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="./workspace/main.c"
                required
              />
            </div>
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Test Cases:</span>
            <button
              type="button"
              onClick={() => setSamplePath('./workspace/main.c', 'READ')}
              className="btn btn-secondary btn-sm"
            >
              Valid: ./workspace/main.c (READ)
            </button>
            <button
              type="button"
              onClick={() => setSamplePath('../../etc/passwd', 'READ')}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--status-critical)' }}
            >
              Traversal Attack: ../../etc/passwd
            </button>
            <button
              type="button"
              onClick={() => setSamplePath('/etc/shadow', 'READ')}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--status-critical)' }}
            >
              Restricted Dir: /etc/shadow
            </button>
            <button
              type="button"
              onClick={() => setSamplePath('./workspace/config.json', 'WRITE')}
              className="btn btn-secondary btn-sm"
            >
              Valid: ./workspace/config.json (WRITE)
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <Play size={16} />
            <span>{loading ? 'Evaluating Security Rules...' : 'VALIDATE & EXECUTE PIPELINE'}</span>
          </button>
        </form>
      </div>

      {/* Visual Pipeline Results */}
      {result && (
        <div className="glass-card" style={{
          borderColor: result.allowed ? 'var(--status-healthy)' : 'var(--status-critical)',
          boxShadow: result.allowed ? '0 0 20px rgba(16, 185, 129, 0.15)' : '0 0 20px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {result.allowed ? (
                <CheckCircle2 size={24} style={{ color: 'var(--status-healthy)' }} />
              ) : (
                <XCircle size={24} style={{ color: 'var(--status-critical)' }} />
              )}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {result.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED: VIOLATION BLOCKED'}
              </h3>
            </div>

            <span className={`badge ${result.allowed ? 'badge-allowed' : 'badge-denied'}`}>
              {result.allowed ? 'AUTHORIZED' : 'SECURITY ALERT'}
            </span>
          </div>

          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-primary)',
            marginBottom: '20px',
            fontSize: '0.875rem'
          }}>
            <strong style={{ color: 'var(--text-muted)' }}>Verdict:</strong>{' '}
            <span style={{ color: result.allowed ? 'var(--status-healthy)' : 'var(--status-critical)', fontWeight: 600 }}>
              {result.reason}
            </span>
          </div>

          {/* 6-step visual pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.pipeline?.map((step, idx) => {
              const isPassed = step.status === 'PASSED' || step.status === 'ALLOWED' || step.status === 'LOGGED';
              const isFailed = step.status === 'FAILED' || step.status === 'BLOCKED' || step.status === 'DENIED';

              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: isFailed ? 'rgba(239, 68, 68, 0.08)' : (isPassed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'),
                  border: `1px solid ${isFailed ? 'rgba(239, 68, 68, 0.3)' : (isPassed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)')}`
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: isFailed ? 'var(--status-critical)' : (isPassed ? 'var(--status-healthy)' : 'var(--text-muted)'),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {step.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isFailed ? 'var(--status-critical)' : 'var(--text-secondary)' }}>
                      {step.detail}
                    </div>
                  </div>

                  <span className={`badge ${isPassed ? 'badge-running' : (isFailed ? 'badge-terminated' : 'badge-waiting')}`}>
                    {step.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
