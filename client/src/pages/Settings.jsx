import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  KeyRound,
  Calendar,
  User,
  Clock,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { settingsService } from '../services/settingsService';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils';
import { DEFAULT_REASONS } from '../utils/constants';

export default function Settings({ onSettingsUpdated }) {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPasscode, setChangingPasscode] = useState(false);
  const [toast, setToast] = useState(null);

  // Settings state
  const [cookName, setCookName] = useState('Cook');
  const [trackingStartDate, setTrackingStartDate] = useState('2026-08-16');
  const [morningShiftName, setMorningShiftName] = useState('Morning');
  const [eveningShiftName, setEveningShiftName] = useState('Evening');
  const [shiftsPerDay, setShiftsPerDay] = useState(2);
  const [customReasons, setCustomReasons] = useState(DEFAULT_REASONS);
  const [newReasonInput, setNewReasonInput] = useState('');

  // Passcode change state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      if (res.success && res.data) {
        const s = res.data;
        if (s.cookName) setCookName(s.cookName);
        if (s.trackingStartDate) setTrackingStartDate(toYYYYMMDD(s.trackingStartDate));
        if (s.morningShiftName) setMorningShiftName(s.morningShiftName);
        if (s.eveningShiftName) setEveningShiftName(s.eveningShiftName);
        if (s.shiftsPerDay) setShiftsPerDay(s.shiftsPerDay);
        if (s.customReasons && Array.isArray(s.customReasons)) setCustomReasons(s.customReasons);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveGeneralSettings = async (e) => {
    e?.preventDefault();
    try {
      setSavingSettings(true);
      const res = await settingsService.updateSettings({
        cookName,
        trackingStartDate,
        morningShiftName,
        eveningShiftName,
        customReasons
      });

      if (res.success) {
        setToast({ message: 'Settings saved successfully!', type: 'success' });
        if (onSettingsUpdated) onSettingsUpdated(res.data);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update settings', type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePasscode = async (e) => {
    e?.preventDefault();
    if (!currentPasscode || !newPasscode) {
      setToast({ message: 'Please provide both current and new passcodes', type: 'error' });
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setToast({ message: 'New passcode and confirm passcode do not match', type: 'error' });
      return;
    }

    if (newPasscode.length < 4) {
      setToast({ message: 'New passcode must be at least 4 digits', type: 'error' });
      return;
    }

    try {
      setChangingPasscode(true);
      const res = await settingsService.changePasscode(currentPasscode, newPasscode);
      if (res.success) {
        setToast({ message: 'Passcode changed successfully!', type: 'success' });
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
      }
    } catch (err) {
      setToast({ message: err.message || 'Passcode change failed', type: 'error' });
    } finally {
      setChangingPasscode(false);
    }
  };

  const handleAddReason = () => {
    if (!newReasonInput.trim()) return;
    if (customReasons.includes(newReasonInput.trim())) {
      setToast({ message: 'Reason already exists in list', type: 'info' });
      return;
    }
    setCustomReasons([...customReasons, newReasonInput.trim()]);
    setNewReasonInput('');
  };

  const handleRemoveReason = (reasonToRemove) => {
    setCustomReasons(customReasons.filter((r) => r !== reasonToRemove));
  };

  if (loading) {
    return <LoadingSpinner text="Loading system settings..." />;
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#ffffff' }}>
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
          <SettingsIcon size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: '800' }}>System & Routine Settings</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Configure tracking start date, cook profile, shift names, custom leave reasons, and security passcode.
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* General Tracker Settings Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <User size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Cook & Routine Rules</h3>
          </div>

          <form onSubmit={handleSaveGeneralSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Cook Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Cook Name / Display Title
              </label>
              <input
                type="text"
                value={cookName}
                onChange={(e) => setCookName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Tracking Start Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Tracking Start Date
              </label>
              <input
                type="date"
                value={trackingStartDate}
                onChange={(e) => setTrackingStartDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                For the initial month, calculations only count shifts from this date onward (e.g. 16 Aug = 16 days = 32 shifts).
              </span>
            </div>

            {/* Shift Names */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                  Morning Shift Name
                </label>
                <input
                  type="text"
                  value={morningShiftName}
                  onChange={(e) => setMorningShiftName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                  Evening Shift Name
                </label>
                <input
                  type="text"
                  value={eveningShiftName}
                  onChange={(e) => setEveningShiftName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Shifts Per Day (Fixed at 2) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                Shifts Per Day
              </label>
              <input
                type="number"
                value={shiftsPerDay}
                disabled
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                Standard household formula: 2 shifts = 1 day equivalent (1 shift = 0.5 day).
              </span>
            </div>

            {/* Save Settings Button */}
            <button
              type="submit"
              disabled={savingSettings}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
            >
              <Save size={16} />
              <span>{savingSettings ? 'Saving...' : 'Save General Settings'}</span>
            </button>
          </form>
        </div>

        {/* Security / Change Passcode Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <Lock size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Change Passcode</h3>
            </div>

            <form onSubmit={handleChangePasscode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                  Current Passcode
                </label>
                <input
                  type="password"
                  placeholder="Enter current 4-digit code"
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                  maxLength={6}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                    New Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="New 4 digits"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    maxLength={6}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                    Confirm Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm digits"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    maxLength={6}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPasscode || !currentPasscode || !newPasscode}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
              >
                <KeyRound size={16} color="var(--primary)" />
                <span>{changingPasscode ? 'Updating...' : 'Update Passcode'}</span>
              </button>
            </form>
          </div>

          {/* Custom Reasons Manager */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <Sparkles size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Predefined Reasons for Absence</h3>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add custom reason (e.g. Village Trip)"
                value={newReasonInput}
                onChange={(e) => setNewReasonInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8125rem'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReason();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddReason}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
              {customReasons.map((reason) => (
                <div
                  key={reason}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid var(--border)'
                  }}
                >
                  <span>{reason}</span>
                  {customReasons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReason(reason)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSaveGeneralSettings}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
            >
              Save Reasons List
            </button>
          </div>
        </div>
      </div>

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
