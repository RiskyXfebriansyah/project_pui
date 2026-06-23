// ============================================================
//  PemantauanPage.jsx — Layout mengikuti tampilan mobile
//  FIX: terima prop onLoadRiwayat → panggil saat klik balita
//       agar riwayat di-fetch dari API (tidak lagi selalu kosong)
// ============================================================
import React, { useState, useMemo, useEffect } from 'react';
import { Card, EmptyState, StatusBadge } from '../components/ui/Components';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
  formatUmur, hitungUmurBulan,
  getStatusStunting, getStatusGizi, formatTanggal
} from '../utils/helpers';

const METRICS = [
  { k: 'bb', l: 'BB (kg)', c: '#1B6B3A', light: '#F0FDF4', badge: '#DCFCE7' },
  { k: 'tb', l: 'TB (cm)', c: '#2563EB', light: '#EFF6FF', badge: '#DBEAFE' },
  { k: 'lk', l: 'LK (cm)', c: '#D97706', light: '#FFFBEB', badge: '#FEF3C7' },
];

function statusColor(s) {
  if (!s) return { bg: '#F3F4F6', text: '#9E9E9E' };
  if (s === 'Normal'   || s === 'Gizi Baik')   return { bg: '#F0FDF4', text: '#16A34A' };
  if (s === 'Risiko')                           return { bg: '#FFFBEB', text: '#D97706' };
  if (s === 'Stunting' || s === 'Gizi Buruk')  return { bg: '#FEF2F2', text: '#DC2626' };
  if (s === 'Gizi Kurang')                     return { bg: '#FFF7ED', text: '#EA580C' };
  return { bg: '#F3F4F6', text: '#6B7280' };
}

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const m = METRICS.find(x => x.k === metric);
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${m?.c || '#E5E7EB'}`, borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}>
      <div style={{ fontSize: 10, color: '#9E9E9E', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 15, color: m?.c }}>
        {payload[0]?.value} {m?.l.split(' ')[1]}
      </div>
    </div>
  );
}

function TrendBadge({ diff, unit }) {
  if (diff === null || diff === undefined) return null;
  const up   = diff > 0;
  const same = diff === 0;
  const color = up ? '#16A34A' : same ? '#D97706' : '#DC2626';
  const bg    = up ? '#DCFCE7' : same ? '#FEF3C7' : '#FEE2E2';
  const icon  = up ? '↗' : same ? '→' : '↘';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 700 }}>
      <span>{icon}</span>
      <span>{up ? '+' : ''}{diff.toFixed(1)} {unit}</span>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────
function LoadingChart() {
  return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#9E9E9E', fontSize: 13 }}>
      <span style={{ width: 16, height: 16, border: '2px solid #E5E7EB', borderTopColor: '#1B6B3A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>
      Memuat data riwayat...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PERUBAHAN DI App.jsx:
// case 'pemantauan': return (
//   <PemantauanPage
//     balitaList={balita.semua}
//     onLoadRiwayat={balita.loadRiwayat}   ← TAMBAH INI
//   />
// );
// ══════════════════════════════════════════════════════════════
function PemantauanPage({ balitaList, onLoadRiwayat }) {
  const [selected,   setSelected]   = useState(null);
  const [activeKey,  setActiveKey]  = useState('bb');
  const [search,     setSearch]     = useState('');
  const [showAll,    setShowAll]     = useState(true);
  const [loadingId,  setLoadingId]  = useState(null); // ID balita yang sedang di-load

  // ── Auto-load riwayat balita pertama saat mount ─────────────
  const displayList = useMemo(() => {
    let list = showAll ? balitaList : balitaList.filter(b => b.riwayat?.length >= 2);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.nama?.toLowerCase().includes(q) ||
        b.namaIbu?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [balitaList, showAll, search]);

  // Balita yang sedang ditampilkan
  const b = useMemo(() => {
    if (selected) return balitaList.find(x => x.id === selected) || null;
    return displayList[0] || null;
  }, [selected, balitaList, displayList]);

  // ── Load riwayat otomatis saat b berubah & riwayat kosong ──
  useEffect(() => {
    if (!b) return;
    if (b.riwayat?.length > 0) return; // sudah ada, skip
    if (!onLoadRiwayat) return;
    if (loadingId === b.id) return; // sedang loading, skip

    setLoadingId(b.id);
    onLoadRiwayat(b.id).finally(() => setLoadingId(null));
  }, [b?.id]); // eslint-disable-line

  // ── Klik balita di sidebar ──────────────────────────────────
  async function handleSelect(bl) {
    setSelected(bl.id);
    // Load riwayat jika belum ada
    if (!bl.riwayat?.length && onLoadRiwayat) {
      setLoadingId(bl.id);
      await onLoadRiwayat(bl.id);
      setLoadingId(null);
    }
  }

  const bStatus = useMemo(() => {
    if (!b) return { stunting: null, gizi: null };
    const umur = hitungUmurBulan(b.tanggalLahir);
    const last  = b.riwayat?.[b.riwayat.length - 1];
    const stunting = b.statusStunting
      || (b.tinggiBadan ? getStatusStunting(b.tinggiBadan, umur, b.jenisKelamin)
        : last ? getStatusStunting(last.tb || last.tinggiBadan, umur, b.jenisKelamin) : null);
    const gizi = b.statusGizi
      || (b.beratBadan ? getStatusGizi(b.beratBadan, umur, b.jenisKelamin)
        : last ? getStatusGizi(last.bb || last.beratBadan, umur, b.jenisKelamin) : null);
    return { stunting, gizi };
  }, [b]);

  const grafikData = useMemo(() =>
    b?.riwayat?.map(p => ({
      tgl: formatTanggal(p.tanggal || p.tglUkur),
      bb:  parseFloat(p.bb  || p.beratBadan)    || null,
      tb:  parseFloat(p.tb  || p.tinggiBadan)   || null,
      lk:  parseFloat(p.lk  || p.lingkarKepala) || null,
    })) || [],
  [b]);

  const lastValues = useMemo(() => {
    if (!grafikData.length) return { bb: null, tb: null, lk: null };
    const last = grafikData[grafikData.length - 1];
    return { bb: last.bb, tb: last.tb, lk: last.lk };
  }, [grafikData]);

  const trends = useMemo(() => {
    if (grafikData.length < 2) return { bb: null, tb: null, lk: null };
    const last = grafikData[grafikData.length - 1];
    const prev = grafikData[grafikData.length - 2];
    return {
      bb: (last.bb && prev.bb) ? last.bb - prev.bb : null,
      tb: (last.tb && prev.tb) ? last.tb - prev.tb : null,
      lk: (last.lk && prev.lk) ? last.lk - prev.lk : null,
    };
  }, [grafikData]);

  const activeMetric = METRICS.find(m => m.k === activeKey);
  const isLoading    = b && loadingId === b.id;

  const th = { padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#9E9E9E', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', textAlign: 'left', whiteSpace: 'nowrap' };
  const td = { padding: '8px 12px', borderBottom: '1px solid #F9FAFB', fontSize: 12, verticalAlign: 'middle' };

  return (
    <div style={{ padding: 24, fontFamily: 'inherit' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ══ SIDEBAR ════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, pointerEvents: 'none', color: '#9E9E9E' }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau ibu..."
              style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1B6B3A'}
              onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #E5E7EB' }}>
            {[
              [false, `≥2 Ukur (${balitaList.filter(b => b.riwayat?.length >= 2).length})`],
              [true,  `Semua (${balitaList.length})`],
            ].map(([val, label]) => (
              <button key={String(val)} onClick={() => setShowAll(val)} style={{
                flex: 1, padding: '7px 4px', border: 'none', fontSize: 11,
                fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
                background: showAll === val ? '#1B6B3A' : '#F9FAFB',
                color: showAll === val ? '#fff' : '#6B7280',
              }}>{label}</button>
            ))}
          </div>

          {/* Daftar balita */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
            {displayList.length === 0
              ? <div style={{ padding: 20, textAlign: 'center', color: '#9E9E9E', fontSize: 12 }}>
                  {search ? '🔍 Tidak ditemukan' : '👶 Belum ada data'}
                </div>
              : <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                  {displayList.map((bl, idx) => {
                    const isActive  = (selected || displayList[0]?.id) === bl.id;
                    const umur      = hitungUmurBulan(bl.tanggalLahir);
                    const last      = bl.riwayat?.[bl.riwayat.length - 1];
                    const ss        = bl.statusStunting
                      || (last ? getStatusStunting(last.tb || last.tinggiBadan, umur, bl.jenisKelamin) : null);
                    const sc        = statusColor(ss);
                    const jml       = bl.riwayat?.length || 0;
                    const isThisLoading = loadingId === bl.id;
                    return (
                      <button key={bl.id} onClick={() => handleSelect(bl)} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', width: '100%', border: 'none',
                        borderBottom: idx < displayList.length - 1 ? '1px solid #F9FAFB' : 'none',
                        borderLeft: `3px solid ${isActive ? '#1B6B3A' : 'transparent'}`,
                        background: isActive ? '#F0FDF4' : '#fff',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: bl.jenisKelamin === 'Laki-laki' ? '#EFF6FF' : '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {isThisLoading
                            ? <span style={{ width: 14, height: 14, border: '2px solid #E5E7EB', borderTopColor: '#1B6B3A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>
                            : bl.jenisKelamin === 'Laki-laki' ? '👦' : '👧'
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isActive ? '#1B6B3A' : '#1A1A1A' }}>
                            {bl.nama}
                          </div>
                          <div style={{ fontSize: 10, color: '#9E9E9E', marginTop: 1 }}>
                            {formatUmur(bl.tanggalLahir)} • {jml}x ukur
                          </div>
                        </div>
                        {ss && (
                          <div style={{ padding: '2px 7px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: sc.bg, color: sc.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {ss}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
            }
          </div>
        </div>

        {/* ══ KONTEN UTAMA ═══════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!b ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', padding: 48, textAlign: 'center', color: '#9E9E9E' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Pilih balita untuk melihat grafik tumbuh kembang</div>
            </div>
          ) : (
            <>
              {/* ── Card Utama ────────────────────────────────── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px 14px', borderBottom: '1px solid #F5F5F5' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: b.jenisKelamin === 'Laki-laki' ? '#EFF6FF' : '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {b.jenisKelamin === 'Laki-laki' ? '👦' : '👧'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#111' }}>{b.nama}</div>
                    <div style={{ fontSize: 11.5, color: '#9E9E9E', marginTop: 2 }}>
                      {formatUmur(b.tanggalLahir)} • {b.riwayat?.length || 0}x pengukuran
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {bStatus.stunting && <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusColor(bStatus.stunting).bg, color: statusColor(bStatus.stunting).text }}>{bStatus.stunting}</div>}
                    {bStatus.gizi     && <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusColor(bStatus.gizi).bg,     color: statusColor(bStatus.gizi).text     }}>{bStatus.gizi}</div>}
                  </div>
                </div>

                {/* Tab pill */}
                <div style={{ display: 'flex', gap: 8, padding: '14px 20px 10px' }}>
                  {METRICS.map(m => (
                    <button key={m.k} onClick={() => setActiveKey(m.k)} style={{
                      padding: '7px 20px', borderRadius: 24, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s',
                      background: activeKey === m.k ? m.c : m.badge,
                      color: activeKey === m.k ? '#fff' : m.c,
                      boxShadow: activeKey === m.k ? `0 2px 8px ${m.c}44` : 'none',
                    }}>{m.l}</button>
                  ))}
                </div>

                {/* Area Chart */}
                <div style={{ padding: '0 20px 8px' }}>
                  {isLoading ? (
                    <LoadingChart/>
                  ) : grafikData.length < 1 ? (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9E9E9E', fontSize: 13 }}>
                      Belum ada data pengukuran
                    </div>
                  ) : grafikData.length < 2 ? (
                    <div style={{ padding: '16px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A', fontSize: 12, color: '#D97706', textAlign: 'center', margin: '8px 0' }}>
                      ⚠️ Grafik butuh minimal 2 data. Saat ini baru {grafikData.length}x.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={grafikData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${activeKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="10%" stopColor={activeMetric?.c} stopOpacity={0.25}/>
                            <stop offset="90%" stopColor={activeMetric?.c} stopOpacity={0.02}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                        <XAxis dataKey="tgl" tick={{ fontSize: 10, fill: '#BDBDBD' }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fontSize: 10, fill: '#BDBDBD' }} axisLine={false} tickLine={false} domain={['auto','auto']}/>
                        <Tooltip content={<CustomTooltip metric={activeKey}/>}/>
                        <Area
                          type="monotone" dataKey={activeKey}
                          stroke={activeMetric?.c} strokeWidth={2.5}
                          fill={`url(#grad-${activeKey})`}
                          dot={{ r: 4, fill: '#fff', stroke: activeMetric?.c, strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: activeMetric?.c }}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Nilai Terakhir */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #F5F5F5', borderBottom: '1px solid #F5F5F5' }}>
                  {METRICS.map((m, i) => (
                    <div key={m.k} onClick={() => setActiveKey(m.k)} style={{
                      padding: '14px 16px', textAlign: 'center',
                      borderRight: i < 2 ? '1px solid #F5F5F5' : 'none',
                      background: activeKey === m.k ? m.light : '#fff',
                      cursor: 'pointer', transition: 'background 0.12s'
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: m.c }}>
                        {lastValues[m.k] ?? '—'}
                        <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 2 }}>{m.l.split(' ')[1]}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#9E9E9E', marginTop: 2, fontWeight: 600 }}>{m.l.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>

                {/* Trend badges */}
                {(trends.bb !== null || trends.tb !== null || trends.lk !== null) && (
                  <div style={{ display: 'flex', gap: 8, padding: '12px 20px', flexWrap: 'wrap' }}>
                    {trends.bb !== null && <TrendBadge diff={trends.bb} unit="kg"/>}
                    {trends.tb !== null && <TrendBadge diff={trends.tb} unit="cm"/>}
                    {trends.lk !== null && <TrendBadge diff={trends.lk} unit="cm"/>}
                    <span style={{ fontSize: 10, color: '#BDBDBD', alignSelf: 'center' }}>vs pengukuran sebelumnya</span>
                  </div>
                )}
              </div>

              {/* ── Tabel Riwayat ─────────────────────────────── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>📋 Riwayat Pengukuran</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#F0FDF4', color: '#16A34A', padding: '2px 10px', borderRadius: 20 }}>
                    {b.riwayat?.length || 0} data
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#9E9E9E', fontSize: 13 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid #E5E7EB', borderTopColor: '#1B6B3A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', marginRight: 8 }}/>
                    Memuat riwayat...
                  </div>
                ) : !b.riwayat?.length ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#9E9E9E', fontSize: 13 }}>
                    📭 Belum ada riwayat pengukuran
                  </div>
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
                          const prevBB = arr[i+1] ? parseFloat(arr[i+1].bb || arr[i+1].beratBadan) : null;
                          const bbDiff = (bb && prevBB) ? bb - prevBB : null;
                          const pssC   = statusColor(pss);
                          const psgC   = statusColor(psg);
                          return (
                            <tr key={p.id || i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                              <td style={{ ...td, color: '#BDBDBD', fontWeight: 600, width: 36 }}>{arr.length - i}</td>
                              <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{formatTanggal(p.tanggal || p.tglUkur)}</td>
                              <td style={td}>
                                <div style={{ fontWeight: 700, color: '#1B6B3A' }}>{bb ?? '—'}</div>
                                {bbDiff !== null && (
                                  <div style={{ fontSize: 10, fontWeight: 700, color: bbDiff > 0 ? '#16A34A' : bbDiff < 0 ? '#DC2626' : '#D97706' }}>
                                    {bbDiff > 0 ? `↑ +${bbDiff.toFixed(2)}` : `↓ ${bbDiff.toFixed(2)}`}
                                  </div>
                                )}
                              </td>
                              <td style={{ ...td, fontWeight: 700, color: '#2563EB' }}>{tb ?? '—'}</td>
                              <td style={{ ...td, fontWeight: 700, color: '#D97706' }}>{lk ?? '—'}</td>
                              <td style={td}>{pss ? <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: pssC.bg, color: pssC.text }}>{pss}</span> : <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                              <td style={td}>{psg ? <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: psgC.bg, color: psgC.text }}>{psg}</span> : <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                              <td style={{ ...td, color: '#6B7280', maxWidth: 160, fontSize: 11 }}>{p.catatan || <span style={{ color: '#E5E7EB' }}>—</span>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PemantauanPage;