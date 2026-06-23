// ── PosyanduPage ───────────────────────────────────────────────
import React, { useState } from 'react';
import { Card, EmptyState, StatusBadge } from '../components/ui/Components';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SectionHeader } from '../components/ui/Components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { posyanduList as initPosyandu } from '../data/dummyData';

export function PosyanduPage() {
  const [data] = useState(initPosyandu);
  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {data.map(p => (
          <Card key={p.id}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:44, height:44, background:'#F0FDF4', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏥</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{p.nama}</div>
                <div style={{ fontSize:11, color:'#9E9E9E' }}>Desa {p.desa}</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:p.aktif?'#F0FDF4':'#F9FAFB', color:p.aktif?'#16A34A':'#9E9E9E' }}>{p.aktif?'Aktif':'Nonaktif'}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['Total Balita',p.totalBalita,'#1565C0'],['Stunting',p.stunting,p.stunting>0?'#DC2626':'#9E9E9E']].map(([l,v,c])=>(
                <div key={l} style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
                  <div style={{ fontSize:10, color:'#9E9E9E' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, fontSize:12, color:'#6B7280' }}>👤 Kader: <strong>{p.kader}</strong></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── StuntingPage ───────────────────────────────────────────────
export function StuntingPage({ balitaList, statistik }) {
  const perluPerhatian = balitaList.filter(b => {
    if (!b.riwayat?.length) return false;
    const last = b.riwayat[b.riwayat.length-1];
    const umur = hitungUmurBulan(b.tanggalLahir);
    return getStatusStunting(last.tb || last.tinggiBadan, umur, b.jenisKelamin) !== 'Normal';
  });
  const pieData = [
    { name:'Normal',   value: statistik.normal,   color:'#16A34A' },
    { name:'Risiko',   value: statistik.risiko,    color:'#D97706' },
    { name:'Stunting', value: statistik.stunting,  color:'#DC2626' },
  ];
  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        {pieData.map(d => (
          <div key={d.name} style={{ flex:1, minWidth:140, padding:'18px', background:`${d.color}0A`, borderRadius:14, border:`1px solid ${d.color}22`, textAlign:'center' }}>
            <div style={{ fontSize:32, fontWeight:800, color:d.color }}>{d.value}</div>
            <div style={{ fontSize:12, color:d.color, fontWeight:700 }}>{d.name}</div>
            <div style={{ fontSize:11, color:'#9E9E9E', marginTop:2 }}>{Math.round(d.value/(statistik.total||1)*100)}% dari total</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:16 }}>
        <Card>
          <SectionHeader title="Distribusi"/>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip/></PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title={`Balita Perlu Perhatian (${perluPerhatian.length})`}/>
          {perluPerhatian.length === 0
            ? <EmptyState emoji="✅" message="Tidak ada balita stunting"/>
            : <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:280, overflowY:'auto' }}>
                {perluPerhatian.map(b => {
                  const last = b.riwayat[b.riwayat.length-1];
                  const umur = hitungUmurBulan(b.tanggalLahir);
                  const ss   = getStatusStunting(last.tb||last.tinggiBadan, umur, b.jenisKelamin);
                  return (
                    <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:'#F9FAFB', border:`1px solid ${ss==='Stunting'?'#FECACA':'#FDE68A'}` }}>
                      <span style={{ fontSize:22 }}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{b.nama}</div>
                        <div style={{ fontSize:11, color:'#9E9E9E' }}>{formatUmur(b.tanggalLahir)} • BB:{last.bb||last.beratBadan}kg • TB:{last.tb||last.tinggiBadan}cm</div>
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
