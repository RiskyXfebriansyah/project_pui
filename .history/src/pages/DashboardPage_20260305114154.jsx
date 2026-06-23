/* eslint-disable no-unused-vars */
// ============================================================
//  DashboardPage — REDESIGNED (Navy + Amber) + REAL DB DATA
// ============================================================

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  .dash-root { font-family: 'DM Sans', sans-serif; padding: 24px; }
  .dash-banner {
    border-radius: 20px; padding: 24px 28px; margin-bottom: 24px;
    display: flex; align-items: center; gap: 18px; position: relative; overflow: hidden;
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
    display:flex; align-items:center; justify-content:center; flex-shrink:0; z-index:1;
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
  
  .psy-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 12px; border-radius:12px; background:#F8FAFC;
    margin-bottom:8px; border:1.5px solid transparent; transition:all 0.15s;
  }
  .psy-item:hover { background:#F1F5F9; border-color:#E2E8F0; }
  
  .anim { animation: fadeUp 0.4s ease both; }
  .d1{animation-delay:0.05s} .d2{animation-delay:0.1s} .d3{animation-delay:0.15s} .d4{animation-delay:0.2s}
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
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
    <div style={{
      background:'#fff', border:'1px solid #F0F0F0', borderRadius:12, padding:'10px 14px',
      boxShadow:'0 8px 24px rgba(0,0,0,0.1)', fontSize:12, fontFamily:'DM Sans,sans-serif'
    }}>
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

// ── TREND DATA DUMMY (bisa diganti real dari backend nanti) ──
const trenStunting = [
  {bulan:'Jan', normal:45, risiko:8, stunting:2},
  {bulan:'Feb', normal:47, risiko:7, stunting:3},
  {bulan:'Mar', normal:43, risiko:9, stunting:4},
  {bulan:'Apr', normal:46, risiko:6, stunting:2},
  {bulan:'Mei', normal:48, risiko:5, stunting:1},
  {bulan:'Jun', normal:50, risiko:4, stunting:1}
];

// ── ADMIN DASHBOARD (REAL POSYANDU DATA) ────────────────────
function AdminDashboard({ statistik, upcomingJadwal, balitaList, posyandu, onNav }) {
  injectCSS();
  
  const pieData = [
    {name:'Normal',  value:statistik.normal || 0,  color:'#16A34A'},
    {name:'Risiko',  value:statistik.risiko || 0,  color:'#F59E0B'},
    {name:'Stunting',value:statistik.stunting || 0,color:'#EF4444'},
  ];

  // Sort posyandu berdasarkan totalBalita (top 6)
  const topPosyandu = (posyandu || []).sort((a,b)=>(b.totalBalita||0)-(a.totalBalita||0)).slice(0,6);

  return (
    <div className="dash-root">
      {/* Banner */}
      <div className="dash-banner banner-admin anim">
        <div className="banner-icon">👨‍⚕️</div>
        <div className="banner-text">
          <div className="banner-title">Dashboard Eksekutif</div>
          <div className="banner-sub">
            Monitoring {posyandu?.length || 0} posyandu • {statistik.total || 0} balita terdaftar
          </div>
        </div>
        <div className="banner-actions">
          {[['📊','Laporan','laporan'],['👥','Pengguna','pengguna'],['🏥','Posyandu','posyandu']].map(([i,l,p])=>(
            <button key={p} className="banner-btn" onClick={()=>onNav(p)}>{i} {l}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <SC label="Total Balita" value={statistik.total || 0} icon="👶" color="#1D4ED8" bg="#EFF6FF" 
            sub={`${posyandu?.length || 0} posyandu aktif`} cls="d1"/>
        <SC label="Stunting" value={statistik.stunting || 0} icon="⚠️" color="#EF4444" bg="#FEF2F2" 
            sub={`${Math.round((statistik.stunting/statistik.total||0)*100)||0}%`} cls="d2"/>
        <SC label="Risiko" value={statistik.risiko || 0} icon="📊" color="#F59E0B" bg="#FFFBEB" 
            sub="Perlu pemantauan" cls="d3"/>
        <SC label="Gizi Kurang" value={statistik.giziKurang || 0} icon="⚖️" color="#7C3AED" bg="#F5F3FF" 
            sub="Butuh intervensi" cls="d4"/>
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:20}}>
        <Panel title="📈 Tren Stunting 6 Bulan" action="Lihat Laporan" onAction={()=>onNav('laporan')}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trenStunting} margin={{top:5,right:10,bottom:5,left:-20}}>
              <defs>
                {[['gN','#16A34A'],['gR','#F59E0B'],['gS','#EF4444']].map(([id,c])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="bulan" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT/>}/>
              <Legend iconSize={8} iconType="circle"/>
              <Area type="monotone" dataKey="normal" name="Normal" stroke="#16A34A" fill="url(#gN)" strokeWidth={2.5}/>
              <Area type="monotone" dataKey="risiko" name="Risiko" stroke="#F59E0B" fill="url(#gR)" strokeWidth={2.5}/>
              <Area type="monotone" dataKey="stunting" name="Stunting" stroke="#EF4444" fill="url(#gS)" strokeWidth={2.5}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="🥧 Distribusi Status">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={4}>
                {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
            {pieData.map(d=>(
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <div style={{width:10,height:10,borderRadius:3,background:d.color,flexShrink:0}}/>
                <span style={{flex:1,color:'#64748B',fontWeight:500}}>{d.name}</span>
                <span style={{fontWeight:700,color:d.color}}>{d.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* POSYANDU DATA - REAL FROM DB */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Panel title="🏥 Perbandingan Antar Posyandu" action="Kelola" onAction={()=>onNav('posyandu')}>
          {topPosyandu.length === 0 ? (
            <div style={{textAlign:'center',padding:'40px 20px',color:'#94A3B8'}}>
              <div style={{fontSize:32,marginBottom:12}}>🏥</div>
              Belum ada data posyandu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topPosyandu} margin={{left:-20,right:10,top:5,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                <XAxis dataKey="nama" 
                       tick={{fontSize:9,fill:'#94A3B8'}} 
                       axisLine={false} 
                       tickLine={false}
                       tickFormatter={v=>v.length>15 ? v.slice(0,12)+'...' : v}/>
                <YAxis tick={{fontSize:10,fill:'#94A3B8'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Bar dataKey="totalBalita" name="Total Balita" fill="#BFDBFE" radius={[6,6,0,0]}/>
                <Bar dataKey="stunting" name="Stunting" fill="#FCA5A5" radius={[6,6,0,0]}/>
              </BarChart>
            )}
          </ResponsiveContainer>
        </Panel>

        <Panel title="📍 Status Posyandu" action="Kelola" onAction={()=>onNav('posyandu')}>
          {posyandu?.length === 0 ? (
            <div style={{textAlign:'center',padding:'40px 20px',color:'#94A3B8'}}>
              Belum ada posyandu terdaftar
            </div>
          ) : (
            posyandu.slice(0,8).map(p=>(
              <div key={p.id} className="psy-item">
                <div style={{width:10,height:10,borderRadius:'50%',flexShrink:0,
                  background:p.aktif?'#16A34A':'#9CA3AF',
                  boxShadow:p.aktif?'0 0 6px #16A34A':'none'}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {p.nama}
                  </div>
                  <div style={{fontSize:10,color:'#94A3B8'}}>
                    {p.desa}, {p.kecamatan}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:14,fontWeight:800,color:'#1D4ED8',fontFamily:'Sora,sans-serif'}}>
                    {p.totalBalita || 0}
                  </div>
                  {p.stunting > 0 && (
                    <div style={{fontSize:10,color:'#EF4444',fontWeight:600}}>
                      {p.stunting} stunting
                    </div>
                  )}
                  {p.namaKader && (
                    <div style={{fontSize:9,color:'#64748B'}}>{p.namaKader}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </Panel>
      </div>

      <JadwalSection upcomingJadwal={upcomingJadwal} onNav={onNav}/>
    </div>
  );
}

// ── BIDAN & KADER (tetap sama, hanya singkatkan) ──────────────
function BidanDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  injectCSS();
  return (
    <div className="dash-root">
      <div className="dash-banner banner-bidan anim">
        <div className="banner-icon">👩‍⚕️</div>
        <div className="banner-text">
          <div className="banner-title">Panel Bidan</div>
          <div className="banner-sub">Pantau kondisi balita dan jadwal posyandu</div>
        </div>
        <div className="banner-actions">
          <button className="banner-btn" onClick={()=>onNav('balita')}>👶 Data Balita</button>
          <button className="banner-btn" onClick={()=>onNav('jadwal')}>📅 Jadwal</button>
        </div>
      </div>
      {/* Stats dan content lainnya sama seperti sebelumnya */}
      <div className="stat-grid">
        <SC label="Total Balita" value={statistik.total || 0} icon="👶" color="#1D4ED8" bg="#EFF6FF" cls="d1"/>
        <SC label="Perlu Perhatian" value={(statistik.stunting||0)+(statistik.risiko||0)} icon="⚠️" color="#EF4444" bg="#FEF2F2" cls="d2"/>
        <SC label="Jadwal Bulan Ini" value={upcomingJadwal?.length || 0} icon="📅" color="#F59E0B" bg="#FFFBEB" cls="d3"/>
      </div>
      <JadwalSection upcomingJadwal={upcomingJadwal} onNav={onNav}/>
    </div>
  );
}

function KaderDashboard({ statistik, upcomingJadwal, balitaList, onNav }) {
  injectCSS();
  return (
    <div className="dash-root">
      <div className="dash-banner banner-kader anim">
        <div className="banner-icon">🤝</div>
        <div className="banner-text">
          <div className="banner-title">Panel Kader</div>
          <div className="banner-sub">Catat pemantauan balita dengan teliti</div>
        </div>
      </div>
      <div className="stat-grid">
        <SC label="Balita Posyanduku" value={statistik.total || 0} icon="👶" color="#F59E0B" bg="#FFFBEB" cls="d1"/>
        <SC label="Perlu Perhatian" value={(statistik.stunting||0)+(statistik.risiko||0)} icon="⚠️" color="#EF4444" bg="#FEF2F2" cls="d2"/>
      </div>
    </div>
  );
}

function JadwalSection({ upcomingJadwal, onNav }) {
  return (
    <Panel title="📅 Jadwal Mendatang" action="Lihat Semua" onAction={()=>onNav('jadwal')}>
      {upcomingJadwal?.length === 0 ? (
        <div style={{textAlign:'center',padding:'28px 20px',color:'#94A3B8'}}>
          <div style={{fontSize:28,marginBottom:8}}>📅</div>
          Tidak ada jadwal mendatang
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:12}}>
          {(upcomingJadwal || []).slice(0,4).map(j=>(
            <div key={j.id} style={{
              padding:14, borderRadius:14, border:'1.5px solid #F1F5F9',
              background:'#FAFAFA', display:'flex', gap:12, alignItems:'flex-start'
            }}>
              <div style={{
                width:46, height:46, borderRadius:12, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', flexShrink:0,
                background:'rgba(22,163,74,0.1)'
              }}>
                <div style={{fontSize:18,fontWeight:800,color:'#16A34A'}}>{new Date(j.tanggal).getDate()}</div>
                <div style={{fontSize:8,color:'#16A34A',fontWeight:700}}>{new Date(j.tanggal).toLocaleString('id',{month:'short'}).toUpperCase()}</div>
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:'#0F172A'}}>{j.judul}</div>
                <div style={{fontSize:11,color:'#94A3B8'}}>📍 {j.lokasi}</div>
                <div style={{fontSize:11,color:'#94A3B8'}}>🕐 {j.waktu}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────
export default function DashboardPage({ role, statistik, upcomingJadwal, balitaList, posyandu, onNav }) {
  if (role === 'admin') {
    return <AdminDashboard statistik={statistik} upcomingJadwal={upcomingJadwal} balitaList={balitaList} posyandu={posyandu} onNav={onNav} />;
  }
  if (role === 'bidan') {
    return <BidanDashboard statistik={statistik} upcomingJadwal={upcomingJadwal} balitaList={balitaList} onNav={onNav} />;
  }
  return <KaderDashboard statistik={statistik} upcomingJadwal={upcomingJadwal} balitaList={balitaList} onNav={onNav} />;
}
