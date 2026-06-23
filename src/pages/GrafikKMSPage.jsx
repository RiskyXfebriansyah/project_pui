// ============================================================
//  GrafikKMSPage.jsx — Grafik KMS WHO (BB/U, TB/U, LK/U)
//  Props: balita { nama, tanggalLahir, jenisKelamin, riwayat[] }
//  riwayat item: { tanggal, bb, tb, lk, umurBulan }
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart, Line, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// ── WHO Standard Data ─────────────────────────────────────────
// Source: WHO Child Growth Standards (simplified key points, interpolated)
// Format: { bulan, sd3neg, sd2neg, sd0, sd2, sd3 }

const WHO_BBU_P = [ // Berat Badan/Umur Perempuan (kg)
  {b:0,  n3:2.0, n2:2.4, m:3.2, p2:4.2, p3:4.8},
  {b:1,  n3:2.7, n2:3.2, m:4.2, p2:5.5, p3:6.2},
  {b:2,  n3:3.4, n2:3.9, m:5.1, p2:6.6, p3:7.5},
  {b:3,  n3:4.0, n2:4.5, m:5.8, p2:7.5, p3:8.5},
  {b:4,  n3:4.4, n2:5.0, m:6.4, p2:8.3, p3:9.3},
  {b:5,  n3:4.8, n2:5.4, m:6.9, p2:8.8, p3:10.0},
  {b:6,  n3:5.1, n2:5.7, m:7.3, p2:9.3, p3:10.6},
  {b:7,  n3:5.3, n2:6.0, m:7.6, p2:9.8, p3:11.1},
  {b:8,  n3:5.6, n2:6.3, m:7.9, p2:10.2,p3:11.6},
  {b:9,  n3:5.8, n2:6.5, m:8.2, p2:10.5,p3:11.9},
  {b:10, n3:5.9, n2:6.7, m:8.5, p2:10.9,p3:12.3},
  {b:11, n3:6.1, n2:6.9, m:8.7, p2:11.2,p3:12.7},
  {b:12, n3:6.3, n2:7.0, m:8.9, p2:11.5,p3:13.1},
  {b:15, n3:6.8, n2:7.6, m:9.6, p2:12.4,p3:14.1},
  {b:18, n3:7.2, n2:8.1, m:10.2,p2:13.2,p3:15.1},
  {b:21, n3:7.6, n2:8.6, m:10.9,p2:14.0,p3:16.1},
  {b:24, n3:8.1, n2:9.0, m:11.5,p2:14.8,p3:17.0},
  {b:30, n3:8.8, n2:9.9, m:12.7,p2:16.4,p3:19.0},
  {b:36, n3:9.6, n2:10.8,m:13.9,p2:18.1,p3:21.2},
  {b:42, n3:10.3,n2:11.6,m:15.0,p2:19.6,p3:23.0},
  {b:48, n3:10.9,n2:12.3,m:15.9,p2:20.9,p3:24.6},
  {b:54, n3:11.5,n2:13.0,m:16.8,p2:22.1,p3:26.1},
  {b:60, n3:12.1,n2:13.7,m:17.7,p2:23.5,p3:28.0},
];

const WHO_BBU_L = [ // Berat Badan/Umur Laki-laki (kg)
  {b:0,  n3:2.1, n2:2.5, m:3.3, p2:4.4, p3:5.0},
  {b:1,  n3:2.9, n2:3.4, m:4.5, p2:5.8, p3:6.6},
  {b:2,  n3:3.8, n2:4.3, m:5.6, p2:7.1, p3:8.1},
  {b:3,  n3:4.4, n2:5.0, m:6.4, p2:8.0, p3:9.2},
  {b:4,  n3:4.9, n2:5.6, m:7.0, p2:8.7, p3:10.0},
  {b:5,  n3:5.3, n2:6.0, m:7.5, p2:9.3, p3:10.7},
  {b:6,  n3:5.7, n2:6.4, m:7.9, p2:9.8, p3:11.3},
  {b:7,  n3:5.9, n2:6.7, m:8.3, p2:10.3,p3:11.8},
  {b:8,  n3:6.2, n2:7.0, m:8.6, p2:10.7,p3:12.3},
  {b:9,  n3:6.4, n2:7.2, m:8.9, p2:11.0,p3:12.7},
  {b:10, n3:6.6, n2:7.5, m:9.2, p2:11.4,p3:13.1},
  {b:11, n3:6.8, n2:7.7, m:9.4, p2:11.7,p3:13.5},
  {b:12, n3:6.9, n2:7.8, m:9.6, p2:11.9,p3:13.7},
  {b:15, n3:7.4, n2:8.4, m:10.3,p2:12.8,p3:14.8},
  {b:18, n3:7.9, n2:8.9, m:11.0,p2:13.7,p3:15.8},
  {b:21, n3:8.3, n2:9.4, m:11.6,p2:14.5,p3:16.8},
  {b:24, n3:8.6, n2:9.8, m:12.2,p2:15.3,p3:17.7},
  {b:30, n3:9.4, n2:10.7,m:13.3,p2:16.8,p3:19.5},
  {b:36, n3:10.2,n2:11.5,m:14.3,p2:18.3,p3:21.3},
  {b:42, n3:11.0,n2:12.4,m:15.4,p2:19.7,p3:23.1},
  {b:48, n3:11.7,n2:13.2,m:16.3,p2:21.0,p3:24.7},
  {b:54, n3:12.3,n2:14.0,m:17.2,p2:22.3,p3:26.3},
  {b:60, n3:13.0,n2:14.8,m:18.3,p2:23.9,p3:28.3},
];

