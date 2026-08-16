import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const bgColors = {
    success: '#ecfdf5',
    error: '#fef2f2',
    info: '#eff6ff'
  };

  const borderColors = {
    success: '#a7f3d0',
    error: '#fecaca',
    info: '#bfdbfe'
  };

  const textColors = {
    success: '#047857',
    error: '#b91c1c',
    info: '#1d4ed8'
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
  };

  const Icon = icons[type] || CheckCircle2;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        backgroundColor: bgColors[type],
        border: `1px solid ${borderColors[type]}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <Icon size={18} color={textColors[type]} />
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: textColors[type] }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: textColors[type],
            marginLeft: '0.5rem'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
