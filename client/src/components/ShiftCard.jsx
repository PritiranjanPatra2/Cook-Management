import React, { useState, useEffect } from 'react';
import { Sun, Moon, Utensils, AlertTriangle, FileText, CheckCircle2, Edit2, X } from 'lucide-react';
import FoodSelector from './FoodSelector';
import { STATUS_OPTIONS, DEFAULT_REASONS } from '../utils/constants';

export default function ShiftCard({
  shiftType, // 'morning' | 'evening'
  shiftTitle, // e.g. "Morning Shift"
  shiftData, // { _id, status, foods: [], foodDetails: [], reason, note }
  onChange,
  dishes = [],
  onDishCreated,
  customReasons = DEFAULT_REASONS,
  onSaveSingleShift,
  isSavingSingle = false
}) {
  const isMorning = shiftType === 'morning';
  const currentStatus = shiftData.status || 'present';
  const isSaved = Boolean(shiftData?._id);
  const [isEditing, setIsEditing] = useState(!isSaved);

  // When date changes or shiftData._id updates, set edit state appropriately
  useEffect(() => {
    setIsEditing(!Boolean(shiftData?._id));
  }, [shiftData?._id]);

  const handleStatusChange = (newStatus) => {
    onChange({
      ...shiftData,
      status: newStatus
    });
  };

  const handleFoodsChange = (newFoods, newDetails) => {
    onChange({
      ...shiftData,
      foods: newFoods,
      foodDetails: newDetails || shiftData.foodDetails || []
    });
  };

  const handleReasonChange = (newReason) => {
    onChange({
      ...shiftData,
      reason: newReason
    });
  };

  const handleNoteChange = (newNote) => {
    onChange({
      ...shiftData,
      note: newNote
    });
  };

  const showFoodSection = ['present', 'late'].includes(currentStatus) || (shiftData.foods && shiftData.foods.length > 0);
  const showReasonSection = ['leave', 'other', 'late'].includes(currentStatus);

  // If already saved and not in edit mode -> render "Already Saved" card
  if (!isEditing && isSaved) {
    const statusOption = STATUS_OPTIONS.find((o) => o.value === currentStatus) || STATUS_OPTIONS[0];

    const foodItems = [];
    if (Array.isArray(shiftData.foodDetails) && shiftData.foodDetails.length > 0) {
      shiftData.foodDetails.forEach((detail) => {
        const dishId = detail.dish?._id || detail.dish;
        const dishObj =
          typeof detail.dish === 'object' && detail.dish?.name
            ? detail.dish
            : dishes.find((d) => String(d._id) === String(dishId));
        const name = dishObj?.name || 'Dish';
        const category = dishObj?.category || 'Dish';
        const quantity = detail.quantity || 'Sufficient';
        foodItems.push({ name, category, quantity });
      });
    } else if (Array.isArray(shiftData.foods) && shiftData.foods.length > 0) {
      shiftData.foods.forEach((food) => {
        const dishId = food?._id || food;
        const dishObj =
          typeof food === 'object' && food?.name
            ? food
            : dishes.find((d) => String(d._id) === String(dishId));
        const name = dishObj?.name || 'Dish';
        const category = dishObj?.category || 'Dish';
        foodItems.push({ name, category, quantity: 'Sufficient' });
      });
    }

    return (
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderTop: isMorning ? '3px solid #F59E0B' : '3px solid #7C5CFC',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isMorning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(124, 92, 252, 0.15)',
                color: isMorning ? '#F59E0B' : '#A78BFA',
                border: `1px solid ${isMorning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(124, 92, 252, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isMorning ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {shiftTitle || (isMorning ? '🌅 Morning Shift' : '🌙 Night Shift')}
                </h3>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>Already Saved</span>
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isMorning ? 'Breakfast / Lunch Prep' : 'Dinner / Night Meal Prep'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: isMorning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(124, 92, 252, 0.4)',
              color: isMorning ? '#F59E0B' : '#A78BFA',
              fontWeight: 700,
              gap: '0.35rem',
              fontSize: '0.8125rem',
              padding: '0.35rem 0.75rem'
            }}
          >
            <Edit2 size={14} />
            <span>Edit Shift</span>
          </button>
        </div>

        {/* Saved Snapshot Details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: statusOption.bgColor,
                color: statusOption.textColor,
                border: `1px solid ${statusOption.borderColor}`,
                fontSize: '0.8125rem',
                fontWeight: 700
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: statusOption.dotColor }} />
              <span>{statusOption.label}</span>
            </span>
          </div>

          {/* Meals Prepared */}
          {['present', 'late'].includes(currentStatus) && (
            <div>
              <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Meals Prepared ({foodItems.length}):
              </span>
              {foodItems.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {foodItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.65rem',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🍲 {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.71875rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(34, 211, 238, 0.15)',
                          color: 'var(--secondary-accent)',
                          border: '1px solid rgba(34, 211, 238, 0.3)'
                        }}
                      >
                        📊 {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No specific dishes recorded.
                </span>
              )}
            </div>
          )}

          {/* Reason */}
          {shiftData.reason && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Reason:</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ {shiftData.reason}</span>
            </div>
          )}

          {/* Note */}
          {shiftData.note && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Note:</span>
              <span style={{ color: 'var(--text-secondary)' }}>💬 {shiftData.note}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderTop: isMorning ? '3px solid #F59E0B' : '3px solid #7C5CFC',
        position: 'relative'
      }}
    >
      {/* Shift Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: isMorning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(124, 92, 252, 0.15)',
              color: isMorning ? '#F59E0B' : '#A78BFA',
              border: `1px solid ${isMorning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(124, 92, 252, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMorning ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {shiftTitle || (isMorning ? '🌅 Morning Shift' : '🌙 Night Shift')}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isMorning ? 'Breakfast / Lunch Prep' : 'Dinner / Night Meal Prep'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isSaved && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78125rem', padding: '0.35rem 0.65rem' }}
            >
              <X size={13} />
              <span>Cancel</span>
            </button>
          )}

          {onSaveSingleShift && (
            <button
              type="button"
              onClick={() => onSaveSingleShift(shiftType)}
              disabled={isSavingSingle}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: isMorning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(124, 92, 252, 0.4)',
                color: isMorning ? '#F59E0B' : '#A78BFA',
                fontWeight: '700',
                gap: '0.35rem',
                fontSize: '0.78125rem'
              }}
            >
              <span>{isSavingSingle ? 'Saving...' : `Save ${isMorning ? 'Morning' : 'Night'}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Selector Buttons */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Status
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = currentStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusChange(opt.value)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? opt.borderColor : 'var(--border)'}`,
                  backgroundColor: isSelected ? opt.bgColor : 'var(--bg-surface-elevated)',
                  color: isSelected ? opt.textColor : 'var(--text-secondary)',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: opt.dotColor
                  }}
                />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Made Section */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          opacity: showFoodSection ? 1 : 0.6,
          transition: 'opacity 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
            <Utensils size={16} color="var(--primary)" />
            <span>Food Made</span>
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {shiftData.foods?.length || 0} selected
          </span>
        </div>

        <FoodSelector
          dishes={dishes}
          selectedDishIds={shiftData.foods || []}
          foodDetails={shiftData.foodDetails || []}
          onChange={handleFoodsChange}
          onDishCreated={onDishCreated}
        />
      </div>

      {/* Reason for Absence */}
      {showReasonSection && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span>Reason for Absence</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={customReasons.includes(shiftData.reason) ? shiftData.reason : shiftData.reason ? 'Other' : ''}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  handleReasonChange('Other');
                } else {
                  handleReasonChange(e.target.value);
                }
              }}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '0.875rem',
                color: 'var(--text-main)'
              }}
            >
              <option value="">Select reason...</option>
              {customReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Custom reason text input if Other selected */}
            {(shiftData.reason === 'Other' || (!customReasons.includes(shiftData.reason) && shiftData.reason)) && (
              <input
                type="text"
                placeholder="Specify custom reason..."
                value={shiftData.reason === 'Other' ? '' : shiftData.reason}
                onChange={(e) => handleReasonChange(e.target.value || 'Other')}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Optional Note */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          <FileText size={15} color="var(--text-muted)" />
          <span>Note (Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Told in advance, made special lunch, came late..."
          value={shiftData.note || ''}
          onChange={(e) => handleNoteChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            fontSize: '0.875rem',
            color: 'var(--text-main)'
          }}
        />
      </div>

      {/* Card Footer with Individual Save Button */}
      {onSaveSingleShift && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => onSaveSingleShift(shiftType)}
            disabled={isSavingSingle}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', padding: '0.6rem 1rem' }}
          >
            <span>{isSavingSingle ? 'Saving...' : `Save ${isMorning ? '🌅 Morning Shift' : '🌙 Night Shift'}`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
