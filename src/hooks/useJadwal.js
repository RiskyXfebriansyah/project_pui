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

      // Debug — buka console browser untuk lihat struktur response
      console.log('[useJadwal] getAll response:', res);

      // Toleran terhadap code: 200 (int) atau "200" (string)
      const code = res?.status?.code;
      if (code === 200 || code === '200') {
        // Toleran terhadap res.data = array atau res.data.items = array
        const raw = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.items)
            ? res.data.items
            : [];

        setJadwalList(raw.map(j => ({
          id:          j.id,
          judul:       j.judul,
          tanggal:     j.tanggal?.split('T')[0] ?? j.tanggal,
          waktu:       j.waktu       ?? '',
          jamMulai:    j.jamMulai    ?? null,
          jamSelesai:  j.jamSelesai  ?? null,
          lokasi:      j.lokasi      ?? '',
          tipe:        j.tipe        ?? 'posyandu',
          deskripsi:   j.deskripsi   ?? '',
          posyanduId:  j.posyanduId  ?? null,
          namaPosyandu:j.namaPosyandu?? null,
        })));
      } else {
        console.warn('[useJadwal] Status bukan 200:', res?.status);
      }
    } catch (err) {
      console.error('[useJadwal] Gagal load jadwal:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchJadwal();
  }, [user, fetchJadwal]);

  // ── addJadwal: return { ok, message } agar JadwalPage bisa cek result?.ok
  async function addJadwal(dto) {
    try {
      const res = await JadwalAPI.create({
        judul:      dto.judul,
        tanggal:    dto.tanggal,
        waktu:      dto.waktu      || '',
        lokasi:     dto.lokasi     || '',
        tipe:       dto.tipe       || 'posyandu',
        deskripsi:  dto.deskripsi  || '',
        posyanduId: dto.posyanduId || null,
      });

      console.log('[useJadwal] create response:', res);

      const code = res?.status?.code;
      if (code === 200 || code === '200') {
        await fetchJadwal();
        return { ok: true };
      }
      return { ok: false, message: res?.status?.message || 'Gagal menyimpan jadwal' };
    } catch (err) {
      console.error('[useJadwal] addJadwal error:', err);
      return { ok: false, message: 'Terjadi kesalahan jaringan' };
    }
  }

  async function deleteJadwal(id) {
    try {
      const res = await JadwalAPI.delete(id);
      const code = res?.status?.code;
      if (code === 200 || code === '200') {
        setJadwalList(prev => prev.filter(j => j.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  return { jadwalList, isLoading, addJadwal, deleteJadwal, refresh: fetchJadwal };
}

export function useUsers() { return {}; }