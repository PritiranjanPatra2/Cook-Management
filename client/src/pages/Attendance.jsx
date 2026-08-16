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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Morning */}
              <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>🌅 Morning Shift</h3>
                  <StatusBadge status={dayData.morning?.status || 'unrecorded'} />
                </div>
                {dayData.morning ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>FOOD PREPARED:</span>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--primary)' }}>
                        {dayData.morning.foods?.map((f) => f.name || f).join(', ') || 'None recorded'}
                      </p>
                    </div>
                    {dayData.morning.reason && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>REASON:</span>
                        <p style={{ fontSize: '0.875rem', color: '#b91c1c', fontWeight: '600' }}>{dayData.morning.reason}</p>
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
              <div className="card" style={{ borderTop: '4px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>🌙 Evening Shift</h3>
                  <StatusBadge status={dayData.evening?.status || 'unrecorded'} />
                </div>
                {dayData.evening ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>FOOD PREPARED:</span>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--primary)' }}>
                        {dayData.evening.foods?.map((f) => f.name || f).join(', ') || 'None recorded'}
                      </p>
                    </div>
                    {dayData.evening.reason && (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>REASON:</span>
                        <p style={{ fontSize: '0.875rem', color: '#b91c1c', fontWeight: '600' }}>{dayData.evening.reason}</p>
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
                      No evening shift recorded for this date.
                    </p>
                    <button
                      onClick={() => onNavigate('daily-entry')}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} />
                      <span>Record Evening Shift</span>
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
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>7-Day Weekly Attendance Grid</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>DATE / DAY</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>🌅 MORNING SHIFT</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>🌙 EVENING SHIFT</th>
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
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{day.dayName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDateShort(day.dateString)}</div>
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
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
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

          {/* MONTH VIEW TABLE */}
          {viewMode === 'month' && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Filter and Search Bar */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Status Badges Filter */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setStatusFilter('all')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border)',
                      backgroundColor: statusFilter === 'all' ? 'var(--primary)' : 'var(--bg-surface-subtle)',
                      color: statusFilter === 'all' ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    All ({shifts.length})
                  </button>

                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${statusFilter === opt.value ? opt.borderColor : 'var(--border)'}`,
                        backgroundColor: statusFilter === opt.value ? opt.bgColor : 'var(--bg-surface-subtle)',
                        color: statusFilter === opt.value ? opt.textColor : 'var(--text-muted)',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search food, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8125rem',
                      backgroundColor: 'var(--bg-surface-subtle)'
                    }}
                  />
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>DATE</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>SHIFT</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>FOOD PREPARED</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)' }}>REASON / NOTE</th>
                      <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShifts.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No shifts matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredShifts.map((shift) => (
                        <tr
                          key={shift._id}
                          style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '0.875rem 1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {formatDateShort(shift.dateString || shift.date)}
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', fontWeight: '600', textTransform: 'capitalize' }}>
                            {shift.shift === 'morning' ? '🌅 Morning' : '🌙 Evening'}
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <StatusBadge status={shift.status} size="sm" />
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--primary)' }}>
                            {shift.foods && shift.foods.length > 0
                              ? shift.foods.map((f) => f.name || f).join(', ')
                              : '—'}
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {shift.reason ? (
                              <span style={{ color: '#b91c1c', fontWeight: '600' }}>{shift.reason}</span>
                            ) : null}
                            {shift.reason && shift.note ? ' • ' : null}
                            {shift.note ? <span>{shift.note}</span> : null}
                            {!shift.reason && !shift.note ? '—' : null}
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleEdit(shift)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Edit Entry"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
