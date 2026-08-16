import React from 'react';
import { Sun, Moon, Utensils, MessageSquare, AlertTriangle, FileText } from 'lucide-react';
import FoodSelector from './FoodSelector';
import { STATUS_OPTIONS, DEFAULT_REASONS } from '../utils/constants';

export default function ShiftCard({
  shiftType, // 'morning' | 'evening'
  shiftTitle, // e.g. "Morning Shift"
  shiftData, // { status, foods: [], reason, note }
  onChange,
  dishes = [],
  onDishCreated,
  customReasons = DEFAULT_REASONS,
  onSaveSingleShift,
  isSavingSingle = false
}) {
  const isMorning = shiftType === 'morning';
  const currentStatus = shiftData.status || 'present';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <span>{isSavingSingle ? 'Saving...' : `Save ${isMorning ? 'Morning' : 'Night'} Only`}</span>
          </button>
        )}
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
