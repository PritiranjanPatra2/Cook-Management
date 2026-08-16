import React from 'react';
import { CheckCircle2, XCircle, Clock, HelpCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  present: {
    label: 'Present',
    className: 'present',
    icon: CheckCircle2,
  },
  leave: {
    label: 'Leave',
    className: 'leave',
    icon: XCircle,
  },
  late: {
    label: 'Late',
    className: 'late',
    icon: Clock,
  },
  other: {
    label: 'Other',
    className: 'other',
    icon: AlertCircle,
  },
  unrecorded: {
    label: 'Not Recorded',
    className: 'unrecorded',
    icon: HelpCircle,
  }
};

export default function StatusBadge({ status = 'unrecorded', showIcon = true, size = 'md' }) {
  const config = statusConfig[status] || statusConfig.unrecorded;
  const Icon = config.icon;

  const sizeStyles = {
    sm: { padding: '0.2rem 0.55rem', fontSize: '0.75rem', gap: '0.3rem' },
    md: { padding: '0.3rem 0.7rem', fontSize: '0.8125rem', gap: '0.35rem' },
    lg: { padding: '0.45rem 0.9rem', fontSize: '0.875rem', gap: '0.45rem' }
  };

  return (
    <span
      className={`status-badge ${config.className}`}
      style={sizeStyles[size] || sizeStyles.md}
    >
      {showIcon && <Icon size={size === 'sm' ? 13 : 15} style={{ flexShrink: 0 }} />}
      <span>{config.label}</span>
    </span>
  );
}
