// ============================================================
//  PemantauanPage.jsx — standalone file
//  App.jsx: import PemantauanPage from './pages/PemantauanPage'
//
//  FITUR:
//  - Search/filter nama di sidebar
//  - Status stunting & gizi badge di sidebar
//  - Toggle: semua balita / hanya ≥2 pengukuran
//  - Tabel riwayat lengkap (BB, TB, LK, status, catatan)
//  - Multi-metrik: BB+TB sekaligus di satu grafik
//  - Ringkasan statistik + trend BB naik/turun
// ============================================================
import React, { useState, useMemo } from 'react';
import { Card, EmptyState, StatusBadge } from '../components/ui/Components';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatUmur, hitungUmurBulan, getStatusStunting, getStatusGizi, formatTanggal } from '../utils/helpers';

// ── helpers lokal ───────────────────────────────────────────────
function statusColor(s) {
  if (!s) return { bg: '#F3F4F6', text: '#9E9E9E', dot: '#D1D5DB' };
  if (s === 'Normal'   || s === 'Gizi Baik')   return { bg: '#F0FDF4', text: '#16A34A', dot: '#16A34A' };
  if (s === 'Risiko')                           return { bg: '#FFFBEB', text: '#D97706', dot: '#D97706' };
  if (s === 'Stunting' || s === 'Gizi Buruk')  return { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' };
  if (s === 'Gizi Kurang')                     return { bg: '#FFF7ED', text: '#EA580C', dot: '#EA580C' };
  return { bg: '#F3F4F6', text: '#6B7280', dot: '#9E9E9E' };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 10,
      padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', fontSize: 12
    }}>
      <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }}/>
          <span style={{ color: '#6B7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: '#1A1A1A' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────────────
function PemantauanPage({ balitaList }) {
  const [selected,  setSelected]  = useState(null);
  const [mode,      setMode]      = useState('single');
  const [singleKey, setSingleKey] = useState('bb');
  const [search,    setSearch]    = useState('');
  const [showAll,   setShowAll]   = useState(true);

  // ── filter sidebar ──────────────────────────────────────────
  const displayList = useMemo(() => {
    let list = showAll
      ? balitaList
      : balitaList.filter(b => b.riwayat?.length >= 2);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.nama?.toLowerCase().includes(q) ||
        b.namaIbu?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [balitaList, showAll, search]);

  // ── balita terpilih ─────────────────────────────────────────
  const b = useMemo(() => {
    if (selected) return balitaList.find(x => x.id === selected) || null;
    return displayList[0] || null;
  }, [selected, balitaList, displayList]);

  // ── status ──────────────────────────────────────────────────
  const bStatus = useMemo(() => {
    if (!b) return { stunting: null, gizi: null };
    const umur = hitungUmurBulan(b.tanggalLahir);
    const last  = b.riwayat?.[b.riwayat.length - 1];
    const stunting = b.statusStunting
      || (b.tinggiBadan
          ? getStatusStunting(b.tinggiBadan, umur, b.jenisKelamin)
          : last ? getStatusStunting(last.tb || last.tinggiBadan, umur, b.jenisKelamin) : null);
    const gizi = b.statusGizi
      || (b.beratBadan
          ? getStatusGizi(b.beratBadan, umur, b.jenisKelamin)
          : last ? getStatusGizi(last.bb || last.beratBadan, umur, b.jenisKelamin) : null);
    return { stunting, gizi };
  }, [b]);

  // ── grafik data ─────────────────────────────────────────────
  const grafikData = useMemo(() =>
    b?.riwayat?.map(p => ({
      tgl: formatTanggal(p.tanggal || p.tglUkur),
      bb:  parseFloat(p.bb  || p.beratBadan)    || null,
      tb:  parseFloat(p.tb  || p.tinggiBadan)   || null,
      lk:  parseFloat(p.lk  || p.lingkarKepala) || null,
    })) || [],
  [b]);

  // ── trend BB ────────────────────────────────────────────────
  const trendBB = useMemo(() => {
    if (!grafikData || grafikData.length < 2) return null;
    const last2 = grafikData.slice(-2);
    const diff  = (last2[1].bb || 0) - (last2[0].bb || 0);
    if (diff > 0) return { label: `+${diff.toFixed(2)} kg ↑`, color: '#16A34A' };
    if (diff < 0) return { label: `${diff.toFixed(2)} kg ↓`,  color: '#DC2626' };
    return { label: 'Stabil →', color: '#D97706' };
  }, [grafikData]);

  const METRICS = [
    { k: 'bb', l: 'BB (kg)',  c: '#1B6B3A' },
    { k: 'tb', l: 'TB (cm)',  c: '#2563EB' },
    { k: 'lk', l: 'LK (cm)', c: '#D97706' },
  ];

  const th = {
    padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#9E9E9E',
    background: '#F9FAFB', borderBottom: '1px solid #F0F0F0',
    textAlign: 'left', whiteSpace: 'nowrap'
  };
  const td = {
    padding: '8px 10px', borderBottom: '1px solid #F9FAFB',
    fontSize: 12, verticalAlign: 'middle'
  };

  return (
    <div style={{ padding: 24, fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 11, top: '50%',
              transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none'
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau ibu..."
              style={{
                width: '100%', padding: '9px 12px 9px 34px',
                borderRadius: 10, border: '1.5px solid #E5E7EB',
                fontSize: 12, fontFamily: 'inherit', outline: 'none',
                background: '#fff', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#1B6B3A'}
              onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Toggle ≥2 / Semua */}
          <div style={{
            display: 'flex', borderRadius: 8, overflow: 'hidden',
            border: '1.5px solid #E5E7EB', background: '#F9FAFB'
          }}>
            {[
              [false, `≥2 Ukur (${balitaList.filter(b => b.riwayat?.length >= 2).length})`],
              [true,  `Semua (${balitaList.length})`],
            ].map(([val, label]) => (
              <button key={String(val)} onClick={() => setShowAll(val)} style={{
                flex: 1, padding: '7px 4px', border: 'none', fontSize: 11,
                fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
                background: showAll === val ? '#1B6B3A' : 'transparent',
                color: showAll === val ? '#fff' : '#6B7280',
                transition: 'all 0.15s'
              }}>{label}</button>
            ))}
          </div>

          {/* Daftar balita */}
          <Card padding={10}>
            {displayList.length === 0
              ? <EmptyState emoji="🔍" message={search ? 'Tidak ditemukan' : 'Belum ada data'}/>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 520, overflowY: 'auto' }}>
                  {displayList.map(bl => {
                    const isActive = (selected || displayList[0]?.id) === bl.id;
                    const umur     = hitungUmurBulan(bl.tanggalLahir);
                    const last     = bl.riwayat?.[bl.riwayat.length - 1];
                    const ss       = bl.statusStunting
                      || (last ? getStatusStunting(last.tb || last.tinggiBadan, umur, bl.jenisKelamin) : null);
                    const sc       = statusColor(ss);
                    const jmlUkur  = bl.riwayat?.length || 0;
                    return (
                      <button key={bl.id} onClick={() => setSelected(bl.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px', borderRadius: 10, width: '100%',
                        border: `1.5px solid ${isActive ? '#1B6B3A' : '#F0F0F0'}`,
                        background: isActive ? '#F0FDF4' : '#fff',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'all 0.12s'
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: bl.jenisKelamin === 'Laki-laki' ? '#EFF6FF' : '#FDF2F8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>
                          {bl.jenisKelamin === 'Laki-laki' ? '👦' : '👧'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {bl.nama}
                          </div>
                          <div style={{ fontSize: 10, color: '#9E9E9E' }}>
                            {formatUmur(bl.tanggalLahir)} • {jmlUkur}x ukur
                          </div>
                        </div>
                        {ss && (
                          <div style={{
                            padding: '2px 7px', borderRadius: 6, fontSize: 9,
                            fontWeight: 700, background: sc.bg, color: sc.text,
                            whiteSpace: 'nowrap', flexShrink: 0
                          }}>{ss}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )
            }
          </Card>
        </div>

        {/* ── KONTEN UTAMA ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!b ? (
            <Card><EmptyState emoji="📊" message="Pilih balita untuk melihat riwayat pengukuran"/></Card>
          ) : (
            <>
              {/* ── Card Grafik ──────────────────────────────────── */}
              <Card>
                {/* Header balita */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: b.jenisKelamin === 'Laki-laki' ? '#EFF6FF' : '#FDF2F8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
                  }}>
                    {b.jenisKelamin === 'Laki-laki' ? '👦' : '👧'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{b.nama}</div>
                    <div style={{ fontSize: 12, color: '#9E9E9E' }}>
                      {formatUmur(b.tanggalLahir)} • {b.jenisKelamin} • {b.namaPosyandu || b.posyandu || '-'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {bStatus.stunting && <StatusBadge status={bStatus.stunting}/>}
                    {bStatus.gizi     && <StatusBadge status={bStatus.gizi}/>}
                  </div>
                </div>

                {/* 4 kotak ringkasan */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    ['Total Ukur', `${b.riwayat?.length || 0}x`, '#1B6B3A', '📏'],
                    [
                      'BB Terakhir',
                      b.beratBadan
                        ? `${b.beratBadan} kg`
                        : b.riwayat?.length
                          ? `${b.riwayat[b.riwayat.length-1].bb || b.riwayat[b.riwayat.length-1].beratBadan} kg`
                          : '-',
                      '#2563EB', '⚖️'
                    ],
                    [
                      'TB Terakhir',
                      b.tinggiBadan
                        ? `${b.tinggiBadan} cm`
                        : b.riwayat?.length
                          ? `${b.riwayat[b.riwayat.length-1].tb || b.riwayat[b.riwayat.length-1].tinggiBadan} cm`
                          : '-',
                      '#7C3AED', '📐'
                    ],
                    ['Trend BB', trendBB?.label || '-', trendBB?.color || '#9E9E9E', '📈'],
                  ].map(([l, v, c, ico]) => (
                    <div key={l} style={{
                      padding: '12px', background: `${c}08`,
                      borderRadius: 10, border: `1px solid ${c}18`, textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 16, marginBottom: 4 }}>{ico}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                      <div style={{ fontSize: 10, color: '#9E9E9E', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Kontrol grafik */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setMode('single')} style={{
                      padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                      background: mode === 'single' ? '#1F2937' : '#F3F4F6',
                      color: mode === 'single' ? '#fff' : '#6B7280'
                    }}>Satu metrik</button>
                    <button onClick={() => setMode('multi')} style={{
                      padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                      background: mode === 'multi' ? '#1F2937' : '#F3F4F6',
                      color: mode === 'multi' ? '#fff' : '#6B7280'
                    }}>BB + TB</button>
                  </div>
                  {mode === 'single' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {METRICS.map(m => (
                        <button key={m.k} onClick={() => setSingleKey(m.k)} style={{
                          padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                          background: singleKey === m.k ? m.c : '#F3F4F6',
                          color: singleKey === m.k ? '#fff' : '#6B7280'
                        }}>{m.l}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grafik */}
                {grafikData.length < 1 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#9E9E9E', fontSize: 13 }}>
                    Belum ada data pengukuran untuk grafik
                  </div>
                ) : grafikData.length < 2 ? (
                  <div style={{
                    padding: '14px 18px', background: '#FFFBEB', borderRadius: 10,
                    border: '1px solid #FDE68A', fontSize: 12, color: '#D97706', textAlign: 'center'
                  }}>
                    ⚠️ Grafik membutuhkan minimal 2 data pengukuran. Saat ini baru {grafikData.length}x.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={grafikData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0"/>
                      <XAxis dataKey="tgl" tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 10, fill: '#9E9E9E' }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      {mode === 'multi' && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}/>}
                      {mode === 'single' ? (
                        <Line
                          type="monotone"
                          dataKey={singleKey}
                          name={METRICS.find(m => m.k === singleKey)?.l}
                          stroke={METRICS.find(m => m.k === singleKey)?.c}
                          strokeWidth={2.5}
                          dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: METRICS.find(m => m.k === singleKey)?.c }}
                          activeDot={{ r: 7 }}
                          connectNulls
                        />
                      ) : (
                        <>
                          <Line type="monotone" dataKey="bb" name="BB (kg)" stroke="#1B6B3A" strokeWidth={2.5}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#1B6B3A' }} activeDot={{ r: 6 }} connectNulls/>
                          <Line type="monotone" dataKey="tb" name="TB (cm)" stroke="#2563EB" strokeWidth={2.5}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#2563EB' }} activeDot={{ r: 6 }} connectNulls/>
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* ── Tabel Riwayat ─────────────────────────────────── */}
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  📋 Riwayat Pengukuran
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 700,
                    background: '#F0FDF4', color: '#16A34A',
                    padding: '2px 10px', borderRadius: 20
                  }}>
                    {b.riwayat?.length || 0} data
                  </span>
                </div>

                {!b.riwayat?.length ? (
                  <EmptyState emoji="📭" message="Belum ada riwayat pengukuran"/>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr>
                          {['No','Tanggal','BB (kg)','TB (cm)','LK (cm)','Status Stunting','Status Gizi','Catatan'].map(h => (
                            <th key={h} style={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...b.riwayat].reverse().map((p, i, arr) => {
                          const umur   = hitungUmurBulan(b.tanggalLahir);
                          const bb     = parseFloat(p.bb  || p.beratBadan)    || null;
                          const tb     = parseFloat(p.tb  || p.tinggiBadan)   || null;
                          const lk     = parseFloat(p.lk  || p.lingkarKepala) || null;
                          const pss    = p.statusStunting || (tb ? getStatusStunting(tb, umur, b.jenisKelamin) : null);
                          const psg    = p.statusGizi     || (bb ? getStatusGizi(bb, umur, b.jenisKelamin)     : null);
                          const prevBB = arr[i + 1] ? parseFloat(arr[i + 1].bb || arr[i + 1].beratBadan) : null;
                          const bbDiff = (bb && prevBB) ? bb - prevBB : null;
                          return (
                            <tr key={p.id || i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                              <td style={{ ...td, color: '#9E9E9E', fontWeight: 600 }}>{arr.length - i}</td>
                              <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {formatTanggal(p.tanggal || p.tglUkur)}
                              </td>
                              <td style={td}>
                                <div style={{ fontWeight: 700 }}>{bb ?? '-'}</div>
                                {bbDiff !== null && (
                                  <div style={{ fontSize: 10, fontWeight: 600, color: bbDiff > 0 ? '#16A34A' : bbDiff < 0 ? '#DC2626' : '#D97706' }}>
                                    {bbDiff > 0 ? `+${bbDiff.toFixed(2)}` : bbDiff.toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td style={{ ...td, fontWeight: 700 }}>{tb ?? '-'}</td>
                              <td style={{ ...td, fontWeight: 700 }}>{lk ?? '-'}</td>
                              <td style={td}>{pss ? <StatusBadge status={pss}/> : <span style={{ color: '#D1D5DB' }}>-</span>}</td>
                              <td style={td}>{psg ? <StatusBadge status={psg}/> : <span style={{ color: '#D1D5DB' }}>-</span>}</td>
                              <td style={{ ...td, color: '#6B7280', maxWidth: 180 }}>
                                {p.catatan || <span style={{ color: '#D1D5DB' }}>-</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DEFAULT EXPORT ─────────────────────────────────────────────
// App.jsx: import PemantauanPage from './pages/PemantauanPage' ✅
export default PemantauanPage;