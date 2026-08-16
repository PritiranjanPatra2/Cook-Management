import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  BarChart2,
  UtensilsCrossed,
  Menu,
  X,
  LogOut,
  Settings as SettingsIcon,
  ChefHat,
  BookOpen
} from 'lucide-react';
import Passcode from './pages/Passcode';
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import Attendance from './pages/Attendance';
import FoodMeals from './pages/FoodMeals';
import CalendarPage from './pages/CalendarPage';
import Reports from './pages/Reports';
import FoodAnalysis from './pages/FoodAnalysis';
import Settings from './pages/Settings';
import { settingsService } from './services/settingsService';
import { formatDate } from './utils/dateUtils';

const BOTTOM_TABS = [
  { id: 'dashboard',   label: 'Home',      icon: LayoutDashboard },
  { id: 'daily-entry', label: 'Entry',     icon: ClipboardList },
  { id: 'calendar',    label: 'Calendar',  icon: CalendarDays },
  { id: 'attendance',  label: 'Attendance',icon: BarChart2 },
];

const DRAWER_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'daily-entry',   label: 'Daily Entry',      icon: ClipboardList },
  { id: 'calendar',      label: 'Calendar',         icon: CalendarDays },
  { id: 'attendance',    label: 'Attendance',        icon: BarChart2 },
  { id: 'reports',       label: 'Monthly Reports',  icon: BookOpen },
  { id: 'food-analysis', label: 'Food Analysis',    icon: BarChart2 },
  { id: 'food-meals',    label: 'Food Library',     icon: UtensilsCrossed },
  { id: 'settings',      label: 'Settings',         icon: SettingsIcon },
];

const TAB_TITLES = {
  dashboard:      'Household Routine Dashboard',
  'daily-entry':  'Daily Entry',
  attendance:     'Attendance',
  'food-meals':   'Food Library',
  calendar:       'Calendar',
  reports:        'Monthly Reports',
  'food-analysis':'Food Analysis',
  settings:       'Settings',
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('cook_tracker_auth') === 'true'
  );
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settings, setSettings] = useState({ cookName: 'Cook', trackingStartDate: '2026-08-16' });

  useEffect(() => {
    if (isAuthenticated) {
      settingsService.getSettings()
        .then(res => { if (res.success && res.data) setSettings(res.data); })
        .catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Passcode onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const navigate = (tab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':      return <Dashboard onNavigate={navigate} cookName={settings.cookName} trackingStartDate={settings.trackingStartDate} />;
      case 'daily-entry':    return <DailyEntry onSavedNavigate={() => navigate('dashboard')} />;
      case 'attendance':     return <Attendance onNavigate={navigate} />;
      case 'food-meals':     return <FoodMeals />;
      case 'calendar':       return <CalendarPage onNavigate={() => navigate('daily-entry')} />;
      case 'reports':        return <Reports cookName={settings.cookName} />;
      case 'food-analysis':  return <FoodAnalysis />;
      case 'settings':       return <Settings onSettingsUpdated={s => setSettings(p => ({ ...p, ...s }))} />;
      default:               return <Dashboard onNavigate={navigate} cookName={settings.cookName} />;
    }
  };

  const todayLabel = formatDate(new Date());

  return (
    <div className="mobile-shell">
      {/* ── Header ── */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            className="mobile-header-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="mobile-header-title">{TAB_TITLES[activeTab]}</span>
        </div>
        <div className="mobile-header-date-badge">
          <CalendarDays size={13} />
          <span>{todayLabel}</span>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="mobile-page-content fade-in" key={activeTab}>
        {renderPage()}
      </main>

      {/* ── FAB (Daily Entry shortcut) ── */}
      {activeTab !== 'daily-entry' && (
        <button
          className="fab"
          onClick={() => navigate('daily-entry')}
          title="New Entry"
          aria-label="New daily entry"
        >
          +
        </button>
      )}

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav">
        {BOTTOM_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tab.id)}
            >
              <div className="bottom-nav-icon-wrap">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="drawer">
            {/* Drawer Header */}
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ChefHat size={22} color="white" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 800 }}>Cook Manager</div>
                    <div style={{ fontSize: '0.8125rem', opacity: 0.75 }}>{settings.cookName}</div>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: 'white', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Nav Items */}
            <div style={{ padding: '0.5rem 0', flex: 1 }}>
              {DRAWER_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`drawer-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.id)}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 0 1.5rem' }}>
              <button
                className="drawer-nav-item"
                onClick={() => {
                  localStorage.removeItem('cook_tracker_auth');
                  setIsAuthenticated(false);
                  setDrawerOpen(false);
                }}
                style={{ color: '#ef4444' }}
              >
                <LogOut size={18} color="#ef4444" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
