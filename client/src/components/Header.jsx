import React from 'react';
import { Menu, Bell, Settings, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function Header({ title, onOpenSidebar, onNavigate, cookName = 'Cook' }) {
  const todayStr = formatDate(new Date());

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0.875rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {title}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Today's Date Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: 'var(--text-muted)'
          }}
        >
          <CalendarIcon size={14} color="var(--primary)" />
          <span>{todayStr}</span>
        </div>

        {/* Quick New Entry Button */}
        <button
          onClick={() => onNavigate('daily-entry')}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.35rem' }}
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => onNavigate('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
