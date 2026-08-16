import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Plus,
  Share2,
  Copy,
  Utensils,
  Search,
  Trash2,
  Edit2,
  Sparkles,
  X,
  Check,
  Tag,
  ArrowRight,
  Package,
  Layers
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { groceryService } from '../services/groceryService';
import { formatDate } from '../utils/dateUtils';

const CATEGORIES = [
  'All',
  'Grains & Flours',
  'Dairy & Milk',
  'Vegetables',
  'Pulses & Dal',
  'Oils & Spices',
  'Other'
];

const PRESET_ITEMS = [
  { name: 'Atta (Wheat Flour)', qty: '5 kg', cat: 'Grains & Flours' },
  { name: 'Basmati Rice', qty: '5 kg', cat: 'Grains & Flours' },
  { name: 'Toor / Moong Dal', qty: '1 kg', cat: 'Pulses & Dal' },
  { name: 'Fresh Paneer', qty: '500 g', cat: 'Dairy & Milk' },
  { name: 'Cooking Oil', qty: '1 Litre', cat: 'Oils & Spices' },
  { name: 'Onions (Pyaz)', qty: '2 kg', cat: 'Vegetables' },
  { name: 'Potatoes (Aloo)', qty: '2 kg', cat: 'Vegetables' },
  { name: 'Tomatoes', qty: '1 kg', cat: 'Vegetables' },
  { name: 'Green Chillies & Ginger', qty: '250 g', cat: 'Vegetables' },
  { name: 'Eggs', qty: '12 pcs', cat: 'Dairy & Milk' }
];

