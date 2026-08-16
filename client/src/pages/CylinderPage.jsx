import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  RotateCcw,
  Zap,
  Tag,
  Trash2,
  Edit2,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { cylinderService } from '../services/cylinderService';
import { formatDate, toYYYYMMDD } from '../utils/dateUtils';

const STANDARD_WEIGHTS = [
  { label: '14.2 kg (Domestic)', value: 14.2 },
  { label: '19.0 kg (Commercial)', value: 19.0 },
  { label: '5.0 kg (Mini)', value: 5.0 }
];

const AGENCIES = ['Indane', 'HP Gas', 'Bharat Gas', 'Private / Other'];

export default function CylinderPage({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states for new cylinder
  const [connectedDate, setConnectedDate] = useState(toYYYYMMDD(new Date()));
  const [quantityKg, setQuantityKg] = useState(14.2);
  const [cost, setCost] = useState('');
  const [agency, setAgency] = useState('Indane');
  const [notes, setNotes] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentRes, historyRes] = await Promise.all([
        cylinderService.getCurrentCylinder(),
        cylinderService.getCylinderHistory()
      ]);

      if (currentRes.success) {
        setCurrentData(currentRes.data);
      }
      if (historyRes.success) {
        setHistory(historyRes.data || []);
      }
    } catch (err) {
      console.error('Error loading cylinder data:', err);
      showToast(err.message || 'Failed to load gas cylinder tracker', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnectCylinder = async (e) => {
    e?.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await cylinderService.connectNewCylinder({
        connectedDate,
        quantityKg: Number(quantityKg),
        cost: cost ? Number(cost) : 0,
        agency,
        notes
      });

      if (res.success) {
        showToast(res.message);
        setShowConnectModal(false);
        setCost('');
        setNotes('');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to connect new cylinder', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCylinder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cylinder record?')) return;
    try {
      const res = await cylinderService.deleteCylinder(id);
      if (res.success) {
        showToast('Record deleted');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Calculating gas cylinder & refill prediction..." />;
  }

  const hasActive = currentData?.hasActive;
  const active = currentData?.activeCylinder;
  const percentRemaining = currentData?.percentRemaining ?? 100;
  const daysElapsed = currentData?.daysElapsed ?? 0;
  const daysRemaining = currentData?.daysRemaining ?? 0;
  const gasRemainingKg = currentData?.gasRemainingKg ?? '14.2';
  const predictedEmptyDate = currentData?.predictedEmptyDate;
  const needsRefillAlert = currentData?.needsRefillAlert;
  const estimatedLifespan = currentData?.estimatedLifespan ?? 42;

  // Gas gauge color based on remaining %
  const getGaugeColor = (pct) => {
    if (pct > 40) return '#10B981'; // Green
    if (pct > 15) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      
      {/* ── 1. Top Header Card ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
              flexShrink: 0
            }}
          >
            <Flame size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Kitchen Utilities
              </span>
              <span style={{ fontSize: '0.6875rem', padding: '0.1rem 0.45rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                Smart Refill Predictor
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              LPG Gas Cylinder Tracker
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowConnectModal(true)}
          className="btn btn-primary"
          style={{
            gap: '0.45rem',
            backgroundColor: '#EF4444',
            borderColor: '#EF4444',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
          }}
        >
          <Plus size={16} />
          <span>Connect New Cylinder / Refilled</span>
        </button>
      </div>

      {/* ── 2. Refill Warning Banner (If near empty) ── */}
      {hasActive && needsRefillAlert && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            animation: 'pulse 2s infinite'
          }}
        >
          <div style={{ fontSize: '1.75rem' }}>🚨</div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f87171' }}>
              Time to Book Refill Cylinder!
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '2px' }}>
              Cylinder is on <b>Day {daysElapsed}</b> with only <b>~{daysRemaining} days left</b> ({gasRemainingKg} kg remaining). Expected to run out around <b>{formatDate(predictedEmptyDate)}</b>.
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Active Cylinder Fuel Gauge Spotlight ── */}
      {hasActive ? (
        <div
          className="card"
          style={{
            borderTop: `4px solid ${getGaugeColor(percentRemaining)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: getGaugeColor(percentRemaining), textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CURRENT CYLINDER STATUS
              </span>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {active.agency || 'Indane'} ({active.quantityKg} kg Cylinder)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Connected on <b>{formatDate(active.connectedDate)}</b> ({daysElapsed} days in use)
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: getGaugeColor(percentRemaining) }}>
                {percentRemaining}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ~{gasRemainingKg} kg left
              </span>
            </div>
          </div>

          {/* Visual Gas Meter Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div
              style={{
                width: '100%',
                height: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percentRemaining}%`,
                  background: percentRemaining > 40
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : percentRemaining > 15
                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                    : 'linear-gradient(90deg, #EF4444, #F87171)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.5s ease-in-out'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Day {daysElapsed} (Active)</span>
              <span>Predicted Lifespan: ~{estimatedLifespan} Days</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>DAYS REMAINING</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: getGaugeColor(percentRemaining), marginTop: '2px' }}>
                ~{daysRemaining} Days
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>PREDICTED EMPTY</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {predictedEmptyDate ? formatDate(predictedEmptyDate) : 'Calculating...'}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>REFILL COST</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--highlight)', marginTop: '2px' }}>
                ₹{active.cost || '850'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state when no cylinder logged yet */
        <div
          className="card"
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            border: '2px dashed var(--border)'
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>⛽</div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              No Active Gas Cylinder Logged
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', marginTop: '4px' }}>
              Log when your current cylinder was filled/connected, and the app will automatically predict how long it will last and notify you before it runs out.
            </p>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="btn btn-primary"
            style={{ gap: '0.45rem' }}
          >
            <Plus size={16} />
            <span>Connect First Cylinder</span>
          </button>
        </div>
      )}

      {/* ── 4. Past Cylinders Replacement History ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Cylinder Replacement History & Lifespan
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Average lifespan: <b>~{currentData?.averageLifespanDays || 42} days</b> per 14.2kg cylinder
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {history.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No past cylinder records yet.
            </div>
          ) : (
            history.map((c) => {
              const isActive = c.status === 'active';
              return (
                <div
                  key={c._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? '#10B981' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem'
                      }}
                    >
                      {isActive ? '🔥' : '⛽'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {c.agency || 'LPG'} ({c.quantityKg || 14.2} kg) {isActive && <span style={{ color: '#10B981', fontSize: '0.75rem', marginLeft: '4px' }}>● In Use</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span>Connected: {formatDate(c.connectedDate)}</span>
                        {c.finishedDate && <span>• Finished: {formatDate(c.finishedDate)}</span>}
                        {c.durationDays && <span>• <b>Lasted {c.durationDays} Days</b></span>}
                        {c.cost > 0 && <span>• ₹{c.cost}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleDeleteCylinder(c._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Delete Record"
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

      {/* ── Connect New Cylinder Modal ── */}
      {showConnectModal && (
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
          onClick={() => setShowConnectModal(false)}
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
                <span style={{ fontSize: '1.25rem' }}>⛽</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Connect New Gas Cylinder
                </h3>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConnectCylinder} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Connected Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Connected Date:
                </label>
                <input
                  type="date"
                  max={toYYYYMMDD(new Date())}
                  value={connectedDate}
                  onChange={(e) => setConnectedDate(e.target.value)}
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

              {/* Quantity / Weight with Custom Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Gas Quantity Filled (kg):
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171' }}>
                    {quantityKg} kg
                  </span>
                </div>

                {/* Preset Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {STANDARD_WEIGHTS.map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => setQuantityKg(w.value)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: Number(quantityKg) === w.value ? 800 : 500,
                        backgroundColor: Number(quantityKg) === w.value ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-secondary)',
                        color: Number(quantityKg) === w.value ? '#f87171' : 'var(--text-secondary)',
                        border: `1px solid ${Number(quantityKg) === w.value ? '#EF4444' : 'var(--border)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                {/* Direct Custom Number Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="100"
                    placeholder="Enter custom gas amount (e.g. 14.2, 5, 19, 10)..."
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    kg
                  </span>
                </div>
              </div>

              {/* Gas Agency */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Gas Agency / Provider:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {AGENCIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAgency(a)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8125rem',
                        fontWeight: agency === a ? 800 : 500,
                        backgroundColor: agency === a ? 'rgba(124, 92, 252, 0.2)' : 'var(--bg-secondary)',
                        color: agency === a ? 'var(--highlight)' : 'var(--text-secondary)',
                        border: `1px solid ${agency === a ? 'var(--primary)' : 'var(--border)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refill Cost */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Refill Price / Cost (₹):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 850"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
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

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delivered by Indane agent"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}
                >
                  {isSubmitting ? 'Starting...' : 'Start Tracking Cylinder'}
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
