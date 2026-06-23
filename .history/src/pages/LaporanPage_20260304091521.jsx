/* eslint-disable no-unused-vars */
// ============================================================
//  LaporanPage.jsx
//  PERUBAHAN:
//  1. isViewOnly: jika load data hari sebelumnya → view only
//     (tidak bisa tambah balita, tidak bisa simpan, tidak bisa hapus)
//  2. Guard Excel: jika belum simpan → muncul modal peringatan dulu
//  3. onPageFocus prop: dipanggil App.jsx tiap sidebar ke laporan
//     agar data ter-refresh
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Card, SectionHeader, Button } from '../components/ui/Components';
import { formatTanggal } from '../utils/helpers';
import { LaporanAPI } from '../services/api';
import { exportLaporanExcel } from './Excel/Excel_LaporanPage';
import ModalExcelInfo from './Excel/ModalExcelInfo';

// ── helpers ───────────────────────────────────────────────────
function isToday(dateStr) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth()    === t.getMonth()    &&
    d.getDate()     === t.getDate()
  );
}

// Apakah tanggal lebih dari hari ini (masa depan)?
function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(0,0,0,0);
  const t = new Date();
  t.setHours(0,0,0,0);
  return d > t;
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success:'#16A34A', error:'#DC2626', info:'#2563EB', warning:'#D97706' };
  const icons  = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  return (
    <div style={{
      position:'fixed', top:24, left:'50%', transform:'translateX(-50%)', zIndex:99999,
      padding:'14px 28px', borderRadius:14, background:colors[toast.type]||'#1F2937', color:'#fff',
      fontWeight:700, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
      display:'flex', alignItems:'center', gap:10, fontFamily:'inherit',
    }}>
      {icons[toast.type]} {toast.message}
    </div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, msg) { setToast({ type, message:msg }); setTimeout(()=>setToast(null), 3800); }
  return {
    toast,
    showSuccess: m => show('success', m),
    showError:   m => show('error', m),
    showInfo:    m => show('info', m),
    showWarning: m => show('warning', m),
  };
}

// ── Modal Peringatan Excel ─────────────────────────────────────
// Muncul jika user belum simpan tapi mau export Excel
function ModalExcelGuard({ onClose, onSimpan }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9998,
      display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        background:'#fff', borderRadius:20, width:420, padding:0,
        boxShadow:'0 20px 60px rgba(0,0,0,0.25)', overflow:'hidden',
      }} onClick={e=>e.stopPropagation()}>
        <div style={{
          padding:'18px 24px',
          background:'linear-gradient(135deg,#D97706,#B45309)',
          color:'#fff',
        }}>
          <div style={{ fontSize:17, fontWeight:800 }}>⚠️ Data Belum Disimpan</div>
          <div style={{ fontSize:12, opacity:0.85, marginTop:3 }}>
            Simpan data terlebih dahulu sebelum export Excel
          </div>
        </div>
        <div style={{ padding:'20px 24px' }}>
          <p style={{ margin:'0 0 16px', fontSize:13, color:'#374151', lineHeight:1.6 }}>
            Untuk memastikan data Excel sesuai dengan data terbaru,
            silakan <strong>simpan laporan terlebih dahulu</strong> sebelum melakukan export.
          </p>
          <div style={{
            padding:'10px 14px', background:'#FFFBEB',
            borderRadius:8, border:'1px solid #FDE68A',
            fontSize:12, color:'#92400E', marginBottom:20,
          }}>
            💡 Klik <strong>"Simpan Sekarang"</strong> lalu data akan tersimpan dan
            Excel dapat diunduh setelahnya.
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{
              padding:'10px 20px', background:'#F3F4F6', border:'none',
              borderRadius:8, cursor:'pointer', fontFamily:'inherit',
              fontWeight:600, fontSize:13, color:'#374151',
            }}>Batal</button>
            <button onClick={onSimpan} style={{
              padding:'10px 22px', background:'#1B6B3A', color:'#fff',
              border:'none', borderRadius:8, cursor:'pointer',
              fontFamily:'inherit', fontWeight:700, fontSize:13,
              display:'flex', alignItems:'center', gap:8,
            }}>
              💾 Simpan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Banner View Only (hari sebelumnya) ───────────────────────
function ViewOnlyBanner({ tanggal }) {
  return (
    <div style={{
      background:'linear-gradient(135deg,#FFF7ED,#FEF3C7)',
      border:'1.5px solid #FDE68A', borderRadius:12,
      padding:'12px 18px', marginBottom:16,
      display:'flex', alignItems:'center', gap:12,
    }}>
      <span style={{ fontSize:22 }}>👁️</span>
      <div>
        <div style={{ fontWeight:700, fontSize:13, color:'#92400E' }}>
          Mode Lihat Saja — Data Tanggal {tanggal}
        </div>
        <div style={{ fontSize:11, color:'#B45309', marginTop:2, lineHeight:1.6 }}>
          Data ini sudah dikunci — hanya bisa dilihat dan di-export.
          Tambah, simpan, dan hapus tidak tersedia untuk data hari sebelumnya.
        </div>
        <div style={{ marginTop:6, display:'flex', gap:12, fontSize:10 }}>
          <span style={{ color:'#16A34A', fontWeight:700 }}>🔗 DB = dari database balita</span>
          <span style={{ color:'#7C3AED', fontWeight:700 }}>✏️ Manual = input manual</span>
        </div>
      </div>
    </div>
  );
}

// ── Banner Tanggal Masa Depan ─────────────────────────────────
function FutureDateBanner({ tanggal }) {
  return (
    <div style={{
      background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
      border:'1.5px solid #93C5FD', borderRadius:12,
      padding:'14px 18px', marginBottom:16,
      display:'flex', alignItems:'center', gap:14,
    }}>
      <span style={{ fontSize:26 }}>📅</span>
      <div>
        <div style={{ fontWeight:700, fontSize:13, color:'#1D4ED8' }}>
          Tanggal {tanggal} Belum Tiba
        </div>
        <div style={{ fontSize:11, color:'#3B82F6', marginTop:3, lineHeight:1.5 }}>
          Tanggal yang dipilih lebih dari hari ini — belum ada data untuk periode ini.
          Silahkan isi dan simpan data ketika tanggal tersebut sudah tiba.
        </div>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────
function Field({ label, value, onChange, type='text', placeholder, disabled, min }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>{label}</label>}
      <input type={type} value={value||''} placeholder={placeholder} disabled={disabled} min={min}
        onChange={e=>onChange?.(e.target.value)}
        style={{
          width:'100%', padding:'9px 12px', borderRadius:8,
          border:'1.5px solid #E5E7EB', fontSize:13,
          fontFamily:'inherit', outline:'none', boxSizing:'border-box',
          background:disabled?'#F9FAFB':'#fff', color:disabled?'#9E9E9E':'#1A1A1A',
        }}
        onFocus={e=>{ if(!disabled) e.target.style.borderColor='#1B6B3A'; }}
        onBlur={e=>e.target.style.borderColor='#E5E7EB'}
      />
    </div>
  );
}

function hitungUmur(tanggalLahir) {
  if (!tanggalLahir) return 0;
  const tgl = new Date(tanggalLahir), today = new Date();
  let b = (today.getFullYear()-tgl.getFullYear())*12 + (today.getMonth()-tgl.getMonth());
  if (today.getDate() < tgl.getDate()) b--;
  return Math.max(0, b);
}

