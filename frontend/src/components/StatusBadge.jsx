import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const s = String(status || '').toUpperCase();
  let badgeClass = 'badge-stopped';

  if (['RUNNING', 'ACTIVE', 'ALLOWED', 'SUCCESS', 'ONLINE', 'PASSED', 'SECURED'].includes(s)) {
    badgeClass = 'badge-running';
  } else if (['WAITING', 'STANDBY', 'QUEUED'].includes(s)) {
    badgeClass = 'badge-waiting';
  } else if (['WARNING', 'RESOURCE LIMIT EXCEEDED', 'LOW_MEMORY'].includes(s)) {
    badgeClass = 'badge-warning';
  } else if (['TERMINATED', 'DENIED', 'CRITICAL', 'ERROR', 'FAILED'].includes(s)) {
    badgeClass = 'badge-terminated';
  } else if (['BLOCKED', 'LOCKED'].includes(s)) {
    badgeClass = 'badge-blocked';
  }

  const paddingStyle = size === 'sm' ? { padding: '2px 6px', fontSize: '0.7rem' } : {};

  return (
    <span className={`badge ${badgeClass}`} style={paddingStyle}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        display: 'inline-block'
      }} />
      {s}
    </span>
  );
}
