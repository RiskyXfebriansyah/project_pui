// ============================================================
//  LaporanPage.jsx — LENGKAP 12 BARIS Section II
//  Sesuai formulir fisik Catatan Bulanan Posyandu
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
  return `${String(d.getDate()).padStart(2,'0')} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

const KODE = {
  S:{ label:'Semua Balita', w:'#1565C0', bg:'#EFF6FF', desc:'Jumlah semua balita di kelompok penimbangan bulan ini.' },
  K:{ label:'Terdaftar KMS', w:'#16A34A', bg:'#F0FDF4', desc:'Balita yang terdaftar dan punya Kartu Menuju Sehat (KMS).' },
  N:{ label:'Naik BB', w:'#16A34A', bg:'#F0FDF4', desc:'Balita yang berat badannya naik dari bulan lalu.' },
  T:{ label:'Tidak Naik BB', w:'#DC2626', bg:'#FEF2F2', desc:'Balita yang berat badannya tidak naik (T = Tidak Naik).' },
  O:{ label:'Baru Timbang', w:'#D97706', bg:'#FFFBEB', desc:'Ditimbang bulan ini tapi tidak ditimbang bulan lalu.' },
  B:{ label:'Pertama Hadir', w:'#9333EA', bg:'#F5F3FF', desc:'Pertama kali hadir di penimbangan bulan ini.' },
};

const BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const defaultKegiatan = () => ({
  // Baris 01-06: S, K, N, T, O, B — per kelompok umur L/P
  s_L_0_5:'',s_P_0_5:'',s_L_6_11:'',s_P_6_11:'',s_L_12_23:'',s_P_12_23:'',s_L_24_60:'',s_P_24_60:'',
  k_L_0_5:'',k_P_0_5:'',k_L_6_11:'',k_P_6_11:'',k_L_12_23:'',k_P_12_23:'',k_L_24_60:'',k_P_24_60:'',
  n_L_0_5:'',n_P_0_5:'',n_L_6_11:'',n_P_6_11:'',n_L_12_23:'',n_P_12_23:'',n_L_24_60:'',n_P_24_60:'',
  t_L_0_5:'',t_P_0_5:'',t_L_6_11:'',t_P_6_11:'',t_L_12_23:'',t_P_12_23:'',t_L_24_60:'',t_P_24_60:'',
  o_L_0_5:'',o_P_0_5:'',o_L_6_11:'',o_P_6_11:'',o_L_12_23:'',o_P_12_23:'',o_L_24_60:'',o_P_24_60:'',
  b_L_0_5:'',b_P_0_5:'',b_L_6_11:'',b_P_6_11:'',b_L_12_23:'',b_P_12_23:'',b_L_24_60:'',b_P_24_60:'',
  // Baris 09-12: total angka (tidak per kelompok umur)
  bawahGarisMerah:'',         // 09 (A) BGM
  vitA_bayi_feb:'',           // 10 (A) Vit A Bayi Februari
  vitA_bayi_ags:'',           // 10 (A) Vit A Bayi Agustus
  vitA_balita_feb:'',         // 11 (A) Vit A Balita Februari
  vitA_balita_ags:'',         // 11 (A) Vit A Balita Agustus
  aEksklusif:'',              // 12 (E) Bayi dengan ASI eksklusif
  jumlahHamil:'',
  jumlahPersalinan:'',
});

// ── Auto-hitung D = 03+04+05+06 per kolom ─────────────────────
function hitungD(k, col) {
  const n = parseInt(k[`n_${col}`])||0;
  const t = parseInt(k[`t_${col}`])||0;
  const o = parseInt(k[`o_${col}`])||0;
  const b = parseInt(k[`b_${col}`])||0;
  const total = n+t+o+b;
  return total > 0 ? total : '';
}
// Auto-hitung minus = K - D per kolom
function hitungMinus(k, col) {
  const km = parseInt(k[`k_${col}`])||0;
  const d  = parseInt(hitungD(k,col))||0;
  const result = km - d;
  return result !== 0 ? result : '';
}

// ── Modal Pilih Balita dari DB ────────────────────────────────
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:560, maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0' }}>
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
                <div key={i} onClick={()=>setSelectedIbu(b.namaIbu)} style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', gap:12, background:'#fff' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#F0FDF4'}
                  onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <span style={{ fontSize:24 }}>👩</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{b.namaIbu||'-'}</div>
                    <div style={{ fontSize:11, color:'#9E9E9E' }}>{b.desa||b.namaPosyandu||'-'}</div>
                  </div>
                  <span style={{ fontSize:12, color:'#16A34A', fontWeight:700, background:'#F0FDF4', padding:'2px 10px', borderRadius:20 }}>{balitaList.filter(x=>x.namaIbu===b.namaIbu).length} anak</span>
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
                const sudah = sudahDipilih?.find(r => r.balitaId === b.id);
                const last = b.riwayat?.[b.riwayat.length-1];
                return (
                  <div key={b.id} style={{ padding:'14px', borderRadius:12, background:'#F9FAFB', marginBottom:10, border:'1px solid #E5E7EB' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                      <span style={{ fontSize:28 }}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{b.nama}</div>
                        <div style={{ fontSize:11, color:'#9E9E9E' }}>{hitungUmur(b.tanggalLahir)} bln • {b.jenisKelamin}</div>
                        {last && <div style={{ fontSize:11, color:'#16A34A', fontWeight:600 }}>📊 BB {last.bb||last.beratBadan}kg • TB {last.tb||last.tinggiBadan}cm</div>}
                      </div>
                    </div>
                    {sudah
                      ? <span style={{ fontSize:11, color:'#16A34A', fontWeight:700, padding:'5px 12px', background:'#F0FDF4', borderRadius:8 }}>✅ Sudah ditambahkan</span>
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
              <div>Tidak ada hasil untuk "{search}"</div>
            </div>
          )}
        </div>
        <div style={{ padding:'12px 24px', borderTop:'1px solid #F0F0F0', display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Input Manual ────────────────────────────────────────
function ModalManual({ mode, onSave, onClose }) {
  const [form, setForm] = useState({ namaBalita:'', tglLahir:'', jenisKelamin:'L', namaOrtu:'', namaAyah:'', noTlp:'', alamat:'', bb:'', tb:'', pekerjaan:'', nik:'', noKK:'' });
  const umur = hitungUmur(form.tglLahir);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const titles = { asi:'Tambah Manual — ASI Eksklusif', gizi:'Tambah Manual — Gizi Buruk & Kurus', pemantauan:'Tambah Manual — Pemantauan Pertumbuhan' };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1001, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:500, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0' }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>{titles[mode]}</h3>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>Data tidak ter-link ke database balita</p>
        </div>
        <div style={{ padding:'16px 24px', overflowY:'auto', flex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Field label="Nama Balita *" value={form.namaBalita} onChange={v=>f('namaBalita',v)}/>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Tgl Lahir *</label>
              <input type="date" value={form.tglLahir} onChange={e=>f('tglLahir',e.target.value)} style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
            </div>
          </div>
          {form.tglLahir && <div style={{ padding:'8px 12px', background:'#F0FDF4', borderRadius:8, fontSize:12, color:'#16A34A', fontWeight:600, marginBottom:12 }}>📅 Umur: <strong>{umur} bulan</strong></div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Jenis Kelamin</label>
              <select value={form.jenisKelamin} onChange={e=>f('jenisKelamin',e.target.value)} style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
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
        </div>
        <div style={{ padding:'14px 24px', borderTop:'1px solid #F0F0F0', display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>Batal</button>
          <button onClick={()=>{ if(!form.namaBalita) return; onSave({...form, umurBulan:umur}); onClose(); }} style={{ padding:'8px 18px', background:'#1B6B3A', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}>✅ Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ── TambahButtons ─────────────────────────────────────────────
function TambahButtons({ onDB, onManual, colorDB='#1B6B3A', colorManual='#6D28D9' }) {
  return (
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={onManual} style={{ padding:'7px 12px', background:colorManual, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12 }}>✏️ Manual</button>
      <button onClick={onDB} style={{ padding:'7px 12px', background:colorDB, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:12 }}>🔗 Dari DB</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function LaporanPage({ balitaList = [], currentUser = null }) {
  const { toast, showSuccess, showError, showInfo } = useToast();

  const makeDefaultInfo = () => ({
    namaPosyandu: currentUser?.posyandu || '',
    dusun:'', desa:'',
    petugasLapangan: currentUser?.nama || '',
    jumlahKader:'',
    bulan: BULAN_LIST[new Date().getMonth()],
    tahun: String(new Date().getFullYear()),
    tanggalPelaksanaan:'', tanggalPencatatan:'', ketuaKader:'',
  });

  const [filterTanggal, setFilterTanggal] = useState('');
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [laporanId, setLaporanId]         = useState(null);
  const [isSaved, setIsSaved]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [info, setInfo]                   = useState(makeDefaultInfo());
  const [kegiatan, setKegiatan]           = useState(defaultKegiatan());
  const [asiRows, setAsiRows]             = useState([]);
  const [giziRows, setGiziRows]           = useState([]);
  const [pemRows, setPemRows]             = useState([]);
  const [showKodeInfo, setShowKodeInfo]   = useState(false);
  const [modalDB, setModalDB]             = useState(null);
  const [modalManual, setModalManual]     = useState(null);

  useEffect(() => {
    if (currentUser) setInfo(prev => ({
      ...prev,
      namaPosyandu: prev.namaPosyandu || currentUser.posyandu || '',
      petugasLapangan: prev.petugasLapangan || currentUser.nama || '',
    }));
  }, [currentUser]);

  // Kolom yang dipakai di tabel penimbangan
  const COLS = ['L_0_5','P_0_5','L_6_11','P_6_11','L_12_23','P_12_23','L_24_60','P_24_60'];

  // ── Filter / Load ───────────────────────────────────────────
  async function handleFilterTanggal() {
    if (!filterTanggal) { showError('Pilih tanggal pencatatan terlebih dahulu'); return; }
    setLoadingFilter(true);
    try {
      const res = await LaporanAPI.getByTanggal(filterTanggal);
      if (res?.status?.code === 200 && res.data) {
        const d = res.data;
        setLaporanId(d.id);
        setInfo({ namaPosyandu:d.namaPosyandu||currentUser?.posyandu||'', dusun:d.dusun||'', desa:d.desa||'', petugasLapangan:d.petugasLapangan||currentUser?.nama||'', jumlahKader:d.jumlahKaderAktif||'', bulan:d.bulan||BULAN_LIST[new Date().getMonth()], tahun:String(d.tahun||new Date().getFullYear()), tanggalPelaksanaan:d.tanggalPelaksanaan?.split('T')[0]||'', tanggalPencatatan:d.tanggalPencatatan?.split('T')[0]||'', ketuaKader:d.ketuaKader||'' });
        if (d.kegiatan) {
          const k = d.kegiatan;
          setKegiatan({ s_L_0_5:k.s_L_0_5||'',s_P_0_5:k.s_P_0_5||'',s_L_6_11:k.s_L_6_11||'',s_P_6_11:k.s_P_6_11||'',s_L_12_23:k.s_L_12_23||'',s_P_12_23:k.s_P_12_23||'',s_L_24_60:k.s_L_24_60||'',s_P_24_60:k.s_P_24_60||'',k_L_0_5:k.k_L_0_5||'',k_P_0_5:k.k_P_0_5||'',k_L_6_11:k.k_L_6_11||'',k_P_6_11:k.k_P_6_11||'',k_L_12_23:k.k_L_12_23||'',k_P_12_23:k.k_P_12_23||'',k_L_24_60:k.k_L_24_60||'',k_P_24_60:k.k_P_24_60||'',n_L_0_5:k.n_L_0_5||'',n_P_0_5:k.n_P_0_5||'',n_L_6_11:k.n_L_6_11||'',n_P_6_11:k.n_P_6_11||'',n_L_12_23:k.n_L_12_23||'',n_P_12_23:k.n_P_12_23||'',n_L_24_60:k.n_L_24_60||'',n_P_24_60:k.n_P_24_60||'',t_L_0_5:k.t_L_0_5||'',t_P_0_5:k.t_P_0_5||'',t_L_6_11:k.t_L_6_11||'',t_P_6_11:k.t_P_6_11||'',t_L_12_23:k.t_L_12_23||'',t_P_12_23:k.t_P_12_23||'',t_L_24_60:k.t_L_24_60||'',t_P_24_60:k.t_P_24_60||'',o_L_0_5:k.o_L_0_5||'',o_P_0_5:k.o_P_0_5||'',o_L_6_11:k.o_L_6_11||'',o_P_6_11:k.o_P_6_11||'',o_L_12_23:k.o_L_12_23||'',o_P_12_23:k.o_P_12_23||'',o_L_24_60:k.o_L_24_60||'',o_P_24_60:k.o_P_24_60||'',b_L_0_5:k.b_L_0_5||'',b_P_0_5:k.b_P_0_5||'',b_L_6_11:k.b_L_6_11||'',b_P_6_11:k.b_P_6_11||'',b_L_12_23:k.b_L_12_23||'',b_P_12_23:k.b_P_12_23||'',b_L_24_60:k.b_L_24_60||'',b_P_24_60:k.b_P_24_60||'',bawahGarisMerah:k.bawahGarisMerah||'',vitA_bayi_feb:k.vitA_Bayi_Feb||'',vitA_bayi_ags:k.vitA_Bayi_Ags||'',vitA_balita_feb:k.vitA_Balita_Feb||'',vitA_balita_ags:k.vitA_Balita_Ags||'',aEksklusif:k.aEksklusif||'',jumlahHamil:k.jumlahHamil||'',jumlahPersalinan:k.jumlahPersalinan||'' });
        }
        if (d.asiRows?.length) setAsiRows(d.asiRows);
        if (d.giziRows?.length) setGiziRows(d.giziRows);
        if (d.pemantauanRows?.length) setPemRows(d.pemantauanRows);
        setIsSaved(true);
        showSuccess(`Laporan tanggal ${filterTanggal} berhasil dimuat!`);
      } else {
        showInfo('Tidak ada laporan. Form dikosongkan untuk input baru.');
        setLaporanId(null); setInfo({...makeDefaultInfo(), tanggalPencatatan:filterTanggal});
        setKegiatan(defaultKegiatan()); setAsiRows([]); setGiziRows([]); setPemRows([]); setIsSaved(false);
      }
    } catch(err) { console.error(err); showError('Gagal memuat data.'); }
    finally { setLoadingFilter(false); }
  }

  async function handleSimpan() {
    if (!info.namaPosyandu || !info.tanggalPencatatan) { showError('Nama Posyandu dan Tanggal Pencatatan wajib diisi'); return; }
    setSaving(true);
    try {
      const res = await LaporanAPI.simpan({ info, kegiatan, asiRows, giziRows, pemantauanRows:pemRows });
      if (res?.status?.code === 200 || res?.status?.code === 201) {
        setLaporanId(res.data?.id || laporanId); setIsSaved(true);
        showSuccess('Laporan berhasil disimpan! Sekarang bisa Export Excel.');
      } else showError(res?.status?.message || 'Gagal menyimpan');
    } catch { showError('Gagal terhubung ke server'); }
    finally { setSaving(false); }
  }

  // ── Tambah dari DB ──────────────────────────────────────────
  function tambahAsiDB(b) {
    if (asiRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    setAsiRows(p=>[...p,{ balitaId:b.id, namaBalita:b.nama, tglLahir:b.tanggalLahir?.split('T')[0]||'', umurBulan:hitungUmur(b.tanggalLahir), e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false, namaOrtu:b.namaIbu||'' }]);
    showSuccess(`${b.nama} ditambahkan`);
  }
  function tambahGiziDB(b) {
    if (giziRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    const last = b.riwayat?.[b.riwayat.length-1];
    setGiziRows(p=>[...p,{ balitaId:b.id, namaBalita:b.nama, tglLahir:b.tanggalLahir?.split('T')[0]||'', umurBulan:hitungUmur(b.tanggalLahir), namaOrtu:b.namaIbu||'', pekerjaan:'', bb:last?.bb||last?.beratBadan||b.beratBadan||'', tb:last?.tb||last?.tinggiBadan||b.tinggiBadan||'' }]);
    showSuccess(`${b.nama} ditambahkan`);
  }
  function tambahPemDB(b) {
    if (pemRows.find(r=>r.balitaId===b.id)) { showError(`${b.nama} sudah ada`); return; }
    const last = b.riwayat?.[b.riwayat.length-1];
    const bbL = last?.bb||last?.beratBadan||b.beratBadan||'';
    const tbL = last?.tb||last?.tinggiBadan||b.tinggiBadan||'';
    const tglL= last?.tanggal||last?.tglUkur||b.tglUkurTerakhir||'';
    setPemRows(p=>[...p,{ balitaId:b.id, noKK:b.noKK||'', nik:b.nik||'', anakKe:'', namaAnak:b.nama, tglLahir:b.tanggalLahir||'', lp:b.jenisKelamin==='Laki-laki'?'L':'P', usiaKehamilanLahir:'', bbl:'', pbl:'', ukaLahir:'', namaIbu:b.namaIbu||'', namaAyah:b.namaAyah||'', namaOrtu:b.namaIbu||b.namaOrtu||'', nikAyah:b.nikAyah||'', noTlp:b.noTelepon||'', alamat:b.alamat||'', rt:'', rw:'', tglUkur:tglL, bb:bbL, pb:tbL, tglUkurBaru:new Date().toISOString().split('T')[0], bbBaru:'', pbBaru:'', lila:'', lika:'', statusNTO:'', asiEksklusif:'', vitAFeb:'', bukuKIA:'', ketPerkembangan:'', pkat:'', catatan:'', _bbLalu:bbL, _tbLalu:tbL, _tglUkurLalu:tglL, _statusStunting:b.statusStunting||'' }]);
    showSuccess(`${b.nama} ditambahkan`);
  }

  // ── Tambah Manual ───────────────────────────────────────────
  function tambahAsiManual(f) { setAsiRows(p=>[...p,{ balitaId:null, namaBalita:f.namaBalita, tglLahir:f.tglLahir, umurBulan:f.umurBulan, e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false, namaOrtu:f.namaOrtu }]); showSuccess(`${f.namaBalita} (manual) ditambahkan`); }
  function tambahGiziManual(f) { setGiziRows(p=>[...p,{ balitaId:null, namaBalita:f.namaBalita, tglLahir:f.tglLahir, umurBulan:f.umurBulan, namaOrtu:f.namaOrtu, pekerjaan:f.pekerjaan||'', bb:f.bb||'', tb:f.tb||'' }]); showSuccess(`${f.namaBalita} (manual) ditambahkan`); }
  function tambahPemManual(f) { setPemRows(p=>[...p,{ balitaId:null, noKK:'', nik:f.nik||'', anakKe:'', namaAnak:f.namaBalita, tglLahir:f.tglLahir, lp:f.jenisKelamin||'', usiaKehamilanLahir:'', bbl:'', pbl:'', ukaLahir:'', namaIbu:f.namaOrtu||'', namaAyah:f.namaAyah||'', namaOrtu:f.namaOrtu||'', nikAyah:'', noTlp:f.noTlp||'', alamat:f.alamat||'', rt:'', rw:'', tglUkur:'', bb:f.bb||'', pb:f.tb||'', tglUkurBaru:new Date().toISOString().split('T')[0], bbBaru:'', pbBaru:'', lila:'', lika:'', statusNTO:'', asiEksklusif:'', vitAFeb:'', bukuKIA:'', ketPerkembangan:'', pkat:'', catatan:'', _bbLalu:'', _tbLalu:'', _tglUkurLalu:'', _statusStunting:'' }]); showSuccess(`${f.namaBalita} (manual) ditambahkan`); }

  const updA = (i,k,v) => setAsiRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r));
  const updG = (i,k,v) => setGiziRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r));
  const updP = (i,k,v) => setPemRows(p=>p.map((r,j)=>j===i?{...r,[k]:v}:r));

  // ── Export Excel ────────────────────────────────────────────
  async function exportExcel() {
    if (!isSaved) { showError('Simpan laporan terlebih dahulu!'); return; }
    try {
      if (!window.XLSX) await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
      const XLSX=window.XLSX, wb=XLSX.utils.book_new();
      // Helper auto-hitung D dan minus untuk Excel
      const dRow = COLS.map(c=>parseInt(hitungD(kegiatan,c))||'');
      const minusRow = COLS.map(c=>parseInt(hitungMinus(kegiatan,c))||'');
      const ws1=XLSX.utils.aoa_to_sheet([
        ['CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU'],
        [`Posyandu: ${info.namaPosyandu}  •  Bulan: ${info.bulan} ${info.tahun}`],
        [],['I. UMUM'],
        ['a. Posyandu',info.namaPosyandu],['b. Dusun',info.dusun],['c. Desa',info.desa],
        ['d. Petugas Lapangan',info.petugasLapangan],['e. Jumlah Kader Aktif',info.jumlahKader],
        [],
        ['II. KEGIATAN PENIMBANGAN','0-5 bln L','0-5 bln P','6-11 bln L','6-11 bln P','12-23 bln L','12-23 bln P','24-60 bln L','24-60 bln P'],
        ['01. (S) Semua balita',kegiatan.s_L_0_5,kegiatan.s_P_0_5,kegiatan.s_L_6_11,kegiatan.s_P_6_11,kegiatan.s_L_12_23,kegiatan.s_P_12_23,kegiatan.s_L_24_60,kegiatan.s_P_24_60],
        ['02. (K) Terdaftar KMS',kegiatan.k_L_0_5,kegiatan.k_P_0_5,kegiatan.k_L_6_11,kegiatan.k_P_6_11,kegiatan.k_L_12_23,kegiatan.k_P_12_23,kegiatan.k_L_24_60,kegiatan.k_P_24_60],
        ['03. (N) Naik berat badan',kegiatan.n_L_0_5,kegiatan.n_P_0_5,kegiatan.n_L_6_11,kegiatan.n_P_6_11,kegiatan.n_L_12_23,kegiatan.n_P_12_23,kegiatan.n_L_24_60,kegiatan.n_P_24_60],
        ['04. (T) Tidak naik BB',kegiatan.t_L_0_5,kegiatan.t_P_0_5,kegiatan.t_L_6_11,kegiatan.t_P_6_11,kegiatan.t_L_12_23,kegiatan.t_P_12_23,kegiatan.t_L_24_60,kegiatan.t_P_24_60],
        ['05. (O) Ditimbang, tdk bln lalu',kegiatan.o_L_0_5,kegiatan.o_P_0_5,kegiatan.o_L_6_11,kegiatan.o_P_6_11,kegiatan.o_L_12_23,kegiatan.o_P_12_23,kegiatan.o_L_24_60,kegiatan.o_P_24_60],
        ['06. (B) Pertama kali hadir',kegiatan.b_L_0_5,kegiatan.b_P_0_5,kegiatan.b_L_6_11,kegiatan.b_P_6_11,kegiatan.b_L_12_23,kegiatan.b_P_12_23,kegiatan.b_L_24_60,kegiatan.b_P_24_60],
        ['07. (D) Ditimbang (03+04+05+06)',...dRow],
        ['08. (-) Tidak hadir (02-07)',...minusRow],
        ['09. (A) Bawah Garis Merah (BGM)',kegiatan.bawahGarisMerah],
        ['10. (A) Vit A Bayi — Februari',kegiatan.vitA_bayi_feb,'Agustus',kegiatan.vitA_bayi_ags],
        ['11. (A) Vit A Balita — Februari',kegiatan.vitA_balita_feb,'Agustus',kegiatan.vitA_balita_ags],
        ['12. (E) Bayi ASI Eksklusif',kegiatan.aEksklusif],
        [],['V. KETERANGAN LAIN'],
        ['Ibu Hamil',kegiatan.jumlahHamil,'Persalinan',kegiatan.jumlahPersalinan],
        ['Tgl Pencatatan',info.tanggalPencatatan,'Ketua Kader',info.ketuaKader],
        [],['III. PEMANTAUAN ASI EKSKLUSIF'],
        ['No','Nama Balita','Tgl Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Ortu'],
        ...asiRows.map((r,i)=>[i+1,r.namaBalita,r.tglLahir,r.umurBulan,r.e0?'✓':'',r.e1?'✓':'',r.e2?'✓':'',r.e3?'✓':'',r.e4?'✓':'',r.e5?'✓':'',r.e6?'✓':'',r.namaOrtu]),
        [],['IV. PEMANTAUAN GIZI BURUK & KURUS'],
        ['No','Nama Balita','Tgl Lahir','Umur (bln)','Nama Ortu','Pekerjaan','BB (kg)','TB (cm)'],
        ...giziRows.map((r,i)=>[i+1,r.namaBalita,r.tglLahir,r.umurBulan,r.namaOrtu,r.pekerjaan,r.bb,r.tb]),
      ]);
      ws1['!cols']=[{wch:38},...Array(8).fill({wch:11})];
      XLSX.utils.book_append_sheet(wb,ws1,'Catatan Bulanan');
      const ws2=XLSX.utils.aoa_to_sheet([
        ['V. FORMULIR PEMANTAUAN PERTUMBUHAN BALITA DI POSYANDU'],
        [`Posyandu: ${info.namaPosyandu}  •  ${info.bulan} ${info.tahun}  •  Desa: ${info.desa}`],
        [],
        ['No','No KK','NIK','Anak Ke','Nama Anak','Tgl Lahir','L/P','Usia Kmln','BBL','PBL','UKA Lahir','Nama Ortu (Ayah/Ibu)','NIK Ayah','No Tlp','Alamat','RT','RW','Tgl Ukur Lalu','BB Lalu','TB Lalu','Tgl Ukur Baru','BB Baru','TB/PB Baru','LILA','LIKA','N/T/O/B','ASI\n(1=Ya,2=Tdk)','VitA Feb\n(1=Ya,2=Tdk)','Buku KIA\n(1=Pny,2=Tdk)','Perkembangan','PKAT','Ket'],
        ...pemRows.map((r,i)=>[
          i+1,r.noKK,r.nik,r.anakKe,r.namaAnak,r.tglLahir?fmtTgl(r.tglLahir):'',
          r.lp,r.usiaKehamilanLahir,r.bbl,r.pbl,r.ukaLahir,
          [r.namaIbu&&`Ibu: ${r.namaIbu}`,r.namaAyah&&`Ayah: ${r.namaAyah}`].filter(Boolean).join(' / '),
          r.nikAyah,r.noTlp,r.alamat,r.rt,r.rw,
          fmtTgl(r._tglUkurLalu||r.tglUkur),r._bbLalu||r.bb,r._tbLalu||r.pb,
          r.tglUkurBaru,r.bbBaru||r.bb,r.pbBaru||r.pb,
          r.lila,r.lika,r.statusNTO,r.asiEksklusif,r.vitAFeb,r.bukuKIA,r.ketPerkembangan,r.pkat,r.catatan,
        ]),
      ]);
      ws2['!cols']=Array(32).fill({wch:11}); ws2['!cols'][4]={wch:22}; ws2['!cols'][11]={wch:24}; ws2['!cols'][14]={wch:20};
      XLSX.utils.book_append_sheet(wb,ws2,'Pemantauan Pertumbuhan');
      XLSX.writeFile(wb,`Laporan_${info.namaPosyandu||'Posyandu'}_${info.bulan}_${info.tahun}.xlsx`);
      showSuccess('File Excel berhasil diunduh!');
    } catch(err){ console.error(err); showError('Gagal export Excel'); }
  }

  // ── Styles ──────────────────────────────────────────────────
  const thG = { padding:'7px 6px', background:'#F0FDF4', fontSize:10, fontWeight:700, color:'#15803D', borderBottom:'2px solid #BBF7D0', whiteSpace:'nowrap', textAlign:'center' };
  const thO = { padding:'7px 6px', background:'#FFF7ED', fontSize:10, fontWeight:700, color:'#D97706', borderBottom:'2px solid #FDE68A', whiteSpace:'nowrap', textAlign:'center' };
  const td  = { padding:'4px 5px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle', textAlign:'center' };
  const tdL = { padding:'4px 8px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle', textAlign:'left' };
  const numIn = { padding:'4px 3px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:11, fontFamily:'inherit', outline:'none', width:46, textAlign:'center', background:'#fff', display:'block' };
  const txtIn = { padding:'5px 7px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:11, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', background:'#fff' };
  const selSt = { padding:'4px 5px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:11, fontFamily:'inherit', outline:'none', background:'#fff' };
  const delBtn= { background:'#FEF2F2', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#DC2626', fontSize:12 };

  // Baris auto-hitung — warna beda (biru muda)
  const thAuto = { ...thG, background:'#EFF6FF', color:'#1D4ED8', borderBottom:'2px solid #BFDBFE' };
  const tdAuto = { ...td, background:'#EFF6FF', fontWeight:700, color:'#1D4ED8', fontSize:11 };

  // ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:24, fontFamily:'inherit' }}>
      <Toast toast={toast}/>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>📋 Catatan Bulanan Posyandu</h2>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>Input data kegiatan penimbangan bulanan</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Button variant="ghost" onClick={()=>window.print()}>🖨️ Cetak</Button>
          <Button onClick={handleSimpan} disabled={saving}>{saving?'⏳ Menyimpan...':'💾 Simpan'}</Button>
          <div style={{ position:'relative' }}>
            <button onClick={exportExcel} style={{ padding:'9px 16px', background:isSaved?'#1B6B3A':'#9CA3AF', color:'#fff', border:'none', borderRadius:8, cursor:isSaved?'pointer':'not-allowed', fontFamily:'inherit', fontWeight:700, fontSize:13 }}>📊 Export Excel</button>
            {!isSaved && <div style={{ position:'absolute', right:0, top:'110%', background:'#1F2937', color:'#fff', padding:'6px 10px', borderRadius:8, fontSize:11, whiteSpace:'nowrap', zIndex:100, pointerEvents:'none' }}>Simpan dulu baru bisa export</div>}
          </div>
        </div>
      </div>

      {/* Filter tanggal */}
      <div style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ fontSize:20 }}>🔍</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#1D4ED8', marginBottom:2 }}>Muat Data Laporan Sebelumnya</div>
          <div style={{ fontSize:11, color:'#60A5FA' }}>Pilih tanggal pencatatan → data laporan otomatis dimuat dari database</div>
        </div>
        <input type="date" value={filterTanggal} onChange={e=>setFilterTanggal(e.target.value)} style={{ padding:'9px 14px', borderRadius:8, border:'1.5px solid #93C5FD', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}/>
        <Button onClick={handleFilterTanggal} disabled={loadingFilter}>{loadingFilter?'⏳ Memuat...':'📂 Muat Data'}</Button>
      </div>

      {/* I. Info Umum */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader title="I. Informasi Umum Posyandu"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 20px' }}>
          <Field label="Nama Posyandu *" value={info.namaPosyandu} onChange={v=>setInfo(p=>({...p,namaPosyandu:v}))}/>
          <Field label="Dusun" value={info.dusun} onChange={v=>setInfo(p=>({...p,dusun:v}))}/>
          <Field label="Desa" value={info.desa} onChange={v=>setInfo(p=>({...p,desa:v}))}/>
          <Field label="Petugas Lapangan yang Membina" value={info.petugasLapangan} onChange={v=>setInfo(p=>({...p,petugasLapangan:v}))}/>
          <Field label="Jumlah Kader Aktif" type="number" min="0" value={info.jumlahKader} onChange={v=>setInfo(p=>({...p,jumlahKader:v}))}/>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Bulan</label>
              <select value={info.bulan} onChange={e=>setInfo(p=>({...p,bulan:e.target.value}))} style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                {BULAN_LIST.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ width:90, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Tahun</label>
              <input type="number" value={info.tahun} onChange={e=>setInfo(p=>({...p,tahun:e.target.value}))} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' }}/>
            </div>
          </div>
          <Field label="Tanggal Pelaksanaan" type="date" value={info.tanggalPelaksanaan} onChange={v=>setInfo(p=>({...p,tanggalPelaksanaan:v}))}/>
          <Field label="Tanggal Pencatatan *" type="date" value={info.tanggalPencatatan} onChange={v=>setInfo(p=>({...p,tanggalPencatatan:v}))}/>
          <Field label="Ketua Kader Posyandu" value={info.ketuaKader} onChange={v=>setInfo(p=>({...p,ketuaKader:v}))}/>
        </div>
      </Card>

      {/* ── II. Kegiatan Penimbangan — 12 BARIS LENGKAP ─────────── */}
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
                <span style={{ fontWeight:800, fontSize:15, color:v.w }}>{k} — </span>
                <span style={{ fontWeight:700, fontSize:12, color:v.w }}>{v.label}</span>
                <div style={{ fontSize:11, color:'#6B7280', marginTop:4, lineHeight:1.4 }}>{v.desc}</div>
              </div>
            ))}
            <div style={{ padding:'10px 14px', background:'#EFF6FF', borderRadius:10 }}>
              <span style={{ fontWeight:800, fontSize:15, color:'#1D4ED8' }}>D — </span>
              <span style={{ fontWeight:700, fontSize:12, color:'#1D4ED8' }}>Ditimbang (03+04+05+06)</span>
              <div style={{ fontSize:11, color:'#6B7280', marginTop:4 }}>Dihitung otomatis dari N+T+O+B.</div>
            </div>
            <div style={{ padding:'10px 14px', background:'#EFF6FF', borderRadius:10 }}>
              <span style={{ fontWeight:800, fontSize:15, color:'#1D4ED8' }}>(-) — </span>
              <span style={{ fontWeight:700, fontSize:12, color:'#1D4ED8' }}>Tidak hadir (02-07)</span>
              <div style={{ fontSize:11, color:'#6B7280', marginTop:4 }}>Dihitung otomatis dari K minus D.</div>
            </div>
          </div>
        )}

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr>
                <th style={{ ...thG, textAlign:'left', width:36, background:'#F9FAFB', color:'#9E9E9E' }}>No</th>
                <th style={{ ...thG, textAlign:'left', width:220, background:'#F9FAFB', color:'#6B7280' }}>Kegiatan</th>
                <th style={{ ...thG, textAlign:'center', width:36, background:'#F9FAFB', color:'#9E9E9E' }}>Kode</th>
                {['0-5 L','0-5 P','6-11 L','6-11 P','12-23 L','12-23 P','24-60 L','24-60 P'].map(h=>(
                  <th key={h} style={{ ...thG, width:60 }}>{h} bln</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Baris 01-06: Input manual */}
              {[
                ['01','Jumlah semua balita di kelompok penimbangan bulan ini','S','#1565C0',['s_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60']],
                ['02','Terdaftar dan punya KMS bulan ini','K','#16A34A',['k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60']],
                ['03','Naik berat badannya bulan ini','N','#16A34A',['n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60']],
                ['04','Tidak naik berat badannya bulan ini','T','#DC2626',['t_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60']],
                ['05','Ditimbang bulan ini, tetapi tidak ditimbang bulan lalu','O','#D97706',['o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60']],
                ['06','Pertama kali hadir di penimbangan bulan ini','B','#9333EA',['b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60']],
              ].map(([no, label, kode, color, fields]) => (
                <tr key={no}>
                  <td style={{ ...td, color:'#9E9E9E', fontSize:11 }}>{no}</td>
                  <td style={{ ...tdL, color:'#374151', fontSize:12 }}>{label}</td>
                  <td style={{ ...td }}>
                    <span style={{ fontWeight:800, fontSize:13, color, background:`${color}18`, padding:'2px 7px', borderRadius:6 }}>{kode}</span>
                  </td>
                  {fields.map(f=>(
                    <td key={f} style={td}>
                      <input type="number" value={kegiatan[f]||''} min="0"
                        onChange={e=>setKegiatan(p=>({...p,[f]:e.target.value}))} style={numIn}/>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Baris 07: D — Auto-hitung */}
              <tr>
                <td style={{ ...td, color:'#9E9E9E', fontSize:11 }}>07</td>
                <td style={{ ...tdL, fontSize:12 }}>
                  <span style={{ color:'#1D4ED8', fontWeight:600 }}>Ditimbang bulan ini (03+04+05+06)</span>
                  <span style={{ fontSize:10, color:'#9E9E9E', marginLeft:6 }}>⚡ otomatis</span>
                </td>
                <td style={{ ...td }}><span style={{ fontWeight:800, fontSize:13, color:'#1D4ED8', background:'#EFF6FF', padding:'2px 7px', borderRadius:6 }}>D</span></td>
                {COLS.map(c=>(
                  <td key={c} style={tdAuto}>{hitungD(kegiatan,c) || '—'}</td>
                ))}
              </tr>

              {/* Baris 08: Minus — Auto-hitung */}
              <tr>
                <td style={{ ...td, color:'#9E9E9E', fontSize:11 }}>08</td>
                <td style={{ ...tdL, fontSize:12 }}>
                  <span style={{ color:'#1D4ED8', fontWeight:600 }}>Tidak hadir di penimbangan bulan ini (02-07)</span>
                  <span style={{ fontSize:10, color:'#9E9E9E', marginLeft:6 }}>⚡ otomatis</span>
                </td>
                <td style={{ ...td }}><span style={{ fontWeight:800, fontSize:13, color:'#1D4ED8', background:'#EFF6FF', padding:'2px 7px', borderRadius:6 }}>(-)</span></td>
                {COLS.map(c=>(
                  <td key={c} style={tdAuto}>{hitungMinus(kegiatan,c) || '—'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Baris 09-12: Input single value */}
        <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid #F0F0F0' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'0 20px' }}>

            {/* 09 BGM */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>
                <span style={{ color:'#9E9E9E', marginRight:6 }}>09 (A)</span>
                Jumlah balita di bawah garis merah (BGM)
              </label>
              <input type="number" min="0" value={kegiatan.bawahGarisMerah||''} onChange={e=>setKegiatan(p=>({...p,bawahGarisMerah:e.target.value}))}
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', background:'#fff' }}/>
            </div>

            {/* 12 ASI Eksklusif */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>
                <span style={{ color:'#9E9E9E', marginRight:6 }}>12 (E)</span>
                Jumlah bayi dengan ASI Eksklusif pada bulan ini
              </label>
              <input type="number" min="0" value={kegiatan.aEksklusif||''} onChange={e=>setKegiatan(p=>({...p,aEksklusif:e.target.value}))}
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', background:'#fff' }}/>
            </div>
          </div>

          {/* 10 Vitamin A Bayi */}
          <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'12px 16px', marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#15803D', marginBottom:10 }}>
              <span style={{ color:'#9E9E9E', marginRight:6 }}>10 (A)</span>
              Jumlah bayi mendapat Vitamin A bulan Februari/Agustus
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
              <Field label="Februari" type="number" min="0" value={kegiatan.vitA_bayi_feb} onChange={v=>setKegiatan(p=>({...p,vitA_bayi_feb:v}))}/>
              <Field label="Agustus"  type="number" min="0" value={kegiatan.vitA_bayi_ags} onChange={v=>setKegiatan(p=>({...p,vitA_bayi_ags:v}))}/>
            </div>
          </div>

          {/* 11 Vitamin A Balita */}
          <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'12px 16px', marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#15803D', marginBottom:10 }}>
              <span style={{ color:'#9E9E9E', marginRight:6 }}>11 (A)</span>
              Jumlah balita mendapat Vitamin A bulan Februari/Agustus
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
              <Field label="Februari" type="number" min="0" value={kegiatan.vitA_balita_feb} onChange={v=>setKegiatan(p=>({...p,vitA_balita_feb:v}))}/>
              <Field label="Agustus"  type="number" min="0" value={kegiatan.vitA_balita_ags} onChange={v=>setKegiatan(p=>({...p,vitA_balita_ags:v}))}/>
            </div>
          </div>

          {/* V. Keterangan Lain */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
            <Field label="V. Jumlah ibu hamil yang ada" type="number" min="0" value={kegiatan.jumlahHamil} onChange={v=>setKegiatan(p=>({...p,jumlahHamil:v}))}/>
            <Field label="V. Jumlah persalinan bulan ini" type="number" min="0" value={kegiatan.jumlahPersalinan} onChange={v=>setKegiatan(p=>({...p,jumlahPersalinan:v}))}/>
          </div>
        </div>
      </Card>

      {/* III. ASI Eksklusif */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>III. Pemantauan ASI Eksklusif</h3>
            <p style={{ margin:'3px 0 0', fontSize:11, color:'#9E9E9E' }}>🔗 Hijau = ter-link database • Putih = manual</p>
          </div>
          <TambahButtons onDB={()=>setModalDB('asi')} onManual={()=>setModalManual('asi')}/>
        </div>
        {asiRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px', color:'#9E9E9E' }}><div style={{ fontSize:36 }}>🍼</div><div style={{ fontWeight:600, marginTop:6 }}>Belum ada data ASI</div></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:11, width:'100%' }}>
              <thead>
                <tr>
                  <th style={{ ...thG, width:36 }}>No</th>
                  <th style={{ ...thG, textAlign:'left', paddingLeft:8 }}>Nama Balita</th>
                  <th style={{ ...thG }}>Tgl Lahir</th>
                  <th style={{ ...thG }}>Umur</th>
                  {['E0','E1','E2','E3','E4','E5','E6'].map(e=><th key={e} style={{ ...thG, width:36 }}>{e}</th>)}
                  <th style={{ ...thG, textAlign:'left', paddingLeft:8 }}>Nama Ortu</th>
                  <th style={{ ...thG, width:36 }}></th>
                </tr>
              </thead>
              <tbody>
                {asiRows.map((r,i)=>(
                  <tr key={i} style={{ background:r.balitaId?(i%2===0?'#F0FDF4':'#E8F8EF'):(i%2===0?'#fff':'#FAFAFA') }}>
                    <td style={td}><div style={{ fontWeight:700 }}>{i+1}</div>{r.balitaId&&<div style={{ fontSize:8, color:'#16A34A' }}>🔗</div>}</td>
                    <td style={{ ...tdL, fontWeight:600 }}>{r.namaBalita}</td>
                    <td style={{ ...td, fontSize:10, color:'#6B7280' }}>{fmtTgl(r.tglLahir)}</td>
                    <td style={td}><span style={{ fontWeight:700, color:'#1B6B3A', background:'#F0FDF4', padding:'2px 8px', borderRadius:10 }}>{r.umurBulan} bln</span></td>
                    {['e0','e1','e2','e3','e4','e5','e6'].map(e=>(
                      <td key={e} style={td}><input type="checkbox" checked={r[e]||false} onChange={ev=>updA(i,e,ev.target.checked)}/></td>
                    ))}
                    <td style={{ ...tdL, fontSize:10 }}>{r.namaOrtu}</td>
                    <td style={td}><button onClick={()=>setAsiRows(p=>p.filter((_,j)=>j!==i))} style={delBtn}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* IV. Gizi Buruk */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>IV. Pemantauan Balita Gizi Buruk & Kurus</h3>
            <p style={{ margin:'3px 0 0', fontSize:11, color:'#9E9E9E' }}>BB & TB otomatis dari data ukur terakhir jika dari DB</p>
          </div>
          <TambahButtons onDB={()=>setModalDB('gizi')} onManual={()=>setModalManual('gizi')} colorDB="#D97706" colorManual="#9333EA"/>
        </div>
        {giziRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px', color:'#9E9E9E' }}><div style={{ fontSize:36 }}>⚖️</div><div style={{ fontWeight:600, marginTop:6 }}>Belum ada data gizi buruk</div></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:11, width:'100%' }}>
              <thead>
                <tr>
                  <th style={{ ...thO, width:36 }}>No</th>
                  <th style={{ ...thO, textAlign:'left', paddingLeft:8 }}>Nama Balita</th>
                  <th style={{ ...thO }}>Tgl Lahir</th>
                  <th style={{ ...thO }}>Umur</th>
                  <th style={{ ...thO, textAlign:'left', paddingLeft:8 }}>Nama Ortu</th>
                  <th style={{ ...thO }}>Pekerjaan</th>
                  <th style={{ ...thO }}>BB (kg)</th>
                  <th style={{ ...thO }}>TB (cm)</th>
                  <th style={{ ...thO, width:36 }}></th>
                </tr>
              </thead>
              <tbody>
                {giziRows.map((r,i)=>(
                  <tr key={i} style={{ background:i%2===0?'#FFF7ED':'#FFFBEB' }}>
                    <td style={td}><div style={{ fontWeight:700 }}>{i+1}</div>{r.balitaId&&<div style={{ fontSize:8, color:'#D97706' }}>🔗</div>}</td>
                    <td style={{ ...tdL, fontWeight:600 }}>{r.namaBalita}</td>
                    <td style={{ ...td, fontSize:10, color:'#6B7280' }}>{fmtTgl(r.tglLahir)}</td>
                    <td style={td}><span style={{ fontWeight:700, color:'#D97706', background:'#FFF7ED', padding:'2px 8px', borderRadius:10 }}>{r.umurBulan} bln</span></td>
                    <td style={{ ...tdL, fontSize:10 }}>{r.namaOrtu}</td>
                    <td style={td}><input value={r.pekerjaan||''} onChange={e=>updG(i,'pekerjaan',e.target.value)} style={{ ...txtIn, width:100 }} placeholder="Pekerjaan..."/></td>
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

      {/* V. Pemantauan Pertumbuhan */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>V. Formulir Pemantauan Pertumbuhan Balita</h3>
            <p style={{ margin:'3px 0 0', fontSize:11, color:'#9E9E9E' }}>🟦 Biru = data bulan lalu (read-only) &nbsp;•&nbsp; 🟡 Kuning = input bulan ini</p>
          </div>
          <TambahButtons onDB={()=>setModalDB('pem')} onManual={()=>setModalManual('pemantauan')}/>
        </div>
        {pemRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#9E9E9E' }}><div style={{ fontSize:48 }}>👶</div><div style={{ fontSize:14, fontWeight:600, marginTop:8 }}>Belum ada balita</div><div style={{ fontSize:12, marginTop:4 }}>Gunakan tombol di kanan atas</div></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:10, minWidth:1800 }}>
              <thead>
                <tr>
                  {[{l:'No',w:36},{l:'No KK',w:90},{l:'NIK',w:100},{l:'Anak Ke',w:46},{l:'Nama Anak',w:130},{l:'Tgl Lahir',w:90},{l:'L/P',w:34},{l:'Usia Kmln\n(minggu)',w:60},{l:'BBL\n(kg)',w:46},{l:'PBL\n(cm)',w:46},{l:'UKA\nLahir',w:46},{l:'Nama Ortu\n(Ayah/Ibu)',w:160},{l:'NIK\nAyah',w:90},{l:'No Tlp',w:88},{l:'Alamat',w:110},{l:'RT',w:30},{l:'RW',w:30}].map((h,i)=>(
                    <th key={i} style={{ ...thG, width:h.w, minWidth:h.w, whiteSpace:'pre-line' }}>{h.l}</th>
                  ))}
                  {[{l:'Tgl Ukur\nLalu',w:88},{l:'BB\nLalu',w:52},{l:'TB\nLalu',w:52}].map((h,i)=>(
                    <th key={'l'+i} style={{ ...thG, width:h.w, background:'#EFF6FF', color:'#1D4ED8', borderBottom:'2px solid #BFDBFE', whiteSpace:'pre-line' }}>{h.l}</th>
                  ))}
                  {[{l:'Tgl Ukur\nBaru *',w:108},{l:'BB\nBaru *',w:54},{l:'TB/PB\nBaru *',w:60}].map((h,i)=>(
                    <th key={'b'+i} style={{ ...thG, width:h.w, background:'#FFFDE7', color:'#B45309', borderBottom:'2px solid #FDE68A', whiteSpace:'pre-line' }}>{h.l}</th>
                  ))}
                  {[{l:'LILA',w:54},{l:'LIKA',w:54},{l:'N/T/\nO/B',w:50},{l:'ASI\nEksklsf',w:52},{l:'VitA\nFeb',w:52},{l:'Buku\nKIA',w:52},{l:'Perkem-\nbangan',w:100},{l:'PKAT',w:50},{l:'',w:34}].map((h,i)=>(
                    <th key={'d'+i} style={{ ...thG, width:h.w, minWidth:h.w, whiteSpace:'pre-line' }}>{h.l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pemRows.map((r,i)=>(
                  <tr key={r.balitaId||i} style={{ background:r.balitaId?(i%2===0?'#F0FDF4':'#E8F8EF'):(i%2===0?'#fff':'#FAFAFA') }}>
                    <td style={td}><div style={{ fontWeight:700 }}>{i+1}</div>{r.balitaId&&<div style={{ fontSize:8, color:'#16A34A' }}>🔗</div>}</td>
                    <td style={td}><input value={r.noKK||''} onChange={e=>updP(i,'noKK',e.target.value)} style={{ ...txtIn, width:80 }}/></td>
                    <td style={td}><input value={r.nik||''} onChange={e=>updP(i,'nik',e.target.value)} style={{ ...txtIn, width:90 }}/></td>
                    <td style={td}><input type="number" value={r.anakKe||''} onChange={e=>updP(i,'anakKe',e.target.value)} style={{ ...numIn, width:34 }}/></td>
                    <td style={{ ...tdL, fontWeight:700, whiteSpace:'nowrap' }}>{r.namaAnak}</td>
                    <td style={{ ...td, fontSize:9, color:'#6B7280' }}>{fmtTgl(r.tglLahir)}</td>
                    <td style={{ ...td, fontWeight:700, color:r.lp==='L'?'#2563EB':'#DB2777' }}>{r.lp}</td>
                    <td style={td}><input type="number" value={r.usiaKehamilanLahir||''} onChange={e=>updP(i,'usiaKehamilanLahir',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.01" value={r.bbl||''} onChange={e=>updP(i,'bbl',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.pbl||''} onChange={e=>updP(i,'pbl',e.target.value)} style={numIn}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.ukaLahir||''} onChange={e=>updP(i,'ukaLahir',e.target.value)} style={numIn}/></td>
                    <td style={{ ...tdL, fontSize:9, minWidth:140 }}>
                      {r.namaIbu&&<div><span style={{ color:'#9E9E9E' }}>Ibu:</span> {r.namaIbu}</div>}
                      {r.namaAyah&&<div><span style={{ color:'#9E9E9E' }}>Ayah:</span> {r.namaAyah}</div>}
                      {!r.namaIbu&&!r.namaAyah&&(r.namaOrtu||'-')}
                    </td>
                    <td style={td}><input value={r.nikAyah||''} onChange={e=>updP(i,'nikAyah',e.target.value)} style={{ ...txtIn, width:80 }}/></td>
                    <td style={td}><input value={r.noTlp||''} onChange={e=>updP(i,'noTlp',e.target.value)} style={{ ...txtIn, width:80 }}/></td>
                    <td style={td}><input value={r.alamat||''} onChange={e=>updP(i,'alamat',e.target.value)} style={{ ...txtIn, width:100 }}/></td>
                    <td style={td}><input value={r.rt||''} onChange={e=>updP(i,'rt',e.target.value)} style={{ ...numIn, width:26 }}/></td>
                    <td style={td}><input value={r.rw||''} onChange={e=>updP(i,'rw',e.target.value)} style={{ ...numIn, width:26 }}/></td>
                    {/* Bulan lalu — read only */}
                    <td style={{ ...td, background:'#EFF6FF', fontSize:9, color:'#6B7280' }}>{fmtTgl(r._tglUkurLalu||r.tglUkur)}</td>
                    <td style={{ ...tdAuto, width:52 }}>{r._bbLalu||r.bb||'—'}</td>
                    <td style={{ ...tdAuto, width:52 }}>{r._tbLalu||r.pb||'—'}</td>
                    {/* Input bulan ini */}
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="date" value={r.tglUkurBaru||''} onChange={e=>updP(i,'tglUkurBaru',e.target.value)} style={{ ...txtIn, width:105, borderColor:'#D97706' }}/></td>
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="number" step="0.01" value={r.bbBaru||''} onChange={e=>updP(i,'bbBaru',e.target.value)} placeholder="kg" style={{ ...numIn, borderColor:'#D97706', width:50 }}/></td>
                    <td style={{ ...td, background:'#FFFDE7' }}><input type="number" step="0.1" value={r.pbBaru||''} onChange={e=>updP(i,'pbBaru',e.target.value)} placeholder="cm" style={{ ...numIn, borderColor:'#D97706', width:56 }}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.lila||''} onChange={e=>updP(i,'lila',e.target.value)} placeholder="cm" style={{ ...numIn, width:50 }}/></td>
                    <td style={td}><input type="number" step="0.1" value={r.lika||''} onChange={e=>updP(i,'lika',e.target.value)} placeholder="cm" style={{ ...numIn, width:50 }}/></td>
                    <td style={td}><select value={r.statusNTO||''} onChange={e=>updP(i,'statusNTO',e.target.value)} style={selSt}><option value="">-</option><option value="N">N</option><option value="T">T</option><option value="O">O</option><option value="B">B</option></select></td>
                    <td style={td}><select value={r.asiEksklusif||''} onChange={e=>updP(i,'asiEksklusif',e.target.value)} style={selSt}><option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option></select></td>
                    <td style={td}><select value={r.vitAFeb||''} onChange={e=>updP(i,'vitAFeb',e.target.value)} style={selSt}><option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option></select></td>
                    <td style={td}><select value={r.bukuKIA||''} onChange={e=>updP(i,'bukuKIA',e.target.value)} style={selSt}><option value="">-</option><option value="1">Punya</option><option value="2">Tidak</option></select></td>
                    <td style={td}>
                      <select value={r.ketPerkembangan||''} onChange={e=>updP(i,'ketPerkembangan',e.target.value)} style={{ ...selSt, width:95, display:'block', marginBottom:3 }}><option value="">- Perkembangan</option><option value="Sesuai">Sesuai</option><option value="Meragukan">Meragukan</option><option value="Penyimpangan">Penyimpangan</option></select>
                      <select value={r.pkat||''} onChange={e=>updP(i,'pkat',e.target.value)} style={{ ...selSt, width:95, display:'block' }}><option value="">- PKAT</option><option value="Ya">Ya</option><option value="Belum">Belum</option></select>
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

      {/* Modals */}
      {modalDB==='asi'  && <ModalPilihBalita title="Tambah ke ASI Eksklusif"         subtitle="Semua usia — dari database" balitaList={balitaList} sudahDipilih={asiRows}  onSelect={b=>{tambahAsiDB(b);  setModalDB(null);}} onClose={()=>setModalDB(null)}/>}
      {modalDB==='gizi' && <ModalPilihBalita title="Tambah ke Gizi Buruk & Kurus"    subtitle="Semua usia — dari database" balitaList={balitaList} sudahDipilih={giziRows} onSelect={b=>{tambahGiziDB(b); setModalDB(null);}} onClose={()=>setModalDB(null)}/>}
      {modalDB==='pem'  && <ModalPilihBalita title="Tambah ke Pemantauan Pertumbuhan" subtitle="Semua usia — dari database" balitaList={balitaList} sudahDipilih={pemRows}  onSelect={b=>{tambahPemDB(b);  setModalDB(null);}} onClose={()=>setModalDB(null)}/>}
      {modalManual==='asi'        && <ModalManual mode="asi"        onSave={tambahAsiManual}  onClose={()=>setModalManual(null)}/>}
      {modalManual==='gizi'       && <ModalManual mode="gizi"       onSave={tambahGiziManual} onClose={()=>setModalManual(null)}/>}
      {modalManual==='pemantauan' && <ModalManual mode="pemantauan" onSave={tambahPemManual}  onClose={()=>setModalManual(null)}/>}
    </div>
  );
}