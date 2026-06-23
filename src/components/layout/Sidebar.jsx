// ============================================================
//  POSYANDU DIGITAL — Full Layout App
//  Stack  : React (tanpa dependency icon tambahan)
//  Icon   : Emoji native — tidak perlu install library apapun
//  Fitur  :
//  - Sidebar role-based (Admin / Bidan / Kader)
//  - Animated rail mengikuti menu aktif
//  - Badge dinamis dari API (useSummaryStats hook)
//  - Collapsible sidebar dengan tooltip
//  - Topbar dengan greeting + dropdown user
//  - Dark themed sidebar, light content area
// ============================================================
//
//  SETUP: Tidak perlu install apapun, langsung pakai.
//
//  API ENDPOINT yang dibutuhkan:
//  GET /api/stats/summary
//  Response: { total_balita: 247, kasus_stunting: 12, jadwal_hari_ini: 3 }
//
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── Konfigurasi Menu ──────────────────────────────────────────
const ALL_NAV = [
  {
    section: 'Utama',
    items: [
      {
        id: 'dashboard',
        icon: '📊',
        label: 'Dashboard',
        roles: ['admin', 'bidan', 'kader'],
      },
      {
        id: 'balita',
        icon: '👶',
        label: 'Data Balita',
        roles: ['admin', 'bidan', 'kader'],
        badgeKey: 'total_balita',        // key dari response API
      },
      {
        id: 'pemantauan',
        icon: '📈',
        label: 'Pemantauan',
        roles: ['admin', 'bidan', 'kader'],
      },
    ],
  },
  {
    section: 'Kesehatan',
    items: [
      {
        id: 'stunting',
        icon: '⚠️',
        label: 'Analisis Stunting',
        roles: ['admin', 'bidan'],
        badgeKey: 'kasus_stunting',      // key dari response API
        badgeWarn: true,                 // badge merah/oranye (warning)
      },
      {
        id: 'jadwal',
        icon: '📅',
        label: 'Jadwal',
        roles: ['admin', 'bidan', 'kader'],
        badgeKey: 'jadwal_hari_ini',
      },
      {
        id: 'laporan',
        icon: '📋',
        label: 'Laporan',
        roles: ['admin', 'bidan'],
      },
    ],
  },
  {
    section: 'Administrasi',
    items: [
      {
        id: 'posyandu',
        icon: '🏥',
        label: 'Data Posyandu',
        roles: ['admin'],
      },
      {
        id: 'pengguna',
        icon: '👥',
        label: 'Pengguna',
        roles: ['admin'],
      },
    ],
  },
];

// Judul halaman per ID
const PAGE_TITLES = {
  dashboard:  'Dashboard',
  balita:     'Data Balita',
  pemantauan: 'Pemantauan Tumbuh Kembang',
  stunting:   'Analisis Stunting',
  jadwal:     'Jadwal Posyandu',
  laporan:    'Laporan',
  posyandu:   'Data Posyandu',
  pengguna:   'Manajemen Pengguna',
};

