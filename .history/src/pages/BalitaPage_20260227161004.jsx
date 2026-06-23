/* eslint-disable no-unused-vars */
// ============================================================
//  BalitaPage — VIEW DATA BALITA (FULL CRUD)
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
      position: 'fixed',
      top: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 99999,
      padding: '16px 28px',
      borderRadius: 16,
      background: isSuccess ? '#16A34A' : '#DC2626',
      color: '#fff',
      fontWeight: 700,
      fontSize: 15,
      boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 320,
      maxWidth: 520,
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

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function BalitaPage(props) {
  const { balita, onAddPemantauan, onAddBalita, onDelete, role } = props;

  const [detail, setDetail]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPmt, setShowPmt]   = useState(false);
  const [grafik, setGrafik]     = useState('bb');
  const [saving, setSaving]     = useState(false);
  const { toast, showSuccess, showError } = useToast();

  // ── Form tambah balita — sesuai BalitaCreateDTO ───────────────
  // DTO: nama, tanggalLahir, jenisKelamin, posyanduId
  // Field lain (nik, namaIbu, dll) untuk tampilan lokal saja
  const [form, setForm] = useState({
    nama: '', jenisKelamin: 'Laki-laki', tanggalLahir: '', posyanduId: '',
    // Field tampilan (tidak dikirim ke API utama):
    nik: '', namaIbu: '', namaAyah: '', alamat: '', noTelepon: '',
  });

  // ── Form pemantauan — sesuai PemantauanCreateDTO ─────────────
  // DTO: balitaId, beratBadan, tinggiBadan, lingkarKepala
  const [pmtForm, setPmtForm] = useState({ bb: '', tb: '', lk: '' });

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
        // Gunakan statusStunting dari API kalau ada
        if (v) return <StatusBadge status={v}/>;
        if (!r.riwayat?.length) return <StatusBadge status="Belum diukur"/>;
        const last = r.riwayat[r.riwayat.length - 1];
        const umur = hitungUmurBulan(r.tanggalLahir);
        return <StatusBadge status={getStatusStunting(last.tb, umur, r.jenisKelamin)}/>;
      }},
    { key: 'beratBadan', label: 'BB TERAKHIR',
      render: (v, r) => {
        const bb = v || r.riwayat?.[r.riwayat.length - 1]?.bb;
        const tb = r.tinggiBadan || r.riwayat?.[r.riwayat.length - 1]?.tb;
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
          <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setDetail(r); setShowPmt(true); }}>
            + Ukur
          </Button>
        </div>
      )},
  ];

  const grafikData = detail?.riwayat?.map(p => ({
    tgl: formatTanggal(p.tanggal || p.tglUkur),
    bb: p.bb || p.beratBadan,
    tb: p.tb || p.tinggiBadan,
    lk: p.lk || p.lingkarKepala,
  }));

  // ── Simpan pemantauan — kirim PemantauanCreateDTO ke API ──────
  async function savePemantauan() {
    if (!pmtForm.bb || !pmtForm.tb || !pmtForm.lk) {
      showError('BB, Tinggi, dan LK wajib diisi');
      return;
    }
    setSaving(true);
    const dto = {
      balitaId:     detail.id,
      beratBadan:   parseFloat(pmtForm.bb),
      tinggiBadan:  parseFloat(pmtForm.tb),
      lingkarKepala: parseFloat(pmtForm.lk),
    };
    const result = await onAddPemantauan(dto);
    setSaving(false);

    if (result?.ok || result === true) {
      showSuccess(`Pemantauan ${detail.nama} berhasil disimpan!`);
      setPmtForm({ bb: '', tb: '', lk: '' });
      setShowPmt(false);
    } else {
      showError(result?.message || 'Gagal menyimpan pemantauan, coba lagi');
    }
  }

  // ── Simpan balita baru — kirim BalitaCreateDTO ke API ─────────
  async function saveBalita() {
    if (!form.nama) { showError('Nama wajib diisi'); return; }
    if (!form.nik)  { showError('NIK wajib diisi (16 digit)'); return; }
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
      noTelepon:    form.noTelepon  || null,
      alamat:       form.alamat    || null,
    };
    const result = await onAddBalita(dto);
    setSaving(false);
    if (result?.ok || result === true) {
      showSuccess(`Balita "${form.nama}" berhasil ditambahkan!`);
      setForm({ nama:'', nik:'', jenisKelamin:'Laki-laki', tanggalLahir:'', posyanduId:'', namaIbu:'', namaAyah:'', alamat:'', noTelepon:'' });
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
            {onAddBalita && (
              <Button variant="ghost" size="sm" onClick={() => alert('Export Excel segera hadir!')}>
                📥 Export Excel
              </Button>
            )}
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
          : <Table columns={columns} data={balita} onRowClick={setDetail}/>
        }
      </Card>

      {/* ── Modal Detail Balita ─────────────────────────────────── */}
      <Modal open={!!detail && !showPmt} onClose={() => setDetail(null)}
        title={`Detail: ${detail?.nama}`} width={640}>
        {detail && (() => {
          const umur = hitungUmurBulan(detail.tanggalLahir);
          const last = detail.riwayat?.[detail.riwayat.length - 1];
          const ss   = detail.statusStunting || (last ? getStatusStunting(last.tb, umur, detail.jenisKelamin) : 'Belum diukur');
          const sg   = detail.statusGizi     || (last ? getStatusGizi(last.bb, umur, detail.jenisKelamin)     : 'Belum diukur');

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
                    {formatUmur(detail.tanggalLahir)} • {detail.jenisKelamin} • {detail.namaPosyandu || detail.posyandu || '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <StatusBadge status={ss}/>
                  <StatusBadge status={sg}/>
                </div>
              </div>

              {/* Info orang tua */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  ['NIK', detail.nik],
                  ['Tgl Lahir', formatTanggal(detail.tanggalLahir)],
                  ['Nama Ibu', detail.namaIbu],
                  ['Nama Ayah', detail.namaAyah],
                  ['Alamat', detail.alamat],
                  ['Telepon', detail.noTelepon],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#9E9E9E', fontWeight: 600, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v || '-'}</div>
                  </div>
                ))}
              </div>

              {/* Ukuran terakhir dari API */}
              {(detail.beratBadan || detail.tinggiBadan) && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {[
                    ['BB', `${detail.beratBadan} kg`, '#1B6B3A'],
                    ['TB', `${detail.tinggiBadan} cm`, '#2563EB'],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{
                      flex: 1, padding: '12px', background: `${c}0A`,
                      borderRadius: 10, border: `1px solid ${c}22`, textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                      <div style={{ fontSize: 11, color: '#9E9E9E' }}>{l} Terakhir</div>
                    </div>
                  ))}
                  {detail.tglUkurTerakhir && (
                    <div style={{
                      flex: 1, padding: '12px', background: '#F9FAFB',
                      borderRadius: 10, border: '1px solid #F0F0F0', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>
                        {formatTanggal(detail.tglUkurTerakhir)}
                      </div>
                      <div style={{ fontSize: 11, color: '#9E9E9E' }}>Ukur Terakhir</div>
                    </div>
                  )}
                </div>
              )}

              {/* Grafik riwayat */}
              {detail.riwayat?.length >= 2 && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[['bb', 'BB (kg)', '#1B6B3A'], ['tb', 'TB (cm)', '#2563EB'], ['lk', 'LK (cm)', '#D97706']].map(
                      ([k, l, c]) => (
                        <button key={k} onClick={() => setGrafik(k)} style={{
                          padding: '5px 14px', borderRadius: 20, border: 'none',
                          cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          background: grafik === k ? c : '#F3F4F6',
                          color: grafik === k ? '#fff' : '#6B7280',
                          fontFamily: 'inherit'
                        }}>{l}</button>
                      )
                    )}
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
                        <tr>{['Tanggal', 'BB', 'TB', 'LK', 'Status'].map(h => (
                          <th key={h} style={{
                            padding: '8px 10px', textAlign: 'left',
                            background: '#F9FAFB', fontSize: 10, fontWeight: 700,
                            color: '#9E9E9E', borderBottom: '1px solid #F0F0F0'
                          }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {[...detail.riwayat].reverse().map((p, i) => {
                          const pss = getStatusStunting(
                            p.tb || p.tinggiBadan,
                            hitungUmurBulan(detail.tanggalLahir),
                            detail.jenisKelamin
                          );
                          return (
                            <tr key={p.id || i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                              <td style={{ padding: '8px 10px' }}>{formatTanggal(p.tanggal || p.tglUkur)}</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.bb || p.beratBadan} kg</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.tb || p.tinggiBadan} cm</td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{p.lk || p.lingkarKepala} cm</td>
                              <td style={{ padding: '8px 10px' }}><StatusBadge status={pss}/></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Button onClick={() => setShowPmt(true)}>📏 Catat Pemantauan</Button>
                <Button variant="ghost" onClick={() => setDetail(null)}>Tutup</Button>
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ── Modal Catat Pemantauan ──────────────────────────────── */}
      <Modal open={showPmt} onClose={() => setShowPmt(false)}
        title={`Catat Pemantauan — ${detail?.nama}`} width={400}>

        {/* Info DTO yang dikirim */}
        <div style={{
          padding: '10px 14px', background: '#F0FDF4', borderRadius: 10,
          border: '1px solid #BBF7D0', fontSize: 12, color: '#15803D', marginBottom: 16
        }}>
          📋 Data akan dikirim ke API: <strong>balitaId={detail?.id}</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <InputField label="Berat Badan (kg) *" value={pmtForm.bb}
            onChange={v => setPmtForm(p => ({ ...p, bb: v }))} type="number" placeholder="11.5"/>
          <InputField label="Tinggi Badan (cm) *" value={pmtForm.tb}
            onChange={v => setPmtForm(p => ({ ...p, tb: v }))} type="number" placeholder="83.0"/>
          <InputField label="Lingkar Kepala (cm) *" value={pmtForm.lk}
            onChange={v => setPmtForm(p => ({ ...p, lk: v }))} type="number" placeholder="47.0"/>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
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
          <InputField label="ID Posyandu *" value={form.posyanduId}
            onChange={v => setForm(p => ({ ...p, posyanduId: v }))} type="number" placeholder="1, 2, 3..."/>
          <InputField label="No. Telepon" value={form.noTelepon}
            onChange={v => setForm(p => ({ ...p, noTelepon: v }))} type="tel"/>
        </div>
        <InputField label="Alamat" value={form.alamat}
          onChange={v => setForm(p => ({ ...p, alamat: v }))}/>
        <div style={{ display: 'flex', gap: 10 }}>
          <SpinnerBtn
            saving={saving}
            label="💾 Simpan Data"
            savingLabel="Menyimpan..."
            onClick={saveBalita}
          />
          <Button variant="ghost" onClick={() => setShowForm(false)} disabled={saving}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}