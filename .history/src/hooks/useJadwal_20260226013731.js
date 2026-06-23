// ============================================================
//  useJadwal — CONTROLLER JADWAL
//  useUsers  — CONTROLLER MANAJEMEN AKUN
// ============================================================

import { useState, useMemo } from 'react';
import { jadwalList as initJadwal, userList as initUsers } from '../data/dummyData';

// ── Jadwal ────────────────────────────────────────────────────
export function useJadwal() {
  const [semua, setSemua]   = useState(initJadwal);
  const [filterTipe, setFilterTipe] = useState('Semua');

  const filtered = useMemo(() => {
    const list = filterTipe === 'Semua' ? semua : semua.filter(j => j.tipe === filterTipe);
    return [...list].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  }, [semua, filterTipe]);

  const upcoming = useMemo(() =>
    semua.filter(j => new Date(j.tanggal) >= new Date())
      .sort((a,b) => new Date(a.tanggal)-new Date(b.tanggal))
      .slice(0, 5),
  [semua]);

  function addJadwal(jadwal) {
    setSemua(prev => [...prev, { ...jadwal, id: `j${Date.now()}` }]);
  }

  function deleteJadwal(id) {
    setSemua(prev => prev.filter(j => j.id !== id));
  }

  return { filtered, upcoming, filterTipe, setFilterTipe, addJadwal, deleteJadwal };
}

// ── Users ─────────────────────────────────────────────────────
export function useUsers() {
  const [semua, setSemua] = useState(initUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');

  const filtered = useMemo(() => {
    return semua.filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || u.nama.toLowerCase().includes(q) || u.email.includes(q);
      const matchR = filterRole === 'Semua' || u.role === filterRole;
      return matchQ && matchR;
    });
  }, [semua, search, filterRole]);

  function toggleAktif(id) {
    setSemua(prev => prev.map(u => u.id === id ? { ...u, aktif: !u.aktif } : u));
  }

  function deleteUser(id) {
    setSemua(prev => prev.filter(u => u.id !== id));
  }

  function addUser(user) {
    setSemua(prev => [...prev, { ...user, id: `u${Date.now()}`, aktif: true }]);
  }

  return { filtered, semua, search, filterRole, setSearch, setFilterRole, toggleAktif, deleteUser, addUser };
}
