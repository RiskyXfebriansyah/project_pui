import React, { useState, useMemo } from 'react';
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

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F6FA; color: #1A1A1A; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

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
  const balita   = useBalita();
  const jadwal   = useJadwal();
  const pengguna = usePengguna();
  const [activePage, setActivePage] = useState('dashboard');

  const role    = user?.role || 'kader';
  const allowed = ALLOWED_PAGES[role] || ALLOWED_PAGES.kader;

  // Statistik dari data API
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
      case 'stunting':   return <StuntingPage balitaList={balita.semua} statistik={statistik}/>;
      case 'jadwal':     return (
        <JadwalPage
          jadwal={jadwal.jadwalList}
          onAdd={role !== 'kader' ? jadwal.addJadwal : null}
          onDelete={role === 'admin' ? jadwal.deleteJadwal : null}
        />
      );
      case 'laporan':    return <LaporanPage statistik={statistik} balitaList={balita.semua}/>;
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
        role={role}
        statistik={statistik}
        upcomingJadwal={jadwal.jadwalList.slice(0, 5)}
        balitaList={balita.semua}
        onNav={handleNav}
      />
    );
  }

  if (!user) {
    return (
      <>
        <style>{globalStyles}</style>
        <LoginPage onLogin={login} error={authError}/>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display:'flex', minHeight:'100vh' }}>
        <Sidebar active={activePage} onNav={handleNav} user={user}/>
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
          <Topbar pageTitle={PAGE_TITLES[activePage]} user={user} onLogout={logout}/>

          {activePage === 'balita' && (
            <div style={{
              background:'#fff', borderBottom:'1px solid #F0F0F0',
              padding:'10px 24px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'
            }}>
              <input
                placeholder="🔍  Cari nama, NIK, atau ibu..."
                value={balita.search}
                onChange={e => balita.setSearch(e.target.value)}
                style={{
                  padding:'8px 14px', borderRadius:8, border:'1.5px solid #E5E7EB',
                  fontSize:13, fontFamily:'inherit', outline:'none', width:260, background:'#F9FAFB'
                }}
              />
              <select value={balita.filterDesa} onChange={e=>balita.setFilterDesa(e.target.value)}
                style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', background:'#F9FAFB', cursor:'pointer' }}>
                {balita.desaOptions.map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={balita.filterStatus} onChange={e=>balita.setFilterStatus(e.target.value)}
                style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', background:'#F9FAFB', cursor:'pointer' }}>
                {['Semua','Normal','Risiko','Stunting'].map(s=><option key={s}>{s}</option>)}
              </select>
              <span style={{ marginLeft:'auto', fontSize:12, color:'#9E9E9E' }}>
                {balita.filtered.length} dari {balita.semua.length} balita
              </span>
            </div>
          )}

          <main style={{ flex:1, overflowY:'auto' }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}
