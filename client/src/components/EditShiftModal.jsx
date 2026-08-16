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

  const shiftLabel = shift.shift === 'morning' ? '🌅 Morning Shift' : '🌙 Evening Shift';
  const showFood = ['present', 'late'].includes(status) || foods.length > 0;
  const showReason = ['leave', 'no_work', 'other', 'late'].includes(status);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 60,
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              {formatDate(shift.dateString || shift.date)}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Edit {shiftLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Status
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? opt.borderColor : 'var(--border)'}`,
                    backgroundColor: isSelected ? opt.bgColor : '#ffffff',
                    color: isSelected ? opt.textColor : 'var(--text-muted)',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '0.8125rem',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Foods */}
        {showFood && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Foods Prepared
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
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              Reason
            </label>
            <select
              value={DEFAULT_REASONS.includes(reason) ? reason : reason ? 'Other' : ''}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginBottom: '0.4rem'
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
                placeholder="Custom reason..."
                value={reason === 'Other' ? '' : reason}
                onChange={(e) => setReason(e.target.value || 'Other')}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              />
            )}
          </div>
        )}

        {/* Note */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            Note
          </label>
          <input
            type="text"
            placeholder="Add note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}
          />
        </div>

        {errorMsg && (
          <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem', fontWeight: '600' }}>
            {errorMsg}
          </p>
        )}

        {/* Delete Confirmation Box */}
        {showDeleteConfirm && (
          <div
            style={{
              padding: '0.875rem',
              backgroundColor: '#fef2f2',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fecaca',
              marginBottom: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.5rem' }}>
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
                className="btn btn-danger btn-sm"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {shift._id ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                background: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: '600'
              }}
            >
              <Trash2 size={15} />
              <span>Delete Entry</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
