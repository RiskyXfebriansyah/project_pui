import React, { useState, useEffect } from 'react';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import BalitaPage     from './pages/BalitaPage';
import LaporanPage    from './pages/LaporanPage';
import JadwalPage     from './pages/JadwalPage';
import PenggunaPage   from './pages/PenggunaPage';
import { PosyanduPage, StuntingPage, PemantauanPage } from './pages/OtherPages2';
import { Sidebar, Topbar } from './components/layout/Sidebar';
import { useAuth }     from './hooks/useAuth';
import { useBalita }   from './hooks/useBalita';
import { useJadwal }   from './hooks/useJadwal';
import { usePengguna } from './hooks/usePengguna';

const PAGE_TITLES = {
  dashboard:'Dashboard', balita:'Data Balita',
  pemantauan:'Pemantauan Tumbuh Kembang', stunting:'Analisis Stunting',
  jadwal:'Jadwal Posyandu', laporan:'Laporan Bulanan',
  posyandu:'Data Posyandu', pengguna:'Manajemen Pengguna',
};

const ALLOWED_PAGES = {
  admin: ['dashboard','balita','pemantauan','stunting','jadwal','laporan','posyandu','pengguna'],
  bidan: ['dashboard','balita','pemantauan','stunting','jadwal','laporan'],
  kader: ['dashboard','balita','pemantauan','jadwal','laporan'],
};

export default function App() {
  const { user, isLoading: authLoading, error: authError, login, logout } = useAuth();
  const balita   = useBalita(user);
  const jadwal   = useJadwal(user);
  const pengguna = usePengguna(user);
  const [activePage, setActivePage] = useState('dashboard');

  const role    = user?.role || 'kader';
  const allowed = ALLOWED_PAGES[role] || ALLOWED_PAGES.kader;

  useEffect(() => {
    if (user) console.log('[App] User:', user.nama, '| role:', user.role);
  }, [user]);

  useEffect(() => {
    if (!allowed.includes(activePage)) setActivePage('dashboard');
  }, [role]); // eslint-disable-line

  function handleNav(page) {
    if (!allowed.includes(page)) {
      alert(`⛔ Halaman "${PAGE_TITLES[page]}" tidak tersedia untuk role: ${role}`);
      return;
    }
    setActivePage(page);
  }

  function handleLogout() { logout(); setActivePage('dashboard'); }

  if (authLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <div style={{ textAlign:'center', color:'#9E9E9E' }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🌿</div>
          <div>Memuat...</div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={login} error={authError}/>;

  function renderPage() {
    if (!allowed.includes(activePage)) return renderDashboard();
    switch (activePage) {
      case 'dashboard':  return renderDashboard();
      case 'balita':     return (
        <BalitaPage
          balita={balita.filtered} role={role}
          onAddPemantauan={balita.addPemantauan}
          onAddBalita={role !== 'kader' ? balita.addBalita : null}
          onDelete={role === 'admin' ? balita.deleteBalita : null}
        />
      );
      case 'pemantauan': return <PemantauanPage balitaList={balita.semua}/>;
      case 'stunting':   return <StuntingPage balitaList={balita.semua} statistik={balita.statistik}/>;
      case 'jadwal':     return (
        <JadwalPage
          jadwal={jadwal.jadwalList}
          onAdd={role !== 'kader' ? jadwal.addJadwal : null}
          onDelete={role === 'admin' ? jadwal.deleteJadwal : null}
        />
      );
      case 'laporan':    return <LaporanPage statistik={balita.statistik} balitaList={balita.semua}/>;
      case 'laporan': return <LaporanPage statistik={balita.statistik} balitaList={balita.semua} currentUser={user}/>;
      case 'posyandu':   return <PosyanduPage/>;
      case 'pengguna':   return (
        <PenggunaPage
          users={pengguna.penggunaList}
          onToggleAktif={pengguna.toggleAktif}
          onDelete={pengguna.deletePengguna}
          onAdd={pengguna.addPengguna}
        />
      );
      default: return renderDashboard();
    }
  }

  function renderDashboard() {
    return (
      <DashboardPage
        role={role} statistik={balita.statistik}
        upcomingJadwal={jadwal.jadwalList.slice(0,5)}
        balitaList={balita.semua} onNav={handleNav}
      />
    );
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F5F6FA' }}>
      <Sidebar active={activePage} onNav={handleNav} user={user}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        <Topbar pageTitle={PAGE_TITLES[activePage]} user={user} onLogout={handleLogout}/>
        {activePage === 'balita' && (
          <div style={{ background:'#fff', borderBottom:'1px solid #F0F0F0', padding:'10px 24px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <input placeholder="🔍  Cari nama, NIK, atau ibu..." value={balita.search} onChange={e=>balita.setSearch(e.target.value)}
              style={{ padding:'8px 14px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', width:260, background:'#F9FAFB' }}/>
            <select value={balita.filterDesa} onChange={e=>balita.setFilterDesa(e.target.value)}
              style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', background:'#F9FAFB', cursor:'pointer' }}>
              {balita.desaOptions.map(d=><option key={d}>{d}</option>)}
            </select>
            <select value={balita.filterStatus} onChange={e=>balita.setFilterStatus(e.target.value)}
              style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', background:'#F9FAFB', cursor:'pointer' }}>
              {['Semua','Normal','Risiko','Stunting'].map(s=><option key={s}>{s}</option>)}
            </select>
            <span style={{ marginLeft:'auto', fontSize:12, color:'#9E9E9E' }}>{balita.filtered.length} dari {balita.semua.length} balita</span>
          </div>
        )}
        <main style={{ flex:1, overflowY:'auto' }}>{renderPage()}</main>
      </div>
    </div>
  );
}