const WHO_TBU_P = [ // Tinggi Badan/Umur Perempuan (cm)
  {b:0,  n3:43.6,n2:45.4,m:49.1,p2:52.9,p3:54.7},
  {b:3,  n3:53.5,n2:55.6,m:59.8,p2:64.0,p3:66.1},
  {b:6,  n3:59.9,n2:62.2,m:65.7,p2:69.2,p3:71.6},
  {b:9,  n3:64.1,n2:66.5,m:70.1,p2:73.7,p3:76.2},
  {b:12, n3:67.7,n2:70.0,m:74.0,p2:78.0,p3:80.5},
  {b:15, n3:70.7,n2:73.0,m:77.5,p2:82.0,p3:84.5},
  {b:18, n3:73.3,n2:76.0,m:80.7,p2:85.4,p3:88.1},
  {b:21, n3:75.8,n2:78.5,m:83.5,p2:88.5,p3:91.1},
  {b:24, n3:77.5,n2:80.8,m:86.4,p2:92.0,p3:94.9},
  {b:30, n3:81.7,n2:85.1,m:91.1,p2:97.1,p3:100.3},
  {b:36, n3:86.0,n2:89.5,m:95.7,p2:102.0,p3:105.4},
  {b:42, n3:89.4,n2:93.1,m:99.7,p2:106.4,p3:110.0},
  {b:48, n3:92.5,n2:96.4,m:103.3,p2:110.2,p3:114.0},
  {b:54, n3:95.5,n2:99.5,m:106.7,p2:114.0,p3:117.9},
  {b:60, n3:98.3,n2:102.5,m:110.0,p2:117.6,p3:121.7},
];

const WHO_TBU_L = [ // Tinggi Badan/Umur Laki-laki (cm)
  {b:0,  n3:44.2,n2:46.1,m:49.9,p2:53.7,p3:55.6},
  {b:3,  n3:55.3,n2:57.3,m:61.4,p2:65.5,p3:67.6},
  {b:6,  n3:61.2,n2:63.3,m:67.6,p2:71.9,p3:74.0},
  {b:9,  n3:65.2,n2:67.5,m:72.0,p2:76.5,p3:78.7},
  {b:12, n3:68.6,n2:71.0,m:75.7,p2:80.5,p3:82.9},
  {b:15, n3:71.8,n2:74.2,m:79.1,p2:84.2,p3:86.7},
  {b:18, n3:74.5,n2:77.2,m:82.3,p2:87.7,p3:90.4},
  {b:21, n3:77.1,n2:79.9,m:85.1,p2:90.6,p3:93.4},
  {b:24, n3:78.0,n2:81.7,m:87.8,p2:94.0,p3:97.5},
  {b:30, n3:82.7,n2:86.5,m:92.7,p2:99.0,p3:102.7},
  {b:36, n3:87.4,n2:91.2,m:96.1,p2:103.0,p3:107.2},
  {b:42, n3:91.3,n2:95.3,m:102.3,p2:109.4,p3:113.3},
  {b:48, n3:94.8,n2:99.1,m:106.4,p2:113.7,p3:118.0},
  {b:54, n3:98.1,n2:102.6,m:110.4,p2:117.9,p3:122.2},
  {b:60, n3:101.3,n2:106.0,m:114.2,p2:122.4,p3:126.7},
];

const WHO_LKU_P = [ // Lingkar Kepala/Umur Perempuan (cm)
  {b:0,  n3:31.5,n2:32.7,m:34.6,p2:36.5,p3:37.7},
  {b:1,  n3:33.7,n2:34.9,m:36.9,p2:38.9,p3:40.1},
  {b:2,  n3:35.4,n2:36.6,m:38.6,p2:40.6,p3:41.9},
  {b:3,  n3:36.7,n2:37.9,m:39.9,p2:42.0,p3:43.3},
  {b:4,  n3:37.7,n2:38.9,m:41.0,p2:43.1,p3:44.4},
  {b:5,  n3:38.5,n2:39.7,m:41.9,p2:44.1,p3:45.4},
  {b:6,  n3:39.2,n2:40.4,m:42.6,p2:44.8,p3:46.2},
  {b:7,  n3:39.7,n2:41.0,m:43.2,p2:45.5,p3:46.9},
  {b:8,  n3:40.2,n2:41.5,m:43.7,p2:46.0,p3:47.4},
  {b:9,  n3:40.6,n2:41.9,m:44.2,p2:46.5,p3:47.9},
  {b:10, n3:41.0,n2:42.3,m:44.6,p2:46.9,p3:48.3},
  {b:11, n3:41.3,n2:42.6,m:44.9,p2:47.2,p3:48.7},
  {b:12, n3:41.5,n2:42.9,m:45.2,p2:47.6,p3:49.0},
  {b:15, n3:42.1,n2:43.5,m:45.8,p2:48.2,p3:49.7},
  {b:18, n3:42.6,n2:44.0,m:46.3,p2:48.7,p3:50.2},
  {b:21, n3:43.0,n2:44.4,m:46.8,p2:49.2,p3:50.7},
  {b:24, n3:43.4,n2:44.8,m:47.2,p2:49.6,p3:51.1},
  {b:30, n3:44.0,n2:45.4,m:47.8,p2:50.3,p3:51.8},
  {b:36, n3:44.4,n2:45.9,m:48.4,p2:50.9,p3:52.4},
  {b:42, n3:44.8,n2:46.3,m:48.8,p2:51.3,p3:52.9},
  {b:48, n3:45.2,n2:46.7,m:49.2,p2:51.7,p3:53.3},
  {b:54, n3:45.5,n2:47.0,m:49.5,p2:52.0,p3:53.6},
  {b:60, n3:45.7,n2:47.2,m:49.8,p2:52.3,p3:54.0},
];

