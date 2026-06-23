// ============================================================
//  App.js — ENTRY POINT UTAMA
//  Padanan: main.dart + routing di Flutter
//
//  Di Flutter  → MaterialApp + GetX/Riverpod routing
//  Di React    → state page aktif + kondisional render
//
//  ALUR KERJA:
//  1. App.js → cek login (useAuth)
//  2. Jika belum login → tampil LoginPage
//  3. Jika sudah login → tampil AppShell (Sidebar + Page aktif)
// ============================================================

import React, { useState, useMemo } from 'react';
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BalitaPage   from './pages/BalitaPage';
import { LaporanPage, JadwalPage, PenggunaPage, PosyanduPage,
         StuntingPage, PemantauanPage } from './pages/OtherPages';
import { Sidebar, Topbar } from './components/layout/Sidebar';
import { useAuth }   from './hooks/useAuth';
import { useBalita } from './hooks/useBalita';
import { useJadwal, useUsers } from './hooks/useJadwal';
import { hitungStatistik } from './utils/helpers';

// ── CSS global ─────────────────────────────────────────────────
const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F6FA; color: #1A1A1A; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// Judul halaman per page id
const PAGE_TITLES = {
  dashboard:  'Dashboard Eksekutif',
  balita:     'Data Balita',
  pemantauan: 'Pemantauan Tumbuh Kembang',
  stunting:   'Analisis Stunting',
  jadwal:     'Jadwal Posyandu',
  laporan:    'Laporan',
  posyandu:   'Data Posyandu',
  pengguna:   'Manajemen Pengguna',
};

export default function App() {
  // ── Hooks (Controllers) ────────────────────────────────────
  const { user, isLoading: authLoading, error: authError, login, logout } = useAuth();
  const balita = useBalita();
  const jadwal = useJadwal();
  const users  = useUsers();

  // ── State halaman aktif ────────────────────────────────────
  const [activePage, setActivePage] = useState('dashboard');

  // ── Statistik dihitung dari semua balita ───────────────────
  const statistik = useMemo(() => hitungStatistik(balita.semua), [balita.semua]);

  // ── Search bar di topbar ───────────────────────────────────
  const handleSearch = (q) => balita.setSearch(q);

  // ── Render halaman aktif ───────────────────────────────────
  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage
          statistik={statistik}
          upcomingJadwal={jadwal.upcoming}
          balitaList={balita.filtered}
          onNav={setActivePage}
        />;
      case 'balita':
        return <BalitaPage
          balita={balita.filtered}
          onAddPemantauan={balita.addPemantauan}
          onAddBalita={balita.addBalita}
          onDelete={balita.deleteBalita}
        />;
      case 'pemantauan':
        return <PemantauanPage balitaList={balita.semua}/>;
      case 'stunting':
        return <StuntingPage balitaList={balita.semua} statistik={statistik}/>;
      case 'jadwal':
        return <JadwalPage
          jadwal={jadwal.filtered}
          onAdd={jadwal.addJadwal}
          onDelete={jadwal.deleteJadwal}
        />;
      case 'laporan':
        return <LaporanPage statistik={statistik} balitaList={balita.semua}/>;
      case 'posyandu':
        return <PosyanduPage/>;
      case 'pengguna':
        return <PenggunaPage
          users={users.filtered}
          onToggleAktif={users.toggleAktif}
          onDelete={users.deleteUser}
          onAdd={users.addUser}
        />;
      default:
        return <DashboardPage statistik={statistik} upcomingJadwal={jadwal.upcoming}
          balitaList={balita.filtered} onNav={setActivePage}/>;
    }
  }

  // ── Belum login → tampil halaman login ────────────────────
  if (!user) {
    return (
      <>
        <style>{globalStyles}</style>
        <LoginPage onLogin={login} isLoading={authLoading} error={authError}/>
      </>
    );
  }

  // ── Sudah login → tampil app shell ────────────────────────
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display:'flex', minHeight:'100vh' }}>

        {/* Sidebar (kiri) */}
        <Sidebar active={activePage} onNav={setActivePage} user={user}/>

        {/* Konten (kanan) */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

          {/* Topbar */}
          <Topbar pageTitle={PAGE_TITLES[activePage]} user={user} onLogout={logout}
            search={balita.search} onSearch={handleSearch}/>

          {/* Filter bar — hanya muncul di halaman balita */}
          {activePage === 'balita' && (
            <div style={{
              background:'#fff', borderBottom:'1px solid #F0F0F0',
              padding:'10px 24px', display:'flex', gap:10, alignItems:'center'
            }}>
              <input
                placeholder="🔍  Cari nama, NIK, atau ibu..."
                value={balita.search}
                onChange={e => balita.setSearch(e.target.value)}
                style={{
                  padding:'8px 14px', borderRadius:8, border:'1.5px solid #E5E7EB',
                  fontSize:13, fontFamily:'inherit', outline:'none', width:260,
                  background:'#F9FAFB'
                }}
              />
              <select value={balita.filterDesa} onChange={e=>balita.setFilterDesa(e.target.value)}
                style={{
                  padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB',
                  fontSize:12, fontFamily:'inherit', background:'#F9FAFB', cursor:'pointer'
                }}>
                {balita.desaOptions.map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={balita.filterStatus} onChange={e=>balita.setFilterStatus(e.target.value)}
                style={{
                  padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB',
                  fontSize:12, fontFamily:'inherit', background:'#F9FAFB', cursor:'pointer'
                }}>
                {['Semua','Normal','Risiko','Stunting','Belum diukur'].map(s=><option key={s}>{s}</option>)}
              </select>
              <span style={{ marginLeft:'auto', fontSize:12, color:'#9E9E9E' }}>
                {balita.filtered.length} dari {balita.semua.length} balita
              </span>
            </div>
          )}

          {/* Konten halaman */}
          <main style={{ flex:1, overflowY:'auto' }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}
