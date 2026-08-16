import React, { useState, useEffect } from 'react';
import { ChefHat, Lock, KeyRound, ArrowRight, Delete, AlertCircle } from 'lucide-react';
import { settingsService } from '../services/settingsService';

export default function Passcode({ onAuthenticated }) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleDigit = (digit) => {
    if (passcode.length < 4) {
      const next = passcode + digit;
      setPasscode(next);
      if (next.length === 4) {
        verify(next);
      }
    }
  };

  const handleDelete = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPasscode('');
    setErrorMsg('');
  };

  const verify = async (codeToVerify) => {
    const code = codeToVerify || passcode;
    if (!code || code.length < 4) {
      setErrorMsg('Please enter all 4 digits');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await settingsService.verifyPasscode(code);

      if (res.success) {
        // Save session flag in localStorage
        localStorage.setItem('cook_tracker_auth', 'true');
        onAuthenticated();
      } else {
        triggerError('Invalid passcode. Try default: 7894');
      }
    } catch (err) {
      triggerError(err.message || 'Incorrect passcode. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPasscode('');
    }, 500);
  };

  // Keyboard support for desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        if (passcode.length === 4) verify(passcode);
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passcode, loading]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '1.5rem',
        color: '#ffffff'
      }}
    >
      <div
        className={`card ${isShaking ? 'shake' : ''}`}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: 'rgba(30, 41, 59, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2.25rem 1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Brand Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}
        >
          <ChefHat size={36} />
        </div>

        {/* Header */}
        <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>
          Cook Manager
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.75rem' }}>
          Enter passcode to continue
        </p>

        {/* 4-Digit Bullet Display */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.75rem',
            justifyContent: 'center'
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = passcode.length > index;
            return (
              <div
                key={index}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: isFilled ? '#6366f1' : 'transparent',
                  border: `2px solid ${isFilled ? '#818cf8' : 'rgba(255, 255, 255, 0.25)'}`,
                  boxShadow: isFilled ? '0 0 12px rgba(99, 102, 241, 0.6)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#f87171',
              fontSize: '0.8125rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              disabled={loading || passcode.length >= 4}
              style={{
                height: '56px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '1.375rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            style={{
              height: '56px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: '#94a3b8',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={loading || passcode.length >= 4}
            style={{
              height: '56px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '1.375rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            0
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            style={{
              height: '56px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Initial passcode hint */}
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
          Initial default passcode: <b style={{ color: '#818cf8' }}>7894</b>
        </p>
      </div>
    </div>
  );
}
