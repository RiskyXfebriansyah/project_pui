/* eslint-disable no-unused-vars */
// ============================================================
//  BalitaPage — VIEW DATA BALITA (FULL CRUD)
//  UPDATE:
//  - Modal Edit Balita: edit data profil balita
//  - BB/TB Terakhir: selalu tampil data terbaru dari riwayat
//  - Modal Ukur: preview status stunting & gizi real-time
//  - Modal Ukur: field catatan (dikirim ke backend)
//  - Modal Balita: posyanduId auto dari currentUser
//  - Tabel riwayat: tampil kolom Status Stunting & Status Gizi
// ============================================================

import React, { useState } from 'react';
import {
  Table, StatusBadge, Button, Modal, Card,
  InputField, SelectField, EmptyState, SectionHeader
} from '../components/ui/Components';
import {
  formatUmur, formatTanggal, getStatusStunting,
  getStatusGizi, hitungUmurBulan
} from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ── TOAST ──────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%',
      transform: 'translateX(-50%)', zIndex: 99999,
      padding: '16px 28px', borderRadius: 16,
      background: isSuccess ? '#16A34A' : '#DC2626',
      color: '#fff', fontWeight: 700, fontSize: 15,
      boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
      display: 'flex', alignItems: 'center', gap: 12,
      minWidth: 320, maxWidth: 520,
      animation: 'toastIn 0.35s cubic-bezier(.21,1.02,.73,1) forwards',
      fontFamily: 'inherit',
      border: `2px solid ${isSuccess ? '#15803D' : '#B91C1C'}`,
    }}>
      <span style={{ fontSize: 26, flexShrink: 0 }}>{isSuccess ? '✅' : '❌'}</span>
      <div style={{ lineHeight: 1.5 }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{isSuccess ? 'Berhasil!' : 'Gagal!'}</div>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.92 }}>{toast.message}</div>
      </div>
      <style>{`@keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }`}</style>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }
  return { toast, showSuccess: m => show('success', m), showError: m => show('error', m) };
}

