// ============================================================
//  LaporanPage — Catatan Bulanan Posyandu
//  - Input manual data kegiatan penimbangan
//  - Dropdown nama orang tua → auto-fill data anak
//  - Export Excel sesuai format formulir resmi
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Card, SectionHeader, Button, StatusBadge } from '../components/ui/Components';
import { formatTanggal, hitungUmurBulan, getStatusStunting, getStatusGizi } from '../utils/helpers';

// ── Toast ──────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:'fixed', top:24, left:'50%', transform:'translateX(-50%)',
      zIndex:99999, padding:'14px 24px', borderRadius:14,
      background: toast.type==='success'?'#16A34A':'#DC2626', color:'#fff',
      fontWeight:700, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
      display:'flex', alignItems:'center', gap:10, fontFamily:'inherit',
    }}>
      {toast.type==='success' ? '✅' : '❌'} {toast.message}
    </div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, msg) { setToast({type, message:msg}); setTimeout(()=>setToast(null), 3500); }
  return { toast, showSuccess: m=>show('success',m), showError: m=>show('error',m) };
}

// ── Field input kecil ──────────────────────────────────────────
function Field({ label, value, onChange, type='text', placeholder, width='100%', disabled }) {
  return (
    <div style={{ marginBottom:10, width }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>{label}</label>}
      <input
        type={type} value={value || ''} onChange={e=>onChange?.(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          width:'100%', padding:'8px 12px', borderRadius:8,
          border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit',
          outline:'none', boxSizing:'border-box',
          background: disabled ? '#F9FAFB' : '#fff',
          color: disabled ? '#9E9E9E' : '#1A1A1A',
        }}
        onFocus={e=>{ if(!disabled) e.target.style.borderColor='#1B6B3A'; }}
        onBlur={e=>e.target.style.borderColor='#E5E7EB'}
      />
    </div>
  );
}

