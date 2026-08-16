import React, { useState } from 'react';
import { Search, Plus, Check, Utensils, X, Tag } from 'lucide-react';
import { dishService } from '../services/dishService';

const PORTION_PRESETS = [
  'For 2-3',
  'For 3-4',
  'For 4-5',
  '4-6 Rotis',
  '8-10 Rotis',
  '12-15 Rotis',
  'Sufficient for 3-4',
  'Full Bowl'
];

export default function FoodSelector({
  dishes = [],
  selectedDishIds = [],
  foodDetails = [],
  onChange,
  onDishCreated
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const normalizeId = (id) => {
    if (!id) return '';
    if (typeof id === 'object') return String(id._id || id.id || id);
    return String(id);
  };

  const normalizedSelectedIds = (selectedDishIds || []).map(normalizeId);

  // Map to easily access quantity per dish id
  const quantityMap = {};
  if (Array.isArray(foodDetails)) {
    foodDetails.forEach(item => {
      const id = normalizeId(item?.dish || item);
      if (id) quantityMap[id] = item.quantity || '';
    });
  }

  // Filter active dishes by search term
  const filteredDishes = dishes.filter((dish) => {
    if (!dish.active) return false;
    if (!searchTerm.trim()) return true;
    return dish.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleDish = (dishId) => {
    const targetId = normalizeId(dishId);
    let nextIds = [];
    let nextDetails = [];

    if (normalizedSelectedIds.includes(targetId)) {
      nextIds = normalizedSelectedIds.filter((id) => id !== targetId);
      nextDetails = (foodDetails || []).filter(item => {
        const id = normalizeId(item?.dish || item);
        return id !== targetId;
      });
    } else {
      nextIds = [...normalizedSelectedIds, targetId];
      const targetDish = dishes.find(d => normalizeId(d._id) === targetId);
      const isRoti = targetDish && (targetDish.category === 'Bread' || /roti|chapati|paratha/i.test(targetDish.name));
      const defaultQty = isRoti ? '8-10 Rotis' : 'For 3-4';
      nextDetails = [...(foodDetails || []), { dish: targetId, quantity: defaultQty }];
    }

    if (onChange) {
      onChange(nextIds, nextDetails);
    }
  };

  const handleQuantityChange = (dishId, newQty) => {
    const targetId = normalizeId(dishId);
    const updatedDetails = normalizedSelectedIds.map(id => {
      if (id === targetId) {
        return { dish: id, quantity: newQty };
      }
      return { dish: id, quantity: quantityMap[id] || '' };
    });

    if (onChange) {
      onChange(normalizedSelectedIds, updatedDetails);
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
        const newId = normalizeId(res.data._id);
        if (!normalizedSelectedIds.includes(newId)) {
          const isRoti = res.data.category === 'Bread' || /roti|chapati|paratha/i.test(res.data.name);
          const defaultQty = isRoti ? '8-10 Rotis' : 'For 3-4';
          const nextIds = [...normalizedSelectedIds, newId];
          const nextDetails = [...(foodDetails || []), { dish: newId, quantity: defaultQty }];
          if (onChange) onChange(nextIds, nextDetails);
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

  // Selected dishes objects for quantity selector
  const selectedDishesList = dishes.filter(d => normalizedSelectedIds.includes(normalizeId(d._id)));

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
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-main)',
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
          style={{ whiteSpace: 'nowrap', gap: '0.3rem', flexShrink: 0 }}
        >
          <Plus size={15} color="var(--highlight)" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Dish Chips Grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          maxHeight: '170px',
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
                    border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
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

      {/* Selected Dish Quantity & Portion Filter Section */}
      {selectedDishesList.length > 0 && (
        <div
          style={{
            marginTop: '0.25rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <Tag size={13} color="var(--highlight)" />
            <span>SPECIFY QUANTITY / SERVING SIZE ({selectedDishesList.length} SELECTED)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {selectedDishesList.map((dish) => {
              const currentQty = quantityMap[dish._id] || '';
              const isRoti = dish.category === 'Bread' || /roti|chapati|paratha/i.test(dish.name);
              const presets = isRoti
                ? ['4-6 Rotis', '8-10 Rotis', '12-15 Rotis', 'Sufficient for 3-4']
                : ['For 2-3', 'For 3-4', 'For 4-5', 'Full Bowl'];

              return (
                <div
                  key={dish._id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--highlight)' }}>
                      🍲 {dish.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDish(dish._id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                      title="Remove dish"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Quantity preset filter chips & Custom button */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                    {presets.map((preset) => {
                      const isActive = currentQty === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleQuantityChange(dish._id, preset)}
                          style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: isActive ? 800 : 500,
                            backgroundColor: isActive ? 'rgba(124, 92, 252, 0.3)' : 'var(--bg-secondary)',
                            color: isActive ? 'var(--highlight)' : 'var(--text-secondary)',
                            border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {preset}
                        </button>
                      );
                    })}

                    {/* Dedicated Custom Quantity Button & Input */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: !presets.includes(currentQty) && currentQty ? 'rgba(34, 211, 238, 0.15)' : 'var(--bg-secondary)',
                        border: `1px solid ${!presets.includes(currentQty) && currentQty ? 'var(--secondary-accent)' : 'var(--border)'}`
                      }}
                    >
                      <span style={{ fontSize: '0.71875rem', fontWeight: 700, color: !presets.includes(currentQty) && currentQty ? 'var(--secondary-accent)' : 'var(--text-muted)' }}>
                        ✏️ Custom:
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 5 rotis, 2 bowls"
                        value={presets.includes(currentQty) ? '' : currentQty}
                        onChange={(e) => handleQuantityChange(dish._id, e.target.value)}
                        style={{
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-main)',
                          width: '130px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Dish Mini Modal */}
      {showAddModal && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid rgba(124, 92, 252, 0.3)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--highlight)' }}>
              Add New Dish to Library
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
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
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-main)'
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
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-main)'
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
