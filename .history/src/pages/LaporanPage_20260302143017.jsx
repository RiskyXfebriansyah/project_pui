// ============================================================
//  LaporanPage.jsx — FIXED COLUMNS + MANUAL INPUT
//  Perubahan:
//  - Sec III & IV: filter semua umur (tidak dibatasi ≤12 bln)
//  - Tambah Manual: modal input manual di samping tombol "Tambah"
//  - Sec V: LILA/LIKA jadi 1 kolom 2 baris
//  - Sec V: Ket Perkembangan + PKAT jadi 1 kolom "Perkembangan PKAT"
//  - Sec V: VitA Ags dihapus
//  - Kolom rapi dengan lebar fixed
// ============================================================

import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Button } from '../components/ui/Components';
import { formatTanggal } from '../utils/helpers';
import { LaporanAPI } from '../services/api';

// ── Toast ─────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success:'#16A34A', error:'#DC2626', info:'#2563EB' };
  const icons  = { success:'✅', error:'❌', info:'ℹ️' };
  return (
    <div style={{ position:'fixed', top:24, left:'50%', transform:'translateX(-50%)', zIndex:99999,
      padding:'14px 28px', borderRadius:14, background:colors[toast.type]||'#1F2937', color:'#fff',
      fontWeight:700, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
      display:'flex', alignItems:'center', gap:10, fontFamily:'inherit' }}>
      {icons[toast.type]} {toast.message}
    </div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, msg) { setToast({ type, message:msg }); setTimeout(()=>setToast(null), 3500); }
  return { toast, showSuccess:m=>show('success',m), showError:m=>show('error',m), showInfo:m=>show('info',m) };
}

// ── Field ─────────────────────────────────────────────────────
function Field({ label, value, onChange, type='text', placeholder, disabled, min }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>{label}</label>}
      <input type={type} value={value||''} placeholder={placeholder} disabled={disabled} min={min}
        onChange={e=>onChange?.(e.target.value)}
        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13,
          fontFamily:'inherit', outline:'none', boxSizing:'border-box',
          background:disabled?'#F9FAFB':'#fff', color:disabled?'#9E9E9E':'#1A1A1A' }}
        onFocus={e=>{ if(!disabled) e.target.style.borderColor='#1B6B3A'; }}
        onBlur={e=>e.target.style.borderColor='#E5E7EB'}/>
    </div>
  );
}

// ── Hitung umur bulan ─────────────────────────────────────────
function hitungUmur(tanggalLahir) {
  if (!tanggalLahir) return 0;
  const tgl = new Date(tanggalLahir), today = new Date();
  let b = (today.getFullYear()-tgl.getFullYear())*12 + (today.getMonth()-tgl.getMonth());
  if (today.getDate() < tgl.getDate()) b--;
  return Math.max(0, b);
}

const KODE = {
  S:{ label:'(S) Semua Balita',          w:'#1565C0', bg:'#EFF6FF' },
  K:{ label:'(K) Terdaftar KMS',         w:'#16A34A', bg:'#F0FDF4' },
  N:{ label:'(N) Naik BB',               w:'#16A34A', bg:'#F0FDF4' },
  T:{ label:'(T) Tidak Naik BB',         w:'#DC2626', bg:'#FEF2F2' },
  O:{ label:'(O) Timbang, tdk bln lalu', w:'#D97706', bg:'#FFFBEB' },
  B:{ label:'(B) Pertama hadir',         w:'#9333EA', bg:'#F5F3FF' },
};
const BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const defaultKegiatan = () => ({
  s_L_0_5:'',s_P_0_5:'',s_L_6_11:'',s_P_6_11:'',s_L_12_23:'',s_P_12_23:'',s_L_24_60:'',s_P_24_60:'',
  k_L_0_5:'',k_P_0_5:'',k_L_6_11:'',k_P_6_11:'',k_L_12_23:'',k_P_12_23:'',k_L_24_60:'',k_P_24_60:'',
  n_L_0_5:'',n_P_0_5:'',n_L_6_11:'',n_P_6_11:'',n_L_12_23:'',n_P_12_23:'',n_L_24_60:'',n_P_24_60:'',
  t_L_0_5:'',t_P_0_5:'',t_L_6_11:'',t_P_6_11:'',t_L_12_23:'',t_P_12_23:'',t_L_24_60:'',t_P_24_60:'',
  o_L_0_5:'',o_P_0_5:'',o_L_6_11:'',o_P_6_11:'',o_L_12_23:'',o_P_12_23:'',o_L_24_60:'',o_P_24_60:'',
  b_L_0_5:'',b_P_0_5:'',b_L_6_11:'',b_P_6_11:'',b_L_12_23:'',b_P_12_23:'',b_L_24_60:'',b_P_24_60:'',
  bawahGarisMerah:'',vitA_bayi_feb:'',vitA_bayi_ags:'',vitA_balita_feb:'',vitA_balita_ags:'',
  jumlahHamil:'',jumlahPersalinan:'',
});

