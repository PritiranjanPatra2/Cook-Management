import React, { useState, useEffect } from 'react';
import { ChefHat, Delete, AlertCircle } from 'lucide-react';
import { settingsService } from '../services/settingsService';

export default function Passcode({ onAuthenticated }) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleDigit = (digit) => {
    if (loading || passcode.length >= 4) return;
    const next = passcode + digit;
    setPasscode(next);
    setErrorMsg('');
    if (next.length === 4) verify(next);
  };

  const handleDelete = () => {
    setPasscode(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const verify = async (code) => {
    try {
      setLoading(true);
      const res = await settingsService.verifyPasscode(code);
      if (res.success) {
        localStorage.setItem('cook_tracker_auth', 'true');
        onAuthenticated();
      } else {
        triggerError('Wrong passcode. Try 7894');
      }
    } catch (err) {
      triggerError('Wrong passcode. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => { setIsShaking(false); setPasscode(''); }, 500);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (loading) return;
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === 'Backspace') handleDelete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [passcode, loading]);

  const KEYS = ['1','2','3','4','5','6','7','8','9'];

  return (
    <div className="passcode-shell">
      {/* Logo */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: 'linear-gradient(135deg, #7C5CFC 0%, #6366F1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 12px 32px rgba(124, 92, 252, 0.45)'
        }}>
          <ChefHat size={38} color="white" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Cook Manager
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem' }}>
          Enter passcode to continue
        </p>
      </div>

      {/* Dot Indicators */}
      <div style={{
        display: 'flex', gap: '1.25rem', justifyContent: 'center',
        animation: isShaking ? 'shake 0.4s' : undefined
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`passcode-dot ${passcode.length > i ? 'filled' : ''}`} />
        ))}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.875rem', fontWeight: 600 }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Keypad */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.875rem', width: '100%', maxWidth: 280
      }}>
        {KEYS.map(n => (
          <button
            key={n}
            className="keypad-btn"
            onClick={() => handleDigit(n)}
            disabled={loading || passcode.length >= 4}
          >
            {n}
          </button>
        ))}

        {/* Clear */}
        <button
          className="keypad-btn"
          onClick={() => { setPasscode(''); setErrorMsg(''); }}
          style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}
        >
          Clear
        </button>

        {/* 0 */}
        <button
          className="keypad-btn"
          onClick={() => handleDigit('0')}
          disabled={loading || passcode.length >= 4}
        >
          0
        </button>

        {/* Delete */}
        <button
          className="keypad-btn"
          onClick={handleDelete}
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <Delete size={22} />
        </button>
      </div>

      {loading && (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
          Verifying...
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
        Default: <b style={{ color: 'rgba(255,255,255,0.55)' }}>7894</b>
      </p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
