import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { MONTH_NAMES } from '../utils/constants';
import { formatDate, formatDateShort, toYYYYMMDD } from '../utils/dateUtils';

export default function DateFilter({
  viewMode, // 'day' | 'week' | 'month'
  setViewMode,
  currentDate, // Date object or ISO string
  setCurrentDate,
  onToday
}) {
  const d = new Date(currentDate);

  const handlePrev = () => {
    const nextDate = new Date(d);
    if (viewMode === 'day') {
      nextDate.setDate(d.getDate() - 1);
    } else if (viewMode === 'week') {
      nextDate.setDate(d.getDate() - 7);
    } else if (viewMode === 'month') {
      nextDate.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(d);
    if (viewMode === 'day') {
      nextDate.setDate(d.getDate() + 1);
    } else if (viewMode === 'week') {
      nextDate.setDate(d.getDate() + 7);
    } else if (viewMode === 'month') {
      nextDate.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(nextDate);
  };

  // Label formatting
  let displayLabel = '';
  if (viewMode === 'day') {
    displayLabel = formatDate(d);
  } else if (viewMode === 'week') {
    const dayOfWeek = d.getDay();
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mon = new Date(d);
    mon.setDate(d.getDate() + distanceToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    displayLabel = `${formatDateShort(mon)} – ${formatDateShort(sun)} ${sun.getFullYear()}`;
  } else {
    // Month
    displayLabel = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '0.875rem 1.25rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Current Title & Period */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}
        >
          <CalendarIcon size={18} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Current Period
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.2 }}>
            {displayLabel}
          </h3>
        </div>
      </div>

      {/* Controls: [Day] [Week] [Month] and [Prev] [Today] [Next] */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
        {/* View Mode Toggle */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            border: '1px solid var(--border)'
          }}
        >
          {['day', 'week', 'month'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0.4rem 0.9rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: viewMode === mode ? '700' : '500',
                backgroundColor: viewMode === mode ? '#ffffff' : 'transparent',
                color: viewMode === mode ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Date Navigation Buttons */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={handlePrev}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem' }}
            title="Previous"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <button
            onClick={onToday}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: '600' }}
          >
            Today
          </button>

          <button
            onClick={handleNext}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem' }}
            title="Next"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
