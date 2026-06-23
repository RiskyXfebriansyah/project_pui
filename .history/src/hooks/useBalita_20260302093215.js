import { useState, useMemo, useEffect, useCallback } from 'react';
import { BalitaAPI } from '../services/api';

export function useBalita() {
  const [semua, setSemua]       = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [filterDesa, setFilterDesa]     = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await BalitaAPI.getAll();
      if (res?.status?.code === 200) {
        setSemua(res.data.map(b => ({
          id: b.id, nik: b.nik, nama: b.nama,
          jenisKelamin: b.jenisKelamin, tanggalLahir: b.tanggalLahir,
          umurBulan: b.umurBulan, namaIbu: b.namaIbu, namaAyah: b.namaAyah,
          noTelepon: b.noTelepon, alamat: b.alamat,
          posyandu: b.namaPosyandu, desa: b.desa,
          beratBadan: b.beratBadan, tinggiBadan: b.tinggiBadan,
          statusStunting: b.statusStunting, statusGizi: b.statusGizi,
          tglUkurTerakhir: b.tglUkurTerakhir,
          riwayat: [], // dimuat lazy saat detail dibuka
        })));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Load riwayat pemantauan saat balita diklik
  async function pilihBalita(balita) {
    setSelected(balita);
    if (!balita) return;
    try {
      const res = await BalitaAPI.getPemantauan(balita.id);
      if (res?.status?.code === 200) {
        const withRiwayat = {
          ...balita,
          riwayat: res.data.map(p => ({
            id: p.id, tanggal: p.tanggal,
            bb: p.beratBadan, tb: p.tinggiBadan, lk: p.lingkarKepala,
            statusStunting: p.statusStunting, statusGizi: p.statusGizi,
            catatan: p.catatan,
          }))
        };
        setSelected(withRiwayat);
        setSemua(prev => prev.map(b => b.id === balita.id ? withRiwayat : b));
      }
    } catch (e) { console.error(e); }
  }

  const filtered = useMemo(() => semua.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (b.nama||'').toLowerCase().includes(q) ||
      (b.namaIbu||'').toLowerCase().includes(q) ||
      (b.nik||'').includes(q);
    const matchDesa   = filterDesa   === 'Semua' || b.desa === filterDesa;
    const matchStatus = filterStatus === 'Semua' || b.statusStunting === filterStatus;
    return matchSearch && matchDesa && matchStatus;
  }), [semua, search, filterDesa, filterStatus]);

  const statistik = useMemo(() => ({
    total:      semua.length,
    stunting:   semua.filter(b => b.statusStunting === 'Stunting').length,
    risiko:     semua.filter(b => b.statusStunting === 'Risiko').length,
    normal:     semua.filter(b => b.statusStunting === 'Normal').length,
    giziKurang: semua.filter(b => b.statusGizi === 'Gizi Kurang' || b.statusGizi === 'Gizi Buruk').length,
  }), [semua]);

  const desaOptions = useMemo(() => {
    const set = new Set(semua.map(b => b.desa).filter(Boolean));
    return ['Semua', ...set];
  }, [semua]);

  // ── CREATE ────────────────────────────────────────────────
  async function addBalita(dto) {
    try {
      const res = await BalitaAPI.create({
        nama: dto.nama, tanggalLahir: dto.tanggalLahir,
        jenisKelamin: dto.jenisKelamin, posyanduId: dto.posyanduId,
      });
      if (res?.status?.code === 200) { await fetchAll(); return true; }
      alert(res?.status?.message || 'Gagal menyimpan'); return false;
    } catch (e) { console.error(e); return false; }
  }

  // ── ADD PEMANTAUAN ────────────────────────────────────────
  async function addPemantauan(balitaId, pmt) {
    try {
      const res = await BalitaAPI.addPemantauan({
        balitaId, beratBadan: pmt.bb, tinggiBadan: pmt.tb, lingkarKepala: pmt.lk,
      });
      if (res?.status?.code === 200) {
        if (selected?.id === balitaId) await pilihBalita(selected);
        await fetchAll(); return true;
      }
      alert(res?.status?.message || 'Gagal menyimpan'); return false;
    } catch (e) { console.error(e); return false; }
  }

  // ── DELETE ────────────────────────────────────────────────
  async function deleteBalita(id) {
    try {
      const res = await BalitaAPI.delete(id);
      if (res?.status?.code === 200) {
        setSemua(prev => prev.filter(b => b.id !== id));
        if (selected?.id === id) setSelected(null);
        return true;
      }
      return false;
    } catch (e) { console.error(e); return false; }
  }

  return {
    semua, filtered, selected, search, filterDesa, filterStatus,
    statistik, desaOptions, isLoading,
    setSearch, setFilterDesa, setFilterStatus,
    setSelected: pilihBalita,
    addBalita, addPemantauan, deleteBalita,
    refresh: fetchAll,
  };
}
