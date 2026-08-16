import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { STATUS_OPTIONS, DEFAULT_REASONS } from '../utils/constants';
import FoodSelector from './FoodSelector';
import { shiftService } from '../services/shiftService';
import { formatDate } from '../utils/dateUtils';

export default function EditShiftModal({
  isOpen,
  onClose,
  shift,
  dishes = [],
  onDishCreated,
  onShiftSaved,
  onShiftDeleted
}) {
  if (!isOpen || !shift) return null;

  const [status, setStatus] = useState(shift.status || 'present');
  const [foods, setFoods] = useState(
    Array.isArray(shift.foods) ? shift.foods.map((f) => (typeof f === 'object' ? f._id : f)) : []
  );
  const [reason, setReason] = useState(shift.reason || '');
  const [note, setNote] = useState(shift.note || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setStatus(shift.status || 'present');
    setFoods(Array.isArray(shift.foods) ? shift.foods.map((f) => (typeof f === 'object' ? f._id : f)) : []);
    setReason(shift.reason || '');
    setNote(shift.note || '');
    setShowDeleteConfirm(false);
    setErrorMsg('');
  }, [shift]);

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg('');

      let res;
      if (shift._id) {
        res = await shiftService.updateShift(shift._id, {
          status,
          foods,
          reason,
          note
        });
      } else {
        res = await shiftService.saveShift({
          date: shift.dateString || shift.date,
          shift: shift.shift,
          status,
          foods,
          reason,
          note
        });
      }

      if (res.success) {
        if (onShiftSaved) onShiftSaved(res.data);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!shift._id) return;
    try {
      setIsDeleting(true);
      setErrorMsg('');
      const res = await shiftService.deleteShift(shift._id);
      if (res.success) {
        if (onShiftDeleted) onShiftDeleted(shift._id);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete shift');
    } finally {
      setIsDeleting(false);
    }
  };

  const isMorning = shift.shift === 'morning';
  const shiftLabel = isMorning ? 'Morning Shift' : 'Night Shift';
  const showFood = ['present', 'late'].includes(status) || foods.length > 0;
  const showReason = ['leave', 'no_work', 'other', 'late'].includes(status);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 150,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#121824',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          position: 'relative',
          padding: '1rem 1.25rem 1.5rem',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle / Pill */}
        <div
          style={{
            width: '38px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            margin: '0 auto 0.25rem',
            flexShrink: 0
          }}
        />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isMorning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(124, 92, 252, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
                border: `1px solid ${isMorning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(124, 92, 252, 0.3)'}`
              }}
            >
              {isMorning ? '🌅' : '🌙'}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                {formatDate(shift.dateString || shift.date)}
              </span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2 }}>
                Edit {shiftLabel}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 4-Column Balanced Status Grid */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
            Shift Status
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    padding: '0.5rem 0.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? opt.borderColor : 'var(--border)'}`,
                    backgroundColor: isSelected ? opt.bgColor : 'var(--bg-surface-elevated)',
                    color: isSelected ? opt.textColor : 'var(--text-muted)',
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: opt.dotColor,
                      display: 'inline-block',
                      flexShrink: 0
                    }}
                  />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Foods */}
        {showFood && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Foods Prepared ({foods.length})
            </label>
            <FoodSelector
              dishes={dishes}
              selectedDishIds={foods}
              onChange={setFoods}
              onDishCreated={onDishCreated}
            />
          </div>
        )}

        {/* Reason */}
        {showReason && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span>Reason for Absence</span>
            </label>
            <select
              value={DEFAULT_REASONS.includes(reason) ? reason : reason ? 'Other' : ''}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '0.875rem',
                color: 'var(--text-main)',
                marginBottom: '0.4rem',
                outline: 'none'
              }}
            >
              <option value="">Select reason...</option>
              {DEFAULT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {(reason === 'Other' || (!DEFAULT_REASONS.includes(reason) && reason)) && (
              <input
                type="text"
                placeholder="Specify custom reason..."
                value={reason === 'Other' ? '' : reason}
                onChange={(e) => setReason(e.target.value || 'Other')}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            )}
          </div>
        )}

        {/* Note */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Informed in advance, made special dishes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '0.875rem',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
        </div>

        {errorMsg && (
          <p style={{ color: '#ef4444', fontSize: '0.8125rem', fontWeight: '600' }}>
            {errorMsg}
          </p>
        )}

        {/* Delete Confirmation Box */}
        {showDeleteConfirm && (
          <div
            style={{
              padding: '0.875rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>
                Are you sure you want to delete this shift entry?
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-sm"
                style={{ backgroundColor: '#ef4444', color: '#fff', padding: '0.35rem 0.75rem' }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Entry'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', gap: '0.5rem' }}>
          {shift._id ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                background: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary btn-sm"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
