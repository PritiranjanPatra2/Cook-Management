import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import AttendanceChart from '../components/AttendanceChart';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { reportService } from '../services/reportService';
import { MONTH_NAMES } from '../utils/constants';
import { formatDateShort } from '../utils/dateUtils';

export default function Reports({ cookName = 'Cook' }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [shifts, setShifts] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await reportService.getMonthReport(month, year);
      if (res.success) {
        setReport(res.data);
        setShifts(res.shifts || []);
      }
    } catch (err) {
      console.error('Error loading month report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
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

  // CSV Export
  const handleExportCSV = () => {
    if (!report) return;

    const monthName = MONTH_NAMES[month - 1];
    let csvContent = `data:text/csv;charset=utf-8,`;
    csvContent += `Cook Monthly Routine & Attendance Report\n`;
    csvContent += `Month,${monthName} ${year}\n`;
    csvContent += `Cook Name,${cookName}\n`;
    csvContent += `Tracking Period,${report.startDay} ${monthName} - ${report.endDay} ${monthName} ${year}\n`;
    csvContent += `Total Days,${report.countedDays}\n`;
    csvContent += `Expected Shifts,${report.expectedShifts}\n`;
    csvContent += `Present Shifts,${report.presentCount}\n`;
    csvContent += `Present Day Equivalent,${report.presentDayEquivalent} days\n`;
    csvContent += `Leave Shifts,${report.leaveCount}\n`;
    csvContent += `Leave Day Equivalent,${report.leaveDayEquivalent} days\n`;
    csvContent += `No Work Shifts,${report.noWorkCount}\n`;
    csvContent += `No Work Day Equivalent,${report.noWorkDayEquivalent} days\n`;
    csvContent += `Late Shifts,${report.lateCount}\n`;
    csvContent += `Attendance Rate,${report.attendancePercentage}%\n\n`;

    csvContent += `Date,Shift,Status,Foods Prepared,Reason,Note\n`;
    shifts.forEach((s) => {
      const foodsStr = (s.foods || []).map((f) => f.name || f).join(' + ');
      csvContent += `"${s.dateString}","${s.shift}","${s.status}","${foodsStr}","${s.reason || ''}","${s.note || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cook_Report_${monthName}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Compiling monthly attendance summary..." />;
  }

  const monthName = MONTH_NAMES[month - 1];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Card with Month Selector & Export Buttons */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileBarChart size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monthly Report
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <select
                value={month}
                onChange={(e) => {
                  const d = new Date(currentDate);
                  d.setMonth(parseInt(e.target.value) - 1);
                  setCurrentDate(d);
                }}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontWeight: '700',
                  fontSize: '1rem'
                }}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m} {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Month switch & Export buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handlePrevMonth} className="btn btn-secondary btn-sm" title="Previous Month">
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <button onClick={handleNextMonth} className="btn btn-secondary btn-sm" title="Next Month">
            <span>Next</span>
            <ChevronRight size={16} />
          </button>

          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <Printer size={15} />
            <span>Print</span>
          </button>

          <button onClick={handleExportCSV} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Month Executive Summary Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '1.75rem 2rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', color: '#c7d2fe', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Executive Monthly Summary
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>
            {monthName} {year}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#e0e7ff', marginTop: '0.35rem' }}>
            Tracking Period: <b>{report?.startDay} {monthName} – {report?.endDay} {monthName}</b> ({report?.countedDays} days)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: '600' }}>Expected Shifts</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>{report?.expectedShifts}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: '600' }}>Attendance</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6ee7b7' }}>{report?.attendancePercentage}%</div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Total Days"
          value={report?.countedDays || 0}
          subValue={`${report?.totalMonthDays || 0} days in month`}
          icon={Calendar}
          accentColor="#6366f1"
        />

        <StatCard
          title="Present Shifts"
          value={report?.presentCount || 0}
          subValue={`${report?.presentDayEquivalent || 0} day equivalent`}
          icon={CheckCircle2}
          accentColor="#10b981"
        />

        <StatCard
          title="Leave Shifts"
          value={report?.leaveCount || 0}
          subValue={`${report?.leaveDayEquivalent || 0} day equivalent`}
          icon={XCircle}
          accentColor="#ef4444"
        />

        <StatCard
          title="Late Shifts"
          value={report?.lateCount || 0}
          subValue="Tracked with attendance"
          icon={Clock}
          accentColor="#8b5cf6"
        />
      </div>

      {/* Analytics Breakdown Row: Leave Analysis & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Leave Reasons Analysis */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <XCircle size={18} color="#ef4444" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Leave Analysis</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
            <span style={{ fontWeight: '700', color: '#b91c1c', fontSize: '0.875rem' }}>Total Leave Shifts</span>
            <span style={{ fontWeight: '800', color: '#b91c1c', fontSize: '0.875rem' }}>
              {report?.leaveCount} shifts ({report?.leaveDayEquivalent} days)
            </span>
          </div>

          {Object.keys(report?.leaveReasons || {}).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No leaves recorded this month. Excellent consistency!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(report?.leaveReasons || {}).map(([reason, count]) => (
                <div
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>{reason}</span>
                  <span style={{ fontWeight: '700', color: '#ef4444' }}>{count} shift{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Donut */}
        <AttendanceChart
          present={report?.presentCount}
          leave={report?.leaveCount}
          late={report?.lateCount}
          notRecorded={report?.notRecorded}
          attendancePercentage={report?.attendancePercentage}
        />
      </div>

      {/* Top Prepared Dishes Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <Award size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Dishes Prepared This Month</h3>
        </div>

        {(report?.foodRanking || []).length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No meals logged yet for this month.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {report.foodRanking.map((dish, index) => (
              <div
                key={dish.name}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: index === 0 ? '#eef2ff' : 'var(--bg-surface-subtle)',
                  border: `1px solid ${index === 0 ? 'var(--border-focus)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)' }}>#{index + 1}</span>
                  <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{dish.name}</span>
                </div>
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.875rem' }}>
                  {dish.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
