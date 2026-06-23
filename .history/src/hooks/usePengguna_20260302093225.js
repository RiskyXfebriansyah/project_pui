import { useState, useEffect, useCallback } from 'react';
import { PenggunaAPI } from '../services/api';

export function usePengguna() {
  const [semua, setSemua]   = useState([]);
  const [isLoading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PenggunaAPI.getAll();
      if (res?.status?.code === 200) setSemua(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function addUser(dto) {
    try {
      const res = await PenggunaAPI.create({
        nama: dto.nama, email: dto.email, password: dto.password,
        role: dto.role, jabatan: dto.jabatan || null,
        noTelepon: dto.noTelepon || null,
        posyanduId: dto.posyanduId ? parseInt(dto.posyanduId) : null,
        namaAnak: dto.namaAnak || null, aktif: true,
      });
      if (res?.status?.code === 200) { await fetchAll(); return true; }
      alert(res?.status?.message || 'Gagal menyimpan'); return false;
    } catch (e) { console.error(e); return false; }
  }

  async function toggleAktif(id) {
    const user = semua.find(u => u.id === id);
    if (!user) return;
    try {
      const res = await PenggunaAPI.toggleAktif(id, !user.aktif);
      if (res?.status?.code === 200) {
        setSemua(prev => prev.map(u => u.id === id ? { ...u, aktif: !u.aktif } : u));
      }
    } catch (e) { console.error(e); }
  }

  async function deleteUser(id) {
    try {
      const res = await PenggunaAPI.delete(id);
      if (res?.status?.code === 200) {
        setSemua(prev => prev.filter(u => u.id !== id)); return true;
      }
      return false;
    } catch (e) { console.error(e); return false; }
  }

  return { filtered: semua, semua, isLoading, addUser, toggleAktif, deleteUser, refresh: fetchAll };
}
