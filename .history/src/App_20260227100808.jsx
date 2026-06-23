import React, { useState, useMemo, useEffect } from 'react';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BalitaPage    from './pages/BalitaPage';
import { LaporanPage, JadwalPage, PenggunaPage, PosyanduPage,
         StuntingPage, PemantauanPage } from './pages/OtherPages';
import { Sidebar, Topbar } from './components/layout/Sidebar';
import { useAuth }      from './hooks/useAuth';
import { useBalita }    from './hooks/useBalita';
import { useJadwal }    from './hooks/useJadwal';
import { usePengguna }  from './hooks/usePengguna';

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  balita:     'Data Balita',
  pemantauan: 'Pemantauan Tumbuh Kembang',
  stunting:   'Analisis Stunting',
  jadwal:     'Jadwal Posyandu',
  laporan:    'Laporan',
  posyandu:   'Data Posyandu',
  pengguna:   'Manajemen Pengguna',
};

const ALLOWED_PAGES = {
  admin: ['dashboard','balita','pemantauan','stunting','jadwal','laporan','posyandu','pengguna'],
  bidan: ['dashboard','balita','pemantauan','stunting','jadwal','laporan'],
  kader: ['dashboard','balita','pemantauan','jadwal'],
};

export default function App() {

  const { user, error: authError, login, logout } = useAuth();
  const balita   = user ? useBalita()   : null;
const jadwal   = user ? useJadwal()   : null;
const pengguna = user ? usePengguna() : null;

  const [activePage, setActivePage] = useState('dashboard');

  // 🔥 AUTO LOGIN CHECK
  useEffect(() => {
    const saved = localStorage.getItem('posyandu_user');
    if (saved && !user) {
      // kalau mau bisa panggil refreshToken disini
      console.log('User session ditemukan');
    }
  }, [user]);

  const role    = user?.role || 'kader';
  const allowed = ALLOWED_PAGES[role] || ALLOWED_PAGES.kader;

  // 🔥 Reset page kalau role tidak punya akses
  useEffect(() => {
    if (!allowed.includes(activePage)) {
      setActivePage('dashboard');
    }
  }, [role]);

  const statistik = useMemo(() => ({
    total:      balita.statistik.total,
    stunting:   balita.statistik.stunting,
    risiko:     balita.statistik.risiko,
    normal:     balita.statistik.normal,
    giziKurang: balita.statistik.giziKurang,
  }), [balita.statistik]);

  function handleNav(page) {
    if (!allowed.includes(page)) {
      alert(`⛔ Akses ditolak\n\nHalaman "${PAGE_TITLES[page]}" tidak tersedia untuk role ${role}.`);
      return;
    }
    setActivePage(page);
  }

  function renderDashboard() {
    return (
      <DashboardPage
        role={role}
        statistik={statistik}
        upcomingJadwal={jadwal.jadwalList.slice(0, 5)}
        balitaList={balita.semua}
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
          />
        );

      case 'pemantauan':
        return <PemantauanPage balitaList={balita.semua}/>;

      case 'stunting':
        return <StuntingPage balitaList={balita.semua} statistik={statistik}/>;

      case 'jadwal':
        return (
          <JadwalPage
            jadwal={jadwal.jadwalList}
            onAdd={role !== 'kader' ? jadwal.addJadwal : null}
            onDelete={role === 'admin' ? jadwal.deleteJadwal : null}
          />
        );

      case 'laporan':
        return <LaporanPage statistik={statistik} balitaList={balita.semua}/>;

      case 'posyandu':
        return <PosyanduPage/>;

      case 'pengguna':
        return (
          <PenggunaPage
            users={pengguna.penggunaList}
            onToggleAktif={pengguna.toggleAktif}
            onDelete={pengguna.deletePengguna}
            onAdd={pengguna.addPengguna}
          />
        );

      default:
        return renderDashboard();
    }
  }

  // 🔥 Kalau belum login
  if (!user) {
    return (
      <>
        <LoginPage onLogin={login} error={authError}/>
      </>
    );
  }

  // 🔥 Kalau sudah login
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar active={activePage} onNav={handleNav} user={user}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <Topbar
          pageTitle={PAGE_TITLES[activePage]}
          user={user}
          onLogout={() => {
            localStorage.removeItem('posyandu_user');
            logout();
          }}
        />
        <main style={{ flex:1, overflowY:'auto' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}