/* eslint-disable no-unused-vars */
// ============================================================
//  DashboardPage — REDESIGNED (Navy + Amber) + REAL DB DATA
// ============================================================

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

// ============================================================
// CSS
// ============================================================

const DASH_CSS = `
.dash-root { font-family: sans-serif; padding: 24px; }

.dash-banner{
border-radius:20px;
padding:24px;
margin-bottom:24px;
display:flex;
align-items:center;
gap:16px;
background:linear-gradient(135deg,#0A0F1E,#243347);
color:white;
}

.banner-title{
font-size:20px;
font-weight:700;
}

.banner-sub{
font-size:12px;
opacity:0.7;
}

.banner-actions{
margin-left:auto;
display:flex;
gap:10px;
}

.banner-btn{
background:#F59E0B;
border:none;
border-radius:10px;
padding:8px 14px;
font-size:12px;
cursor:pointer;
color:white;
}

.stat-grid{
display:flex;
gap:14px;
flex-wrap:wrap;
margin-bottom:20px;
}

.stat-card{
background:white;
border-radius:16px;
padding:16px;
flex:1;
min-width:160px;
border:1px solid #eee;
}

.stat-val{
font-size:30px;
font-weight:700;
}

.stat-lbl{
font-size:12px;
color:#64748B;
}

.panel{
background:white;
border-radius:18px;
padding:18px;
border:1px solid #eee;
}

.panel-hdr{
display:flex;
justify-content:space-between;
margin-bottom:14px;
font-weight:600;
}

.psy-item{
display:flex;
align-items:center;
padding:10px;
background:#F8FAFC;
border-radius:10px;
margin-bottom:6px;
}
`;

let injected = false;

function injectCSS() {
  if (injected || typeof document === "undefined") return;

  const el = document.createElement("style");
  el.innerHTML = DASH_CSS;
  document.head.appendChild(el);

  injected = true;
}

// ============================================================
// TOOLTIP
// ============================================================

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eee",
        padding: 10,
        borderRadius: 10,
        fontSize: 12
      }}
    >
      <strong>{label}</strong>

      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <b>{p.value}</b>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: 20 }}>{icon}</div>

      <div className="stat-val" style={{ color }}>
        {value}
      </div>

      <div className="stat-lbl">{label}</div>
    </div>
  );
}

// ============================================================
// PANEL
// ============================================================

function Panel({ title, children }) {
  return (
    <div className="panel">
      <div className="panel-hdr">{title}</div>
      {children}
    </div>
  );
}

// ============================================================
// TREND DATA
// ============================================================

const trenStunting = [
  { bulan: "Jan", normal: 45, risiko: 8, stunting: 2 },
  { bulan: "Feb", normal: 47, risiko: 7, stunting: 3 },
  { bulan: "Mar", normal: 43, risiko: 9, stunting: 4 },
  { bulan: "Apr", normal: 46, risiko: 6, stunting: 2 },
  { bulan: "Mei", normal: 48, risiko: 5, stunting: 1 },
  { bulan: "Jun", normal: 50, risiko: 4, stunting: 1 }
];

// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboard({
  statistik = {},
  upcomingJadwal = [],
  posyandu = [],
  onNav = () => {}
}) {
  injectCSS();

  const total = statistik.total || 0;
  const stunting = statistik.stunting || 0;
  const risiko = statistik.risiko || 0;

  const persen =
    total > 0 ? Math.round((stunting / total) * 100) : 0;

  const pieData = [
    { name: "Normal", value: statistik.normal || 0, color: "#16A34A" },
    { name: "Risiko", value: risiko, color: "#F59E0B" },
    { name: "Stunting", value: stunting, color: "#EF4444" }
  ];

  const topPosyandu = [...posyandu]
    .sort((a, b) => (b.totalBalita || 0) - (a.totalBalita || 0))
    .slice(0, 6);

  return (
    <div className="dash-root">
      {/* Banner */}

      <div className="dash-banner">
        <div>
          <div className="banner-title">Dashboard Admin</div>

          <div className="banner-sub">
            Monitoring {posyandu.length} Posyandu
          </div>
        </div>

        <div className="banner-actions">
          <button
            className="banner-btn"
            onClick={() => onNav("laporan")}
          >
            Laporan
          </button>

          <button
            className="banner-btn"
            onClick={() => onNav("pengguna")}
          >
            Pengguna
          </button>

          <button
            className="banner-btn"
            onClick={() => onNav("posyandu")}
          >
            Posyandu
          </button>
        </div>
      </div>

      {/* Stats */}

      <div className="stat-grid">
        <StatCard label="Total Balita" value={total} icon="👶" color="#2563EB" />

        <StatCard label="Stunting" value={stunting} icon="⚠️" color="#EF4444" />

        <StatCard label="Risiko" value={risiko} icon="📊" color="#F59E0B" />

        <StatCard
          label="Persentase Stunting"
          value={persen + "%"}
          icon="📉"
          color="#7C3AED"
        />
      </div>

      {/* Charts */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginBottom: 20
        }}
      >
        <Panel title="Tren Stunting 6 Bulan">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trenStunting}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="bulan" />

              <YAxis />

              <Tooltip content={<ChartTooltip />} />

              <Legend />

              <Area
                type="monotone"
                dataKey="normal"
                stroke="#16A34A"
                fill="#16A34A33"
              />

              <Area
                type="monotone"
                dataKey="risiko"
                stroke="#F59E0B"
                fill="#F59E0B33"
              />

              <Area
                type="monotone"
                dataKey="stunting"
                stroke="#EF4444"
                fill="#EF444433"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Distribusi Status">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Posyandu */}

      <Panel title="Status Posyandu">
        {topPosyandu.length === 0 ? (
          <div>Belum ada data posyandu</div>
        ) : (
          topPosyandu.map((p) => (
            <div key={p.id} className="psy-item">
              <div style={{ flex: 1 }}>
                <b>{p.nama}</b>

                <div style={{ fontSize: 11, color: "#888" }}>
                  {p.desa} , {p.kecamatan}
                </div>
              </div>

              <div style={{ fontWeight: 700 }}>
                {p.totalBalita || 0}
              </div>
            </div>
          ))
        )}
      </Panel>

      {/* Jadwal */}

      <Panel title="Jadwal Mendatang">
        {upcomingJadwal.length === 0 ? (
          <div>Tidak ada jadwal</div>
        ) : (
          upcomingJadwal.slice(0, 4).map((j) => {
            const date = j?.tanggal
              ? new Date(j.tanggal)
              : new Date();

            return (
              <div key={j.id} className="psy-item">
                <div>
                  <b>{j.judul}</b>

                  <div style={{ fontSize: 11 }}>
                    {date.toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export default function DashboardPage(props) {
  const { role } = props;

  if (role === "admin") {
    return <AdminDashboard {...props} />;
  }

  return (
    <div style={{ padding: 40 }}>
      Dashboard role {role}
    </div>
  );
}