export default function GroceryPage({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [whatCanMakeData, setWhatCanMakeData] = useState(null);
  const [activeView, setActiveView] = useState('list'); // 'list' | 'what-to-make'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'need_to_buy' | 'in_stock'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [status, setStatus] = useState('need_to_buy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, recipeRes] = await Promise.all([
        groceryService.getGroceries(),
        groceryService.whatCanWeMake()
      ]);

      if (res.success && res.data) {
        setItems(res.data.items || []);
      }
      if (recipeRes.success && recipeRes.data) {
        setWhatCanMakeData(recipeRes.data);
      }
    } catch (err) {
      console.error('Error loading groceries:', err);
      showToast(err.message || 'Failed to load grocery pantry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (item) => {
    try {
      const res = await groceryService.toggleStatus(item._id);
      if (res.success) {
        showToast(res.message);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleAddItem = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await groceryService.createGrocery({
        name,
        quantity: quantity || '1 unit',
        category,
        status
      });

      if (res.success) {
        showToast(res.message);
        setShowAddModal(false);
        setName('');
        setQuantity('');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await groceryService.deleteGrocery(id);
      if (res.success) {
        showToast(res.message);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  // WhatsApp formatted export
  const handleWhatsAppExport = () => {
    const needToBuyItems = items.filter(i => i.status === 'need_to_buy');
    if (needToBuyItems.length === 0) {
      showToast('No items currently in "Need to Buy" list!', 'error');
      return;
    }

    const dateStr = formatDate(new Date());
    let message = `🛒 *KITCHEN GROCERY LIST (${dateStr})*\n`;
    message += `──────────────────────\n`;
    needToBuyItems.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* — ${item.quantity || '1 unit'}\n`;
    });
    message += `──────────────────────\n`;
    message += `_Shared via Cook Management App_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyList = () => {
    const needToBuyItems = items.filter(i => i.status === 'need_to_buy');
    if (needToBuyItems.length === 0) {
      showToast('No items currently in "Need to Buy" list!', 'error');
      return;
    }
    const dateStr = formatDate(new Date());
    let message = `🛒 KITCHEN GROCERY LIST (${dateStr})\n`;
    needToBuyItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} — ${item.quantity || '1 unit'}\n`;
    });

    navigator.clipboard.writeText(message);
    showToast('Shopping list copied to clipboard! 📋');
  };

  if (loading) {
    return <LoadingSpinner text="Loading kitchen groceries & recipe matcher..." />;
  }

  const needToBuyItems = items.filter(i => i.status === 'need_to_buy');
  const inStockItems = items.filter(i => i.status === 'in_stock');

  // Filter items for display
  const filteredItems = items.filter(item => {
    if (filterStatus === 'need_to_buy' && item.status !== 'need_to_buy') return false;
    if (filterStatus === 'in_stock' && item.status !== 'in_stock') return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchTerm.trim() && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      
      {/* ── 1. Top Header Banner ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(124, 92, 252, 0.12) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              flexShrink: 0
            }}
          >
            <ShoppingCart size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Kitchen Pantry & Groceries
              </span>
              <span style={{ fontSize: '0.6875rem', padding: '0.1rem 0.45rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                {needToBuyItems.length} Need to Buy
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              Smart Grocery & Pantry
            </h2>
          </div>
        </div>

        {/* Action Buttons: WhatsApp Export & Add Item */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleWhatsAppExport}
            className="btn btn-primary"
            style={{
              backgroundColor: '#25D366',
              borderColor: '#25D366',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
              gap: '0.4rem',
              fontWeight: 800
            }}
          >
            <Share2 size={16} />
            <span>Send to WhatsApp ({needToBuyItems.length})</span>
          </button>

          <button
            onClick={handleCopyList}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
            title="Copy shopping list text"
          >
            <Copy size={14} />
            <span>Copy</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', borderColor: 'var(--primary)', color: 'var(--highlight)' }}
          >
            <Plus size={15} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* ── 2. View Toggle Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveView('list')}
          style={{
            flex: 1,
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${activeView === 'list' ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: activeView === 'list' ? 'rgba(124, 92, 252, 0.2)' : 'var(--bg-secondary)',
            color: activeView === 'list' ? 'var(--highlight)' : 'var(--text-secondary)',
            fontWeight: activeView === 'list' ? 800 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <ShoppingCart size={16} />
          <span>Grocery Checklist ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveView('what-to-make')}
          style={{
            flex: 1,
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${activeView === 'what-to-make' ? '#10B981' : 'var(--border)'}`,
            backgroundColor: activeView === 'what-to-make' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
            color: activeView === 'what-to-make' ? '#10B981' : 'var(--text-secondary)',
            fontWeight: activeView === 'what-to-make' ? 800 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <Utensils size={16} />
          <span>🍳 What Can We Make? ({whatCanMakeData?.readyToMake?.length || 0})</span>
        </button>
      </div>

      {/* ── View 1: Grocery Checklist & Status Filter ── */}
      {activeView === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Status Filter Tabs (All / Need to Buy / In Stock) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => setFilterStatus('all')}
                className={`tab-pill ${filterStatus === 'all' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                All Items ({items.length})
              </button>
              <button
                onClick={() => setFilterStatus('need_to_buy')}
                className={`tab-pill ${filterStatus === 'need_to_buy' ? 'active' : ''}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: filterStatus === 'need_to_buy' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                  color: filterStatus === 'need_to_buy' ? '#f87171' : undefined
                }}
              >
                🛒 Need to Buy ({needToBuyItems.length})
              </button>
              <button
                onClick={() => setFilterStatus('in_stock')}
                className={`tab-pill ${filterStatus === 'in_stock' ? 'active' : ''}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: filterStatus === 'in_stock' ? 'rgba(16, 185, 129, 0.2)' : undefined,
                  color: filterStatus === 'in_stock' ? '#10B981' : undefined
                }}
              >
                ✅ In Stock ({inStockItems.length})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search groceries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.65rem 0.35rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem'
                }}
              />
            </div>
          </div>

          {/* Grocery Items List */}
          <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No grocery items found matching your filters.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isInStock = item.status === 'in_stock';
                return (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: isInStock ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.05)',
                      border: `1px solid ${isInStock ? 'var(--border)' : 'rgba(239, 68, 68, 0.25)'}`,
                      borderRadius: 'var(--radius-md)',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Checkbox toggle */}
                    <div
                      onClick={() => handleToggleStatus(item)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1, minWidth: 0 }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: `2px solid ${isInStock ? '#10B981' : '#f87171'}`,
                          backgroundColor: isInStock ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isInStock ? '#10B981' : '#f87171',
                          flexShrink: 0
                        }}
                      >
                        {isInStock ? <Check size={15} strokeWidth={3} /> : <span style={{ fontSize: '0.6875rem', fontWeight: 800 }}>🛒</span>}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: isInStock ? 'var(--text-main)' : '#fca5a5',
                            textDecoration: isInStock ? 'none' : 'none'
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '2px' }}>
                          <span>Quantity: <b style={{ color: 'var(--text-secondary)' }}>{item.quantity || '1 unit'}</b></span>
                          <span>• {item.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge & delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleStatus(item)}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.71875rem',
                          fontWeight: 800,
                          backgroundColor: isInStock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isInStock ? '#10B981' : '#f87171',
                          border: `1px solid ${isInStock ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {isInStock ? 'In Stock ✅' : 'Need to Buy 🛒'}
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                        title="Delete item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── View 2: "What Can We Make?" Smart Recipe Matcher ── */}
      {activeView === 'what-to-make' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div style={{ fontSize: '1.75rem' }}>💡</div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10B981' }}>
                {whatCanMakeData?.summary || 'Pantry Recipe Matcher'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Based on your <b>{whatCanMakeData?.inStockItemsCount || 0} In-Stock ingredients</b>, here are the dishes you can ask your cook to make right now!
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
            {whatCanMakeData?.readyToMake?.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No complete recipe matches found. Mark more items as "In Stock" to see suggestions!
              </div>
            ) : (
              whatCanMakeData?.readyToMake?.map(({ dish, keyIngredient }) => (
                <div
                  key={dish._id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderLeft: '4px solid #10B981',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>
                        ✅ READY TO COOK
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {dish.category}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {dish.name}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Key Ingredient: <b>{keyIngredient}</b> (In Stock)
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('daily-entry')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', justifyContent: 'space-between', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10B981' }}
                  >
                    <span>Log in Daily Entry</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Add Custom Grocery Item Modal ── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card fade-in"
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#121824',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🛒</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Add Grocery / Pantry Item
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Quick Presets:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {PRESET_ITEMS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setName(p.name);
                      setQuantity(p.qty);
                      setCategory(p.cat);
                    }}
                    style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.71875rem',
                      backgroundColor: name === p.name ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                      color: name === p.name ? '#10B981' : 'var(--text-secondary)',
                      border: `1px solid ${name === p.name ? '#10B981' : 'var(--border)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Item Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Item Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atta, Paneer, Mustard Oil, Onions..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Quantity / Unit:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 kg, 500 g, 1 Litre, 12 pcs..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Initial Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Status:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStatus('need_to_buy')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: status === 'need_to_buy' ? 800 : 500,
                      backgroundColor: status === 'need_to_buy' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-secondary)',
                      color: status === 'need_to_buy' ? '#f87171' : 'var(--text-secondary)',
                      border: `1px solid ${status === 'need_to_buy' ? '#EF4444' : 'var(--border)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    🛒 Need to Buy
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('in_stock')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: status === 'in_stock' ? 800 : 500,
                      backgroundColor: status === 'in_stock' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                      color: status === 'in_stock' ? '#10B981' : 'var(--text-secondary)',
                      border: `1px solid ${status === 'in_stock' ? '#10B981' : 'var(--border)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    ✅ In Stock
                  </button>
                </div>
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
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {isSubmitting ? 'Adding...' : 'Add to List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
