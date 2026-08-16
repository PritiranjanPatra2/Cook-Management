import React, { useState, useEffect } from 'react';
import Passcode from './pages/Passcode';
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import Attendance from './pages/Attendance';
import FoodMeals from './pages/FoodMeals';
import CalendarPage from './pages/CalendarPage';
import Reports from './pages/Reports';
import FoodAnalysis from './pages/FoodAnalysis';
import Settings from './pages/Settings';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { settingsService } from './services/settingsService';

const TAB_TITLES = {
  dashboard: 'Household Routine Dashboard',
  'daily-entry': 'Daily Shift & Meal Entry',
  attendance: 'Shift Attendance & Absence Logs',
  'food-meals': 'Food & Recipe Library',
  calendar: 'Monthly Attendance Calendar',
  reports: 'Executive Monthly Summary & Reports',
  'food-analysis': 'Meal Preparation Trends & Analytics',
  settings: 'Cook Profile & System Settings'
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cook_tracker_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    cookName: 'Cook',
    trackingStartDate: '2026-08-16'
  });

  useEffect(() => {
    if (isAuthenticated) {
      settingsService
        .getSettings()
        .then((res) => {
          if (res.success && res.data) {
            setSettings(res.data);
          }
        })
        .catch((err) => console.error('Error fetching settings:', err));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('cook_tracker_auth');
    setIsAuthenticated(false);
  };

  // If not authenticated, render Passcode screen
  if (!isAuthenticated) {
    return <Passcode onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            cookName={settings.cookName}
            trackingStartDate={settings.trackingStartDate}
          />
        );
      case 'daily-entry':
        return <DailyEntry onSavedNavigate={() => setActiveTab('dashboard')} />;
      case 'attendance':
        return <Attendance onNavigate={(tab) => setActiveTab(tab)} />;
      case 'food-meals':
        return <FoodMeals />;
      case 'calendar':
        return <CalendarPage onNavigate={(tab) => setActiveTab('daily-entry')} />;
      case 'reports':
        return <Reports cookName={settings.cookName} />;
      case 'food-analysis':
        return <FoodAnalysis />;
      case 'settings':
        return (
          <Settings
            onSettingsUpdated={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
          />
        );
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        cookName={settings.cookName}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          title={TAB_TITLES[activeTab] || 'Cook Manager'}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNavigate={(tab) => setActiveTab(tab)}
          cookName={settings.cookName}
        />

        <main className="page-content">{renderActiveTabContent()}</main>
      </div>
    </div>
  );
}
