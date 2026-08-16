import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import DateFilter from '../components/DateFilter';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EditShiftModal from '../components/EditShiftModal';
import Toast from '../components/Toast';
import { shiftService } from '../services/shiftService';
import { dishService } from '../services/dishService';
import { reportService } from '../services/reportService';
import { formatDate, formatDateShort, toYYYYMMDD } from '../utils/dateUtils';
import { STATUS_OPTIONS } from '../utils/constants';

export default function Attendance({ onNavigate }) {
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [dayData, setDayData] = useState({ morning: null, evening: null });
  const [dishes, setDishes] = useState([]);
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const loadData = async () => {
    try {
      setLoading(true);

      // Load dishes
      const dishesRes = await dishService.getDishes();
      if (dishesRes.success) setDishes(dishesRes.data);

      if (viewMode === 'day') {
        const dateStr = toYYYYMMDD(currentDate);
        const res = await reportService.getDayReport(dateStr);
        if (res.success) setDayData(res.data);
      } else if (viewMode === 'week') {
        const dateStr = toYYYYMMDD(currentDate);
        const res = await reportService.getWeekReport(dateStr);
        if (res.success) setWeekData(res.data);
      } else {
        // Month view
        const res = await shiftService.getShifts({ month, year });
        if (res.success) setShifts(res.data);
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewMode, currentDate]);

  const handleEdit = (shift) => {
    setSelectedShiftForEdit(shift);
    setIsEditModalOpen(true);
  };

  // Filtered shifts for month view
  const filteredShifts = shifts.filter((shift) => {
    if (statusFilter !== 'all' && shift.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const foodMatch = shift.foods?.some((f) => (f.name || f).toLowerCase().includes(q));
      const reasonMatch = shift.reason?.toLowerCase().includes(q);
      const noteMatch = shift.note?.toLowerCase().includes(q);
      return foodMatch || reasonMatch || noteMatch;
    }
    return true;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Date Navigation & View Mode */}
      <DateFilter
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        onToday={() => setCurrentDate(new Date())}
      />

      {/* Main Content by View Mode */}
      {loading ? (
        <LoadingSpinner text="Fetching attendance records..." />
      ) : (
        <>
          {/* DAY VIEW */}
          {viewMode === 'day' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Morning */}
              <div className="card" style={{ borderTop: '3px solid #F59E0B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>🌅 Morning Shift</h3>
                  <StatusBadge status={dayData.morning?.status || 'unrecorded'} />
                </div>
                {dayData.morning ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>FOOD PREPARED:</span>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--highlight)' }}>
                        {dayData.morning.foods?.map((f) => f.name || f).join(', ') || 'None recorded'}
                      </p>
                    </div>
                    {dayData.morning.reason && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>REASON:</span>
                        <p style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: '600' }}>{dayData.morning.reason}</p>
                      </div>
                    )}
                    {dayData.morning.note && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>NOTE:</span>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{dayData.morning.note}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleEdit(dayData.morning)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                    >
                      <Edit2 size={14} />
                      <span>Edit Shift</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      No morning shift recorded for this date.
                    </p>
                    <button
                      onClick={() => onNavigate('daily-entry')}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} />
                      <span>Record Morning Shift</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Evening */}
              <div className="card" style={{ borderTop: '3px solid #7C5CFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>🌙 Night Shift</h3>
                  <StatusBadge status={dayData.evening?.status || 'unrecorded'} />
                </div>
                {dayData.evening ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>FOOD PREPARED:</span>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--highlight)' }}>
                        {dayData.evening.foods?.map((f) => f.name || f).join(', ') || 'None recorded'}
                      </p>
                    </div>
                    {dayData.evening.reason && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>REASON:</span>
                        <p style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: '600' }}>{dayData.evening.reason}</p>
                      </div>
                    )}
                    {dayData.evening.note && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>NOTE:</span>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{dayData.evening.note}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleEdit(dayData.evening)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                    >
                      <Edit2 size={14} />
                      <span>Edit Shift</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      No night shift recorded for this date.
                    </p>
                    <button
                      onClick={() => onNavigate('daily-entry')}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} />
                      <span>Record Night Shift</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>7-Day Weekly Attendance Grid</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>DATE / DAY</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>🌅 MORNING SHIFT</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>🌙 NIGHT SHIFT</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>FOOD PREPARED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.map((day) => {
                      const allFoods = [
                        ...(day.morning?.foods || []),
                        ...(day.evening?.foods || [])
                      ];
                      return (
                        <tr
                          key={day.dateString}
                          style={{ borderBottom: '1px solid var(--border)' }}
                        >
                          <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            {formatDateShort(day.dateString)}
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            {day.morning ? (
                              <button
                                onClick={() => handleEdit(day.morning)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                              >
                                <StatusBadge status={day.morning.status} size="sm" />
                              </button>
                            ) : (
                              <StatusBadge status="unrecorded" size="sm" />
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            {day.evening ? (
                              <button
                                onClick={() => handleEdit(day.evening)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                              >
                                <StatusBadge status={day.evening.status} size="sm" />
                              </button>
                            ) : (
                              <StatusBadge status="unrecorded" size="sm" />
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', color: 'var(--highlight)', fontWeight: '600' }}>
                            {allFoods.length > 0
                              ? allFoods.map((f) => f.name || f).join(', ')
                              : <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MONTH VIEW TABLE & MOBILE CARDS */}
          {viewMode === 'month' && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Filter and Search Bar */}
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                {/* Search Input */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search food, reasons, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8125rem',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Status Badges Filter Strip */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.35rem',
                    overflowX: 'auto',
                    paddingBottom: '2px',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <button
                    onClick={() => setStatusFilter('all')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${statusFilter === 'all' ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: statusFilter === 'all' ? 'rgba(124, 92, 252, 0.18)' : 'var(--bg-surface-elevated)',
                      color: statusFilter === 'all' ? 'var(--highlight)' : 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: statusFilter === 'all' ? '700' : '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All ({shifts.length})
                  </button>

                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${isSelected ? opt.borderColor : 'var(--border)'}`,
                          backgroundColor: isSelected ? opt.bgColor : 'var(--bg-surface-elevated)',
                          color: isSelected ? opt.textColor : 'var(--text-secondary)',
                          fontSize: '0.8125rem',
                          fontWeight: isSelected ? '700' : '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Records List / Cards */}
              <div style={{ padding: '0.5rem' }}>
                {filteredShifts.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No shifts matching your filter criteria.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredShifts.map((shift) => (
                      <div
                        key={shift._id}
                        style={{
                          padding: '0.875rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Top Row: Date + Shift + Status + Edit */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '800', fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                              {formatDateShort(shift.dateString || shift.date)}
                            </span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: shift.shift === 'morning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(124, 92, 252, 0.15)',
                                color: shift.shift === 'morning' ? '#F59E0B' : '#A78BFA',
                                border: `1px solid ${shift.shift === 'morning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(124, 92, 252, 0.3)'}`
                              }}
                            >
                              {shift.shift === 'morning' ? '🌅 Morning' : '🌙 Night'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <StatusBadge status={shift.status} size="sm" />
                            <button
                              onClick={() => handleEdit(shift)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              title="Edit Entry"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>

                        {/* Food Prepared */}
                        {shift.foods && shift.foods.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Food:</span>
                            <span style={{ color: 'var(--highlight)', fontWeight: '700' }}>
                              {shift.foods.map((f) => f.name || f).join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Reason & Note */}
                        {(shift.reason || shift.note) && (
                          <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {shift.reason && (
                              <span style={{ color: '#f87171', fontWeight: '700', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1px 6px', borderRadius: '4px' }}>
                                {shift.reason}
                              </span>
                            )}
                            {shift.note && <span>{shift.note}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Shift Modal */}
      <EditShiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shift={selectedShiftForEdit}
        dishes={dishes}
        onDishCreated={(newDish) => setDishes((prev) => [...prev, newDish])}
        onShiftSaved={() => {
          setToast({ message: 'Shift updated successfully!', type: 'success' });
          loadData();
        }}
        onShiftDeleted={() => {
          setToast({ message: 'Shift record deleted', type: 'info' });
          loadData();
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
