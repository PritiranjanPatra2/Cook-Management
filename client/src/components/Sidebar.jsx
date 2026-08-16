import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  ChefHat,
  Calendar,
  FileBarChart,
  BarChart3,
  Settings,
  PlusCircle,
  LogOut,
  X,
  Sparkles,
  Wallet,
  UtensilsCrossed
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'today-menu', label: "What Cook Made", icon: UtensilsCrossed },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'daily-entry', label: 'Daily Entry', icon: PlusCircle },
  { id: 'salary', label: 'Cook Salary (₹5K)', icon: Wallet },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'food-meals', label: 'Food Library', icon: ChefHat },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reports', label: 'Monthly Reports', icon: FileBarChart },
  { id: 'food-analysis', label: 'Food Analysis', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, cookName = 'Cook' }) {
  const handleNav = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024 && setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 40,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: isOpen ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: isOpen || window.innerWidth >= 1024 ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: 'var(--shadow-xl)',
          minHeight: '100vh'
        }}
      >
        {/* App Branding */}
        <div
          style={{
            padding: '1.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)'
              }}
            >
              <ChefHat size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '700', lineHeight: 1.2 }}>
                Cook Manager
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={10} color="#a855f7" /> Routine Tracker
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'none',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cook Profile Card Badge */}
        <div
          style={{
            margin: '1rem 1.25rem 0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {cookName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8125rem', color: '#f8fafc', fontWeight: 600, truncate: 'true' }}>
              {cookName}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#10b981' }}>● 2 Shifts / Day</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                      color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--sidebar-text)';
                      }
                    }}
                  >
                    <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with Lock / Passcode Exit */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <LogOut size={16} />
            <span>Lock Screen</span>
          </button>
        </div>
      </aside>
    </>
  );
}