const WHO_LKU_L = [ // Lingkar Kepala/Umur Laki-laki (cm)
  {b:0,  n3:31.9,n2:33.2,m:35.2,p2:37.2,p3:38.4},
  {b:1,  n3:34.5,n2:35.7,m:37.9,p2:40.0,p3:41.3},
  {b:2,  n3:36.3,n2:37.6,m:39.7,p2:41.9,p3:43.1},
  {b:3,  n3:37.6,n2:38.9,m:41.1,p2:43.3,p3:44.6},
  {b:4,  n3:38.6,n2:39.9,m:42.2,p2:44.4,p3:45.8},
  {b:5,  n3:39.4,n2:40.7,m:43.0,p2:45.3,p3:46.7},
  {b:6,  n3:40.1,n2:41.5,m:43.8,p2:46.2,p3:47.6},
  {b:7,  n3:40.7,n2:42.1,m:44.5,p2:46.9,p3:48.3},
  {b:8,  n3:41.2,n2:42.6,m:45.0,p2:47.5,p3:48.9},
  {b:9,  n3:41.6,n2:43.0,m:45.5,p2:48.0,p3:49.4},
  {b:10, n3:42.0,n2:43.4,m:45.9,p2:48.4,p3:49.9},
  {b:11, n3:42.3,n2:43.7,m:46.3,p2:48.8,p3:50.3},
  {b:12, n3:42.6,n2:44.0,m:46.6,p2:49.2,p3:50.7},
  {b:15, n3:43.2,n2:44.7,m:47.3,p2:49.9,p3:51.4},
  {b:18, n3:43.7,n2:45.2,m:47.9,p2:50.5,p3:52.1},
  {b:21, n3:44.1,n2:45.6,m:48.4,p2:51.1,p3:52.7},
  {b:24, n3:44.5,n2:46.0,m:48.8,p2:51.6,p3:53.2},
  {b:30, n3:45.1,n2:46.6,m:49.5,p2:52.3,p3:53.9},
  {b:36, n3:45.6,n2:47.1,m:50.0,p2:52.9,p3:54.5},
  {b:42, n3:46.0,n2:47.5,m:50.5,p2:53.4,p3:55.0},
  {b:48, n3:46.3,n2:47.9,m:50.9,p2:53.8,p3:55.5},
  {b:54, n3:46.6,n2:48.2,m:51.2,p2:54.2,p3:55.9},
  {b:60, n3:46.9,n2:48.5,m:51.5,p2:54.5,p3:56.2},
];

