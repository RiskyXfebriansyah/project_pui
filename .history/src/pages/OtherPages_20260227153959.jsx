// ============================================================
//  HALAMAN-HALAMAN LAINNYA
//  LaporanPage, JadwalPage, PenggunaPage, PosyanduPage,
//  StuntingPage, PemantauanPage
// ============================================================

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Card, SectionHeader, StatusBadge, RoleBadge, TipeBadge,
  Button, Modal, InputField, SelectField, EmptyState, Table } from '../components/ui/Components';
import { trenStunting, posyanduList as initPosyandu } from '../data/dummyData';
import { formatUmur, formatTanggal, hitungUmurBulan,
  getStatusStunting, getStatusGizi } from '../utils/helpers';

// ── TOAST COMPONENT ────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      zIndex: 99999,
      padding: '14px 22px',
      borderRadius: 14,
      background: isSuccess ? '#16A34A' : '#DC2626',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 280,
      maxWidth: 400,
      animation: 'toastIn 0.35s cubic-bezier(.21,1.02,.73,1) forwards',
      fontFamily: 'inherit',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>
        {isSuccess ? '✅' : '❌'}
      </span>
      <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
    </div>
  );
}

// ── TOAST KEYFRAMES — inject sekali ───────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('toast-style')) {
  const style = document.createElement('style');
  style.id = 'toast-style';
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
  `;
  document.head.appendChild(style);
}

// ── HOOK TOAST ─────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  }
  return { toast, showSuccess: (m) => show('success', m), showError: (m) => show('error', m) };
}

// ── LAPORAN PAGE ───────────────────────────────────────────────
export function LaporanPage({ statistik, balitaList }) {
  const gizi = { baik:0, kurang:0, buruk:0, lebih:0 };
  let laki=0, perempuan=0;

  for (const b of balitaList) {
    b.jenisKelamin==='Laki-laki' ? laki++ : perempuan++;
    if (!b.riwayat.length) { gizi.baik++; continue; }
    const last=b.riwayat[b.riwayat.length-1];
    const umur=hitungUmurBulan(b.tanggalLahir);
    const sg=getStatusGizi(last.bb,umur,b.jenisKelamin);
    if(sg==='Gizi Baik')gizi.baik++;
    else if(sg==='Gizi Kurang')gizi.kurang++;
    else if(sg==='Gizi Buruk')gizi.buruk++;
    else gizi.lebih++;
  }

  const stuntingData = [
    {label:'Normal',  nilai:statistik.normal,  color:'#16A34A'},
    {label:'Risiko',  nilai:statistik.risiko,   color:'#D97706'},
    {label:'Stunting',nilai:statistik.stunting, color:'#DC2626'},
  ];
  const giziData = [
    {label:'Baik',  nilai:gizi.baik,   color:'#16A34A'},
    {label:'Kurang',nilai:gizi.kurang,  color:'#D97706'},
    {label:'Buruk', nilai:gizi.buruk,   color:'#DC2626'},
    {label:'Lebih', nilai:gizi.lebih,   color:'#7C3AED'},
  ];
  const genderData = [
    {name:'Laki-laki', value:laki,      color:'#2563EB'},
    {name:'Perempuan', value:perempuan, color:'#DB2777'},
  ];

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div style={{
          display:'flex',alignItems:'center',gap:10,padding:'10px 16px',
          background:'#F0FDF4',borderRadius:10,border:'1px solid #BBF7D0'
        }}>
          <span>📅</span>
          <span style={{fontSize:13,fontWeight:700,color:'#15803D'}}>Periode: Desember 2024</span>
        </div>
        <div style={{display:'flex',gap:10}}>
          <Button variant="ghost" size="sm" onClick={()=>alert('Export PDF segera hadir!')}>
            📄 Export PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={()=>alert('Export Excel segera hadir!')}>
            📊 Export Excel
          </Button>
          <Button size="sm" onClick={()=>window.print()}>🖨️ Cetak</Button>
        </div>
      </div>

      <div style={{display:'flex',gap:14,marginBottom:20,flexWrap:'wrap'}}>
        {[
          ['Total Balita',statistik.total,'👶','#1565C0','#EFF6FF'],
          ['Hadir',Math.round(statistik.total*0.82),'✅','#16A34A','#F0FDF4'],
          ['Tidak Hadir',Math.round(statistik.total*0.18),'❌','#9E9E9E','#F9FAFB'],
          ['Dapat Vit A',Math.round(statistik.total*0.75),'💊','#D97706','#FFFBEB'],
        ].map(([l,v,i,c,bg])=>(
          <div key={l} style={{
            flex:1,minWidth:140,padding:'16px',background:bg,borderRadius:14,
            border:`1px solid ${c}22`
          }}>
            <div style={{fontSize:22,marginBottom:4}}>{i}</div>
            <div style={{fontSize:26,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:11,color:'#9E9E9E',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
        <Card>
          <SectionHeader title="Status Stunting"/>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stuntingData} margin={{left:-15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <Tooltip/>
              <Bar dataKey="nilai" radius={[6,6,0,0]}>
                {stuntingData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader title="Status Gizi"/>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={giziData} margin={{left:-15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <Tooltip/>
              <Bar dataKey="nilai" radius={[6,6,0,0]}>
                {giziData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader title="Jenis Kelamin"/>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                dataKey="value" paddingAngle={4}>
                {genderData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {genderData.map(d=>(
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:d.color}}/>
                <span style={{flex:1,color:'#6B7280'}}>{d.name}</span>
                <strong style={{color:d.color}}>{d.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Tren Stunting 6 Bulan"/>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trenStunting} margin={{left:-15,right:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
            <XAxis dataKey="bulan" tick={{fontSize:11,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
            <Tooltip/>
            <Legend iconSize={8} iconType="circle"
              formatter={v=><span style={{fontSize:11,color:'#6B7280'}}>{v}</span>}/>
            <Line type="monotone" dataKey="stunting" name="Stunting" stroke="#DC2626" strokeWidth={2} dot={{r:3}}/>
            <Line type="monotone" dataKey="risiko" name="Risiko" stroke="#D97706" strokeWidth={2} dot={{r:3}}/>
            <Line type="monotone" dataKey="normal" name="Normal" stroke="#16A34A" strokeWidth={2} dot={{r:3}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ── JADWAL PAGE ────────────────────────────────────────────────
export function JadwalPage({ jadwal, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({judul:'',tanggal:'',waktu:'',lokasi:'',tipe:'posyandu',desa:'',deskripsi:''});
  const { toast, showSuccess, showError } = useToast();

  const TIPE_COLOR = {posyandu:'#16A34A',imunisasi:'#2563EB',penyuluhan:'#EA580C',pmt:'#9333EA'};

  async function save() {
    if (!form.judul||!form.tanggal) {
      showError('Judul dan tanggal wajib diisi');
      return;
    }
    const result = await onAdd(form);
    if (result?.ok !== false) {
      showSuccess('Jadwal berhasil ditambahkan!');
      setForm({judul:'',tanggal:'',waktu:'',lokasi:'',tipe:'posyandu',desa:'',deskripsi:''});
      setShowForm(false);
    } else {
      showError(result?.message || 'Gagal menambahkan jadwal');
    }
  }

  return (
    <div style={{padding:24}}>
      <Toast toast={toast}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Jadwal Posyandu ({jadwal.length})</h3>
        {onAdd
          ? <Button onClick={()=>setShowForm(true)}>➕ Tambah Jadwal</Button>
          : <span style={{fontSize:12,color:'#9E9E9E'}}>👁️ Lihat saja</span>
        }
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
        {jadwal.map(j=>{
          const isPast = new Date(j.tanggal) < new Date();
          const color = TIPE_COLOR[j.tipe]||'#9E9E9E';
          return (
            <Card key={j.id} style={{opacity:isPast?0.65:1}}>
              <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{
                  width:52,height:52,borderRadius:12,background:`${color}14`,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0
                }}>
                  <div style={{fontSize:18,fontWeight:800,color,lineHeight:1}}>
                    {new Date(j.tanggal).getDate()}
                  </div>
                  <div style={{fontSize:9,color,fontWeight:600}}>
                    {new Date(j.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}
                  </div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{j.judul}</div>
                  <TipeBadge tipe={j.tipe}/>
                  <div style={{fontSize:11,color:'#9E9E9E',marginTop:6}}>
                    🕐 {j.waktu} &nbsp;•&nbsp; 📍 {j.lokasi}
                  </div>
                  <div style={{fontSize:11,color:'#9E9E9E'}}>🏘️ {j.desa}</div>
                  <div style={{fontSize:12,color:'#6B7280',marginTop:6,lineHeight:1.5}}>{j.deskripsi}</div>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                <span style={{
                  padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700,
                  background:isPast?'#F9FAFB':'#F0FDF4',color:isPast?'#9E9E9E':'#16A34A'
                }}>{isPast?'Selesai':'Mendatang'}</span>
                {onDelete && <Button size="sm" variant="danger" onClick={()=>onDelete(j.id)}>🗑️</Button>}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={showForm} onClose={()=>setShowForm(false)} title="Tambah Jadwal" width={480}>
        <InputField label="Judul Kegiatan" value={form.judul} onChange={v=>setForm(p=>({...p,judul:v}))} required/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <InputField label="Tanggal" value={form.tanggal} onChange={v=>setForm(p=>({...p,tanggal:v}))} type="date"/>
          <InputField label="Waktu" value={form.waktu} onChange={v=>setForm(p=>({...p,waktu:v}))} placeholder="08:00–12:00"/>
          <SelectField label="Tipe" value={form.tipe} onChange={v=>setForm(p=>({...p,tipe:v}))}
            options={['posyandu','imunisasi','penyuluhan','pmt']}/>
          <InputField label="Desa" value={form.desa} onChange={v=>setForm(p=>({...p,desa:v}))}/>
        </div>
        <InputField label="Lokasi" value={form.lokasi} onChange={v=>setForm(p=>({...p,lokasi:v}))}/>
        <InputField label="Deskripsi" value={form.deskripsi} onChange={v=>setForm(p=>({...p,deskripsi:v}))}/>
        <div style={{display:'flex',gap:10}}>
          <Button onClick={save}>💾 Simpan</Button>
          <Button variant="ghost" onClick={()=>setShowForm(false)}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}

// ── PENGGUNA PAGE — 2 TAB: Tenaga Medis & Orang Tua ──────────
export function PenggunaPage({ users, onToggleAktif, onDelete, onAdd }) {
  const [tab, setTab]           = useState('medis');
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const { toast, showSuccess, showError } = useToast();

  // Form tenaga medis
  const [formMedis, setFormMedis] = useState({
    nama:'', email:'', password:'123456',
    role:'bidan', jabatan:'', noTelepon:'', posyanduId:''
  });

  // Form orang tua
  const [formOrtu, setFormOrtu] = useState({
    nama:'', email:'', password:'123456',
    noTelepon:'', namaAnak:'', posyanduId:''
  });

  // Filter
  const tenagaMedis = (users||[]).filter(u =>
    ['admin','bidan','kader'].includes(u.role) &&
    (!search || u.nama?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );
  const orangTua = (users||[]).filter(u =>
    u.role === 'orang_tua' &&
    (!search || u.nama?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()) ||
     (u.namaAnak||'').toLowerCase().includes(search.toLowerCase()))
  );
  const activeList = tab === 'medis' ? tenagaMedis : orangTua;

  // ── Simpan tenaga medis ───────────────────────────────────────
  async function saveMedis() {
    if (!formMedis.nama || !formMedis.email) {
      showError('Nama dan email wajib diisi');
      return;
    }
    setSaving(true);
    const result = await onAdd({
      nama:       formMedis.nama,
      email:      formMedis.email,
      password:   formMedis.password || '123456',
      role:       formMedis.role,
      jabatan:    formMedis.jabatan || null,
      noTelepon:  formMedis.noTelepon || null,
      posyanduId: formMedis.posyanduId ? parseInt(formMedis.posyanduId) : null,
      namaAnak:   null,
      aktif:      true,
    });
    setSaving(false);
    if (result?.ok) {
      showSuccess('Tenaga medis berhasil ditambahkan! 🎉');
      setFormMedis({ nama:'', email:'', password:'123456', role:'bidan', jabatan:'', noTelepon:'', posyanduId:'' });
      setShowForm(false);
    } else {
      showError(result?.message || 'Gagal menyimpan, cek data kembali');
    }
  }

  // ── Simpan orang tua ──────────────────────────────────────────
  async function saveOrtu() {
    if (!formOrtu.nama || !formOrtu.email) {
      showError('Nama dan email wajib diisi');
      return;
    }
    setSaving(true);
    const result = await onAdd({
      nama:       formOrtu.nama,
      email:      formOrtu.email,
      password:   formOrtu.password || '123456',
      role:       'orang_tua',
      jabatan:    null,
      noTelepon:  formOrtu.noTelepon || null,
      posyanduId: formOrtu.posyanduId ? parseInt(formOrtu.posyanduId) : null,
      namaAnak:   formOrtu.namaAnak || null,
      aktif:      true,
    });
    setSaving(false);
    if (result?.ok) {
      showSuccess('Akun orang tua berhasil didaftarkan! 🎉');
      setFormOrtu({ nama:'', email:'', password:'123456', noTelepon:'', namaAnak:'', posyanduId:'' });
      setShowForm(false);
    } else {
      showError(result?.message || 'Gagal menyimpan, cek data kembali');
    }
  }

  // ── Toggle aktif dengan toast ─────────────────────────────────
  async function handleToggle(id, aktif) {
    const result = await onToggleAktif(id, aktif);
    if (result?.ok) {
      showSuccess(result.message || (aktif ? 'Akun diaktifkan' : 'Akun dinonaktifkan'));
    } else {
      showError(result?.message || 'Gagal mengubah status');
    }
  }

  // ── Hapus dengan konfirmasi + toast ──────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
    const result = await onDelete(id);
    if (result?.ok) {
      showSuccess('Pengguna berhasil dihapus');
    } else {
      showError(result?.message || 'Gagal menghapus pengguna');
    }
  }

  // Kolom tabel tenaga medis
  const colsMedis = [
    { key:'nama', label:'NAMA',
      render:(v,r)=>(
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:36,height:36,borderRadius:'50%',
            background:{admin:'#F0FDF4',bidan:'#EFF6FF',kader:'#FFF7ED'}[r.role]||'#F9FAFB',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:18
          }}>
            {r.role==='admin'?'👨‍⚕️':r.role==='bidan'?'👩‍⚕️':'🤝'}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>{v}</div>
            <div style={{fontSize:11,color:'#9E9E9E'}}>{r.email}</div>
          </div>
        </div>
      )},
    { key:'role',     label:'ROLE',     render:v=><RoleBadge role={v}/>},
    { key:'posyandu', label:'UNIT KERJA',render:v=><span style={{fontSize:12}}>{v||'-'}</span>},
    { key:'aktif',    label:'STATUS',
      render:(v,r)=>(
        <button onClick={()=>handleToggle(r.id, !r.aktif)} style={{
          padding:'5px 14px',borderRadius:20,border:'none',cursor:'pointer',
          background:v?'#F0FDF4':'#F9FAFB',color:v?'#16A34A':'#9E9E9E',
          fontWeight:700,fontSize:11,fontFamily:'inherit',transition:'all .2s'
        }}>{v?'● Aktif':'○ Nonaktif'}</button>
      )},
    { key:'aksi', label:'AKSI',
      render:(_,r)=>(
        <Button size="sm" variant="danger" onClick={e=>{e.stopPropagation();handleDelete(r.id)}}>
          🗑️ Hapus
        </Button>
      )},
  ];

  // Kolom tabel orang tua
  const colsOrtu = [
    { key:'nama', label:'NAMA ORANG TUA',
      render:(v,r)=>(
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:36,height:36,borderRadius:'50%',background:'#F5F3FF',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:18
          }}>👨‍👩‍👧</div>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>{v}</div>
            <div style={{fontSize:11,color:'#9E9E9E'}}>{r.email}</div>
            {r.noTelepon&&<div style={{fontSize:10,color:'#BDBDBD'}}>📞 {r.noTelepon}</div>}
          </div>
        </div>
      )},
    { key:'namaAnak', label:'NAMA ANAK',
      render:v=>(
        <div style={{
          display:'inline-flex',alignItems:'center',gap:6,
          padding:'4px 10px',borderRadius:20,
          background:v?'#F0FDF4':'#F9FAFB',
          fontSize:12,fontWeight:600,
          color:v?'#16A34A':'#9E9E9E'
        }}>
          {v ? <>👶 {v}</> : 'Belum terhubung'}
        </div>
      )},
    { key:'posyandu', label:'POSYANDU',
      render:(v,r)=>(
        <div>
          <div style={{fontSize:12,fontWeight:600}}>{v||'–'}</div>
          {r.desa&&<div style={{fontSize:10,color:'#9E9E9E'}}>Desa {r.desa}</div>}
        </div>
      )},
    { key:'aktif', label:'AKUN',
      render:(v,r)=>(
        <button onClick={()=>handleToggle(r.id, !r.aktif)} style={{
          padding:'5px 14px',borderRadius:20,border:'none',cursor:'pointer',
          background:v?'#F0FDF4':'#FEF2F2',color:v?'#16A34A':'#DC2626',
          fontWeight:700,fontSize:11,fontFamily:'inherit',transition:'all .2s'
        }}>{v?'● Aktif':'○ Nonaktif'}</button>
      )},
    { key:'aksi', label:'AKSI',
      render:(_,r)=>(
        <Button size="sm" variant="danger" onClick={e=>{e.stopPropagation();handleDelete(r.id)}}>
          🗑️ Hapus
        </Button>
      )},
  ];

  return (
    <div style={{padding:24}}>
      {/* ── TOAST ── */}
      <Toast toast={toast}/>

      {/* Summary cards */}
      <div style={{display:'flex',gap:14,marginBottom:20}}>
        {[
          ['👨‍⚕️','Tenaga Medis',tenagaMedis.length,'#1B6B3A','#F0FDF4'],
          ['👨‍👩‍👧','Orang Tua',orangTua.length,'#6D28D9','#F5F3FF'],
          ['✅','Akun Aktif',(users||[]).filter(u=>u.aktif).length,'#16A34A','#F0FDF4'],
          ['⭕','Nonaktif',(users||[]).filter(u=>!u.aktif).length,'#9E9E9E','#F9FAFB'],
        ].map(([i,l,v,c,bg])=>(
          <div key={l} style={{
            flex:1,padding:'16px',background:bg,borderRadius:14,
            border:`1px solid ${c}22`,display:'flex',alignItems:'center',gap:12
          }}>
            <span style={{fontSize:26}}>{i}</span>
            <div>
              <div style={{fontSize:24,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:11,color:'#9E9E9E'}}>{l}</div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        {/* Header + search + tab */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Manajemen Pengguna</h3>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <input
                placeholder="🔍 Cari nama, email, atau nama anak..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
                style={{
                  padding:'8px 14px',borderRadius:8,border:'1.5px solid #E5E7EB',
                  fontSize:12,fontFamily:'inherit',outline:'none',width:260,background:'#F9FAFB'
                }}
              />
              <Button onClick={()=>setShowForm(true)}>
                ➕ {tab==='medis'?'Tambah Tenaga Medis':'Daftarkan Orang Tua'}
              </Button>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{display:'flex',gap:0,borderBottom:'2px solid #F0F0F0'}}>
            {[
              {k:'medis', label:'👨‍⚕️ Tenaga Medis', count:tenagaMedis.length, color:'#1B6B3A'},
              {k:'ortu',  label:'👨‍👩‍👧 Orang Tua',    count:orangTua.length,   color:'#6D28D9'},
            ].map(t=>(
              <button key={t.k} onClick={()=>{setTab(t.k);setSearch('');}} style={{
                padding:'10px 24px',border:'none',background:'transparent',cursor:'pointer',
                fontFamily:'inherit',fontSize:13,fontWeight:tab===t.k?700:500,
                color:tab===t.k?t.color:'#9E9E9E',
                borderBottom:tab===t.k?`2.5px solid ${t.color}`:`2.5px solid transparent`,
                marginBottom:'-2px',display:'flex',alignItems:'center',gap:6
              }}>
                {t.label}
                <span style={{
                  padding:'1px 8px',borderRadius:20,fontSize:10,fontWeight:700,
                  background:tab===t.k?`${t.color}18`:'#F3F4F6',
                  color:tab===t.k?t.color:'#9E9E9E'
                }}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info box per tab */}
        {tab==='ortu' && (
          <div style={{
            padding:'10px 14px',background:'#F5F3FF',borderRadius:10,
            border:'1px solid #DDD6FE',marginBottom:14,fontSize:12,color:'#6D28D9'
          }}>
            💡 <strong>Catatan:</strong> Orang tua hanya bisa login di aplikasi <strong>Mobile</strong>.
            Halaman ini untuk mendaftarkan akun orang tua agar bisa mengakses data anak di mobile app.
          </div>
        )}

        {/* Tabel */}
        {activeList.length === 0
          ? <EmptyState
              emoji={tab==='medis'?'👨‍⚕️':'👨‍👩‍👧'}
              message={
                search
                  ? `Tidak ditemukan hasil untuk "${search}"`
                  : tab==='medis' ? 'Belum ada tenaga medis' : 'Belum ada orang tua terdaftar'
              }
            />
          : <Table
              columns={tab==='medis'?colsMedis:colsOrtu}
              data={activeList}
            />
        }
      </Card>

      {/* ── Modal tambah tenaga medis ── */}
      <Modal open={showForm && tab==='medis'} onClose={()=>setShowForm(false)}
        title="Tambah Tenaga Medis" width={440}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <InputField label="Nama Lengkap *" value={formMedis.nama}
            onChange={v=>setFormMedis(p=>({...p,nama:v}))}/>
          <InputField label="Email * (untuk login)" value={formMedis.email}
            onChange={v=>setFormMedis(p=>({...p,email:v}))} type="email"/>
          <SelectField label="Role *" value={formMedis.role}
            onChange={v=>setFormMedis(p=>({...p,role:v}))}
            options={[
              {value:'admin',  label:'Admin'},
              {value:'bidan',  label:'Bidan'},
              {value:'kader',  label:'Kader Posyandu'},
            ]}/>
          <InputField label="No. Telepon" value={formMedis.noTelepon}
            onChange={v=>setFormMedis(p=>({...p,noTelepon:v}))} placeholder="08xx"/>
          <InputField label="Jabatan" value={formMedis.jabatan}
            onChange={v=>setFormMedis(p=>({...p,jabatan:v}))} placeholder="Mis: Bidan Desa"/>
          <InputField label="ID Posyandu" value={formMedis.posyanduId}
            onChange={v=>setFormMedis(p=>({...p,posyanduId:v}))} type="number" placeholder="1, 2, 3..."/>
        </div>
        <div style={{
          padding:'10px 12px',background:'#FFFBEB',borderRadius:8,
          border:'1px solid #FDE68A',fontSize:12,color:'#92400E',marginBottom:14
        }}>
          🔑 Password default: <strong>123456</strong> — minta pengguna ubah setelah login pertama
        </div>
        <div style={{display:'flex',gap:10}}>
          <Button onClick={saveMedis} disabled={saving}>
            {saving
              ? <span style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{
                    width:14,height:14,border:'2px solid #fff',borderTopColor:'transparent',
                    borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'
                  }}/>
                  Menyimpan...
                </span>
              : '💾 Simpan'
            }
          </Button>
          <Button variant="ghost" onClick={()=>setShowForm(false)} disabled={saving}>Batal</Button>
        </div>
      </Modal>

      {/* ── Modal daftarkan orang tua ── */}
      <Modal open={showForm && tab==='ortu'} onClose={()=>setShowForm(false)}
        title="Daftarkan Akun Orang Tua" width={460}>
        <div style={{
          padding:'10px 12px',background:'#F5F3FF',borderRadius:8,
          border:'1px solid #DDD6FE',fontSize:12,color:'#6D28D9',marginBottom:16
        }}>
          📱 Akun ini untuk login di <strong>aplikasi mobile</strong> dan memantau perkembangan anak.
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <InputField label="Nama Orang Tua *" value={formOrtu.nama}
            onChange={v=>setFormOrtu(p=>({...p,nama:v}))}/>
          <InputField label="Email * (untuk login)" value={formOrtu.email}
            onChange={v=>setFormOrtu(p=>({...p,email:v}))} type="email"/>
          <InputField label="No. Telepon" value={formOrtu.noTelepon}
            onChange={v=>setFormOrtu(p=>({...p,noTelepon:v}))} type="tel" placeholder="08xx"/>
          <InputField label="Nama Anak di Posyandu" value={formOrtu.namaAnak}
            onChange={v=>setFormOrtu(p=>({...p,namaAnak:v}))} placeholder="Mis: Muhammad Rafif"/>
          <InputField label="ID Posyandu" value={formOrtu.posyanduId}
            onChange={v=>setFormOrtu(p=>({...p,posyanduId:v}))} type="number" placeholder="1, 2, 3..."/>
        </div>
        <div style={{
          padding:'10px 12px',background:'#FFFBEB',borderRadius:8,
          border:'1px solid #FDE68A',fontSize:12,color:'#92400E',marginBottom:14
        }}>
          🔑 Password default: <strong>123456</strong> — informasikan ke orang tua untuk login mobile
        </div>
        <div style={{display:'flex',gap:10}}>
          <Button onClick={saveOrtu} disabled={saving}>
            {saving
              ? <span style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{
                    width:14,height:14,border:'2px solid #fff',borderTopColor:'transparent',
                    borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'
                  }}/>
                  Menyimpan...
                </span>
              : '💾 Daftarkan'
            }
          </Button>
          <Button variant="ghost" onClick={()=>setShowForm(false)} disabled={saving}>Batal</Button>
        </div>
      </Modal>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── POSYANDU PAGE ──────────────────────────────────────────────
export function PosyanduPage() {
  const [data] = useState(initPosyandu);
  return (
    <div style={{padding:24}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
        {data.map(p=>(
          <Card key={p.id}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <div style={{
                width:44,height:44,background:'#F0FDF4',borderRadius:12,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22
              }}>🏥</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {p.nama}
                </div>
                <div style={{fontSize:11,color:'#9E9E9E'}}>Desa {p.desa}</div>
              </div>
              <span style={{
                padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700,
                background:p.aktif?'#F0FDF4':'#F9FAFB',color:p.aktif?'#16A34A':'#9E9E9E'
              }}>{p.aktif?'Aktif':'Nonaktif'}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                ['Total Balita', p.totalBalita, '#1565C0'],
                ['Stunting', p.stunting, p.stunting>0?'#DC2626':'#9E9E9E'],
              ].map(([l,v,c])=>(
                <div key={l} style={{background:'#F9FAFB',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:'#9E9E9E'}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,fontSize:12,color:'#6B7280'}}>
              👤 Kader: <strong>{p.kader}</strong>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── ANALISIS STUNTING PAGE ─────────────────────────────────────
export function StuntingPage({ balitaList, statistik }) {
  const perluPerhatian = balitaList.filter(b=>{
    if(!b.riwayat.length) return false;
    const last=b.riwayat[b.riwayat.length-1];
    const umur=hitungUmurBulan(b.tanggalLahir);
    return getStatusStunting(last.tb,umur,b.jenisKelamin)!=='Normal';
  });

  const pieData=[
    {name:'Normal',value:statistik.normal,color:'#16A34A'},
    {name:'Risiko',value:statistik.risiko,color:'#D97706'},
    {name:'Stunting',value:statistik.stunting,color:'#DC2626'},
  ];

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',gap:14,marginBottom:20,flexWrap:'wrap'}}>
        {pieData.map(d=>(
          <div key={d.name} style={{
            flex:1,minWidth:140,padding:'18px',background:`${d.color}0A`,
            borderRadius:14,border:`1px solid ${d.color}22`,textAlign:'center'
          }}>
            <div style={{fontSize:32,fontWeight:800,color:d.color}}>{d.value}</div>
            <div style={{fontSize:12,color:d.color,fontWeight:700}}>{d.name}</div>
            <div style={{fontSize:11,color:'#9E9E9E',marginTop:2}}>
              {Math.round(d.value/statistik.total*100)||0}% dari total
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
        <Card>
          <SectionHeader title="Distribusi"/>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={3}>
                {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionHeader title={`Balita Perlu Perhatian (${perluPerhatian.length})`}/>
          {perluPerhatian.length===0
            ? <EmptyState emoji="✅" message="Tidak ada balita stunting"/>
            : <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:280,overflowY:'auto'}}>
                {perluPerhatian.map(b=>{
                  const last=b.riwayat[b.riwayat.length-1];
                  const umur=hitungUmurBulan(b.tanggalLahir);
                  const ss=getStatusStunting(last.tb,umur,b.jenisKelamin);
                  return (
                    <div key={b.id} style={{
                      display:'flex',alignItems:'center',gap:12,padding:'10px 12px',
                      borderRadius:10,background:'#F9FAFB',border:`1px solid ${ss==='Stunting'?'#FECACA':'#FDE68A'}`
                    }}>
                      <span style={{fontSize:22}}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13}}>{b.nama}</div>
                        <div style={{fontSize:11,color:'#9E9E9E'}}>
                          {formatUmur(b.tanggalLahir)} • BB:{last.bb}kg • TB:{last.tb}cm
                        </div>
                      </div>
                      <StatusBadge status={ss}/>
                    </div>
                  );
                })}
              </div>
          }
        </Card>
      </div>
    </div>
  );
}

// ── PEMANTAUAN PAGE ────────────────────────────────────────────
export function PemantauanPage({ balitaList }) {
  const [selected, setSelected] = useState(null);
  const [metric, setMetric]     = useState('bb');

  const withData = balitaList.filter(b=>b.riwayat.length>=2);
  const b = selected ? balitaList.find(x=>x.id===selected) : withData[0];

  const grafikData = b?.riwayat.map(p=>({
    tgl: formatTanggal(p.tanggal), bb:p.bb, tb:p.tb, lk:p.lk
  }));

  const METRICS=[
    {k:'bb',l:'Berat Badan (kg)',c:'#1B6B3A'},
    {k:'tb',l:'Tinggi Badan (cm)',c:'#2563EB'},
    {k:'lk',l:'Lingkar Kepala (cm)',c:'#D97706'},
  ];

  return (
    <div style={{padding:24}}>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
        <Card padding={12}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10,padding:'0 4px'}}>
            Pilih Balita
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:500,overflowY:'auto'}}>
            {withData.map(bl=>(
              <button key={bl.id} onClick={()=>setSelected(bl.id)} style={{
                display:'flex',alignItems:'center',gap:10,padding:'10px',borderRadius:10,
                border:`1.5px solid ${(selected||withData[0]?.id)===bl.id?'#1B6B3A':'transparent'}`,
                background:(selected||withData[0]?.id)===bl.id?'#F0FDF4':'#F9FAFB',
                cursor:'pointer',textAlign:'left',fontFamily:'inherit'
              }}>
                <span style={{fontSize:20}}>{bl.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {bl.nama}
                  </div>
                  <div style={{fontSize:10,color:'#9E9E9E'}}>{formatUmur(bl.tanggalLahir)}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          {b ? (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>{b.nama}</div>
                  <div style={{fontSize:12,color:'#9E9E9E'}}>
                    {formatUmur(b.tanggalLahir)} • {b.riwayat.length}x pengukuran
                  </div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  {METRICS.map(m=>(
                    <button key={m.k} onClick={()=>setMetric(m.k)} style={{
                      padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',
                      background:metric===m.k?m.c:'#F3F4F6',
                      color:metric===m.k?'#fff':'#6B7280',
                      fontSize:11,fontWeight:700,fontFamily:'inherit'
                    }}>{m.l}</button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={grafikData} margin={{left:-15,right:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
                  <XAxis dataKey="tgl" tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
                  <Tooltip/>
                  <Line type="monotone" dataKey={metric}
                    stroke={METRICS.find(m=>m.k===metric)?.c||'#1B6B3A'}
                    strokeWidth={2.5} dot={{r:5,fill:METRICS.find(m=>m.k===metric)?.c}}/>
                </LineChart>
              </ResponsiveContainer>

              <div style={{display:'flex',gap:10,marginTop:16}}>
                {[
                  ['BB',`${b.riwayat[b.riwayat.length-1].bb} kg`,'#1B6B3A'],
                  ['TB',`${b.riwayat[b.riwayat.length-1].tb} cm`,'#2563EB'],
                  ['LK',`${b.riwayat[b.riwayat.length-1].lk} cm`,'#D97706'],
                ].map(([l,v,c])=>(
                  <div key={l} style={{
                    flex:1,padding:'12px',background:`${c}0A`,borderRadius:10,
                    border:`1px solid ${c}22`,textAlign:'center'
                  }}>
                    <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
                    <div style={{fontSize:11,color:'#9E9E9E'}}>{l} Terakhir</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState emoji="📊" message="Pilih balita dengan minimal 2 pengukuran"/>
          )}
        </Card>
      </div>
    </div>
  );
}