// ── BULAN & TAHUN helper ───────────────────────────────────────
const BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function LaporanPage({ balitaList = [], statistik = {} }) {
  const { toast, showSuccess, showError } = useToast();

  // ── Info umum posyandu ────────────────────────────────────────
  const [info, setInfo] = useState({
    namaPosyandu: '', dusun: '', desa: '', petugasLapangan: '',
    jumlahKader: '', bulan: BULAN_LIST[new Date().getMonth()],
    tahun: String(new Date().getFullYear()),
    tanggalPelaksanaan: '', tanggalPencatatan: '',
    ketuaKader: '',
  });

  // ── Data kegiatan penimbangan (Section II) ────────────────────
  const defaultKeg = {
    s_L_0_5:'', s_P_0_5:'', s_L_6_11:'', s_P_6_11:'', s_L_12_23:'', s_P_12_23:'', s_L_24_60:'', s_P_24_60:'',
    k_L_0_5:'', k_P_0_5:'', k_L_6_11:'', k_P_6_11:'', k_L_12_23:'', k_P_12_23:'', k_L_24_60:'', k_P_24_60:'',
    n_L_0_5:'', n_P_0_5:'', n_L_6_11:'', n_P_6_11:'', n_L_12_23:'', n_P_12_23:'', n_L_24_60:'', n_P_24_60:'',
    t_L_0_5:'', t_P_0_5:'', t_L_6_11:'', t_P_6_11:'', t_L_12_23:'', t_P_12_23:'', t_L_24_60:'', t_P_24_60:'',
    o_L_0_5:'', o_P_0_5:'', o_L_6_11:'', o_P_6_11:'', o_L_12_23:'', o_P_12_23:'', o_L_24_60:'', o_P_24_60:'',
    b_L_0_5:'', b_P_0_5:'', b_L_6_11:'', b_P_6_11:'', b_L_12_23:'', b_P_12_23:'', b_L_24_60:'', b_P_24_60:'',
    vitA_bayi_feb:'', vitA_bayi_ags:'', vitA_balita_feb:'', vitA_balita_ags:'',
    bawahGarisMerah:'', jumlahHamil:'', jumlahPersalinan:'',
  };
  const [kegiatan, setKegiatan] = useState(defaultKeg);

  // ── Data pemantauan ASI eksklusif (Section III) ──────────────
  const [asiRows, setAsiRows] = useState([
    { namaBalita:'', tglLahir:'', umur:'', e0:false, e1:false, e2:false, e3:false, e4:false, e5:false, e6:false, namaOrtu:'' },
  ]);

  // ── Data pemantauan pertumbuhan balita — dari dropdown ────────
  const [pemantauanRows, setPemantauanRows] = useState([]);
  const [showAddBalita, setShowAddBalita]    = useState(false);
  const [searchOrtu, setSearchOrtu]          = useState('');
  const [selectedOrtu, setSelectedOrtu]      = useState(null);

  // ── Cari orang tua berdasarkan nama ──────────────────────────
  const ortuOptions = balitaList
    .filter(b => b.namaIbu && b.namaIbu.toLowerCase().includes(searchOrtu.toLowerCase()))
    .reduce((acc, b) => {
      if (!acc.find(x => x.namaIbu === b.namaIbu)) acc.push(b);
      return acc;
    }, []);

  // ── Ambil semua anak dari orang tua yang dipilih ─────────────
  const anakDariOrtu = selectedOrtu
    ? balitaList.filter(b => b.namaIbu === selectedOrtu)
    : [];

  function tambahBalitaKeLaporan(balita) {
    const umur = hitungUmurBulan(balita.tanggalLahir);
    const last  = balita.riwayat?.[balita.riwayat.length - 1];
    setPemantauanRows(prev => {
      if (prev.find(r => r.id === balita.id)) return prev; // skip duplikat
      return [...prev, {
        id:          balita.id,
        noKK:        '',
        nik:         balita.nik || '',
        anakKe:      '',
        namaAnak:    balita.nama,
        tglLahir:    balita.tanggalLahir,
        lp:          balita.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
        usiaKehamilanLahir: '',
        bbl:         '',
        pbl:         '',
        ukaLahir:    '',
        namaOrtu:    balita.namaIbu || '',
        nikAyah:     '',
        noTlp:       balita.noTelepon || '',
        alamat:      balita.alamat || '',
        rt:          '', rw:  '',
        tglUkur:     last ? (last.tanggal || last.tglUkur || '') : '',
        bb:          last ? (last.bb || last.beratBadan || '') : '',
        pb:          last ? (last.tb || last.tinggiBadan || '') : '',
        lila:        '',
        statusGizi:  last ? getStatusGizi(last.bb||last.beratBadan, umur, balita.jenisKelamin) : '',
        ketNT:       '',
        vitAFeb:     '', vitAAgs:  '',
        bukuKIA:     '', pmt:      '',
        catatan:     '',
        // data baru yang akan diisi user
        bbBaru: '', pbBaru: '', tglUkurBaru: new Date().toISOString().split('T')[0],
      }];
    });
    setShowAddBalita(false);
    setSearchOrtu('');
    setSelectedOrtu(null);
    showSuccess(`${balita.nama} ditambahkan ke laporan`);
  }

  function updateRow(idx, field, value) {
    setPemantauanRows(prev => prev.map((r,i) => i===idx ? {...r, [field]: value} : r));
  }

  function hapusRow(idx) {
    setPemantauanRows(prev => prev.filter((_,i) => i !== idx));
  }

  // ── Export Excel menggunakan SheetJS ─────────────────────────
  async function exportExcel() {
    try {
      // Load SheetJS dari CDN
      if (!window.XLSX) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const XLSX = window.XLSX;
      const wb   = XLSX.utils.book_new();

      // ── Sheet 1: Catatan Bulanan (formulir pertama) ──────────
      const sheet1Data = [
        [`CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU`],
        [`Penimbangan bulan ini dilakukan tanggal: ${info.tanggalPelaksanaan}`],
        [],
        ['I. UMUM'],
        ['a. Posyandu', info.namaPosyandu],
        ['b. Dusun', info.dusun],
        ['c. Desa', info.desa],
        ['d. Petugas Lapangan yang membina', info.petugasLapangan],
        ['e. Jumlah Kader Aktif Bulan Ini', info.jumlahKader],
        [],
        ['II. KEGIATAN PENIMBANGAN', '0-5 bln','','6-11 bln','','12-23 bln','','24-60 bln',''],
        ['', 'L','P','L','P','L','P','L','P'],
        ['01. Jumlah semua balita (S)', kegiatan.s_L_0_5, kegiatan.s_P_0_5, kegiatan.s_L_6_11, kegiatan.s_P_6_11, kegiatan.s_L_12_23, kegiatan.s_P_12_23, kegiatan.s_L_24_60, kegiatan.s_P_24_60],
        ['02. Jumlah balita terdaftar KMS (K)', kegiatan.k_L_0_5, kegiatan.k_P_0_5, kegiatan.k_L_6_11, kegiatan.k_P_6_11, kegiatan.k_L_12_23, kegiatan.k_P_12_23, kegiatan.k_L_24_60, kegiatan.k_P_24_60],
        ['03. Naik berat badan (N)', kegiatan.n_L_0_5, kegiatan.n_P_0_5, kegiatan.n_L_6_11, kegiatan.n_P_6_11, kegiatan.n_L_12_23, kegiatan.n_P_12_23, kegiatan.n_L_24_60, kegiatan.n_P_24_60],
        ['04. Tidak naik berat badan (T)', kegiatan.t_L_0_5, kegiatan.t_P_0_5, kegiatan.t_L_6_11, kegiatan.t_P_6_11, kegiatan.t_L_12_23, kegiatan.t_P_12_23, kegiatan.t_L_24_60, kegiatan.t_P_24_60],
        ['05. Ditimbang tapi tidak ditimbang bulan lalu (O)', kegiatan.o_L_0_5, kegiatan.o_P_0_5, kegiatan.o_L_6_11, kegiatan.o_P_6_11, kegiatan.o_L_12_23, kegiatan.o_P_12_23, kegiatan.o_L_24_60, kegiatan.o_P_24_60],
        ['06. Pertama kali hadir (B)', kegiatan.b_L_0_5, kegiatan.b_P_0_5, kegiatan.b_L_6_11, kegiatan.b_P_6_11, kegiatan.b_L_12_23, kegiatan.b_P_12_23, kegiatan.b_L_24_60, kegiatan.b_P_24_60],
        [],
        ['09. Di bawah garis merah (BGM)', kegiatan.bawahGarisMerah],
        ['10. Vitamin A Bayi - Februari', kegiatan.vitA_bayi_feb, 'Agustus', kegiatan.vitA_bayi_ags],
        ['11. Vitamin A Balita - Februari', kegiatan.vitA_balita_feb, 'Agustus', kegiatan.vitA_balita_ags],
        [],
        ['III. PEMANTAUAN ASI EKSKLUSIF'],
        ['No','Nama Balita','Tgl Lahir','Umur','E0','E1','E2','E3','E4','E5','E6','Nama Ortu'],
        ...asiRows.map((r,i) => [
          i+1, r.namaBalita, r.tglLahir, r.umur,
          r.e0?'✓':'', r.e1?'✓':'', r.e2?'✓':'', r.e3?'✓':'',
          r.e4?'✓':'', r.e5?'✓':'', r.e6?'✓':'', r.namaOrtu
        ]),
        [],
        ['V. KETERANGAN LAIN'],
        ['Jumlah ibu hamil', kegiatan.jumlahHamil],
        ['Jumlah persalinan', kegiatan.jumlahPersalinan],
        [],
        ['Tanggal Pencatatan', info.tanggalPencatatan],
        ['Ketua Kader', info.ketuaKader],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
      ws1['!cols'] = [{wch:45},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8}];
      XLSX.utils.book_append_sheet(wb, ws1, 'Catatan Bulanan');

      // ── Sheet 2: Formulir Pemantauan Pertumbuhan ─────────────
      const header2 = [
        ['FORMULIR PEMANTAUAN PERTUMBUHAN BALITA DI POSYANDU'],
        [`Provinsi: DIY`, '', `Nama Posyandu: ${info.namaPosyandu}`, '', '', `Kader Pemantau:`],
        [`Kabupaten: Sleman`, '', `Alamat: ${info.dusun}`],
        [`Puskesmas: -`, '', `Bulan: ${info.bulan}`],
        [`Desa: ${info.desa}`, '', `Tahun: ${info.tahun}`],
        [],
        [
          'No', 'No KK', 'NIK', 'Anak Ke', 'Nama Anak', 'Tgl Lahir', 'L/P',
          'Usia Kehamilan Lahir', 'BBL', 'PBL', 'UKA Lahir',
          'Nama Ortu (Ayah & Ibu)', 'NIK Ayah', 'No Tlp', 'Alamat', 'RT', 'RW',
          'Tanggal Ukur', 'BB (kg)', 'PB/TB (cm)', 'LILA/LIKA',
          'Ket N/T', 'ASI Eksklusif', 'Vit A Feb', 'Vit A Ags',
          'Buku KIA', 'Ket Perkembangan / PKAT',
        ],
      ];
      const rows2 = pemantauanRows.map((r, i) => [
        i+1, r.noKK, r.nik, r.anakKe, r.namaAnak,
        r.tglLahir ? formatTanggal(r.tglLahir) : '',
        r.lp, r.usiaKehamilanLahir, r.bbl, r.pbl, r.ukaLahir,
        r.namaOrtu, r.nikAyah, r.noTlp, r.alamat, r.rt, r.rw,
        r.tglUkurBaru || r.tglUkur,
        r.bbBaru || r.bb, r.pbBaru || r.pb, r.lila,
        r.statusGizi, '', r.vitAFeb, r.vitAAgs,
        r.bukuKIA, r.catatan,
      ]);
      const ws2 = XLSX.utils.aoa_to_sheet([...header2, ...rows2]);
      ws2['!cols'] = Array(27).fill({wch:14});
      ws2['!cols'][4] = { wch:22 }; // nama anak lebih lebar
      ws2['!cols'][11] = { wch:22 }; // nama ortu
      XLSX.utils.book_append_sheet(wb, ws2, 'Pemantauan Pertumbuhan');

      XLSX.writeFile(wb, `Laporan_Posyandu_${info.namaPosyandu || 'Posyandu'}_${info.bulan}_${info.tahun}.xlsx`);
      showSuccess('Export Excel berhasil! File sedang diunduh.');
    } catch (err) {
      console.error(err);
      showError('Gagal export Excel. Coba lagi.');
    }
  }

  // ── Tambah baris ASI ─────────────────────────────────────────
  function tambahBariASI() {
    setAsiRows(prev => [...prev, { namaBalita:'', tglLahir:'', umur:'', e0:false, e1:false, e2:false, e3:false, e4:false, e5:false, e6:false, namaOrtu:'' }]);
  }

  const inputStyle = {
    padding:'6px 8px', border:'1.5px solid #E5E7EB', borderRadius:6,
    fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff', width:'100%', boxSizing:'border-box',
  };
  const thStyle = {
    padding:'8px 6px', background:'#F0FDF4', fontSize:10, fontWeight:700,
    color:'#15803D', borderBottom:'2px solid #BBF7D0', whiteSpace:'nowrap', textAlign:'center',
  };
  const tdStyle = { padding:'4px 4px', borderBottom:'1px solid #F0F0F0', verticalAlign:'top' };

  return (
    <div style={{ padding:24, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <Toast toast={toast}/>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>📋 Catatan Bulanan Posyandu</h2>
          <div style={{ fontSize:12, color:'#9E9E9E', marginTop:2 }}>Input manual data kegiatan penimbangan</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Button variant="ghost" onClick={() => window.print()}>🖨️ Cetak</Button>
          <Button onClick={exportExcel}>📊 Export Excel</Button>
        </div>
      </div>

      {/* ── I. INFO UMUM ─────────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader title="I. Informasi Umum Posyandu"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0 20px' }}>
          <Field label="Nama Posyandu" value={info.namaPosyandu} onChange={v=>setInfo(p=>({...p,namaPosyandu:v}))}/>
          <Field label="Dusun" value={info.dusun} onChange={v=>setInfo(p=>({...p,dusun:v}))}/>
          <Field label="Desa" value={info.desa} onChange={v=>setInfo(p=>({...p,desa:v}))}/>
          <Field label="Petugas Lapangan yang Membina" value={info.petugasLapangan} onChange={v=>setInfo(p=>({...p,petugasLapangan:v}))}/>
          <Field label="Jumlah Kader Aktif" value={info.jumlahKader} onChange={v=>setInfo(p=>({...p,jumlahKader:v}))} type="number"/>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1, marginBottom:10 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Bulan</label>
              <select value={info.bulan} onChange={e=>setInfo(p=>({...p,bulan:e.target.value}))}
                style={{ ...inputStyle, padding:'8px 12px' }}>
                {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <Field label="Tahun" value={info.tahun} onChange={v=>setInfo(p=>({...p,tahun:v}))} type="number" width="80px"/>
          </div>
          <Field label="Tanggal Pelaksanaan" value={info.tanggalPelaksanaan} onChange={v=>setInfo(p=>({...p,tanggalPelaksanaan:v}))} type="date"/>
          <Field label="Tanggal Pencatatan" value={info.tanggalPencatatan} onChange={v=>setInfo(p=>({...p,tanggalPencatatan:v}))} type="date"/>
          <Field label="Ketua Kader" value={info.ketuaKader} onChange={v=>setInfo(p=>({...p,ketuaKader:v}))}/>
        </div>
      </Card>

      {/* ── II. KEGIATAN PENIMBANGAN ─────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader title="II. Kegiatan Penimbangan"/>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign:'left', width:260 }}>Kegiatan</th>
                {['0-5 bln L','0-5 bln P','6-11 bln L','6-11 bln P','12-23 bln L','12-23 bln P','24-60 bln L','24-60 bln P'].map(h=>(
                  <th key={h} style={{ ...thStyle, minWidth:56 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['01. Semua balita (S)', 's_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60'],
                ['02. Terdaftar KMS (K)', 'k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60'],
                ['03. Naik BB (N)', 'n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60'],
                ['04. Tidak naik BB (T)', 't_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60'],
                ['05. Ditimbang, tidak bln lalu (O)', 'o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60'],
                ['06. Pertama kali hadir (B)', 'b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60'],
              ].map(([label, ...fields]) => (
                <tr key={label}>
                  <td style={{ ...tdStyle, fontWeight:600, fontSize:12, paddingLeft:8 }}>{label}</td>
                  {fields.map(f => (
                    <td key={f} style={{ ...tdStyle, textAlign:'center' }}>
                      <input type="number" value={kegiatan[f]||''} onChange={e=>setKegiatan(p=>({...p,[f]:e.target.value}))}
                        style={{ ...inputStyle, width:48, textAlign:'center' }}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0 20px', marginTop:16 }}>
          <Field label="09. Di bawah garis merah (BGM)" value={kegiatan.bawahGarisMerah} onChange={v=>setKegiatan(p=>({...p,bawahGarisMerah:v}))} type="number"/>
          <Field label="Vit A Bayi - Februari" value={kegiatan.vitA_bayi_feb} onChange={v=>setKegiatan(p=>({...p,vitA_bayi_feb:v}))} type="number"/>
          <Field label="Vit A Bayi - Agustus" value={kegiatan.vitA_bayi_ags} onChange={v=>setKegiatan(p=>({...p,vitA_bayi_ags:v}))} type="number"/>
          <Field label="Vit A Balita - Februari" value={kegiatan.vitA_balita_feb} onChange={v=>setKegiatan(p=>({...p,vitA_balita_feb:v}))} type="number"/>
          <Field label="Vit A Balita - Agustus" value={kegiatan.vitA_balita_ags} onChange={v=>setKegiatan(p=>({...p,vitA_balita_ags:v}))} type="number"/>
          <Field label="Ibu Hamil" value={kegiatan.jumlahHamil} onChange={v=>setKegiatan(p=>({...p,jumlahHamil:v}))} type="number"/>
          <Field label="Jumlah Persalinan" value={kegiatan.jumlahPersalinan} onChange={v=>setKegiatan(p=>({...p,jumlahPersalinan:v}))} type="number"/>
        </div>
      </Card>

      {/* ── III. ASI EKSKLUSIF ────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>III. Pemantauan ASI Eksklusif</h3>
          <Button size="sm" onClick={tambahBariASI}>➕ Tambah Baris</Button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr>
                {['No','Nama Balita','Tgl Lahir','Umur','E0','E1','E2','E3','E4','E5','E6','Nama Ortu',''].map(h=>(
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {asiRows.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, textAlign:'center', fontWeight:700 }}>{i+1}</td>
                  <td style={tdStyle}><input value={r.namaBalita} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,namaBalita:e.target.value}:x))} style={inputStyle}/></td>
                  <td style={tdStyle}><input type="date" value={r.tglLahir} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,tglLahir:e.target.value}:x))} style={{...inputStyle,width:130}}/></td>
                  <td style={tdStyle}><input type="number" value={r.umur} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,umur:e.target.value}:x))} style={{...inputStyle,width:48,textAlign:'center'}}/></td>
                  {['e0','e1','e2','e3','e4','e5','e6'].map(e=>(
                    <td key={e} style={{...tdStyle,textAlign:'center'}}>
                      <input type="checkbox" checked={r[e]} onChange={ev=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,[e]:ev.target.checked}:x))}/>
                    </td>
                  ))}
                  <td style={tdStyle}><input value={r.namaOrtu} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,namaOrtu:e.target.value}:x))} style={inputStyle}/></td>
                  <td style={tdStyle}><button onClick={()=>setAsiRows(p=>p.filter((_,j)=>j!==i))} style={{background:'#FEF2F2',border:'none',borderRadius:6,padding:'4px 8px',cursor:'pointer',color:'#DC2626',fontSize:12}}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── IV. PEMANTAUAN PERTUMBUHAN BALITA ─────────────────── */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>IV. Formulir Pemantauan Pertumbuhan Balita</h3>
            <div style={{ fontSize:12, color:'#9E9E9E', marginTop:2 }}>Pilih nama orang tua → anak otomatis muncul dengan data sebelumnya</div>
          </div>
          <Button onClick={() => setShowAddBalita(true)}>➕ Tambah Balita</Button>
        </div>

        {/* Modal pilih balita via dropdown orang tua */}
        {showAddBalita && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setShowAddBalita(false)}>
            <div style={{ background:'#fff', borderRadius:20, width:500, maxHeight:'80vh', overflow:'hidden', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }} onClick={e=>e.stopPropagation()}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0' }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Pilih Balita</h3>
                <p style={{ margin:'6px 0 0', fontSize:12, color:'#9E9E9E' }}>Cari berdasarkan nama orang tua / ibu</p>
              </div>
              <div style={{ padding:'16px 24px' }}>
                <input
                  placeholder="🔍 Ketik nama ibu..."
                  value={searchOrtu}
                  onChange={e=>{ setSearchOrtu(e.target.value); setSelectedOrtu(null); }}
                  autoFocus
                  style={{ ...inputStyle, marginBottom:12, padding:'10px 14px', fontSize:13 }}
                />
                {/* Daftar orang tua */}
                {!selectedOrtu && ortuOptions.length > 0 && (
                  <div style={{ maxHeight:200, overflowY:'auto', border:'1px solid #F0F0F0', borderRadius:10, marginBottom:12 }}>
                    {ortuOptions.map((b,i) => (
                      <div key={i} onClick={() => setSelectedOrtu(b.namaIbu)}
                        style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', gap:10 }}
                        onMouseEnter={e=>e.currentTarget.style.background='#F0FDF4'}
                        onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                        <span style={{ fontSize:20 }}>👩</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{b.namaIbu}</div>
                          <div style={{ fontSize:11, color:'#9E9E9E' }}>{b.namaPosyandu || '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Daftar anak dari ortu yang dipilih */}
                {selectedOrtu && (
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1B6B3A', marginBottom:8 }}>
                      👩 {selectedOrtu} — {anakDariOrtu.length} anak terdaftar:
                    </div>
                    {anakDariOrtu.map(b => {
                      const umur = hitungUmurBulan(b.tanggalLahir);
                      const last = b.riwayat?.[b.riwayat.length-1];
                      const sudahAda = pemantauanRows.find(r=>r.id===b.id);
                      return (
                        <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:'#F9FAFB', marginBottom:8, border:'1px solid #F0F0F0' }}>
                          <span style={{ fontSize:24 }}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{b.nama}</div>
                            <div style={{ fontSize:11, color:'#9E9E9E' }}>
                              {umur} bulan • {b.jenisKelamin}
                              {last && ` • BB: ${last.bb||last.beratBadan}kg • TB: ${last.tb||last.tinggiBadan}cm`}
                            </div>
                          </div>
                          {sudahAda
                            ? <span style={{ fontSize:11, color:'#16A34A', fontWeight:700 }}>✅ Sudah ditambahkan</span>
                            : <Button size="sm" onClick={() => tambahBalitaKeLaporan(b)}>➕ Tambah</Button>
                          }
                        </div>
                      );
                    })}
                    <button onClick={()=>setSelectedOrtu(null)} style={{ background:'none', border:'none', color:'#9E9E9E', fontSize:12, cursor:'pointer', marginTop:4 }}>← Kembali cari orang tua</button>
                  </div>
                )}
                {searchOrtu && ortuOptions.length === 0 && (
                  <div style={{ textAlign:'center', padding:'24px', color:'#9E9E9E', fontSize:13 }}>
                    Tidak ditemukan orang tua dengan nama "{searchOrtu}"
                  </div>
                )}
              </div>
              <div style={{ padding:'12px 24px', borderTop:'1px solid #F0F0F0' }}>
                <Button variant="ghost" onClick={()=>{ setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null); }}>Tutup</Button>
              </div>
            </div>
          </div>
        )}

        {pemantauanRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#9E9E9E' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>👶</div>
            <div style={{ fontSize:14 }}>Belum ada balita. Klik "Tambah Balita" dan cari nama orang tua.</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr>
                  {['No','Nama Anak','Tgl Lahir','L/P','Umur','Nama Ortu','BB Lalu','TB Lalu','BB Baru *','TB Baru *','Tgl Ukur','Status Gizi','Catatan',''].map(h=>(
                    <th key={h} style={{ ...thStyle, fontSize:10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pemantauanRows.map((r, i) => {
                  const umur = hitungUmurBulan(r.tglLahir);
                  const statusGizi = r.bbBaru
                    ? getStatusGizi(parseFloat(r.bbBaru), umur, r.lp==='L'?'Laki-laki':'Perempuan')
                    : r.statusGizi;
                  return (
                    <tr key={r.id || i}>
                      <td style={{ ...tdStyle, textAlign:'center', fontWeight:700 }}>{i+1}</td>
                      <td style={{ ...tdStyle, fontWeight:700 }}>{r.namaAnak}</td>
                      <td style={tdStyle}>{r.tglLahir ? formatTanggal(r.tglLahir) : '-'}</td>
                      <td style={{ ...tdStyle, textAlign:'center' }}>{r.lp}</td>
                      <td style={{ ...tdStyle, textAlign:'center' }}>{umur} bln</td>
                      <td style={tdStyle}>{r.namaOrtu}</td>
                      <td style={{ ...tdStyle, textAlign:'center', color:'#9E9E9E' }}>{r.bb ? `${r.bb} kg` : '-'}</td>
                      <td style={{ ...tdStyle, textAlign:'center', color:'#9E9E9E' }}>{r.pb ? `${r.pb} cm` : '-'}</td>
                      <td style={tdStyle}>
                        <input type="number" value={r.bbBaru} onChange={e=>updateRow(i,'bbBaru',e.target.value)}
                          placeholder="kg" style={{...inputStyle, width:56, textAlign:'center', borderColor:'#1B6B3A'}}/>
                      </td>
                      <td style={tdStyle}>
                        <input type="number" value={r.pbBaru} onChange={e=>updateRow(i,'pbBaru',e.target.value)}
                          placeholder="cm" style={{...inputStyle, width:56, textAlign:'center', borderColor:'#1B6B3A'}}/>
                      </td>
                      <td style={tdStyle}>
                        <input type="date" value={r.tglUkurBaru} onChange={e=>updateRow(i,'tglUkurBaru',e.target.value)}
                          style={{...inputStyle, width:120}}/>
                      </td>
                      <td style={{ ...tdStyle, textAlign:'center' }}>
                        {statusGizi ? <StatusBadge status={statusGizi}/> : '-'}
                      </td>
                      <td style={tdStyle}>
                        <input value={r.catatan} onChange={e=>updateRow(i,'catatan',e.target.value)}
                          placeholder="catatan..." style={{...inputStyle, width:100}}/>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={()=>hapusRow(i)} style={{ background:'#FEF2F2', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#DC2626', fontSize:12 }}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pemantauanRows.length > 0 && (
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
            <Button onClick={exportExcel}>📊 Export Excel Sekarang</Button>
          </div>
        )}
      </Card>
    </div>
  );
}