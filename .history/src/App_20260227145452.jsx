import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Sidebar, Topbar } from './components/layout/Sidebar';
import { useAuth } from './hooks/useAuth';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
};

export default function App() {
  const { user, isLoading, error: authError, login, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  // DEBUG: Log status
  console.log('App render:', { user: !!user, isLoading, authError });

  // Kalau masih loading auth
  if (isLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontSize: '18px' }}>
        Loading authentication...
      </div>
    );
  }

  // Belum login
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoginPage onLogin={login} error={authError} />
      </div>
    );
  }

  // Sudah login - MAIN APP
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={activePage} onNav={setActivePage} user={user} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          pageTitle={PAGE_TITLES[activePage] || 'Dashboard'}
          user={user}
          onLogout={logout}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}
