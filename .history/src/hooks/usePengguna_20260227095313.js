import { useState, useCallback } from 'react';
import { PenggunaAPI } from '../services/api';

export function usePengguna() {
  const [penggunaList, setPenggunaList] = useState([]);
  const [isLoading, setLoading]         = useState(false);
  const [initialized, setInitialized]   = useState(false);

  const fetchPengguna = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PenggunaAPI.getAll();
      if (res?.status?.code === 200) setPenggunaList(res.data);
    } catch { console.error('Gagal load pengguna'); }
    setLoading(false);
  }, []);

  // ── Fix: hindari useEffect
  useState(() => {
    if (!initialized) { setInitialized(true); fetchPengguna(); }
  });

  async function addPengguna(dto) {
    try {
      const res = await PenggunaAPI.create(dto);
      if (res?.status?.code === 200) { await fetchPengguna(); return true; }
      return false;
    } catch { return false; }
  }

  async function toggleAktif(id, aktif) {
    try {
      const res = await PenggunaAPI.toggleAktif(id, aktif);
      if (res?.status?.code === 200) {
        setPenggunaList(prev => prev.map(p => p.id === id ? { ...p, aktif } : p));
        return true;
      }
      return false;
    } catch { return false; }
  }

  async function deletePengguna(id) {
    try {
      const res = await PenggunaAPI.delete(id);
      if (res?.status?.code === 200) {
        setPenggunaList(prev => prev.filter(p => p.id !== id));
        return true;
      }
      return false;
    } catch { return false; }
  }

  const tenagaMedis = penggunaList.filter(p => ['admin','bidan','kader'].includes(p.role));
  const orangTua    = penggunaList.filter(p => p.role === 'orang_tua');

  return {
    penggunaList, tenagaMedis, orangTua, isLoading,
    addPengguna, toggleAktif, deletePengguna,
    refresh: fetchPengguna,
  };
}
