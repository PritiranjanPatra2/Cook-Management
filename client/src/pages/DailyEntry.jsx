import React, { useState, useEffect } from 'react';
import { Save, Sun, Moon, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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

  const isToday = selectedDate === toYYYYMMDD(new Date());

  return (
    <div className="fade-in">
      {/* Date Selector Card */}
      <div className="card" style={{ marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
          {/* Prev Button */}
          <button
            className="date-nav-btn"
            onClick={() => changeDay(-1)}
            style={{ padding: '0.4rem 0.65rem' }}
            title="Previous Day"
          >
            <ChevronLeft size={15} />
            <span>Prev</span>
          </button>

          {/* Center Date Pill */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0
            }}
          >
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 2
              }}
            />
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.38rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isToday ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
                border: `1.5px solid ${isToday ? '#c7d2fe' : 'var(--border)'}`,
                cursor: 'pointer',
                maxWidth: '100%',
                color: isToday ? 'var(--primary)' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={14} style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {formatDate(selectedDate)}
              </span>
              {isToday && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    marginLeft: '2px',
                    flexShrink: 0
                  }}
                >
                  Today
                </span>
              )}
            </div>
          </div>

          {/* Next Button */}
          <button
            className="date-nav-btn"
            onClick={() => changeDay(1)}
            style={{ padding: '0.4rem 0.65rem' }}
            title="Next Day"
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Jump to Today quick link if not currently on today */}
        {!isToday && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.45rem' }}>
            <button
              onClick={() => setSelectedDate(toYYYYMMDD(new Date()))}
              className="date-nav-btn date-nav-today"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
            >
              Jump to Today
            </button>
          </div>
        )}
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
