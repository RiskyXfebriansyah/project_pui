// ============================================================
//  usePengguna.js — CONTROLLER PENGGUNA (VERSI API)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { PenggunaAPI } from '../services/api';

export function usePengguna() {
  const [penggunaList, setPenggunaList] = useState([]);
  const [isLoading, setLoading]         = useState(false);

  const fetchPengguna = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PenggunaAPI.getAll();
      if (res?.status?.code === 200) {
        setPenggunaList(res.data);
      }
    } catch (err) {
      console.error('Gagal load pengguna:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPengguna(); }, [fetchPengguna]);

  async function addPengguna(dto) {
    try {
      const res = await PenggunaAPI.create(dto);
      if (res?.status?.code === 200) {
        await fetchPengguna();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal tambah pengguna:', err);
      return false;
    }
  }

  async function toggleAktif(id, aktif) {
    try {
      const res = await PenggunaAPI.toggleAktif(id, aktif);
      if (res?.status?.code === 200) {
        setPenggunaList(prev =>
          prev.map(p => p.id === id ? { ...p, aktif } : p)
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal toggle aktif:', err);
      return false;
    }
  }

  async function deletePengguna(id) {
    try {
      const res = await PenggunaAPI.delete(id);
      if (res?.status?.code === 200) {
        setPenggunaList(prev => prev.filter(p => p.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal hapus pengguna:', err);
      return false;
    }
  }

  // Filter helper untuk komponen
  const tenagaMedis = penggunaList.filter(p => ['admin','bidan','kader'].includes(p.role));
  const orangTua    = penggunaList.filter(p => p.role === 'orang_tua');

  return {
    penggunaList, tenagaMedis, orangTua, isLoading,
    addPengguna, toggleAktif, deletePengguna,
    refresh: fetchPengguna,
  };
}
