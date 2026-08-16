import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  HelpCircle,
  Utensils,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import DateFilter from '../components/DateFilter';
import StatCard from '../components/StatCard';
import QuickEntryCard from '../components/QuickEntryCard';
import AttendanceChart from '../components/AttendanceChart';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EditShiftModal from '../components/EditShiftModal';
import { reportService } from '../services/reportService';
import { shiftService } from '../services/shiftService';
import { dishService } from '../services/dishService';
import { formatDate, formatDateShort, toYYYYMMDD } from '../utils/dateUtils';

export default function Dashboard({ onNavigate, cookName = 'Cook', trackingStartDate }) {
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [recentShifts, setRecentShifts] = useState([]);
  const [todayShifts, setTodayShifts] = useState({ morning: null, evening: null });
  const [dishes, setDishes] = useState([]);
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed
  const todayDateStr = toYYYYMMDD(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch dishes
      const dishesRes = await dishService.getDishes({ activeOnly: 'true' });
      if (dishesRes.success) setDishes(dishesRes.data);

      // Fetch Month Report
      const monthRes = await reportService.getMonthReport(month, year);
      if (monthRes.success) {
        setReportData(monthRes.data);
      }

      // Fetch Recent Shifts (last 10)
      const shiftsRes = await shiftService.getShifts({ month, year });
      if (shiftsRes.success) {
        setRecentShifts(shiftsRes.data.slice(0, 10));
      }

      // Fetch Today's Shifts for Quick Entry
      const todayRes = await reportService.getDayReport(todayDateStr);
      if (todayRes.success) {
        setTodayShifts(todayRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleEditShift = (shift) => {
    setSelectedShiftForEdit(shift);
    setIsEditModalOpen(true);
  };

  if (loading && !reportData) {
    return <LoadingSpinner text="Loading dashboard statistics..." />;
  }

  const expectedShifts = reportData?.expectedShifts || 0;
  const presentCount = reportData?.presentCount || 0;
  const leaveCount = reportData?.leaveCount || 0;
  const lateCount = reportData?.lateCount || 0;
  const notRecorded = reportData?.notRecorded || 0;
  const attendancePercentage = reportData?.attendancePercentage || 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Date Filter & Mode Toggle */}
      <DateFilter
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        onToday={() => setCurrentDate(new Date())}
      />

      {/* Main Top Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem'
        }}
      >
        <StatCard
          title="Expected Shifts"
          value={expectedShifts}
          subValue={`${reportData?.countedDays || 0} days × 2 shifts`}
          icon={CalendarDays}
          accentColor="#6366f1"
        />

        <StatCard
          title="Present"
          value={presentCount}
          subValue={`${presentCount / 2} day equivalent`}
          icon={CheckCircle2}
          accentColor="#10b981"
          extraBadge={lateCount > 0 ? `${lateCount} Late` : null}
        />

        <StatCard
          title="Leave"
          value={leaveCount}
          subValue={`${leaveCount / 2} day equivalent`}
          icon={XCircle}
          accentColor="#ef4444"
        />

        <StatCard
          title="Late Shifts"
          value={lateCount}
          subValue="Present with delay"
          icon={Clock}
          accentColor="#8b5cf6"
        />

        <StatCard
          title="Not Recorded"
          value={notRecorded}
          subValue="Awaiting entry"
          icon={HelpCircle}
          accentColor="#94a3b8"
        />
      </div>

      {/* Quick Entry & Attendance Donut Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* Quick Entry Box */}
        <QuickEntryCard
          todayDate={new Date()}
          morningShift={todayShifts.morning}
          eveningShift={todayShifts.evening}
          onRefresh={fetchData}
          onOpenFullEntry={() => onNavigate('daily-entry')}
        />

        {/* Attendance Rate Donut Chart */}
        <AttendanceChart
          present={presentCount}
          leave={leaveCount}
          late={lateCount}
          notRecorded={notRecorded}
          attendancePercentage={attendancePercentage}
        />
      </div>

      {/* Highlights: Most Prepared Dishes & Recent Entries */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Recent Entries Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Recent Entries
            </h3>
            <button
              onClick={() => onNavigate('attendance')}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.25rem' }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {recentShifts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No shifts recorded yet for this month.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentShifts.map((shift) => (
                <div
                  key={shift._id}
                  onClick={() => handleEditShift(shift)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                        {formatDateShort(shift.dateString || shift.date)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                          {shift.shift === 'morning' ? '🌅 Morning' : '🌙 Evening'}
                        </span>
                        <StatusBadge status={shift.status} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Food / Reason / Note preview */}
                  <div style={{ textAlign: 'right', maxWidth: '55%' }}>
                    {shift.foods && shift.foods.length > 0 ? (
                      <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--primary)', truncate: 'true' }}>
                        🍲 {shift.foods.map((f) => f.name || f).join(', ')}
                      </p>
                    ) : shift.reason ? (
                      <p style={{ fontSize: '0.8125rem', color: '#b91c1c', fontWeight: '600' }}>
                        {shift.reason}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {shift.note || 'No notes'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Food Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Food Preparation Highlights
              </h3>
            </div>
            <button
              onClick={() => onNavigate('food-analysis')}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.25rem' }}
            >
              <span>Analysis</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309', textTransform: 'uppercase' }}>
                🥇 Most Prepared
              </span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#92400e', marginTop: '0.25rem' }}>
                {reportData?.mostPreparedFood?.name || '—'}
              </h4>
              <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#b45309', marginTop: '0.2rem' }}>
                {reportData?.mostPreparedFood ? `${reportData.mostPreparedFood.count} times` : 'No meals recorded'}
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                🥈 2nd Most Prepared
              </span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginTop: '0.25rem' }}>
                {reportData?.secondMostPreparedFood?.name || '—'}
              </h4>
              <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b', marginTop: '0.2rem' }}>
                {reportData?.secondMostPreparedFood ? `${reportData.secondMostPreparedFood.count} times` : '—'}
              </p>
            </div>
          </div>

          {/* Ranking preview */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Top Dishes Rank
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(reportData?.foodRanking || []).slice(0, 5).map((food, idx) => (
                <div
                  key={food.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>
                    {idx + 1}. {food.name}
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    {food.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Shift Modal */}
      <EditShiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shift={selectedShiftForEdit}
        dishes={dishes}
        onDishCreated={(newDish) => setDishes((prev) => [...prev, newDish])}
        onShiftSaved={fetchData}
        onShiftDeleted={fetchData}
      />
    </div>
  );
}
