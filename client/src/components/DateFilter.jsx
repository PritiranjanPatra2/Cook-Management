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
    <div className="card" style={{ marginBottom: '0.875rem' }}>
      {/* Top Row: Period Label + Prev/Today/Next Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}
          >
            <CalendarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Current Period
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {displayLabel}
            </div>
          </div>
        </div>

        {/* Date Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <button
            onClick={handlePrev}
            className="date-nav-btn"
            style={{ padding: '0.35rem 0.55rem' }}
            title="Previous"
          >
            <ChevronLeft size={15} />
            <span>Prev</span>
          </button>

          <button
            onClick={onToday}
            className="date-nav-btn date-nav-today"
            style={{ padding: '0.35rem 0.6rem' }}
          >
            Today
          </button>

          <button
            onClick={handleNext}
            className="date-nav-btn"
            style={{ padding: '0.35rem 0.55rem' }}
            title="Next"
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Full-width Segmented View Mode Tabs */}
      <div
        className="tab-group"
        style={{
          display: 'flex',
          width: '100%',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
          border: '1px solid var(--border)'
        }}
      >
        {['day', 'week', 'month'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`tab-btn ${viewMode === mode ? 'active' : ''}`}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.45rem 0',
              fontSize: '0.8125rem',
              fontWeight: viewMode === mode ? 700 : 600,
              textTransform: 'capitalize'
            }}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}