const KMS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  .kms-root { font-family: 'DM Sans', sans-serif; padding: 20px; }
  .kms-header {
    background: linear-gradient(135deg, #0A0F1E 0%, #1e2d4a 60%, #243347 100%);
    border-radius: 20px; padding: 20px 24px; margin-bottom: 20px;
    display: flex; align-items: center; gap: 16px;
  }
  .kms-header-icon {
    width: 52px; height: 52px; border-radius: 14px; font-size: 26px;
    background: rgba(245,158,11,0.15); border: 1.5px solid rgba(245,158,11,0.3);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .kms-title { font-family: 'Sora', sans-serif; color: #fff; font-weight: 800; font-size: 18px; margin-bottom: 4px; }
  .kms-subtitle { color: rgba(255,255,255,0.45); font-size: 12px; }
  .kms-info { margin-left: auto; display: flex; gap: 12px; }
  .kms-info-item { text-align: center; }
  .kms-info-val { font-family: 'Sora', sans-serif; color: #F59E0B; font-weight: 800; font-size: 18px; }
  .kms-info-lbl { color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 600; }
  .tab-bar {
    display: flex; gap: 8px; margin-bottom: 20px;
    background: #F1F5F9; border-radius: 14px; padding: 6px;
  }
  .tab-btn {
    flex: 1; padding: 9px 12px; border-radius: 10px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; color: #64748B; background: transparent;
  }
  .tab-btn.active {
    background: #fff; color: #0A0F1E;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .chart-card {
    background: #fff; border-radius: 20px; padding: 20px 22px;
    border: 1.5px solid #F1F5F9; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    margin-bottom: 16px;
  }
  .chart-title { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
  .chart-sub { font-size: 11px; color: #94A3B8; margin-bottom: 14px; }
  .legend-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748B; }
  .legend-line { width: 20px; height: 2px; border-radius: 1px; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
  .status-bar {
    background: #F8FAFC; border-radius: 14px; padding: 14px 16px;
    border: 1.5px solid #F1F5F9; margin-top: 16px;
  }
  .status-bar-title { font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .status-zones { display: flex; flex-direction: column; gap: 6px; }
  .status-zone { display: flex; align-items: center; gap: 8px; font-size: 11px; }
  .zone-swatch { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
  .ctooltip-kms {
    background: #fff; border: 1px solid #F0F0F0; border-radius: 12px;
    padding: 10px 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    font-size: 12px; font-family: 'DM Sans', sans-serif;
  }
  .no-data-box {
    text-align: center; padding: 32px 20px; background: #F8FAFC;
    border-radius: 14px; border: 1.5px dashed #E2E8F0;
  }
  .gender-switch {
    display: flex; gap: 6px; background: #F1F5F9; border-radius: 10px; padding: 4px;
  }
  .gender-btn {
    padding: 6px 14px; border-radius: 7px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; color: #64748B; background: transparent;
  }
  .gender-btn.active { background: #fff; color: #0F172A; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .anim { animation: fadeUp 0.35s ease both; }
`;

let kmsInjected = false;
function injectKMSCSS() {
  if (kmsInjected || typeof document === 'undefined') return;
  kmsInjected = true;
  const el = document.createElement('style');
  el.textContent = KMS_CSS;
  document.head.appendChild(el);
}

// ── Warna kurva ────────────────────────────────────────────────
const C = {
  n3:   { stroke: '#EF4444', dash: '5 3' },  // -3 SD  merah putus
  n2:   { stroke: '#F59E0B', dash: '5 3' },  // -2 SD  amber putus
  m:    { stroke: '#16A34A', dash: '' },      // median hijau solid
  p2:   { stroke: '#F59E0B', dash: '5 3' },  // +2 SD  amber putus
  p3:   { stroke: '#EF4444', dash: '5 3' },  // +3 SD  merah putus
  dot:  '#1D4ED8',                            // scatter plot
};

const BALITA_COLORS = [
  '#1D4ED8', '#DC2626', '#16A34A', '#D97706',
  '#7C3AED', '#0891B2', '#BE185D', '#65A30D',
  '#0D9488', '#EA580C', '#4338CA', '#C026D3',
];

// ── Custom Tooltip ─────────────────────────────────────────────
function KMSTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const dataPoints = payload.filter(p => p.dataKey === 'y');
  const curves = payload.filter(p => p.dataKey !== 'y');
  return (
    <div className="ctooltip-kms">
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#0F172A' }}>Umur {label} bulan</div>
      {dataPoints.length > 0 && dataPoints.map((p, i) => (
        <div key={i} style={{ color: C.dot, fontWeight: 700, marginBottom: 4 }}>
          📍 Data: <strong>{p.value} {unit}</strong>
        </div>
      ))}
      {curves.slice(0, 1).map((p) => (
        <div key={p.name} style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>
          Median: {payload.find(x => x.dataKey === 'm')?.value ?? '–'} {unit}
        </div>
      ))}
    </div>
  );
}

// ── Fungsi interpolasi WHO ─────────────────────────────────────
function interpolateWHO(data, bulan) {
  for (let i = 0; i < data.length - 1; i++) {
    if (bulan >= data[i].b && bulan <= data[i + 1].b) {
      const t = (bulan - data[i].b) / (data[i + 1].b - data[i].b);
      return {
        n3: +(data[i].n3 + (data[i + 1].n3 - data[i].n3) * t).toFixed(1),
        n2: +(data[i].n2 + (data[i + 1].n2 - data[i].n2) * t).toFixed(1),
        m:  +(data[i].m  + (data[i + 1].m  - data[i].m)  * t).toFixed(1),
        p2: +(data[i].p2 + (data[i + 1].p2 - data[i].p2) * t).toFixed(1),
        p3: +(data[i].p3 + (data[i + 1].p3 - data[i].p3) * t).toFixed(1),
      };
    }
  }
  return null;
}

// ── Tentukan status dari titik vs kurva ────────────────────────
function getStatusFromWHO(value, bulan, dataset) {
  const ref = interpolateWHO(dataset, bulan);
  if (!ref) return { label: 'Data tidak tersedia', color: '#94A3B8' };
  if (value < ref.n3) return { label: 'Sangat Kurang (< -3 SD)', color: '#EF4444' };
  if (value < ref.n2) return { label: 'Kurang (-3 s/d -2 SD)', color: '#F59E0B' };
  if (value <= ref.p2) return { label: 'Normal (-2 s/d +2 SD)', color: '#16A34A' };
  if (value <= ref.p3) return { label: 'Lebih (+2 s/d +3 SD)', color: '#F59E0B' };
  return { label: 'Obesitas/Sangat Lebih (> +3 SD)', color: '#EF4444' };
}

// ── Build chart data (kurva WHO + scatter balita) ──────────────
function hitungUmurBulanSaat(tanggalLahir, tanggalUkur) {
  if (!tanggalLahir || !tanggalUkur) return 0;
  const lahir = new Date(tanggalLahir);
  const ukur = new Date(tanggalUkur);
  return (ukur.getFullYear() - lahir.getFullYear()) * 12 + (ukur.getMonth() - lahir.getMonth());
}

function normalisasiRiwayat(riwayat, tanggalLahir) {
  return riwayat.map(r => ({
    ...r,
    bb: parseFloat(r.bb ?? r.beratBadan) ?? null,
    tb: parseFloat(r.tb ?? r.tinggiBadan) ?? null,
    lk: parseFloat(r.lk ?? r.lingkarKepala) ?? null,
    umurBulan: r.umurBulan ?? hitungUmurBulanSaat(tanggalLahir, r.tanggal || r.tglUkur),
  }));
}

// ── Build chart data (kurva WHO + scatter balita) ──────────────
function buildChartData(whoData, riwayat, field, tanggalLahir) {
  const normalized = normalisasiRiwayat(riwayat, tanggalLahir);
  const curveData = whoData.map(d => ({ bulan: d.b, n3: d.n3, n2: d.n2, m: d.m, p2: d.p2, p3: d.p3 }));

  // Scatter: data balita per bulan
  const scatterData = normalized
    .filter(r => r[field] != null && r[field] > 0)
    .map(r => ({
      bulan: r.umurBulan,
      y: r[field],
    }));

  return { curveData, scatterData };
}

// ── Single Chart Component ─────────────────────────────────────
function MultiTooltip({ active, payload, unit, multiSeries, selectedId }) {
  if (!active || !payload?.length) return null;
  const dataPoint = payload.find(p => p.dataKey === 'y');
  if (!dataPoint) return null;
  const nama = dataPoint.name || 'Balita';
  const isMulti = multiSeries?.length > 0;
  return (
    <div className="ctooltip-kms">
      {isMulti && <div style={{ fontWeight: 700, color: dataPoint.stroke, marginBottom: 4 }}>{nama}</div>}
      <div style={{ fontWeight: 600, marginBottom: 2, color: '#0F172A' }}>Umur {dataPoint.payload.bulan} bulan</div>
      <div style={{ color: '#1D4ED8', fontWeight: 700 }}>
        📍 <strong>{dataPoint.value} {unit}</strong>
      </div>
    </div>
  );
}

function KMSChart({ title, subtitle, whoData, whoData2, riwayat, field, unit, yDomain, tanggalLahir, multiSeries, selectedId, onSelectBalita }) {
  const primaryIsMulti = !riwayat && multiSeries?.length > 0;
  const { curveData } = buildChartData(whoData, riwayat || [], field, tanggalLahir);
  const curveData2 = whoData2 ? whoData2.map(d => ({ bulan: d.b, n3: d.n3, n2: d.n2, m: d.m, p2: d.p2, p3: d.p3 })) : null;

  // Single balita mode
  const { scatterData } = !primaryIsMulti
    ? buildChartData(whoData, riwayat, field, tanggalLahir)
    : { scatterData: [] };

  const lastPoint = primaryIsMulti ? null : scatterData[scatterData.length - 1];
  const lastWho = lastPoint ? interpolateWHO(whoData, lastPoint.bulan) : null;
  const status = lastPoint && lastWho
    ? getStatusFromWHO(lastPoint.y, lastPoint.bulan, whoData)
    : null;

  const hasAnyData = primaryIsMulti
    ? multiSeries.some(s => s.riwayat?.length > 0)
    : scatterData.length > 0;

  // Build multi-series chart data
  const multiChartData = primaryIsMulti
    ? multiSeries.map(s => ({
        ...s,
        chartData: buildChartData(whoData, s.riwayat, field, s.tanggalLahir).scatterData,
      }))
    : [];

  return (
    <div className="chart-card anim">
      <div className="chart-title">{title}</div>
      <div className="chart-sub">{subtitle}</div>

      {!hasAnyData && (
        <div className="no-data-box">
          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Belum ada data pengukuran</div>
          <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>Data akan muncul setelah pemantauan pertama</div>
        </div>
      )}

      {!primaryIsMulti && scatterData.length > 0 && status && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
          background: `${status.color}18`, border: `1.5px solid ${status.color}40`,
          borderRadius: 8, padding: '4px 10px',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: status.color }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: status.color }}>{status.label}</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart margin={{ top: 8, right: 12, bottom: 8, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="bulan"
            type="number"
            domain={[0, 60]}
            ticks={[0,6,12,18,24,30,36,42,48,54,60]}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false} tickLine={false}
            label={{ value: 'Umur (bulan)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#CBD5E1' }}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            content={<MultiTooltip unit={unit} multiSeries={primaryIsMulti ? multiSeries : null} selectedId={selectedId} />}
          />

          {/* Kurva WHO — hanya median untuk mode multi, full untuk single */}
          {primaryIsMulti ? (
            <>
              <Line
                data={curveData}
                dataKey="m"
                type="monotone"
                stroke={C.m.stroke}
                strokeWidth={2}
                dot={false}
                activeDot={false}
                legendType="none"
              />
              {curveData2 && (
                <Line
                  data={curveData2}
                  dataKey="m"
                  type="monotone"
                  stroke={C.m.stroke}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  legendType="none"
                />
              )}
            </>
          ) : (
            ['n3','n2','m','p2','p3'].map(key => (
              <Line
                key={key}
                data={curveData}
                dataKey={key}
                type="monotone"
                stroke={C[key].stroke}
                strokeWidth={key === 'm' ? 2 : 1.5}
                strokeDasharray={key === 'm' ? '' : C[key].dash}
                dot={false}
                activeDot={false}
                legendType="none"
              />
            ))
          )}

          {/* Multi-balita: dots with thin connecting lines */}
          {primaryIsMulti && multiChartData.map(s => {
            const isActive = s.id === selectedId;
            return (
              <Line
                key={s.id}
                data={s.chartData}
                dataKey="y"
                type="monotone"
                stroke={s.warna}
                strokeWidth={isActive ? 2.5 : 1}
                strokeOpacity={isActive ? 1 : 0.45}
                dot={{ r: isActive ? 5 : 3, fill: s.warna, stroke: '#fff', strokeWidth: isActive ? 1.5 : 0.5 }}
                activeDot={{ r: 6, fill: s.warna, stroke: '#fff', strokeWidth: 2 }}
                name={s.nama}
                onClick={() => onSelectBalita?.(s.id)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}

          {/* Single balita mode */}
          {!primaryIsMulti && (
            <>
              <Scatter
                data={scatterData}
                dataKey="y"
                fill={C.dot}
                stroke="#fff"
                strokeWidth={1.5}
                r={5}
                name="Data Balita"
              />
              <Line
                data={scatterData}
                dataKey="y"
                type="monotone"
                stroke={C.dot}
                strokeWidth={1.5}
                dot={{ r: 5, fill: C.dot, stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 7 }}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="legend-row">
        {[
          { color: C.m.stroke, dash: false, label: primaryIsMulti ? 'Median (gender ini)' : 'Median (0 SD)' },
          ...(primaryIsMulti && whoData2 ? [{ color: C.m.stroke, dash: '2 4', label: 'Median (gender lain)' }] : []),
          ...(!primaryIsMulti
            ? [
                { color: C.n2.stroke, dash: true,  label: '±2 SD' },
                { color: C.n3.stroke, dash: true,  label: '±3 SD' },
                { color: C.dot, dash: false, dot: true, label: 'Data balita' },
              ]
            : multiSeries.map(s => ({
                color: s.warna,
                dash: false,
                dot: true,
                label: s.id === selectedId ? `▶ ${s.nama}` : s.nama,
              }))
          ),
        ].map(({ color, dash, dot, label }) => (
          <div key={label} className="legend-item">
            {dot
              ? <div className="legend-dot" style={{ background: color }} />
              : <div className="legend-line" style={{
                  background: dash
                    ? `repeating-linear-gradient(90deg,${color} 0,${color} 4px,transparent 4px,transparent 7px)`
                    : color
                }} />
            }
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Status zones info - only for single balita mode */}
      {!primaryIsMulti && (
      <div className="status-bar">
        <div className="status-bar-title">Zona Interpretasi</div>
        <div className="status-zones">
          {[
            { color: '#EF4444', label: 'Di bawah -3 SD', keterangan: 'Sangat kurang / Sangat pendek' },
            { color: '#F59E0B', label: '-3 SD s/d -2 SD', keterangan: 'Kurang / Pendek (perlu perhatian)' },
            { color: '#16A34A', label: '-2 SD s/d +2 SD', keterangan: 'Normal' },
            { color: '#F59E0B', label: '+2 SD s/d +3 SD', keterangan: 'Lebih (risiko)' },
            { color: '#EF4444', label: 'Di atas +3 SD', keterangan: 'Sangat lebih / Obesitas' },
          ].map(z => (
            <div key={z.label} className="status-zone">
              <div className="zone-swatch" style={{ background: z.color }} />
              <span style={{ color: '#64748B', fontWeight: 600 }}>{z.label}:</span>
              <span style={{ color: '#94A3B8' }}>{z.keterangan}</span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

// ── Tab selector ───────────────────────────────────────────────
const TABS = [
  { id: 'bbu', label: '⚖️ BB/U', desc: 'Berat Badan menurut Umur' },
  { id: 'tbu', label: '📏 TB/U', desc: 'Tinggi Badan menurut Umur' },
  { id: 'lku', label: '🔵 LK/U', desc: 'Lingkar Kepala menurut Umur' },
];

// ── Hitung umur ────────────────────────────────────────────────
function hitungUmurBulan(tanggalLahir) {
  const lahir = new Date(tanggalLahir);
  const now = new Date();
  return (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth());
}

function formatUmur(bulan) {
  if (bulan < 12) return `${bulan} bulan`;
  const th = Math.floor(bulan / 12);
  const bl = bulan % 12;
  return bl > 0 ? `${th} thn ${bl} bln` : `${th} tahun`;
}

// ── Main Export ────────────────────────────────────────────────
const STATUS_COLORS = {
  Stunting: '#DC2626',
  Risiko: '#D97706',
  Normal: '#16A34A',
};

const thStyle = { padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#9E9E9E', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 10px', borderBottom: '1px solid #F9FAFB', fontSize: 12, verticalAlign: 'middle' };

export default function GrafikKMSPage({ balita, balitaList, onLoadRiwayat, onBack }) {
  injectKMSCSS();
  const [activeTab, setActiveTab] = useState('bbu');
  const [selectedId, setSelectedId] = useState(null);
  const [showAll, setShowAll] = useState(true);
  const [search, setSearch] = useState('');

  // Sync selectedId dari prop balita (dari luar)
  useEffect(() => {
    if (balita?.id) {
      setSelectedId(balita.id);
      setShowAll(false);
    }
  }, [balita?.id]);

  // Cari data balita dari balitaList berdasarkan selectedId
  const selectedFromList = useMemo(() => {
    if (!balitaList?.length || !selectedId) return null;
    return balitaList.find(b => b.id === selectedId) || null;
  }, [balitaList, selectedId]);

  // Load riwayat saat balita dipilih
  useEffect(() => {
    if (selectedId && selectedFromList && !selectedFromList.riwayat?.length && onLoadRiwayat) {
      onLoadRiwayat(selectedId);
    }
  }, [selectedId, selectedFromList, onLoadRiwayat]);

  // Multi-series untuk tampilkan semua balita
  const multiSeries = useMemo(() => {
    if (!showAll || !balitaList?.length) return null;
    return balitaList
      .filter(b => b.riwayat?.length > 0)
      .map((b, i) => ({
        id: b.id,
        nama: b.nama,
        tanggalLahir: b.tanggalLahir,
        riwayat: b.riwayat || [],
        warna: BALITA_COLORS[i % BALITA_COLORS.length],
      }));
  }, [showAll, balitaList]);

  // Fallback data
  const data = selectedFromList || balita || {
    nama: 'Anak Demo',
    tanggalLahir: '2022-05-01',
    jenisKelamin: 'Perempuan',
    riwayat: [
      { tanggal: '2022-06-01', bb: 5.2, tb: 58.0, lk: 37.5, umurBulan: 1 },
      { tanggal: '2022-09-01', bb: 6.8, tb: 63.0, lk: 40.2, umurBulan: 4 },
      { tanggal: '2022-12-01', bb: 7.5, tb: 67.0, lk: 42.0, umurBulan: 7 },
      { tanggal: '2023-03-01', bb: 8.2, tb: 70.5, lk: 43.5, umurBulan: 10 },
      { tanggal: '2023-06-01', bb: 8.9, tb: 74.0, lk: 44.8, umurBulan: 13 },
      { tanggal: '2023-12-01', bb: 10.1,tb: 80.0, lk: 46.0, umurBulan: 19 },
      { tanggal: '2024-06-01', bb: 11.5,tb: 86.0, lk: 47.2, umurBulan: 25 },
    ],
  };

  const isFemale = data.jenisKelamin === 'Perempuan';
  const umurBulan = hitungUmurBulan(data.tanggalLahir);
  const lastRiwayat = data.riwayat[data.riwayat.length - 1];

  const charts = {
    bbu: {
      title: '⚖️ Berat Badan menurut Umur (BB/U)',
      subtitle: `Standar WHO • Anak ${data.jenisKelamin} • 0–60 bulan`,
      whoData: isFemale ? WHO_BBU_P : WHO_BBU_L,
      whoData2: WHO_BBU_L,
      whoData2F: WHO_BBU_P,
      field: 'bb',
      unit: 'kg',
      yDomain: [1, 32],
    },
    tbu: {
      title: '📏 Tinggi Badan menurut Umur (TB/U)',
      subtitle: `Standar WHO • Anak ${data.jenisKelamin} • 0–60 bulan`,
      whoData: isFemale ? WHO_TBU_P : WHO_TBU_L,
      whoData2: WHO_TBU_L,
      whoData2F: WHO_TBU_P,
      field: 'tb',
      unit: 'cm',
      yDomain: [40, 135],
    },
    lku: {
      title: '🔵 Lingkar Kepala menurut Umur (LK/U)',
      subtitle: `Standar WHO • Anak ${data.jenisKelamin} • 0–60 bulan`,
      whoData: isFemale ? WHO_LKU_P : WHO_LKU_L,
      whoData2: WHO_LKU_L,
      whoData2F: WHO_LKU_P,
      field: 'lk',
      unit: 'cm',
      yDomain: [30, 58],
    },
  };

  const active = charts[activeTab];

  // Filter balitaList untuk tabel
  const filteredList = useMemo(() => {
    if (!balitaList?.length) return [];
    const q = search.toLowerCase();
    return balitaList.filter(b =>
      !q ||
      (b.nama || '').toLowerCase().includes(q) ||
      (b.namaIbu || '').toLowerCase().includes(q) ||
      (b.nik || '').includes(q)
    );
  }, [balitaList, search]);

  function handleSelectBalita(b) {
    setSelectedId(b.id);
    setShowAll(false);
    if (onLoadRiwayat) onLoadRiwayat(b.id);
  }

  function handleShowAll() {
    setSelectedId(null);
    setShowAll(true);
  }

  function handleSelectFromChart(id) {
    const b = balitaList?.find(x => x.id === id);
    if (b) handleSelectBalita(b);
  }

  return (
    <div className="kms-root">
      {/* Header */}
      <div className="kms-header">
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, padding: '6px 12px', color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif',
              marginRight: 4,
            }}
          >
            ← Kembali
          </button>
        )}
        <div className="kms-header-icon">📈</div>
        <div>
          <div className="kms-title">
            {showAll ? 'Grafik KMS — Semua Balita' : `Grafik KMS — ${data.nama}`}
          </div>
          <div className="kms-subtitle">
            {showAll
              ? `${multiSeries?.length || 0} balita dengan data pemantauan`
              : `${isFemale ? '👧' : '👦'} ${data.jenisKelamin} · Lahir: ${new Date(data.tanggalLahir).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })} · Umur saat ini: ${formatUmur(umurBulan)}`
            }
          </div>
        </div>
        {!showAll && (
          <button
            onClick={handleShowAll}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, padding: '6px 12px', color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif',
              marginLeft: 8,
            }}
          >
            📊 Tampilkan Semua
          </button>
        )}
        {!showAll && lastRiwayat && (
          <div className="kms-info">
            <div className="kms-info-item">
              <div className="kms-info-val">{lastRiwayat.bb || lastRiwayat.beratBadan} <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.6)' }}>kg</span></div>
              <div className="kms-info-lbl">BB Terakhir</div>
            </div>
            <div className="kms-info-item">
              <div className="kms-info-val">{lastRiwayat.tb || lastRiwayat.tinggiBadan} <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.6)' }}>cm</span></div>
              <div className="kms-info-lbl">TB Terakhir</div>
            </div>
            {(lastRiwayat.lk || lastRiwayat.lingkarKepala) && (
              <div className="kms-info-item">
                <div className="kms-info-val">{lastRiwayat.lk || lastRiwayat.lingkarKepala} <span style={{ fontSize: 11, color: 'rgba(245,158,11,0.6)' }}>cm</span></div>
                <div className="kms-info-lbl">LK Terakhir</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <KMSChart
        key={activeTab + (showAll ? 'all' : (data.id || 'demo'))}
        title={active.title}
        subtitle={showAll
          ? `Semua balita (👦 Laki-laki + 👧 Perempuan) · 0–60 bulan`
          : active.subtitle
        }
        whoData={active.whoData}
        whoData2={showAll ? (isFemale ? active.whoData2 : active.whoData2F) : null}
        riwayat={showAll ? null : data.riwayat}
        field={active.field}
        unit={active.unit}
        yDomain={active.yDomain}
        tanggalLahir={data.tanggalLahir}
        multiSeries={showAll ? multiSeries : null}
        selectedId={selectedId}
        onSelectBalita={handleSelectFromChart}
      />

      {/* Jumlah pengukuran */}
      {!showAll && (
        <div style={{
          textAlign: 'center', fontSize: 11, color: '#CBD5E1', padding: '4px 0 8px',
          fontStyle: 'italic',
        }}>
          {data.riwayat.length} kali pengukuran tercatat • Data terakhir: {lastRiwayat
            ? new Date(lastRiwayat.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
            : '–'}
        </div>
      )}

      {/* ══ Tabel Daftar Balita ═════════════════════════════════ */}
      {balitaList?.length > 0 && (
        <div className="chart-card anim" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="chart-title">📋 Daftar Balita Terdaftar</div>
              <div className="chart-sub">Klik baris untuk melihat grafik KMS balita</div>
            </div>
            <input
              placeholder="🔍 Cari nama / NIK / ibu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB',
                fontSize: 12, fontFamily: 'inherit', outline: 'none',
                width: 200, background: '#F9FAFB',
              }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Nama</th>
                  <th style={thStyle}>NIK</th>
                  <th style={thStyle}>JK</th>
                  <th style={thStyle}>Umur</th>
                  <th style={thStyle}>Ibu</th>
                  <th style={thStyle}>BB</th>
                  <th style={thStyle}>TB</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(b => {
                  const last = b.riwayat?.[b.riwayat.length - 1];
                  const bb = last ? (last.bb || last.beratBadan) : (b.beratBadan || '—');
                  const tb = last ? (last.tb || last.tinggiBadan) : (b.tinggiBadan || '—');
                  const umur = b.umurBulan ?? hitungUmurBulan(b.tanggalLahir);
                  const status = b.statusStunting || '—';
                  const sc = STATUS_COLORS[status] || '#9E9E9E';
                  const isActive = b.id === selectedId;
                  return (
                    <tr
                      key={b.id}
                      onClick={() => handleSelectBalita(b)}
                      style={{
                        cursor: 'pointer', transition: 'background 0.15s',
                        background: isActive ? '#EFF6FF' : undefined,
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = ''; }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600, color: isActive ? '#1D4ED8' : '#0F172A' }}>
                        {isActive ? '▶ ' : ''}{b.nama}
                      </td>
                      <td style={tdStyle}>{b.nik || '—'}</td>
                      <td style={tdStyle}>{b.jenisKelamin === 'Laki-laki' ? '👦' : '👧'}</td>
                      <td style={tdStyle}>{formatUmur(umur)}</td>
                      <td style={tdStyle}>{b.namaIbu || '—'}</td>
                      <td style={tdStyle}>{bb !== '—' ? `${bb} kg` : '—'}</td>
                      <td style={tdStyle}>{tb !== '—' ? `${tb} cm` : '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                          fontSize: 10, fontWeight: 700, color: '#fff', background: sc,
                        }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#94A3B8', padding: 24 }}>
                      Tidak ada balita ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {balitaList.length > 0 && (
            <div style={{ textAlign: 'right', fontSize: 11, color: '#CBD5E1', marginTop: 8 }}>
              {filteredList.length} dari {balitaList.length} balita
            </div>
          )}
        </div>
      )}
    </div>
  );
}