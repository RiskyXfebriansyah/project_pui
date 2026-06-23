// ============================================================
//  Sidebar — LAYOUT COMPONENT
//  Padanan: tidak ada di Flutter mobile (karena mobile pakai
//  BottomNavigationBar), tapi di web kita pakai Sidebar kiri
//
//  Ini seperti "shell" / kerangka tampilan web
// ============================================================

import React, { useState } from 'react';

const NAV_ITEMS = [
  { id:'dashboard',  icon:'📊', label:'Dashboard'          },
  { id:'balita',     icon:'👶', label:'Data Balita'         },
  { id:'pemantauan', icon:'📈', label:'Pemantauan'          },
  { id:'stunting',   icon:'⚠️', label:'Analisis Stunting'   },
  { id:'jadwal',     icon:'📅', label:'Jadwal'              },
  { id:'laporan',    icon:'📋', label:'Laporan'             },
  { id:'posyandu',   icon:'🏥', label:'Data Posyandu'       },
  { id:'pengguna',   icon:'👥', label:'Pengguna'            },
];

export function Sidebar({ active, onNav, user }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? 68 : 240, minHeight:'100vh',
      background:'#0D3D1E', display:'flex', flexDirection:'column',
      transition:'width .25s cubic-bezier(.4,0,.2,1)',
      flexShrink: 0, position:'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px',
        borderBottom:'1px solid rgba(255,255,255,0.08)',
        display:'flex', alignItems:'center', justifyContent: collapsed?'center':'space-between',
      }}>
        {!collapsed && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>❤️</span>
              <span style={{ color:'#fff', fontWeight:800, fontSize:15 }}>Posyandu</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, marginTop:2, paddingLeft:28 }}>
              Admin Web
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

      {/* Nav items */}
      <nav style={{ flex:1, padding:'12px 0', overflowY:'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width:'100%', display:'flex', alignItems:'center',
              gap: collapsed?0:12, padding: collapsed?'12px 0':'11px 18px',
              justifyContent: collapsed?'center':'flex-start',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              border:'none', cursor:'pointer', color: isActive?'#fff':'rgba(255,255,255,0.5)',
              fontSize:13, fontWeight: isActive?700:500, fontFamily:'inherit',
              transition:'all .15s', borderRadius:0, position:'relative',
              textAlign:'left',
            }}>
              {isActive && (
                <div style={{
                  position:'absolute', left:0, top:'20%', bottom:'20%',
                  width:3, background:'#4ADE80', borderRadius:'0 3px 3px 0'
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
        padding: collapsed?'16px 0':'16px', borderTop:'1px solid rgba(255,255,255,0.08)',
        display:'flex', alignItems:'center', gap:10, justifyContent:collapsed?'center':'flex-start'
      }}>
        <div style={{
          width:36, height:36, borderRadius:'50%',
          background:'rgba(255,255,255,0.15)', display:'flex',
          alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0
        }}>👤</div>
        {!collapsed && user && (
          <div style={{ minWidth:0 }}>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user.nama}
            </div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, marginTop:1 }}>
              {user.jabatan}
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
          {greet()}, <strong style={{color:'#374151'}}>{user?.nama ?? 'Admin'}</strong>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {/* Notification bell */}
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

        {/* Avatar + dropdown */}
        <div style={{ position:'relative' }}>
          <button onClick={() => setDropOpen(!dropOpen)} style={{
            background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10,
            padding:'6px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:8
          }}>
            <span style={{ fontSize:18 }}>👤</span>
            <span style={{ fontSize:12, fontWeight:600, color:'#15803D' }}>
              {user?.nama?.split(' ')[0]}
            </span>
            <span style={{ fontSize:10, color:'#9E9E9E' }}>▼</span>
          </button>

          {dropOpen && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'#fff', border:'1px solid #F0F0F0', borderRadius:14,
              boxShadow:'0 10px 40px rgba(0,0,0,0.12)', width:200, zIndex:100,
              overflow:'hidden'
            }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #F9FAFB' }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{user?.nama}</div>
                <div style={{ fontSize:11, color:'#9E9E9E' }}>{user?.jabatan}</div>
              </div>
              <button onClick={() => { setDropOpen(false); onLogout(); }} style={{
                width:'100%', padding:'12px 16px', textAlign:'left', background:'none',
                border:'none', cursor:'pointer', fontSize:13, color:'#DC2626',
                fontFamily:'inherit', fontWeight:600,
                display:'flex', alignItems:'center', gap:8
              }}>
                🚪 Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