// ── Modal Pilih dari DB ───────────────────────────────────────
function ModalPilihBalita({ title, subtitle, balitaList, onSelect, onClose, sudahDipilih }) {
  const [search, setSearch] = useState('');
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
              <div style={{ fontSize:12, color:'#D97706', background:'#FFFBEB', padding:'10px 14px', borderRadius:8, display:'inline-block' }}>
                💡 Pastikan balita sudah terdaftar di <strong>menu Data Balita</strong>
              </div>
            </div>
          )}
          {!search && (
            <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>👆</div>
              <div style={{ fontSize:13 }}>Ketik nama anak atau ibu untuk mencari</div>
              <div style={{ fontSize:11, color:'#D97706', marginTop:6 }}>Tidak ditemukan? Input dulu di <strong>menu Data Balita</strong></div>
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
// mode: 'asi' | 'gizi' | 'pemantauan'
function ModalManual({ mode, onSave, onClose }) {
  const emptyForm = {
    namaBalita:'', tglLahir:'', jenisKelamin:'L', namaOrtu:'', noTlp:'', alamat:'',
    // gizi
    pekerjaan:'', bb:'', tb:'',
    // pemantauan
    nik:'', noKK:'',
  };
  const [form, setForm] = useState(emptyForm);
  const umur = hitungUmur(form.tglLahir);

  function f(k, v) { setForm(p=>({...p,[k]:v})); }

  const titles = { asi:'Tambah Manual — ASI Eksklusif', gizi:'Tambah Manual — Gizi Buruk & Kurus', pemantauan:'Tambah Manual — Pemantauan Pertumbuhan' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1001, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:500, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}
        onClick={e=>e.stopPropagation()}>
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
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <Field label="Nama Ortu/Ibu" value={form.namaOrtu} onChange={v=>f('namaOrtu',v)}/>
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
            ℹ️ Data manual tidak terhubung ke database balita. Untuk menghubungkan, input melalui tombol <strong>"Tambah dari DB"</strong>.
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
function TambahButtons({ labelDB, labelManual, onDB, onManual, colorDB='#1B6B3A', colorManual='#6D28D9' }) {
  return (
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={onManual} style={{ padding:'8px 14px', background:colorManual, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12 }}>
        ✏️ {labelManual}
      </button>
      <button onClick={onDB} style={{ padding:'8px 14px', background:colorDB, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12 }}>
        🔗 {labelDB}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function LaporanPage({ balitaList = [], currentUser = null }) {
  const { toast, showSuccess, showError, showInfo } = useToast();

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

  const [info, setInfo]         = useState(defaultInfo());
  const [kegiatan, setKegiatan] = useState(defaultKegiatan());

  const [asiRows, setAsiRows]   = useState([]);
  const [giziRows, setGiziRows] = useState([]);
  const [pemRows, setPemRows]   = useState([]);

  const [showKodeInfo, setShowKodeInfo] = useState(false);

  // Modal state
  const [modalDB,     setModalDB]     = useState(null); // 'asi'|'gizi'|'pem'
  const [modalManual, setModalManual] = useState(null); // 'asi'|'gizi'|'pemantauan'

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
          setKegiatan({
            s_L_0_5:k.s_L_0_5||'',s_P_0_5:k.s_P_0_5||'',s_L_6_11:k.s_L_6_11||'',s_P_6_11:k.s_P_6_11||'',
            s_L_12_23:k.s_L_12_23||'',s_P_12_23:k.s_P_12_23||'',s_L_24_60:k.s_L_24_60||'',s_P_24_60:k.s_P_24_60||'',
            k_L_0_5:k.k_L_0_5||'',k_P_0_5:k.k_P_0_5||'',k_L_6_11:k.k_L_6_11||'',k_P_6_11:k.k_P_6_11||'',
            k_L_12_23:k.k_L_12_23||'',k_P_12_23:k.k_P_12_23||'',k_L_24_60:k.k_L_24_60||'',k_P_24_60:k.k_P_24_60||'',
            n_L_0_5:k.n_L_0_5||'',n_P_0_5:k.n_P_0_5||'',n_L_6_11:k.n_L_6_11||'',n_P_6_11:k.n_P_6_11||'',
            n_L_12_23:k.n_L_12_23||'',n_P_12_23:k.n_P_12_23||'',n_L_24_60:k.n_L_24_60||'',n_P_24_60:k.n_P_24_60||'',
            t_L_0_5:k.t_L_0_5||'',t_P_0_5:k.t_P_0_5||'',t_L_6_11:k.t_L_6_11||'',t_P_6_11:k.t_P_6_11||'',
            t_L_12_23:k.t_L_12_23||'',t_P_12_23:k.t_P_12_23||'',t_L_24_60:k.t_L_24_60||'',t_P_24_60:k.t_P_24_60||'',
            o_L_0_5:k.o_L_0_5||'',o_P_0_5:k.o_P_0_5||'',o_L_6_11:k.o_L_6_11||'',o_P_6_11:k.o_P_6_11||'',
            o_L_12_23:k.o_L_12_23||'',o_P_12_23:k.o_P_12_23||'',o_L_24_60:k.o_L_24_60||'',o_P_24_60:k.o_P_24_60||'',
            b_L_0_5:k.b_L_0_5||'',b_P_0_5:k.b_P_0_5||'',b_L_6_11:k.b_L_6_11||'',b_P_6_11:k.b_P_6_11||'',
            b_L_12_23:k.b_L_12_23||'',b_P_12_23:k.b_P_12_23||'',b_L_24_60:k.b_L_24_60||'',b_P_24_60:k.b_P_24_60||'',
            bawahGarisMerah:k.bawahGarisMerah||'',
            vitA_bayi_feb:k.vitA_Bayi_Feb||'',vitA_bayi_ags:k.vitA_Bayi_Ags||'',
            vitA_balita_feb:k.vitA_Balita_Feb||'',vitA_balita_ags:k.vitA_Balita_Ags||'',
            jumlahHamil:k.jumlahHamil||'',jumlahPersalinan:k.jumlahPersalinan||'',
          });
        }
        if (d.asiRows?.length) setAsiRows(d.asiRows.map(r=>({
          balitaId:r.balitaId||null, namaBalita:r.namaBalita||'',
          tglLahir:r.tglLahir||'', umurBulan:r.umurBulan||hitungUmur(r.tglLahir),
          e0:!!r.e0,e1:!!r.e1,e2:!!r.e2,e3:!!r.e3,e4:!!r.e4,e5:!!r.e5,e6:!!r.e6,
          namaOrtu:r.namaOrtu||'',
        })));
        if (d.giziRows?.length) setGiziRows(d.giziRows.map(r=>({
          balitaId:r.balitaId||null, namaBalita:r.namaBalita||'',
          tglLahir:r.tglLahir||'', umurBulan:r.umurBulan||hitungUmur(r.tglLahir),
          namaOrtu:r.namaOrtu||'', pekerjaan:r.pekerjaan||'', bb:r.bb||'', tb:r.tb||'',
        })));
        if (d.pemantauanRows?.length) setPemRows(d.pemantauanRows.map(r=>({
          balitaId:r.balitaId||null, noKK:r.noKK||'', nik:r.nik||'', anakKe:r.anakKe||'',
          namaAnak:r.namaAnak||'', tglLahir:r.tglLahir||'', lp:r.lp||'',
          usiaKehamilanLahir:r.usiaKehamilanLahir||'', bbl:r.bbl||'', pbl:r.pbl||'', ukaLahir:r.ukaLahir||'',
          namaOrtu:r.namaOrtu||'', nikAyah:r.nikAyah||'', noTlp:r.noTlp||'', alamat:r.alamat||'', rt:r.rt||'', rw:r.rw||'',
          tglUkur:r.tglUkur||'', bb:r.bb||'', pb:r.pb||'',
          tglUkurBaru:'', bbBaru:'', pbBaru:'',
          lila:r.lila||'', lika:r.lika||'',
          statusNTO:r.statusNTO||'', asiEksklusif:r.asiEksklusif||'',
          vitAFeb:r.vitAFeb||'', bukuKIA:r.bukuKIA||'',
          ketPerkembangan:r.ketPerkembangan||'', pkat:r.pkat||'',
          catatan:'',
          _bbLalu:r.bbLalu||r.bb||'', _tbLalu:r.tbLalu||r.pb||'',
          _tglUkurLalu:r.tglUkurLalu||r.tglUkur||'',
          _statusStunting:r.statusStunting||'', _statusGizi:r.statusGizi||'',
        })));
        setIsSaved(true);
        showSuccess(`Laporan tanggal ${filterTanggal} berhasil dimuat!`);
      } else {
        showInfo('Tidak ada laporan. Form dikosongkan untuk input baru.');
        setLaporanId(null);
        setInfo({ ...defaultInfo(), tanggalPencatatan: filterTanggal });
        setKegiatan(defaultKegiatan());
        setAsiRows([]); setGiziRows([]); setPemRows([]);
        setIsSaved(false);
      }
    } catch(err) { console.error(err); showError('Gagal memuat data.'); }
    finally { setLoadingFilter(false); }
  }

  // ── Simpan ──────────────────────────────────────────────────
  async function handleSimpan() {
    if (!info.namaPosyandu || !info.tanggalPencatatan) {
      showError('Nama Posyandu dan Tanggal Pencatatan wajib diisi'); return;
    }
    setSaving(true);
    try {
      const res = await LaporanAPI.simpan({ info, kegiatan, asiRows, giziRows, pemantauanRows: pemRows });
      if (res?.status?.code === 200 || res?.status?.code === 201) {
        setLaporanId(res.data?.id || laporanId);
        setIsSaved(true);
        showSuccess('Laporan berhasil disimpan!');
      } else showError(res?.status?.message || 'Gagal menyimpan');
    } catch { showError('Gagal terhubung ke server'); }
    finally { setSaving(false); }
  }

  // ── Tambah dari DB ──────────────────────────────────────────
  function tambahAsiDB(b) {
    if (asiRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    setAsiRows(p=>[...p,{ balitaId:b.id, namaBalita:b.nama||'', tglLahir:b.tanggalLahir?.split('T')[0]||'',
      umurBulan:hitungUmur(b.tanggalLahir), e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false,
      namaOrtu:b.namaIbu||'' }]);
    showSuccess(`✅ ${b.nama} ditambahkan ke Sec. III`);
  }
  function tambahGiziDB(b) {
    if (giziRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    setGiziRows(p=>[...p,{ balitaId:b.id, namaBalita:b.nama||'', tglLahir:b.tanggalLahir?.split('T')[0]||'',
      umurBulan:hitungUmur(b.tanggalLahir), namaOrtu:b.namaIbu||'', pekerjaan:'',
      bb:b.beratBadan||'', tb:b.tinggiBadan||'' }]);
    showSuccess(`✅ ${b.nama} ditambahkan ke Sec. IV`);
  }
  function tambahPemDB(b) {
    if (pemRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    const riwayat=b.riwayat||[], last=riwayat[riwayat.length-1]||null;
    const bbLalu=b.beratBadan||last?.beratBadan||last?.bb||'';
    const tbLalu=b.tinggiBadan||last?.tinggiBadan||last?.tb||'';
    const tglLalu=b.tglUkurTerakhir||last?.tanggal||last?.tglUkur||'';
    setPemRows(p=>[...p,{
      balitaId:b.id, noKK:'', nik:b.nik||'', anakKe:'',
      namaAnak:b.nama||'', tglLahir:b.tanggalLahir||'',
      lp:b.jenisKelamin==='Laki-laki'?'L':b.jenisKelamin==='Perempuan'?'P':'',
      usiaKehamilanLahir:'', bbl:'', pbl:'', ukaLahir:'',
      namaOrtu:b.namaIbu||'', nikAyah:'', noTlp:b.noTelepon||'', alamat:b.alamat||'', rt:'', rw:'',
      tglUkur:tglLalu, bb:bbLalu, pb:tbLalu,
      tglUkurBaru:new Date().toISOString().split('T')[0], bbBaru:'', pbBaru:'',
      lila:'', lika:'', statusNTO:'', asiEksklusif:'',
      vitAFeb:'', bukuKIA:'', ketPerkembangan:'', pkat:'', catatan:'',
      _bbLalu:bbLalu, _tbLalu:tbLalu, _tglUkurLalu:tglLalu,
      _statusStunting:b.statusStunting||'', _statusGizi:b.statusGizi||'',
    }]);
    showSuccess(`✅ ${b.nama} ditambahkan ke Sec. V`);
  }

  // ── Tambah Manual ───────────────────────────────────────────
  function tambahAsiManual(f) {
    setAsiRows(p=>[...p,{ balitaId:null, namaBalita:f.namaBalita, tglLahir:f.tglLahir,
      umurBulan:f.umurBulan, e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false, namaOrtu:f.namaOrtu }]);
    showSuccess(`✅ ${f.namaBalita} (manual) ditambahkan`);
  }
  function tambahGiziManual(f) {
    setGiziRows(p=>[...p,{ balitaId:null, namaBalita:f.namaBalita, tglLahir:f.tglLahir,
      umurBulan:f.umurBulan, namaOrtu:f.namaOrtu, pekerjaan:f.pekerjaan||'', bb:f.bb||'', tb:f.tb||'' }]);
    showSuccess(`✅ ${f.namaBalita} (manual) ditambahkan`);
  }
  function tambahPemManual(f) {
    setPemRows(p=>[...p,{
      balitaId:null, noKK:f.noKK||'', nik:f.nik||'', anakKe:'',
      namaAnak:f.namaBalita, tglLahir:f.tglLahir,
      lp:f.jenisKelamin||'', usiaKehamilanLahir:'', bbl:'', pbl:'', ukaLahir:'',
      namaOrtu:f.namaOrtu||'', nikAyah:'', noTlp:f.noTlp||'', alamat:f.alamat||'', rt:'', rw:'',
      tglUkur:'', bb:f.bb||'', pb:f.tb||'',
      tglUkurBaru:new Date().toISOString().split('T')[0], bbBaru:'', pbBaru:'',
      lila:'', lika:'', statusNTO:'', asiEksklusif:'',
      vitAFeb:'', bukuKIA:'', ketPerkembangan:'', pkat:'', catatan:'',
      _bbLalu:'', _tbLalu:'', _tglUkurLalu:'', _statusStunting:'', _statusGizi:'',
    }]);
    showSuccess(`✅ ${f.namaBalita} (manual) ditambahkan`);
  }

  function updA(i,k,v){ setAsiRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r)); }
  function updG(i,k,v){ setGiziRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r)); }
  function updP(i,k,v){ setPemRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r)); }

  // ── Export Excel ────────────────────────────────────────────
  async function exportExcel() {
    if (!isSaved) { showError('Simpan laporan terlebih dahulu!'); return; }
    try {
      if (!window.XLSX) await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
      const XLSX=window.XLSX, wb=XLSX.utils.book_new();
      const ws1=XLSX.utils.aoa_to_sheet([
        ['CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU'],
        [`Posyandu: ${info.namaPosyandu}  •  Bulan: ${info.bulan} ${info.tahun}`],
        [],['I. UMUM'],
        ['a. Posyandu',info.namaPosyandu],['b. Dusun',info.dusun],['c. Desa',info.desa],
        ['d. Petugas Lapangan',info.petugasLapangan],['e. Jumlah Kader Aktif',info.jumlahKader],
        [],
        ['II. KEGIATAN PENIMBANGAN','0-5 bln L','0-5 bln P','6-11 bln L','6-11 bln P','12-23 bln L','12-23 bln P','24-60 bln L','24-60 bln P'],
        ['(S) Semua balita',kegiatan.s_L_0_5,kegiatan.s_P_0_5,kegiatan.s_L_6_11,kegiatan.s_P_6_11,kegiatan.s_L_12_23,kegiatan.s_P_12_23,kegiatan.s_L_24_60,kegiatan.s_P_24_60],
        ['(K) Terdaftar KMS',kegiatan.k_L_0_5,kegiatan.k_P_0_5,kegiatan.k_L_6_11,kegiatan.k_P_6_11,kegiatan.k_L_12_23,kegiatan.k_P_12_23,kegiatan.k_L_24_60,kegiatan.k_P_24_60],
        ['(N) Naik BB',kegiatan.n_L_0_5,kegiatan.n_P_0_5,kegiatan.n_L_6_11,kegiatan.n_P_6_11,kegiatan.n_L_12_23,kegiatan.n_P_12_23,kegiatan.n_L_24_60,kegiatan.n_P_24_60],
        ['(T) Tidak naik BB',kegiatan.t_L_0_5,kegiatan.t_P_0_5,kegiatan.t_L_6_11,kegiatan.t_P_6_11,kegiatan.t_L_12_23,kegiatan.t_P_12_23,kegiatan.t_L_24_60,kegiatan.t_P_24_60],
        ['(O) Tdk bln lalu',kegiatan.o_L_0_5,kegiatan.o_P_0_5,kegiatan.o_L_6_11,kegiatan.o_P_6_11,kegiatan.o_L_12_23,kegiatan.o_P_12_23,kegiatan.o_L_24_60,kegiatan.o_P_24_60],
        ['(B) Pertama hadir',kegiatan.b_L_0_5,kegiatan.b_P_0_5,kegiatan.b_L_6_11,kegiatan.b_P_6_11,kegiatan.b_L_12_23,kegiatan.b_P_12_23,kegiatan.b_L_24_60,kegiatan.b_P_24_60],
        [],
        ['BGM',kegiatan.bawahGarisMerah,'Vit A Bayi Feb',kegiatan.vitA_bayi_feb,'Vit A Bayi Ags',kegiatan.vitA_bayi_ags,'Vit A Balita Feb',kegiatan.vitA_balita_feb,'Vit A Balita Ags',kegiatan.vitA_balita_ags],
        ['Ibu Hamil',kegiatan.jumlahHamil,'Persalinan',kegiatan.jumlahPersalinan],
        [],['III. PEMANTAUAN ASI EKSKLUSIF'],
        ['No','Nama Balita','Tgl Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Ortu','Sumber'],
        ...asiRows.map((r,i)=>[i+1,r.namaBalita,r.tglLahir,r.umurBulan,r.e0?'✓':'',r.e1?'✓':'',r.e2?'✓':'',r.e3?'✓':'',r.e4?'✓':'',r.e5?'✓':'',r.e6?'✓':'',r.namaOrtu,r.balitaId?'DB':'Manual']),
        [],['IV. PEMANTAUAN GIZI BURUK & KURUS'],
        ['No','Nama Balita','Tgl Lahir','Umur (bln)','Nama Ortu','Pekerjaan','BB (kg)','TB (cm)','Sumber'],
        ...giziRows.map((r,i)=>[i+1,r.namaBalita,r.tglLahir,r.umurBulan,r.namaOrtu,r.pekerjaan,r.bb,r.tb,r.balitaId?'DB':'Manual']),
        [],['Tgl Pencatatan',info.tanggalPencatatan,'Ketua Kader',info.ketuaKader],
      ]);
      ws1['!cols']=[{wch:36},...Array(8).fill({wch:12})];
      XLSX.utils.book_append_sheet(wb,ws1,'Catatan Bulanan');
      const ws2=XLSX.utils.aoa_to_sheet([
        ['V. FORMULIR PEMANTAUAN PERTUMBUHAN BALITA'],
        [`Posyandu: ${info.namaPosyandu}  •  Bulan: ${info.bulan} ${info.tahun}`],
        [],
        ['No','No KK','NIK','Anak Ke','Nama Anak','Tgl Lahir','L/P','Usia Kehamln','BBL','PBL','UKA','Nama Ortu','NIK Ayah','No Tlp','Alamat','RT','RW','Tgl Ukur Lalu','BB Lalu','TB Lalu','Tgl Ukur Baru','BB Baru','TB/PB Baru','LILA','LIKA','N/T/O/B','ASI','VitA Feb','Buku KIA','Ket Perkembangan','PKAT','Status Stunting'],
        ...pemRows.map((r,i)=>[
          i+1,r.noKK,r.nik,r.anakKe,r.namaAnak,r.tglLahir?formatTanggal(r.tglLahir):'',
          r.lp,r.usiaKehamilanLahir,r.bbl,r.pbl,r.ukaLahir,
          r.namaOrtu,r.nikAyah,r.noTlp,r.alamat,r.rt,r.rw,
          r._tglUkurLalu||r.tglUkur,r._bbLalu||r.bb,r._tbLalu||r.pb,
          r.tglUkurBaru||r.tglUkur,r.bbBaru||r.bb,r.pbBaru||r.pb,
          r.lila,r.lika,r.statusNTO,r.asiEksklusif,r.vitAFeb,r.bukuKIA,r.ketPerkembangan,r.pkat,r._statusStunting||'',
        ]),
      ]);
      ws2['!cols']=Array(32).fill({wch:11}); ws2['!cols'][4]={wch:22}; ws2['!cols'][11]={wch:22}; ws2['!cols'][14]={wch:20};
      XLSX.utils.book_append_sheet(wb,ws2,'Pemantauan Pertumbuhan');
      XLSX.writeFile(wb,`Laporan_${info.namaPosyandu||'Posyandu'}_${info.bulan}_${info.tahun}.xlsx`);
      showSuccess('File Excel berhasil diunduh!');
    } catch(err){ console.error(err); showError('Gagal export Excel'); }
  }

  // ── Styles ──────────────────────────────────────────────────
  const thG = { padding:'7px 6px', background:'#F0FDF4', fontSize:10, fontWeight:700, color:'#15803D', borderBottom:'2px solid #BBF7D0', whiteSpace:'nowrap', textAlign:'center', position:'sticky', top:0 };
  const thO = { padding:'7px 6px', background:'#FFF7ED', fontSize:10, fontWeight:700, color:'#D97706', borderBottom:'2px solid #FDE68A', whiteSpace:'nowrap', textAlign:'center', position:'sticky', top:0 };
  const td  = { padding:'4px 5px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle', textAlign:'center' };
  const tdL = { padding:'4px 5px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle', textAlign:'left' };
  const numIn = { padding:'4px 3px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:11, fontFamily:'inherit', outline:'none', width:46, textAlign:'center', background:'#fff', display:'block' };
  const txtIn = { padding:'5px 7px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:11, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', background:'#fff' };
  const selSt = { padding:'4px 5px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:11, fontFamily:'inherit', outline:'none', background:'#fff' };
  const delBtn= { background:'#FEF2F2', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#DC2626', fontSize:12 };

  // ── Header tombol section ────────────────────────────────────
  function SectionHeader3({ title, sub, onDB, onManual, labelDB, labelManual, color }) {
    return (
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>{title}</h3>
          {sub && <p style={{ margin:'3px 0 0', fontSize:11, color:'#9E9E9E' }}>{sub}</p>}
        </div>
        <TambahButtons labelDB={labelDB||'Dari DB'} labelManual={labelManual||'Manual'} onDB={onDB} onManual={onManual} colorDB={color||'#1B6B3A'}/>
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
          <Button variant={saving?'ghost':'primary'} onClick={handleSimpan} disabled={saving}>{saving?'⏳ Menyimpan...':'💾 Simpan'}</Button>
          <div style={{ position:'relative' }}>
            <button onClick={exportExcel} style={{ padding:'8px 16px', background:isSaved?'#1B6B3A':'#9E9E9E', color:'#fff', border:'none', borderRadius:8, cursor:isSaved?'pointer':'not-allowed', fontFamily:'inherit', fontWeight:700, fontSize:13 }}>📊 Export Excel</button>
            {!isSaved && <div style={{ position:'absolute', right:0, top:'110%', background:'#1F2937', color:'#fff', padding:'6px 10px', borderRadius:8, fontSize:11, whiteSpace:'nowrap', zIndex:100 }}>Simpan dulu baru bisa export</div>}
          </div>
        </div>
      </div>

      {/* Auto-fill banner */}
      {currentUser && (
        <div style={{ background:'#F0FDF4', border:'1.5px solid #BBF7D0', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#15803D', display:'flex', alignItems:'center', gap:8 }}>
          ✨ <span>Auto-fill dari akun <strong>{currentUser.nama}</strong> — bisa diedit manual.</span>
        </div>
      )}

      {/* Filter */}
      <div style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ fontSize:20 }}>🔍</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#1D4ED8', marginBottom:2 }}>Muat Data Laporan Sebelumnya</div>
          <div style={{ fontSize:11, color:'#60A5FA' }}>Pilih tanggal → data laporan dimuat dari database</div>
        </div>
        <input type="date" value={filterTanggal} onChange={e=>setFilterTanggal(e.target.value)}
          style={{ padding:'9px 14px', borderRadius:8, border:'1.5px solid #93C5FD', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}/>
        <Button onClick={handleFilterTanggal} disabled={loadingFilter}>{loadingFilter?'⏳ Memuat...':'📂 Muat Data'}</Button>
      </div>

      {/* ── I. Info Umum ──────────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader title="I. Informasi Umum Posyandu"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 20px' }}>
          <Field label="Nama Posyandu *" value={info.namaPosyandu} onChange={v=>setInfo(p=>({...p,namaPosyandu:v}))}/>
          <Field label="Dusun" value={info.dusun} onChange={v=>setInfo(p=>({...p,dusun:v}))}/>
          <Field label="Desa" value={info.desa} onChange={v=>setInfo(p=>({...p,desa:v}))}/>
          <Field label="Petugas Lapangan" value={info.petugasLapangan} onChange={v=>setInfo(p=>({...p,petugasLapangan:v}))}/>
          <Field label="Jumlah Kader Aktif" type="number" min="0" value={info.jumlahKader} onChange={v=>setInfo(p=>({...p,jumlahKader:v}))}/>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Bulan</label>
              <select value={info.bulan} onChange={e=>setInfo(p=>({...p,bulan:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                {BULAN_LIST.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ width:90, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Tahun</label>
              <input type="number" value={info.tahun} onChange={e=>setInfo(p=>({...p,tahun:e.target.value}))}
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' }}/>
            </div>
          </div>
          <Field label="Tanggal Pelaksanaan" type="date" value={info.tanggalPelaksanaan} onChange={v=>setInfo(p=>({...p,tanggalPelaksanaan:v}))}/>
          <Field label="Tanggal Pencatatan *" type="date" value={info.tanggalPencatatan} onChange={v=>setInfo(p=>({...p,tanggalPencatatan:v}))}/>
          <Field label="Ketua Kader" value={info.ketuaKader} onChange={v=>setInfo(p=>({...p,ketuaKader:v}))}/>
        </div>
      </Card>

      {/* ── II. Kegiatan Penimbangan ──────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>II. Kegiatan Penimbangan</h3>
          <button onClick={()=>setShowKodeInfo(v=>!v)} style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12, color:'#16A34A', fontFamily:'inherit', fontWeight:600 }}>
            {showKodeInfo?'▲ Sembunyikan':'📖 Keterangan Kode'}
          </button>
        </div>
        {showKodeInfo && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            {Object.entries(KODE).map(([k,v])=>(
              <div key={k} style={{ padding:'10px 14px', background:v.bg, borderRadius:10 }}>
                <span style={{ fontWeight:800, fontSize:16, color:v.w }}>{k} </span>
                <span style={{ fontWeight:700, fontSize:12, color:v.w }}>{v.label}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr>
                <th style={{ ...thG, textAlign:'left', width:200, background:'#F9FAFB', color:'#6B7280' }}>Kegiatan</th>
                {['0-5 L','0-5 P','6-11 L','6-11 P','12-23 L','12-23 P','24-60 L','24-60 P'].map(h=>(
                  <th key={h} style={{ ...thG, width:64 }}>{h} bln</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['(S) Semua balita',           ['s_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60'],KODE.S.w],
                ['(K) Terdaftar KMS',          ['k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60'],KODE.K.w],
                ['(N) Naik berat badan',       ['n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60'],KODE.N.w],
                ['(T) Tidak naik BB',          ['t_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60'],KODE.T.w],
                ['(O) Tdk ditimbang bln lalu', ['o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60'],KODE.O.w],
                ['(B) Pertama kali hadir',     ['b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60'],KODE.B.w],
              ].map(([label,fields,color])=>(
                <tr key={label}>
                  <td style={{ ...td, textAlign:'left', paddingLeft:10, fontWeight:600, color }}>{label}</td>
                  {fields.map(f=>(
                    <td key={f} style={td}>
                      <input type="number" value={kegiatan[f]||''} min="0"
                        onChange={e=>setKegiatan(p=>({...p,[f]:e.target.value}))} style={numIn}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0 20px', marginTop:20, paddingTop:16, borderTop:'1px solid #F0F0F0' }}>
          <Field label="BGM (Bawah Garis Merah)" type="number" min="0" value={kegiatan.bawahGarisMerah} onChange={v=>setKegiatan(p=>({...p,bawahGarisMerah:v}))}/>
          <Field label="Vit A Bayi — Feb" type="number" min="0" value={kegiatan.vitA_bayi_feb} onChange={v=>setKegiatan(p=>({...p,vitA_bayi_feb:v}))}/>
          <Field label="Vit A Bayi — Ags" type="number" min="0" value={kegiatan.vitA_bayi_ags} onChange={v=>setKegiatan(p=>({...p,vitA_bayi_ags:v}))}/>
          <Field label="Vit A Balita — Feb" type="number" min="0" value={kegiatan.vitA_balita_feb} onChange={v=>setKegiatan(p=>({...p,vitA_balita_feb:v}))}/>
          <Field label="Vit A Balita — Ags" type="number" min="0" value={kegiatan.vitA_balita_ags} onChange={v=>setKegiatan(p=>({...p,vitA_balita_ags:v}))}/>
          <Field label="Ibu Hamil" type="number" min="0" value={kegiatan.jumlahHamil} onChange={v=>setKegiatan(p=>({...p,jumlahHamil:v}))}/>
          <Field label="Jumlah Persalinan" type="number" min="0" value={kegiatan.jumlahPersalinan} onChange={v=>setKegiatan(p=>({...p,jumlahPersalinan:v}))}/>
        </div>
      </Card>

      {/* ── III. ASI Eksklusif ────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader3
          title="III. Pemantauan ASI Eksklusif"
          sub="🔗 Dari DB = ter-link database balita • ✏️ Manual = tidak ter-link (semua umur)"
          onDB={()=>setModalDB('asi')} onManual={()=>setModalManual('asi')}
          labelDB="Tambah dari DB" labelManual="Tambah Manual"
        />
        {asiRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px', color:'#9E9E9E' }}>
            <div style={{ fontSize:36, marginBottom:6 }}>🍼</div>
            <div style={{ fontWeight:600 }}>Belum ada data ASI</div>
            <div style={{ fontSize:11, marginTop:4 }}>Gunakan tombol di kanan atas untuk menambah data</div>
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
                  <th style={{ ...thG, width:36 }}></th>
                </tr>
              </thead>
              <tbody>
                {asiRows.map((r,i)=>(
                  <tr key={i} style={{ background:r.balitaId?(i%2===0?'#F0FDF4':'#E8F8EF'):(i%2===0?'#fff':'#FAFAFA') }}>
                    <td style={td}><div style={{ fontWeight:700 }}>{i+1}</div>{r.balitaId&&<div style={{ fontSize:8, color:'#16A34A' }}>🔗</div>}</td>
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontWeight:600 }}>{r.namaBalita}</td>
                    <td style={{ ...td, color:'#6B7280', fontSize:10 }}>{r.tglLahir||'-'}</td>
                    <td style={td}><span style={{ fontWeight:700, color:'#1B6B3A', background:'#F0FDF4', padding:'2px 8px', borderRadius:10, fontSize:11 }}>{r.umurBulan} bln</span></td>
                    {['e0','e1','e2','e3','e4','e5','e6'].map(e=>(
                      <td key={e} style={td}><input type="checkbox" checked={r[e]||false} onChange={ev=>updA(i,e,ev.target.checked)}/></td>
                    ))}
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontSize:10 }}>{r.namaOrtu}</td>
                    <td style={td}><button onClick={()=>setAsiRows(p=>p.filter((_,j)=>j!==i))} style={delBtn}>🗑️</button></td>
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
          sub="🔗 Dari DB = BB & TB otomatis dari data ukur terakhir • ✏️ Manual = input langsung"
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
                  <th style={{ ...thO, width:36 }}></th>
                </tr>
              </thead>
              <tbody>
                {giziRows.map((r,i)=>(
                  <tr key={i} style={{ background:i%2===0?'#FFF7ED':'#FFFBEB' }}>
                    <td style={td}><div style={{ fontWeight:700 }}>{i+1}</div>{r.balitaId&&<div style={{ fontSize:8, color:'#D97706' }}>🔗</div>}</td>
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontWeight:600 }}>{r.namaBalita}</td>
                    <td style={{ ...td, color:'#6B7280', fontSize:10 }}>{r.tglLahir||'-'}</td>
                    <td style={td}><span style={{ fontWeight:700, color:'#D97706', background:'#FFF7ED', padding:'2px 8px', borderRadius:10 }}>{r.umurBulan} bln</span></td>
                    <td style={{ ...td, textAlign:'left', paddingLeft:8, fontSize:10 }}>{r.namaOrtu}</td>
                    <td style={td}><input value={r.pekerjaan||''} onChange={e=>updG(i,'pekerjaan',e.target.value)} style={{ ...txtIn, width:110 }} placeholder="Pekerjaan..."/></td>
                    <td style={td}><input type="number" step="0.01" value={r.bb||''} onChange={e=>updG(i,'bb',e.target.value)} style={numIn} placeholder="kg"/></td>
                    <td style={td}><input type="number" step="0.1" value={r.tb||''} onChange={e=>updG(i,'tb',e.target.value)} style={numIn} placeholder="cm"/></td>
                    <td style={td}><button onClick={()=>setGiziRows(p=>p.filter((_,j)=>j!==i))} style={delBtn}>🗑️</button></td>
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
            <div style={{ fontSize:12, marginTop:4 }}>Gunakan tombol di kanan atas</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:10, minWidth:1800 }}>
              <thead>
                <tr>
                  {/* Identitas */}
                  {[
                    {l:'No',w:36},{l:'No KK',w:90},{l:'NIK',w:110},{l:'Anak Ke',w:46},
                    {l:'Nama Anak',w:130},{l:'Tgl Lahir',w:88},{l:'L/P',w:36},
                    {l:'Usia Kmln',w:52},{l:'BBL',w:46},{l:'PBL',w:46},{l:'UKA',w:46},
                    {l:'Nama Ortu',w:110},{l:'NIK Ayah',w:100},{l:'No Tlp',w:90},{l:'Alamat',w:120},{l:'RT',w:34},{l:'RW',w:34},
                  ].map((h,i)=><th key={i} style={{ ...thG, width:h.w, minWidth:h.w }}>{h.l}</th>)}
                  {/* Bulan lalu */}
                  {[{l:'Tgl Ukur Lalu',w:100},{l:'BB Lalu',w:58},{l:'TB Lalu',w:58}].map((h,i)=>(
                    <th key={'l'+i} style={{ ...thG, width:h.w, background:'#EFF6FF', color:'#1D4ED8', borderBottom:'2px solid #BFDBFE' }}>{h.l}</th>
                  ))}
                  {/* Bulan baru */}
                  {[{l:'Tgl Ukur *',w:110},{l:'BB Baru *',w:58},{l:'TB/PB Baru *',w:70}].map((h,i)=>(
                    <th key={'b'+i} style={{ ...thG, width:h.w, background:'#FFFDE7', color:'#B45309', borderBottom:'2px solid #FDE68A' }}>{h.l}</th>
                  ))}
                  {/* Data lain */}
                  {[
                    {l:'LILA/LIKA',w:80},
                    {l:'N/T/O/B',w:58},{l:'ASI',w:52},{l:'VitA Feb',w:60},{l:'Buku KIA',w:60},
                    {l:'Perkembangan PKAT',w:120},
                    {l:'',w:34},
                  ].map((h,i)=><th key={'d'+i} style={{ ...thG, width:h.w, minWidth:h.w }}>{h.l}</th>)}
                </tr>
              </thead>
              <tbody>
                {pemRows.map((r,i)=>(
                  <tr key={r.balitaId||i} style={{ background:r.balitaId?(i%2===0?'#F0FDF4':'#E8F8EF'):(i%2===0?'#fff':'#FAFAFA') }}>
                    <td style={td}><div style={{ fontWeight:700 }}>{i+1}</div>{r.balitaId&&<div style={{ fontSize:8, color:'#16A34A' }}>🔗</div>}</td>
                    <td style={td}><input value={r.noKK||''} onChange={e=>updP(i,'noKK',e.target.value)} style={{ ...txtIn, width:80 }}/></td>
                    <td style={td}><input value={r.nik||''} onChange={e=>updP(i,'nik',e.target.value)} style={{ ...txtIn, width:100 }}/></td>
                    <td style={td}><input type="number" value={r.anakKe||''} onChange={e=>updP(i,'anakKe',e.target.value)} style={{ ...numIn, width:34 }}/></td>
                    <td style={{ ...tdL, fontWeight:700, whiteSpace:'nowrap' }}>{r.namaAnak}</td>
                    <td style={{ ...td, fontSize:9, color:'#6B7280', whiteSpace:'nowrap' }}>{r.tglLahir?formatTanggal(r.tglLahir):'-'}</td>
                    <td style={{ ...td, fontWeight:700, color:r.lp==='L'?'#2563EB':'#DB2777' }}>{r.lp}</td>
                    <td style={td}><input type="number" value={r.usiaKehamilanLahir||''} onChange={e=>updP(i,'usiaKehamilanLahir',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.01" value={r.bbl||''} onChange={e=>updP(i,'bbl',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.pbl||''} onChange={e=>updP(i,'pbl',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.ukaLahir||''} onChange={e=>updP(i,'ukaLahir',e.target.value)} style={numIn}/></td>
                    <td style={{ ...tdL, fontSize:9, whiteSpace:'nowrap' }}>{r.namaOrtu}</td>
                    <td style={td}><input value={r.nikAyah||''} onChange={e=>updP(i,'nikAyah',e.target.value)} style={{ ...txtIn, width:90 }}/></td>
                    <td style={td}><input value={r.noTlp||''} onChange={e=>updP(i,'noTlp',e.target.value)} style={{ ...txtIn, width:82 }}/></td>
                    <td style={td}><input value={r.alamat||''} onChange={e=>updP(i,'alamat',e.target.value)} style={{ ...txtIn, width:110 }}/></td>
                    <td style={td}><input value={r.rt||''} onChange={e=>updP(i,'rt',e.target.value)} style={{ ...numIn, width:30 }}/></td>
                    <td style={td}><input value={r.rw||''} onChange={e=>updP(i,'rw',e.target.value)} style={{ ...numIn, width:30 }}/></td>
                    {/* Bulan lalu — read only */}
                    <td style={{ ...td, background:'#EFF6FF', fontSize:9, color:'#6B7280', whiteSpace:'nowrap' }}>{r._tglUkurLalu||r.tglUkur||'-'}</td>
                    <td style={{ ...td, background:'#EFF6FF', fontWeight:700, color:'#1D4ED8' }}>{r._bbLalu||r.bb||'-'}</td>
                    <td style={{ ...td, background:'#EFF6FF', fontWeight:700, color:'#1D4ED8' }}>{r._tbLalu||r.pb||'-'}</td>
                    {/* Bulan baru */}
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="date" value={r.tglUkurBaru||''} onChange={e=>updP(i,'tglUkurBaru',e.target.value)} style={{ ...txtIn, width:108, borderColor:'#D97706' }}/></td>
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="number" step="0.01" value={r.bbBaru||''} onChange={e=>updP(i,'bbBaru',e.target.value)} placeholder="kg" style={{ ...numIn, borderColor:'#D97706', width:54 }}/></td>
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="number" step="0.1" value={r.pbBaru||''} onChange={e=>updP(i,'pbBaru',e.target.value)} placeholder="cm" style={{ ...numIn, borderColor:'#D97706', width:54 }}/></td>
                    {/* LILA / LIKA — 1 kolom 2 baris */}
                    <td style={td}>
                      <input type="number" step="0.1" value={r.lila||''} onChange={e=>updP(i,'lila',e.target.value)} placeholder="LILA" style={{ ...numIn, width:68, marginBottom:3 }}/>
                      <input type="number" step="0.1" value={r.lika||''} onChange={e=>updP(i,'lika',e.target.value)} placeholder="LIKA" style={{ ...numIn, width:68 }}/>
                    </td>
                    <td style={td}>
                      <select value={r.statusNTO||''} onChange={e=>updP(i,'statusNTO',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="N">N</option><option value="T">T</option><option value="O">O</option><option value="B">B</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select value={r.asiEksklusif||''} onChange={e=>updP(i,'asiEksklusif',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select value={r.vitAFeb||''} onChange={e=>updP(i,'vitAFeb',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select value={r.bukuKIA||''} onChange={e=>updP(i,'bukuKIA',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Punya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    {/* Perkembangan + PKAT — 1 kolom 2 baris */}
                    <td style={td}>
                      <select value={r.ketPerkembangan||''} onChange={e=>updP(i,'ketPerkembangan',e.target.value)} style={{ ...selSt, width:112, marginBottom:3, display:'block' }}>
                        <option value="">- Perkembangan</option>
                        <option value="Sesuai">Sesuai</option>
                        <option value="Meragukan">Meragukan</option>
                        <option value="Penyimpangan">Penyimpangan</option>
                      </select>
                      <select value={r.pkat||''} onChange={e=>updP(i,'pkat',e.target.value)} style={{ ...selSt, width:112, display:'block' }}>
                        <option value="">- PKAT</option>
                        <option value="Ya">Ya</option>
                        <option value="Belum">Belum</option>
                      </select>
                    </td>
                    <td style={td}><button onClick={()=>setPemRows(p=>p.filter((_,j)=>j!==i))} style={delBtn}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pemRows.length > 0 && (
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Button variant="ghost" onClick={handleSimpan} disabled={saving}>{saving?'Menyimpan...':'💾 Simpan'}</Button>
            <Button onClick={exportExcel}>📊 Export Excel</Button>
          </div>
        )}
      </Card>

      {/* ── Modals DB ───────────────────────────────────────── */}
      {modalDB === 'asi' && (
        <ModalPilihBalita title="Tambah Bayi ke ASI Eksklusif" subtitle="Semua usia — dari database balita"
          balitaList={balitaList} sudahDipilih={asiRows} onSelect={b=>{tambahAsiDB(b);}}
          onClose={()=>setModalDB(null)}/>
      )}
      {modalDB === 'gizi' && (
        <ModalPilihBalita title="Tambah Balita ke Gizi Buruk & Kurus" subtitle="Semua usia — dari database balita"
          balitaList={balitaList} sudahDipilih={giziRows} onSelect={b=>{tambahGiziDB(b);}}
          onClose={()=>setModalDB(null)}/>
      )}
      {modalDB === 'pem' && (
        <ModalPilihBalita title="Tambah Balita ke Pemantauan Pertumbuhan" subtitle="Semua usia — dari database balita"
          balitaList={balitaList} sudahDipilih={pemRows} onSelect={b=>{tambahPemDB(b);}}
          onClose={()=>setModalDB(null)}/>
      )}

      {/* ── Modals Manual ────────────────────────────────────── */}
      {modalManual === 'asi'       && <ModalManual mode="asi"        onSave={tambahAsiManual}  onClose={()=>setModalManual(null)}/>}
      {modalManual === 'gizi'      && <ModalManual mode="gizi"       onSave={tambahGiziManual} onClose={()=>setModalManual(null)}/>}
      {modalManual === 'pemantauan'&& <ModalManual mode="pemantauan" onSave={tambahPemManual}  onClose={()=>setModalManual(null)}/>}
    </div>
  );
}