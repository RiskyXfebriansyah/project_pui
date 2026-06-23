import { useState, useCallback, useEffect } from 'react';
import { JadwalAPI } from '../services/api';

export function useJadwal(user) {
  const [jadwalList, setJadwalList] = useState([]);
  const [isLoading, setLoading]     = useState(false);

  const fetchJadwal = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await JadwalAPI.getAll();
      if (res?.status?.code === 200) {
        setJadwalList(res.data.map(j => ({
          id: j.id, judul: j.judul,
          tanggal: j.tanggal?.split('T')[0],
          waktu: j.waktu, lokasi: j.lokasi,
          tipe: j.tipe, deskripsi: j.deskripsi,
          posyanduId: j.posyanduId, namaPosyandu: j.namaPosyandu,
        })));
      }
    } catch { console.error('Gagal load jadwal'); }
    setLoading(false);
  }, [user]);

  // ✅ Fix: useEffect bukan useState
  useEffect(() => {
    if (user) fetchJadwal();
  }, [user, fetchJadwal]);

  async function addJadwal(dto) {
    try {
      const res = await JadwalAPI.create({
        judul: dto.judul, tanggal: dto.tanggal,
        waktu: dto.waktu || '', lokasi: dto.lokasi || '',
        tipe: dto.tipe || 'posyandu', deskripsi: dto.deskripsi || '',
        posyanduId: dto.posyanduId || null,
      });
      if (res?.status?.code === 200) { await fetchJadwal(); return true; }
      return false;
    } catch { return false; }
  }

  async function deleteJadwal(id) {
    try {
      const res = await JadwalAPI.delete(id);
      if (res?.status?.code === 200) {
        setJadwalList(prev => prev.filter(j => j.id !== id));
        return true;
      }
      return false;
    } catch { return false; }
  }

  return { jadwalList, isLoading, addJadwal, deleteJadwal, refresh: fetchJadwal };
}

export function useUsers() { return {}; }
