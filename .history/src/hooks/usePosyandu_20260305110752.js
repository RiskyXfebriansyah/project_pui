// src/hooks/usePosyandu.js
import { useState, useEffect, useCallback } from 'react';
import { PosyanduAPI } from '../api/api';

export function usePosyandu(user) {
  const [posyanduList, setPosyanduList] = useState([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await PosyanduAPI.getAll();
      if (res?.status?.code === 200) {
        setPosyanduList(res.data ?? []);
      } else {
        setError(res?.status?.message ?? 'Gagal memuat data posyandu');
      }
    } catch (e) {
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addPosyandu = useCallback(async (dto) => {
    try {
      const res = await PosyanduAPI.create(dto);
      if (res?.status?.code === 200) {
        await load();
        return { ok: true };
      }
      return { ok: false, msg: res?.status?.message ?? 'Gagal menambah posyandu' };
    } catch {
      return { ok: false, msg: 'Gagal terhubung ke server' };
    }
  }, [load]);

  const deletePosyandu = useCallback(async (id) => {
    try {
      const res = await PosyanduAPI.delete(id);
      if (res?.status?.code === 200) {
        await load();
        return { ok: true };
      }
      return { ok: false, msg: res?.status?.message ?? 'Gagal menghapus posyandu' };
    } catch {
      return { ok: false, msg: 'Gagal terhubung ke server' };
    }
  }, [load]);

  return { posyanduList, isLoading, error, refresh: load, addPosyandu, deletePosyandu };
}