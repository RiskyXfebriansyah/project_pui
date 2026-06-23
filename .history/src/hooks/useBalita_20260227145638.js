import { useState, useMemo, useCallback, useEffect } from 'react';
import { BalitaAPI } from '../services/api';

export function useBalita(user) {

  const [semua, setSemua]               = useState([]);
  const [isLoading, setLoading]         = useState(false);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null);
  const [filterDesa, setFilterDesa]     = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // ===============================
  // FETCH DATA (ONLY AFTER LOGIN)
  // ===============================
  const fetchBalita = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await BalitaAPI.getAll();

      if (res?.status?.code === 200 && Array.isArray(res.data)) {
        const mapped = res.data.map(b => ({
          id: b.id,
          nik: b.nik,
          nama: b.nama,
          jenisKelamin: b.jenisKelamin,
          tanggalLahir: b.tanggalLahir,
          umurBulan: b.umurBulan,
          namaIbu: b.namaIbu,
          namaAyah: b.namaAyah,
          noTelepon: b.noTelepon,
          alamat: b.alamat,
          namaPosyandu: b.namaPosyandu,
          desa: b.desa,
          beratBadan: b.beratBadan,
          tinggiBadan: b.tinggiBadan,
          statusStunting: b.statusStunting,
          statusGizi: b.statusGizi,
          tglUkurTerakhir: b.tglUkurTerakhir,
          riwayat: [],
        }));

        setSemua(mapped);
      }

    } catch (err) {
      console.error('Gagal load balita:', err);
    }
    setLoading(false);

  }, [user]);

  // 🔥 Load pertama kali setelah login
  useEffect(() => {
    if (!user) return;
    fetchBalita();
  }, [user, fetchBalita]);

  // ===============================
  // SELECT BALITA + LOAD RIWAYAT
  // ===============================
  const selectBalita = useCallback(async (balita) => {
    setSelected(balita);
    if (!balita) return;

    try {
      const res = await BalitaAPI.getPemantauan(balita.id);

      if (res?.status?.code === 200) {
        const withRiwayat = {
          ...balita,
          riwayat: res.data || []
        };

        setSelected(withRiwayat);

        setSemua(prev =>
          prev.map(b => b.id === balita.id ? withRiwayat : b)
        );
      }
    } catch (err) {
      console.error('Gagal load pemantauan:', err);
    }
  }, []);

  // ===============================
  // FILTERED LIST
  // ===============================
  const filtered = useMemo(() => {
    return semua.filter(b => {

      const q = search.toLowerCase();

      const matchSearch =
        !q ||
        (b.nama || '').toLowerCase().includes(q) ||
        (b.namaIbu || '').toLowerCase().includes(q) ||
        (b.nik || '').includes(q);

      const matchDesa =
        filterDesa === 'Semua' || b.desa === filterDesa;

      const matchStatus =
        filterStatus === 'Semua' || b.statusStunting === filterStatus;

      return matchSearch && matchDesa && matchStatus;
    });

  }, [semua, search, filterDesa, filterStatus]);

  // ===============================
  // STATISTIK
  // ===============================
  const statistik = useMemo(() => ({
    total:      semua.length,
    stunting:   semua.filter(b => b.statusStunting === 'Stunting').length,
    risiko:     semua.filter(b => b.statusStunting === 'Risiko').length,
    normal:     semua.filter(b => b.statusStunting === 'Normal').length,
    giziKurang: semua.filter(b =>
      ['Gizi Kurang', 'Gizi Buruk'].includes(b.statusGizi)
    ).length,
  }), [semua]);

  // ===============================
  // DESA OPTIONS
  // ===============================
  const desaOptions = useMemo(() => {
    const setDesa = new Set(
      semua.map(b => b.desa).filter(Boolean)
    );
    return ['Semua', ...setDesa];
  }, [semua]);

  // ===============================
  // CRUD
  // ===============================
  async function addBalita(dto) {
    try {
      const res = await BalitaAPI.create(dto);
      if (res?.status?.code === 200) {
        await fetchBalita();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function addPemantauan(dto) {
    try {
      const res = await BalitaAPI.addPemantauan(dto);
      if (res?.status?.code === 200) {
        if (selected) await selectBalita(selected);
        await fetchBalita();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function deleteBalita(id) {
    try {
      const res = await BalitaAPI.delete(id);
      if (res?.status?.code === 200) {
        setSemua(prev => prev.filter(b => b.id !== id));
        if (selected?.id === id) setSelected(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ===============================
  // RETURN
  // ===============================
  return {
    semua,
    filtered,
    selected,
    search,
    filterDesa,
    filterStatus,
    statistik,
    desaOptions,
    isLoading,

    setSearch,
    setFilterDesa,
    setFilterStatus,
    setSelected: selectBalita,

    addPemantauan,
    addBalita,
    deleteBalita,
    refresh: fetchBalita,
  };
}