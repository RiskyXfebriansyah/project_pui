// ============================================================
//  LaporanPage.jsx
//  - Filter tanggal pencatatan → load data dari DB
//  - Input manual kegiatan penimbangan (dengan deskripsi lengkap)
//  - Tabel ASI Eksklusif
//  - Tabel Pemantauan Pertumbuhan Balita (Section IV)
//  - Tombol SIMPAN → baru bisa Export Excel
// ============================================================

import React, { useState, useCallback } from 'react';
import { Card, SectionHeader, Button, StatusBadge } from '../components/ui/Components';
import { formatTanggal, hitungUmurBulan, getStatusGizi, getStatusStunting } from '../utils/helpers';
import { LaporanAPI } from '../services/api';

// ── Toast ──────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:'fixed', top:24, left:'50%', transform:'translateX(-50%)',
      zIndex:99999, padding:'14px 28px', borderRadius:14,
      background: toast.type === 'success' ? '#16A34A' : toast.type === 'info' ? '#2563EB' : '#DC2626',
      color:'#fff', fontWeight:700, fontSize:14,
      boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
      display:'flex', alignItems:'center', gap:10, fontFamily:'inherit',
      animation:'slideIn .3s ease'
    }}>
      {toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '❌'} {toast.message}
    </div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, msg) { setToast({ type, message: msg }); setTimeout(() => setToast(null), 3500); }
  return { toast, showSuccess: m => show('success', m), showError: m => show('error', m), showInfo: m => show('info', m) };
}

// ── Field kecil ────────────────────────────────────────────────
function Field({ label, value, onChange, type='text', placeholder, disabled, min }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>{label}</label>}
      <input type={type} value={value || ''} placeholder={placeholder} disabled={disabled} min={min}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB',
          fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
          background: disabled ? '#F9FAFB' : '#fff', color: disabled ? '#9E9E9E' : '#1A1A1A',
          transition:'border-color .15s'
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = '#1B6B3A'; }}
        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
      />
    </div>
  );
}

// ── Deskripsi kode penimbangan ─────────────────────────────────
const KODE_DESKRIPSI = {
  S: { kode:'S', label:'Semua Balita', warna:'#1565C0', bg:'#EFF6FF',
       desc:'Jumlah semua balita yang ada di kelompok penimbangan bulan ini. Termasuk yang hadir maupun tidak hadir.' },
  K: { kode:'K', label:'Terdaftar KMS', warna:'#16A34A', bg:'#F0FDF4',
       desc:'Jumlah balita yang terdaftar dan mempunyai Kartu Menuju Sehat (KMS) bulan ini.' },
  N: { kode:'N', label:'Naik BB', warna:'#16A34A', bg:'#F0FDF4',
       desc:'Jumlah balita yang naik berat badannya bulan ini dibanding bulan lalu.' },
  T: { kode:'T', label:'Tidak Naik BB', warna:'#DC2626', bg:'#FEF2F2',
       desc:'Jumlah balita yang tidak naik berat badannya (T = Tidak Naik). Perlu perhatian khusus.' },
  O: { kode:'O', label:'Baru Ditimbang (O)', warna:'#D97706', bg:'#FFFBEB',
       desc:'Balita yang ditimbang bulan ini tetapi TIDAK ditimbang bulan lalu. Kode O = baru/kembali hadir.' },
  B: { kode:'B', label:'Pertama Hadir (B)', warna:'#9333EA', bg:'#F5F3FF',
       desc:'Jumlah balita yang baru pertama kali hadir di penimbangan bulan ini. Kode B = Baru.' },
};

const BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const defaultInfo = () => ({
  namaPosyandu:'', dusun:'', desa:'', petugasLapangan:'', jumlahKader:'',
  bulan: BULAN_LIST[new Date().getMonth()], tahun: String(new Date().getFullYear()),
  tanggalPelaksanaan:'', tanggalPencatatan:'', ketuaKader:'',
});

const defaultKegiatan = () => ({
  s_L_0_5:'', s_P_0_5:'', s_L_6_11:'', s_P_6_11:'', s_L_12_23:'', s_P_12_23:'', s_L_24_60:'', s_P_24_60:'',
  k_L_0_5:'', k_P_0_5:'', k_L_6_11:'', k_P_6_11:'', k_L_12_23:'', k_P_12_23:'', k_L_24_60:'', k_P_24_60:'',
  n_L_0_5:'', n_P_0_5:'', n_L_6_11:'', n_P_6_11:'', n_L_12_23:'', n_P_12_23:'', n_L_24_60:'', n_P_24_60:'',
  t_L_0_5:'', t_P_0_5:'', t_L_6_11:'', t_P_6_11:'', t_L_12_23:'', t_P_12_23:'', t_L_24_60:'', t_P_24_60:'',
  o_L_0_5:'', o_P_0_5:'', o_L_6_11:'', o_P_6_11:'', o_L_12_23:'', o_P_12_23:'', o_L_24_60:'', o_P_24_60:'',
  b_L_0_5:'', b_P_0_5:'', b_L_6_11:'', b_P_6_11:'', b_L_12_23:'', b_P_12_23:'', b_L_24_60:'', b_P_24_60:'',
  bawahGarisMerah:'', vitA_bayi_feb:'', vitA_bayi_ags:'', vitA_balita_feb:'', vitA_balita_ags:'',
  jumlahHamil:'', jumlahPersalinan:'',
});

