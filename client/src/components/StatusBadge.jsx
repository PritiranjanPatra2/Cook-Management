import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react';

const statusConfig = {
  present: {
    label: 'Present',
    className: 'present',
    icon: CheckCircle2,
    dotColor: 'var(--status-present-dot)'
  },
  leave: {
    label: 'Leave',
    className: 'leave',
    icon: XCircle,
    dotColor: 'var(--status-leave-dot)'
  },
  late: {
    label: 'Late',
    className: 'late',
    icon: Clock,
    dotColor: 'var(--status-late-dot)'
  },
  other: {
    label: 'Other',
    className: 'other',
    icon: HelpCircle,
    dotColor: '#94a3b8'
  },
  unrecorded: {
    label: 'Not Recorded',
    className: 'unrecorded',
    icon: HelpCircle,
    dotColor: 'var(--status-unrecorded-dot)'
  }
};

export default function StatusBadge({ status = 'unrecorded', showIcon = true, size = 'md' }) {
  const config = statusConfig[status] || statusConfig.unrecorded;
  const Icon = config.icon;

  const sizeStyles = {
    sm: { padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' },
    md: { padding: '0.35rem 0.75rem', fontSize: '0.8125rem', gap: '0.35rem' },
    lg: { padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '0.5rem' }
  };

  return (
    <span
      className={`status-badge ${config.className}`}
      style={sizeStyles[size] || sizeStyles.md}
    >
      <span className={`status-dot ${config.className}`} />
      {showIcon && <Icon size={size === 'sm' ? 12 : 14} />}
      <span>{config.label}</span>
    </span>
  );
}
