// ============================================================
//  UI COMPONENTS — padanan W_ (Widget) di Flutter
//  Ini komponen kecil yang dipakai berulang di banyak halaman
// ============================================================

import React from 'react';
import { statusColor } from '../../utils/helpers';

// ── StatusBadge ───────────────────────────────────────────────
// Padanan: StatusBadge widget di W_dashboard.dart
export function StatusBadge({ status }) {
  const c = statusColor[status] || statusColor['Belum diukur'];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
}

// ── StatCard ──────────────────────────────────────────────────
// Padanan: DashStatCard di W_dashboard.dart
export function StatCard({ label, value, icon, color, bg, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: '20px',
      boxShadow: `0 4px 20px ${color}18`,
      border: '1px solid #F0F0F0', flex: 1, minWidth: 0,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: bg,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: 20, marginBottom: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9E9E9E', marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#BDBDBD', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style = {}, padding = 20 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid #F0F0F0', padding,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      ...style
    }}>
      {children}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{title}</h3>
      {action && (
        <button onClick={onAction} style={{
          background:'none', border:'none', color:'#1B6B3A',
          fontSize: 12, fontWeight: 600, cursor:'pointer', padding:'4px 8px'
        }}>{action}</button>
      )}
    </div>
  );
}

// ── Badge label role ──────────────────────────────────────────
const roleStyle = {
  admin:     { bg:'#EFF6FF', text:'#1D4ED8' },
  bidan:     { bg:'#F0FDF4', text:'#15803D' },
  kader:     { bg:'#FFF7ED', text:'#C2410C' },
  orang_tua: { bg:'#F5F3FF', text:'#6D28D9' },
};
export function RoleBadge({ role }) {
  const s = roleStyle[role] || { bg:'#F9FAFB', text:'#374151' };
  const label = { admin:'Admin', bidan:'Bidan', kader:'Kader', orang_tua:'Orang Tua' }[role] || role;
  return (
    <span style={{
      padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
      background: s.bg, color: s.text
    }}>{label}</span>
  );
}

// ── Tipe jadwal badge ─────────────────────────────────────────
const tipeStyle = {
  posyandu:  { bg:'#F0FDF4', text:'#16A34A', icon:'🏥' },
  imunisasi: { bg:'#EFF6FF', text:'#2563EB', icon:'💉' },
  penyuluhan:{ bg:'#FFF7ED', text:'#EA580C', icon:'📚' },
  pmt:       { bg:'#FDF4FF', text:'#9333EA', icon:'🍱' },
};
export function TipeBadge({ tipe }) {
  const s = tipeStyle[tipe] || { bg:'#F9FAFB', text:'#6B7280', icon:'📅' };
  return (
    <span style={{
      padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
      background:s.bg, color:s.text, display:'inline-flex', alignItems:'center', gap:4
    }}>
      {s.icon} {tipe}
    </span>
  );
}

// ── Input field ───────────────────────────────────────────────
export function InputField({ label, value, onChange, type='text', placeholder, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6B7280', marginBottom:6 }}>
          {label}{required && <span style={{color:'#DC2626'}}> *</span>}
        </label>
      )}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', padding:'10px 14px', borderRadius:10,
          border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'inherit',
          outline:'none', boxSizing:'border-box', background:'#F9FAFB',
          transition:'border-color .2s'
        }}
        onFocus={e => e.target.style.borderColor='#1B6B3A'}
        onBlur={e => e.target.style.borderColor='#E5E7EB'}
      />
    </div>
  );
}

// ── Select dropdown ───────────────────────────────────────────
export function SelectField({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6B7280', marginBottom:6 }}>
          {label}
        </label>
      )}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width:'100%', padding:'10px 14px', borderRadius:10,
          border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'inherit',
          outline:'none', background:'#F9FAFB', cursor:'pointer',
        }}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────
export function Button({ children, onClick, variant='primary', size='md', disabled, style={} }) {
  const base = {
    fontFamily:'inherit', fontWeight:700, cursor: disabled?'not-allowed':'pointer',
    border:'none', borderRadius:10, transition:'all .15s', display:'inline-flex',
    alignItems:'center', gap:6, opacity: disabled?0.6:1,
  };
  const sizes = { sm:{padding:'7px 14px',fontSize:12}, md:{padding:'10px 20px',fontSize:14}, lg:{padding:'13px 28px',fontSize:15} };
  const variants = {
    primary: { background:'#1B6B3A', color:'#fff' },
    danger:  { background:'#DC2626', color:'#fff' },
    ghost:   { background:'#F3F4F6', color:'#374151' },
    outline: { background:'transparent', color:'#1B6B3A', border:'1.5px solid #1B6B3A' },
  };
  return (
    <button onClick={disabled?undefined:onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width=480 }) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20
    }} onClick={onClose}>
      <div style={{
        background:'#fff', borderRadius:20, width:'100%', maxWidth:width,
        maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 25px 60px rgba(0,0,0,0.2)', animation:'fadeUp .2s ease'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'20px 24px', borderBottom:'1px solid #F0F0F0'
        }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{
            background:'#F3F4F6', border:'none', borderRadius:8,
            width:32, height:32, cursor:'pointer', fontSize:18, fontWeight:300,
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>×</button>
        </div>
        <div style={{ padding:'20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ emoji='📭', message='Tidak ada data' }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 20px', color:'#9E9E9E' }}>
      <div style={{ fontSize:48, marginBottom:12 }}>{emoji}</div>
      <div style={{ fontSize:14 }}>{message}</div>
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:'3px solid #E5E7EB', borderTopColor:'#1B6B3A',
        animation:'spin 0.8s linear infinite'
      }}/>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
export function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                textAlign:'left', padding:'10px 14px',
                background:'#F9FAFB', color:'#6B7280',
                fontSize:11, fontWeight:700, letterSpacing:.5,
                borderBottom:'1px solid #F0F0F0',
                whiteSpace:'nowrap'
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom:'1px solid #F9FAFB',
                cursor: onRowClick ? 'pointer' : 'default',
                transition:'background .12s'
              }}
              onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background=''}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding:'12px 14px', verticalAlign:'middle' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
