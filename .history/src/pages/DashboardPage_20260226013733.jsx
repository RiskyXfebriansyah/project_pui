// ============================================================
//  DashboardPage — VIEW DASHBOARD ADMIN
//  Padanan: V_dashboard.dart di Flutter
//  Fitur EKSKLUSIF web yang tidak ada di mobile:
//  → Tren stunting 6 bulan (grafik area)
//  → Perbandingan antar posyandu
//  → Jadwal mendatang di semua desa
// ============================================================

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import { StatCard, Card, SectionHeader, StatusBadge, TipeBadge } from '../components/ui/Components';
import { trenStunting, posyanduList } from '../data/dummyData';
import { formatTanggal } from '../utils/helpers';

const JADWAL_COLOR = {
  posyandu:'#16A34A', imunisasi:'#2563EB', penyuluhan:'#EA580C', pmt:'#9333EA'
};

// Komponen khusus untuk tooltip grafik
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

export default function DashboardPage({ statistik, upcomingJadwal, balitaList, onNav }) {
  // Data pie chart distribusi gizi
  const pieData = [
    { name:'Normal',  value: statistik.normal,  color:'#16A34A' },
    { name:'Risiko',  value: statistik.risiko,   color:'#D97706' },
    { name:'Stunting',value: statistik.stunting, color:'#DC2626' },
  ];

  return (
    <div style={{ padding:24 }}>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <StatCard label="Total Balita"  value={statistik.total}
          icon="👶" color="#1565C0" bg="#EFF6FF"
          sub={`${posyanduList.length} posyandu aktif`}/>
        <StatCard label="Stunting"     value={statistik.stunting}
          icon="⚠️" color="#DC2626" bg="#FEF2F2"
          sub={`${Math.round(statistik.stunting/statistik.total*100)||0}% dari total`}/>
        <StatCard label="Risiko"        value={statistik.risiko}
          icon="📊" color="#D97706" bg="#FFFBEB"
          sub="Perlu pemantauan rutin"/>
        <StatCard label="Gizi Kurang"  value={statistik.giziKurang}
          icon="⚖️" color="#7C3AED" bg="#F5F3FF"
          sub="Butuh intervensi gizi"/>
      </div>

      {/* ── Grafik tren + pie ──────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>

        {/* Tren 6 bulan — FITUR EKSKLUSIF WEB */}
        <Card>
          <SectionHeader title="Tren Stunting 6 Bulan Terakhir"
            action="Lihat Detail" onAction={()=>onNav('laporan')}/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trenStunting} margin={{top:5,right:10,bottom:5,left:-20}}>
              <defs>
                <linearGradient id="gNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gRisiko" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gStunting" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
              <XAxis dataKey="bulan" tick={{fontSize:11, fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11, fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend iconSize={8} iconType="circle"
                formatter={(v)=><span style={{fontSize:11,color:'#6B7280'}}>{v}</span>}/>
              <Area type="monotone" dataKey="normal"  name="Normal"
                stroke="#16A34A" fill="url(#gNormal)"  strokeWidth={2}/>
              <Area type="monotone" dataKey="risiko"  name="Risiko"
                stroke="#D97706" fill="url(#gRisiko)"  strokeWidth={2}/>
              <Area type="monotone" dataKey="stunting" name="Stunting"
                stroke="#DC2626" fill="url(#gStunting)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribusi pie */}
        <Card>
          <SectionHeader title="Distribusi Status"/>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={(v,n)=>[v,n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
            {pieData.map(d=>(
              <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
                <span style={{ flex:1, color:'#6B7280' }}>{d.name}</span>
                <strong style={{ color:d.color }}>{d.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Perbandingan posyandu — EKSKLUSIF WEB ──────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <Card>
          <SectionHeader title="Perbandingan Antar Posyandu"
            action="Detail" onAction={()=>onNav('posyandu')}/>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={posyanduList} margin={{left:-20,right:10,top:5,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
              <XAxis dataKey="nama" tick={{fontSize:9,fill:'#9E9E9E'}}
                axisLine={false} tickLine={false}
                tickFormatter={v=>v.replace('Posyandu ','')}/>
              <YAxis tick={{fontSize:10,fill:'#9E9E9E'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="totalBalita" name="Total Balita" fill="#BBF7D0" radius={[4,4,0,0]}/>
              <Bar dataKey="stunting"    name="Stunting"     fill="#FCA5A5" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tabel posyandu ringkas */}
        <Card>
          <SectionHeader title="Status Posyandu" action="Kelola" onAction={()=>onNav('posyandu')}/>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {posyanduList.map(p=>(
              <div key={p.id} style={{
                display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
                borderRadius:10, background:'#F9FAFB'
              }}>
                <div style={{
                  width:8, height:8, borderRadius:'50%', flexShrink:0,
                  background: p.aktif ? '#16A34A' : '#9E9E9E'
                }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.nama}
                  </div>
                  <div style={{ fontSize:10, color:'#9E9E9E' }}>{p.kader}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1565C0' }}>{p.totalBalita}</div>
                  {p.stunting > 0 && (
                    <div style={{ fontSize:10, color:'#DC2626' }}>{p.stunting} stunting</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Jadwal mendatang ─────────────────────────────────── */}
      <Card>
        <SectionHeader title="Jadwal Mendatang (Semua Desa)"
          action="Lihat Semua" onAction={()=>onNav('jadwal')}/>
        {upcomingJadwal.length === 0
          ? <div style={{textAlign:'center',padding:'24px',color:'#BDBDBD',fontSize:13}}>
              📅 Tidak ada jadwal mendatang
            </div>
          : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
              {upcomingJadwal.map(j=>(
                <div key={j.id} style={{
                  padding:'14px', borderRadius:12, border:'1px solid #F0F0F0',
                  background:'#FAFAFA', display:'flex', gap:12, alignItems:'flex-start'
                }}>
                  <div style={{
                    width:44, height:44, borderRadius:12,
                    background: `${JADWAL_COLOR[j.tipe] || '#9E9E9E'}18`,
                    display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', flexShrink:0
                  }}>
                    <div style={{fontSize:16,fontWeight:800,color:JADWAL_COLOR[j.tipe]||'#9E9E9E',lineHeight:1}}>
                      {new Date(j.tanggal).getDate()}
                    </div>
                    <div style={{fontSize:8,color:JADWAL_COLOR[j.tipe]||'#9E9E9E',fontWeight:600}}>
                      {new Date(j.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, marginBottom:3,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {j.judul}
                    </div>
                    <TipeBadge tipe={j.tipe}/>
                    <div style={{ fontSize:11, color:'#9E9E9E', marginTop:4 }}>
                      📍 {j.lokasi}
                    </div>
                    <div style={{ fontSize:11, color:'#9E9E9E' }}>🕐 {j.waktu}</div>
                  </div>
                </div>
              ))}
            </div>
        }
      </Card>
    </div>
  );
}
