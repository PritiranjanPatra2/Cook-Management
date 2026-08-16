import React, { useState, useEffect } from 'react';
import { Save, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import ShiftCard from '../components/ShiftCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { shiftService } from '../services/shiftService';
import { dishService } from '../services/dishService';
import { settingsService } from '../services/settingsService';
import { formatDate, toYYYYMMDD } from '../utils/dateUtils';
import { DEFAULT_REASONS } from '../utils/constants';

export default function DailyEntry() {
  const [selectedDate, setSelectedDate] = useState(toYYYYMMDD(new Date()));
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [savingMorning, setSavingMorning] = useState(false);
  const [savingNight, setSavingNight] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [customReasons, setCustomReasons] = useState(DEFAULT_REASONS);
  const [toast, setToast] = useState(null);
  const [activeShift, setActiveShift] = useState('morning'); // 'morning' | 'evening' | 'both'

  const [morningShift, setMorningShift] = useState({ status: 'present', foods: [], reason: '', note: '' });
  const [eveningShift, setEveningShift] = useState({ status: 'present', foods: [], reason: '', note: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [dishRes, settingsRes] = await Promise.all([
          dishService.getDishes({ activeOnly: 'true' }),
          settingsService.getSettings()
        ]);
        if (dishRes.success) setDishes(dishRes.data);
        if (settingsRes.success && settingsRes.data?.customReasons) setCustomReasons(settingsRes.data.customReasons);
      } catch (err) { console.error(err); }
    }
    loadMeta();
  }, []);

  const loadDateShifts = async (dateStr) => {
    try {
      setLoading(true);
      const res = await shiftService.getShifts({ date: dateStr });
      if (res.success) {
        const shifts = res.data || [];
        const m = shifts.find(s => s.shift === 'morning');
        const e = shifts.find(s => s.shift === 'evening');
        setMorningShift({ _id: m?._id, status: m?.status || 'present', foods: m?.foods?.map(f => f._id || f) || [], reason: m?.reason || '', note: m?.note || '' });
        setEveningShift({ _id: e?._id, status: e?.status || 'present', foods: e?.foods?.map(f => f._id || f) || [], reason: e?.reason || '', note: e?.note || '' });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (selectedDate) loadDateShifts(selectedDate); }, [selectedDate]);

  const changeDay = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(toYYYYMMDD(d));
  };

  const handleSaveMorning = async () => {
    try {
      setSavingMorning(true);
      await shiftService.saveShift({ date: selectedDate, shift: 'morning', ...morningShift });
      showToast('🌅 Morning shift saved!');
      loadDateShifts(selectedDate);
    } catch (err) { showToast(err.message || 'Failed to save morning shift', 'error'); } finally { setSavingMorning(false); }
  };

  const handleSaveNight = async () => {
    try {
      setSavingNight(true);
      await shiftService.saveShift({ date: selectedDate, shift: 'evening', ...eveningShift });
      showToast('🌙 Night shift saved!');
      loadDateShifts(selectedDate);
    } catch (err) { showToast(err.message || 'Failed to save night shift', 'error'); } finally { setSavingNight(false); }
  };

  const handleSaveBoth = async () => {
    try {
      setSavingAll(true);
      await shiftService.batchSaveDayShifts({ date: selectedDate, morning: morningShift, evening: eveningShift });
      showToast('✨ Both shifts saved!');
      loadDateShifts(selectedDate);
    } catch (err) { showToast(err.message || 'Failed to save', 'error'); } finally { setSavingAll(false); }
  };

  const handleDishCreated = (newDish) => {
    setDishes(prev => [...prev, newDish]);
    showToast(`"${newDish.name}" added!`);
  };

  const handleSaveSingleFromCard = (shiftType) => {
    if (shiftType === 'morning') handleSaveMorning();
    else handleSaveNight();
  };

  return (
    <div className="fade-in">
      {/* Date Selector Card */}
      <div className="card" style={{ marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <button className="date-nav-btn" onClick={() => changeDay(-1)}>
            <ChevronLeft size={14} /> Prev
          </button>
          <div style={{ textAlign: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                border: 'none', background: 'transparent', textAlign: 'center',
                fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700,
                color: 'var(--text-main)', cursor: 'pointer', outline: 'none', width: '100%'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              {formatDate(selectedDate)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className="date-nav-btn date-nav-today" onClick={() => setSelectedDate(toYYYYMMDD(new Date()))}>Today</button>
            <button className="date-nav-btn" onClick={() => changeDay(1)}>Next <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Shift Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
        {[
          { id: 'morning', label: '🌅 Morning', color: '#d97706' },
          { id: 'evening', label: '🌙 Night',   color: '#4338ca' },
          { id: 'both',    label: 'Both',       color: 'var(--primary)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveShift(t.id)}
            style={{
              flex: 1,
              padding: '0.6rem 0',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${activeShift === t.id ? t.color : 'var(--border)'}`,
              background: activeShift === t.id ? '#fff' : 'var(--bg-surface-subtle)',
              color: activeShift === t.id ? t.color : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: activeShift === t.id ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {activeShift === 'morning' && (
          <button className="btn btn-primary btn-full" onClick={handleSaveMorning} disabled={savingMorning || loading}>
            <Sun size={16} /> {savingMorning ? 'Saving...' : 'Save Morning Shift'}
          </button>
        )}
        {activeShift === 'evening' && (
          <button className="btn btn-primary btn-full" onClick={handleSaveNight} disabled={savingNight || loading}
            style={{ background: '#4338ca', boxShadow: '0 2px 12px rgba(67,56,202,0.35)' }}>
            <Moon size={16} /> {savingNight ? 'Saving...' : 'Save Night Shift'}
          </button>
        )}
        {activeShift === 'both' && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={handleSaveMorning} disabled={savingMorning || loading}
              style={{ flex: 1, borderColor: '#fde68a', color: '#b45309' }}>
              <Sun size={14} /> {savingMorning ? '...' : 'Morning'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleSaveNight} disabled={savingNight || loading}
              style={{ flex: 1, borderColor: '#c7d2fe', color: '#4338ca' }}>
              <Moon size={14} /> {savingNight ? '...' : 'Night'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveBoth} disabled={savingAll || loading}
              style={{ flex: 1 }}>
              <Save size={14} /> {savingAll ? '...' : 'Both'}
            </button>
          </>
        )}
      </div>

      {/* Shift Card(s) */}
      {loading ? (
        <LoadingSpinner text="Loading shifts..." />
      ) : (
        <>
          {(activeShift === 'morning' || activeShift === 'both') && (
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
          {(activeShift === 'evening' || activeShift === 'both') && (
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
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
