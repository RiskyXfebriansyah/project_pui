// ============================================================
//  Sidebar — LAYOUT COMPONENT dengan ROLE-BASED MENU
//  Admin   → semua menu (8 item)
//  Bidan   → tanpa Pengguna (7 item)
//  Kader   → hanya menu dasar (5 item)
// ============================================================

import React, { useState } from 'react';

// Definisi semua menu yang ada
const ALL_NAV = [
  { id:'dashboard',  icon:'📊', label:'Dashboard',          roles:['admin','bidan','kader'] },
  { id:'balita',     icon:'👶', label:'Data Balita',         roles:['admin','bidan','kader'] },
  { id:'pemantauan', icon:'📈', label:'Pemantauan',          roles:['admin','bidan','kader'] },
  { id:'stunting',   icon:'⚠️', label:'Analisis Stunting',   roles:['admin','bidan']         },
  { id:'jadwal',     icon:'📅', label:'Jadwal',              roles:['admin','bidan','kader'] },
  { id:'laporan',    icon:'📋', label:'Laporan',             roles:['admin','bidan']         },
  { id:'posyandu',   icon:'🏥', label:'Data Posyandu',       roles:['admin']                 },
  { id:'pengguna',   icon:'👥', label:'Pengguna',            roles:['admin']                 },
];

// Warna sidebar per role
const SIDEBAR_COLOR = {
  admin: '#0D3D1E',  // hijau gelap
  bidan: '#0C2D5C',  // biru gelap
  kader: '#3D1A0D',  // coklat/oranye gelap
};

const ACCENT_COLOR = {
  admin: '#4ADE80',
  bidan: '#60A5FA',
  kader: '#FB923C',
};

