/* eslint-disable no-unused-vars */
// ============================================================
//  DashboardPage — REDESIGNED (Navy + Amber Design System)
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

const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  .dash-root { font-family: 'DM Sans', sans-serif; }
  .dash-banner {
    border-radius: 20px; padding: 24px 28px; margin-bottom: 24px;
    display: flex; align-items: center; gap: 18px;
    position: relative; overflow: hidden;
  }
  .dash-banner::before {
    content:''; position:absolute; width:300px; height:300px; border-radius:50%;
    background:rgba(255,255,255,0.05); top:-100px; right:-60px; pointer-events:none;
  }
  .banner-admin { background: linear-gradient(135deg, #0A0F1E 0%, #1e2d4a 60%, #243347 100%); }
  .banner-bidan { background: linear-gradient(135deg, #0A0F1E 0%, #162040 60%, #1a2d50 100%); }
  .banner-kader { background: linear-gradient(135deg, #0A0F1E 0%, #1f1500 60%, #2a1c00 100%); }
  .banner-icon {
    width:60px; height:60px; border-radius:18px; font-size:28px;
    background:rgba(245,158,11,0.15); border:1.5px solid rgba(245,158,11,0.3);
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; position:relative; z-index:1;
  }
  .banner-text { position:relative; z-index:1; }
  .banner-title { font-family:'Sora',sans-serif; color:#fff; font-weight:800; font-size:20px; margin-bottom:4px; }
  .banner-sub { color:rgba(255,255,255,0.45); font-size:12px; }
  .banner-actions { margin-left:auto; display:flex; gap:8px; position:relative; z-index:1; }
  .banner-btn {
    background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3);
    border-radius:12px; padding:8px 16px; color:#F59E0B; cursor:pointer;
    font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; gap:6px; transition:all 0.2s;
  }
  .banner-btn:hover { background:rgba(245,158,11,0.25); transform:translateY(-1px); }
  .stat-grid { display:flex; gap:14px; margin-bottom:24px; flex-wrap:wrap; }
  .stat-card-n {
    flex:1; min-width:160px; background:#fff; border-radius:18px;
    padding:18px 20px; border:1.5px solid #F1F5F9;
    box-shadow:0 2px 12px rgba(0,0,0,0.04); transition:all 0.2s;
  }
  .stat-card-n:hover { box-shadow:0 8px 24px rgba(0,0,0,0.08); transform:translateY(-2px); }
  .stat-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:12px; }
  .stat-val { font-family:'Sora',sans-serif; font-size:32px; font-weight:800; line-height:1; margin-bottom:4px; }
  .stat-lbl { font-size:12px; color:#94A3B8; font-weight:600; margin-bottom:3px; }
  .stat-sub { font-size:11px; color:#CBD5E1; }
  .panel {
    background:#fff; border-radius:20px; padding:20px 22px;
    border:1.5px solid #F1F5F9; box-shadow:0 2px 12px rgba(0,0,0,0.04);
  }
  .panel-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .panel-ttl { font-family:'Sora',sans-serif; font-size:14px; font-weight:700; color:#0F172A; }
  .panel-act {
    background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:8px;
    padding:5px 12px; font-size:11px; font-weight:600; color:#64748B;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .panel-act:hover { background:#F1F5F9; color:#0F172A; }
  .priority-item {
    display:flex; align-items:center; gap:10px;
    padding:11px 13px; border-radius:12px; margin-bottom:8px;
    border:1.5px solid #FECACA;
    background:linear-gradient(135deg,#FFF5F5,#FEF2F2);
    transition:all 0.15s;
  }
  .priority-item:hover { transform:translateX(2px); }
  .psy-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 12px; border-radius:12px; background:#F8FAFC;
    margin-bottom:8px; border:1.5px solid transparent; transition:all 0.15s;
  }
  .psy-item:hover { background:#F1F5F9; border-color:#E2E8F0; }
  .jadwal-card {
    padding:14px; border-radius:14px; border:1.5px solid #F1F5F9;
    background:#FAFAFA; display:flex; gap:12px; align-items:flex-start; transition:all 0.2s;
  }
  .jadwal-card:hover { background:#fff; box-shadow:0 4px 16px rgba(0,0,0,0.06); border-color:#E2E8F0; }
  .jadwal-date { width:46px; height:46px; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
  .next-jadwal {
    background:linear-gradient(135deg,#0A0F1E,#1a2035);
    border-radius:18px; padding:18px 22px; margin-bottom:24px;
    display:flex; align-items:center; gap:16px;
    border:1.5px solid rgba(245,158,11,0.2);
    box-shadow:0 8px 32px rgba(0,0,0,0.15);
  }
  .next-date-box {
    width:56px; height:56px; flex-shrink:0;
    background:rgba(245,158,11,0.15); border:1.5px solid rgba(245,158,11,0.3);
    border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center;
  }
  .task-item { display:flex; align-items:center; gap:10px; padding:11px 13px; border-radius:12px; margin-bottom:8px; transition:all 0.15s; border:1.5px solid transparent; }
  .task-done  { background:#F0FDF4; border-color:#BBF7D0 !important; }
  .task-todo  { background:#F8FAFC; border-color:#F1F5F9 !important; cursor:pointer; }
  .task-todo:hover { transform:translateX(2px); border-color:#E2E8F0 !important; }
  .mini-stat { padding:16px; border-radius:14px; text-align:center; transition:all 0.2s; border:1.5px solid transparent; }
  .mini-stat:hover { transform:scale(1.03); }
  .mini-val { font-family:'Sora',sans-serif; font-size:28px; font-weight:800; line-height:1; }
  .mini-lbl { font-size:11px; color:#94A3B8; margin-top:4px; }
  .tip-note { background:linear-gradient(135deg,#FFFBEB,#FEF3C7); border:1.5px solid #FDE68A; border-radius:12px; padding:10px 14px; margin-top:12px; font-size:11px; color:#92400E; text-align:center; }
  .ctooltip { background:#fff; border:1px solid #F0F0F0; border-radius:12px; padding:10px 14px; box-shadow:0 8px 24px rgba(0,0,0,0.1); font-size:12px; font-family:'DM Sans',sans-serif; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .anim { animation: fadeUp 0.4s ease both; }
  .d1{animation-delay:0.05s} .d2{animation-delay:0.1s} .d3{animation-delay:0.15s} .d4{animation-delay:0.2s}
`;

let injected = false;
function injectCSS() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const el = document.createElement('style');
  el.textContent = DASH_CSS;
  document.head.appendChild(el);
}

function CT({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ctooltip">
      <div style={{fontWeight:700,marginBottom:6,color:'#0F172A'}}>{label}</div>
      {payload.map(p=>(
        <div key={p.name} style={{color:p.color,marginBottom:2}}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function SC({ label, value, icon, color, bg, sub, cls='' }) {
  return (
    <div className={`stat-card-n anim ${cls}`}>
      <div className="stat-icon" style={{background:bg}}>{icon}</div>
      <div className="stat-val" style={{color}}>{value}</div>
      <div className="stat-lbl">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function Panel({ title, action, onAction, children, style }) {
  return (
    <div className="panel" style={style}>
      <div className="panel-hdr">
        <div className="panel-ttl">{title}</div>
        {action && <button className="panel-act" onClick={onAction}>{action}</button>}
      </div>
      {children}
    </div>
  );
}

// ── Admin ────────────────────────────────────────────────────
function AdminDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  injectCSS();
  const pie = [
    {name:'Normal',  value:statistik.normal,  color:'#16A34A'},
    {name:'Risiko',  value:statistik.risiko,  color:'#F59E0B'},
    {name:'Stunting',value:statistik.stunting,color:'#EF4444'},
  ];
  return (
    <div className="dash-root" style={{padding:24}}>
      <div className="dash-banner banner-admin anim">
        <div className="banner-icon">👨‍⚕️</div>
        <div className="banner-text">
          <div className="banner-title">Dashboard Eksekutif</div>
          <div className="banner-sub">Monitoring seluruh posyandu di wilayah kerja Puskesmas</div>
        </div>
        <div className="banner-actions">
          {[['📊','Laporan','laporan'],['👥','Pengguna','pengguna']].map(([i,l,p])=>(
            <button key={p} className="banner-btn" onClick={()=>onNav(p)}>{i} {l}</button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        <SC label="Total Balita"  value={statistik.total}    icon="👶" color="#1D4ED8" bg="#EFF6FF" sub={`${posyanduList.length} posyandu aktif`} cls="d1"/>
        <SC label="Stunting"      value={statistik.stunting} icon="⚠️" color="#EF4444" bg="#FEF2F2" sub={`${Math.round(statistik.stunting/statistik.total*100)||0}% dari total`} cls="d2"/>
        <SC label="Risiko"        value={statistik.risiko}   icon="📊" color="#F59E0B" bg="#FFFBEB" sub="Perlu pemantauan rutin" cls="d3"/>
        <SC label="Gizi Kurang"   value={statistik.giziKurang} icon="⚖️" color="#7C3AED" bg="#F5F3FF" sub="Butuh intervensi gizi" cls="d4"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:20}}>
        <Panel title="📈 Tren Stunting 6 Bulan" action="Lihat Laporan" onAction={()=>onNav('laporan')}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trenStunting} margin={{top:5,right:10,bottom:5,left:-20}}>
              <defs>
                {[['gN','#16A34A'],['gR','#F59E0B'],['gS','#EF4444']].map(([id,c])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="bulan" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT/>}/>
              <Legend iconSize={8} iconType="circle" formatter={v=><span style={{fontSize:11,color:'#64748B'}}>{v}</span>}/>
              <Area type="monotone" dataKey="normal"   name="Normal"   stroke="#16A34A" fill="url(#gN)" strokeWidth={2.5}/>
              <Area type="monotone" dataKey="risiko"   name="Risiko"   stroke="#F59E0B" fill="url(#gR)" strokeWidth={2.5}/>
              <Area type="monotone" dataKey="stunting" name="Stunting" stroke="#EF4444" fill="url(#gS)" strokeWidth={2.5}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="🥧 Distribusi Status">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={4}>
                {pie.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
            {pie.map(d=>(
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <div style={{width:10,height:10,borderRadius:3,background:d.color,flexShrink:0}}/>
                <span style={{flex:1,color:'#64748B',fontWeight:500}}>{d.name}</span>
                <span style={{fontWeight:700,color:d.color}}>{d.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        <Panel title="🏥 Perbandingan Antar Posyandu" action="Detail" onAction={()=>onNav('posyandu')}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={posyanduList} margin={{left:-20,right:10,top:5,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="nama" tick={{fontSize:9,fill:'#94A3B8'}} axisLine={false} tickLine={false}
                tickFormatter={v=>v.replace('Posyandu ','')}/>
              <YAxis tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT/>}/>
              <Bar dataKey="totalBalita" name="Total"    fill="#BFDBFE" radius={[6,6,0,0]}/>
              <Bar dataKey="stunting"    name="Stunting" fill="#FCA5A5" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="📍 Status Posyandu" action="Kelola" onAction={()=>onNav('posyandu')}>
          {posyanduList.map(p=>(
            <div key={p.id} className="psy-item">
              <div style={{width:10,height:10,borderRadius:'50%',flexShrink:0,
                background:p.aktif?'#16A34A':'#9CA3AF',
                boxShadow:p.aktif?'0 0 6px #16A34A':'none'}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nama}</div>
                <div style={{fontSize:10,color:'#94A3B8'}}>{p.kader}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:14,fontWeight:800,color:'#1D4ED8',fontFamily:'Sora,sans-serif'}}>{p.totalBalita}</div>
                {p.stunting>0&&<div style={{fontSize:10,color:'#EF4444',fontWeight:600}}>{p.stunting} stunting</div>}
              </div>
            </div>
          ))}
        </Panel>
      </div>
      <JadwalSection upcomingJadwal={upcomingJadwal} onNav={onNav}/>
    </div>
  );
}

// ── Bidan ────────────────────────────────────────────────────
function BidanDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  injectCSS();
  const prioritas = balitaList.filter(b=>{
    if (!b.riwayat.length) return false;
    const last = b.riwayat[b.riwayat.length-1];
    const umur = hitungUmurBulan(b.tanggalLahir);
    return getStatusStunting(last.tb,umur,b.jenisKelamin)!=='Normal';
  }).slice(0,5);

  return (
    <div className="dash-root" style={{padding:24}}>
      <div className="dash-banner banner-bidan anim">
        <div className="banner-icon">👩‍⚕️</div>
        <div className="banner-text">
          <div className="banner-title">Panel Bidan</div>
          <div className="banner-sub">Pantau kondisi balita dan jadwal posyandu wilayah kerjamu</div>
        </div>
        <div className="banner-actions">
          <button className="banner-btn" onClick={()=>onNav('balita')}>👶 Data Balita</button>
          <button className="banner-btn" onClick={()=>onNav('jadwal')}>📅 Jadwal</button>
        </div>
      </div>

      <div className="stat-grid">
        <SC label="Total Balita"     value={statistik.total}                       icon="👶" color="#1D4ED8" bg="#EFF6FF" cls="d1"/>
        <SC label="Perlu Perhatian"  value={statistik.stunting+statistik.risiko}   icon="⚠️" color="#EF4444" bg="#FEF2F2" sub="Stunting + Risiko" cls="d2"/>
        <SC label="Jadwal Bulan Ini" value={upcomingJadwal.length}                 icon="📅" color="#F59E0B" bg="#FFFBEB" sub="Kegiatan mendatang" cls="d3"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        <Panel title="⚠️ Balita Perlu Perhatian" action="Lihat Semua" onAction={()=>onNav('stunting')}>
          {prioritas.length===0
            ? <div style={{textAlign:'center',padding:'28px 20px',background:'#F0FDF4',borderRadius:14,border:'1.5px solid #BBF7D0'}}>
                <div style={{fontSize:32,marginBottom:8}}>✅</div>
                <div style={{fontSize:13,color:'#16A34A',fontWeight:600}}>Tidak ada balita stunting</div>
                <div style={{fontSize:11,color:'#86EFAC',marginTop:4}}>Semua balita dalam kondisi normal</div>
              </div>
            : prioritas.map(b=>{
              const last=b.riwayat[b.riwayat.length-1];
              const umur=hitungUmurBulan(b.tanggalLahir);
              const ss=getStatusStunting(last.tb,umur,b.jenisKelamin);
              return (
                <div key={b.id} className="priority-item">
                  <span style={{fontSize:22}}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12,color:'#0F172A'}}>{b.nama}</div>
                    <div style={{fontSize:10,color:'#94A3B8'}}>{formatUmur(b.tanggalLahir)} • BB:{last.bb}kg TB:{last.tb}cm</div>
                  </div>
                  <StatusBadge status={ss}/>
                </div>
              );
            })
          }
        </Panel>
        <Panel title="📈 Tren 6 Bulan" action="Laporan" onAction={()=>onNav('laporan')}>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={trenStunting} margin={{top:5,right:10,bottom:5,left:-25}}>
              <defs>
                <linearGradient id="bS2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.18}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="bR2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.15}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="bulan" tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT/>}/>
              <Area type="monotone" dataKey="stunting" name="Stunting" stroke="#EF4444" fill="url(#bS2)" strokeWidth={2.5}/>
              <Area type="monotone" dataKey="risiko"   name="Risiko"   stroke="#F59E0B" fill="url(#bR2)" strokeWidth={2} strokeDasharray="5 3"/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <JadwalSection upcomingJadwal={upcomingJadwal} onNav={onNav}/>
    </div>
  );
}

// ── Kader ────────────────────────────────────────────────────
function KaderDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  injectCSS();
  const jadwalBerikut = upcomingJadwal[0];
  return (
    <div className="dash-root" style={{padding:24}}>
      <div className="dash-banner banner-kader anim">
        <div className="banner-icon">🤝</div>
        <div className="banner-text">
          <div className="banner-title">Panel Kader</div>
          <div className="banner-sub">Selamat bekerja! Catat pemantauan balita dengan teliti</div>
        </div>
        <div style={{marginLeft:'auto',position:'relative',zIndex:1}}>
          <div style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:12,padding:'8px 14px',color:'#F59E0B',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#F59E0B',boxShadow:'0 0 6px #F59E0B',display:'inline-block'}}/>
            Aktif Bertugas
          </div>
        </div>
      </div>

      {jadwalBerikut && (
        <div className="next-jadwal anim d1">
          <div className="next-date-box">
            <div style={{fontSize:20,fontWeight:800,color:'#F59E0B',lineHeight:1,fontFamily:'Sora,sans-serif'}}>
              {new Date(jadwalBerikut.tanggal).getDate()}
            </div>
            <div style={{fontSize:9,color:'rgba(245,158,11,0.7)',fontWeight:700}}>
              {new Date(jadwalBerikut.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>Kegiatan Berikutnya</div>
            <div style={{fontWeight:800,fontSize:15,color:'#fff',fontFamily:'Sora,sans-serif',marginBottom:4}}>{jadwalBerikut.judul}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>🕐 {jadwalBerikut.waktu} &nbsp;·&nbsp; 📍 {jadwalBerikut.lokasi}</div>
          </div>
          <button onClick={()=>onNav('jadwal')} style={{background:'linear-gradient(135deg,#F59E0B,#D97706)',border:'none',borderRadius:12,padding:'10px 18px',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'DM Sans,sans-serif',boxShadow:'0 4px 16px rgba(245,158,11,0.35)',flexShrink:0,position:'relative',zIndex:1}}>
            Lihat Jadwal
          </button>
        </div>
      )}

      <div className="stat-grid">
        <SC label="Balita di Posyanduku" value={statistik.total} icon="👶" color="#F59E0B" bg="#FFFBEB" cls="d1"/>
        <SC label="Perlu Perhatian"      value={statistik.stunting+statistik.risiko} icon="⚠️" color="#EF4444" bg="#FEF2F2" sub="Butuh kunjungan rutin" cls="d2"/>
        <SC label="Sudah Diukur"         value={balitaList.filter(b=>b.riwayat.length>0).length} icon="✅" color="#16A34A" bg="#F0FDF4" sub="Bulan ini" cls="d3"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Panel title="📋 Tugas Kader Hari Ini">
          {[
            {done:true, task:'Cek jadwal posyandu bulan ini',action:null},
            {done:false,task:'Catat pemantauan balita yang datang',action:()=>onNav('balita')},
            {done:false,task:'Update data balita baru jika ada',action:()=>onNav('balita')},
            {done:false,task:'Laporkan balita stunting ke bidan',action:()=>onNav('pemantauan')},
          ].map((t,i)=>(
            <div key={i} className={`task-item ${t.done?'task-done':'task-todo'}`} onClick={t.action||undefined}>
              <span style={{fontSize:18}}>{t.done?'✅':'⬜'}</span>
              <span style={{fontSize:12,fontWeight:500,flex:1,color:t.done?'#16A34A':'#374151',textDecoration:t.done?'line-through':'none'}}>{t.task}</span>
              {t.action&&<span style={{fontSize:14,color:'#94A3B8',fontWeight:700}}>›</span>}
            </div>
          ))}
        </Panel>
        <Panel title="🔢 Ringkasan Posyandu" action="Data Balita" onAction={()=>onNav('balita')}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              ['Total',   statistik.total,   '#1D4ED8','#EFF6FF','#DBEAFE'],
              ['Normal',  statistik.normal,  '#16A34A','#F0FDF4','#DCFCE7'],
              ['Risiko',  statistik.risiko,  '#F59E0B','#FFFBEB','#FEF3C7'],
              ['Stunting',statistik.stunting,'#EF4444','#FEF2F2','#FEE2E2'],
            ].map(([l,v,c,bg,bd])=>(
              <div key={l} className="mini-stat" style={{background:bg,borderColor:bd}}>
                <div className="mini-val" style={{color:c}}>{v}</div>
                <div className="mini-lbl">{l}</div>
              </div>
            ))}
          </div>
          <div className="tip-note">💡 Kader hanya bisa melihat data posyandunya sendiri</div>
        </Panel>
      </div>
    </div>
  );
}

// ── Jadwal shared ────────────────────────────────────────────
const JCLR = {posyandu:'#16A34A',imunisasi:'#2563EB',penyuluhan:'#EA580C',pmt:'#9333EA'};
function JadwalSection({ upcomingJadwal, onNav }) {
  return (
    <Panel title="📅 Jadwal Mendatang" action="Lihat Semua" onAction={()=>onNav('jadwal')}>
      {upcomingJadwal.length===0
        ? <div style={{textAlign:'center',padding:'28px 20px',background:'#F8FAFC',borderRadius:14,border:'1.5px dashed #E2E8F0'}}>
            <div style={{fontSize:28,marginBottom:8}}>📅</div>
            <div style={{fontSize:13,color:'#94A3B8',fontWeight:500}}>Tidak ada jadwal mendatang</div>
          </div>
        : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:12}}>
            {upcomingJadwal.map(j=>{
              const c=JCLR[j.tipe]||'#9CA3AF';
              return (
                <div key={j.id} className="jadwal-card">
                  <div className="jadwal-date" style={{background:`${c}18`}}>
                    <div style={{fontSize:18,fontWeight:800,color:c,lineHeight:1,fontFamily:'Sora,sans-serif'}}>
                      {new Date(j.tanggal).getDate()}
                    </div>
                    <div style={{fontSize:8,color:c,fontWeight:700}}>
                      {new Date(j.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}
                    </div>
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#0F172A'}}>{j.judul}</div>
                    <TipeBadge tipe={j.tipe}/>
                    <div style={{fontSize:11,color:'#94A3B8',marginTop:5}}>📍 {j.lokasi}</div>
                    <div style={{fontSize:11,color:'#94A3B8'}}>🕐 {j.waktu}</div>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </Panel>
  );
}

// ── Export ───────────────────────────────────────────────────
export default function DashboardPage({ statistik, upcomingJadwal, balitaList, onNav, role }) {
  if (role==='admin') return <AdminDashboard statistik={statistik} upcomingJadwal={upcomingJadwal} balitaList={balitaList} onNav={onNav}/>;
  if (role==='bidan') return <BidanDashboard statistik={statistik} upcomingJadwal={upcomingJadwal} balitaList={balitaList} onNav={onNav}/>;
  return <KaderDashboard statistik={statistik} upcomingJadwal={upcomingJadwal} balitaList={balitaList} onNav={onNav}/>;
}