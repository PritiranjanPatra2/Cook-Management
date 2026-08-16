import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  X
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EditShiftModal from '../components/EditShiftModal';
import { shiftService } from '../services/shiftService';
import { dishService } from '../services/dishService';
import { getCalendarGrid, formatDate, toYYYYMMDD } from '../utils/dateUtils';
import { MONTH_NAMES, DAY_NAMES_SHORT } from '../utils/constants';

export default function CalendarPage({ onNavigate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  const loadShifts = async () => {
    try {
      setLoading(true);
      const [shiftRes, dishRes] = await Promise.all([
        shiftService.getShifts({ month, year }),
        dishService.getDishes()
      ]);
      if (shiftRes.success) setShifts(shiftRes.data);
      if (dishRes.success) setDishes(dishRes.data);
    } catch (err) {
      console.error('Calendar shift fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, [month, year]);

  const handlePrevMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const calendarGrid = getCalendarGrid(year, month);
  const todayStr = toYYYYMMDD(new Date());

  // Helper to find shifts for a specific date
  const getShiftsForDate = (dateString) => {
    const morning = shifts.find((s) => s.dateString === dateString && s.shift === 'morning');
    const evening = shifts.find((s) => s.dateString === dateString && s.shift === 'evening');
    return { morning, evening };
  };

  const handleDayClick = (day) => {
    if (!day.isCurrentMonth || !day.dateString) return;
    const { morning, evening } = getShiftsForDate(day.dateString);
    setSelectedDayInfo({
      dateString: day.dateString,
      date: day.date,
      morning,
      evening
    });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Month Navigator */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Calendar</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {MONTH_NAMES[month - 1]} {year}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button onClick={handlePrevMonth} className="date-nav-btn">
            <ChevronLeft size={14} />
          </button>
          <button onClick={handleToday} className="date-nav-btn date-nav-today">Today</button>
          <button onClick={handleNextMonth} className="date-nav-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Status Dot Legend Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.625rem 0.75rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          fontSize: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="status-dot present" style={{ width: 8, height: 8 }} />
          <span style={{ fontWeight: '600' }}>Present</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="status-dot leave" style={{ width: 8, height: 8 }} />
          <span style={{ fontWeight: '600' }}>Leave</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="status-dot late" style={{ width: 8, height: 8 }} />
          <span style={{ fontWeight: '600' }}>Late</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="status-dot unrecorded" style={{ width: 8, height: 8 }} />
          <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Not Recorded</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• Dot 1 = Morning, Dot 2 = Evening</span>
      </div>

      {loading ? (
        <LoadingSpinner text="Generating calendar view..." />
      ) : (
        /* Calendar Grid */
        <div className="card" style={{ padding: '0.5rem' }}>
          {/* Day of week headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              textAlign: 'center',
              marginBottom: '4px'
            }}
          >
            {DAY_NAMES_SHORT.map((day) => (
              <div
                key={day}
                style={{
                  padding: '4px 0',
                  fontSize: '0.6rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Cells */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px'
            }}
          >
            {calendarGrid.map((day, idx) => {
              if (!day.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      minHeight: '60px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      opacity: 0.25
                    }}
                  />
                );
              }

              const { morning, evening } = getShiftsForDate(day.dateString);
              const isToday = day.dateString === todayStr;

              return (
                <div
                  key={day.dateString}
                  onClick={() => handleDayClick(day)}
                  style={{
                    minHeight: '60px',
                    padding: '5px 2px 4px',
                    borderRadius: '6px',
                    border: `1.5px solid ${isToday ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: isToday ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Day Number */}
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: isToday ? '800' : '600',
                      color: isToday ? 'var(--primary)' : 'var(--text-main)',
                      lineHeight: 1
                    }}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Morning & Evening Dual Dots */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    <span
                      className={`status-dot ${morning?.status || 'unrecorded'}`}
                      style={{ width: '7px', height: '7px', flexShrink: 0 }}
                      title={`Morning: ${morning?.status || 'Not Recorded'}`}
                    />
                    <span
                      className={`status-dot ${evening?.status || 'unrecorded'}`}
                      style={{ width: '7px', height: '7px', flexShrink: 0 }}
                      title={`Evening: ${evening?.status || 'Not Recorded'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Drilldown Modal */}
      {selectedDayInfo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 55,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setSelectedDayInfo(null)}
        >
          <div
            className="card fade-in"
            style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                {formatDate(selectedDayInfo.dateString)}
              </h3>
              <button
                onClick={() => setSelectedDayInfo(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Morning Info */}
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>🌅 Morning Shift</span>
                  <StatusBadge status={selectedDayInfo.morning?.status || 'unrecorded'} size="sm" />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
                  🍲 {selectedDayInfo.morning?.foods?.map((f) => f.name || f).join(', ') || 'No food logged'}
                </p>
                {selectedDayInfo.morning?.reason && (
                  <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>
                    Reason: {selectedDayInfo.morning.reason}
                  </p>
                )}
                {selectedDayInfo.morning?.note && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Note: {selectedDayInfo.morning.note}
                  </p>
                )}
              </div>

              {/* Evening Info */}
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>🌙 Evening Shift</span>
                  <StatusBadge status={selectedDayInfo.evening?.status || 'unrecorded'} size="sm" />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
                  🍲 {selectedDayInfo.evening?.foods?.map((f) => f.name || f).join(', ') || 'No food logged'}
                </p>
                {selectedDayInfo.evening?.reason && (
                  <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>
                    Reason: {selectedDayInfo.evening.reason}
                  </p>
                )}
                {selectedDayInfo.evening?.note && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Note: {selectedDayInfo.evening.note}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <button
                onClick={() => setSelectedDayInfo(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedDayInfo(null);
                  onNavigate('daily-entry');
                }}
                className="btn btn-primary btn-sm"
              >
                <Edit2 size={14} />
                <span>Open in Daily Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      <EditShiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shift={selectedShiftForEdit}
        dishes={dishes}
        onDishCreated={(newDish) => setDishes((prev) => [...prev, newDish])}
        onShiftSaved={loadShifts}
        onShiftDeleted={loadShifts}
      />
    </div>
  );
}