export function Sidebar({ active, onNav, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role || 'kader';
  const bg   = SIDEBAR_COLOR[role] || SIDEBAR_COLOR.kader;
  const acc  = ACCENT_COLOR[role]  || ACCENT_COLOR.kader;

  // Filter menu sesuai role user
  const navItems = ALL_NAV.filter(item => item.roles.includes(role));

  // Kalau halaman aktif tidak ada di role ini, default ke dashboard
  const safeActive = navItems.find(n => n.id === active) ? active : 'dashboard';

  return (
    <aside style={{
      width: collapsed ? 68 : 240, minHeight:'100vh',
      background: bg, display:'flex', flexDirection:'column',
      transition:'width .25s cubic-bezier(.4,0,.2,1)',
      flexShrink: 0, position:'relative', zIndex: 10,
    }}>
      {/* Logo + collapse button */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px',
        borderBottom:'1px solid rgba(255,255,255,0.08)',
        display:'flex', alignItems:'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>❤️</span>
              <span style={{ color:'#fff', fontWeight:800, fontSize:15 }}>Posyandu</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, marginTop:2, paddingLeft:28 }}>
              {role === 'admin' ? 'Admin Panel' : role === 'bidan' ? 'Bidan Panel' : 'Kader Panel'}
            </div>
          </div>
        )}
        {collapsed && <span style={{fontSize:22}}>❤️</span>}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8,
          width:28, height:28, cursor:'pointer', color:'rgba(255,255,255,0.6)',
          fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0
        }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Role badge — hanya tampil saat tidak collapsed */}
      {!collapsed && (
        <div style={{ padding:'10px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <span style={{
            padding:'4px 12px', borderRadius:20, fontSize:10, fontWeight:700,
            background:`${acc}22`, color: acc, border:`1px solid ${acc}44`
          }}>
            {{ admin:'👑 Administrator', bidan:'🩺 Bidan', kader:'🤝 Kader' }[role]}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
        {navItems.map(item => {
          const isActive = safeActive === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width:'100%', display:'flex', alignItems:'center',
              gap: collapsed ? 0 : 12,
              padding: collapsed ? '13px 0' : '11px 18px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
              border:'none', cursor:'pointer',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize:13, fontWeight: isActive ? 700 : 500, fontFamily:'inherit',
              transition:'all .15s', position:'relative', textAlign:'left',
            }}>
              {isActive && (
                <div style={{
                  position:'absolute', left:0, top:'18%', bottom:'18%',
                  width:3, background: acc, borderRadius:'0 3px 3px 0'
                }}/>
              )}
              <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize:13 }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info bottom */}
      <div style={{
        padding: collapsed ? '16px 0' : '14px 16px',
        borderTop:'1px solid rgba(255,255,255,0.08)',
        display:'flex', alignItems:'center', gap:10,
        justifyContent: collapsed ? 'center' : 'flex-start'
      }}>
        <div style={{
          width:34, height:34, borderRadius:'50%',
          background:`${acc}33`, display:'flex',
          alignItems:'center', justifyContent:'center',
          fontSize:16, flexShrink:0, border:`1px solid ${acc}44`
        }}>
          {{ admin:'👨‍⚕️', bidan:'👩‍⚕️', kader:'🧑‍🤝‍🧑' }[role] || '👤'}
        </div>
        {!collapsed && user && (
          <div style={{ minWidth:0 }}>
            <div style={{
              color:'#fff', fontSize:12, fontWeight:700,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
            }}>
              {user.nama}
            </div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, marginTop:1 }}>
              {user.posyandu}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Topbar ─────────────────────────────────────────────────────
export function Topbar({ pageTitle, user, onLogout }) {
  const [dropOpen, setDropOpen] = useState(false);
  const role = user?.role || 'kader';
  const acc  = ACCENT_COLOR[role] || '#4ADE80';
  const bg   = { admin:'#F0FDF4', bidan:'#EFF6FF', kader:'#FFF7ED' }[role] || '#F0FDF4';
  const tc   = { admin:'#15803D', bidan:'#1D4ED8', kader:'#C2410C' }[role] || '#15803D';

  const greet = () => {
    const h = new Date().getHours();
    if(h<11)return'Selamat Pagi';
    if(h<15)return'Selamat Siang';
    if(h<18)return'Selamat Sore';
    return'Selamat Malam';
  };

  return (
    <header style={{
      height:64, background:'#fff', borderBottom:'1px solid #F0F0F0',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 24px', flexShrink:0, position:'sticky', top:0, zIndex:9
    }}>
      <div>
        <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:'#1A1A1A' }}>{pageTitle}</h2>
        <div style={{ fontSize:11, color:'#9E9E9E', marginTop:1 }}>
          {greet()}, <strong style={{color:'#374151'}}>{user?.nama ?? 'Pengguna'}</strong>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button style={{
          background:'#F9FAFB', border:'1px solid #F0F0F0', borderRadius:10,
          width:38, height:38, cursor:'pointer', fontSize:16,
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative'
        }}>
          🔔
          <span style={{
            position:'absolute', top:7, right:7, width:8, height:8,
            background:'#EF4444', borderRadius:'50%', border:'2px solid #fff'
          }}/>
        </button>

        <div style={{ position:'relative' }}>
          <button onClick={() => setDropOpen(!dropOpen)} style={{
            background: bg, border:`1px solid ${acc}44`, borderRadius:10,
            padding:'7px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:8,
            fontFamily:'inherit'
          }}>
            <span style={{ fontSize:16 }}>
              {{ admin:'👨‍⚕️', bidan:'👩‍⚕️', kader:'🧑‍🤝‍🧑' }[role] || '👤'}
            </span>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:700, color: tc }}>
                {user?.nama?.split(' ').slice(0,2).join(' ')}
              </div>
              <div style={{ fontSize:9, color:'#9E9E9E', textTransform:'capitalize' }}>{role}</div>
            </div>
            <span style={{ fontSize:10, color:'#9E9E9E' }}>▼</span>
          </button>

          {dropOpen && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'#fff', border:'1px solid #F0F0F0', borderRadius:14,
              boxShadow:'0 10px 40px rgba(0,0,0,0.12)', width:220, zIndex:100, overflow:'hidden'
            }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #F9FAFB' }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{user?.nama}</div>
                <div style={{ fontSize:11, color:'#9E9E9E' }}>{user?.jabatan}</div>
                <div style={{ fontSize:10, color:'#9E9E9E', marginTop:2 }}>{user?.email}</div>
              </div>
              <div style={{ padding:'8px' }}>
                <button onClick={() => { setDropOpen(false); onLogout(); }} style={{
                  width:'100%', padding:'10px 12px', textAlign:'left', background:'#FEF2F2',
                  border:'none', borderRadius:8, cursor:'pointer', fontSize:13, color:'#DC2626',
                  fontFamily:'inherit', fontWeight:600,
                  display:'flex', alignItems:'center', gap:8
                }}>
                  🚪 Keluar dari Akun
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