// ── Tema per Role ─────────────────────────────────────────────
const ROLE_META = {
  admin: {
    bg:         '#0b1f10',
    rail:       '#1e4a24',
    accent:     '#4ADE80',
    chip:       { bg: '#132a17', border: '#2a5232', text: '#86efac' },
    roleIcon:   '👑',
    roleLabel:  'Administrator',
    avatar:     '#1a3d20',
    avBorder:   '#2d5e35',
    userCard:   '#111f14',
    ucBorder:   '#1e3822',
    iconBox:    { bg: '#0f2614', border: '#1e4022' },
    iconBoxOn:  { bg: '#1e4a24', border: '#2d6b35' },
    sectionClr: 'rgba(240,253,244,.22)',
    textMuted:  'rgba(240,253,244,.38)',
    textActive: '#f0fdf4',
    hoverBg:    '#16301b',
    activeBg:   '#163620',
    divider:    '#162b1b',
    badge:      { bg: '#152d1a', text: '#4ADE80', border: '#1e4a22' },
    badgeWarn:  { bg: '#2a1a0c', text: '#FB923C', border: '#4a2d12' },
    topbarAccent: '#15803D',
    topbarBg:   '#F0FDF4',
    avatarEmoji:'👨‍⚕️',
  },
  bidan: {
    bg:         '#0c1e35',
    rail:       '#1a3a5c',
    accent:     '#60A5FA',
    chip:       { bg: '#0f2540', border: '#1e3d65', text: '#93c5fd' },
    roleIcon:   '🩺',
    roleLabel:  'Bidan',
    avatar:     '#122040',
    avBorder:   '#1e4080',
    userCard:   '#0d1a2e',
    ucBorder:   '#1a3050',
    iconBox:    { bg: '#0a1828', border: '#152e50' },
    iconBoxOn:  { bg: '#1a3a5c', border: '#2255a0' },
    sectionClr: 'rgba(239,246,255,.22)',
    textMuted:  'rgba(239,246,255,.38)',
    textActive: '#eff6ff',
    hoverBg:    '#12274a',
    activeBg:   '#152d5c',
    divider:    '#12243a',
    badge:      { bg: '#0f2240', text: '#60A5FA', border: '#1a3d80' },
    badgeWarn:  { bg: '#2a1a0c', text: '#FB923C', border: '#4a2d12' },
    topbarAccent: '#1D4ED8',
    topbarBg:   '#EFF6FF',
    avatarEmoji:'👩‍⚕️',
  },
  kader: {
    bg:         '#1f1208',
    rail:       '#4a2d12',
    accent:     '#FB923C',
    chip:       { bg: '#2a1a0c', border: '#4a2d12', text: '#fdba74' },
    roleIcon:   '🤝',
    roleLabel:  'Kader',
    avatar:     '#3a2010',
    avBorder:   '#6a3a18',
    userCard:   '#1a1008',
    ucBorder:   '#3a2010',
    iconBox:    { bg: '#180e04', border: '#3a2010' },
    iconBoxOn:  { bg: '#4a2d12', border: '#7a4a20' },
    sectionClr: 'rgba(255,247,237,.22)',
    textMuted:  'rgba(255,247,237,.38)',
    textActive: '#fff7ed',
    hoverBg:    '#2a1a0a',
    activeBg:   '#3a2010',
    divider:    '#2a1a08',
    badge:      { bg: '#3a2010', text: '#FB923C', border: '#6a3a18' },
    badgeWarn:  { bg: '#2a1a0c', text: '#ef4444', border: '#4a1a12' },
    topbarAccent: '#C2410C',
    topbarBg:   '#FFF7ED',
    avatarEmoji:'🧑‍🤝‍🧑',
  },
};

// ── Hook: ambil stats dari API ────────────────────────────────
// Ganti URL '/api/stats/summary' dengan endpoint backend kamu
function useSummaryStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoading(true);
        // ── Ganti ini dengan fetch ke backend asli ──────────
        // const res = await fetch('/api/stats/summary');
        // if (!res.ok) throw new Error('Gagal memuat data');
        // const data = await res.json();
        // ── Simulasi API response (hapus saat production) ───
        await new Promise(r => setTimeout(r, 800)); // simulasi delay network
        const data = {
          total_balita:    247,
          kasus_stunting:  12,
          jadwal_hari_ini: 3,
        };
        // ────────────────────────────────────────────────────
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();

    // Refresh setiap 5 menit
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { stats, loading, error };
}

// ── Tooltip untuk collapsed sidebar ──────────────────────────
function Tooltip({ label, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
      transform: 'translateY(-50%)', background: '#1a1a1a',
      color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 10px',
      borderRadius: 7, whiteSpace: 'nowrap', pointerEvents: 'none',
      zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      {label}
      <div style={{
        position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
        borderWidth: '4px', borderStyle: 'solid',
        borderColor: 'transparent #1a1a1a transparent transparent',
      }} />
    </div>
  );
}

