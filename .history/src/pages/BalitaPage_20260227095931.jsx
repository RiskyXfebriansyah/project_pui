// ============================================================
//  BalitaPage — VIEW DATA BALITA (FULL CRUD)
//  Padanan: V_balita.dart di Flutter
//  FITUR TAMBAHAN WEB: tabel sortable, export, bulk filter
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

export default function BalitaPage({ balita, onAddPemantauan, onAddBalita, onDelete }) {
  const [detail, setDetail]       = useState(null);  // balita yang dibuka detailnya
  const [showForm, setShowForm]   = useState(false); // modal tambah balita
  const [showPmt, setShowPmt]     = useState(false); // modal catat pemantauan
  const [grafik, setGrafik]       = useState('bb');  // toggle grafik: bb|tb|lk

  // Form state untuk tambah balita
  const [form, setForm] = useState({
    nama:'', nik:'', jenisKelamin:'Laki-laki', tanggalLahir:'',
    namaIbu:'', namaAyah:'', alamat:'', noTelepon:'', posyandu:'', desa:''
  });
  // Form pemantauan
  const [pmtForm, setPmtForm] = useState({ bb:'', tb:'', lk:'', catatan:'' });

  // ── Kolom tabel ────────────────────────────────────────────
  const columns = [
    { key:'nama', label:'NAMA',
      render: (v,r) => (
        <div>
          <div style={{ fontWeight:700, fontSize:13 }}>{v}</div>
          <div style={{ fontSize:11, color:'#9E9E9E' }}>{r.namaIbu}</div>
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
      render: (v,r) => (
        <div>
          <div style={{ fontSize:12, fontWeight:600 }}>{v}</div>
          <div style={{ fontSize:11, color:'#9E9E9E' }}>{r.desa}</div>
        </div>
      )},
    { key:'status', label:'STATUS STUNTING',
      render: (_,r) => {
        if (!r.riwayat.length) return <StatusBadge status="Belum diukur"/>;
        const last = r.riwayat[r.riwayat.length-1];
        const umur = hitungUmurBulan(r.tanggalLahir);
        return <StatusBadge status={getStatusStunting(last.tb, umur, r.jenisKelamin)}/>;
      }},
    { key:'bb', label:'BB TERAKHIR',
      render: (_,r) => {
        if (!r.riwayat.length) return <span style={{color:'#BDBDBD', fontSize:12}}>-</span>;
        const last = r.riwayat[r.riwayat.length-1];
        return (
          <div>
            <div style={{fontWeight:700,fontSize:13}}>{last.bb} kg</div>
            <div style={{fontSize:11,color:'#9E9E9E'}}>{last.tb} cm</div>
          </div>
        );
      }},
    { key:'aksi', label:'AKSI',
      render: (_,r) => (
        <div style={{ display:'flex', gap:6 }}>
          <Button size="sm" variant="outline" onClick={e=>{e.stopPropagation();setDetail(r)}}>
            Detail
          </Button>
          <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setDetail(r);setShowPmt(true)}}>
            + Ukur
          </Button>
        </div>
      )},
  ];

  // ── Grafik data ─────────────────────────────────────────────
  const grafikData = detail?.riwayat.map(p => ({
    tgl: formatTanggal(p.tanggal),
    bb: p.bb, tb: p.tb, lk: p.lk
  }));

  // ── Simpan pemantauan ───────────────────────────────────────
  function savePemantauan() {
    if (!pmtForm.bb || !pmtForm.tb || !pmtForm.lk) return;
    onAddPemantauan(detail.id, {
      id: `p${Date.now()}`, tanggal: new Date().toISOString().split('T')[0],
      bb: parseFloat(pmtForm.bb), tb: parseFloat(pmtForm.tb),
      lk: parseFloat(pmtForm.lk), catatan: pmtForm.catatan
    });
    setPmtForm({ bb:'', tb:'', lk:'', catatan:'' });
    setShowPmt(false);
  }

  // ── Simpan balita baru ──────────────────────────────────────
  function saveBalita() {
    if (!form.nama || !form.nik) return;
    onAddBalita(form);
    setForm({ nama:'', nik:'', jenisKelamin:'Laki-laki', tanggalLahir:'',
      namaIbu:'', namaAyah:'', alamat:'', noTelepon:'', posyandu:'', desa:'' });
    setShowForm(false);
  }

  return (
    <div style={{ padding:24 }}>
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Data Balita</h3>
            <div style={{ fontSize:12, color:'#9E9E9E', marginTop:2 }}>
              {balita.length} balita terdaftar
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Button variant="ghost" size="sm" onClick={()=>alert('Export Excel segera hadir!')}>
              📥 Export Excel
            </Button>
            <Button onClick={()=>setShowForm(true)}>
              ➕ Tambah Balita
            </Button>
          </div>
        </div>

        {balita.length === 0
          ? <EmptyState emoji="👶" message="Belum ada data balita"/>
          : <Table columns={columns} data={balita} onRowClick={setDetail}/>
        }
      </Card>

      {/* ── Modal Detail Balita ────────────────────────────── */}
      <Modal open={!!detail && !showPmt} onClose={()=>setDetail(null)}
        title={`Detail: ${detail?.nama}`} width={640}>
        {detail && (() => {
          const umur = hitungUmurBulan(detail.tanggalLahir);
          const last = detail.riwayat[detail.riwayat.length-1];
          const ss   = last ? getStatusStunting(last.tb, umur, detail.jenisKelamin) : 'Belum diukur';
          const sg   = last ? getStatusGizi(last.bb, umur, detail.jenisKelamin) : 'Belum diukur';

          return (
            <>
              {/* Info kepala */}
              <div style={{
                display:'flex', alignItems:'center', gap:16, padding:'14px',
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
                    {formatUmur(detail.tanggalLahir)} • {detail.jenisKelamin} • {detail.posyandu}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <StatusBadge status={ss}/>
                  <StatusBadge status={sg}/>
                </div>
              </div>

              {/* Info orang tua */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
                {[['NIK',detail.nik],['Tgl Lahir',formatTanggal(detail.tanggalLahir)],
                  ['Nama Ibu',detail.namaIbu],['Nama Ayah',detail.namaAyah],
                  ['Alamat',detail.alamat],['Telepon',detail.noTelepon]
                ].map(([l,v])=>(
                  <div key={l} style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 12px' }}>
                    <div style={{ fontSize:10, color:'#9E9E9E', fontWeight:600, marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{v || '-'}</div>
                  </div>
                ))}
              </div>

              {/* Grafik riwayat */}
              {detail.riwayat.length >= 2 && (
                <>
                  <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                    {[['bb','BB (kg)','#1B6B3A'],['tb','TB (cm)','#2563EB'],['lk','LK (cm)','#D97706']].map(
                      ([k,l,c])=>(
                        <button key={k} onClick={()=>setGrafik(k)} style={{
                          padding:'5px 14px', borderRadius:20, border:'none',
                          cursor:'pointer', fontSize:11, fontWeight:700,
                          background: grafik===k ? c : '#F3F4F6',
                          color: grafik===k ? '#fff' : '#6B7280',
                          fontFamily:'inherit'
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
                      <Line type="monotone" dataKey={grafik} stroke="#1B6B3A"
                        strokeWidth={2.5} dot={{r:4,fill:'#1B6B3A'}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* Riwayat tabel */}
              {detail.riwayat.length > 0 && (
                <div style={{ marginTop:16 }}>
                  <SectionHeader title="Riwayat Pemantauan"/>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead>
                        <tr>{['Tanggal','BB','TB','LK','Status'].map(h=>(
                          <th key={h} style={{ padding:'8px 10px', textAlign:'left',
                            background:'#F9FAFB', fontSize:10, fontWeight:700,
                            color:'#9E9E9E', borderBottom:'1px solid #F0F0F0' }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {[...detail.riwayat].reverse().map(p=>{
                          const pss = getStatusStunting(p.tb, umur, detail.jenisKelamin);
                          return (
                            <tr key={p.id} style={{ borderBottom:'1px solid #F9FAFB' }}>
                              <td style={{padding:'8px 10px'}}>{formatTanggal(p.tanggal)}</td>
                              <td style={{padding:'8px 10px',fontWeight:600}}>{p.bb} kg</td>
                              <td style={{padding:'8px 10px',fontWeight:600}}>{p.tb} cm</td>
                              <td style={{padding:'8px 10px',fontWeight:600}}>{p.lk} cm</td>
                              <td style={{padding:'8px 10px'}}><StatusBadge status={pss}/></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <Button onClick={()=>setShowPmt(true)}>📏 Catat Pemantauan</Button>
                <Button variant="ghost" onClick={()=>setDetail(null)}>Tutup</Button>
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ── Modal Catat Pemantauan ─────────────────────────── */}
      <Modal open={showPmt} onClose={()=>setShowPmt(false)}
        title={`Catat Pemantauan — ${detail?.nama}`} width={400}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <InputField label="Berat (kg)" value={pmtForm.bb}
            onChange={v=>setPmtForm(p=>({...p,bb:v}))} type="number" placeholder="11.5"/>
          <InputField label="Tinggi (cm)" value={pmtForm.tb}
            onChange={v=>setPmtForm(p=>({...p,tb:v}))} type="number" placeholder="83.0"/>
          <InputField label="LK (cm)" value={pmtForm.lk}
            onChange={v=>setPmtForm(p=>({...p,lk:v}))} type="number" placeholder="47.0"/>
        </div>
        <InputField label="Catatan (opsional)" value={pmtForm.catatan}
          onChange={v=>setPmtForm(p=>({...p,catatan:v}))} placeholder="Kondisi balita..."/>
        <div style={{ display:'flex', gap:10 }}>
          <Button onClick={savePemantauan}>💾 Simpan</Button>
          <Button variant="ghost" onClick={()=>setShowPmt(false)}>Batal</Button>
        </div>
      </Modal>

      {/* ── Modal Tambah Balita ────────────────────────────── */}
      <Modal open={showForm} onClose={()=>setShowForm(false)} title="Tambah Balita Baru" width={560}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          <InputField label="Nama Lengkap" value={form.nama}
            onChange={v=>setForm(p=>({...p,nama:v}))} required/>
          <InputField label="NIK (16 digit)" value={form.nik}
            onChange={v=>setForm(p=>({...p,nik:v}))} required/>
          <SelectField label="Jenis Kelamin" value={form.jenisKelamin}
            onChange={v=>setForm(p=>({...p,jenisKelamin:v}))}
            options={['Laki-laki','Perempuan']}/>
          <InputField label="Tanggal Lahir" value={form.tanggalLahir}
            onChange={v=>setForm(p=>({...p,tanggalLahir:v}))} type="date"/>
          <InputField label="Nama Ibu" value={form.namaIbu}
            onChange={v=>setForm(p=>({...p,namaIbu:v}))}/>
          <InputField label="Nama Ayah" value={form.namaAyah}
            onChange={v=>setForm(p=>({...p,namaAyah:v}))}/>
          <InputField label="Posyandu" value={form.posyandu}
            onChange={v=>setForm(p=>({...p,posyandu:v}))}/>
          <InputField label="Desa" value={form.desa}
            onChange={v=>setForm(p=>({...p,desa:v}))}/>
        </div>
        <InputField label="Alamat" value={form.alamat}
          onChange={v=>setForm(p=>({...p,alamat:v}))}/>
        <InputField label="No. Telepon" value={form.noTelepon}
          onChange={v=>setForm(p=>({...p,noTelepon:v}))} type="tel"/>
        <div style={{ display:'flex', gap:10 }}>
          <Button onClick={saveBalita}>💾 Simpan Data</Button>
          <Button variant="ghost" onClick={()=>setShowForm(false)}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}
