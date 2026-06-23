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
      {/* Periode + export */}
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

      {/* Summary */}
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
        {/* Stunting */}
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

        {/* Gizi */}
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

        {/* Gender */}
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

      {/* Tren 6 bulan */}
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

  const TIPE_COLOR = {posyandu:'#16A34A',imunisasi:'#2563EB',penyuluhan:'#EA580C',pmt:'#9333EA'};

  function save() {
    if (!form.judul||!form.tanggal) return;
    onAdd(form);
    setForm({judul:'',tanggal:'',waktu:'',lokasi:'',tipe:'posyandu',desa:'',deskripsi:''});
    setShowForm(false);
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Jadwal Posyandu ({jadwal.length})</h3>
        <Button onClick={()=>setShowForm(true)}>➕ Tambah Jadwal</Button>
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
                <Button size="sm" variant="danger" onClick={()=>onDelete(j.id)}>🗑️</Button>
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

// ── PENGGUNA PAGE ──────────────────────────────────────────────
export function PenggunaPage({ users, onToggleAktif, onDelete, onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({nama:'',email:'',role:'kader',posyandu:''});

  function save() {
    if (!form.nama||!form.email) return;
    onAdd(form);
    setForm({nama:'',email:'',role:'kader',posyandu:''});
    setShowForm(false);
  }

  const columns = [
    { key:'nama', label:'NAMA',
      render:(v,r)=>(
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:34,height:34,borderRadius:'50%',background:'#F0FDF4',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:16
          }}>👤</div>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>{v}</div>
            <div style={{fontSize:11,color:'#9E9E9E'}}>{r.email}</div>
          </div>
        </div>
      )},
    { key:'role', label:'ROLE', render:v=><RoleBadge role={v}/>},
    { key:'posyandu', label:'POSYANDU',
      render:v=><span style={{fontSize:12}}>{v}</span>},
    { key:'aktif', label:'STATUS',
      render:(v,r)=>(
        <button onClick={()=>onToggleAktif(r.id)} style={{
          padding:'4px 12px',borderRadius:20,border:'none',cursor:'pointer',
          background:v?'#F0FDF4':'#F9FAFB',color:v?'#16A34A':'#9E9E9E',
          fontWeight:700,fontSize:11,fontFamily:'inherit'
        }}>{v?'● Aktif':'○ Nonaktif'}</button>
      )},
    { key:'aksi', label:'AKSI',
      render:(_,r)=>(
        <Button size="sm" variant="danger" onClick={e=>{e.stopPropagation();onDelete(r.id)}}>
          🗑️ Hapus
        </Button>
      )},
  ];

  return (
    <div style={{padding:24}}>
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div>
            <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Manajemen Pengguna</h3>
            <div style={{fontSize:12,color:'#9E9E9E',marginTop:2}}>{users.length} akun terdaftar</div>
          </div>
          <Button onClick={()=>setShowForm(true)}>➕ Tambah Pengguna</Button>
        </div>
        {users.length===0
          ? <EmptyState emoji="👥" message="Belum ada pengguna"/>
          : <Table columns={columns} data={users}/>
        }
      </Card>

      <Modal open={showForm} onClose={()=>setShowForm(false)} title="Tambah Pengguna" width={400}>
        <InputField label="Nama Lengkap" value={form.nama} onChange={v=>setForm(p=>({...p,nama:v}))} required/>
        <InputField label="Email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} type="email" required/>
        <SelectField label="Role" value={form.role} onChange={v=>setForm(p=>({...p,role:v}))}
          options={[
            {value:'admin',label:'Admin'},
            {value:'bidan',label:'Bidan'},
            {value:'kader',label:'Kader'},
            {value:'orang_tua',label:'Orang Tua'},
          ]}/>
        <InputField label="Posyandu / Unit" value={form.posyandu} onChange={v=>setForm(p=>({...p,posyandu:v}))}/>
        <div style={{display:'flex',gap:10}}>
          <Button onClick={save}>💾 Simpan</Button>
          <Button variant="ghost" onClick={()=>setShowForm(false)}>Batal</Button>
        </div>
      </Modal>
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
        {/* Daftar balita */}
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

        {/* Grafik */}
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
