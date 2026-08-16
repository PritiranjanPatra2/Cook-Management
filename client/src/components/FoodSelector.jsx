import React, { useState } from 'react';
import { Search, Plus, Check, Utensils, X } from 'lucide-react';
import { dishService } from '../services/dishService';

export default function FoodSelector({
  dishes = [],
  selectedDishIds = [],
  onChange,
  onDishCreated
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter active dishes by search term
  const filteredDishes = dishes.filter((dish) => {
    if (!dish.active) return false;
    if (!searchTerm.trim()) return true;
    return dish.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleDish = (dishId) => {
    if (selectedDishIds.includes(dishId)) {
      onChange(selectedDishIds.filter((id) => id !== dishId));
    } else {
      onChange([...selectedDishIds, dishId]);
    }
  };

  const handleCreateDish = async (e) => {
    e?.preventDefault();
    if (!newDishName.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await dishService.createDish({
        name: newDishName.trim(),
        category: newDishCategory
      });

      if (res.success && res.data) {
        if (onDishCreated) {
          onDishCreated(res.data);
        }
        // Automatically select the new dish
        if (!selectedDishIds.includes(res.data._id)) {
          onChange([...selectedDishIds, res.data._id]);
        }
        setNewDishName('');
        setShowAddModal(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create dish');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Search and Add Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search dishes (e.g. Soy, Dal, Roti)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface-subtle)',
              fontSize: '0.8125rem',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.5rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn btn-secondary btn-sm"
          style={{ whiteSpace: 'nowrap', gap: '0.3rem' }}
        >
          <Plus size={15} color="var(--primary)" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Dish Chips Grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          maxHeight: '190px',
          overflowY: 'auto',
          padding: '0.25rem 0'
        }}
      >
        {filteredDishes.length === 0 ? (
          <div style={{ padding: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            No dishes matching "{searchTerm}". Click <b>Add New Dish</b> to create it!
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const isSelected = selectedDishIds.includes(dish._id);
            return (
              <button
                key={dish._id}
                type="button"
                onClick={() => toggleDish(dish._id)}
                className={`dish-chip ${isSelected ? 'selected' : ''}`}
              >
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: isSelected ? 'none' : '1.5px solid #94a3b8',
                    backgroundColor: isSelected ? 'var(--primary)' : '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected && <Check size={11} strokeWidth={3.5} />}
                </span>
                <span>{dish.name}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Add New Dish Mini Modal */}
      {showAddModal && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '1rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)' }}>
              Add New Dish to Library
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Dish name (e.g. Paneer Curry)"
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateDish(e);
              }}
            />

            <select
              value={newDishCategory}
              onChange={(e) => setNewDishCategory(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="Curry">Curry</option>
              <option value="Rice">Rice</option>
              <option value="Dal">Dal</option>
              <option value="Bread">Bread / Roti</option>
              <option value="Side">Side Dish</option>
              <option value="Other">Other</option>
            </select>

            <button
              type="button"
              onClick={handleCreateDish}
              disabled={isSubmitting || !newDishName.trim()}
              className="btn btn-primary btn-sm"
            >
              {isSubmitting ? 'Adding...' : 'Add Dish'}
            </button>
          </div>

          {errorMsg && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: '600' }}>
              {errorMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
