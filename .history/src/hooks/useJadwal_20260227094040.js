// ============================================================
//  useJadwal.js — CONTROLLER JADWAL (VERSI API)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { JadwalAPI } from '../services/api';

export function useJadwal() {
  const [jadwalList, setJadwalList] = useState([]);
  const [isLoading, setLoading]     = useState(false);

  const fetchJadwal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await JadwalAPI.getAll();
      if (res?.status?.code === 200) {
        setJadwalList(res.data.map(j => ({
          id:           j.id,
          judul:        j.judul,
          tanggal:      j.tanggal?.split('T')[0], // "2026-03-10"
          waktu:        j.waktu,
          lokasi:       j.lokasi,
          tipe:         j.tipe,
          deskripsi:    j.deskripsi,
          posyanduId:   j.posyanduId,
          namaPosyandu: j.namaPosyandu,
        })));
      }
    } catch (err) {
      console.error('Gagal load jadwal:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchJadwal(); }, [fetchJadwal]);

  async function addJadwal(dto) {
    try {
      const res = await JadwalAPI.create(dto);
      if (res?.status?.code === 200) {
        await fetchJadwal();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal tambah jadwal:', err);
      return false;
    }
  }

  async function deleteJadwal(id) {
    try {
      const res = await JadwalAPI.delete(id);
      if (res?.status?.code === 200) {
        setJadwalList(prev => prev.filter(j => j.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Gagal hapus jadwal:', err);
      return false;
    }
  }

  return { jadwalList, isLoading, addJadwal, deleteJadwal, refresh: fetchJadwal };
}
