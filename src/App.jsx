import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import AdityaDashboard from './components/AdityaDashboard';
import AdminManager from './components/AdminManager';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aditya_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to parse aditya_user from localStorage', e);
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('aditya_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aditya_theme', theme);
    } catch (e) {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('aditya_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aditya_user');
  };

  if (!currentUser) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />
    );
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminManager
        theme={theme}
        onClose={handleLogout}
      />
    );
  }

  return (
    <AdityaDashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
