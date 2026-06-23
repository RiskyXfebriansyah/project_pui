// ============================================================
//  StuntingPage.jsx — Analisis Stunting
//  Fitur:
//  - 4 stat card (Total, Normal, Risiko, Stunting, Gizi Buruk)
//  - Donut chart distribusi status stunting
//  - Bar chart jumlah stunting per posyandu
//  - Tabel lengkap semua balita + filter status & search
//  - Status diambil dari DB (statusStunting field) ← tidak
//    bergantung pada riwayat[] yang sering kosong
// ============================================================
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { formatUmur, formatTanggal, hitungUmurBulan } from '../utils/helpers';

// ── Warna status ─────────────────────────────────────────────
const STATUS_COLOR = {
  'Normal':      { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', dot: '#16A34A' },
  'Risiko':      { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', dot: '#D97706' },
  'Stunting':    { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', dot: '#DC2626' },
  'Gizi Buruk':  { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', dot: '#BE123C' },
  'Gizi Kurang': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA', dot: '#EA580C' },
  'Gizi Baik':   { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', dot: '#16A34A' },
};

function sc(s) { return STATUS_COLOR[s] || { bg: '#F3F4F6', text: '#9E9E9E', border: '#E5E7EB', dot: '#9E9E9E' }; }

function StatusPill({ status }) {
  const c = sc(status);
  if (!status) return <span style={{ color: '#D1D5DB', fontSize: 11 }}>—</span>;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>{status}</span>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, total, color, icon, sub }) {
  const pct = total ? Math.round(value / total * 100) : 0;
  return (
    <div style={{
      flex: 1, minWidth: 150,
      background: '#fff',
      borderRadius: 16,
      border: `1px solid ${color}22`,
      padding: '20px 22px',
      boxShadow: `0 2px 12px ${color}11`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* accent bar kiri */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color, borderRadius: '16px 0 0 16px' }}/>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>
        {pct}% dari total{sub ? ` • ${sub}` : ''}
      </div>
      {/* background circle dekorasi */}
      <div style={{
        position: 'absolute', right: -18, bottom: -18,
        width: 72, height: 72, borderRadius: '50%',
        background: `${color}12`,
      }}/>
    </div>
  );
}

// ── Custom donut label ────────────────────────────────────────
function DonutLabel({ viewBox, value, label }) {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" fontSize={26} fontWeight={900} fill="#111">{value}</tspan>
      <tspan x={cx} dy={20} fontSize={11} fill="#9E9E9E">{label}</tspan>
    </text>
  );
}

// ── Custom tooltip chart ──────────────────────────────────────
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#111' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill }}/>
          <span style={{ color: '#6B7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: '#111' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function StuntingPage({ balitaList = [], statistik = {} }) {

  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [sortBy,       setSortBy]       = useState('nama'); // nama | umur | status

  // ── Statistik dari DB field (bukan riwayat[]) ───────────────
  const stats = useMemo(() => {
    const total    = balitaList.length;
    const stunting = balitaList.filter(b => b.statusStunting === 'Stunting').length;
    const risiko   = balitaList.filter(b => b.statusStunting === 'Risiko').length;
    const normal   = balitaList.filter(b => b.statusStunting === 'Normal').length;
    const belum    = balitaList.filter(b => !b.statusStunting).length;
    const giziKurang = balitaList.filter(b => ['Gizi Kurang','Gizi Buruk'].includes(b.statusGizi)).length;
    return { total, stunting, risiko, normal, belum, giziKurang };
  }, [balitaList]);

  // ── Data donut chart ────────────────────────────────────────
  const pieData = useMemo(() => [
    { name: 'Normal',  value: stats.normal,   color: '#16A34A' },
    { name: 'Risiko',  value: stats.risiko,   color: '#D97706' },
    { name: 'Stunting',value: stats.stunting, color: '#DC2626' },
    { name: 'Belum',   value: stats.belum,    color: '#E5E7EB' },
  ].filter(d => d.value > 0), [stats]);

  // ── Data bar chart per posyandu ─────────────────────────────
  const barData = useMemo(() => {
    const map = {};
    balitaList.forEach(b => {
      const key = b.namaPosyandu || 'Tidak diketahui';
      if (!map[key]) map[key] = { posyandu: key, Normal: 0, Risiko: 0, Stunting: 0, Belum: 0 };
      const s = b.statusStunting || 'Belum';
      if (map[key][s] !== undefined) map[key][s]++;
      else map[key]['Belum']++;
    });
    return Object.values(map).sort((a, b) => (b.Stunting + b.Risiko) - (a.Stunting + a.Risiko));
  }, [balitaList]);

  // ── Tabel: filter + sort ────────────────────────────────────
  const tabelData = useMemo(() => {
    let list = [...balitaList];

    // Filter status
    if (filterStatus !== 'Semua') {
      if (filterStatus === 'Belum diukur') {
        list = list.filter(b => !b.statusStunting);
      } else {
        list = list.filter(b => b.statusStunting === filterStatus);
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        (b.nama || '').toLowerCase().includes(q) ||
        (b.namaIbu || '').toLowerCase().includes(q) ||
        (b.namaPosyandu || '').toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'status') {
        const order = { Stunting: 0, Risiko: 1, 'Gizi Buruk': 2, 'Gizi Kurang': 3, Normal: 4, undefined: 5 };
        return (order[a.statusStunting] ?? 5) - (order[b.statusStunting] ?? 5);
      }
      if (sortBy === 'umur') return (b.umurBulan || 0) - (a.umurBulan || 0);
      return (a.nama || '').localeCompare(b.nama || '');
    });

    return list;
  }, [balitaList, filterStatus, search, sortBy]);

  const th = {
    padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#9E9E9E',
    background: '#F9FAFB', borderBottom: '2px solid #F0F0F0',
    textAlign: 'left', whiteSpace: 'nowrap', letterSpacing: '0.5px',
  };
  const td = { padding: '11px 14px', borderBottom: '1px solid #F9FAFB', fontSize: 12, verticalAlign: 'middle' };

  const FILTER_OPTIONS = ['Semua', 'Normal', 'Risiko', 'Stunting', 'Belum diukur'];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'inherit' }}>

      {/* ── ROW 1: Stat Cards ───────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Total Balita"   value={stats.total}    total={stats.total} color="#6366F1" icon="👶" sub={`${stats.belum} belum diukur`}/>
        <StatCard label="Normal"         value={stats.normal}   total={stats.total} color="#16A34A" icon="✅"/>
        <StatCard label="Risiko Stunting" value={stats.risiko}  total={stats.total} color="#D97706" icon="⚠️"/>
        <StatCard label="Stunting"       value={stats.stunting} total={stats.total} color="#DC2626" icon="🚨"/>
        <StatCard label="Gizi Kurang/Buruk" value={stats.giziKurang} total={stats.total} color="#BE123C" icon="📉"/>
      </div>

      {/* ── ROW 2: Charts ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>

        {/* Donut chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🍩 Distribusi Status</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                dataKey="value" paddingAngle={3}
              >
                {pieData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                <DonutLabel viewBox={{ cx: 0, cy: 0 }} value={stats.total} label="balita"/>
              </Pie>
              <ReTooltip formatter={(v, n) => [`${v} balita`, n]}/>
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 12, color: '#374151' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart per posyandu */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📊 Status per Posyandu</div>
          {barData.length === 0
            ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9E9E9E', fontSize: 13 }}>Belum ada data</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ left: -10, right: 8, top: 4, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="posyandu" tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <ReTooltip content={<CustomBarTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }}/>
                  <Bar dataKey="Normal"   fill="#16A34A" radius={[4,4,0,0]} maxBarSize={28}/>
                  <Bar dataKey="Risiko"   fill="#D97706" radius={[4,4,0,0]} maxBarSize={28}/>
                  <Bar dataKey="Stunting" fill="#DC2626" radius={[4,4,0,0]} maxBarSize={28}/>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* ── ROW 3: Tabel Lengkap ─────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

        {/* Header tabel */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14, marginRight: 4 }}>📋 Data Semua Balita</span>
          <span style={{ fontSize: 11, fontWeight: 700, background: '#F0F0F0', color: '#6B7280', padding: '2px 10px', borderRadius: 20 }}>
            {tabelData.length} dari {balitaList.length}
          </span>

          <div style={{ flex: 1 }}/>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E', fontSize: 12, pointerEvents: 'none' }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, ibu, posyandu..."
              style={{ padding: '7px 12px 7px 30px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 220 }}
              onFocus={e => e.target.style.borderColor = '#DC2626'}
              onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Filter status */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTER_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setFilterStatus(opt)} style={{
                padding: '6px 12px', borderRadius: 20, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                background: filterStatus === opt
                  ? (opt === 'Stunting' ? '#DC2626' : opt === 'Risiko' ? '#D97706' : opt === 'Normal' ? '#16A34A' : '#374151')
                  : '#F3F4F6',
                color: filterStatus === opt ? '#fff' : '#6B7280',
              }}>{opt}</button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            padding: '7px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB',
            fontSize: 11, fontFamily: 'inherit', background: '#F9FAFB', cursor: 'pointer', outline: 'none'
          }}>
            <option value="status">Urut: Status</option>
            <option value="nama">Urut: Nama</option>
            <option value="umur">Urut: Umur</option>
          </select>
        </div>

        {/* Tabel */}
        {tabelData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9E9E9E', fontSize: 13 }}>
            {filterStatus === 'Stunting' ? '🎉 Tidak ada balita stunting!' : '🔍 Tidak ditemukan'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['No','Nama','Umur','Posyandu','BB Terakhir','TB Terakhir','Status Stunting','Status Gizi'].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabelData.map((b, i) => {
                  const ss = b.statusStunting;
                  const sg = b.statusGizi;
                  const rowBg = ss === 'Stunting' ? '#FFF5F5' : ss === 'Risiko' ? '#FFFDF0' : '#fff';
                  return (
                    <tr key={b.id} style={{ background: i % 2 === 0 ? rowBg : (rowBg === '#fff' ? '#FAFAFA' : rowBg) }}>
                      <td style={{ ...td, color: '#BDBDBD', fontWeight: 600, width: 36 }}>{i + 1}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: b.jenisKelamin === 'Laki-laki' ? '#EFF6FF' : '#FDF2F8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                          }}>
                            {b.jenisKelamin === 'Laki-laki' ? '👦' : '👧'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#111' }}>{b.nama}</div>
                            <div style={{ fontSize: 10, color: '#9E9E9E' }}>{b.namaIbu || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{formatUmur(b.tanggalLahir)}</div>
                        <div style={{ fontSize: 10, color: '#9E9E9E' }}>{b.jenisKelamin}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{b.namaPosyandu || '-'}</div>
                        <div style={{ fontSize: 10, color: '#9E9E9E' }}>{b.desa || ''}</div>
                      </td>
                      <td style={{ ...td, fontWeight: 700, color: '#1B6B3A' }}>
                        {b.beratBadan ? `${b.beratBadan} kg` : <span style={{ color: '#D1D5DB' }}>—</span>}
                      </td>
                      <td style={{ ...td, fontWeight: 700, color: '#2563EB' }}>
                        {b.tinggiBadan ? `${b.tinggiBadan} cm` : <span style={{ color: '#D1D5DB' }}>—</span>}
                      </td>
                      <td style={td}><StatusPill status={ss}/></td>
                      <td style={td}><StatusPill status={sg}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}




// // StuntingPage.jsx — Coming Soon

// export default function StuntingPage() {
//   return (
//     <div style={{
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '70vh',
//       padding: 40,
//       fontFamily: 'inherit',
//     }}>
//       {/* Icon */}
//       <div style={{
//         width: 100,
//         height: 100,
//         borderRadius: '50%',
//         background: '#FEF2F2',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontSize: 48,
//         marginBottom: 24,
//       }}>
//         📊
//       </div>

//       {/* Title */}
//       <h2 style={{
//         margin: '0 0 10px',
//         fontSize: 28,
//         fontWeight: 800,
//         color: '#1A1A1A',
//       }}>
//         Coming Soon
//       </h2>

//       {/* Subtitle */}
//       <p style={{
//         margin: '0 0 28px',
//         fontSize: 14,
//         color: '#9E9E9E',
//         textAlign: 'center',
//         lineHeight: 1.6,
//         maxWidth: 320,
//       }}>
//         Fitur Analisis Stunting sedang dalam pengembangan. Segera hadir!
//       </p>

//       {/* Badge */}
//       <div style={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: 8,
//         padding: '10px 18px',
//         background: '#FEF2F2',
//         border: '1.5px solid #FECACA',
//         borderRadius: 12,
//       }}>
//         <span style={{ fontSize: 15 }}>ℹ️</span>
//         <span style={{
//           fontSize: 12,
//           fontWeight: 600,
//           color: '#DC2626',
//         }}>
//           Dalam pengembangan
//         </span>
//       </div>
//     </div>
//   );
// }