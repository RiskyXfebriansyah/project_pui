import { useState, useMemo, useCallback, useEffect } from 'react';
import { BalitaAPI } from '../services/api';

export function useBalita(user) {

  const [semua, setSemua]               = useState([]);
  const [isLoading, setLoading]         = useState(false);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null);
  const [filterDesa, setFilterDesa]     = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // ── FETCH ─────────────────────────────────────────────────────
  const fetchBalita = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await BalitaAPI.getAll();
      if (res?.status?.code === 200 && Array.isArray(res.data)) {
        setSemua(prev => {
          const existingRiwayat = {};
          prev.forEach(b => {
            if (b.riwayat?.length) existingRiwayat[b.id] = b.riwayat;
          });

          return res.data.map(b => ({
            id:              b.id,
            nik:             b.nik,
            nama:            b.nama,
            jenisKelamin:    b.jenisKelamin,
            tanggalLahir:    b.tanggalLahir,
            umurBulan:       b.umurBulan,
            namaIbu:         b.namaIbu,
            namaAyah:        b.namaAyah,
            noTelepon:       b.noTelepon,
            alamat:          b.alamat,
            namaPosyandu:    b.namaPosyandu,
            desa:            b.desa,
            beratBadan:      b.beratBadan,
            tinggiBadan:     b.tinggiBadan,
            statusStunting:  b.statusStunting,
            statusGizi:      b.statusGizi,
            tglUkurTerakhir: b.tglUkurTerakhir,
            riwayat: existingRiwayat[b.id] || [],
          }));
        });
      }
    } catch (err) {
      console.error('Gagal load balita:', err);
    }
    setLoading(false);
  }, [user]);

  // AUTO-LOAD riwayat semua balita setelah fetch
  // Supaya BB/TB terbaru langsung tampil di tabel tanpa klik detail dulu
  const fetchAllWithRiwayat = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await BalitaAPI.getAll();
      if (res?.status?.code === 200 && Array.isArray(res.data)) {
        // Load semua riwayat secara paralel
        const withRiwayat = await Promise.all(
          res.data.map(async b => {
            try {
              const r = await BalitaAPI.getPemantauan(b.id);
              return {
                ...b,
                riwayat: (r?.status?.code === 200 ? r.data : null) || [],
              };
            } catch {
              return { ...b, riwayat: [] };
            }
          })
        );
        setSemua(withRiwayat.map(b => ({
          id:              b.id,
          nik:             b.nik,
          nama:            b.nama,
          jenisKelamin:    b.jenisKelamin,
          tanggalLahir:    b.tanggalLahir,
          umurBulan:       b.umurBulan,
          namaIbu:         b.namaIbu,
          namaAyah:        b.namaAyah,
          noTelepon:       b.noTelepon,
          alamat:          b.alamat,
          namaPosyandu:    b.namaPosyandu,
          desa:            b.desa,
          beratBadan:      b.beratBadan,
          tinggiBadan:     b.tinggiBadan,
          statusStunting:  b.statusStunting,
          statusGizi:      b.statusGizi,
          tglUkurTerakhir: b.tglUkurTerakhir,
          riwayat:         b.riwayat,
        })));
      }
    } catch (err) {
      console.error('Gagal load balita:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchAllWithRiwayat();
  }, [user, fetchAllWithRiwayat]);

  // ── LOAD RIWAYAT untuk satu balita ───────────────────────────
  const loadRiwayat = useCallback(async (balitaId) => {
    try {
      const res = await BalitaAPI.getPemantauan(balitaId);
      if (res?.status?.code === 200) {
        const riwayat = res.data || [];
        setSemua(prev => prev.map(b =>
          b.id === balitaId ? { ...b, riwayat } : b
        ));
        setSelected(prev =>
          prev?.id === balitaId ? { ...prev, riwayat } : prev
        );
        return riwayat;
      }
    } catch (err) {
      console.error('Gagal load riwayat:', err);
    }
    return [];
  }, []);

  // ── SELECT + LOAD RIWAYAT ─────────────────────────────────────
  const selectBalita = useCallback(async (balita) => {
    setSelected(balita);
    if (!balita) return;
    try {
      const res = await BalitaAPI.getPemantauan(balita.id);
      if (res?.status?.code === 200) {
        const withRiwayat = { ...balita, riwayat: res.data || [] };
        setSelected(withRiwayat);
        setSemua(prev => prev.map(b =>
          b.id === balita.id ? withRiwayat : b
        ));
      }
    } catch (err) {
      console.error('Gagal load pemantauan:', err);
    }
  }, []);

  // ── FILTERED ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return semua.filter(b => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (b.nama || '').toLowerCase().includes(q) ||
        (b.namaIbu || '').toLowerCase().includes(q) ||
        (b.nik || '').includes(q);
      const matchDesa   = filterDesa   === 'Semua' || b.desa           === filterDesa;
      const matchStatus = filterStatus === 'Semua' || b.statusStunting === filterStatus;
      return matchSearch && matchDesa && matchStatus;
    });
  }, [semua, search, filterDesa, filterStatus]);

  // ── STATISTIK ─────────────────────────────────────────────────
  const statistik = useMemo(() => ({
    total:      semua.length,
    stunting:   semua.filter(b => b.statusStunting === 'Stunting').length,
    risiko:     semua.filter(b => b.statusStunting === 'Risiko').length,
    normal:     semua.filter(b => b.statusStunting === 'Normal').length,
    giziKurang: semua.filter(b => ['Gizi Kurang','Gizi Buruk'].includes(b.statusGizi)).length,
  }), [semua]);

  const desaOptions = useMemo(() => {
    const setDesa = new Set(semua.map(b => b.desa).filter(Boolean));
    return ['Semua', ...setDesa];
  }, [semua]);

  // ── ADD BALITA ────────────────────────────────────────────────
  async function addBalita(dto) {
    try {
      const res = await BalitaAPI.create(dto);
      if (res?.status?.code === 200) {
        await fetchAllWithRiwayat();
        return { ok: true, message: 'Balita berhasil ditambahkan' };
      }
      return { ok: false, message: res?.status?.message || 'Gagal menambahkan balita' };
    } catch (err) {
      console.error('addBalita error:', err);
      return { ok: false, message: 'Koneksi gagal, coba lagi' };
    }
  }

  // ── EDIT BALITA ───────────────────────────────────────────────
  // UPDATE: fungsi baru untuk edit data profil balita
  async function editBalita(id, dto) {
    try {
      const res = await BalitaAPI.update(id, dto);
      if (res?.status?.code === 200) {
        // Update local state langsung tanpa refetch penuh
        setSemua(prev => prev.map(b =>
          b.id === id ? { ...b, ...dto } : b
        ));
        // Update selected jika yang diedit adalah yang aktif
        setSelected(prev =>
          prev?.id === id ? { ...prev, ...dto } : prev
        );
        // Refetch untuk sinkron dengan server
        await fetchAllWithRiwayat();
        return { ok: true, message: 'Data balita berhasil diperbarui' };
      }
      return { ok: false, message: res?.status?.message || 'Gagal memperbarui data balita' };
    } catch (err) {
      console.error('editBalita error:', err);
      return { ok: false, message: 'Koneksi gagal, coba lagi' };
    }
  }

  // ── ADD PEMANTAUAN ────────────────────────────────────────────
  async function addPemantauan(dto) {
    try {
      const res = await BalitaAPI.addPemantauan(dto);
      if (res?.status?.code === 200) {
        await loadRiwayat(dto.balitaId);
        await fetchAllWithRiwayat();
        return { ok: true, message: 'Pemantauan berhasil disimpan' };
      }
      return { ok: false, message: res?.status?.message || 'Gagal menyimpan pemantauan' };
    } catch (err) {
      console.error('addPemantauan error:', err);
      return { ok: false, message: 'Koneksi gagal, coba lagi' };
    }
  }

  // ── DELETE ────────────────────────────────────────────────────
  async function deleteBalita(id) {
    try {
      const res = await BalitaAPI.delete(id);
      if (res?.status?.code === 200) {
        setSemua(prev => prev.filter(b => b.id !== id));
        if (selected?.id === id) setSelected(null);
        return { ok: true, message: 'Balita berhasil dihapus' };
      }
      return { ok: false, message: res?.status?.message || 'Gagal menghapus' };
    } catch {
      return { ok: false, message: 'Koneksi gagal' };
    }
  }

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
    editBalita,   // ← NEW: di-export untuk BalitaPage
    deleteBalita,
    refresh: fetchAllWithRiwayat,
    loadRiwayat,
  };
}