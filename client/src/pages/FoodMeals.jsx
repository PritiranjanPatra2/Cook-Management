import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Power,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { dishService } from '../services/dishService';
import { DISH_CATEGORIES } from '../utils/constants';

export default function FoodMeals() {
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Other');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const res = await dishService.getDishes();
      if (res.success) {
        setDishes(res.data);
      }
    } catch (err) {
      console.error('Error loading dishes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDishes();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e?.preventDefault();
    if (!dishName.trim()) return;

    try {
      setSubmitting(true);
      if (editingDish) {
        // Update
        const res = await dishService.updateDish(editingDish._id, {
          name: dishName.trim(),
          category: dishCategory
        });
        if (res.success) {
          setToast({ message: 'Dish updated successfully!', type: 'success' });
          setEditingDish(null);
          setDishName('');
          setShowAddModal(false);
          loadDishes();
        }
      } else {
        // Create
        const res = await dishService.createDish({
          name: dishName.trim(),
          category: dishCategory
        });
        if (res.success) {
          setToast({ message: 'New dish added to library!', type: 'success' });
          setDishName('');
          setShowAddModal(false);
          loadDishes();
        }
      }
    } catch (err) {
      setToast({ message: err.message || 'Error saving dish', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (dish) => {
    try {
      const res = await dishService.toggleActive(dish._id);
      if (res.success) {
        setToast({
          message: `Dish "${dish.name}" ${res.data.active ? 'enabled' : 'disabled'}`,
          type: 'info'
        });
        loadDishes();
      }
    } catch (err) {
      setToast({ message: err.message || 'Toggle failed', type: 'error' });
    }
  };

  const handleDelete = async (dish) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${dish.name}"?`)) return;

    try {
      const res = await dishService.deleteDish(dish._id);
      if (res.success) {
        setToast({
          message: res.message || 'Dish removed',
          type: res.softDeleted ? 'info' : 'success'
        });
        loadDishes();
      }
    } catch (err) {
      setToast({ message: err.message || 'Delete failed', type: 'error' });
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return dish.name.toLowerCase().includes(q) || dish.category?.toLowerCase().includes(q);
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(124, 92, 252, 0.15)',
              color: 'var(--highlight)',
              border: '1px solid rgba(124, 92, 252, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChefHat size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: 'var(--text-main)' }}>Dish & Recipe Library</h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Manage dishes available during daily shift entry ({dishes.length} total dishes)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', width: '100%', maxWidth: '440px', justifyContent: 'flex-start' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '150px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '0.8125rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <button
            onClick={() => {
              setEditingDish(null);
              setDishName('');
              setDishCategory('Curry');
              setShowAddModal(true);
            }}
            className="btn btn-primary"
            style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Grid of Dishes */}
      {loading ? (
        <LoadingSpinner text="Loading dish library..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredDishes.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No dishes found. Click <b>Add New Dish</b> to create one!
            </div>
          ) : (
            filteredDishes.map((dish) => (
              <div
                key={dish._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: dish.active ? 1 : 0.6,
                  borderLeft: `4px solid ${dish.active ? 'var(--primary)' : 'var(--text-muted)'}`,
                  backgroundColor: 'var(--bg-surface)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {dish.name}
                    </h4>
                    {!dish.active && (
                      <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontWeight: '700' }}>
                        Disabled
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-block', marginTop: '2px' }}>
                    Category: <b style={{ color: 'var(--text-secondary)' }}>{dish.category || 'Other'}</b>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {/* Enable / Disable toggle */}
                  <button
                    onClick={() => handleToggleActive(dish)}
                    style={{
                      border: '1px solid var(--border)',
                      backgroundColor: dish.active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: dish.active ? '#4ade80' : 'var(--text-muted)',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title={dish.active ? 'Disable Dish' : 'Enable Dish'}
                  >
                    <Power size={14} />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditingDish(dish);
                      setDishName(dish.name);
                      setDishCategory(dish.category || 'Other');
                      setShowAddModal(true);
                    }}
                    style={{
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      color: 'var(--text-secondary)',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Edit Dish Name"
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(dish)}
                    style={{
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#f87171',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Delete / Deactivate Dish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 150,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card fade-in"
            style={{ width: '100%', maxWidth: '420px', backgroundColor: '#121824', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {editingDish ? 'Edit Dish' : 'Add New Dish'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Dish Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Soyabin Curry, Paneer Bhurji"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Category
                </label>
                <select
                  value={dishCategory}
                  onChange={(e) => setDishCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)'
                  }}
                >
                  {DISH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !dishName.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Saving...' : editingDish ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
