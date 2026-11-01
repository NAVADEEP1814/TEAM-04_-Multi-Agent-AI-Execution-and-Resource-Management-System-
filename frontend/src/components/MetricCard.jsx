import React from 'react';

export default function MetricCard({ title, value, subtext, statusType = 'normal', icon: Icon }) {
  let statusColor = 'var(--text-muted)';
  let statusBg = 'transparent';

  if (statusType === 'healthy') {
    statusColor = 'var(--status-healthy)';
    statusBg = 'rgba(16, 185, 129, 0.1)';
  } else if (statusType === 'warning') {
    statusColor = 'var(--status-warning)';
    statusBg = 'rgba(245, 158, 11, 0.1)';
  } else if (statusType === 'critical') {
    statusColor = 'var(--status-critical)';
    statusBg = 'rgba(239, 68, 68, 0.1)';
  } else if (statusType === 'info') {
    statusColor = 'var(--accent)';
    statusBg = 'var(--accent-glow)';
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: statusBg, color: statusColor }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {subtext && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: statusColor, fontWeight: 500 }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
