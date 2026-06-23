// ============================================================
//  useBalita — CONTROLLER DATA BALITA
//  Padanan: BalitaNotifier di C_dashboard.dart Flutter
//
//  Di Flutter  → StateNotifier<BalitaState>
//  Di React    → hook dengan useState + useMemo
// ============================================================

import { useState, useMemo } from 'react';
import { balitaList as initialData } from '../data/dummyData';
import { hitungStatistik, hitungUmurBulan, getStatusStunting } from '../utils/helpers';

export function useBalita() {
  const [semua, setSemua]       = useState(initialData);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [filterDesa, setFilterDesa] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // useMemo = kalkulasi ulang hanya saat dependency berubah
  // Padanan: getter di Riverpod yang dihitung dari state
  const filtered = useMemo(() => {
    return semua.filter(b => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        b.nama.toLowerCase().includes(q) ||
        b.namaIbu.toLowerCase().includes(q) ||
        b.nik.includes(q);

      const matchDesa = filterDesa === 'Semua' || b.desa === filterDesa;

      let matchStatus = true;
      if (filterStatus !== 'Semua') {
        if (!b.riwayat.length) { matchStatus = filterStatus === 'Belum diukur'; }
        else {
          const last = b.riwayat[b.riwayat.length - 1];
          const umur = hitungUmurBulan(b.tanggalLahir);
          const ss = getStatusStunting(last.tb, umur, b.jenisKelamin);
          matchStatus = ss === filterStatus;
        }
      }

      return matchSearch && matchDesa && matchStatus;
    });
  }, [semua, search, filterDesa, filterStatus]);

  // Statistik dihitung otomatis dari data
  const statistik = useMemo(() => hitungStatistik(semua), [semua]);

  // Daftar desa unik untuk filter dropdown
  const desaOptions = useMemo(() => {
    const set = new Set(semua.map(b => b.desa));
    return ['Semua', ...set];
  }, [semua]);

  // ── Tambah pemantauan baru ────────────────────────────────
  function addPemantauan(balitaId, pemantauan) {
    setSemua(prev => prev.map(b =>
      b.id === balitaId
        ? { ...b, riwayat: [...b.riwayat, pemantauan] }
        : b
    ));
    // Update selected juga jika sedang dibuka
    if (selected?.id === balitaId) {
      setSelected(prev => ({
        ...prev,
        riwayat: [...prev.riwayat, pemantauan]
      }));
    }
  }

  // ── Tambah balita baru ────────────────────────────────────
  function addBalita(balita) {
    const baru = { ...balita, id: `b${Date.now()}`, riwayat: [] };
    setSemua(prev => [baru, ...prev]);
  }

  // ── Hapus balita ──────────────────────────────────────────
  function deleteBalita(id) {
    setSemua(prev => prev.filter(b => b.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return {
    semua, filtered, selected, search, filterDesa, filterStatus,
    statistik, desaOptions,
    setSearch, setFilterDesa, setFilterStatus,
    setSelected, addPemantauan, addBalita, deleteBalita,
  };
}
