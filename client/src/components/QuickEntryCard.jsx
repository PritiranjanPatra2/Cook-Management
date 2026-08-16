import React, { useState } from 'react';
import { Sun, Moon, ArrowRight, CheckCircle2, Zap, Save } from 'lucide-react';
import { shiftService } from '../services/shiftService';
import { formatDate, toYYYYMMDD } from '../utils/dateUtils';
import StatusBadge from './StatusBadge';

export default function QuickEntryCard({
  todayDate = new Date(),
  morningShift,
  eveningShift,
  onRefresh,
  onOpenFullEntry
}) {
  const dateStr = toYYYYMMDD(todayDate);
  const [morningStatus, setMorningStatus] = useState(morningShift?.status || 'present');
  const [eveningStatus, setEveningStatus] = useState(eveningShift?.status || 'present');
  const [saving, setSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Sync state if props change
  React.useEffect(() => {
    if (morningShift?.status) setMorningStatus(morningShift.status);
    if (eveningShift?.status) setEveningStatus(eveningShift.status);
  }, [morningShift, eveningShift]);

  // Save Morning Shift Only
  const handleSaveMorningOnly = async (mStatus) => {
    try {
      setSaving(true);
      const targetM = mStatus !== undefined ? mStatus : morningStatus;
      await shiftService.saveShift({
        date: dateStr,
        shift: 'morning',
        status: targetM,
        foods: morningShift?.foods?.map((f) => f._id || f) || []
      });
      setSavedSuccessMsg('🌅 Morning shift saved!');
      setTimeout(() => setSavedSuccessMsg(''), 2500);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save morning error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save Night Shift Only
  const handleSaveNightOnly = async (eStatus) => {
    try {
      setSaving(true);
      const targetE = eStatus !== undefined ? eStatus : eveningStatus;
      await shiftService.saveShift({
        date: dateStr,
        shift: 'evening',
        status: targetE,
        foods: eveningShift?.foods?.map((f) => f._id || f) || []
      });
      setSavedSuccessMsg('🌙 Night shift saved!');
      setTimeout(() => setSavedSuccessMsg(''), 2500);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save night error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save Both Shifts at once
  const handleSaveBoth = async () => {
    try {
      setSaving(true);
      await shiftService.batchSaveDayShifts({
        date: dateStr,
        morning: {
          status: morningStatus,
          foods: morningShift?.foods?.map((f) => f._id || f) || []
        },
        evening: {
          status: eveningStatus,
          foods: eveningShift?.foods?.map((f) => f._id || f) || []
        }
      });
      setSavedSuccessMsg('✨ Both Morning & Night shifts saved!');
      setTimeout(() => setSavedSuccessMsg(''), 2500);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save both error:', err);
    } finally {
      setSaving(false);
    }
  };

  const statusBtns = [
    { label: 'Present', value: 'present', activeBg: '#ecfdf5', activeBorder: '#10b981', color: '#047857' },
    { label: 'Leave', value: 'leave', activeBg: '#fef2f2', activeBorder: '#ef4444', color: '#b91c1c' },
    { label: 'Late', value: 'late', activeBg: '#f5f3ff', activeBorder: '#8b5cf6', color: '#6d28d9' }
  ];

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid var(--border)',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eef2ff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Today's Quick Entry
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {formatDate(todayDate)}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenFullEntry}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.35rem', fontSize: '0.8125rem' }}
        >
          <span>Open Full Entry</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Shift Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Morning Shift */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sun size={18} color="#d97706" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Morning Shift</span>
            </div>
            <StatusBadge status={morningStatus || morningShift?.status || 'unrecorded'} size="sm" />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {statusBtns.map((btn) => {
              const isSelected = morningStatus === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => {
                    setMorningStatus(btn.value);
                    handleSaveMorningOnly(btn.value);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${isSelected ? btn.activeBorder : 'var(--border)'}`,
                    backgroundColor: isSelected ? btn.activeBg : '#f8fafc',
                    color: isSelected ? btn.color : 'var(--text-muted)',
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleSaveMorningOnly(undefined)}
            disabled={saving}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78125rem', padding: '0.4rem 0.5rem', color: '#b45309', borderColor: '#fde68a' }}
          >
            Save Morning Shift
          </button>
        </div>

        {/* Night Shift */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Moon size={18} color="#4338ca" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Night Shift</span>
            </div>
            <StatusBadge status={eveningStatus || eveningShift?.status || 'unrecorded'} size="sm" />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {statusBtns.map((btn) => {
              const isSelected = eveningStatus === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => {
                    setEveningStatus(btn.value);
                    handleSaveNightOnly(btn.value);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${isSelected ? btn.activeBorder : 'var(--border)'}`,
                    backgroundColor: isSelected ? btn.activeBg : '#f8fafc',
                    color: isSelected ? btn.color : 'var(--text-muted)',
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleSaveNightOnly(undefined)}
            disabled={saving}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', color: '#4338ca', borderColor: '#c7d2fe' }}
          >
            Save Night Shift
          </button>
        </div>
      </div>

      {/* Save Both Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={handleSaveBoth}
          disabled={saving}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <Save size={14} />
          <span>Save Both Shifts At Once</span>
        </button>
      </div>

      {savedSuccessMsg && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.4rem 0.75rem',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <CheckCircle2 size={14} />
          <span>{savedSuccessMsg}</span>
        </div>
      )}
    </div>
  );
}
