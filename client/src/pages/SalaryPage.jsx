import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  Receipt,
  CreditCard,
  Banknote,
  RotateCcw,
  Check,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { salaryService } from '../services/salaryService';
import { formatDate } from '../utils/dateUtils';

export default function SalaryPage({ cookName = 'Cook', onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [customNote, setCustomNote] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, historyRes] = await Promise.all([
        salaryService.getSalaryStatus(),
        salaryService.getSalaryHistory()
      ]);

      if (statusRes.success) {
        setStatusData(statusRes.data);
      }
      if (historyRes.success) {
        setHistory(historyRes.data || []);
      }
    } catch (err) {
      console.error('Error loading salary data:', err);
      showToast(err.message || 'Failed to load salary details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePaid = async (cycleId, targetPaidStatus, method = selectedMethod, note = customNote) => {
    try {
      setIsSubmitting(true);
      const res = await salaryService.togglePaid({
        id: cycleId,
        isPaid: targetPaidStatus,
        paymentMethod: method,
        notes: note
      });

      if (res.success) {
        showToast(res.message);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update payment status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Cook Salary details..." />;
  }

  const currentCycle = statusData?.currentCycle;
  const isDue = statusData?.isDue; // today >= 17th
  const stats = statusData?.stats || { presentShifts: 0, leaveShifts: 0, totalRecordedShifts: 0 };
  const isPaid = Boolean(currentCycle?.isPaid);
  const cycleLabel = currentCycle?.cycleLabel || '17th to 17th Monthly Cycle';

  const PAYMENT_METHODS = [
    { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: '📱' },
    { id: 'Cash', label: 'Cash in Hand', icon: '💵' },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: '🏦' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* ── 1. Hero Fixed Salary Overview Card ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.15) 0%, rgba(13, 17, 26, 0.95) 100%)',
          border: '1px solid rgba(124, 92, 252, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C5CFC 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(124, 92, 252, 0.4)',
                flexShrink: 0
              }}
            >
              <Wallet size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--highlight)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Cook Salary Tracker
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1, marginTop: '2px' }}>
                ₹5,000 <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>/ month (Fixed)</span>
              </h2>
            </div>
          </div>

          <div
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(34, 211, 238, 0.12)',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              color: 'var(--secondary-accent)',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>🔄</span>
            <span>17th to 17th Cycle</span>
          </div>
        </div>

        {/* Current Active Cycle Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={15} color="var(--highlight)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Current Cycle:</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {cycleLabel}
            </span>
          </div>

          <span
            style={{
              fontSize: '0.71875rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isPaid ? '#10B981' : '#F59E0B',
              border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}
          >
            {isPaid ? '✓ PAID' : isDue ? '⚠️ PAYMENT DUE' : '⏳ IN PROGRESS'}
          </span>
        </div>
      </div>

      {/* ── 2. "Is Salary Paid?" Interactive Decision Card ── */}
      <div
        className="card"
        style={{
          borderTop: isPaid ? '4px solid #10B981' : '4px solid #F59E0B',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface-elevated)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isPaid ? '#10B981' : '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isPaid ? 'Payment Confirmed' : 'Monthly Salary Action'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {isPaid ? `₹5,000 Paid to ${cookName}` : `Is Salary Paid to ${cookName}?`}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {isPaid
                ? `Salary of ₹5,000 has been marked as Paid for the cycle (${cycleLabel}).`
                : `Every month on or after the 17th, confirm if the ₹5,000 salary has been paid to the cook.`}
            </p>
          </div>
        </div>

        {/* ── State 1: Already Paid ── */}
        {isPaid ? (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981'
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#10B981' }}>
                    Status: PAID (₹5,000)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Payment Mode: <b>{currentCycle?.paymentMethod || 'UPI'}</b>
                    {currentCycle?.paidAt && ` • on ${formatDate(currentCycle.paidAt)}`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTogglePaid(currentCycle._id, false)}
                disabled={isSubmitting}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', gap: '0.35rem' }}
              >
                <RotateCcw size={13} />
                <span>Change to Not Paid</span>
              </button>
            </div>

            {currentCycle?.notes && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(16, 185, 129, 0.15)', paddingTop: '0.5rem' }}>
                💬 Note: {currentCycle.notes}
              </div>
            )}
          </div>
        ) : (
          /* ── State 2: Not Paid (Select Paid / Not Paid) ── */
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Quick Status Selector Tabs */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Select Salary Status:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleTogglePaid(currentCycle._id, true, selectedMethod, customNote)}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.18)',
                    color: '#10B981',
                    fontSize: '0.9375rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>✅ Mark as Paid</span>
                </button>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#F59E0B',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Clock size={16} />
                  <span>⏳ Currently Pending</span>
                </div>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Payment Mode (for when paid):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      style={{
                        padding: '0.45rem 0.8rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8125rem',
                        fontWeight: isSelected ? 800 : 500,
                        backgroundColor: isSelected ? 'rgba(124, 92, 252, 0.3)' : 'var(--bg-surface-elevated)',
                        color: isSelected ? 'var(--highlight)' : 'var(--text-secondary)',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Note (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Paid full ₹5,000 on GPay, no leaves deducted..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Cycle Attendance Snapshot ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem' }}>
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.71875rem', fontWeight: 800, color: 'var(--text-muted)' }}>SHIFTS WORKED</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>
            {stats.presentShifts} <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>shifts</span>
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Present in 17th–17th cycle</span>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.71875rem', fontWeight: 800, color: 'var(--text-muted)' }}>LEAVES TAKEN</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.leaveShifts > 0 ? '#f87171' : 'var(--text-secondary)' }}>
            {stats.leaveShifts} <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>shifts</span>
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Absences in this cycle</span>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.71875rem', fontWeight: 800, color: 'var(--text-muted)' }}>CYCLE AMOUNT</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--highlight)' }}>
            ₹5,000
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Monthly fixed rate</span>
        </div>
      </div>

      {/* ── 4. Past Salary Ledger ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Monthly Salary Ledger & Payment Records
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Track every 17th-to-17th month cycle and payment history
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {history.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No previous salary cycle records yet.
            </div>
          ) : (
            history.map((record) => {
              const recordPaid = record.isPaid;
              return (
                <div
                  key={record._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: recordPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: recordPaid ? '#10B981' : '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800
                      }}
                    >
                      {recordPaid ? '✓' : '⏳'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {record.cycleLabel}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span>Amount: <b style={{ color: 'var(--text-main)' }}>₹{record.netPaidAmount || 5000}</b></span>
                        {record.paidAt && <span>• Paid on: {formatDate(record.paidAt)}</span>}
                        {record.paymentMethod && <span>• Mode: {record.paymentMethod}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: recordPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: recordPaid ? '#10B981' : '#F59E0B',
                        border: `1px solid ${recordPaid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`
                      }}
                    >
                      {recordPaid ? 'PAID' : 'PENDING'}
                    </span>

                    <button
                      onClick={() => handleTogglePaid(record._id, !recordPaid, record.paymentMethod || 'UPI')}
                      disabled={isSubmitting}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      {recordPaid ? 'Change to Unpaid' : 'Mark as Paid'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast feedback */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
