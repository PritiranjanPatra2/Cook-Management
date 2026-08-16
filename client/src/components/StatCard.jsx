import React from 'react';

export default function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  accentColor = '#7C5CFC',
  bgColor = 'var(--bg-surface-elevated)',
  extraBadge
}) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `3px solid ${accentColor}`,
        backgroundColor: bgColor
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.15, marginTop: '0.25rem' }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: `${accentColor}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              flexShrink: 0
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>
          {subValue || '—'}
        </span>
        {extraBadge && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: `${accentColor}20`,
              color: accentColor
            }}
          >
            {extraBadge}
          </span>
        )}
      </div>
    </div>
  );
}