// ── Komponen Sidebar ──────────────────────────────────────────
export function Sidebar({ active, onNav, onLogout, user, stats, statsLoading }) {
  const role      = user?.role || 'kader';
  const m         = ROLE_META[role] || ROLE_META.kader;
  const navRef    = useRef(null);
  const [railTop, setRailTop]       = useState(14);
  const [collapsed, setCollapsed]   = useState(false);
  const [tooltip, setTooltip]       = useState(null); // id item yg di-hover saat collapsed

  // Filter menu sesuai role
  const visibleGroups = ALL_NAV
    .map(g => ({ ...g, items: g.items.filter(it => it.roles.includes(role)) }))
    .filter(g => g.items.length > 0);
  const allItems  = visibleGroups.flatMap(g => g.items);
  const safeActive = allItems.find(n => n.id === active) ? active : allItems[0]?.id;

  // Inisial nama untuk avatar
  const initials = user?.nama
    ? user.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'US';

  // Gerakkan rail ke posisi item aktif
  useEffect(() => {
    if (!navRef.current) return;
    const btn = navRef.current.querySelector(`[data-navid="${safeActive}"]`);
    if (btn) {
      const navTop = navRef.current.getBoundingClientRect().top;
      const btnRect = btn.getBoundingClientRect();
      const center = btnRect.top - navTop + navRef.current.scrollTop + btnRect.height / 2 - 20;
      setRailTop(center);
    }
  }, [safeActive, collapsed]);

  const sidebarWidth = collapsed ? 64 : 230;

  return (
    <aside style={{
      width:       sidebarWidth,
      minHeight:   '100vh',
      background:  m.bg,
      display:     'flex',
      flexDirection:'column',
      flexShrink:  0,
      position:    'relative',
      overflow:    'hidden',
      transition:  'width .25s cubic-bezier(.4,0,.2,1)',
    }}>
      {/* Ornamen lingkaran pojok kanan atas */}
      <div style={{
        position: 'absolute', top: -48, right: -48,
        width: 130, height: 130, borderRadius: '50%',
        border: `1px solid ${m.accent}1a`, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', inset: 16, borderRadius: '50%',
          border: `1px solid ${m.accent}10`,
        }} />
      </div>

      {/* Rail background */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: m.rail,
      }} />
      {/* Rail aktif — animasi gerak */}
      <div style={{
        position: 'absolute', left: 0, width: 3, height: 40,
        background: m.accent, borderRadius: '0 3px 3px 0',
        top: railTop,
        transition: 'top .22s cubic-bezier(.4,0,.2,1)',
      }} />

      {/* Header: Logo + tombol collapse */}
      <div style={{
        padding: collapsed ? '18px 0 14px' : '20px 18px 14px 20px',
        position: 'relative',
        borderBottom: `1px solid ${m.divider}`,
        display: 'flex',
        alignItems: collapsed ? 'center' : 'flex-start',
        flexDirection: collapsed ? 'column' : 'column',
        gap: collapsed ? 10 : 0,
      }}>
        {/* Tombol collapse — pojok kanan atas header */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            position: 'absolute', top: 12, right: 10,
            width: 24, height: 24, borderRadius: 7,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid rgba(255,255,255,0.08)`,
            color: 'rgba(255,255,255,0.35)', fontSize: 11,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}
          title={collapsed ? 'Buka sidebar' : 'Perkecil sidebar'}
        >
          <span style={{ lineHeight: 1 }}>{collapsed ? '→' : '←'}</span>
        </button>

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 11,
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%',
          marginBottom: collapsed ? 0 : 13,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: m.iconBox.bg, border: `1px solid ${m.iconBox.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            ❤️
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#f0fdf4', fontSize: 15, fontWeight: 800, letterSpacing: -.4 }}>
                Posyandu
              </div>
              <div style={{ color: 'rgba(240,253,244,.3)', fontSize: 9, letterSpacing: .6, textTransform: 'uppercase', marginTop: 2 }}>
                Digital
              </div>
            </div>
          )}
        </div>

        {/* Role chip — sembunyikan saat collapsed */}
        {!collapsed && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: m.chip.bg, border: `1px solid ${m.chip.border}`,
            borderRadius: 8, padding: '5px 10px',
            color: m.chip.text, fontSize: 10, fontWeight: 700,
          }}>
            <span style={{ fontSize: 12, lineHeight: 1 }}>{m.roleIcon}</span>
            {m.roleLabel}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav
        ref={navRef}
        style={{
          flex: 1,
          padding: collapsed ? '8px 6px' : '8px 10px 8px 13px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {visibleGroups.map(group => (
          <div key={group.section}>
            {/* Section label */}
            {!collapsed && (
              <div style={{
                color: m.sectionClr, fontSize: 9, fontWeight: 700,
                letterSpacing: 1.3, textTransform: 'uppercase',
                padding: '12px 6px 5px',
              }}>
                {group.section}
              </div>
            )}
            {collapsed && <div style={{ height: 8 }} />}

            {group.items.map(item => {
              const isActive  = safeActive === item.id;
              const badgeVal  = item.badgeKey && stats ? stats[item.badgeKey] : null;
              const showBadge = badgeVal != null && !statsLoading;
              const bm        = item.badgeWarn ? m.badgeWarn : m.badge;

              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <button
                    data-navid={item.id}
                    onClick={() => onNav(item.id)}
                    onMouseEnter={() => collapsed && setTooltip(item.id)}
                    onMouseLeave={() => collapsed && setTooltip(null)}
                    style={{
                      display:       'flex',
                      alignItems:    'center',
                      gap:           collapsed ? 0 : 11,
                      width:         '100%',
                      padding:       collapsed ? '10px 0' : '9px 10px',
                      border:        'none',
                      borderRadius:  10,
                      background:    isActive ? m.activeBg : 'transparent',
                      cursor:        'pointer',
                      color:         isActive ? m.textActive : m.textMuted,
                      fontSize:      12.5,
                      fontFamily:    'inherit',
                      fontWeight:    isActive ? 700 : 500,
                      textAlign:     'left',
                      marginBottom:  1,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      transition:    'background .1s, color .1s',
                      position:      'relative',
                    }}
                    onMouseOver={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = m.hoverBg;
                        e.currentTarget.style.color = 'rgba(240,253,244,.75)';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = m.textMuted;
                      }
                    }}
                  >
                    {/* Icon box */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, position: 'relative',
                      background: isActive ? m.iconBoxOn.bg : m.iconBox.bg,
                      border: `1px solid ${isActive ? m.iconBoxOn.border : m.iconBox.border}`,
                      transition: 'all .1s',
                    }}>
                      <span style={{ lineHeight: 1 }}>{item.icon}</span>
                      {/* Dot badge saat collapsed */}
                      {collapsed && showBadge && (
                        <span style={{
                          position: 'absolute', top: -3, right: -3,
                          width: 8, height: 8, borderRadius: '50%',
                          background: item.badgeWarn ? '#ef4444' : m.accent,
                          border: `1.5px solid ${m.bg}`,
                        }} />
                      )}
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}

                    {/* Badge count (hanya saat expanded) */}
                    {!collapsed && showBadge && (
                      <span style={{
                        minWidth: 20, height: 18, borderRadius: 5,
                        fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 5px',
                        background: bm.bg, color: bm.text,
                        border: `1px solid ${bm.border}`,
                        flexShrink: 0,
                      }}>
                        {badgeVal}
                      </span>
                    )}

                    {/* Badge loading skeleton */}
                    {!collapsed && item.badgeKey && statsLoading && (
                      <span style={{
                        width: 24, height: 14, borderRadius: 4,
                        background: 'rgba(255,255,255,0.06)',
                        flexShrink: 0,
                      }} />
                    )}
                  </button>

                  {/* Tooltip saat collapsed */}
                  <Tooltip label={item.label} visible={collapsed && tooltip === item.id} />
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card bawah */}
      <div style={{
        margin: collapsed ? '8px 6px 10px' : '8px 12px 12px',
        borderRadius: 12,
        background: m.userCard,
        border: `1px solid ${m.ucBorder}`,
        padding: collapsed ? '10px 0' : '10px 12px',
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: m.avatar, border: `1px solid ${m.avBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: m.accent, fontSize: 12, fontWeight: 800,
        }}>
          {initials}
        </div>

        {/* Info user */}
        {!collapsed && user && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              color: '#e4fce8', fontSize: 11, fontWeight: 700,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.nama}
            </div>
            <div style={{ color: 'rgba(240,253,244,.28)', fontSize: 9, marginTop: 2 }}>
              {user.posyandu}
            </div>
          </div>
        )}

        {/* Tombol logout (hanya saat expanded) */}
        {!collapsed && (
          <button
            onClick={onLogout}
            aria-label="Keluar"
            style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'transparent',
              border: `1px solid ${m.ucBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(240,253,244,.28)', fontSize: 14, cursor: 'pointer',
              transition: 'all .1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,.15)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(240,253,244,.28)';
              e.currentTarget.style.borderColor = m.ucBorder;
            }}
          >
            <span style={{ lineHeight: 1 }}>🚪</span>
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Komponen Topbar ───────────────────────────────────────────
export function Topbar({ pageTitle, user, onLogout, notifCount = 0 }) {
  const [dropOpen, setDropOpen] = useState(false);
  const role = user?.role || 'kader';
  const m    = ROLE_META[role] || ROLE_META.kader;
  const dropRef = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #F0F0F0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 9,
    }}>
      {/* Judul halaman */}
      <div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>
          {pageTitle}
        </h2>
        <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 1 }}>
          {greet()},{' '}
          <strong style={{ color: '#374151' }}>
            {user?.nama ?? 'Pengguna'}
          </strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Tombol notifikasi */}
        <button style={{
          background: '#F9FAFB', border: '1px solid #F0F0F0', borderRadius: 10,
          width: 38, height: 38, cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', color: '#374151',
        }}>
          🔔
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: 7, right: 7, width: 8, height: 8,
              background: '#EF4444', borderRadius: '50%', border: '2px solid #fff',
            }} />
          )}
        </button>

        {/* Dropdown user */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropOpen(d => !d)}
            style={{
              background: m.topbarBg, border: `1px solid ${m.accent}44`,
              borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 16 }}>{m.avatarEmoji}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: m.topbarAccent }}>
                {user?.nama?.split(' ').slice(0, 2).join(' ')}
              </div>
              <div style={{ fontSize: 9, color: '#9E9E9E', textTransform: 'capitalize' }}>
                {role}
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#9E9E9E' }}>▼</span>
          </button>

          {/* Dropdown panel */}
          {dropOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14,
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)', width: 220,
              zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.nama}</div>
                <div style={{ fontSize: 11, color: '#9E9E9E' }}>{user?.jabatan}</div>
                <div style={{ fontSize: 10, color: '#9E9E9E', marginTop: 2 }}>{user?.email}</div>
              </div>
              <div style={{ padding: '8px' }}>
                <button
                  onClick={() => { setDropOpen(false); }}
                  style={{
                    width: '100%', padding: '9px 12px', textAlign: 'left',
                    background: '#F9FAFB', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontSize: 12, color: '#374151',
                    fontFamily: 'inherit', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                  }}
                >
                  <span>👤</span>
                  Profil Saya
                </button>
                <button
                  onClick={() => { setDropOpen(false); }}
                  style={{
                    width: '100%', padding: '9px 12px', textAlign: 'left',
                    background: '#F9FAFB', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontSize: 12, color: '#374151',
                    fontFamily: 'inherit', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                  }}
                >
                  <span>⚙️</span>
                  Pengaturan
                </button>
                <button
                  onClick={() => { setDropOpen(false); onLogout(); }}
                  style={{
                    width: '100%', padding: '9px 12px', textAlign: 'left',
                    background: '#FEF2F2', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontSize: 12, color: '#DC2626',
                    fontFamily: 'inherit', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span>🚪</span>
                  Keluar dari Akun
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Konten placeholder per halaman ───────────────────────────
function PageContent({ pageId, stats, statsLoading }) {
  const cards = [
    { label: 'Total Balita', key: 'total_balita', icon: '👶', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Kasus Stunting', key: 'kasus_stunting', icon: '⚠️', color: '#ea580c', bg: '#fff7ed' },
    { label: 'Jadwal Hari Ini', key: 'jadwal_hari_ini', icon: '📅', color: '#2563eb', bg: '#eff6ff' },
  ];

  return (
    <div style={{ padding: 28 }}>
      {/* Stat cards — hanya di dashboard */}
      {pageId === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {cards.map(c => (
            <div key={c.key} style={{
              background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14,
              padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: c.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: c.color, fontSize: 22, flexShrink: 0,
              }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{c.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#9E9E9E', fontWeight: 500 }}>{c.label}</div>
                {statsLoading ? (
                  <div style={{ width: 48, height: 20, borderRadius: 4, background: '#F0F0F0', marginTop: 4 }} />
                ) : (
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.2, marginTop: 2 }}>
                    {stats?.[c.key] ?? '—'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder konten halaman */}
      <div style={{
        background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14,
        padding: 32, textAlign: 'center', color: '#C0C0C0',
      }}>
        <span style={{ fontSize: 40, display: 'block', marginBottom: 12, lineHeight: 1 }}>🗂️</span>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          Konten halaman <strong style={{ color: '#374151' }}>{PAGE_TITLES[pageId]}</strong>
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Sambungkan komponen sesuai kebutuhan</div>
      </div>
    </div>
  );
}

// ── App utama ─────────────────────────────────────────────────
// Data user ini biasanya dari context auth / store Redux / Zustand
// Ganti dengan user yang sedang login
const DEMO_USERS = {
  admin: {
    nama:     'Dr. Siti Rahayu',
    jabatan:  'Dokter Umum',
    email:    'siti.rahayu@posyandu.id',
    posyandu: 'Posyandu Melati',
    role:     'admin',
  },
  bidan: {
    nama:     'Nurul Hidayah, A.Md.Keb',
    jabatan:  'Bidan Desa',
    email:    'nurul@posyandu.id',
    posyandu: 'Posyandu Mawar',
    role:     'bidan',
  },
  kader: {
    nama:     'Ibu Fatimah Zahro',
    jabatan:  'Kader Aktif',
    email:    'fatimah@posyandu.id',
    posyandu: 'Posyandu Anggrek',
    role:     'kader',
  },
};

export default function App() {
  const [currentRole, setCurrentRole] = useState('admin');
  const [activePage, setActivePage]   = useState('dashboard');
  const { stats, loading: statsLoading } = useSummaryStats();
  const user = DEMO_USERS[currentRole];

  const handleLogout = useCallback(() => {
    // Ganti dengan logic logout: clear token, redirect ke /login, dll
    alert('Logout berhasil. Redirect ke halaman login.');
  }, []);

  const handleNav = useCallback((pageId) => {
    setActivePage(pageId);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <Sidebar
        active={activePage}
        onNav={handleNav}
        onLogout={handleLogout}
        user={user}
        stats={stats}
        statsLoading={statsLoading}
      />

      {/* Area konten utama */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          pageTitle={PAGE_TITLES[activePage] ?? 'Halaman'}
          user={user}
          onLogout={handleLogout}
          notifCount={3}
        />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <PageContent pageId={activePage} stats={stats} statsLoading={statsLoading} />
        </main>
      </div>

      {/* Role switcher — HAPUS di production, hanya untuk demo */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20,
        background: '#fff', border: '1px solid #E0E0E0', borderRadius: 12,
        padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ fontSize: 9, color: '#9E9E9E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
          Demo: Ganti Role
        </div>
        {['admin', 'bidan', 'kader'].map(r => (
          <button
            key={r}
            onClick={() => { setCurrentRole(r); setActivePage('dashboard'); }}
            style={{
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              background: currentRole === r ? ROLE_META[r].accent + '22' : '#F9FAFB',
              color: currentRole === r ? ROLE_META[r].topbarAccent : '#374151',
              border: currentRole === r ? `1px solid ${ROLE_META[r].accent}55` : '1px solid #E0E0E0',
            }}
          >
            {ROLE_META[r].roleLabel}
          </button>
        ))}
      </div>
    </div>
  );
}