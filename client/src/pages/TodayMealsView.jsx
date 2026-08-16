import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Sun,
  Moon,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  Flame,
  LayoutDashboard
} from 'lucide-react';
import { shiftService } from '../services/shiftService';
import { dishService } from '../services/dishService';
import { salaryService } from '../services/salaryService';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils';
import StatusBadge from '../components/StatusBadge';
import EditShiftModal from '../components/EditShiftModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Wallet } from 'lucide-react';

export default function TodayMealsView({ onNavigate, cookName = 'Cook' }) {
  const [loading, setLoading] = useState(true);
  const [todayShifts, setTodayShifts] = useState({ morning: null, evening: null });
  const [dishes, setDishes] = useState([]);
  const [salaryDueInfo, setSalaryDueInfo] = useState(null);
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const today = new Date();
  const currentHour = today.getHours();
  // Before 3 PM is morning routine, from 3 PM onwards is night/dinner routine
  const isMorningTime = currentHour < 15;
  const todayStr = toYYYYMMDD(today);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const [shiftRes, dishRes, salaryRes] = await Promise.all([
        shiftService.getShifts({ date: todayStr }),
        dishService.getDishes(),
        salaryService.getSalaryStatus().catch(() => ({ success: false }))
      ]);

      if (shiftRes.success && shiftRes.data) {
        const morning = shiftRes.data.find(s => s.shift === 'morning') || null;
        const evening = shiftRes.data.find(s => s.shift === 'evening') || null;
        setTodayShifts({ morning, evening });
      }

      if (dishRes.success && dishRes.data) {
        setDishes(dishRes.data);
      }

      if (salaryRes?.success && salaryRes?.data) {
        if (salaryRes.data.isDue && !salaryRes.data.currentCycle?.isPaid) {
          setSalaryDueInfo(salaryRes.data.currentCycle);
        } else {
          setSalaryDueInfo(null);
        }
      }
    } catch (err) {
      console.error('Error fetching today meal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const handleOpenEdit = (shiftType, existingShift) => {
    if (existingShift) {
      setSelectedShiftForEdit(existingShift);
    } else {
      setSelectedShiftForEdit({
        date: today,
        dateString: todayStr,
        shift: shiftType,
        status: 'present',
        foods: [],
        foodDetails: [],
        reason: '',
        note: ''
      });
    }
    setIsEditModalOpen(true);
  };

  // Helper to determine dish emoji
  const getDishEmoji = (name = '', category = '') => {
    const text = `${name} ${category}`.toLowerCase();
    if (text.includes('roti') || text.includes('chapati') || text.includes('paratha') || text.includes('bread') || text.includes('puri')) return '🫓';
    if (text.includes('rice') || text.includes('pulao') || text.includes('biryani') || text.includes('khichdi')) return '🍚';
    if (text.includes('dal') || text.includes('sambar') || text.includes('soup') || text.includes('curry')) return '🍲';
    if (text.includes('paneer') || text.includes('chicken') || text.includes('egg') || text.includes('soya')) return '🥘';
    if (text.includes('salad') || text.includes('raita')) return '🥗';
    if (text.includes('tea') || text.includes('coffee') || text.includes('milk')) return '☕';
    return '🍽️';
  };

  // Helper to determine smart quantity default if not set
  const getSmartQuantity = (name = '', category = '', existingQty = '') => {
    if (existingQty && existingQty.trim()) return existingQty;
    const text = `${name} ${category}`.toLowerCase();
    if (text.includes('roti') || text.includes('chapati') || text.includes('paratha') || text.includes('bread') || text.includes('puri')) {
      return '8-10 Rotis (Sufficient)';
    }
    if (text.includes('rice') || text.includes('pulao') || text.includes('biryani')) {
      return 'For 3-4 people';
    }
    if (text.includes('dal') || text.includes('sambar') || text.includes('curry') || text.includes('paneer') || text.includes('soya')) {
      return 'Sufficient for 3-4';
    }
    return 'For 3-4 people';
  };

  // Helper to format foods with prominent quantities
  const renderFoodItems = (shift) => {
    if (!shift) return null;

    let itemsToRender = [];
    if (Array.isArray(shift.foodDetails) && shift.foodDetails.length > 0) {
      itemsToRender = shift.foodDetails.map(detail => {
        const dishId = detail.dish?._id || detail.dish;
        const dishObj = typeof detail.dish === 'object' && detail.dish?.name ? detail.dish : dishes.find(d => String(d._id) === String(dishId));
        const name = dishObj?.name || (typeof detail.dish === 'string' ? detail.dish : 'Dish');
        const category = dishObj?.category || 'Dish';
        const quantity = detail.quantity || getSmartQuantity(name, category, '');
        const emoji = getDishEmoji(name, category);
        return { name, category, quantity, emoji };
      });
    } else if (Array.isArray(shift.foods) && shift.foods.length > 0) {
      itemsToRender = shift.foods.map(food => {
        const dishId = food?._id || food;
        const dishObj = typeof food === 'object' && food?.name ? food : dishes.find(d => String(d._id) === String(dishId));
        const name = dishObj?.name || (typeof food === 'string' ? food : 'Dish');
        const category = dishObj?.category || 'Dish';
        const quantity = getSmartQuantity(name, category, '');
        const emoji = getDishEmoji(name, category);
        return { name, category, quantity, emoji };
      });
    }

    if (itemsToRender.length === 0) return null;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', width: '100%' }}>
        {itemsToRender.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid rgba(124, 92, 252, 0.3)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                {item.emoji} {item.name}
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--highlight)', backgroundColor: 'rgba(124, 92, 252, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                {item.category}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Quantity:
              </span>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(34, 211, 238, 0.15)',
                  color: 'var(--secondary-accent)',
                  border: '1px solid rgba(34, 211, 238, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>📊</span>
                <span>{item.quantity}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Checking today's cooked meals..." />;
  }

  const primaryShiftType = isMorningTime ? 'morning' : 'evening';
  const primaryShiftData = isMorningTime ? todayShifts.morning : todayShifts.evening;
  const secondaryShiftType = isMorningTime ? 'evening' : 'morning';
  const secondaryShiftData = isMorningTime ? todayShifts.evening : todayShifts.morning;

  const isPrimaryUpdated = primaryShiftData !== null;
  const isSecondaryUpdated = secondaryShiftData !== null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── Salary Due Notification Banner (After 17th) ── */}
      {salaryDueInfo && (
        <div
          onClick={() => onNavigate('salary')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            gap: '0.75rem',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>💰</span>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#F59E0B' }}>
                Cook Salary Due (Cycle ending 17th)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Is ₹5,000 salary paid to {cookName}? Click to select Paid or Not.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#F59E0B' }}>
            <span>Pay Status</span>
            <ArrowRight size={14} />
          </div>
        </div>
      )}

      {/* ── Header Bar ── */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #171E2D 0%, #121824 100%)',
          border: '1px solid rgba(124, 92, 252, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(124, 92, 252, 0.4)',
              flexShrink: 0
            }}
          >
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--highlight)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isMorningTime ? '🌅 MORNING ROUTINE' : '🌙 TONIGHT\'S ROUTINE'}
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              What {cookName} Made Today
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <LayoutDashboard size={14} color="var(--highlight)" />
            <span>Dashboard Stats</span>
          </button>
          <button
            onClick={() => onNavigate('daily-entry')}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Edit2 size={14} />
            <span>Full Daily Entry</span>
          </button>
        </div>
      </div>

      {/* Primary Current Shift Spotlight Card */}
      <div
        className="card"
        style={{
          borderTop: isMorningTime ? '4px solid #F59E0B' : '4px solid #7C5CFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isMorningTime ? 'rgba(245, 158, 11, 0.15)' : 'rgba(124, 92, 252, 0.15)',
                color: isMorningTime ? '#F59E0B' : '#A78BFA',
                border: `1px solid ${isMorningTime ? 'rgba(245, 158, 11, 0.3)' : 'rgba(124, 92, 252, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isMorningTime ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {isMorningTime ? 'Morning Food' : 'Tonight\'s Food'}
                </h3>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(34, 211, 238, 0.15)',
                    color: 'var(--secondary-accent)',
                    border: '1px solid rgba(34, 211, 238, 0.3)'
                  }}
                >
                  NOW ACTIVE
                </span>
              </div>
              <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                {isMorningTime ? 'Breakfast & Lunch Preparation' : 'Evening & Dinner Preparation'}
              </span>
            </div>
          </div>

          <div>
            {isPrimaryUpdated ? (
              <StatusBadge status={primaryShiftData.status} size="md" />
            ) : (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                ⏳ Not Updated Yet
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isPrimaryUpdated ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.25rem' }}>
            {/* Foods list */}
            {primaryShiftData.status === 'present' || primaryShiftData.status === 'late' ? (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  MEALS PREPARED & QUANTITIES:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {renderFoodItems(primaryShiftData) || (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Marked present, but specific dishes not selected yet.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <span style={{ fontWeight: 800, color: '#f87171', fontSize: '0.875rem', display: 'block' }}>
                  Absent / On Leave ({primaryShiftData.reason || 'No reason provided'})
                </span>
                {primaryShiftData.note && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Note: {primaryShiftData.note}
                  </p>
                )}
              </div>
            )}

            {/* Note if any */}
            {primaryShiftData.note && primaryShiftData.status !== 'leave' && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Note: </span>
                {primaryShiftData.note}
              </div>
            )}

            {/* Edit button */}
            <button
              onClick={() => handleOpenEdit(primaryShiftType, primaryShiftData)}
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: '0.25rem', gap: '0.35rem' }}
            >
              <Edit2 size={13} color="var(--highlight)" />
              <span>Update {isMorningTime ? 'Morning' : 'Tonight\'s'} Meals</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.75rem',
              marginTop: '0.25rem'
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '380px' }}>
              {isMorningTime
                ? `Morning food has not been logged yet for today. What is ${cookName} cooking for breakfast or lunch?`
                : `Tonight's food has not been logged yet for today. What is ${cookName} cooking for dinner?`}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => handleOpenEdit(primaryShiftType, null)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <Plus size={15} />
                <span>Record {isMorningTime ? 'Morning Food' : 'Tonight\'s Food'}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedShiftForEdit({
                    date: today,
                    dateString: todayStr,
                    shift: primaryShiftType,
                    status: 'leave',
                    foods: [],
                    foodDetails: [],
                    reason: 'Personal Leave',
                    note: ''
                  });
                  setIsEditModalOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                Mark Leave
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Shift Card */}
      <div
        className="card"
        style={{
          borderTop: isMorningTime ? '3px solid #7C5CFC' : '3px solid #F59E0B',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isMorningTime ? 'rgba(124, 92, 252, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isMorningTime ? '#A78BFA' : '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isMorningTime ? <Moon size={16} /> : <Sun size={16} />}
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {isMorningTime ? 'Tonight\'s Food (Dinner)' : 'Morning Food (Breakfast/Lunch)'}
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isMorningTime ? 'Upcoming Shift' : 'Earlier Shift Today'}
              </span>
            </div>
          </div>

          <div>
            {isSecondaryUpdated ? (
              <StatusBadge status={secondaryShiftData.status} size="sm" />
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Not updated yet
              </span>
            )}
          </div>
        </div>

        {/* Secondary shift content */}
        {isSecondaryUpdated ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {renderFoodItems(secondaryShiftData) || (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  {secondaryShiftData.status === 'present' ? 'Present (No food logged)' : `Status: ${secondaryShiftData.status}`}
                </span>
              )}
            </div>
            <button
              onClick={() => handleOpenEdit(secondaryShiftType, secondaryShiftData)}
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              <Edit2 size={12} />
              <span>Edit</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {isMorningTime ? 'Prepare tonight\'s menu in advance' : 'Morning shift was not logged'}
            </span>
            <button
              onClick={() => handleOpenEdit(secondaryShiftType, null)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <Plus size={13} />
              <span>Log Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Shift Modal */}
      <EditShiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shift={selectedShiftForEdit}
        dishes={dishes}
        onDishCreated={(newDish) => setDishes(prev => [...prev, newDish])}
        onShiftSaved={fetchTodayData}
        onShiftDeleted={fetchTodayData}
      />
    </div>
  );
}
