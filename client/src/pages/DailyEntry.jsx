import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Save,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Layers
} from 'lucide-react';
import ShiftCard from '../components/ShiftCard';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { shiftService } from '../services/shiftService';
import { dishService } from '../services/dishService';
import { settingsService } from '../services/settingsService';
import { formatDate, toYYYYMMDD } from '../utils/dateUtils';
import { DEFAULT_REASONS } from '../utils/constants';

export default function DailyEntry({ onSavedNavigate }) {
  const [selectedDate, setSelectedDate] = useState(toYYYYMMDD(new Date()));
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [savingMorning, setSavingMorning] = useState(false);
  const [savingNight, setSavingNight] = useState(false);
  const [shiftFilter, setShiftFilter] = useState('both'); // 'both' | 'morning' | 'evening'
  const [dishes, setDishes] = useState([]);
  const [customReasons, setCustomReasons] = useState(DEFAULT_REASONS);
  const [toast, setToast] = useState(null);

  const [morningShift, setMorningShift] = useState({
    status: 'present',
    foods: [],
    reason: '',
    note: ''
  });

  const [eveningShift, setEveningShift] = useState({
    status: 'present',
    foods: [],
    reason: '',
    note: ''
  });

  // Load initial settings and dishes
  useEffect(() => {
    async function loadMeta() {
      try {
        const [dishRes, settingsRes] = await Promise.all([
          dishService.getDishes({ activeOnly: 'true' }),
          settingsService.getSettings()
        ]);
        if (dishRes.success) setDishes(dishRes.data);
        if (settingsRes.success && settingsRes.data?.customReasons) {
          setCustomReasons(settingsRes.data.customReasons);
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch shifts for selected date
  const loadDateShifts = async (dateStr) => {
    try {
      setLoading(true);
      const res = await shiftService.getShifts({ date: dateStr });
      if (res.success) {
        const shifts = res.data || [];
        const m = shifts.find((s) => s.shift === 'morning');
        const e = shifts.find((s) => s.shift === 'evening');

        setMorningShift({
          _id: m?._id,
          status: m?.status || 'present',
          foods: m?.foods?.map((f) => f._id || f) || [],
          reason: m?.reason || '',
          note: m?.note || ''
        });

        setEveningShift({
          _id: e?._id,
          status: e?.status || 'present',
          foods: e?.foods?.map((f) => f._id || f) || [],
          reason: e?.reason || '',
          note: e?.note || ''
        });
      }
    } catch (err) {
      console.error('Error loading date shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadDateShifts(selectedDate);
    }
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toYYYYMMDD(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(toYYYYMMDD(d));
  };

  const handleToday = () => {
    setSelectedDate(toYYYYMMDD(new Date()));
  };

  // Save Morning Shift Only
  const handleSaveMorningOnly = async () => {
    try {
      setSavingMorning(true);
      const res = await shiftService.saveShift({
        date: selectedDate,
        shift: 'morning',
        status: morningShift.status,
        foods: morningShift.foods,
        reason: morningShift.reason,
        note: morningShift.note
      });

      if (res.success) {
        setToast({ message: '🌅 Morning shift saved successfully!', type: 'success' });
        loadDateShifts(selectedDate);
      }
    } catch (err) {
      setToast({ message: err.message || 'Unable to save morning shift.', type: 'error' });
    } finally {
      setSavingMorning(false);
    }
  };

  // Save Night / Evening Shift Only
  const handleSaveNightOnly = async () => {
    try {
      setSavingNight(true);
      const res = await shiftService.saveShift({
        date: selectedDate,
        shift: 'evening',
        status: eveningShift.status,
        foods: eveningShift.foods,
        reason: eveningShift.reason,
        note: eveningShift.note
      });

      if (res.success) {
        setToast({ message: '🌙 Night shift saved successfully!', type: 'success' });
        loadDateShifts(selectedDate);
      }
    } catch (err) {
      setToast({ message: err.message || 'Unable to save night shift.', type: 'error' });
    } finally {
      setSavingNight(false);
    }
  };

  // Save Both Shifts simultaneously
  const handleSaveBoth = async (e) => {
    e?.preventDefault();
    try {
      setSavingAll(true);
      const res = await shiftService.batchSaveDayShifts({
        date: selectedDate,
        morning: morningShift,
        evening: eveningShift
      });

      if (res.success) {
        setToast({ message: '✨ Both Morning & Night shifts saved successfully!', type: 'success' });
        loadDateShifts(selectedDate);
      }
    } catch (err) {
      setToast({ message: err.message || 'Unable to save entries. Please try again.', type: 'error' });
    } finally {
      setSavingAll(false);
    }
  };

  const handleDishCreated = (newDish) => {
    setDishes((prev) => [...prev, newDish]);
    setToast({ message: `"${newDish.name}" added to food library!`, type: 'success' });
  };

  const handleSaveSingleFromCard = (shiftType) => {
    if (shiftType === 'morning') {
      handleSaveMorningOnly();
    } else {
      handleSaveNightOnly();
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Card with Date Selector, View Mode & Action Buttons */}
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
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Recording Date
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-surface-subtle)'
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                ({formatDate(selectedDate)})
              </span>
            </div>
          </div>
        </div>

        {/* Date Jump Controls & Shift View Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Shift Filter Switcher */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '3px',
              border: '1px solid var(--border)'
            }}
          >
            <button
              onClick={() => setShiftFilter('both')}
              style={{
                padding: '0.35rem 0.75rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: shiftFilter === 'both' ? '700' : '500',
                backgroundColor: shiftFilter === 'both' ? '#ffffff' : 'transparent',
                color: shiftFilter === 'both' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              Both Shifts
            </button>
            <button
              onClick={() => setShiftFilter('morning')}
              style={{
                padding: '0.35rem 0.75rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: shiftFilter === 'morning' ? '700' : '500',
                backgroundColor: shiftFilter === 'morning' ? '#ffffff' : 'transparent',
                color: shiftFilter === 'morning' ? '#d97706' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              🌅 Morning Only
            </button>
            <button
              onClick={() => setShiftFilter('evening')}
              style={{
                padding: '0.35rem 0.75rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: shiftFilter === 'evening' ? '700' : '500',
                backgroundColor: shiftFilter === 'evening' ? '#ffffff' : 'transparent',
                color: shiftFilter === 'evening' ? '#4338ca' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              🌙 Night Only
            </button>
          </div>

          <button onClick={handlePrevDay} className="btn btn-secondary btn-sm" title="Previous Day">
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <button onClick={handleToday} className="btn btn-secondary btn-sm" style={{ fontWeight: '600' }}>
            Today
          </button>

          <button onClick={handleNextDay} className="btn btn-secondary btn-sm" title="Next Day">
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Action Trigger Buttons: Morning at once / Night at once / Both at once */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem'
        }}
      >
        <button
          onClick={handleSaveMorningOnly}
          disabled={savingMorning || loading}
          className="btn btn-secondary"
          style={{
            backgroundColor: '#fffbeb',
            borderColor: '#fde68a',
            color: '#b45309',
            fontWeight: '700',
            padding: '0.75rem 1rem'
          }}
        >
          <Sun size={18} color="#d97706" />
          <span>{savingMorning ? 'Saving Morning...' : 'Save 🌅 Morning Shift Only'}</span>
        </button>

        <button
          onClick={handleSaveNightOnly}
          disabled={savingNight || loading}
          className="btn btn-secondary"
          style={{
            backgroundColor: '#eef2ff',
            borderColor: '#c7d2fe',
            color: '#4338ca',
            fontWeight: '700',
            padding: '0.75rem 1rem'
          }}
        >
          <Moon size={18} color="#4338ca" />
          <span>{savingNight ? 'Saving Night...' : 'Save 🌙 Night Shift Only'}</span>
        </button>

        <button
          onClick={handleSaveBoth}
          disabled={savingAll || loading}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1rem' }}
        >
          <Save size={18} />
          <span>{savingAll ? 'Saving Both...' : 'Save ✨ Both Shifts At Once'}</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading shifts for this date..." />
      ) : (
        <>
          {/* Shift Cards Area */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: shiftFilter === 'both' ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr',
              gap: '1.5rem',
              alignItems: 'start'
            }}
          >
            {/* Morning Shift Card */}
            {(shiftFilter === 'both' || shiftFilter === 'morning') && (
              <ShiftCard
                shiftType="morning"
                shiftTitle="🌅 Morning Shift"
                shiftData={morningShift}
                onChange={setMorningShift}
                dishes={dishes}
                onDishCreated={handleDishCreated}
                customReasons={customReasons}
                onSaveSingleShift={handleSaveSingleFromCard}
                isSavingSingle={savingMorning}
              />
            )}

            {/* Night / Evening Shift Card */}
            {(shiftFilter === 'both' || shiftFilter === 'evening') && (
              <ShiftCard
                shiftType="evening"
                shiftTitle="🌙 Night Shift"
                shiftData={eveningShift}
                onChange={setEveningShift}
                dishes={dishes}
                onDishCreated={handleDishCreated}
                customReasons={customReasons}
                onSaveSingleShift={handleSaveSingleFromCard}
                isSavingSingle={savingNight}
              />
            )}
          </div>

          {/* Bottom Save Action Bar */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              backgroundColor: '#ffffff',
              marginTop: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>You can save Morning shift individually, Night shift individually, or Both at once.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleSaveMorningOnly}
                disabled={savingMorning}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#fde68a', color: '#b45309', fontWeight: '700' }}
              >
                Save Morning
              </button>
              <button
                onClick={handleSaveNightOnly}
                disabled={savingNight}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#c7d2fe', color: '#4338ca', fontWeight: '700' }}
              >
                Save Night
              </button>
              <button
                onClick={handleSaveBoth}
                disabled={savingAll}
                className="btn btn-primary"
                style={{ minWidth: '180px' }}
              >
                <Save size={18} />
                <span>{savingAll ? 'Saving Both...' : 'Save Both Shifts'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Alert */}
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
