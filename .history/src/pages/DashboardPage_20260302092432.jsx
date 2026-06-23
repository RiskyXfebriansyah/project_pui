/* eslint-disable no-unused-vars */
// ============================================================
//  DashboardPage — BERBEDA PER ROLE
//
//  ADMIN   → Semua posyandu, tren 6 bulan, perbandingan antar posyandu
//  BIDAN   → Posyandu wilayahnya, balita prioritas, jadwal mendatang
//  KADER   → Ringkasan simple, balita posyandu sendiri, tips kerja
// ============================================================

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { StatCard, Card, SectionHeader, StatusBadge, TipeBadge } from '../components/ui/Components';
import { trenStunting, posyanduList } from '../data/dummyData';
import { formatUmur, hitungUmurBulan, getStatusStunting } from '../utils/helpers';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#fff', border:'1px solid #F0F0F0', borderRadius:12,
      padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', fontSize:12
    }}>
      <div style={{ fontWeight:700, marginBottom:6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — Paling lengkap, semua data semua posyandu
// ══════════════════════════════════════════════════════════════
function AdminDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  const pieData = [
    { name:'Normal',   value:statistik.normal,   color:'#16A34A' },
    { name:'Risiko',   value:statistik.risiko,    color:'#D97706' },
    { name:'Stunting', value:statistik.stunting,  color:'#DC2626' },
  ];

  return (
    <div style={{ padding:24 }}>
      {/* Banner role */}
      <div style={{
        background:'linear-gradient(135deg,#0D3D1E,#1B6B3A)', borderRadius:16,
        padding:'20px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:16
      }}>
        <span style={{fontSize:36}}>👨‍⚕️</span>
        <div>
          <div style={{color:'#fff',fontWeight:800,fontSize:18}}>Dashboard Eksekutif</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginTop:2}}>
            Monitoring seluruh posyandu di wilayah kerja Puskesmas
          </div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          {[['📊','Laporan','laporan'],['👥','Pengguna','pengguna']].map(([i,l,p])=>(
            <button key={p} onClick={()=>onNav(p)} style={{
              background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',
              borderRadius:10,padding:'8px 14px',color:'#fff',cursor:'pointer',
              fontSize:12,fontWeight:600,fontFamily:'inherit',display:'flex',alignItems:'center',gap:6
            }}>{i} {l}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <StatCard label="Total Balita"  value={statistik.total}
          icon="👶" color="#1565C0" bg="#EFF6FF"
          sub={`${posyanduList.length} posyandu aktif`}/>
        <StatCard label="Stunting"      value={statistik.stunting}
          icon="⚠️" color="#DC2626" bg="#FEF2F2"
          sub={`${Math.round(statistik.stunting/statistik.total*100)||0}% dari total`}/>
        <StatCard label="Risiko"        value={statistik.risiko}
          icon="📊" color="#D97706" bg="#FFFBEB"
          sub="Perlu pemantauan rutin"/>
        <StatCard label="Gizi Kurang"   value={statistik.giziKurang}
          icon="⚖️" color="#7C3AED" bg="#F5F3FF"
          sub="Butuh intervensi gizi"/>
      </div>

      {/* Grafik tren + pie */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>
        <Card>
          <SectionHeader title="Tren Stunting 6 Bulan" action="Detail" onAction={()=>onNav('laporan')}/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trenStunting} margin={{top:5,right:10,bottom:5,left:-20}}>
              <defs>
                {[['gN','#16A34A'],['gR','#D97706'],['gS','#DC2626']].map(([id,c])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
              <XAxis dataKey="bulan" tick={{fontSize:11,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend iconSize={8} iconType="circle"
                formatter={v=><span style={{fontSize:11,color:'#6B7280'}}>{v}</span>}/>
              <Area type="monotone" dataKey="normal"   name="Normal"   stroke="#16A34A" fill="url(#gN)" strokeWidth={2}/>
              <Area type="monotone" dataKey="risiko"   name="Risiko"   stroke="#D97706" fill="url(#gR)" strokeWidth={2}/>
              <Area type="monotone" dataKey="stunting" name="Stunting" stroke="#DC2626" fill="url(#gS)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title="Distribusi Status"/>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {pieData.map(d=>(
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:d.color}}/>
                <span style={{flex:1,color:'#6B7280'}}>{d.name}</span>
                <strong style={{color:d.color}}>{d.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Perbandingan posyandu */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <Card>
          <SectionHeader title="Perbandingan Antar Posyandu" action="Detail" onAction={()=>onNav('posyandu')}/>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={posyanduList} margin={{left:-20,right:10,top:5,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
              <XAxis dataKey="nama" tick={{fontSize:9,fill:'#9E9E9E'}} axisLine={false} tickLine={false}
                tickFormatter={v=>v.replace('Posyandu ','')}/>
              <YAxis tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="totalBalita" name="Total" fill="#BBF7D0" radius={[4,4,0,0]}/>
              <Bar dataKey="stunting"    name="Stunting" fill="#FCA5A5" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title="Status Posyandu" action="Kelola" onAction={()=>onNav('posyandu')}/>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {posyanduList.map(p=>(
              <div key={p.id} style={{
                display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
                borderRadius:10,background:'#F9FAFB'
              }}>
                <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                  background:p.aktif?'#16A34A':'#9E9E9E'}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:'hidden',
                    textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nama}</div>
                  <div style={{fontSize:10,color:'#9E9E9E'}}>{p.kader}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#1565C0'}}>{p.totalBalita}</div>
                  {p.stunting>0&&<div style={{fontSize:10,color:'#DC2626'}}>{p.stunting} stunting</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Jadwal */}
      <JadwalSection upcomingJadwal={upcomingJadwal} onNav={onNav}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  BIDAN DASHBOARD — Fokus ke operasional, balita prioritas
// ══════════════════════════════════════════════════════════════
function BidanDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  // Balita yang perlu perhatian (stunting/risiko)
  const prioritas = balitaList.filter(b => {
    if (!b.riwayat.length) return false;
    const last = b.riwayat[b.riwayat.length-1];
    const umur = hitungUmurBulan(b.tanggalLahir);
    return getStatusStunting(last.tb, umur, b.jenisKelamin) !== 'Normal';
  }).slice(0, 5);

  return (
    <div style={{ padding:24 }}>
      {/* Banner */}
      <div style={{
        background:'linear-gradient(135deg,#0C2D5C,#1D4ED8)', borderRadius:16,
        padding:'20px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:16
      }}>
        <span style={{fontSize:36}}>👩‍⚕️</span>
        <div>
          <div style={{color:'#fff',fontWeight:800,fontSize:18}}>Panel Bidan</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginTop:2}}>
            Pantau kondisi balita dan jadwal posyandu wilayah kerjamu
          </div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={()=>onNav('balita')} style={{
            background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',
            borderRadius:10,padding:'8px 14px',color:'#fff',cursor:'pointer',
            fontSize:12,fontWeight:600,fontFamily:'inherit'
          }}>👶 Data Balita</button>
          <button onClick={()=>onNav('jadwal')} style={{
            background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',
            borderRadius:10,padding:'8px 14px',color:'#fff',cursor:'pointer',
            fontSize:12,fontWeight:600,fontFamily:'inherit'
          }}>📅 Jadwal</button>
        </div>
      </div>

      {/* Stats — lebih sedikit dari admin */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <StatCard label="Total Balita"   value={statistik.total}   icon="👶" color="#1565C0" bg="#EFF6FF"/>
        <StatCard label="Perlu Perhatian" value={statistik.stunting + statistik.risiko}
          icon="⚠️" color="#DC2626" bg="#FEF2F2" sub="Stunting + Risiko"/>
        <StatCard label="Jadwal Bulan Ini" value={upcomingJadwal.length}
          icon="📅" color="#D97706" bg="#FFFBEB" sub="Kegiatan mendatang"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        {/* Balita prioritas */}
        <Card>
          <SectionHeader title="⚠️ Balita Perlu Perhatian"
            action="Lihat Semua" onAction={()=>onNav('stunting')}/>
          {prioritas.length === 0
            ? <div style={{textAlign:'center',padding:'24px',color:'#9E9E9E',fontSize:13}}>
                ✅ Tidak ada balita stunting
              </div>
            : <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {prioritas.map(b => {
                  const last = b.riwayat[b.riwayat.length-1];
                  const umur = hitungUmurBulan(b.tanggalLahir);
                  const ss   = getStatusStunting(last.tb, umur, b.jenisKelamin);
                  return (
                    <div key={b.id} style={{
                      display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
                      borderRadius:10,background:'#FEF2F2',border:'1px solid #FECACA'
                    }}>
                      <span style={{fontSize:20}}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:12}}>{b.nama}</div>
                        <div style={{fontSize:10,color:'#9E9E9E'}}>
                          {formatUmur(b.tanggalLahir)} • BB:{last.bb}kg TB:{last.tb}cm
                        </div>
                      </div>
                      <StatusBadge status={ss}/>
                    </div>
                  );
                })}
              </div>
          }
        </Card>

        {/* Tren mini */}
        <Card>
          <SectionHeader title="Tren 6 Bulan" action="Laporan" onAction={()=>onNav('laporan')}/>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trenStunting} margin={{top:5,right:10,bottom:5,left:-25}}>
              <defs>
                <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
              <XAxis dataKey="bulan" tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="stunting" name="Stunting" stroke="#DC2626" fill="url(#bG)" strokeWidth={2}/>
              <Area type="monotone" dataKey="risiko"   name="Risiko"   stroke="#D97706" fill="none" strokeWidth={1.5} strokeDasharray="4 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <JadwalSection upcomingJadwal={upcomingJadwal} onNav={onNav}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  KADER DASHBOARD — Paling simpel, fokus ke tugas harian
// ══════════════════════════════════════════════════════════════
function KaderDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  const jadwalBerikut = upcomingJadwal[0];

  return (
    <div style={{ padding:24 }}>
      {/* Banner */}
      <div style={{
        background:'linear-gradient(135deg,#7C2D12,#C2410C)', borderRadius:16,
        padding:'20px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:16
      }}>
        <span style={{fontSize:36}}>🤝</span>
        <div>
          <div style={{color:'#fff',fontWeight:800,fontSize:18}}>Panel Kader</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginTop:2}}>
            Selamat bekerja! Catat pemantauan balita dengan teliti
          </div>
        </div>
      </div>

      {/* Jadwal berikut — info paling penting untuk kader */}
      {jadwalBerikut && (
        <div style={{
          background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:14,
          padding:'16px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:14
        }}>
          <div style={{
            width:50,height:50,background:'#FEF3C7',borderRadius:12,
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'
          }}>
            <div style={{fontSize:18,fontWeight:800,color:'#D97706',lineHeight:1}}>
              {new Date(jadwalBerikut.tanggal).getDate()}
            </div>
            <div style={{fontSize:8,color:'#D97706',fontWeight:700}}>
              {new Date(jadwalBerikut.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:'#92400E',fontWeight:600,marginBottom:2}}>
              📅 Kegiatan Berikutnya
            </div>
            <div style={{fontWeight:800,fontSize:14,color:'#78350F'}}>{jadwalBerikut.judul}</div>
            <div style={{fontSize:12,color:'#92400E'}}>
              🕐 {jadwalBerikut.waktu} • 📍 {jadwalBerikut.lokasi}
            </div>
          </div>
          <button onClick={()=>onNav('jadwal')} style={{
            background:'#D97706',border:'none',borderRadius:10,padding:'8px 16px',
            color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit'
          }}>Lihat Jadwal</button>
        </div>
      )}

      {/* Stats simple */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <StatCard label="Balita di Posyanduku" value={statistik.total}
          icon="👶" color="#C2410C" bg="#FFF7ED"/>
        <StatCard label="Perlu Perhatian" value={statistik.stunting + statistik.risiko}
          icon="⚠️" color="#DC2626" bg="#FEF2F2" sub="Butuh kunjungan rutin"/>
        <StatCard label="Sudah Diukur" value={balitaList.filter(b=>b.riwayat.length>0).length}
          icon="✅" color="#16A34A" bg="#F0FDF4" sub="Bulan ini"/>
      </div>

      {/* Panduan tugas kader */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <SectionHeader title="📋 Tugas Kader Hari Ini"/>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              {done:true,  task:'Cek jadwal posyandu bulan ini'},
              {done:false, task:'Catat pemantauan balita yang datang', action:()=>onNav('balita')},
              {done:false, task:'Update data balita baru jika ada',    action:()=>onNav('balita')},
              {done:false, task:'Laporkan balita stunting ke bidan',   action:()=>onNav('pemantauan')},
            ].map((t,i)=>(
              <div key={i} style={{
                display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
                borderRadius:10,background:t.done?'#F0FDF4':'#F9FAFB',
                border:`1px solid ${t.done?'#BBF7D0':'#F0F0F0'}`,
                cursor:t.action?'pointer':'default'
              }} onClick={t.action}>
                <span style={{fontSize:18}}>{t.done?'✅':'⬜'}</span>
                <span style={{
                  fontSize:12,fontWeight:500,flex:1,
                  color:t.done?'#16A34A':'#374151',
                  textDecoration:t.done?'line-through':'none'
                }}>{t.task}</span>
                {t.action&&<span style={{fontSize:12,color:'#9E9E9E'}}>→</span>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="🔢 Ringkasan Posyandu" action="Data Balita" onAction={()=>onNav('balita')}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              ['Total',    statistik.total,    '#1565C0','#EFF6FF'],
              ['Normal',   statistik.normal,   '#16A34A','#F0FDF4'],
              ['Risiko',   statistik.risiko,   '#D97706','#FFFBEB'],
              ['Stunting', statistik.stunting, '#DC2626','#FEF2F2'],
            ].map(([l,v,c,bg])=>(
              <div key={l} style={{
                padding:'14px',background:bg,borderRadius:10,
                border:`1px solid ${c}22`,textAlign:'center'
              }}>
                <div style={{fontSize:24,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:11,color:'#9E9E9E'}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12,padding:'10px 12px',background:'#F9FAFB',borderRadius:10}}>
            <div style={{fontSize:11,color:'#6B7280',textAlign:'center'}}>
              💡 Kader hanya bisa melihat data posyandunya sendiri
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Komponen jadwal (dipakai bersama oleh admin & bidan) ───────
function JadwalSection({ upcomingJadwal, onNav }) {
  const JADWAL_COLOR = {posyandu:'#16A34A',imunisasi:'#2563EB',penyuluhan:'#EA580C',pmt:'#9333EA'};
  return (
    <Card>
      <SectionHeader title="Jadwal Mendatang"
        action="Lihat Semua" onAction={()=>onNav('jadwal')}/>
      {upcomingJadwal.length === 0
        ? <div style={{textAlign:'center',padding:'20px',color:'#BDBDBD',fontSize:13}}>
            📅 Tidak ada jadwal mendatang
          </div>
        : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:12}}>
            {upcomingJadwal.map(j=>(
              <div key={j.id} style={{
                padding:'14px',borderRadius:12,border:'1px solid #F0F0F0',
                background:'#FAFAFA',display:'flex',gap:12,alignItems:'flex-start'
              }}>
                <div style={{
                  width:44,height:44,borderRadius:12,flexShrink:0,
                  background:`${JADWAL_COLOR[j.tipe]||'#9E9E9E'}18`,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'
                }}>
                  <div style={{fontSize:16,fontWeight:800,color:JADWAL_COLOR[j.tipe]||'#9E9E9E',lineHeight:1}}>
                    {new Date(j.tanggal).getDate()}
                  </div>
                  <div style={{fontSize:8,color:JADWAL_COLOR[j.tipe]||'#9E9E9E',fontWeight:700}}>
                    {new Date(j.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}
                  </div>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:3,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.judul}</div>
                  <TipeBadge tipe={j.tipe}/>
                  <div style={{fontSize:11,color:'#9E9E9E',marginTop:4}}>📍 {j.lokasi}</div>
                  <div style={{fontSize:11,color:'#9E9E9E'}}>🕐 {j.waktu}</div>
                </div>
              </div>
            ))}
          </div>
      }
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
//  EXPORT UTAMA — pilih dashboard sesuai role
// ══════════════════════════════════════════════════════════════
export default function DashboardPage({ statistik, upcomingJadwal, balitaList, onNav, role }) {
  if (role === 'admin') return (
    <AdminDashboard statistik={statistik} upcomingJadwal={upcomingJadwal}
      balitaList={balitaList} onNav={onNav}/>
  );
  if (role === 'bidan') return (
    <BidanDashboard statistik={statistik} upcomingJadwal={upcomingJadwal}
      balitaList={balitaList} onNav={onNav}/>
  );
  // kader (default)
  return (
    <KaderDashboard statistik={statistik} upcomingJadwal={upcomingJadwal}
      balitaList={balitaList} onNav={onNav}/>
  );
}