// ── SPINNER BUTTON ─────────────────────────────────────────────
function SpinnerBtn({ saving, label, savingLabel, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={saving || disabled} style={{
      padding: '10px 20px', background: '#1B6B3A', color: '#fff',
      border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
      cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      opacity: saving ? 0.8 : 1, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {saving
        ? <><span style={{
            width: 14, height: 14, border: '2px solid #fff',
            borderTopColor: 'transparent', borderRadius: '50%',
            display: 'inline-block', animation: 'spin 0.7s linear infinite'
          }}/>{savingLabel}</>
        : label
      }
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

// ── STATUS COLOR HELPER ────────────────────────────────────────
function statusColor(s) {
  if (!s) return { bg: '#F3F4F6', text: '#9E9E9E', border: '#E5E7EB' };
  if (s === 'Normal'   || s === 'Gizi Baik')  return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
  if (s === 'Risiko')                         return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
  if (s === 'Stunting' || s === 'Gizi Buruk') return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
  if (s === 'Gizi Kurang')                    return { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' };
  return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
}

function PreviewBadge({ label, status }) {
  const c = statusColor(status);
  return (
    <div style={{
      flex: 1, padding: '10px 12px', borderRadius: 10,
      background: c.bg, border: `1.5px solid ${c.border}`, textAlign: 'center'
    }}>
      <div style={{ fontSize: 10, color: '#9E9E9E', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{status || '—'}</div>
    </div>
  );
}

// ── HELPER: Ambil BB/TB terbaru dari riwayat atau field langsung ──
// FIX: sort by id DESC — id terbesar = data paling baru diinput
function getLatestMeasurement(balita) {
  if (balita.riwayat?.length) {
    // Sort DESC by id — record dengan id tertinggi = paling baru dimasukkan ke DB
    const sorted = [...balita.riwayat].sort((a, b) => Number(b.id) - Number(a.id));
    const latest = sorted[0];
    return {
      bb: latest.bb || latest.beratBadan,
      tb: latest.tb || latest.tinggiBadan,
      lk: latest.lk || latest.lingkarKepala,
      tgl: latest.tanggal || latest.tglUkur,
    };
  }
  // Fallback ke field langsung jika belum ada riwayat
  return {
    bb: balita.beratBadan,
    tb: balita.tinggiBadan,
    lk: null,
    tgl: balita.tglUkurTerakhir,
  };
}

// ══════════════════════════════════════════════════════════════
export default function BalitaPage(props) {
  const { balita, onAddPemantauan, onAddBalita, onEditBalita, onDelete, role, currentUser } = props;

  const [detail, setDetail]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [showPmt, setShowPmt]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);   // ← NEW: modal edit
  const [showLengkapi, setShowLengkapi] = useState(false);   // ← NEW: modal lengkapi data
  const [lengkapiForm, setLengkapiForm] = useState({});      // ← NEW: form lengkapi
  const [grafik, setGrafik]       = useState('bb');
  const [saving, setSaving]       = useState(false);
  const { toast, showSuccess, showError } = useToast();

  // ── Form tambah balita ─────────────────────────────────────────
  const [form, setForm] = useState({
    nama: '', jenisKelamin: 'Laki-laki', tanggalLahir: '',
    posyanduId: currentUser?.posyanduId || '',
    nik: '', namaIbu: '', namaAyah: '', alamat: '', noTelepon: '',
  });

  // ── Form edit balita ───────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    nama: '', jenisKelamin: 'Laki-laki', tanggalLahir: '',
    nik: '', namaIbu: '', namaAyah: '', alamat: '', noTelepon: '',
    posyanduId: '',
  });

  // ── Form pemantauan ────────────────────────────────────────────
  const [pmtForm, setPmtForm] = useState({ bb: '', tb: '', lk: '', catatan: '' });

  // ── Preview status real-time ───────────────────────────────────
  const previewStunting = (detail && pmtForm.tb && parseFloat(pmtForm.tb) > 0)
    ? getStatusStunting(parseFloat(pmtForm.tb), hitungUmurBulan(detail.tanggalLahir), detail.jenisKelamin)
    : null;
  const previewGizi = (detail && pmtForm.bb && parseFloat(pmtForm.bb) > 0)
    ? getStatusGizi(parseFloat(pmtForm.bb), hitungUmurBulan(detail.tanggalLahir), detail.jenisKelamin)
    : null;

  // ── Buka modal edit: isi form dari data balita yang dipilih ────
  function openEdit(balitaData) {
    setEditForm({
      nama:         balitaData.nama         || '',
      jenisKelamin: balitaData.jenisKelamin || 'Laki-laki',
      tanggalLahir: balitaData.tanggalLahir ? balitaData.tanggalLahir.substring(0, 10) : '',
      nik:          balitaData.nik          || '',
      namaIbu:      balitaData.namaIbu      || '',
      namaAyah:     balitaData.namaAyah     || '',
      alamat:       balitaData.alamat       || '',
      noTelepon:    balitaData.noTelepon    || '',
      posyanduId:   balitaData.posyanduId   || currentUser?.posyanduId || '',
    });
    setShowEdit(true);
  }

  // ── Kolom tabel ────────────────────────────────────────────────
  const columns = [
    { key: 'nama', label: 'NAMA',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{v}</div>
          <div style={{ fontSize: 11, color: '#9E9E9E' }}>{r.namaIbu}</div>
        </div>
      )},
    { key: 'umur', label: 'UMUR',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{formatUmur(r.tanggalLahir)}</div>
          <div style={{ fontSize: 11, color: '#9E9E9E' }}>{r.jenisKelamin}</div>
        </div>
      )},
    { key: 'namaPosyandu', label: 'POSYANDU',
      render: (v, r) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{v || r.posyandu || '-'}</div>
          <div style={{ fontSize: 11, color: '#9E9E9E' }}>{r.desa}</div>
        </div>
      )},
    { key: 'statusStunting', label: 'STATUS STUNTING',
      render: (v, r) => {
        const latest = getLatestMeasurement(r);
        const umur   = hitungUmurBulan(r.tanggalLahir);
        if (latest.tb) return <StatusBadge status={getStatusStunting(latest.tb, umur, r.jenisKelamin)}/>;
        if (v)         return <StatusBadge status={v}/>;
        return <StatusBadge status="Belum diukur"/>;
      }},
    { key: 'beratBadan', label: 'BB TERAKHIR',
      render: (_, r) => {
        const latest = getLatestMeasurement(r);
        const bb = latest.bb || r.beratBadan;
        const tb = latest.tb || r.tinggiBadan;
        if (!bb) return <span style={{ color: '#BDBDBD', fontSize: 12 }}>-</span>;
        return (
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{bb} kg</div>
            <div style={{ fontSize: 11, color: '#9E9E9E' }}>{tb} cm</div>
          </div>
        );
      }},
    { key: 'aksi', label: 'AKSI',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setDetail(r); }}>
            Detail
          </Button>
          <Button size="sm" variant="ghost" onClick={e => {
            e.stopPropagation();
            setDetail(r);
            setPmtForm({ bb: '', tb: '', lk: '', catatan: '' });
            setShowPmt(true);
          }}>
            + Ukur
          </Button>
          {onEditBalita && (
            <Button size="sm" variant="outline" onClick={e => {
              e.stopPropagation();
              setDetail(r);
              openEdit(r);
            }} style={{ borderColor: '#2563EB', color: '#2563EB' }}>
              ✏️ Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="danger" onClick={e => {
              e.stopPropagation();
              if (window.confirm(`Hapus data ${r.nama}?`)) onDelete(r.id);
            }}>🗑️</Button>
          )}
        </div>
      )},
  ];

  const grafikData = detail?.riwayat?.map(p => ({
    tgl: formatTanggal(p.tanggal || p.tglUkur),
    bb:  p.bb  || p.beratBadan,
    tb:  p.tb  || p.tinggiBadan,
    lk:  p.lk  || p.lingkarKepala,
  }));

  // ── Simpan pemantauan ──────────────────────────────────────────
  async function savePemantauan() {
    if (!pmtForm.bb || !pmtForm.tb || !pmtForm.lk) {
      showError('BB, Tinggi Badan, dan LK wajib diisi');
      return;
    }
    setSaving(true);

    const umurBulan      = hitungUmurBulan(detail.tanggalLahir);
    const statusStunting = getStatusStunting(parseFloat(pmtForm.tb), umurBulan, detail.jenisKelamin);
    const statusGizi     = getStatusGizi(parseFloat(pmtForm.bb), umurBulan, detail.jenisKelamin);

    const dto = {
      balitaId:      detail.id,
      beratBadan:    parseFloat(pmtForm.bb),
      tinggiBadan:   parseFloat(pmtForm.tb),
      lingkarKepala: parseFloat(pmtForm.lk),
      statusStunting,
      statusGizi,
      catatan: pmtForm.catatan || null,
    };

    const result = await onAddPemantauan(dto);
    setSaving(false);

    if (result?.ok || result === true) {
      showSuccess(`✅ Pemantauan ${detail.nama} berhasil disimpan! Status: ${statusStunting}`);
      setPmtForm({ bb: '', tb: '', lk: '', catatan: '' });
      setShowPmt(false);
    } else {
      showError(result?.message || 'Gagal menyimpan pemantauan, coba lagi');
    }
  }

  // ── Simpan edit balita ─────────────────────────────────────────
  async function saveEdit() {
    if (!editForm.nama)         { showError('Nama wajib diisi'); return; }
    if (!editForm.nik)          { showError('NIK wajib diisi'); return; }
    if (!editForm.tanggalLahir) { showError('Tanggal lahir wajib diisi'); return; }

    setSaving(true);
    const dto = {
      nama:         editForm.nama,
      nik:          editForm.nik,
      tanggalLahir: editForm.tanggalLahir,
      jenisKelamin: editForm.jenisKelamin,
      posyanduId:   parseInt(editForm.posyanduId) || undefined,
      namaIbu:      editForm.namaIbu   || null,
      namaAyah:     editForm.namaAyah  || null,
      noTelepon:    editForm.noTelepon || null,
      alamat:       editForm.alamat    || null,
    };

    const result = await onEditBalita(detail.id, dto);
    setSaving(false);

    if (result?.ok || result === true) {
      showSuccess(`Data "${editForm.nama}" berhasil diperbarui!`);
      // Update detail lokal supaya tampil langsung
      setDetail(prev => ({ ...prev, ...dto }));
      setShowEdit(false);
    } else {
      showError(result?.message || 'Gagal memperbarui data, coba lagi');
    }
  }

  // ── Buka modal lengkapi data ─────────────────────────────────
  function openLengkapi(balitaData) {
    setLengkapiForm({
      namaIbu:   balitaData.namaIbu   || '',
      namaAyah:  balitaData.namaAyah  || '',
      alamat:    balitaData.alamat    || '',
      noTelepon: balitaData.noTelepon || '',
    });
    setShowLengkapi(true);
  }

  // ── Simpan data lengkap ───────────────────────────────────────
  async function saveLengkapi() {
    setSaving(true);
    const dto = {
      namaIbu:   lengkapiForm.namaIbu   || null,
      namaAyah:  lengkapiForm.namaAyah  || null,
      alamat:    lengkapiForm.alamat    || null,
      noTelepon: lengkapiForm.noTelepon || null,
    };
    const result = await onEditBalita(detail.id, dto);
    setSaving(false);
    if (result?.ok || result === true) {
      showSuccess('Data berhasil dilengkapi!');
      setDetail(prev => ({ ...prev, ...dto }));
      setShowLengkapi(false);
    } else {
      showError(result?.message || 'Gagal menyimpan');
    }
  }

  // ── Simpan balita baru ─────────────────────────────────────────
  async function saveBalita() {
    if (!form.nama)         { showError('Nama wajib diisi'); return; }
    if (!form.nik)          { showError('NIK wajib diisi (16 digit)'); return; }
    if (!form.tanggalLahir) { showError('Tanggal lahir wajib diisi'); return; }
    if (!form.posyanduId)   { showError('ID Posyandu wajib diisi'); return; }

    setSaving(true);
    const dto = {
      nama:         form.nama,
      nik:          form.nik,
      tanggalLahir: form.tanggalLahir,
      jenisKelamin: form.jenisKelamin,
      posyanduId:   parseInt(form.posyanduId),
      namaIbu:      form.namaIbu   || null,
      namaAyah:     form.namaAyah  || null,
      noTelepon:    form.noTelepon || null,
      alamat:       form.alamat    || null,
      orangTuaId:   currentUser?.role === 'orang_tua' ? currentUser.id : null,
    };

    const result = await onAddBalita(dto);
    setSaving(false);

    if (result?.ok || result === true) {
      showSuccess(`Balita "${form.nama}" berhasil ditambahkan!`);
      setForm({
        nama: '', nik: '', jenisKelamin: 'Laki-laki', tanggalLahir: '',
        posyanduId: currentUser?.posyanduId || '',
        namaIbu: '', namaAyah: '', alamat: '', noTelepon: ''
      });
      setShowForm(false);
    } else {
      showError(result?.message || 'Gagal menambahkan balita, coba lagi');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Toast toast={toast}/>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Data Balita</h3>
            <div style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2 }}>
              {balita.length} balita terdaftar
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* {onAddBalita && (
              // <Button variant="ghost" size="sm" onClick={() => alert('Export Excel segera hadir!')}>
              //   📥 Export Excel
              // </Button>
            )} */}
            {onAddBalita && (
              <Button onClick={() => setShowForm(true)}>➕ Tambah Balita</Button>
            )}
            {!onAddBalita && (
              <span style={{ fontSize: 12, color: '#9E9E9E', padding: '8px 0' }}>👁️ Mode lihat saja</span>
            )}
          </div>
        </div>

        {balita.length === 0
          ? <EmptyState emoji="👶" message="Belum ada data balita"/>
          : <Table columns={columns} data={balita} onRowClick={r => setDetail(r)}/>
        }
      </Card>

      {/* ── Modal Detail Balita ─────────────────────────────────── */}
      <Modal open={!!detail && !showPmt && !showEdit && !showLengkapi} onClose={() => setDetail(null)}
        title={`Detail: ${detail?.nama}`} width={640}>
        {detail && (() => {
          const umur    = hitungUmurBulan(detail.tanggalLahir);
          const latest  = getLatestMeasurement(detail);   // ← FIX: pakai helper
          const last    = detail.riwayat?.[detail.riwayat.length - 1];
          const ss = detail.statusStunting
            || (latest.tb
                ? getStatusStunting(latest.tb, umur, detail.jenisKelamin)
                : 'Belum diukur');
          const sg = detail.statusGizi
            || (latest.bb
                ? getStatusGizi(latest.bb, umur, detail.jenisKelamin)
                : 'Belum diukur');
          return (
            <>
              {/* Header balita */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px',
                background: '#F9FAFB', borderRadius: 12, marginBottom: 20
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: detail.jenisKelamin === 'Laki-laki' ? '#EFF6FF' : '#FDF2F8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
                }}>
                  {detail.jenisKelamin === 'Laki-laki' ? '👦' : '👧'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{detail.nama}</div>
                  <div style={{ fontSize: 12, color: '#9E9E9E' }}>
                    {formatUmur(detail.tanggalLahir)} • {detail.jenisKelamin} • {detail.namaPosyandu || '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={ss}/>
                  <StatusBadge status={sg}/>
                  {/* Tombol Edit di header detail */}
                  {onEditBalita && (
                    <button onClick={() => openEdit(detail)} style={{
                      padding: '6px 14px', borderRadius: 8,
                      border: '1.5px solid #2563EB', background: '#EFF6FF',
                      color: '#2563EB', fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}>✏️ Edit</button>
                  )}
                </div>
              </div>

              {/* Banner peringatan data belum lengkap */}
              {(() => {
                const kosong = [
                  !detail.namaIbu   && 'Nama Ibu',
                  !detail.namaAyah  && 'Nama Ayah',
                  !detail.alamat    && 'Alamat',
                  !detail.noTelepon && 'No. Telepon',
                ].filter(Boolean);
                if (!kosong.length) return null;
                return (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12, marginBottom: 16,
                    background: '#FFFBEB', border: '1.5px solid #FCD34D',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>
                        Data belum lengkap
                      </div>
                      <div style={{ fontSize: 11, color: '#B45309' }}>
                        Belum diisi: <strong>{kosong.join(', ')}</strong>
                      </div>
                    </div>
                    <button onClick={() => onEditBalita ? openLengkapi(detail) : openEdit(detail)} style={{
                      padding: '7px 16px', borderRadius: 8, border: 'none',
                      background: '#F59E0B', color: '#fff', fontWeight: 700,
                      fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>📝 Lengkapi Data</button>
                  </div>
                );
              })()}

              {/* Info dasar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  ['NIK',       detail.nik],
                  ['Tgl Lahir', formatTanggal(detail.tanggalLahir)],
                  ['Nama Ibu',  detail.namaIbu],
                  ['Nama Ayah', detail.namaAyah],
                  ['Alamat',    detail.alamat],
                  ['Telepon',   detail.noTelepon],
                ].map(([l, v]) => (
                  <div key={l} style={{
                    background: (!v || v === '-') ? '#FEF9EC' : '#F9FAFB',
                    borderRadius: 8, padding: '10px 12px',
                    border: (!v || v === '-') ? '1px dashed #FCD34D' : '1px solid transparent',
                  }}>
                    <div style={{ fontSize: 10, color: '#9E9E9E', fontWeight: 600, marginBottom: 2 }}>{l}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: (!v || v === '-') ? '#D97706' : 'inherit',
                      fontStyle: (!v || v === '-') ? 'italic' : 'normal',
                    }}>{v || 'Belum diisi'}</div>
                  </div>
                ))}
              </div>

              {/* BB/TB terbaru — FIX: pakai getLatestMeasurement */}
              {(latest.bb || latest.tb) && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {[
                    ['BB', `${latest.bb} kg`, '#1B6B3A'],
                    ['TB', `${latest.tb} cm`, '#2563EB']
                  ].map(([l, v, c]) => (
                    <div key={l} style={{
                      flex: 1, padding: '12px', background: `${c}0A`,
                      borderRadius: 10, border: `1px solid ${c}22`, textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                      <div style={{ fontSize: 11, color: '#9E9E9E' }}>{l} Terakhir</div>
                    </div>
                  ))}
                  {latest.tgl && (
                    <div style={{
                      flex: 1, padding: '12px', background: '#F9FAFB',
                      borderRadius: 10, border: '1px solid #F0F0F0', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>
                        {formatTanggal(latest.tgl)}
                      </div>
                      <div style={{ fontSize: 11, color: '#9E9E9E' }}>Ukur Terakhir</div>
                    </div>
                  )}
                </div>
              )}

              {/* Grafik */}
              {detail.riwayat?.length >= 2 && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[['bb','BB (kg)','#1B6B3A'],['tb','TB (cm)','#2563EB'],['lk','LK (cm)','#D97706']].map(([k,l,c]) => (
                      <button key={k} onClick={() => setGrafik(k)} style={{
                        padding: '5px 14px', borderRadius: 20, border: 'none',
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        background: grafik === k ? c : '#F3F4F6',
                        color: grafik === k ? '#fff' : '#6B7280',
                        fontFamily: 'inherit'
                      }}>{l}</button>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={grafikData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
                      <XAxis dataKey="tgl" tick={{ fontSize: 9, fill: '#9E9E9E' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 9, fill: '#9E9E9E' }} axisLine={false} tickLine={false}/>
                      <Tooltip/>
                      <Line type="monotone" dataKey={grafik} stroke="#1B6B3A" strokeWidth={2.5} dot={{ r: 4, fill: '#1B6B3A' }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* Riwayat tabel */}
              {detail.riwayat?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <SectionHeader title="Riwayat Pemantauan"/>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr>
                          {['Tanggal','BB','TB','LK','Status Stunting','Status Gizi','Catatan'].map(h => (
                            <th key={h} style={{
                              padding: '8px 10px', textAlign: 'left',
                              background: '#F9FAFB', fontSize: 10, fontWeight: 700,
                              color: '#9E9E9E', borderBottom: '1px solid #F0F0F0'
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...detail.riwayat].reverse().map((p, i) => {
                          const pss = p.statusStunting
                            || getStatusStunting(p.tb || p.tinggiBadan, hitungUmurBulan(detail.tanggalLahir), detail.jenisKelamin);
                          const psg = p.statusGizi
                            || getStatusGizi(p.bb || p.beratBadan, hitungUmurBulan(detail.tanggalLahir), detail.jenisKelamin);
                          return (
                            <tr key={p.id || i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                              <td style={{ padding: '8px 10px' }}>{formatTanggal(p.tanggal || p.tglUkur)}</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.bb || p.beratBadan} kg</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.tb || p.tinggiBadan} cm</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.lk || p.lingkarKepala} cm</td>
                              <td style={{ padding: '8px 10px' }}><StatusBadge status={pss}/></td>
                              <td style={{ padding: '8px 10px' }}><StatusBadge status={psg}/></td>
                              <td style={{ padding: '8px 10px', fontSize: 11, color: '#6B7280' }}>
                                {p.catatan || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Button onClick={() => {
                  setPmtForm({ bb: '', tb: '', lk: '', catatan: '' });
                  setShowPmt(true);
                }}>📏 Catat Pemantauan</Button>
                {onEditBalita && (
                  <Button variant="outline" onClick={() => openEdit(detail)}
                    style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                    ✏️ Edit Data
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setDetail(null)}>Tutup</Button>
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ── Modal Edit Balita ───────────────────────────────────── */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={`Edit Data: ${detail?.nama}`} width={560}>

        <div style={{
          padding: '8px 14px', background: '#EFF6FF', borderRadius: 8,
          border: '1px solid #BFDBFE', fontSize: 11, color: '#1D4ED8', marginBottom: 16
        }}>
          ℹ️ Mengubah data profil balita. Data pengukuran (BB/TB) diubah melalui <strong>Catat Pemantauan</strong>.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <InputField label="Nama Lengkap *" value={editForm.nama}
            onChange={v => setEditForm(p => ({ ...p, nama: v }))} required/>
          <InputField label="NIK *" value={editForm.nik}
            onChange={v => setEditForm(p => ({ ...p, nik: v }))} placeholder="3204xxxxxxxxxxxxxxx"/>
          <SelectField label="Jenis Kelamin *" value={editForm.jenisKelamin}
            onChange={v => setEditForm(p => ({ ...p, jenisKelamin: v }))}
            options={['Laki-laki', 'Perempuan']}/>
          <InputField label="Tanggal Lahir *" value={editForm.tanggalLahir}
            onChange={v => setEditForm(p => ({ ...p, tanggalLahir: v }))} type="date"/>
          <InputField label="Nama Ibu" value={editForm.namaIbu}
            onChange={v => setEditForm(p => ({ ...p, namaIbu: v }))}/>
          <InputField label="Nama Ayah" value={editForm.namaAyah}
            onChange={v => setEditForm(p => ({ ...p, namaAyah: v }))}/>
          <InputField label="ID Posyandu" value={editForm.posyanduId}
            onChange={v => setEditForm(p => ({ ...p, posyanduId: v }))}
            type="number" placeholder="1, 2, 3..."/>
          <InputField label="No. Telepon" value={editForm.noTelepon}
            onChange={v => setEditForm(p => ({ ...p, noTelepon: v }))} type="tel"/>
        </div>
        <InputField label="Alamat" value={editForm.alamat}
          onChange={v => setEditForm(p => ({ ...p, alamat: v }))}/>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <SpinnerBtn saving={saving} label="💾 Simpan Perubahan" savingLabel="Menyimpan..." onClick={saveEdit}/>
          <Button variant="ghost" onClick={() => setShowEdit(false)} disabled={saving}>Batal</Button>
        </div>
      </Modal>

      {/* ── Modal Catat Pemantauan ──────────────────────────────── */}
      <Modal open={showPmt} onClose={() => setShowPmt(false)}
        title={`Catat Pemantauan — ${detail?.nama}`} width={440}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', background: '#F0FDF4', borderRadius: 10,
          border: '1px solid #BBF7D0', marginBottom: 16
        }}>
          <span style={{ fontSize: 24 }}>
            {detail?.jenisKelamin === 'Laki-laki' ? '👦' : '👧'}
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{detail?.nama}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              {detail ? `${formatUmur(detail.tanggalLahir)} • ID: ${detail.id}` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <InputField
            label="Berat Badan (kg) *"
            value={pmtForm.bb}
            onChange={v => setPmtForm(p => ({ ...p, bb: v }))}
            type="number" placeholder="11.5"
          />
          <InputField
            label="Tinggi Badan (cm) *"
            value={pmtForm.tb}
            onChange={v => setPmtForm(p => ({ ...p, tb: v }))}
            type="number" placeholder="83.0"
          />
          <InputField
            label="Lingkar Kepala (cm) *"
            value={pmtForm.lk}
            onChange={v => setPmtForm(p => ({ ...p, lk: v }))}
            type="number" placeholder="47.0"
          />
        </div>

        {(previewStunting || previewGizi) ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9E9E9E', marginBottom: 6, letterSpacing: '0.5px' }}>
              📊 PREVIEW STATUS — akan disimpan ke database
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <PreviewBadge label="Status Stunting" status={previewStunting}/>
              <PreviewBadge label="Status Gizi"     status={previewGizi}/>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '8px 12px', background: '#F9FAFB', borderRadius: 8,
            fontSize: 11, color: '#9E9E9E', marginBottom: 14, textAlign: 'center'
          }}>
            Isi TB & BB untuk melihat preview status
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>
            Catatan (opsional)
          </label>
          <textarea
            value={pmtForm.catatan}
            onChange={e => setPmtForm(p => ({ ...p, catatan: e.target.value }))}
            placeholder="Contoh: Perhatikan pola makan, TB kurang dari standar..."
            rows={2}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              border: '1.5px solid #E5E7EB', fontSize: 12, fontFamily: 'inherit',
              outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: '#fff'
            }}
            onFocus={e => e.target.style.borderColor = '#1B6B3A'}
            onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <SpinnerBtn
            saving={saving}
            label="💾 Simpan Pemantauan"
            savingLabel="Menyimpan..."
            onClick={savePemantauan}
          />
          <Button variant="ghost" onClick={() => setShowPmt(false)} disabled={saving}>Batal</Button>
        </div>
      </Modal>

      {/* ── Modal Tambah Balita ─────────────────────────────────── */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Balita Baru" width={560}>

        {currentUser?.posyanduId && (
          <div style={{
            padding: '8px 14px', background: '#F0FDF4', borderRadius: 8,
            border: '1px solid #BBF7D0', fontSize: 11, color: '#15803D', marginBottom: 12
          }}>
            ✅ Posyandu ID <strong>{currentUser.posyanduId}</strong> — otomatis dari akun Anda (bisa diedit)
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <InputField label="Nama Lengkap *" value={form.nama}
            onChange={v => setForm(p => ({ ...p, nama: v }))} required/>
          <InputField label="NIK (16 digit) *" value={form.nik}
            onChange={v => setForm(p => ({ ...p, nik: v }))} placeholder="3204xxxxxxxxxxxxxxx"/>
          <SelectField label="Jenis Kelamin *" value={form.jenisKelamin}
            onChange={v => setForm(p => ({ ...p, jenisKelamin: v }))}
            options={['Laki-laki', 'Perempuan']}/>
          <InputField label="Tanggal Lahir *" value={form.tanggalLahir}
            onChange={v => setForm(p => ({ ...p, tanggalLahir: v }))} type="date"/>
          <InputField label="Nama Ibu" value={form.namaIbu}
            onChange={v => setForm(p => ({ ...p, namaIbu: v }))}/>
          <InputField label="Nama Ayah" value={form.namaAyah}
            onChange={v => setForm(p => ({ ...p, namaAyah: v }))}/>
          <InputField
            label={currentUser?.posyanduId ? 'ID Posyandu * (auto)' : 'ID Posyandu *'}
            value={form.posyanduId}
            onChange={v => setForm(p => ({ ...p, posyanduId: v }))}
            type="number" placeholder="1, 2, 3..."/>
          <InputField label="No. Telepon" value={form.noTelepon}
            onChange={v => setForm(p => ({ ...p, noTelepon: v }))} type="tel"/>
        </div>
        <InputField label="Alamat" value={form.alamat}
          onChange={v => setForm(p => ({ ...p, alamat: v }))}/>

        {currentUser?.role === 'orang_tua' && (
          <div style={{
            padding: '8px 12px', background: '#F0FDF4', borderRadius: 8,
            border: '1px solid #BBF7D0', fontSize: 11, color: '#15803D', marginBottom: 12
          }}>
            ✅ Balita akan terhubung ke akun Anda (orangTuaId = {currentUser.id})
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <SpinnerBtn saving={saving} label="💾 Simpan Data" savingLabel="Menyimpan..." onClick={saveBalita}/>
          <Button variant="ghost" onClick={() => setShowForm(false)} disabled={saving}>Batal</Button>
        </div>
      </Modal>

      {/* ── Modal Lengkapi Data ─────────────────────────────────── */}
      <Modal open={showLengkapi} onClose={() => setShowLengkapi(false)}
        title={`Lengkapi Data — ${detail?.nama}`} width={480}>

        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '12px 16px', background: '#FFFBEB', borderRadius: 10,
          border: '1.5px solid #FCD34D', marginBottom: 20,
        }}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
            Lengkapi data di bawah agar informasi balita lebih akurat dan memudahkan petugas menghubungi orang tua.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <InputField
            label="Nama Ibu"
            value={lengkapiForm.namaIbu}
            onChange={v => setLengkapiForm(p => ({ ...p, namaIbu: v }))}
            placeholder="Nama lengkap ibu"
          />
          <InputField
            label="Nama Ayah"
            value={lengkapiForm.namaAyah}
            onChange={v => setLengkapiForm(p => ({ ...p, namaAyah: v }))}
            placeholder="Nama lengkap ayah"
          />
          <InputField
            label="No. Telepon"
            value={lengkapiForm.noTelepon}
            onChange={v => setLengkapiForm(p => ({ ...p, noTelepon: v }))}
            type="tel" placeholder="08xxxxxxxxxx"
          />
        </div>
        <InputField
          label="Alamat"
          value={lengkapiForm.alamat}
          onChange={v => setLengkapiForm(p => ({ ...p, alamat: v }))}
          placeholder="Alamat lengkap"
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <SpinnerBtn
            saving={saving}
            label="💾 Simpan Data"
            savingLabel="Menyimpan..."
            onClick={saveLengkapi}
          />
          <Button variant="ghost" onClick={() => setShowLengkapi(false)} disabled={saving}>
            Nanti saja
          </Button>
        </div>
      </Modal>
    </div>
  );
}