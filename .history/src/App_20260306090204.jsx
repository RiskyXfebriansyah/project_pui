// ============================================================
//  App.jsx — sidebar refresh + onRefresh ke LaporanPage
//  FIX: PemantauanPage menerima prop onLoadRiwayat
//  FIX: PenggunaPage menerima prop onAddOrtu
//  ADD: PosyanduPage + usePosyandu
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import BalitaPage      from './pages/BalitaPage';
import LaporanPage     from './pages/LaporanPage';
import JadwalPage      from './pages/JadwalPage';
import PenggunaPage    from './pages/PenggunaPage';
import { PosyanduPage } from './pages/PosyanduPage';
import PemantauanPage  from './pages/PemantauanPage';
import StuntingPage    from './pages/StuntingPage';
import { Sidebar, Topbar } from './components/layout/Sidebar';
import { useAuth }      from './hooks/useAuth';
import { useBalita }    from './hooks/useBalita';
import { useJadwal }    from './hooks/useJadwal';
import { usePengguna }  from './hooks/usePengguna';
import { usePosyandu }  from './hooks/usePosyandu';   // ← tambahkan import ini

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  balita:     'Data Balita',
  pemantauan: 'Pemantauan Tumbuh Kembang',
  stunting:   'Analisis Stunting',
  jadwal:     'Jadwal Posyandu',
  laporan:    'Laporan Bulanan',
  posyandu:   'Data Posyandu',
  pengguna:   'Manajemen Pengguna',
};

const ALLOWED_PAGES = {
  admin: ['dashboard','balita','pemantauan','stunting','jadwal','laporan','posyandu','pengguna'],
  bidan: ['dashboard','balita','pemantauan','stunting','jadwal','laporan'],
  kader: ['dashboard','balita','pemantauan','jadwal','laporan'],
};

export default function App() {
  const { user, isLoading: authLoading, error: authError, login, logout } = useAuth();
  const balita    = useBalita(user);
  const jadwal    = useJadwal(user);
  const pengguna  = usePengguna(user);
  const posyandu  = usePosyandu(user);    // ← dipanggil di dalam komponen

  const [activePage, setActivePage] = useState('dashboard');
  const [laporanKey, setLaporanKey] = useState(0);

  const role    = user?.role || 'kader';
  const allowed = ALLOWED_PAGES[role] || ALLOWED_PAGES.kader;

  useEffect(() => {
    if (user) console.log('[App] User:', user.nama, '| role:', user.role);
  }, [user]);

  useEffect(() => {
    if (!allowed.includes(activePage)) setActivePage('dashboard');
  }, [role, allowed, activePage]);

 // Tambahkan di App.jsx, di bagian handleRefreshAll:
const handleRefreshAll = useCallback(() => {
  try {
    if (typeof balita?.refresh === 'function') balita.refresh();
    if (typeof jadwal?.refresh === 'function') jadwal.refresh?.(); // Safe call
    if (typeof pengguna?.refresh === 'function') pengguna.refresh();
    if (typeof posyandu?.refresh === 'function') posyandu.refresh();
  } catch (e) {
    console.warn('[App] Refresh error (normal jika backend belum ready):', e);
  }
}, [balita, jadwal, pengguna, posyandu]);

  function handleNav(page) {
    if (!allowed.includes(page)) {
      alert(`Halaman "${PAGE_TITLES[page]}" tidak tersedia untuk role: ${role}`);
      return;
    }
    handleRefreshAll();
    if (page === 'laporan') setLaporanKey(k => k + 1);
    setActivePage(page);
  }

  function handleLogout() {
    logout();
    setActivePage('dashboard');
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#9E9E9E' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
          <div>Memuat...</div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={login} error={authError} />;

 function renderDashboard() {
  return (
    <DashboardPage
      role={role}
      statistik={balita.statistik}
      upcomingJadwal={jadwal.jadwalList.slice(0, 5)}
      balitaList={balita.semua}
      posyandu={posyandu.posyanduList}  // ← DATA REAL DARI DB
      onNav={handleNav}
    />
  );
}


  function renderPage() {
    if (!allowed.includes(activePage)) return renderDashboard();

    switch (activePage) {
      case 'dashboard':
        return renderDashboard();

      case 'balita':
        return (
          <BalitaPage
            balita={balita.filtered}
            role={role}
            onAddPemantauan={balita.addPemantauan}
            onAddBalita={role !== 'kader' ? balita.addBalita : null}
            onDelete={role === 'admin' ? balita.deleteBalita : null}
            currentUser={user}
            onEditBalita={editBalita}
          />
        );

      case 'pemantauan':
        return (
          <PemantauanPage
            balitaList={balita.semua}
            onLoadRiwayat={balita.loadRiwayat}
          />
        );

      case 'stunting':
        return (
          <StuntingPage
            balitaList={balita.semua}
            statistik={balita.statistik}
          />
        );

      case 'jadwal':
        return (
          <JadwalPage
            jadwal={jadwal.jadwalList}
            onAdd={role !== 'kader' ? jadwal.addJadwal : null}
            onDelete={role === 'admin' ? jadwal.deleteJadwal : null}
          />
        );

      case 'laporan':
        return (
          <LaporanPage
            key={laporanKey}
            statistik={balita.statistik}
            balitaList={balita.semua}
            currentUser={user}
            onRefresh={handleRefreshAll}
          />
        );

      case 'posyandu':
        return (
          <PosyanduPage
            posyanduList={posyandu.posyanduList}
            isLoading={posyandu.isLoading}
            error={posyandu.error}
            onAdd={role === 'admin' ? posyandu.addPosyandu : null}
            onDelete={role === 'admin' ? posyandu.deletePosyandu : null}
            onRefresh={posyandu.refresh}
            role={role}
          />
        );

      case 'pengguna':
        return (
          <PenggunaPage
            users={pengguna.penggunaList}
            onToggleAktif={pengguna.toggleAktif}
            onDelete={pengguna.deletePengguna}
            onAdd={pengguna.addPengguna}
            onAddOrtu={pengguna.addOrtu}
            onRefresh={pengguna.refresh}
          />
        );

      default:
        return renderDashboard();
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F6FA' }}>
      <Sidebar active={activePage} onNav={handleNav} user={user} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar pageTitle={PAGE_TITLES[activePage]} user={user} onLogout={handleLogout} />

        {activePage === 'balita' && (
          <div
            style={{
              background: '#fff',
              borderBottom: '1px solid #F0F0F0',
              padding: '10px 24px',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              placeholder="🔍  Cari nama, NIK, atau ibu..."
              value={balita.search}
              onChange={e => balita.setSearch(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1.5px solid #E5E7EB',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                width: 260,
                background: '#F9FAFB',
              }}
            />
            <select
              value={balita.filterDesa}
              onChange={e => balita.setFilterDesa(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid #E5E7EB',
                fontSize: 12,
                fontFamily: 'inherit',
                background: '#F9FAFB',
                cursor: 'pointer',
              }}
            >
              {balita.desaOptions.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={balita.filterStatus}
              onChange={e => balita.setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid #E5E7EB',
                fontSize: 12,
                fontFamily: 'inherit',
                background: '#F9FAFB',
                cursor: 'pointer',
              }}
            >
              {['Semua', 'Normal', 'Risiko', 'Stunting'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9E9E9E' }}>
              {balita.filtered.length} dari {balita.semua.length} balita
            </span>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto' }}>{renderPage()}</main>
      </div>
    </div>
  );
}
