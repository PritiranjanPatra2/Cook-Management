import React, { useState, useEffect } from 'react';
import {
  CalendarDays, CheckCircle2, XCircle, Clock, HelpCircle,
  ChevronRight, Award, TrendingUp, Sun, Moon
} from 'lucide-react';
import QuickEntryCard from '../components/QuickEntryCard';
import AttendanceChart from '../components/AttendanceChart';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EditShiftModal from '../components/EditShiftModal';
import { reportService } from '../services/reportService';
import { shiftService } from '../services/shiftService';
import { dishService } from '../services/dishService';
import { formatDate, formatDateShort, toYYYYMMDD } from '../utils/dateUtils';
import { MONTH_NAMES } from '../utils/constants';

export default function Dashboard({ onNavigate, cookName = 'Cook', trackingStartDate }) {
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [recentShifts, setRecentShifts] = useState([]);
  const [todayShifts, setTodayShifts] = useState({ morning: null, evening: null });
  const [dishes, setDishes] = useState([]);
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const todayDateStr = toYYYYMMDD(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dishesRes, monthRes, shiftsRes, todayRes] = await Promise.all([
        dishService.getDishes({ activeOnly: 'true' }),
        reportService.getMonthReport(month, year),
        shiftService.getShifts({ month, year }),
        reportService.getDayReport(todayDateStr)
      ]);
      if (dishesRes.success) setDishes(dishesRes.data);
      if (monthRes.success) setReportData(monthRes.data);
      if (shiftsRes.success) setRecentShifts(shiftsRes.data.slice(0, 8));
      if (todayRes.success) setTodayShifts(todayRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  if (loading && !reportData) return <LoadingSpinner text="Loading dashboard..." />;

  const expectedShifts = reportData?.expectedShifts || 0;
  const presentCount  = reportData?.presentCount  || 0;
  const leaveCount    = reportData?.leaveCount    || 0;
  const lateCount     = reportData?.lateCount     || 0;
  const notRecorded   = reportData?.notRecorded   || 0;
  const attendancePct = reportData?.attendancePercentage || 0;

  return (
    <div className="fade-in">

      {/* Period Header Card */}
      <div className="card" style={{ marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124, 92, 252, 0.15)', border: '1px solid rgba(124, 92, 252, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarDays size={18} color="var(--highlight)" />
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Period</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {MONTH_NAMES[month - 1]} {year}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            <button className="date-nav-btn" onClick={handlePrevMonth} style={{ padding: '0.35rem 0.55rem' }} title="Previous Month">
              ‹ Prev
            </button>
            <button className="date-nav-btn date-nav-today" onClick={() => setCurrentDate(new Date())} style={{ padding: '0.35rem 0.6rem' }}>
              Today
            </button>
            <button className="date-nav-btn" onClick={handleNextMonth} style={{ padding: '0.35rem 0.55rem' }} title="Next Month">
              Next ›
            </button>
          </div>
        </div>

        {/* View Mode Segmented Bar - Full Width & Perfectly Centered */}
        <div
          className="tab-group"
          style={{
            display: 'flex',
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-full)',
            padding: '3px',
            border: '1px solid var(--border)'
          }}
        >
          {['day', 'week', 'month'].map(m => (
            <button
              key={m}
              className={`tab-btn ${viewMode === m ? 'active' : ''}`}
              onClick={() => setViewMode(m)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.45rem 0',
                fontSize: '0.8125rem',
                fontWeight: viewMode === m ? 700 : 600
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Grid (2×2) */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(124, 92, 252, 0.15)', border: '1px solid rgba(124, 92, 252, 0.3)' }}>
            <CalendarDays size={18} color="var(--highlight)" />
          </div>
          <div className="stat-card-value">{expectedShifts}</div>
          <div className="stat-card-label">Expected Shifts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <CheckCircle2 size={18} color="#22C55E" />
          </div>
          <div className="stat-card-value" style={{ color: '#22C55E' }}>{presentCount}</div>
          <div className="stat-card-label">Present Shifts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <XCircle size={18} color="#EF4444" />
          </div>
          <div className="stat-card-value" style={{ color: '#EF4444' }}>{leaveCount}</div>
          <div className="stat-card-label">Leave Shifts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(34, 211, 238, 0.15)', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
            <TrendingUp size={18} color="#22D3EE" />
          </div>
          <div className="stat-card-value" style={{ color: '#22D3EE' }}>{attendancePct}%</div>
          <div className="stat-card-label">Attendance Rate</div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem', border: '1px solid var(--border)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={16} color="var(--highlight)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--highlight)' }}>{lateCount}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Late Shifts</div>
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem', border: '1px solid var(--border)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HelpCircle size={16} color="var(--text-muted)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>{notRecorded}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Not Recorded</div>
          </div>
        </div>
      </div>

      {/* Quick Entry Card */}
      <div className="section-label">Today's Entry</div>
      <QuickEntryCard
        todayDate={new Date()}
        morningShift={todayShifts.morning}
        eveningShift={todayShifts.evening}
        onRefresh={fetchData}
        onOpenFullEntry={() => onNavigate('daily-entry')}
      />

      {/* Attendance Chart */}
      <div className="section-label" style={{ marginTop: '0.25rem' }}>Attendance Breakdown</div>
      <AttendanceChart
        present={presentCount}
        leave={leaveCount}
        late={lateCount}
        notRecorded={notRecorded}
        attendancePercentage={attendancePct}
      />

      {/* Recent Entries */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', marginTop: '0.25rem' }}>
        <span className="section-label" style={{ margin: 0 }}>Recent Entries</span>
        <button onClick={() => onNavigate('attendance')} className="btn btn-secondary btn-sm">
          View All <ChevronRight size={12} />
        </button>
      </div>

      <div className="card" style={{ padding: '0.75rem' }}>
        {recentShifts.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No shifts recorded yet for this month.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentShifts.map(shift => (
              <div
                key={shift._id}
                onClick={() => { setSelectedShiftForEdit(shift); setIsEditModalOpen(true); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-subtle)', cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1rem' }}>{shift.shift === 'morning' ? '🌅' : '🌙'}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {formatDateShort(shift.dateString || shift.date)}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {shift.shift} Shift
                    </div>
                  </div>
                </div>
                <StatusBadge status={shift.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Dishes */}
      {(reportData?.foodRanking || []).length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', marginTop: '0.25rem' }}>
            <span className="section-label" style={{ margin: 0 }}>Top Dishes This Month</span>
            <button onClick={() => onNavigate('food-analysis')} className="btn btn-secondary btn-sm">
              Analysis <ChevronRight size={12} />
            </button>
          </div>
          <div className="card" style={{ padding: '0.875rem' }}>
            {reportData.foodRanking.slice(0, 5).map((food, idx) => (
              <div key={food.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: idx < 4 ? '1px solid var(--border)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : idx === 1 ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${idx === 0 ? 'rgba(245, 158, 11, 0.4)' : idx === 1 ? 'rgba(167, 139, 250, 0.4)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800,
                    color: idx === 0 ? '#F59E0B' : idx === 1 ? 'var(--highlight)' : 'var(--text-muted)'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{food.name}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--highlight)' }}>{food.count}×</span>
              </div>
            ))}
          </div>
        </>
      )}

      <EditShiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shift={selectedShiftForEdit}
        dishes={dishes}
        onDishCreated={nd => setDishes(p => [...p, nd])}
        onShiftSaved={fetchData}
        onShiftDeleted={fetchData}
      />
    </div>
  );
}
