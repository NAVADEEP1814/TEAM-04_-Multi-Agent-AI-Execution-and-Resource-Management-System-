import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock, User, AlertCircle, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Top right theme toggle */}
      <button
        onClick={toggleTheme}
        className="btn btn-secondary btn-sm"
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {isDark ? <Sun size={15} style={{ color: '#fbbf24' }} /> : <Moon size={15} style={{ color: 'var(--accent)' }} />}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      <div className="glass-card" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '36px 32px',
        backgroundColor: 'var(--bg-card-solid)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px'
      }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '12px',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 20px var(--accent-glow)'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            OS Execution Console
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-Agent AI & Resource Management System
          </p>
          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            fontSize: '0.7rem',
            color: 'var(--accent)',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            COURSE: 25CS2104E
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--status-critical)',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Operator Username</label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="off"
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Security Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
          >
            {loading ? 'Authenticating Session...' : 'Authenticate & Enter Console'}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          Protected by POSIX Process Session Layer & JWT HMAC-SHA256
        </div>
      </div>
    </div>
  );
}
