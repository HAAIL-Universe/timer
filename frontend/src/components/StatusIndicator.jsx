import React from 'react';

export default function StatusIndicator({ status }) {
  const isRunning = status === 'running';
  const statusText = isRunning ? 'Running' : 'Stopped';
  const statusStyle = {
    display: 'inline-block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: isRunning ? '#10B981' : '#6B7280',
    marginBottom: '1rem',
    letterSpacing: '0.5px',
  };

  return <div style={statusStyle}>{statusText}</div>;
}
