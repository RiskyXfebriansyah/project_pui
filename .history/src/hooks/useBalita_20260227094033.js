// ============================================================
//  useBalita.js — CONTROLLER DATA BALITA (VERSI API)
//  Ganti dummyData → fetch ke C# API
// ============================================================

import { useState, useMemo, useEffect, useCallback } from 'react';
import { BalitaAPI } from '../services/api';

export function useBalita() {
  const [semua, setSemua]           = useState([]);
  const [isLoading, setLoading]     = useState(false);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [filterDesa, setFilterDesa] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // ── Load semua balita dari API saat pertama kali ──────────
  const fetchBalita = useCallback(async () => {
    setLoading(true);
    try {
      const res = await BalitaAPI.getAll();
      if (res?.status?.code === 200) {
        // Map field API → field yang dipakai React
        const mapped = res.data.map(b => ({
          id:             b.id,
          nik:            b.nik,
          nama:           b.nama,
          jenisKelamin:   b.jenisKelamin,
          tanggalLahir:   b.tanggalLahir,
          umurBulan:      b.umurBulan,
          namaIbu:        b.namaIbu,
          namaAyah:       b.namaAyah,
          noTelepon:      b.noTelepon,
          alamat:         b.alamat,
          namaPosyandu:   b.namaPosyandu,
          desa:           b.desa,
          // Data pemantauan terakhir dari view
          beratBadan:     b.beratBadan,
          tinggiBadan:    b.tinggiBadan,
          statusStunting: b.statusStunting,
          statusGizi:     b.statusGizi,
          tglUkurTerakhir: b.tglUkurTerakhir,
          riwayat:        [], // dimuat lazy saat klik detail
        }));
        setSemua(mapped);
      }
    } catch (err) {
      console.error('Gagal load balita:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBalita(); }, [fetchBalita]);

  // ── Load riwayat pemantauan saat balita dipilih ───────────
  async function selectBalita(balita) {
    setSelected(balita);
    if (!balita) return;

    try {
      const res = await BalitaAPI.getPemantauan(balita.id);
      if (res?.status?.code === 200) {
        const withRiwayat = { ...balita, riwayat: res.data };
        setSelected(withRiwayat);
        // Update juga di list
        setSemua(prev => prev.map(b => b.id === balita.id ? withRiwayat : b));
      }
    } catch (err) {
      console.error('Gagal load pemantauan:', err);
    }
  }

  // ── Filter data ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return semua.filter(b => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (b.nama || '').toLowerCase().includes(q) ||
        (b.namaIbu || '').toLowerCase().includes(q) ||
        (b.nik || '').includes(q);
      const matchDesa   = filterDesa === 'Semua' || b.desa === filterDesa;
      const matchStatus = filterStatus === 'Semua' || b.statusStunting === filterStatus;
      return matchSearch && matchDesa && matchStatus;
    });
  }, [semua, search, filterDesa, filterStatus]);

  // ── Statistik dari data yang sudah diload ─────────────────
  const statistik = useMemo(() => ({
    total:      semua.length,
    stunting:   semua.filter(b => b.statusStunting === 'Stunting').length,
    risiko:     semua.filter(b => b.statusStunting === 'Risiko').length,
    normal:     semua.filter(b => b.statusStunting === 'Normal').length,
    giziKurang: semua.filter(b => b.statusGizi === 'Gizi Kurang' || b.statusGizi === 'Gizi Buruk').length,
  }), [semua]);

  const desaOptions = useMemo(() => {
    const set = new Set(semua.map(b => b.desa).filter(Boolean));
    return ['Semua', ...set];
  }, [semua]);

  // ── Tambah balita baru → POST ke API ─────────────────────
  async function addBalita(dto) {
    try {
      const res = await BalitaAPI.create(dto);
      if (res?.status?.code === 200) {
        await fetchBalita(); // reload dari API
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal tambah balita:', err);
      return false;
    }
  }

  // ── Tambah pemantauan → POST ke API ──────────────────────
  async function addPemantauan(dto) {
    try {
      const res = await BalitaAPI.addPemantauan(dto);
      if (res?.status?.code === 200) {
        // Reload riwayat balita yang sedang dibuka
        if (selected) await selectBalita(selected);
        await fetchBalita(); // refresh status stunting di list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal tambah pemantauan:', err);
      return false;
    }
  }

  // ── Hapus balita → DELETE ke API ──────────────────────────
  async function deleteBalita(id) {
    try {
      const res = await BalitaAPI.delete(id);
      if (res?.status?.code === 200) {
        setSemua(prev => prev.filter(b => b.id !== id));
        if (selected?.id === id) setSelected(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal hapus balita:', err);
      return false;
    }
  }

  return {
    semua, filtered, selected, search, filterDesa, filterStatus,
    statistik, desaOptions, isLoading,
    setSearch, setFilterDesa, setFilterStatus,
    setSelected: selectBalita,
    addPemantauan, addBalita, deleteBalita,
    refresh: fetchBalita,
  };
}