export default function LaporanPage({ balitaList = [], statistik = {} }) {
  const { toast, showSuccess, showError, showInfo } = useToast();

  // ── State utama ───────────────────────────────────────────────
  const [filterTanggal, setFilterTanggal] = useState('');
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [laporanId, setLaporanId]         = useState(null);   // ID dari DB jika sudah tersimpan
  const [isSaved, setIsSaved]             = useState(false);  // tombol export aktif setelah simpan
  const [saving, setSaving]               = useState(false);

  const [info, setInfo]           = useState(defaultInfo());
  const [kegiatan, setKegiatan]   = useState(defaultKegiatan());
  const [asiRows, setAsiRows]     = useState([
    { namaBalita:'', tglLahir:'', umur:'', e0:false, e1:false, e2:false, e3:false, e4:false, e5:false, e6:false, namaOrtu:'' }
  ]);
  const [pemantauanRows, setPemantauanRows] = useState([]);
  const [showAddBalita, setShowAddBalita]  = useState(false);
  const [searchOrtu, setSearchOrtu]        = useState('');
  const [selectedOrtu, setSelectedOrtu]    = useState(null);
  const [showKodeInfo, setShowKodeInfo]    = useState(false);

  // ── Filter tanggal → load data dari DB ───────────────────────
  async function handleFilterTanggal() {
    if (!filterTanggal) { showError('Pilih tanggal pencatatan terlebih dahulu'); return; }
    setLoadingFilter(true);
    try {
      const res = await LaporanAPI.getByTanggal(filterTanggal);
      if (res?.status?.code === 200 && res.data) {
        const d = res.data;
        setLaporanId(d.id);
        setInfo({
          namaPosyandu: d.namaPosyandu || '',
          dusun: d.dusun || '',
          desa: d.desa || '',
          petugasLapangan: d.petugasLapangan || '',
          jumlahKader: d.jumlahKaderAktif || '',
          bulan: d.bulan || BULAN_LIST[new Date().getMonth()],
          tahun: String(d.tahun || new Date().getFullYear()),
          tanggalPelaksanaan: d.tanggalPelaksanaan?.split('T')[0] || '',
          tanggalPencatatan: d.tanggalPencatatan?.split('T')[0] || '',
          ketuaKader: d.ketuaKader || '',
        });
        // Map kegiatan dari response DB (camelCase)
        if (d.kegiatan) {
          const k = d.kegiatan;
          setKegiatan({
            s_L_0_5: k.s_L_0_5||'', s_P_0_5: k.s_P_0_5||'', s_L_6_11: k.s_L_6_11||'', s_P_6_11: k.s_P_6_11||'',
            s_L_12_23: k.s_L_12_23||'', s_P_12_23: k.s_P_12_23||'', s_L_24_60: k.s_L_24_60||'', s_P_24_60: k.s_P_24_60||'',
            k_L_0_5: k.k_L_0_5||'', k_P_0_5: k.k_P_0_5||'', k_L_6_11: k.k_L_6_11||'', k_P_6_11: k.k_P_6_11||'',
            k_L_12_23: k.k_L_12_23||'', k_P_12_23: k.k_P_12_23||'', k_L_24_60: k.k_L_24_60||'', k_P_24_60: k.k_P_24_60||'',
            n_L_0_5: k.n_L_0_5||'', n_P_0_5: k.n_P_0_5||'', n_L_6_11: k.n_L_6_11||'', n_P_6_11: k.n_P_6_11||'',
            n_L_12_23: k.n_L_12_23||'', n_P_12_23: k.n_P_12_23||'', n_L_24_60: k.n_L_24_60||'', n_P_24_60: k.n_P_24_60||'',
            t_L_0_5: k.t_L_0_5||'', t_P_0_5: k.t_P_0_5||'', t_L_6_11: k.t_L_6_11||'', t_P_6_11: k.t_P_6_11||'',
            t_L_12_23: k.t_L_12_23||'', t_P_12_23: k.t_P_12_23||'', t_L_24_60: k.t_L_24_60||'', t_P_24_60: k.t_P_24_60||'',
            o_L_0_5: k.o_L_0_5||'', o_P_0_5: k.o_P_0_5||'', o_L_6_11: k.o_L_6_11||'', o_P_6_11: k.o_P_6_11||'',
            o_L_12_23: k.o_L_12_23||'', o_P_12_23: k.o_P_12_23||'', o_L_24_60: k.o_L_24_60||'', o_P_24_60: k.o_P_24_60||'',
            b_L_0_5: k.b_L_0_5||'', b_P_0_5: k.b_P_0_5||'', b_L_6_11: k.b_L_6_11||'', b_P_6_11: k.b_P_6_11||'',
            b_L_12_23: k.b_L_12_23||'', b_P_12_23: k.b_P_12_23||'', b_L_24_60: k.b_L_24_60||'', b_P_24_60: k.b_P_24_60||'',
            bawahGarisMerah: k.bawahGarisMerah||'', vitA_bayi_feb: k.vitA_Bayi_Feb||'', vitA_bayi_ags: k.vitA_Bayi_Ags||'',
            vitA_balita_feb: k.vitA_Balita_Feb||'', vitA_balita_ags: k.vitA_Balita_Ags||'',
            jumlahHamil: k.jumlahHamil||'', jumlahPersalinan: k.jumlahPersalinan||'',
          });
        }
        if (d.asiRows) setAsiRows(d.asiRows);
        if (d.pemantauanRows) setPemantauanRows(d.pemantauanRows);
        setIsSaved(true);
        showSuccess(`Data laporan tanggal ${filterTanggal} berhasil dimuat!`);
      } else {
        showInfo('Tidak ada data untuk tanggal ini. Form dikosongkan untuk input baru.');
        setLaporanId(null);
        setInfo(prev => ({ ...defaultInfo(), tanggalPencatatan: filterTanggal }));
        setKegiatan(defaultKegiatan());
        setAsiRows([{ namaBalita:'', tglLahir:'', umur:'', e0:false, e1:false, e2:false, e3:false, e4:false, e5:false, e6:false, namaOrtu:'' }]);
        setPemantauanRows([]);
        setIsSaved(false);
      }
    } catch {
      showError('Gagal memuat data. Cek koneksi server.');
    } finally {
      setLoadingFilter(false);
    }
  }

  // ── Simpan ke DB ──────────────────────────────────────────────
  async function handleSimpan() {
    if (!info.namaPosyandu || !info.tanggalPencatatan) {
      showError('Nama Posyandu dan Tanggal Pencatatan wajib diisi'); return;
    }
    setSaving(true);
    try {
      const payload = { info, kegiatan, asiRows, pemantauanRows };
      const res = await LaporanAPI.simpan(payload);
      if (res?.status?.code === 200 || res?.status?.code === 201) {
        setLaporanId(res.data?.id || laporanId);
        setIsSaved(true);
        showSuccess('Laporan berhasil disimpan! Sekarang bisa Export Excel.');
      } else {
        showError(res?.status?.message || 'Gagal menyimpan laporan');
      }
    } catch {
      showError('Gagal terhubung ke server');
    } finally {
      setSaving(false);
    }
  }

  // ── Export Excel ──────────────────────────────────────────────
  async function exportExcel() {
    if (!isSaved) { showError('Simpan laporan terlebih dahulu sebelum export!'); return; }
    try {
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

      // ── Sheet 1: Catatan Bulanan ──────────────────────────────
      const ws1Data = [
        ['CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU'],
        [`Penimbangan bulan ini dilakukan tanggal: ${info.tanggalPelaksanaan}`],
        [],
        ['I. UMUM'],
        ['a. Posyandu', info.namaPosyandu],
        ['b. Dusun', info.dusun],
        ['c. Desa', info.desa],
        ['d. Petugas Lapangan yang membina', info.petugasLapangan],
        ['e. Jumlah Kader Aktif Bulan Ini', info.jumlahKader],
        [],
        ['II. KEGIATAN PENIMBANGAN','0-5 bln','','6-11 bln','','12-23 bln','','24-60 bln',''],
        ['','L','P','L','P','L','P','L','P'],
        ['01. Jumlah semua balita (S)', kegiatan.s_L_0_5, kegiatan.s_P_0_5, kegiatan.s_L_6_11, kegiatan.s_P_6_11, kegiatan.s_L_12_23, kegiatan.s_P_12_23, kegiatan.s_L_24_60, kegiatan.s_P_24_60],
        ['02. Terdaftar KMS (K)', kegiatan.k_L_0_5, kegiatan.k_P_0_5, kegiatan.k_L_6_11, kegiatan.k_P_6_11, kegiatan.k_L_12_23, kegiatan.k_P_12_23, kegiatan.k_L_24_60, kegiatan.k_P_24_60],
        ['03. Naik BB (N)', kegiatan.n_L_0_5, kegiatan.n_P_0_5, kegiatan.n_L_6_11, kegiatan.n_P_6_11, kegiatan.n_L_12_23, kegiatan.n_P_12_23, kegiatan.n_L_24_60, kegiatan.n_P_24_60],
        ['04. Tidak naik BB (T)', kegiatan.t_L_0_5, kegiatan.t_P_0_5, kegiatan.t_L_6_11, kegiatan.t_P_6_11, kegiatan.t_L_12_23, kegiatan.t_P_12_23, kegiatan.t_L_24_60, kegiatan.t_P_24_60],
        ['05. Ditimbang tidak bulan lalu (O)', kegiatan.o_L_0_5, kegiatan.o_P_0_5, kegiatan.o_L_6_11, kegiatan.o_P_6_11, kegiatan.o_L_12_23, kegiatan.o_P_12_23, kegiatan.o_L_24_60, kegiatan.o_P_24_60],
        ['06. Pertama kali hadir (B)', kegiatan.b_L_0_5, kegiatan.b_P_0_5, kegiatan.b_L_6_11, kegiatan.b_P_6_11, kegiatan.b_L_12_23, kegiatan.b_P_12_23, kegiatan.b_L_24_60, kegiatan.b_P_24_60],
        [],
        ['09. Di bawah garis merah (BGM)', kegiatan.bawahGarisMerah],
        ['10. Vitamin A Bayi - Februari', kegiatan.vitA_bayi_feb, 'Agustus', kegiatan.vitA_bayi_ags],
        ['11. Vitamin A Balita - Februari', kegiatan.vitA_balita_feb, 'Agustus', kegiatan.vitA_balita_ags],
        [],
        ['III. PEMANTAUAN ASI EKSKLUSIF'],
        ['No','Nama Balita','Tgl Lahir','Umur','E0','E1','E2','E3','E4','E5','E6','Nama Ortu'],
        ...asiRows.map((r, i) => [
          i+1, r.namaBalita, r.tglLahir, r.umur,
          r.e0?'✓':'', r.e1?'✓':'', r.e2?'✓':'', r.e3?'✓':'', r.e4?'✓':'', r.e5?'✓':'', r.e6?'✓':'',
          r.namaOrtu
        ]),
        [],
        ['V. KETERANGAN LAIN'],
        ['Jumlah ibu hamil', kegiatan.jumlahHamil, 'Jumlah persalinan', kegiatan.jumlahPersalinan],
        [],
        ['Tanggal Pencatatan', info.tanggalPencatatan, 'Ketua Kader', info.ketuaKader],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
      ws1['!cols'] = [{wch:45},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8}];
      XLSX.utils.book_append_sheet(wb, ws1, 'Catatan Bulanan');

      // ── Sheet 2: Formulir Pemantauan Pertumbuhan Balita ───────
      const ws2Data = [
        ['FORMULIR PEMANTAUAN PERTUMBUHAN BALITA DI POSYANDU'],
        [`Provinsi: DIY`, `Nama Posyandu: ${info.namaPosyandu}`, '', `Kader Pemantau:`],
        [`Kabupaten/Kota: Sleman`, `Alamat: ${info.dusun}`, '', 'BALITA'],
        [`Puskesmas/Kecamatan:`, `Bulan: ${info.bulan}`],
        [`Desa/Kelurahan: ${info.desa}`, `Tahun: ${info.tahun}`],
        [],
        [
          'No','No KK','NIK','Anak Ke','Nama Anak','Tanggal Lahir','L/P',
          'Usia Kehamilan Saat Lahir','BBL','PBL','UKA Lahir',
          'Nama Ortu (Ayah & Ibu)','NIK Ayah','No Tlp/HP Ortu',
          'Alamat','RT','RW','Tanggal Ukur','BB (kg)','PB/TB (cm)',
          'LILA/LIKA','KET N/T/O/B',
          'ASI Eksklusif\n(1=Ya, 2=Tidak)',
          'Vit A Feb\n(1=Ya, 2=Tdk)',
          'Vit A Ags\n(1=Ya, 2=Tdk)',
          'Buku KIA\n(1=Pny, 2=Tdk)',
          'Ket Perkembangan\n(Sesuai/Meragukan/Penyimpangan)\nPKAT=Ya/Blm'
        ],
        ...pemantauanRows.map((r, i) => [
          i+1, r.noKK||'', r.nik||'', r.anakKe||'', r.namaAnak||'',
          r.tglLahir ? formatTanggal(r.tglLahir) : '',
          r.lp||'', r.usiaKehamilanLahir||'', r.bbl||'', r.pbl||'', r.ukaLahir||'',
          r.namaOrtu||'', r.nikAyah||'', r.noTlp||'',
          r.alamat||'', r.rt||'', r.rw||'',
          r.tglUkurBaru||r.tglUkur||'',
          r.bbBaru||r.bb||'',
          r.pbBaru||r.pb||'',
          r.lila||'', r.statusNTO||'',
          r.asiEksklusif||'',
          r.vitAFeb||'',
          r.vitAAgs||'',
          r.bukuKIA||'',
          [r.ketPerkembangan, r.pkat ? `PKAT: ${r.pkat}` : ''].filter(Boolean).join(' | '),
        ]),
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
      ws2['!cols'] = Array(27).fill({wch:13});
      ws2['!cols'][4]  = { wch:22 };
      ws2['!cols'][11] = { wch:22 };
      ws2['!cols'][14] = { wch:20 };
      ws2['!cols'][26] = { wch:30 };
      XLSX.utils.book_append_sheet(wb, ws2, 'Pemantauan Pertumbuhan');

      XLSX.writeFile(wb, `Laporan_${info.namaPosyandu||'Posyandu'}_${info.bulan}_${info.tahun}.xlsx`);
      showSuccess('File Excel berhasil diunduh!');
    } catch (err) {
      console.error(err);
      showError('Gagal export Excel');
    }
  }

  // ── Tambah balita dari dropdown orang tua ─────────────────────
  const ortuOptions = balitaList
    .filter(b => b.namaIbu && b.namaIbu.toLowerCase().includes(searchOrtu.toLowerCase()))
    .reduce((acc, b) => {
      if (!acc.find(x => x.namaIbu === b.namaIbu)) acc.push(b);
      return acc;
    }, []);

  const anakDariOrtu = selectedOrtu ? balitaList.filter(b => b.namaIbu === selectedOrtu) : [];

  function tambahBalita(balita) {
    const umur = hitungUmurBulan(balita.tanggalLahir);
    const last  = balita.riwayat?.[balita.riwayat.length - 1];
    if (pemantauanRows.find(r => r.balitaId === balita.id)) {
      showError(`${balita.nama} sudah ada di daftar`); return;
    }
    setPemantauanRows(prev => [...prev, {
      balitaId:            balita.id,
      noKK:                '',
      nik:                 balita.nik || '',
      anakKe:              '',
      namaAnak:            balita.nama,
      tglLahir:            balita.tanggalLahir,
      lp:                  balita.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
      usiaKehamilanLahir:  '',
      bbl:                 '', pbl:'', ukaLahir:'',
      namaOrtu:            balita.namaIbu || '',
      nikAyah:             '',
      noTlp:               balita.noTelepon || '',
      alamat:              balita.alamat || '',
      rt:'', rw:'',
      tglUkur:             last ? (last.tanggal || last.tglUkur || '') : '',
      bb:                  last ? (last.bb || last.beratBadan || '') : '',
      pb:                  last ? (last.tb || last.tinggiBadan || '') : '',
      lila:                '',
      statusNTO:           '',
      // ← kolom baru bulan ini
      tglUkurBaru:         new Date().toISOString().split('T')[0],
      bbBaru:              '', pbBaru:'',
      asiEksklusif:        '',
      vitAFeb:             '', vitAAgs:'',
      bukuKIA:             '',
      ketPerkembangan:     '',
      pkat:                '',
      catatan:             '',
    }]);
    showSuccess(`${balita.nama} ditambahkan`);
    setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null);
  }

  function updateRow(idx, field, value) {
    setPemantauanRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  // ── Styles ───────────────────────────────────────────────────
  const thSt = { padding:'8px 6px', background:'#F0FDF4', fontSize:10, fontWeight:700, color:'#15803D', borderBottom:'2px solid #BBF7D0', whiteSpace:'nowrap', textAlign:'center', position:'sticky', top:0 };
  const tdSt = { padding:'4px 4px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle' };
  const numIn = { padding:'5px 4px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none', width:48, textAlign:'center', background:'#fff' };
  const txtIn = { padding:'6px 8px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', background:'#fff' };

  return (
    <div style={{ padding:24, fontFamily:"inherit" }}>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(-50%) translateY(-10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <Toast toast={toast}/>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>📋 Catatan Bulanan Posyandu</h2>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>Input manual data kegiatan penimbangan</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Button variant="ghost" onClick={() => window.print()}>🖨️ Cetak</Button>
          <Button variant={saving ? 'ghost' : 'primary'} onClick={handleSimpan} disabled={saving}>
            {saving ? '⏳ Menyimpan...' : '💾 Simpan'}
          </Button>
          <div style={{ position:'relative' }}>
            <Button onClick={exportExcel}
              style={{ opacity: isSaved ? 1 : 0.5, cursor: isSaved ? 'pointer' : 'not-allowed' }}>
              📊 Export Excel
            </Button>
            {!isSaved && (
              <div style={{ position:'absolute', right:0, top:'110%', background:'#1F2937', color:'#fff', padding:'6px 10px', borderRadius:8, fontSize:11, whiteSpace:'nowrap', zIndex:100 }}>
                Simpan dulu baru bisa export
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter Tanggal Pencatatan ─────────────────────────── */}
      <div style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ fontSize:20 }}>🔍</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#1D4ED8', marginBottom:2 }}>Cek Data Laporan Sebelumnya</div>
          <div style={{ fontSize:11, color:'#60A5FA' }}>Pilih tanggal pencatatan → data laporan otomatis dimuat dari database</div>
        </div>
        <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)}
          style={{ padding:'9px 14px', borderRadius:8, border:'1.5px solid #93C5FD', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}/>
        <Button onClick={handleFilterTanggal} disabled={loadingFilter}>
          {loadingFilter ? '⏳ Memuat...' : '📂 Muat Data'}
        </Button>
      </div>

      {/* ── I. Info Umum ──────────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <SectionHeader title="I. Informasi Umum Posyandu"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0 20px' }}>
          <Field label="Nama Posyandu *" value={info.namaPosyandu} onChange={v => setInfo(p => ({...p, namaPosyandu:v}))}/>
          <Field label="Dusun" value={info.dusun} onChange={v => setInfo(p => ({...p, dusun:v}))}/>
          <Field label="Desa" value={info.desa} onChange={v => setInfo(p => ({...p, desa:v}))}/>
          <Field label="Petugas Lapangan yang Membina" value={info.petugasLapangan} onChange={v => setInfo(p => ({...p, petugasLapangan:v}))}/>
          <Field label="Jumlah Kader Aktif" value={info.jumlahKader} onChange={v => setInfo(p => ({...p, jumlahKader:v}))} type="number" min="0"/>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Bulan</label>
              <select value={info.bulan} onChange={e => setInfo(p => ({...p, bulan:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ width:90, marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>Tahun</label>
              <input type="number" value={info.tahun} onChange={e => setInfo(p => ({...p, tahun:e.target.value}))}
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' }}/>
            </div>
          </div>
          <Field label="Tanggal Pelaksanaan" value={info.tanggalPelaksanaan} onChange={v => setInfo(p => ({...p, tanggalPelaksanaan:v}))} type="date"/>
          <Field label="Tanggal Pencatatan *" value={info.tanggalPencatatan} onChange={v => setInfo(p => ({...p, tanggalPencatatan:v}))} type="date"/>
          <Field label="Ketua Kader Posyandu" value={info.ketuaKader} onChange={v => setInfo(p => ({...p, ketuaKader:v}))}/>
        </div>
      </Card>

      {/* ── II. Kegiatan Penimbangan ──────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>II. Kegiatan Penimbangan</h3>
          <button onClick={() => setShowKodeInfo(v => !v)} style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12, color:'#16A34A', fontFamily:'inherit', fontWeight:600 }}>
            {showKodeInfo ? '▲ Sembunyikan' : '📖 Keterangan Kode'}
          </button>
        </div>

        {/* Keterangan kode */}
        {showKodeInfo && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:16 }}>
            {Object.values(KODE_DESKRIPSI).map(k => (
              <div key={k.kode} style={{ padding:'10px 14px', background:k.bg, borderRadius:10, border:`1px solid ${k.warna}22` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontWeight:800, fontSize:16, color:k.warna }}>{k.kode}</span>
                  <span style={{ fontWeight:700, fontSize:12, color:k.warna }}>{k.label}</span>
                </div>
                <div style={{ fontSize:11, color:'#6B7280', lineHeight:1.5 }}>{k.desc}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr>
                <th style={{ ...thSt, textAlign:'left', width:220, background:'#F9FAFB', color:'#6B7280' }}>Kegiatan</th>
                {['0-5 bln L','0-5 bln P','6-11 bln L','6-11 bln P','12-23 bln L','12-23 bln P','24-60 bln L','24-60 bln P'].map(h => (
                  <th key={h} style={{ ...thSt, minWidth:56 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['(S) Semua balita', 's_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60', KODE_DESKRIPSI.S.warna],
                ['(K) Terdaftar KMS', 'k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60', KODE_DESKRIPSI.K.warna],
                ['(N) Naik berat badan', 'n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60', KODE_DESKRIPSI.N.warna],
                ['(T) Tidak naik BB', 't_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60', KODE_DESKRIPSI.T.warna],
                ['(O) Ditimbang, tidak bln lalu', 'o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60', KODE_DESKRIPSI.O.warna],
                ['(B) Pertama kali hadir', 'b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60', KODE_DESKRIPSI.B.warna],
              ].map(([label, ...rest]) => {
                const color = rest.pop();
                const fields = rest;
                return (
                  <tr key={label}>
                    <td style={{ ...tdSt, paddingLeft:10, fontWeight:600, color }}>{label}</td>
                    {fields.map(f => (
                      <td key={f} style={{ ...tdSt, textAlign:'center' }}>
                        <input type="number" value={kegiatan[f]||''} min="0"
                          onChange={e => setKegiatan(p => ({...p, [f]: e.target.value}))}
                          style={numIn}/>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0 20px', marginTop:20, paddingTop:16, borderTop:'1px solid #F0F0F0' }}>
          <Field label="09. Di bawah garis merah (BGM)" value={kegiatan.bawahGarisMerah} onChange={v => setKegiatan(p=>({...p,bawahGarisMerah:v}))} type="number" min="0"/>
          <Field label="Vitamin A Bayi — Februari" value={kegiatan.vitA_bayi_feb} onChange={v => setKegiatan(p=>({...p,vitA_bayi_feb:v}))} type="number" min="0"/>
          <Field label="Vitamin A Bayi — Agustus" value={kegiatan.vitA_bayi_ags} onChange={v => setKegiatan(p=>({...p,vitA_bayi_ags:v}))} type="number" min="0"/>
          <Field label="Vitamin A Balita — Februari" value={kegiatan.vitA_balita_feb} onChange={v => setKegiatan(p=>({...p,vitA_balita_feb:v}))} type="number" min="0"/>
          <Field label="Vitamin A Balita — Agustus" value={kegiatan.vitA_balita_ags} onChange={v => setKegiatan(p=>({...p,vitA_balita_ags:v}))} type="number" min="0"/>
          <Field label="Ibu Hamil" value={kegiatan.jumlahHamil} onChange={v => setKegiatan(p=>({...p,jumlahHamil:v}))} type="number" min="0"/>
          <Field label="Jumlah Persalinan" value={kegiatan.jumlahPersalinan} onChange={v => setKegiatan(p=>({...p,jumlahPersalinan:v}))} type="number" min="0"/>
        </div>
      </Card>

      {/* ── III. ASI Eksklusif ────────────────────────────────── */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>III. Pemantauan ASI Eksklusif</h3>
          <Button size="sm" onClick={() => setAsiRows(p => [...p, { namaBalita:'', tglLahir:'', umur:'', e0:false, e1:false, e2:false, e3:false, e4:false, e5:false, e6:false, namaOrtu:'' }])}>
            ➕ Tambah Baris
          </Button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr>
                {['No','Nama Balita','Tgl Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Ortu',''].map(h => (
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {asiRows.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...tdSt, textAlign:'center', fontWeight:700 }}>{i+1}</td>
                  <td style={tdSt}><input value={r.namaBalita} onChange={e => setAsiRows(p => p.map((x,j) => j===i?{...x,namaBalita:e.target.value}:x))} style={{ ...txtIn }}/></td>
                  <input type="date" value={r.tglLahir} onChange={e => {
const tglLahir = e.target.value;
      const umurOtomatis = hitungUmurDariTglLahir(tglLahir);
      setAsiRows(p => p.map((x, j) =>
        j === i ? { ...x, tglLahir, umur: String(umurOtomatis) } : x
      ));
    }}
    style={{ ...txtIn, width:120 }}
/></td>
                  <td style={tdSt}><input type="number" value={r.umur} onChange={e => setAsiRows(p => p.map((x,j) => j===i?{...x,umur:e.target.value}:x))} style={{ ...numIn }}/></td>
                  {['e0','e1','e2','e3','e4','e5','e6'].map(e => (
                    <td key={e} style={{ ...tdSt, textAlign:'center' }}>
                      <input type="checkbox" checked={r[e]||false} onChange={ev => setAsiRows(p => p.map((x,j) => j===i?{...x,[e]:ev.target.checked}:x))}/>
                    </td>
                  ))}
                  <td style={tdSt}><input value={r.namaOrtu} onChange={e => setAsiRows(p => p.map((x,j) => j===i?{...x,namaOrtu:e.target.value}:x))} style={{ ...txtIn }}/></td>
                  <td style={tdSt}>
                    <button onClick={() => setAsiRows(p => p.filter((_,j) => j!==i))} style={{ background:'#FEF2F2', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#DC2626', fontSize:12 }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── IV. Formulir Pemantauan Pertumbuhan Balita ─────────── */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>IV. Formulir Pemantauan Pertumbuhan Balita</h3>
            <p style={{ margin:'4px 0 0', fontSize:11, color:'#9E9E9E' }}>Cari nama ibu/ortu → anak muncul otomatis dengan data bulan lalu</p>
          </div>
          <Button onClick={() => setShowAddBalita(true)}>➕ Tambah Balita</Button>
        </div>

        {/* Modal cari balita */}
        {showAddBalita && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={() => { setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null); }}>
            <div style={{ background:'#fff', borderRadius:20, width:520, maxHeight:'82vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Tambah Balita ke Laporan</h3>
                <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>Cari berdasarkan nama ibu / orang tua</p>
              </div>
              <div style={{ padding:'16px 24px', flex:1, overflowY:'auto' }}>
                <input placeholder="🔍 Ketik nama ibu..." value={searchOrtu} autoFocus
                  onChange={e => { setSearchOrtu(e.target.value); setSelectedOrtu(null); }}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:12 }}/>

                {!selectedOrtu && searchOrtu && ortuOptions.length > 0 && (
                  <div style={{ border:'1px solid #F0F0F0', borderRadius:10, overflow:'hidden' }}>
                    {ortuOptions.map((b, i) => (
                      <div key={i} onClick={() => setSelectedOrtu(b.namaIbu)} style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', gap:12 }}
                        onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                        onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                        <span style={{ fontSize:24 }}>👩</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{b.namaIbu}</div>
                          <div style={{ fontSize:11, color:'#9E9E9E' }}>{b.desa || b.namaPosyandu || '-'}</div>
                        </div>
                        <span style={{ marginLeft:'auto', fontSize:12, color:'#9E9E9E' }}>
                          {balitaList.filter(x => x.namaIbu === b.namaIbu).length} anak
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedOrtu && (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <button onClick={() => setSelectedOrtu(null)} style={{ background:'none', border:'none', color:'#2563EB', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>← Kembali</button>
                      <span style={{ fontSize:13, fontWeight:700, color:'#1B6B3A' }}>👩 {selectedOrtu}</span>
                    </div>
                    {anakDariOrtu.map(b => {
                      const umur  = hitungUmurBulan(b.tanggalLahir);
                      const last  = b.riwayat?.[b.riwayat.length - 1];
                      const sudah = pemantauanRows.find(r => r.balitaId === b.id);
                      return (
                        <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:12, background:'#F9FAFB', marginBottom:8, border:'1px solid #F0F0F0' }}>
                          <span style={{ fontSize:28 }}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:14 }}>{b.nama}</div>
                            <div style={{ fontSize:11, color:'#9E9E9E' }}>
                              {umur} bln • {b.jenisKelamin}
                              {last && ` • BB: ${last.bb||last.beratBadan}kg • TB: ${last.tb||last.tinggiBadan}cm`}
                            </div>
                          </div>
                          {sudah
                            ? <span style={{ fontSize:11, color:'#16A34A', fontWeight:700 }}>✅ Sudah ditambahkan</span>
                            : <Button size="sm" onClick={() => tambahBalita(b)}>+ Tambah</Button>
                          }
                        </div>
                      );
                    })}
                  </div>
                )}

                {searchOrtu && !selectedOrtu && ortuOptions.length === 0 && (
                  <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>🔍</div>
                    <div>Tidak ada data orang tua "{searchOrtu}"</div>
                  </div>
                )}
              </div>
              <div style={{ padding:'12px 24px', borderTop:'1px solid #F0F0F0', flexShrink:0 }}>
                <Button variant="ghost" onClick={() => { setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null); }}>Tutup</Button>
              </div>
            </div>
          </div>
        )}

        {pemantauanRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 24px', color:'#9E9E9E' }}>
            <div style={{ fontSize:52, marginBottom:12 }}>👶</div>
            <div style={{ fontSize:14, fontWeight:600 }}>Belum ada balita di laporan ini</div>
            <div style={{ fontSize:12, marginTop:4 }}>Klik "Tambah Balita" dan cari nama ibu</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, minWidth:1600 }}>
              <thead>
                <tr>
                  {[
                    'No','No KK','NIK','Anak Ke','Nama Anak','Tgl Lahir','L/P','Usia Kmln','BBL','PBL','UKA Lahir',
                    'Nama Ortu','NIK Ayah','No Tlp','Alamat','RT','RW',
                    'Tgl Ukur *','BB Baru *','TB/PB Baru *','LILA/LIKA',
                    'N/T/O/B',
                    'ASI Eksklusif\n(1=Ya 2=Tdk)',
                    'Vit A Feb\n(1=Ya 2=Tdk)',
                    'Vit A Ags\n(1=Ya 2=Tdk)',
                    'Buku KIA\n(1=Pny 2=Tdk)',
                    'Ket Perkembangan','PKAT','Catatan',''
                  ].map(h => <th key={h} style={{ ...thSt, fontSize:10 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {pemantauanRows.map((r, i) => {
                  const umur = hitungUmurBulan(r.tglLahir);
                  return (
                    <tr key={r.balitaId || i} style={{ background: i%2===0?'#fff':'#FAFAFA' }}>
                      <td style={{ ...tdSt, textAlign:'center', fontWeight:700 }}>{i+1}</td>
                      <td style={tdSt}><input value={r.noKK||''} onChange={e=>updateRow(i,'noKK',e.target.value)} style={{ ...txtIn, width:110 }}/></td>
                      <td style={tdSt}><input value={r.nik||''} onChange={e=>updateRow(i,'nik',e.target.value)} style={{ ...txtIn, width:110 }}/></td>
                      <td style={tdSt}><input type="number" value={r.anakKe||''} onChange={e=>updateRow(i,'anakKe',e.target.value)} style={{ ...numIn, width:40 }}/></td>
                      <td style={{ ...tdSt, fontWeight:700, whiteSpace:'nowrap' }}>{r.namaAnak}</td>
                      <td style={{ ...tdSt, whiteSpace:'nowrap' }}>{r.tglLahir ? formatTanggal(r.tglLahir) : '-'}</td>
                      <td style={{ ...tdSt, textAlign:'center', fontWeight:700 }}>{r.lp}</td>
                      <td style={tdSt}><input type="number" value={r.usiaKehamilanLahir||''} onChange={e=>updateRow(i,'usiaKehamilanLahir',e.target.value)} style={{ ...numIn }}/></td>
                      <td style={tdSt}><input type="number" step="0.01" value={r.bbl||''} onChange={e=>updateRow(i,'bbl',e.target.value)} style={{ ...numIn }}/></td>
                      <td style={tdSt}><input type="number" step="0.1" value={r.pbl||''} onChange={e=>updateRow(i,'pbl',e.target.value)} style={{ ...numIn }}/></td>
                      <td style={tdSt}><input type="number" step="0.1" value={r.ukaLahir||''} onChange={e=>updateRow(i,'ukaLahir',e.target.value)} style={{ ...numIn }}/></td>
                      <td style={{ ...tdSt, whiteSpace:'nowrap' }}>{r.namaOrtu}</td>
                      <td style={tdSt}><input value={r.nikAyah||''} onChange={e=>updateRow(i,'nikAyah',e.target.value)} style={{ ...txtIn, width:110 }}/></td>
                      <td style={tdSt}><input value={r.noTlp||''} onChange={e=>updateRow(i,'noTlp',e.target.value)} style={{ ...txtIn, width:100 }}/></td>
                      <td style={tdSt}><input value={r.alamat||''} onChange={e=>updateRow(i,'alamat',e.target.value)} style={{ ...txtIn, width:120 }}/></td>
                      <td style={tdSt}><input value={r.rt||''} onChange={e=>updateRow(i,'rt',e.target.value)} style={{ ...numIn, width:36 }}/></td>
                      <td style={tdSt}><input value={r.rw||''} onChange={e=>updateRow(i,'rw',e.target.value)} style={{ ...numIn, width:36 }}/></td>
                      {/* Kolom input baru bulan ini — highlight hijau */}
                      <td style={tdSt}><input type="date" value={r.tglUkurBaru||''} onChange={e=>updateRow(i,'tglUkurBaru',e.target.value)} style={{ ...txtIn, width:120, borderColor:'#16A34A' }}/></td>
                      <td style={tdSt}><input type="number" step="0.01" value={r.bbBaru||''} onChange={e=>updateRow(i,'bbBaru',e.target.value)} placeholder="kg" style={{ ...numIn, borderColor:'#16A34A', width:52 }}/></td>
                      <td style={tdSt}><input type="number" step="0.1" value={r.pbBaru||''} onChange={e=>updateRow(i,'pbBaru',e.target.value)} placeholder="cm" style={{ ...numIn, borderColor:'#16A34A', width:52 }}/></td>
                      <td style={tdSt}><input type="number" step="0.1" value={r.lila||''} onChange={e=>updateRow(i,'lila',e.target.value)} style={{ ...numIn }}/></td>
                      <td style={tdSt}>
                        <select value={r.statusNTO||''} onChange={e=>updateRow(i,'statusNTO',e.target.value)}
                          style={{ padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                          <option value="">-</option>
                          <option value="N">N</option>
                          <option value="T">T</option>
                          <option value="O">O</option>
                          <option value="B">B</option>
                        </select>
                      </td>
                      <td style={tdSt}>
                        <select value={r.asiEksklusif||''} onChange={e=>updateRow(i,'asiEksklusif',e.target.value)} style={{ padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                          <option value="">-</option><option value="1">1 (Ya)</option><option value="2">2 (Tidak)</option>
                        </select>
                      </td>
                      <td style={tdSt}>
                        <select value={r.vitAFeb||''} onChange={e=>updateRow(i,'vitAFeb',e.target.value)} style={{ padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                          <option value="">-</option><option value="1">1 (Ya)</option><option value="2">2 (Tidak)</option>
                        </select>
                      </td>
                      <td style={tdSt}>
                        <select value={r.vitAAgs||''} onChange={e=>updateRow(i,'vitAAgs',e.target.value)} style={{ padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                          <option value="">-</option><option value="1">1 (Ya)</option><option value="2">2 (Tidak)</option>
                        </select>
                      </td>
                      <td style={tdSt}>
                        <select value={r.bukuKIA||''} onChange={e=>updateRow(i,'bukuKIA',e.target.value)} style={{ padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                          <option value="">-</option><option value="1">1 (Punya)</option><option value="2">2 (Tidak)</option>
                        </select>
                      </td>
                      <td style={tdSt}>
                        <select value={r.ketPerkembangan||''} onChange={e=>updateRow(i,'ketPerkembangan',e.target.value)} style={{ padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff', minWidth:90 }}>
                          <option value="">-</option>
                          <option value="Sesuai">Sesuai</option>
                          <option value="Meragukan">Meragukan</option>
                          <option value="Penyimpangan">Penyimpangan</option>
                        </select>
                      </td>
                      <td style={tdSt}>
                        <select value={r.pkat||''} onChange={e=>updateRow(i,'pkat',e.target.value)} style={{ padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                          <option value="">-</option><option value="Ya">Ya</option><option value="Belum">Belum</option>
                        </select>
                      </td>
                      <td style={tdSt}><input value={r.catatan||''} onChange={e=>updateRow(i,'catatan',e.target.value)} placeholder="catatan..." style={{ ...txtIn, width:100 }}/></td>
                      <td style={tdSt}>
                        <button onClick={() => setPemantauanRows(p => p.filter((_,j) => j!==i))} style={{ background:'#FEF2F2', border:'none', borderRadius:6, padding:'5px 8px', cursor:'pointer', color:'#DC2626', fontSize:13 }}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pemantauanRows.length > 0 && (
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Button variant="ghost" onClick={handleSimpan} disabled={saving}>{saving?'Menyimpan...':'💾 Simpan'}</Button>
            <Button onClick={exportExcel}>📊 Export Excel</Button>
          </div>
        )}
      </Card>
    </div>
  );
}