function fmtTgl(raw) {
  if (!raw) return '-';
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  const dd = String(d.getDate()).padStart(2,'0');
  return `${dd} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

const BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const defaultKegiatan = () => ({
  s_L_0_5:0,s_P_0_5:0,s_L_6_11:0,s_P_6_11:0,s_L_12_23:0,s_P_12_23:0,s_L_24_60:0,s_P_24_60:0,
  k_L_0_5:0,k_P_0_5:0,k_L_6_11:0,k_P_6_11:0,k_L_12_23:0,k_P_12_23:0,k_L_24_60:0,k_P_24_60:0,
  n_L_0_5:0,n_P_0_5:0,n_L_6_11:0,n_P_6_11:0,n_L_12_23:0,n_P_12_23:0,n_L_24_60:0,n_P_24_60:0,
  t_L_0_5:0,t_P_0_5:0,t_L_6_11:0,t_P_6_11:0,t_L_12_23:0,t_P_12_23:0,t_L_24_60:0,t_P_24_60:0,
  o_L_0_5:0,o_P_0_5:0,o_L_6_11:0,o_P_6_11:0,o_L_12_23:0,o_P_12_23:0,o_L_24_60:0,o_P_24_60:0,
  b_L_0_5:0,b_P_0_5:0,b_L_6_11:0,b_P_6_11:0,b_L_12_23:0,b_P_12_23:0,b_L_24_60:0,b_P_24_60:0,
  d_L_0_5:0,d_P_0_5:0,d_L_6_11:0,d_P_6_11:0,d_L_12_23:0,d_P_12_23:0,d_L_24_60:0,d_P_24_60:0,
  m_L_0_5:0,m_P_0_5:0,m_L_6_11:0,m_P_6_11:0,m_L_12_23:0,m_P_12_23:0,m_L_24_60:0,m_P_24_60:0,
  bgm_L_0_5:0,bgm_P_0_5:0,bgm_L_6_11:0,bgm_P_6_11:0,bgm_L_12_23:0,bgm_P_12_23:0,bgm_L_24_60:0,bgm_P_24_60:0,
  vitAbayiFeb_L_0_5:0,vitAbayiFeb_P_0_5:0,vitAbayiFeb_L_6_11:0,vitAbayiFeb_P_6_11:0,
  vitAbayiFeb_L_12_23:0,vitAbayiFeb_P_12_23:0,vitAbayiFeb_L_24_60:0,vitAbayiFeb_P_24_60:0,
  vitAbalitaFeb_L_0_5:0,vitAbalitaFeb_P_0_5:0,vitAbalitaFeb_L_6_11:0,vitAbalitaFeb_P_6_11:0,
  vitAbalitaFeb_L_12_23:0,vitAbalitaFeb_P_12_23:0,vitAbalitaFeb_L_24_60:0,vitAbalitaFeb_P_24_60:0,
  asi_L_0_5:0,asi_P_0_5:0,asi_L_6_11:0,asi_P_6_11:0,asi_L_12_23:0,asi_P_12_23:0,asi_L_24_60:0,asi_P_24_60:0,
  bawahGarisMerah:0,vitA_Bayi_Feb:0,vitA_Bayi_Ags:0,vitA_Balita_Feb:0,vitA_Balita_Ags:0,
  jumlahHamil:0,jumlahPersalinan:0,
});

// ── Modal Pilih dari DB ───────────────────────────────────────
function ModalPilihBalita({ title, subtitle, balitaList, onSelect, onClose, sudahDipilih }) {
  const [search, setSearch]           = useState('');
  const [selectedIbu, setSelectedIbu] = useState(null);

  const filtered = balitaList.filter(b => {
    const q = search.toLowerCase();
    if (!q) return false;
    return (b.namaIbu||'').toLowerCase().includes(q) || (b.nama||'').toLowerCase().includes(q);
  });
  const ibuOptions = filtered.reduce((acc, b) => {
    const key = b.namaIbu || b.nama;
    if (!acc.find(x => (x.namaIbu||x.nama) === key)) acc.push(b);
    return acc;
  }, []);
  const anakDariIbu = selectedIbu ? balitaList.filter(b => b.namaIbu === selectedIbu) : [];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:560, maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>{title}</h3>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>{subtitle}</p>
        </div>
        <div style={{ padding:'16px 24px', flex:1, overflowY:'auto' }}>
          <input placeholder="🔍 Ketik nama anak atau nama ibu..." value={search} autoFocus
            onChange={e=>{ setSearch(e.target.value); setSelectedIbu(null); }}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:12 }}/>

          {!selectedIbu && search && ibuOptions.length > 0 && (
            <div style={{ border:'1px solid #F0F0F0', borderRadius:10, overflow:'hidden' }}>
              {ibuOptions.map((b,i) => (
                <div key={i} onClick={()=>setSelectedIbu(b.namaIbu)}
                  style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', gap:12, background:'#fff' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F0FDF4'}
                  onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <span style={{ fontSize:24 }}>👩</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{b.namaIbu||'-'}</div>
                    <div style={{ fontSize:11, color:'#9E9E9E' }}>{b.desa||b.namaPosyandu||'-'}</div>
                  </div>
                  <span style={{ fontSize:12, color:'#16A34A', fontWeight:700, background:'#F0FDF4', padding:'2px 10px', borderRadius:20 }}>
                    {balitaList.filter(x=>x.namaIbu===b.namaIbu).length} anak
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedIbu && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <button onClick={()=>setSelectedIbu(null)} style={{ background:'none', border:'none', color:'#2563EB', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>← Kembali</button>
                <span style={{ fontSize:13, fontWeight:700, color:'#1B6B3A' }}>👩 {selectedIbu}</span>
              </div>
              {anakDariIbu.map(b => {
                const umur  = hitungUmur(b.tanggalLahir);
                const sudah = sudahDipilih?.find(r => r.balitaId === b.id);
                return (
                  <div key={b.id} style={{ padding:'14px', borderRadius:12, background:'#F9FAFB', marginBottom:10, border:'1px solid #E5E7EB' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', background:b.jenisKelamin==='Laki-laki'?'#EFF6FF':'#FDF2F8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                        {b.jenisKelamin==='Laki-laki'?'👦':'👧'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{b.nama}</div>
                        <div style={{ fontSize:11, color:'#9E9E9E' }}>{umur} bln • {b.jenisKelamin}{b.nik?` • NIK: ${b.nik}`:''}</div>
                        {b.tanggalLahir && <div style={{ fontSize:11, color:'#6B7280' }}>Lahir: {b.tanggalLahir?.split('T')[0]}</div>}
                        {(b.beratBadan||b.tinggiBadan) && <div style={{ fontSize:11, color:'#16A34A', fontWeight:600 }}>📊 BB {b.beratBadan}kg • TB {b.tinggiBadan}cm</div>}
                      </div>
                    </div>
                    {sudah
                      ? <span style={{ fontSize:11, color:'#16A34A', fontWeight:700, padding:'5px 12px', background:'#F0FDF4', borderRadius:8, border:'1px solid #BBF7D0' }}>✅ Sudah ditambahkan</span>
                      : <button onClick={()=>onSelect(b)} style={{ padding:'6px 14px', background:'#1B6B3A', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>+ Tambahkan</button>
                    }
                  </div>
                );
              })}
            </div>
          )}

          {search && !selectedIbu && ibuOptions.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🔍</div>
              <div style={{ fontWeight:600, marginBottom:6 }}>Tidak ada hasil untuk "{search}"</div>
            </div>
          )}
          {!search && (
            <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>👆</div>
              <div style={{ fontSize:13 }}>Ketik nama anak atau ibu untuk mencari</div>
            </div>
          )}
        </div>
        <div style={{ padding:'12px 24px', borderTop:'1px solid #F0F0F0', flexShrink:0, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Input Manual ────────────────────────────────────────
function ModalManual({ mode, onSave, onClose }) {
  const [form, setForm] = useState({
    namaBalita:'', tglLahir:'', jenisKelamin:'L', namaOrtu:'', namaAyah:'', noTlp:'', alamat:'',
    pekerjaan:'', bb:'', tb:'', nik:'', noKK:'',
  });
  const umur = hitungUmur(form.tglLahir);
  function f(k,v) { setForm(p=>({...p,[k]:v})); }
  const titles = { asi:'Tambah Manual — ASI Eksklusif', gizi:'Tambah Manual — Gizi Buruk & Kurus', pemantauan:'Tambah Manual — Pemantauan Pertumbuhan' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1001, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:500, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>{titles[mode]}</h3>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>Data tidak ter-link ke database balita</p>
        </div>
        <div style={{ padding:'16px 24px', overflowY:'auto', flex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Field label="Nama Balita *" value={form.namaBalita} onChange={v=>f('namaBalita',v)}/>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Tgl Lahir *</label>
              <input type="date" value={form.tglLahir} onChange={e=>f('tglLahir',e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
            </div>
          </div>
          {form.tglLahir && (
            <div style={{ padding:'8px 12px', background:'#F0FDF4', borderRadius:8, fontSize:12, color:'#16A34A', fontWeight:600, marginBottom:12 }}>
              📅 Umur: <strong>{umur} bulan</strong>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Jenis Kelamin</label>
              <select value={form.jenisKelamin} onChange={e=>f('jenisKelamin',e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                <option value="L">Laki-laki</option><option value="P">Perempuan</option>
              </select>
            </div>
            <Field label="Nama Ibu" value={form.namaOrtu} onChange={v=>f('namaOrtu',v)}/>
            <Field label="Nama Ayah" value={form.namaAyah} onChange={v=>f('namaAyah',v)}/>
            {(mode==='gizi'||mode==='pemantauan') && <>
              <Field label="BB (kg)" type="number" value={form.bb} onChange={v=>f('bb',v)} placeholder="kg"/>
              <Field label="TB/PB (cm)" type="number" value={form.tb} onChange={v=>f('tb',v)} placeholder="cm"/>
            </>}
            {mode==='gizi' && <Field label="Pekerjaan Ortu" value={form.pekerjaan} onChange={v=>f('pekerjaan',v)}/>}
            {mode==='pemantauan' && <>
              <Field label="NIK" value={form.nik} onChange={v=>f('nik',v)}/>
              <Field label="No. Telepon" value={form.noTlp} onChange={v=>f('noTlp',v)}/>
            </>}
          </div>
          {mode==='pemantauan' && <Field label="Alamat" value={form.alamat} onChange={v=>f('alamat',v)}/>}
          <div style={{ padding:'10px 12px', background:'#FFFBEB', borderRadius:8, border:'1px solid #FDE68A', fontSize:11, color:'#92400E' }}>
            ℹ️ Data manual tidak terhubung ke database balita.
          </div>
        </div>
        <div style={{ padding:'14px 24px', borderTop:'1px solid #F0F0F0', flexShrink:0, display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>Batal</button>
          <button onClick={()=>{ if(!form.namaBalita) return; onSave({...form, umurBulan:umur}); onClose(); }}
            style={{ padding:'8px 18px', background:'#1B6B3A', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}>
            ✅ Simpan Manual
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tombol Tambah (DB + Manual) ───────────────────────────────
function TambahButtons({ labelDB, labelManual, onDB, onManual, colorDB='#1B6B3A', colorManual='#6D28D9', disabled }) {
  const disabledStyle = { opacity:0.45, cursor:'not-allowed', pointerEvents:'none' };
  return (
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={disabled ? undefined : onManual}
        style={{ padding:'8px 14px', background:colorManual, color:'#fff', border:'none', borderRadius:8,
          cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12,
          ...(disabled ? disabledStyle : {}),
        }}>
        ✏️ {labelManual}
      </button>
      <button onClick={disabled ? undefined : onDB}
        style={{ padding:'8px 14px', background:colorDB, color:'#fff', border:'none', borderRadius:8,
          cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12,
          ...(disabled ? disabledStyle : {}),
        }}>
        🔗 {labelDB}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
//  Props baru: onRefresh — dipanggil dari App.jsx tiap kali
//              halaman ini aktif (sidebar navigation)
// ═══════════════════════════════════════════════════════════════
export default function LaporanPage({ balitaList = [], currentUser = null, onRefresh }) {
  const { toast, showSuccess, showError, showInfo, showWarning } = useToast();

  function defaultInfo() {
    return {
      namaPosyandu:       currentUser?.posyandu || '',
      dusun:              '',
      desa:               '',
      petugasLapangan:    currentUser?.nama     || '',
      jumlahKader:        '',
      bulan:              BULAN_LIST[new Date().getMonth()],
      tahun:              String(new Date().getFullYear()),
      tanggalPelaksanaan: '',
      tanggalPencatatan:  '',
      ketuaKader:         '',
    };
  }

  const [filterTanggal, setFilterTanggal] = useState('');
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [laporanId, setLaporanId]         = useState(null);
  const [isSaved, setIsSaved]             = useState(false);
  const [saving, setSaving]               = useState(false);

  // ── VIEW ONLY: true jika data hari sebelumnya ───────────────
  const [isViewOnly, setIsViewOnly]     = useState(false);
  const [viewOnlyDate, setViewOnlyDate] = useState('');
  // ── FUTURE DATE: true jika tanggal dipilih > hari ini ────────
  const [isFuture, setIsFuture]         = useState(false);
  const [futureDateStr, setFutureDateStr] = useState('');

  // ── Modal states ─────────────────────────────────────────────
  const [showModalExcel, setShowModalExcel]   = useState(false);
  const [showExcelGuard, setShowExcelGuard]   = useState(false);

  const [info, setInfo]         = useState(defaultInfo());
  const [kegiatan, setKegiatan] = useState(defaultKegiatan());

  const [asiRows, setAsiRows]   = useState([]);
  const [giziRows, setGiziRows] = useState([]);
  const [pemRows, setPemRows]   = useState([]);

  const [modalDB,     setModalDB]     = useState(null);
  const [modalManual, setModalManual] = useState(null);

  // ── Refresh saat halaman aktif (dari App.jsx) ─────────────────
  // onRefresh dipanggil App setiap kali user klik sidebar 'laporan'
  useEffect(() => {
    if (typeof onRefresh === 'function') {
      // Panggil onRefresh jika ada — App.jsx bisa pakai ini
      // untuk trigger ulang fetch data global (balitaList, dst)
      onRefresh();
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (currentUser) {
      setInfo(prev => ({
        ...prev,
        namaPosyandu:    prev.namaPosyandu    || currentUser.posyandu || '',
        petugasLapangan: prev.petugasLapangan || currentUser.nama     || '',
      }));
    }
  }, [currentUser]);

  // ── Load laporan ────────────────────────────────────────────
  async function handleFilterTanggal() {
    if (!filterTanggal) { showError('Pilih tanggal pencatatan terlebih dahulu'); return; }
    setLoadingFilter(true);
    try {
      const res = await LaporanAPI.getByTanggal(filterTanggal);

      // Tentukan mode berdasarkan tanggal:
      // - masa lalu  → view only (dikunci)
      // - hari ini   → edit normal
      // - masa depan → TIDAK dikunci, hanya info banner
      const future   = isFutureDate(filterTanggal);
      const viewOnly = !isToday(filterTanggal) && !future;
      setIsViewOnly(viewOnly);
      setViewOnlyDate(fmtTgl(filterTanggal));
      setIsFuture(future);
      setFutureDateStr(fmtTgl(filterTanggal));

      if (res?.status?.code === 200 && res.data) {
        const d = res.data;
        setLaporanId(d.id);
        setInfo({
          namaPosyandu:       d.namaPosyandu        || currentUser?.posyandu || '',
          dusun:              d.dusun               || '',
          desa:               d.desa                || '',
          petugasLapangan:    d.petugasLapangan     || currentUser?.nama || '',
          jumlahKader:        d.jumlahKaderAktif    || '',
          bulan:              d.bulan               || BULAN_LIST[new Date().getMonth()],
          tahun:              String(d.tahun        || new Date().getFullYear()),
          tanggalPelaksanaan: d.tanggalPelaksanaan?.split('T')[0] || '',
          tanggalPencatatan:  d.tanggalPencatatan?.split('T')[0]  || '',
          ketuaKader:         d.ketuaKader          || '',
        });
        if (d.kegiatan) {
          const k = d.kegiatan;
          const fields = [
            's_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60',
            'k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60',
            'n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60',
            't_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60',
            'o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60',
            'b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60',
            'd_L_0_5','d_P_0_5','d_L_6_11','d_P_6_11','d_L_12_23','d_P_12_23','d_L_24_60','d_P_24_60',
            'm_L_0_5','m_P_0_5','m_L_6_11','m_P_6_11','m_L_12_23','m_P_12_23','m_L_24_60','m_P_24_60',
            'bgm_L_0_5','bgm_P_0_5','bgm_L_6_11','bgm_P_6_11','bgm_L_12_23','bgm_P_12_23','bgm_L_24_60','bgm_P_24_60',
            'bawahGarisMerah','vitA_Bayi_Feb','vitA_Bayi_Ags','vitA_Balita_Feb','vitA_Balita_Ags',
            'jumlahHamil','jumlahPersalinan',
          ];
          const loaded = {};
          fields.forEach(fk => { loaded[fk] = k[fk] || ''; });
          setKegiatan(loaded);
        }
        if (d.asiRows?.length) setAsiRows(d.asiRows.map(r=>({
          balitaId:   r.balitaId  || null,
          namaBalita: r.namaBalita || r.namaAnak || r.nama || '',
          tglLahir:   r.tglLahir  || '',
          umurBulan:  r.umurBulan || hitungUmur(r.tglLahir),
          e0:!!r.e0, e1:!!r.e1, e2:!!r.e2, e3:!!r.e3, e4:!!r.e4, e5:!!r.e5, e6:!!r.e6,
          // simpan ibu & ayah terpisah untuk tampilan
          namaIbu:   r.namaIbu  || (r.balitaId ? (r.namaOrtu||'') : ''),
          namaAyah:  r.namaAyah || '',
          namaOrtu:  r.namaOrtu || r.namaIbu || '',
          _isManual: !r.balitaId,
        })));
        if (d.giziRows?.length) setGiziRows(d.giziRows.map(r=>({
          balitaId:   r.balitaId  || null,
          namaBalita: r.namaBalita || r.namaAnak || r.nama || '',
          tglLahir:   r.tglLahir  || '',
          umurBulan:  r.umurBulan || hitungUmur(r.tglLahir),
          namaIbu:    r.namaIbu   || (r.balitaId ? (r.namaOrtu||'') : ''),
          namaAyah:   r.namaAyah  || '',
          namaOrtu:   r.namaOrtu  || r.namaIbu || '',
          pekerjaan:  r.pekerjaan || '',
          bb: r.bb || '',
          tb: r.tb || r.pb || '',
          _isManual: !r.balitaId,
        })));
        if (d.pemantauanRows?.length) setPemRows(d.pemantauanRows.map(r=>({
          balitaId:  r.balitaId || null,
          noKK:      r.noKK     || '',
          nik:       r.nik      || '',
          anakKe:    r.anakKe   || '',
          // namaAnak fallback ke namaBalita (untuk data manual)
          namaAnak:  r.namaAnak || r.namaBalita || r.nama || '',
          tglLahir:  r.tglLahir || '',
          // lp fallback ke jenisKelamin singkat
          lp: r.lp || (r.jenisKelamin==='Laki-laki'?'L':r.jenisKelamin==='Perempuan'?'P':r.jenisKelamin||''),
          usiaKehamilanLahir: r.usiaKehamilanLahir || '',
          bbl:    r.bbl || '', pbl:    r.pbl || '', ukaLahir: r.ukaLahir || '',
          namaIbu:  r.namaIbu  || r.namaOrtu || '',
          namaAyah: r.namaAyah || '',
          namaOrtu: r.namaOrtu || '',
          nikAyah:  r.nikAyah  || '',
          noTlp:    r.noTlp    || '',
          alamat:   r.alamat   || '',
          rt: r.rt || '', rw: r.rw || '',
          tglUkur:    r.tglUkur    || '',
          bb:         r.bb         || '',
          pb:         r.pb         || '',
          // tglUkurBaru/bbBaru/pbBaru: jika sudah ada di DB pakai, jika tidak kosongkan
          tglUkurBaru: r.tglUkurBaru || '',
          bbBaru:      r.bbBaru      || '',
          pbBaru:      r.pbBaru      || '',
          lila: r.lila || '', lika: r.lika || '',
          statusNTO:       r.statusNTO       || '',
          asiEksklusif:    r.asiEksklusif    || '',
          vitAFeb:         r.vitAFeb         || '',
          bukuKIA:         r.bukuKIA         || '',
          ketPerkembangan: r.ketPerkembangan || '',
          pkat:            r.pkat            || '',
          catatan:         r.catatan         || '',
          _bbLalu:        r.bbLalu        || r.bb  || '',
          _tbLalu:        r.tbLalu        || r.pb  || '',
          _tglUkurLalu:   r.tglUkurLalu   || r.tglUkur || '',
          _statusStunting: r.statusStunting || '',
          _statusGizi:     r.statusGizi     || '',
          _isManual: !r.balitaId,
        })));
        setIsSaved(true);
        if (viewOnly) {
          showInfo(`📅 Memuat data ${fmtTgl(filterTanggal)} — mode lihat saja`);
        } else {
          showSuccess(`Laporan tanggal ${filterTanggal} berhasil dimuat!`);
        }
      } else {
        if (viewOnly) {
          showInfo(`Tidak ada laporan untuk tanggal ${fmtTgl(filterTanggal)}.`);
        } else if (future) {
          // Tanggal masa depan → form kosong, bisa diisi, tampilkan banner info
          setLaporanId(null);
          setInfo({ ...defaultInfo(), tanggalPencatatan: filterTanggal });
          setKegiatan(defaultKegiatan());
          setAsiRows([]); setGiziRows([]); setPemRows([]);
          setIsSaved(false);
          showInfo(`📅 Tanggal ${fmtTgl(filterTanggal)} belum tiba — form siap diisi.`);
        } else {
          showInfo('Tidak ada laporan. Form dikosongkan untuk input baru.');
          setLaporanId(null);
          setInfo({ ...defaultInfo(), tanggalPencatatan: filterTanggal });
          setKegiatan(defaultKegiatan());
          setAsiRows([]); setGiziRows([]); setPemRows([]);
          setIsSaved(false);
        }
      }
    } catch(err) { console.error(err); showError('Gagal memuat data.'); }
    finally { setLoadingFilter(false); }
  }

  function toDecimal(value, max=999.99) {
    if (value===''||value==null) return null;
    let n = Number(value);
    if (Number.isNaN(n)) return null;
    if (n>max) n=max;
    if (n<-max) n=-max;
    return Math.round(n*100)/100;
  }

  // ── Simpan ──────────────────────────────────────────────────
  async function handleSimpan() {
    // Tidak bisa simpan jika view-only
    if (isViewOnly) {
      showWarning('Data hari sebelumnya tidak dapat diubah.');
      return;
    }
    if (!info.namaPosyandu || !info.tanggalPencatatan) {
      showError('Nama Posyandu dan Tanggal Pencatatan wajib diisi');
      return;
    }
    const kegiatanNormalized = Object.fromEntries(
      Object.entries(kegiatan).map(([k,v]) => [k, v===''||v==null ? 0 : Number(v)])
    );
    const pemRowsNormalized = pemRows.map(r => ({
      ...r,
      usiaKehamilanLahir: r.usiaKehamilanLahir===''||r.usiaKehamilanLahir==null ? null : Number(r.usiaKehamilanLahir),
      tglUkur:     r.tglUkur===''||r.tglUkur==null         ? null : new Date(r.tglUkur),
      tglUkurBaru: r.tglUkurBaru===''||r.tglUkurBaru==null ? null : new Date(r.tglUkurBaru),
      tglLahir:    r.tglLahir===''||r.tglLahir==null       ? null : new Date(r.tglLahir),
      bbl:  toDecimal(r.bbl,999.99), pbl:  toDecimal(r.pbl,999.99),
      ukaLahir: toDecimal(r.ukaLahir,99.99),
      bb:   toDecimal(r.bb,999.99),  pb:   toDecimal(r.pb,999.99),
      bbBaru: toDecimal(r.bbBaru,999.99), pbBaru: toDecimal(r.pbBaru,999.99),
      lila: toDecimal(r.lila,99.99),
      asiEksklusif: r.asiEksklusif===''||r.asiEksklusif==null ? null : Number(r.asiEksklusif),
      vitAFeb:  r.vitAFeb===''||r.vitAFeb==null   ? null : Number(r.vitAFeb),
      bukuKIA:  r.bukuKIA===''||r.bukuKIA==null   ? null : Number(r.bukuKIA),
    }));
    const giziRowsNormalized = giziRows.map(r => ({
      ...r,
      bb: r.bb===''||r.bb==null ? null : Number(r.bb),
      tb: r.tb===''||r.tb==null ? null : Number(r.tb),
    }));

    setSaving(true);
    try {
      const payload = {
        id: laporanId, info, kegiatan: kegiatanNormalized,
        asiRows, giziRows: giziRowsNormalized,
        pemantauanRows: pemRowsNormalized,
      };
      const res = await LaporanAPI.simpan(payload);
      if (res?.status?.code === 200 || res?.status?.code === 201) {
        const isUpdate = laporanId !== null;
        showSuccess(`${isUpdate ? '✅ Data berhasil diperbarui' : '✅ Data berhasil disimpan'} (${info.tanggalPencatatan})`);
        setIsSaved(true);
        if (res.data?.id) setLaporanId(res.data.id);
      } else {
        showError(res?.status?.message || 'Gagal menyimpan data');
      }
    } catch(e) {
      console.error('Error saving:', e);
      showError('Gagal terhubung ke server: ' + (e.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  // ── Export Excel ─────────────────────────────────────────────
  // Jika belum disimpan → tampilkan guard modal
  // Jika view-only → langsung boleh export (data sudah ada di DB)
  async function handleExportExcel() {
    if (!isViewOnly && !isSaved) {
      // Data baru belum disimpan → tampilkan peringatan
      setShowExcelGuard(true);
      return;
    }
    // Sudah disimpan atau view-only → buka modal isi data wilayah
    setShowModalExcel(true);
  }

  // Dipanggil dari guard modal → simpan dulu, lalu buka modal excel
  async function handleGuardSimpan() {
    setShowExcelGuard(false);
    await handleSimpan();
    // Setelah simpan, buka modal excel otomatis
    // Tunggu sebentar agar state isSaved terupdate
    setTimeout(() => setShowModalExcel(true), 400);
  }

  async function doExportExcel(extraData) {
    setShowModalExcel(false);
    try {
      showInfo('Menyiapkan file Excel...');
      const fileName = await exportLaporanExcel({
        info, kegiatan, asiRows, giziRows, pemRows,
        extraData,
      });
      showSuccess(`✅ File "${fileName}" berhasil diunduh!`);
    } catch(err) {
      console.error('Export error:', err);
      showError('❌ Gagal export Excel: ' + (err.message || 'Unknown error'));
    }
  }

  // ── Tambah dari DB ──────────────────────────────────────────
  function tambahAsiDB(b) {
    if (asiRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    const namaIbu  = b.namaIbu  || '';
    const namaAyah = b.namaAyah || '';
    setAsiRows(p=>[...p,{
      balitaId:b.id, namaBalita:b.nama||'', tglLahir:b.tanggalLahir?.split('T')[0]||'',
      umurBulan:hitungUmur(b.tanggalLahir),
      e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false,
      namaIbu,
      namaAyah,
      namaOrtu: namaIbu || namaAyah || '',
    }]);
    setIsSaved(false);
    showSuccess(`✅ ${b.nama} ditambahkan ke Sec. III`);
  }
  function tambahGiziDB(b) {
    if (giziRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    const namaIbu  = b.namaIbu  || '';
    const namaAyah = b.namaAyah || '';
    setGiziRows(p=>[...p,{
      balitaId:b.id, namaBalita:b.nama||'', tglLahir:b.tanggalLahir?.split('T')[0]||'',
      umurBulan:hitungUmur(b.tanggalLahir),
      namaIbu,
      namaAyah,
      namaOrtu: namaIbu || namaAyah || '',
      pekerjaan:'',
      bb:b.beratBadan||'', tb:b.tinggiBadan||'',
    }]);
    setIsSaved(false);
    showSuccess(`✅ ${b.nama} ditambahkan ke Sec. IV`);
  }
  function tambahPemDB(b) {
    if (pemRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    const riwayat=b.riwayat||[], last=riwayat[riwayat.length-1]||null;
    const bbLalu = b.beratBadan||last?.beratBadan||last?.bb||'';
    const tbLalu = b.tinggiBadan||last?.tinggiBadan||last?.tb||'';
    const tglLalu= b.tglUkurTerakhir||last?.tanggal||last?.tglUkur||'';
    const namaIbu  = b.namaIbu||b.namaOrtu||'';
    const namaAyah = b.namaAyah||'';
    const namaOrtuDisplay = [namaIbu&&`Ibu: ${namaIbu}`, namaAyah&&`Ayah: ${namaAyah}`].filter(Boolean).join(' / ')||namaIbu||namaAyah||'';
    setPemRows(p=>[...p,{
      balitaId:b.id, noKK:b.noKK||'', nik:b.nik||'', anakKe:'',
      namaAnak:b.nama||'', tglLahir:b.tanggalLahir||'',
      lp:b.jenisKelamin==='Laki-laki'?'L':b.jenisKelamin==='Perempuan'?'P':'',
      usiaKehamilanLahir:'', bbl:'', pbl:'', ukaLahir:'',
      namaIbu, namaAyah, namaOrtu:namaOrtuDisplay,
      nikAyah:b.nikAyah||'', noTlp:b.noTelepon||'', alamat:b.alamat||'', rt:'', rw:'',
      tglUkur:tglLalu, bb:bbLalu, pb:tbLalu,
      tglUkurBaru:new Date().toISOString().split('T')[0], bbBaru:'', pbBaru:'',
      lila:'', lika:'', statusNTO:'', asiEksklusif:'',
      vitAFeb:'', bukuKIA:'', ketPerkembangan:'', pkat:'', catatan:'',
      _bbLalu:bbLalu, _tbLalu:tbLalu, _tglUkurLalu:tglLalu,
      _statusStunting:b.statusStunting||'', _statusGizi:b.statusGizi||'',
    }]);
    setIsSaved(false);
    showSuccess(`✅ ${b.nama} ditambahkan ke Sec. V`);
  }

  // ── Tambah Manual ───────────────────────────────────────────
  function tambahAsiManual(f) {
    const namaIbu   = f.namaOrtu  || '';
    const namaAyah  = f.namaAyah  || '';
    // Gabungkan ibu + ayah untuk tampilan kolom Nama Ortu
    const namaOrtuDisplay = [
      namaIbu  && `Ibu: ${namaIbu}`,
      namaAyah && `Ayah: ${namaAyah}`,
    ].filter(Boolean).join(' / ') || namaIbu || namaAyah || '';

    setAsiRows(p=>[...p,{
      balitaId:null, namaBalita:f.namaBalita, tglLahir:f.tglLahir,
      umurBulan:f.umurBulan,
      e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false,
      namaIbu,
      namaAyah,
      namaOrtu: namaOrtuDisplay,
    }]);
    setIsSaved(false);
    showSuccess(`✅ ${f.namaBalita} (manual) ditambahkan`);
  }
  function tambahGiziManual(f) {
    const namaIbu  = f.namaOrtu || '';
    const namaAyah = f.namaAyah || '';
    const namaOrtuDisplay = [
      namaIbu  && `Ibu: ${namaIbu}`,
      namaAyah && `Ayah: ${namaAyah}`,
    ].filter(Boolean).join(' / ') || namaIbu || namaAyah || '';

    setGiziRows(p=>[...p,{
      balitaId:null, namaBalita:f.namaBalita, tglLahir:f.tglLahir,
      umurBulan:f.umurBulan,
      namaIbu,
      namaAyah,
      namaOrtu: namaOrtuDisplay,
      pekerjaan:f.pekerjaan||'', bb:f.bb||'', tb:f.tb||'',
    }]);
    setIsSaved(false);
    showSuccess(`✅ ${f.namaBalita} (manual) ditambahkan`);
  }
  function tambahPemManual(f) {
    const namaOrtuDisplay = [f.namaOrtu&&`Ibu: ${f.namaOrtu}`, f.namaAyah&&`Ayah: ${f.namaAyah}`].filter(Boolean).join(' / ')||f.namaOrtu||'';
    setPemRows(p=>[...p,{
      balitaId:null, noKK:f.noKK||'', nik:f.nik||'', anakKe:'',
      namaAnak:f.namaBalita, tglLahir:f.tglLahir,
      lp:f.jenisKelamin||'', usiaKehamilanLahir:'', bbl:'', pbl:'', ukaLahir:'',
      namaIbu:f.namaOrtu||'', namaAyah:f.namaAyah||'', namaOrtu:namaOrtuDisplay,
      nikAyah:'', noTlp:f.noTlp||'', alamat:f.alamat||'', rt:'', rw:'',
      tglUkur:'', bb:f.bb||'', pb:f.tb||'',
      tglUkurBaru:new Date().toISOString().split('T')[0], bbBaru:'', pbBaru:'',
      lila:'', lika:'', statusNTO:'', asiEksklusif:'',
      vitAFeb:'', bukuKIA:'', ketPerkembangan:'', pkat:'', catatan:'',
      _bbLalu:'', _tbLalu:'', _tglUkurLalu:'', _statusStunting:'', _statusGizi:'',
    }]);
    setIsSaved(false);
    showSuccess(`✅ ${f.namaBalita} (manual) ditambahkan`);
  }

  function updA(i,k,v){ if(isViewOnly) return; setAsiRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r)); setIsSaved(false); }
  function updG(i,k,v){ if(isViewOnly) return; setGiziRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r)); setIsSaved(false); }
  function updP(i,k,v){ if(isViewOnly) return; setPemRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r)); setIsSaved(false); }

  // ── Styles ──────────────────────────────────────────────────
  const thG  = { padding:'7px 6px', background:'#F0FDF4', fontSize:10, fontWeight:700, color:'#15803D', borderBottom:'2px solid #BBF7D0', whiteSpace:'nowrap', textAlign:'center', position:'sticky', top:0 };
  const thO  = { padding:'7px 6px', background:'#FFF7ED', fontSize:10, fontWeight:700, color:'#D97706', borderBottom:'2px solid #FDE68A', whiteSpace:'nowrap', textAlign:'center', position:'sticky', top:0 };
  const td   = { padding:'4px 5px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle', textAlign:'center' };
  const tdL  = { padding:'4px 5px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle', textAlign:'left' };
  const numIn= { padding:'4px 3px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:11, fontFamily:'inherit', outline:'none', width:46, textAlign:'center', background:'#fff', display:'block' };
  const txtIn= { padding:'5px 7px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:11, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', background:'#fff' };
  const selSt= { padding:'4px 5px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:11, fontFamily:'inherit', outline:'none', background:'#fff' };
  const delBtn={ background:'#FEF2F2', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#DC2626', fontSize:12 };

  // disabled style untuk mode view-only
  const voStyle = isViewOnly ? { pointerEvents:'none', opacity:0.6 } : {};

  function SectionHeader3({ title, sub, onDB, onManual, labelDB, labelManual, color }) {
    return (
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>{title}</h3>
          {sub && <p style={{ margin:'3px 0 0', fontSize:11, color:'#9E9E9E' }}>{sub}</p>}
        </div>
        <TambahButtons
          labelDB={labelDB||'Dari DB'} labelManual={labelManual||'Manual'}
          onDB={onDB} onManual={onManual}
          colorDB={color||'#1B6B3A'}
          disabled={isViewOnly}
        />
      </div>
    );
  }

  return (
    <div style={{ padding:24, fontFamily:'inherit' }}>
      <Toast toast={toast}/>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>📋 Catatan Bulanan Posyandu</h2>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>Input data kegiatan penimbangan bulanan</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Button variant="ghost" onClick={()=>window.print()}>🖨️ Cetak</Button>

          {/* Tombol Simpan — disabled jika view-only */}
          {!isViewOnly && (
            <Button variant={saving?'ghost':'primary'} onClick={handleSimpan} disabled={saving}>
              {saving ? '⏳ Menyimpan...' : isSaved ? '✅ Tersimpan' : '💾 Simpan'}
            </Button>
          )}

          <button onClick={handleExportExcel} style={{
            padding:'8px 16px', background:'#1B6B3A', color:'#fff',
            border:'none', borderRadius:8, cursor:'pointer',
            fontFamily:'inherit', fontWeight:700, fontSize:13,
          }}>
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Banner View Only */}
      {isViewOnly && <ViewOnlyBanner tanggal={viewOnlyDate}/>}
      {isFuture  && <FutureDateBanner tanggal={futureDateStr}/>}

      {/* Indicator belum disimpan */}
      {!isViewOnly && !isSaved && (laporanId || asiRows.length || giziRows.length || pemRows.length) && (
        <div style={{
          background:'#FFF7ED', border:'1.5px solid #FDE68A', borderRadius:10,
          padding:'10px 16px', marginBottom:16, fontSize:12, color:'#92400E',
          display:'flex', alignItems:'center', gap:8,
        }}>
          ⚠️ <span>Data belum disimpan. <strong>Klik Simpan</strong> sebelum export Excel.</span>
        </div>
      )}

      {/* Auto-fill banner */}
      {currentUser && !isViewOnly && (
        <div style={{ background:'#F0FDF4', border:'1.5px solid #BBF7D0', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#15803D', display:'flex', alignItems:'center', gap:8 }}>
          ✨ <span>Auto-fill dari akun <strong>{currentUser.nama}</strong> — bisa diedit manual.</span>
        </div>
      )}

      {/* Filter Tanggal */}
      <div style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ fontSize:20 }}>🔍</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#1D4ED8', marginBottom:2 }}>Muat Data Laporan</div>
          <div style={{ fontSize:11, color:'#60A5FA' }}>
            Pilih tanggal → data dimuat. Tanggal hari sebelumnya = mode lihat saja.
          </div>
        </div>
        <input type="date" value={filterTanggal} onChange={e=>{ setFilterTanggal(e.target.value); setIsFuture(false); setIsViewOnly(false); }}
          style={{ padding:'9px 14px', borderRadius:8, border:'1.5px solid #93C5FD', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}/>
        <Button onClick={handleFilterTanggal} disabled={loadingFilter}>{loadingFilter?'⏳ Memuat...':'📂 Muat Data'}</Button>
      </div>

      {/* ── I. Info Umum ──────────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader title="I. Informasi Umum Posyandu"/>
        <div style={{ ...voStyle, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 20px' }}>
          <Field label="Nama Posyandu *" value={info.namaPosyandu} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,namaPosyandu:v}))}/>
          <Field label="Dusun" value={info.dusun} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,dusun:v}))}/>
          <Field label="Desa" value={info.desa} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,desa:v}))}/>
          <Field label="Petugas Lapangan" value={info.petugasLapangan} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,petugasLapangan:v}))}/>
          <Field label="Jumlah Kader Aktif" type="number" min="0" value={info.jumlahKader} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,jumlahKader:v}))}/>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Bulan</label>
              <select value={info.bulan} disabled={isViewOnly} onChange={e=>setInfo(p=>({...p,bulan:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:isViewOnly?'#F9FAFB':'#fff' }}>
                {BULAN_LIST.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ width:90, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Tahun</label>
              <input type="number" value={info.tahun} disabled={isViewOnly} onChange={e=>setInfo(p=>({...p,tahun:e.target.value}))}
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:isViewOnly?'#F9FAFB':'#fff', boxSizing:'border-box' }}/>
            </div>
          </div>
          <Field label="Tanggal Pelaksanaan" type="date" value={info.tanggalPelaksanaan} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,tanggalPelaksanaan:v}))}/>
          <Field label="Tanggal Pencatatan *" type="date" value={info.tanggalPencatatan} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,tanggalPencatatan:v}))}/>
          <Field label="Ketua Kader" value={info.ketuaKader} disabled={isViewOnly} onChange={v=>setInfo(p=>({...p,ketuaKader:v}))}/>
        </div>
      </Card>

      {/* ── II. Kegiatan Penimbangan ──────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:700 }}>II. Kegiatan Penimbangan</h3>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr>
                <th style={{ ...thG, textAlign:'center', width:36, background:'#F9FAFB', color:'#9E9E9E' }}>No</th>
                <th style={{ ...thG, textAlign:'left', paddingLeft:10, background:'#F9FAFB', color:'#374151', minWidth:280 }}>Keterangan</th>
                <th style={{ ...thG, width:44, background:'#F9FAFB', color:'#6B7280' }}>Kode</th>
                {[['0-5 bln',2],['6-11 bln',2],['12-23 bln',2],['24-60 bln',2]].map(([label, span])=>(
                  <th key={label} colSpan={span} style={{ ...thG, textAlign:'center', borderLeft:'1px solid #E5E7EB' }}>{label}</th>
                ))}
              </tr>
              <tr>
                <th style={{ ...thG, background:'#F9FAFB' }}/><th style={{ ...thG, background:'#F9FAFB' }}/><th style={{ ...thG, background:'#F9FAFB' }}/>
                {['L','P','L','P','L','P','L','P'].map((h,i)=>(
                  <th key={i} style={{ ...thG, width:52, borderLeft:i%2===0?'1px solid #E5E7EB':undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['01','Jumlah semua balita yang ada dikelompok penimbangan bulan ini','S','#1565C0',['s_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60']],
                ['02','Jumlah balita yang terdaftar dan mempunyai KMS bulan ini','K','#16A34A',['k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60']],
                ['03','Jumlah balita yang naik berat badannya bulan ini','N','#16A34A',['n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60']],
                ['04','Jumlah balita yang tidak naik berat badannya bulan ini','T','#DC2626',['t_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60']],
                ['05','Jumlah balita yang ditimbang bulan ini, tetapi tidak ditimbang bulan lalu','O','#D97706',['o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60']],
                ['06','Jumlah balita yang baru pertama kali hadir di penimbangan bulan ini','B','#9333EA',['b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60']],
                ['07','Jumlah balita yang ditimbang bulan ini (03+04+05+06)','D','#1D4ED8',['d_L_0_5','d_P_0_5','d_L_6_11','d_P_6_11','d_L_12_23','d_P_12_23','d_L_24_60','d_P_24_60']],
                ['08','Jumlah balita yang tidak hadir di penimbangan bulan ini (02−07)','-','#1D4ED8',['m_L_0_5','m_P_0_5','m_L_6_11','m_P_6_11','m_L_12_23','m_P_12_23','m_L_24_60','m_P_24_60']],
                ['09','Jumlah balita yang ada di bawah garis merah (BGM)','A','#D97706',['bgm_L_0_5','bgm_P_0_5','bgm_L_6_11','bgm_P_6_11','bgm_L_12_23','bgm_P_12_23','bgm_L_24_60','bgm_P_24_60']],
                ['10','Jumlah bayi mendapat vitamin A bulan Februari / Agustus','A','#16A34A',['vitAbayiFeb_L_0_5','vitAbayiFeb_P_0_5','vitAbayiFeb_L_6_11','vitAbayiFeb_P_6_11','vitAbayiFeb_L_12_23','vitAbayiFeb_P_12_23','vitAbayiFeb_L_24_60','vitAbayiFeb_P_24_60']],
                ['11','Jumlah balita mendapat vitamin A bulan Februari / Agustus','A','#16A34A',['vitAbalitaFeb_L_0_5','vitAbalitaFeb_P_0_5','vitAbalitaFeb_L_6_11','vitAbalitaFeb_P_6_11','vitAbalitaFeb_L_12_23','vitAbalitaFeb_P_12_23','vitAbalitaFeb_L_24_60','vitAbalitaFeb_P_24_60']],
                ['12','Jumlah bayi dengan ASI Eksklusif pada bulan ini','E','#16A34A',['asi_L_0_5','asi_P_0_5','asi_L_6_11','asi_P_6_11','asi_L_12_23','asi_P_12_23','asi_L_24_60','asi_P_24_60']],
              ].map(([no, label, kode, color, fields])=>(
                <tr key={no} style={{ background:parseInt(no,10)%2===0?'#FAFAFA':'#FFFFFF' }}>
                  <td style={{ ...td, color:'#9E9E9E', fontSize:11, fontWeight:600 }}>{no}</td>
                  <td style={{ ...tdL, color:'#374151', lineHeight:1.4 }}>{label}</td>
                  <td style={td}><span style={{ fontWeight:800, fontSize:14, color, background:`${color}18`, padding:'2px 8px', borderRadius:6 }}>{kode}</span></td>
                  {fields.map((fieldKey, idx)=>(
                    <td key={fieldKey} style={{ ...td, borderLeft:idx%2===0?'1px solid #E5E7EB':undefined }}>
                      <input type="number" min="0" value={kegiatan[fieldKey]||''}
                        disabled={isViewOnly}
                        onChange={e=>{ if(!isViewOnly){ setKegiatan(prev=>({...prev,[fieldKey]:e.target.value})); setIsSaved(false); } }}
                        style={{ ...numIn, background:isViewOnly?'#F9FAFB':'#fff' }}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── III. ASI Eksklusif ────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader3
          title="III. Pemantauan ASI Eksklusif"
          sub="🔗 Dari DB = ter-link database balita • ✏️ Manual = tidak ter-link"
          onDB={()=>setModalDB('asi')} onManual={()=>setModalManual('asi')}
          labelDB="Tambah dari DB" labelManual="Tambah Manual"
        />
        {asiRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px', color:'#9E9E9E' }}>
            <div style={{ fontSize:36, marginBottom:6 }}>🍼</div>
            <div style={{ fontWeight:600 }}>Belum ada data ASI</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:11, width:'100%' }}>
              <thead>
                <tr>
                  <th style={{ ...thG, width:40 }}>No</th>
                  <th style={{ ...thG, width:160, textAlign:'left', paddingLeft:8 }}>Nama Balita</th>
                  <th style={{ ...thG, width:100 }}>Tgl Lahir</th>
                  <th style={{ ...thG, width:70 }}>Umur (bln)</th>
                  {['E0','E1','E2','E3','E4','E5','E6'].map(e=><th key={e} style={{ ...thG, width:36 }}>{e}</th>)}
                  <th style={{ ...thG, width:130, textAlign:'left', paddingLeft:8 }}>Nama Ortu</th>
                  {!isViewOnly && <th style={{ ...thG, width:36 }}></th>}
                </tr>
              </thead>
              <tbody>
                {asiRows.map((r,i)=>(
                  <tr key={i} style={{ background:r.balitaId?(i%2===0?'#F0FDF4':'#E8F8EF'):(i%2===0?'#fff':'#FAFAFA') }}>
                    <td style={td}>
                      <div style={{ fontWeight:700 }}>{i+1}</div>
                      {r.balitaId
                        ? <div style={{ fontSize:8, color:'#16A34A', fontWeight:700 }}>🔗 DB</div>
                        : <div style={{ fontSize:8, color:'#7C3AED', fontWeight:700 }}>✏️ Manual</div>
                      }
                    </td>
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontWeight:600 }}>{r.namaBalita}</td>
                    <td style={{ ...td, color:'#6B7280', fontSize:10 }}>{fmtTgl(r.tglLahir)}</td>
                    <td style={td}><span style={{ fontWeight:700, color:'#1B6B3A', background:'#F0FDF4', padding:'2px 8px', borderRadius:10, fontSize:11 }}>{r.umurBulan} bln</span></td>
                    {['e0','e1','e2','e3','e4','e5','e6'].map(e=>(
                      <td key={e} style={td}><input type="checkbox" checked={r[e]||false} disabled={isViewOnly} onChange={ev=>updA(i,e,ev.target.checked)}/></td>
                    ))}
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontSize:10, minWidth:130 }}>
                      {(r.namaIbu || r.namaAyah) ? (
                        <div>
                          {r.namaIbu  && <div><span style={{ color:'#9E9E9E' }}>Ibu:</span> {r.namaIbu}</div>}
                          {r.namaAyah && <div><span style={{ color:'#9E9E9E' }}>Ayah:</span> {r.namaAyah}</div>}
                        </div>
                      ) : (r.namaOrtu || '-')}
                    </td>
                    {!isViewOnly && <td style={td}><button onClick={()=>{ setAsiRows(p=>p.filter((_,j)=>j!==i)); setIsSaved(false); }} style={delBtn}>🗑️</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── IV. Gizi Buruk & Kurus ───────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader3
          title="IV. Pemantauan Balita Gizi Buruk & Kurus"
          sub="🔗 Dari DB = BB & TB otomatis • ✏️ Manual = input langsung"
          onDB={()=>setModalDB('gizi')} onManual={()=>setModalManual('gizi')}
          labelDB="Tambah dari DB" labelManual="Tambah Manual" color="#D97706"
        />
        {giziRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px', color:'#9E9E9E' }}>
            <div style={{ fontSize:36, marginBottom:6 }}>⚖️</div>
            <div style={{ fontWeight:600 }}>Belum ada data gizi buruk & kurus</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:11, width:'100%' }}>
              <thead>
                <tr>
                  <th style={{ ...thO, width:40 }}>No</th>
                  <th style={{ ...thO, width:160, textAlign:'left', paddingLeft:8 }}>Nama Balita</th>
                  <th style={{ ...thO, width:100 }}>Tgl Lahir</th>
                  <th style={{ ...thO, width:75 }}>Umur (bln)</th>
                  <th style={{ ...thO, width:130, textAlign:'left', paddingLeft:8 }}>Nama Ortu</th>
                  <th style={{ ...thO, width:120 }}>Pekerjaan</th>
                  <th style={{ ...thO, width:70 }}>BB (kg)</th>
                  <th style={{ ...thO, width:70 }}>TB (cm)</th>
                  {!isViewOnly && <th style={{ ...thO, width:36 }}></th>}
                </tr>
              </thead>
              <tbody>
                {giziRows.map((r,i)=>(
                  <tr key={i} style={{ background:i%2===0?'#FFF7ED':'#FFFBEB' }}>
                    <td style={td}>
                      <div style={{ fontWeight:700 }}>{i+1}</div>
                      {r.balitaId
                        ? <div style={{ fontSize:8, color:'#D97706', fontWeight:700 }}>🔗 DB</div>
                        : <div style={{ fontSize:8, color:'#7C3AED', fontWeight:700 }}>✏️ Manual</div>
                      }
                    </td>
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontWeight:600 }}>{r.namaBalita}</td>
                    <td style={{ ...td, color:'#6B7280', fontSize:10 }}>{fmtTgl(r.tglLahir)}</td>
                    <td style={td}><span style={{ fontWeight:700, color:'#D97706', background:'#FFF7ED', padding:'2px 8px', borderRadius:10 }}>{r.umurBulan} bln</span></td>
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontSize:10, minWidth:130 }}>
                      {(r.namaIbu || r.namaAyah) ? (
                        <div>
                          {r.namaIbu  && <div><span style={{ color:'#9E9E9E' }}>Ibu:</span> {r.namaIbu}</div>}
                          {r.namaAyah && <div><span style={{ color:'#9E9E9E' }}>Ayah:</span> {r.namaAyah}</div>}
                        </div>
                      ) : (r.namaOrtu || '-')}
                    </td>
                    <td style={td}><input value={r.pekerjaan||''} disabled={isViewOnly} onChange={e=>updG(i,'pekerjaan',e.target.value)} style={{ ...txtIn, width:110 }} placeholder="Pekerjaan..."/></td>
                    <td style={td}><input type="number" step="0.01" value={r.bb||''} disabled={isViewOnly} onChange={e=>updG(i,'bb',e.target.value)} style={numIn} placeholder="kg"/></td>
                    <td style={td}><input type="number" step="0.1" value={r.tb||''} disabled={isViewOnly} onChange={e=>updG(i,'tb',e.target.value)} style={numIn} placeholder="cm"/></td>
                    {!isViewOnly && <td style={td}><button onClick={()=>{ setGiziRows(p=>p.filter((_,j)=>j!==i)); setIsSaved(false); }} style={delBtn}>🗑️</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── V. Pemantauan Pertumbuhan ─────────────────────────── */}
      <Card>
        <SectionHeader3
          title="V. Formulir Pemantauan Pertumbuhan Balita"
          sub="🔗 Hijau = ter-link DB • 🔵 Biru = data bulan lalu • 🟡 Kuning = input bulan ini"
          onDB={()=>setModalDB('pem')} onManual={()=>setModalManual('pemantauan')}
          labelDB="Tambah dari DB" labelManual="Tambah Manual"
        />
        {pemRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#9E9E9E' }}>
            <div style={{ fontSize:48, marginBottom:10 }}>👶</div>
            <div style={{ fontSize:14, fontWeight:600 }}>Belum ada balita</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:10, minWidth:1800 }}>
              <thead>
                <tr>
                  {[
                    {l:'No',w:36},{l:'No KK',w:90},{l:'NIK',w:110},{l:'Anak Ke',w:46},
                    {l:'Nama Anak',w:130},{l:'Tgl Lahir',w:100},{l:'L/P',w:36},
                    {l:'Usia Kehamilan Saat Lahir',w:80},{l:'BBL',w:46},{l:'PBL',w:46},{l:'UKA',w:46},
                    {l:'Nama Ortu (Ayah/Ibu)',w:160},{l:'NIK Ayah',w:100},{l:'No Tlp',w:90},{l:'Alamat',w:120},{l:'RT',w:34},{l:'RW',w:34},
                  ].map((h,i)=><th key={i} style={{ ...thG, width:h.w, minWidth:h.w }}>{h.l}</th>)}
                  {[{l:'Tgl Ukur Lalu',w:100},{l:'BB Lalu',w:58},{l:'TB Lalu',w:58}].map((h,i)=>(
                    <th key={'l'+i} style={{ ...thG, width:h.w, background:'#EFF6FF', color:'#1D4ED8', borderBottom:'2px solid #BFDBFE' }}>{h.l}</th>
                  ))}
                  {[{l:'Tgl Ukur *',w:110},{l:'BB Baru *',w:58},{l:'TB/PB Baru *',w:70}].map((h,i)=>(
                    <th key={'b'+i} style={{ ...thG, width:h.w, background:'#FFFDE7', color:'#B45309', borderBottom:'2px solid #FDE68A' }}>{h.l}</th>
                  ))}
                  {[
                    {l:'LILA/LIKA',w:80},{l:'N/T/O/B',w:58},{l:'ASI',w:52},
                    {l:'VitA Feb',w:60},{l:'Buku KIA',w:60},{l:'Perkembangan PKAT',w:120},
                    ...(isViewOnly ? [] : [{l:'',w:34}]),
                  ].map((h,i)=><th key={'d'+i} style={{ ...thG, width:h.w, minWidth:h.w }}>{h.l}</th>)}
                </tr>
              </thead>
              <tbody>
                {pemRows.map((r,i)=>(
                  <tr key={r.balitaId||i} style={{ background:r.balitaId?(i%2===0?'#F0FDF4':'#E8F8EF'):(i%2===0?'#fff':'#FAFAFA') }}>
                    <td style={td}>
                      <div style={{ fontWeight:700 }}>{i+1}</div>
                      {r.balitaId
                        ? <div style={{ fontSize:8, color:'#16A34A', fontWeight:700 }}>🔗 DB</div>
                        : <div style={{ fontSize:8, color:'#7C3AED', fontWeight:700 }}>✏️ Manual</div>
                      }
                    </td>
                    <td style={td}><input value={r.noKK||''} disabled={isViewOnly} onChange={e=>updP(i,'noKK',e.target.value)} style={{ ...txtIn, width:80 }}/></td>
                    <td style={td}><input value={r.nik||''} disabled={isViewOnly} onChange={e=>updP(i,'nik',e.target.value)} style={{ ...txtIn, width:100 }}/></td>
                    <td style={td}><input type="number" value={r.anakKe||''} disabled={isViewOnly} onChange={e=>updP(i,'anakKe',e.target.value)} style={{ ...numIn, width:34 }}/></td>
                    <td style={{ ...tdL, fontWeight:700, whiteSpace:'nowrap' }}>{r.namaAnak}</td>
                    <td style={{ ...td, fontSize:9, color:'#6B7280', whiteSpace:'nowrap' }}>{fmtTgl(r.tglLahir)}</td>
                    <td style={{ ...td, fontWeight:700, color:r.lp==='L'?'#2563EB':'#DB2777' }}>{r.lp}</td>
                    <td style={td}><input type="number" value={r.usiaKehamilanLahir||''} disabled={isViewOnly} onChange={e=>updP(i,'usiaKehamilanLahir',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.01" value={r.bbl||''} disabled={isViewOnly} onChange={e=>updP(i,'bbl',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.pbl||''} disabled={isViewOnly} onChange={e=>updP(i,'pbl',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.ukaLahir||''} disabled={isViewOnly} onChange={e=>updP(i,'ukaLahir',e.target.value)} style={numIn}/></td>
                    <td style={{ ...tdL, fontSize:9, minWidth:160 }}>
                      {r.namaIbu && <div><span style={{ color:'#9E9E9E' }}>Ibu:</span> {r.namaIbu}</div>}
                      {r.namaAyah && <div><span style={{ color:'#9E9E9E' }}>Ayah:</span> {r.namaAyah}</div>}
                      {!r.namaIbu && !r.namaAyah && (r.namaOrtu||'-')}
                    </td>
                    <td style={td}><input value={r.nikAyah||''} disabled={isViewOnly} onChange={e=>updP(i,'nikAyah',e.target.value)} style={{ ...txtIn, width:90 }}/></td>
                    <td style={td}><input value={r.noTlp||''} disabled={isViewOnly} onChange={e=>updP(i,'noTlp',e.target.value)} style={{ ...txtIn, width:82 }}/></td>
                    <td style={td}><input value={r.alamat||''} disabled={isViewOnly} onChange={e=>updP(i,'alamat',e.target.value)} style={{ ...txtIn, width:110 }}/></td>
                    <td style={td}><input value={r.rt||''} disabled={isViewOnly} onChange={e=>updP(i,'rt',e.target.value)} style={{ ...numIn, width:30 }}/></td>
                    <td style={td}><input value={r.rw||''} disabled={isViewOnly} onChange={e=>updP(i,'rw',e.target.value)} style={{ ...numIn, width:30 }}/></td>
                    <td style={{ ...td, background:'#EFF6FF', fontSize:9, color:'#6B7280', whiteSpace:'nowrap' }}>{fmtTgl(r._tglUkurLalu||r.tglUkur)}</td>
                    <td style={{ ...td, background:'#EFF6FF', fontWeight:700, color:'#1D4ED8' }}>{r._bbLalu||r.bb||'-'}</td>
                    <td style={{ ...td, background:'#EFF6FF', fontWeight:700, color:'#1D4ED8' }}>{r._tbLalu||r.pb||'-'}</td>
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="date" value={r.tglUkurBaru||''} disabled={isViewOnly} onChange={e=>updP(i,'tglUkurBaru',e.target.value)} style={{ ...txtIn, width:108, borderColor:'#D97706' }}/></td>
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="number" step="0.01" value={r.bbBaru||''} disabled={isViewOnly} onChange={e=>updP(i,'bbBaru',e.target.value)} placeholder="kg" style={{ ...numIn, borderColor:'#D97706', width:54 }}/></td>
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="number" step="0.1" value={r.pbBaru||''} disabled={isViewOnly} onChange={e=>updP(i,'pbBaru',e.target.value)} placeholder="cm" style={{ ...numIn, borderColor:'#D97706', width:54 }}/></td>
                    <td style={td}>
                      <input type="number" step="0.1" value={r.lila||''} disabled={isViewOnly} onChange={e=>updP(i,'lila',e.target.value)} placeholder="LILA" style={{ ...numIn, width:68, marginBottom:3 }}/>
                      <input type="number" step="0.1" value={r.lika||''} disabled={isViewOnly} onChange={e=>updP(i,'lika',e.target.value)} placeholder="LIKA" style={{ ...numIn, width:68 }}/>
                    </td>
                    <td style={td}>
                      <select value={r.statusNTO||''} disabled={isViewOnly} onChange={e=>updP(i,'statusNTO',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="N">N</option><option value="T">T</option><option value="O">O</option><option value="B">B</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select value={r.asiEksklusif||''} disabled={isViewOnly} onChange={e=>updP(i,'asiEksklusif',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select value={r.vitAFeb||''} disabled={isViewOnly} onChange={e=>updP(i,'vitAFeb',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select value={r.bukuKIA||''} disabled={isViewOnly} onChange={e=>updP(i,'bukuKIA',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Punya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select value={r.ketPerkembangan||''} disabled={isViewOnly} onChange={e=>updP(i,'ketPerkembangan',e.target.value)} style={{ ...selSt, width:112, marginBottom:3, display:'block' }}>
                        <option value="">- Perkembangan</option>
                        <option value="Sesuai">Sesuai</option><option value="Meragukan">Meragukan</option><option value="Penyimpangan">Penyimpangan</option>
                      </select>
                      <select value={r.pkat||''} disabled={isViewOnly} onChange={e=>updP(i,'pkat',e.target.value)} style={{ ...selSt, width:112, display:'block' }}>
                        <option value="">- PKAT</option><option value="Ya">Ya</option><option value="Belum">Belum</option>
                      </select>
                    </td>
                    {!isViewOnly && <td style={td}><button onClick={()=>{ setPemRows(p=>p.filter((_,j)=>j!==i)); setIsSaved(false); }} style={delBtn}>🗑️</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pemRows.length > 0 && !isViewOnly && (
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Button variant="ghost" onClick={handleSimpan} disabled={saving}>{saving?'Menyimpan...':'💾 Simpan'}</Button>
            <button onClick={handleExportExcel} style={{
              padding:'8px 16px', background:'#1B6B3A', color:'#fff',
              border:'none', borderRadius:8, cursor:'pointer',
              fontFamily:'inherit', fontWeight:700, fontSize:13,
            }}>📊 Export Excel</button>
          </div>
        )}

        {pemRows.length > 0 && isViewOnly && (
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
            <button onClick={handleExportExcel} style={{
              padding:'8px 16px', background:'#1B6B3A', color:'#fff',
              border:'none', borderRadius:8, cursor:'pointer',
              fontFamily:'inherit', fontWeight:700, fontSize:13,
            }}>📊 Export Excel</button>
          </div>
        )}
      </Card>

      {/* ── Modals DB ────────────────────────────────────────── */}
      {!isViewOnly && modalDB === 'asi' && (
        <ModalPilihBalita title="Tambah Bayi ke ASI Eksklusif" subtitle="Semua usia — dari database balita"
          balitaList={balitaList} sudahDipilih={asiRows} onSelect={b=>tambahAsiDB(b)} onClose={()=>setModalDB(null)}/>
      )}
      {!isViewOnly && modalDB === 'gizi' && (
        <ModalPilihBalita title="Tambah Balita ke Gizi Buruk & Kurus" subtitle="Semua usia — dari database balita"
          balitaList={balitaList} sudahDipilih={giziRows} onSelect={b=>tambahGiziDB(b)} onClose={()=>setModalDB(null)}/>
      )}
      {!isViewOnly && modalDB === 'pem' && (
        <ModalPilihBalita title="Tambah Balita ke Pemantauan Pertumbuhan" subtitle="Semua usia — dari database balita"
          balitaList={balitaList} sudahDipilih={pemRows} onSelect={b=>tambahPemDB(b)} onClose={()=>setModalDB(null)}/>
      )}

      {/* ── Modals Manual ─────────────────────────────────────── */}
      {!isViewOnly && modalManual === 'asi'        && <ModalManual mode="asi"        onSave={tambahAsiManual}  onClose={()=>setModalManual(null)}/>}
      {!isViewOnly && modalManual === 'gizi'       && <ModalManual mode="gizi"       onSave={tambahGiziManual} onClose={()=>setModalManual(null)}/>}
      {!isViewOnly && modalManual === 'pemantauan' && <ModalManual mode="pemantauan" onSave={tambahPemManual}  onClose={()=>setModalManual(null)}/>}

      {/* ── Modal Guard Excel ─────────────────────────────────── */}
      {showExcelGuard && (
        <ModalExcelGuard
          onClose={() => setShowExcelGuard(false)}
          onSimpan={handleGuardSimpan}
        />
      )}

      {/* ── Modal Export Excel ─────────────────────────────────── */}
      {showModalExcel && (
        <ModalExcelInfo
          initialData={{ info, currentUser }}
          onConfirm={doExportExcel}
          onClose={() => setShowModalExcel(false)}
        />
      )}
    </div>
  );
}