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
  // FIX: Preserve riwayat yang sudah di-load sebelumnya
  // agar PemantauanPage tidak kehilangan data setelah fetchBalita()
  const fetchBalita = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await BalitaAPI.getAll();
      if (res?.status?.code === 200 && Array.isArray(res.data)) {
        setSemua(prev => {
          // Buat map riwayat yang sudah ada agar tidak hilang
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
            // ← preserve riwayat lama jika sudah pernah di-load
            riwayat: existingRiwayat[b.id] || [],
          }));
        });
      }
    } catch (err) {
      console.error('Gagal load balita:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchBalita();
  }, [user, fetchBalita]);

  // ── LOAD RIWAYAT untuk satu balita ───────────────────────────
  // FIX: fungsi ini sekarang di-export agar PemantauanPage bisa
  // memanggilnya langsung saat user klik balita di sidebar
  const loadRiwayat = useCallback(async (balitaId) => {
    try {
      const res = await BalitaAPI.getPemantauan(balitaId);
      if (res?.status?.code === 200) {
        const riwayat = res.data || [];
        setSemua(prev => prev.map(b =>
          b.id === balitaId ? { ...b, riwayat } : b
        ));
        // Update selected juga jika yang di-load adalah yang aktif
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

  // ── SELECT + LOAD RIWAYAT (untuk BalitaPage) ─────────────────
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
        await fetchBalita();
        return { ok: true, message: 'Balita berhasil ditambahkan' };
      }
      return { ok: false, message: res?.status?.message || 'Gagal menambahkan balita' };
    } catch (err) {
      console.error('addBalita error:', err);
      return { ok: false, message: 'Koneksi gagal, coba lagi' };
    }
  }

  // ── ADD PEMANTAUAN ────────────────────────────────────────────
  // FIX: setelah save, langsung reload riwayat balita yang diukur
  // sehingga PemantauanPage langsung update tanpa perlu klik ulang
  async function addPemantauan(dto) {
    try {
      const res = await BalitaAPI.addPemantauan(dto);
      if (res?.status?.code === 200) {
        // Reload riwayat balita yang baru diukur
        await loadRiwayat(dto.balitaId);
        // Refresh semua data (beratBadan, tinggiBadan, statusStunting, dll)
        await fetchBalita();
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
    deleteBalita,
    refresh: fetchBalita,
    loadRiwayat, // ← NEW: di-export untuk PemantauanPage
  };
}