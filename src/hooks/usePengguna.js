import { useState, useEffect, useCallback, useMemo } from 'react';
import { PenggunaAPI } from '../services/api';

export function usePengguna(user) {
  const [penggunaList, setPenggunaList] = useState([]);
  const [isLoading, setLoading]         = useState(false);

  const fetchPengguna = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await PenggunaAPI.getAll();
      if (res?.status?.code === 200) {
        setPenggunaList(res.data || []);
      }
    } catch (err) {
      console.error('Gagal load pengguna:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchPengguna();
  }, [user, fetchPengguna]);

  // ── Tambah tenaga medis (admin / bidan / kader) ───────────
  async function addPengguna(dto) {
    try {
      const res = await PenggunaAPI.create(dto);
      if (res?.status?.code === 200) {
        await fetchPengguna();
        return { ok: true };
      }
      return { ok: false, message: res?.status?.message || 'Gagal menyimpan data' };
    } catch (err) {
      return { ok: false, message: 'Koneksi gagal, coba lagi' };
    }
  }

  // ── Tambah orang tua + balita (1 transaksi) ───────────────
  // DTO: { nama, email, password, noTelepon, posyanduId,
  //        namaAnak?, tanggalLahirAnak?, jenisKelaminAnak?, nikAnak? }
  async function addOrtu(dto) {
    try {
      const res = await PenggunaAPI.createOrtu(dto);
      if (res?.status?.code === 200) {
        await fetchPengguna();
        return { ok: true, message: res?.data?.message || 'Berhasil' };
      }
      return { ok: false, message: res?.status?.message || 'Gagal menyimpan data' };
    } catch (err) {
      return { ok: false, message: 'Koneksi gagal, coba lagi' };
    }
  }

  // ── Toggle aktif / nonaktif ───────────────────────────────
  async function toggleAktif(id, aktif) {
    try {
      const res = await PenggunaAPI.toggleAktif(id, aktif);
      if (res?.status?.code === 200) {
        setPenggunaList(prev => prev.map(p => p.id === id ? { ...p, aktif } : p));
        return { ok: true };
      }
      return { ok: false, message: res?.status?.message || 'Gagal' };
    } catch {
      return { ok: false, message: 'Koneksi gagal' };
    }
  }

  // ── Hapus pengguna ────────────────────────────────────────
  async function deletePengguna(id) {
    try {
      const res = await PenggunaAPI.delete(id);
      if (res?.status?.code === 200) {
        setPenggunaList(prev => prev.filter(p => p.id !== id));
        return { ok: true };
      }
      return { ok: false, message: res?.status?.message || 'Gagal' };
    } catch {
      return { ok: false, message: 'Koneksi gagal' };
    }
  }

  const tenagaMedis = useMemo(() =>
    penggunaList.filter(p => ['admin', 'bidan', 'kader'].includes(p.role)),
    [penggunaList]
  );

  const orangTua = useMemo(() =>
    penggunaList.filter(p => p.role === 'orang_tua'),
    [penggunaList]
  );

  return {
    penggunaList,
    tenagaMedis,
    orangTua,
    isLoading,
    addPengguna,     // untuk tenaga medis
    addOrtu,         // untuk orang tua + balita
    toggleAktif,
    deletePengguna,
    refresh: fetchPengguna,
  };
}