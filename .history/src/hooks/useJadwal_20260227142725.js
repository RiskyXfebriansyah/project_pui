import { useState, useEffect, useCallback } from 'react';
import { JadwalAPI } from '../services/api';

export function useJadwal() {
  const [semua, setSemua]   = useState([]);
  const [isLoading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await JadwalAPI.getAll();
      if (res?.status?.code === 200) {
        setSemua(res.data.map(j => ({
          id: j.id, judul: j.judul,
          tanggal: j.tanggal?.split('T')[0] || j.tanggal,
          waktu: j.waktu, lokasi: j.lokasi, tipe: j.tipe,
          deskripsi: j.deskripsi, posyanduId: j.posyanduId,
          namaPosyandu: j.namaPosyandu,
        })));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered  = semua.sort((a,b) => new Date(a.tanggal) - new Date(b.tanggal));
  const upcoming  = semua.filter(j => new Date(j.tanggal) >= new Date()).slice(0,5);

  async function addJadwal(form) {
    try {
      const res = await JadwalAPI.create({
        judul: form.judul, tanggal: form.tanggal,
        waktu: form.waktu, lokasi: form.lokasi,
        tipe: form.tipe, deskripsi: form.deskripsi,
        posyanduId: form.posyanduId || null,
      });
      if (res?.status?.code === 200) { await fetchAll(); return true; }
      alert(res?.status?.message || 'Gagal menyimpan'); return false;
    } catch (e) { console.error(e); return false; }
  }

  async function deleteJadwal(id) {
    try {
      const res = await JadwalAPI.delete(id);
      if (res?.status?.code === 200) { setSemua(prev => prev.filter(j => j.id !== id)); return true; }
      return false;
    } catch (e) { console.error(e); return false; }
  }

  return { filtered, upcoming, isLoading, addJadwal, deleteJadwal, refresh: fetchAll };
}

// ── useUsers → diganti usePengguna di App.js ──────────────────
export function useUsers() { return {}; } // dummy agar tidak error import lama
