import React, { useState } from 'react';
import {
  Table, StatusBadge, Button, Modal, Card,
  InputField, SelectField, EmptyState, SectionHeader
} from '../components/ui/Components';
import { formatUmur, formatTanggal } from '../utils/helpers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function BalitaPage({ balita, onAddPemantauan, onAddBalita, onDelete, role }) {
  const [detail, setDetail]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPmt, setShowPmt]   = useState(false);
  const [grafik, setGrafik]     = useState('bb');
  const [saving, setSaving]     = useState(false);

  // Form tambah balita — pakai posyanduId (angka) sesuai API
  const [form, setForm] = useState({
    nama:'', jenisKelamin:'Laki-laki', tanggalLahir:'', posyanduId:''
  });

  // Form pemantauan
  const [pmtForm, setPmtForm] = useState({ bb:'', tb:'', lk:'' });

  // ── Kolom tabel ─────────────────────────────────────────────
  const columns = [
    { key:'nama', label:'NAMA',
      render: (v,r) => (
        <div>
          <div style={{ fontWeight:700, fontSize:13 }}>{v}</div>
          <div style={{ fontSize:11, color:'#9E9E9E' }}>{r.namaIbu || '-'}</div>
        </div>
      )},
    { key:'umur', label:'UMUR',
      render: (_,r) => (
        <div>
          <div style={{ fontWeight:600, fontSize:12 }}>{formatUmur(r.tanggalLahir)}</div>
          <div style={{ fontSize:11, color:'#9E9E9E' }}>{r.jenisKelamin}</div>
        </div>
      )},
    { key:'posyandu', label:'POSYANDU',
      render: (_,r) => (
        <div>
          <div style={{ fontSize:12, fontWeight:600 }}>{r.posyandu || r.namaPosyandu || '-'}</div>
          <div style={{ fontSize:11, color:'#9E9E9E' }}>{r.desa}</div>
        </div>
      )},
    { key:'statusStunting', label:'STATUS STUNTING',
      render: (v) => <StatusBadge status={v || 'Belum diukur'}/> },
    { key:'beratBadan', label:'BB TERAKHIR',
      render: (_,r) => r.beratBadan
        ? <div><div style={{fontWeight:700,fontSize:13}}>{r.beratBadan} kg</div>
            <div style={{fontSize:11,color:'#9E9E9E'}}>{r.tinggiBadan} cm</div></div>
        : <span style={{color:'#BDBDBD',fontSize:12}}>Belum diukur</span>
    },
    { key:'aksi', label:'AKSI',
      render: (_,r) => (
        <div style={{ display:'flex', gap:6 }}>
          <Button size="sm" variant="outline" onClick={e=>{e.stopPropagation();handleDetail(r)}}>
            Detail
          </Button>
          <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();handleDetail(r);setShowPmt(true)}}>
            + Ukur
          </Button>
          {onDelete && (
            <Button size="sm" variant="danger" onClick={e=>{e.stopPropagation();handleDelete(r.id)}}>
              🗑️
            </Button>
          )}
        </div>
      )},
  ];

  // Buka detail — load riwayat dari parent (useBalita.setSelected)
  function handleDetail(b) {
    setDetail(b);
    // trigger load riwayat pemantauan dari API via prop
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus data balita ini?')) return;
    await onDelete(id);
  }

  // ── Simpan pemantauan → kirim ke API via onAddPemantauan ────
  async function savePemantauan() {
    if (!pmtForm.bb || !pmtForm.tb) { alert('Berat dan tinggi wajib diisi'); return; }
    setSaving(true);
    const ok = await onAddPemantauan(detail.id, {
      bb: parseFloat(pmtForm.bb),
      tb: parseFloat(pmtForm.tb),
      lk: parseFloat(pmtForm.lk) || 0,
    });
    setSaving(false);
    if (ok) { setPmtForm({ bb:'', tb:'', lk:'' }); setShowPmt(false); }
  }

  // ── Simpan balita baru → kirim ke API via onAddBalita ───────
  async function saveBalita() {
    if (!form.nama || !form.tanggalLahir || !form.posyanduId) {
      alert('Nama, tanggal lahir, dan ID Posyandu wajib diisi'); return;
    }
    setSaving(true);
    const ok = await onAddBalita({
      nama: form.nama,
      jenisKelamin: form.jenisKelamin,
      tanggalLahir: new Date(form.tanggalLahir).toISOString(),
      posyanduId: parseInt(form.posyanduId),
    });
    setSaving(false);
    if (ok) {
      setForm({ nama:'', jenisKelamin:'Laki-laki', tanggalLahir:'', posyanduId:'' });
      setShowForm(false);
    }
  }

  // Grafik data dari riwayat
  const grafikData = (detail?.riwayat || []).map(p => ({
    tgl: formatTanggal(p.tanggal), bb: p.bb, tb: p.tb, lk: p.lk
  }));

  return (
    <div style={{ padding:24 }}>
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Data Balita</h3>
            <div style={{ fontSize:12, color:'#9E9E9E', marginTop:2 }}>{balita.length} balita terdaftar</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {onAddBalita && (
              <Button onClick={()=>setShowForm(true)}>➕ Tambah Balita</Button>
            )}
            {!onAddBalita && (
              <span style={{fontSize:12,color:'#9E9E9E',padding:'8px 0'}}>👁️ Mode lihat saja</span>
            )}
          </div>
        </div>

        {balita.length === 0
          ? <EmptyState emoji="👶" message="Belum ada data balita"/>
          : <Table columns={columns} data={balita} onRowClick={handleDetail}/>
        }
      </Card>

      {/* ── Modal Detail ──────────────────────────────────── */}
      <Modal open={!!detail && !showPmt} onClose={()=>setDetail(null)}
        title={`Detail: ${detail?.nama}`} width={640}>
        {detail && (
          <>
            <div style={{
              display:'flex', alignItems:'center', gap:16, padding:14,
              background:'#F9FAFB', borderRadius:12, marginBottom:20
            }}>
              <div style={{
                width:56, height:56, borderRadius:'50%',
                background: detail.jenisKelamin==='Laki-laki' ? '#EFF6FF' : '#FDF2F8',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:28
              }}>
                {detail.jenisKelamin==='Laki-laki' ? '👦' : '👧'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:16 }}>{detail.nama}</div>
                <div style={{ fontSize:12, color:'#9E9E9E' }}>
                  {formatUmur(detail.tanggalLahir)} • {detail.jenisKelamin} • {detail.posyandu || detail.namaPosyandu}
                </div>
              </div>
              <StatusBadge status={detail.statusStunting || 'Belum diukur'}/>
            </div>

            {/* Info grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {[
                ['NIK', detail.nik],
                ['Tgl Lahir', formatTanggal(detail.tanggalLahir)],
                ['Nama Ibu', detail.namaIbu],
                ['Nama Ayah', detail.namaAyah],
                ['Alamat', detail.alamat],
                ['Telepon', detail.noTelepon],
              ].map(([l,v]) => (
                <div key={l} style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, color:'#9E9E9E', fontWeight:600, marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{v || '-'}</div>
                </div>
              ))}
            </div>

            {/* Grafik */}
            {(detail.riwayat||[]).length >= 2 && (
              <>
                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                  {[['bb','BB (kg)','#1B6B3A'],['tb','TB (cm)','#2563EB'],['lk','LK (cm)','#D97706']].map(
                    ([k,l,c]) => (
                      <button key={k} onClick={()=>setGrafik(k)} style={{
                        padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer',
                        fontSize:11, fontWeight:700, fontFamily:'inherit',
                        background: grafik===k ? c : '#F3F4F6',
                        color: grafik===k ? '#fff' : '#6B7280',
                      }}>{l}</button>
                    )
                  )}
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={grafikData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
                    <XAxis dataKey="tgl" tick={{fontSize:9,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:9,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
                    <Tooltip/>
                    <Line type="monotone" dataKey={grafik} stroke="#1B6B3A" strokeWidth={2.5} dot={{r:4,fill:'#1B6B3A'}}/>
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}

            {/* Riwayat tabel */}
            {(detail.riwayat||[]).length > 0 && (
              <div style={{ marginTop:16 }}>
                <SectionHeader title="Riwayat Pemantauan"/>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>{['Tanggal','BB','TB','LK','Status'].map(h=>(
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left',
                        background:'#F9FAFB', fontSize:10, fontWeight:700,
                        color:'#9E9E9E', borderBottom:'1px solid #F0F0F0' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {[...(detail.riwayat||[])].reverse().map(p=>(
                      <tr key={p.id} style={{ borderBottom:'1px solid #F9FAFB' }}>
                        <td style={{padding:'8px 10px'}}>{formatTanggal(p.tanggal)}</td>
                        <td style={{padding:'8px 10px',fontWeight:600}}>{p.bb} kg</td>
                        <td style={{padding:'8px 10px',fontWeight:600}}>{p.tb} cm</td>
                        <td style={{padding:'8px 10px',fontWeight:600}}>{p.lk || '-'} cm</td>
                        <td style={{padding:'8px 10px'}}><StatusBadge status={p.statusStunting || '-'}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <Button onClick={()=>setShowPmt(true)}>📏 Catat Pemantauan</Button>
              <Button variant="ghost" onClick={()=>setDetail(null)}>Tutup</Button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Modal Catat Pemantauan ────────────────────────── */}
      <Modal open={showPmt} onClose={()=>setShowPmt(false)}
        title={`Catat Pemantauan — ${detail?.nama}`} width={400}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <InputField label="Berat (kg) *" value={pmtForm.bb}
            onChange={v=>setPmtForm(p=>({...p,bb:v}))} type="number" placeholder="11.5"/>
          <InputField label="Tinggi (cm) *" value={pmtForm.tb}
            onChange={v=>setPmtForm(p=>({...p,tb:v}))} type="number" placeholder="83.0"/>
          <InputField label="LK (cm)" value={pmtForm.lk}
            onChange={v=>setPmtForm(p=>({...p,lk:v}))} type="number" placeholder="47.0"/>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <Button onClick={savePemantauan} disabled={saving}>
            {saving ? '⏳ Menyimpan...' : '💾 Simpan'}
          </Button>
          <Button variant="ghost" onClick={()=>setShowPmt(false)}>Batal</Button>
        </div>
      </Modal>

      {/* ── Modal Tambah Balita ───────────────────────────── */}
      <Modal open={showForm} onClose={()=>setShowForm(false)} title="Tambah Balita Baru" width={480}>
        <InputField label="Nama Lengkap *" value={form.nama}
          onChange={v=>setForm(p=>({...p,nama:v}))}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          <SelectField label="Jenis Kelamin" value={form.jenisKelamin}
            onChange={v=>setForm(p=>({...p,jenisKelamin:v}))}
            options={['Laki-laki','Perempuan']}/>
          <InputField label="Tanggal Lahir *" value={form.tanggalLahir}
            onChange={v=>setForm(p=>({...p,tanggalLahir:v}))} type="date"/>
        </div>
        <InputField label="ID Posyandu *" value={form.posyanduId}
          onChange={v=>setForm(p=>({...p,posyanduId:v}))} type="number"
          placeholder="Contoh: 1, 2, 3 (lihat tabel posyandu)"/>
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <Button onClick={saveBalita} disabled={saving}>
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Data'}
          </Button>
          <Button variant="ghost" onClick={()=>setShowForm(false)}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}
