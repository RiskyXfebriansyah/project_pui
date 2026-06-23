// ============================================================
//  LaporanPage.jsx — FIXED
//  Perubahan vs versi sebelumnya:
//  - currentUser prop untuk auto-fill Nama Posyandu & Petugas Lapangan
//  - defaultInfo dipindah ke DALAM komponen agar bisa akses currentUser
//  - useEffect sync jika currentUser datang async
//  - Field mapping sesuai BalitaPage (namaIbu, noTelepon, dll)
//  - Load laporan: preserve _bbLalu/_tbLalu dari SP JOIN
//  - Export Excel: pakai data bbBaru/pbBaru prioritas vs bb/pb
//  - Counter linked balita di footer modal
// ============================================================

import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Button } from '../components/ui/Components';
import { formatTanggal, hitungUmurBulan } from '../utils/helpers';
import { LaporanAPI } from '../services/api';

function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success:'#16A34A', error:'#DC2626', info:'#2563EB' };
  const icons  = { success:'✅', error:'❌', info:'ℹ️' };
  return (
    <div style={{
      position:'fixed', top:24, left:'50%', transform:'translateX(-50%)',
      zIndex:99999, padding:'14px 28px', borderRadius:14,
      background: colors[toast.type]||'#1F2937', color:'#fff',
      fontWeight:700, fontSize:14, boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
      display:'flex', alignItems:'center', gap:10, fontFamily:'inherit',
    }}>
      {icons[toast.type]} {toast.message}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, msg) { setToast({ type, message:msg }); setTimeout(()=>setToast(null), 3500); }
  return { toast, showSuccess:m=>show('success',m), showError:m=>show('error',m), showInfo:m=>show('info',m) };
}

function Field({ label, value, onChange, type='text', placeholder, disabled, min }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:4 }}>{label}</label>}
      <input type={type} value={value||''} placeholder={placeholder} disabled={disabled} min={min}
        onChange={e=>onChange?.(e.target.value)}
        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E5E7EB',
          fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
          background:disabled?'#F9FAFB':'#fff', color:disabled?'#9E9E9E':'#1A1A1A' }}
        onFocus={e=>{ if(!disabled) e.target.style.borderColor='#1B6B3A'; }}
        onBlur={e=>e.target.style.borderColor='#E5E7EB'}
      />
    </div>
  );
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
  bawahGarisMerah:'',vitA_bayi_feb:'':,vitA_balita_feb:'',vitA_balita_ags:'',
  jumlahHamil:'',jumlahPersalinan:'',
});

// ── Props ──────────────────────────────────────────────────────
// currentUser : object dari useAuth() — { nama, posyandu, role, ... }
// balitaList  : array dari useBalita hook (sudah di-map ke camelCase)
export default function LaporanPage({ balitaList = [], currentUser = null }) {
  const { toast, showSuccess, showError, showInfo } = useToast();

  // ✅ defaultInfo di DALAM komponen — bisa akses currentUser dari props
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
  const [asiRows, setAsiRows]   = useState([
    { balitaId:null, namaBalita:'', tglLahir:'', umur:'', umurBulan:0,
      e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false, namaOrtu:'' }
  ]);
  const [pemantauanRows, setPemantauanRows] = useState([]);
  const [showAddBalita, setShowAddBalita]   = useState(false);
  const [searchOrtu, setSearchOrtu]         = useState('');
  const [selectedOrtu, setSelectedOrtu]     = useState(null);
  const [showKodeInfo, setShowKodeInfo]     = useState(false);

  // ✅ Sync auto-fill jika currentUser datang async (useAuth loading)
  useEffect(() => {
    if (currentUser) {
      setInfo(prev => ({
        ...prev,
        namaPosyandu:    prev.namaPosyandu    || currentUser.posyandu || '',
        petugasLapangan: prev.petugasLapangan || currentUser.nama     || '',
      }));
    }
  }, [currentUser]);

  // ── Search: bisa by nama anak ATAU nama ibu ──────────────────
  const ortuOptions = balitaList
    .filter(b => {
      const q = searchOrtu.toLowerCase();
      if (!q) return false;
      return (b.namaIbu||'').toLowerCase().includes(q)
          || (b.nama   ||'').toLowerCase().includes(q);
    })
    .reduce((acc, b) => {
      const key = b.namaIbu || b.nama;
      if (!acc.find(x => (x.namaIbu||x.nama) === key)) acc.push(b);
      return acc;
    }, []);

  const anakDariOrtu = selectedOrtu
    ? balitaList.filter(b => b.namaIbu === selectedOrtu)
    : [];

  // ── Load laporan dari DB ─────────────────────────────────────
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
            vitA_bayi_feb:k.vitA_Bayi_Feb||'':'||'',
            vitA_balita_feb:k.vitA_Balita_Feb||'',vitA_balita_ags:k.vitA_Balita_Ags||'',
            jumlahHamil:k.jumlahHamil||'',jumlahPersalinan:k.jumlahPersalinan||'',
          });
        }

        if (d.asiRows?.length) {
          setAsiRows(d.asiRows.map(r => ({
            balitaId:   r.balitaId   || null,
            namaBalita: r.namaBalita || r.NamaBalita || '',
            tglLahir:   r.tglLahir   || '',
            umur:       r.umur       || `${r.umurBulan||0} bln`,
            umurBulan:  r.umurBulan  || 0,
            e0:!!r.e0,e1:!!r.e1,e2:!!r.e2,e3:!!r.e3,e4:!!r.e4,e5:!!r.e5,e6:!!r.e6,
            namaOrtu:   r.namaOrtu   || r.NamaOrtu || '',
          })));
        }

        if (d.pemantauanRows?.length) {
          setPemantauanRows(d.pemantauanRows.map(r => ({
            balitaId:           r.balitaId           || null,
            noKK:               r.noKK               || '',
            nik:                r.nik                || '',
            anakKe:             r.anakKe             || '',
            namaAnak:           r.namaAnak           || '',
            tglLahir:           r.tglLahir           || '',
            lp:                 r.lp                 || '',
            usiaKehamilanLahir: r.usiaKehamilanLahir || '',
            bbl:r.bbl||'', pbl:r.pbl||'', ukaLahir:r.ukaLahir||'',
            namaOrtu:           r.namaOrtu           || '',
            nikAyah:            r.nikAyah            || '',
            noTlp:              r.noTlp              || '',
            alamat:             r.alamat             || '',
            rt:r.rt||'', rw:r.rw||'',
            tglUkur:            r.tglUkur            || '',
            bb:                 r.bb                 || '',
            pb:                 r.pb                 || '',
            tglUkurBaru: '', bbBaru: '', pbBaru: '',
            lila:               r.lila               || '',
            statusNTO:          r.statusNTO          || '',
            asiEksklusif:       r.asiEksklusif       || '',
            vitAFeb:            r.vitAFeb            || '',
            vitAAgs:            r.vitAAgs            || '',
            bukuKIA:            r.bukuKIA            || '',
            ketPerkembangan:    r.ketPerkembangan    || '',
            pkat:               r.pkat               || '',
            catatan:            '',
            _bbLalu:            r.bbLalu             || r.bb || '',
            _tbLalu:            r.tbLalu             || r.pb || '',
            _tglUkurLalu:       r.tglUkurLalu        || r.tglUkur || '',
            _balitaNama:        r.balitaNama         || r.namaAnak || '',
            _balitaNamaIbu:     r.balitaNamaIbu      || r.namaOrtu || '',
            _statusStunting:    r.statusStunting     || '',
            _statusGizi:        r.statusGizi         || '',
          })));
        }

        setIsSaved(true);
        showSuccess(`Laporan tanggal ${filterTanggal} berhasil dimuat!`);
      } else {
        showInfo('Tidak ada laporan untuk tanggal ini. Form dikosongkan untuk input baru.');
        setLaporanId(null);
        setInfo({ ...defaultInfo(), tanggalPencatatan: filterTanggal });
        setKegiatan(defaultKegiatan());
        setAsiRows([{ balitaId:null,namaBalita:'',tglLahir:'',umur:'',umurBulan:0,e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false,namaOrtu:'' }]);
        setPemantauanRows([]);
        setIsSaved(false);
      }
    } catch(err) { console.error(err); showError('Gagal memuat data. Cek koneksi server.'); }
    finally { setLoadingFilter(false); }
  }

  // ── Simpan ───────────────────────────────────────────────────
  async function handleSimpan() {
    if (!info.namaPosyandu || !info.tanggalPencatatan) {
      showError('Nama Posyandu dan Tanggal Pencatatan wajib diisi'); return;
    }
    setSaving(true);
    try {
      const res = await LaporanAPI.simpan({ info, kegiatan, asiRows, pemantauanRows });
      if (res?.status?.code === 200 || res?.status?.code === 201) {
        setLaporanId(res.data?.id || laporanId);
        setIsSaved(true);
        showSuccess('Laporan berhasil disimpan!');
      } else {
        showError(res?.status?.message || 'Gagal menyimpan laporan');
      }
    } catch { showError('Gagal terhubung ke server'); }
    finally { setSaving(false); }
  }

  // ── Tambah ke Section IV ─────────────────────────────────────
  function tambahBalita(balita) {
    if (pemantauanRows.find(r => r.balitaId === balita.id)) {
      showError(`${balita.nama} sudah ada di daftar`); return;
    }
    const riwayat  = balita.riwayat || [];
    const lastUkur = riwayat.length > 0 ? riwayat[riwayat.length-1] : null;
    const bbLalu   = balita.beratBadan      || lastUkur?.beratBadan  || lastUkur?.bb  || '';
    const tbLalu   = balita.tinggiBadan     || lastUkur?.tinggiBadan || lastUkur?.tb  || '';
    const tglLalu  = balita.tglUkurTerakhir || lastUkur?.tanggal     || lastUkur?.tglUkur || '';

    setPemantauanRows(prev => [...prev, {
      balitaId:           balita.id,
      noKK:               '',
      nik:                balita.nik           || '',
      anakKe:             '',
      namaAnak:           balita.nama          || '',
      tglLahir:           balita.tanggalLahir  || '',
      lp:                 balita.jenisKelamin === 'Laki-laki' ? 'L'
                        : balita.jenisKelamin === 'Perempuan'  ? 'P' : '',
      usiaKehamilanLahir: '',
      bbl:'', pbl:'', ukaLahir:'',
      namaOrtu:           balita.namaIbu       || '',
      nikAyah:            '',
      noTlp:              balita.noTelepon     || '',
      alamat:             balita.alamat        || '',
      rt:'', rw:'',
      tglUkur:            tglLalu,
      bb:                 bbLalu,
      pb:                 tbLalu,
      tglUkurBaru:        new Date().toISOString().split('T')[0],
      bbBaru:'', pbBaru:'', lila:'',
      statusNTO:'', asiEksklusif:'',
      vitAFeb:'', vitAAgs:'', bukuKIA:'',
      ketPerkembangan:'', pkat:'', catatan:'',
      _bbLalu:            bbLalu,
      _tbLalu:            tbLalu,
      _tglUkurLalu:       tglLalu,
      _balitaNama:        balita.nama          || '',
      _balitaNamaIbu:     balita.namaIbu       || '',
      _statusStunting:    balita.statusStunting|| '',
      _statusGizi:        balita.statusGizi    || '',
    }]);
    showSuccess(`✅ ${balita.nama} ditambahkan ke Section IV`);
  }

  // ── Tambah ke Section III ────────────────────────────────────
  function tambahAsiDariBalita(balita) {
    if (asiRows.find(r => r.balitaId === balita.id)) {
      showError(`${balita.nama} sudah ada di daftar ASI`); return;
    }
    const today   = new Date();
    const tgl     = balita.tanggalLahir ? new Date(balita.tanggalLahir) : null;
    let umurBulan = 0;
    if (tgl) {
      umurBulan = (today.getFullYear()-tgl.getFullYear())*12 + (today.getMonth()-tgl.getMonth());
      if (today.getDate() < tgl.getDate()) umurBulan--;
      if (umurBulan < 0) umurBulan = 0;
    }
    setAsiRows(prev => [...prev, {
      balitaId:   balita.id,
      namaBalita: balita.nama                        || '',
      tglLahir:   balita.tanggalLahir?.split('T')[0] || '',
      umur:       `${umurBulan} bln`,
      umurBulan,
      e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false,
      namaOrtu:   balita.namaIbu || '',
    }]);
    showSuccess(`✅ ${balita.nama} ditambahkan ke Section III (ASI)`);
  }

  function updateRow(idx, field, value) {
    setPemantauanRows(prev => prev.map((r,i) => i===idx ? {...r,[field]:value} : r));
  }

  // ── Export Excel ─────────────────────────────────────────────
  async function exportExcel() {
    if (!isSaved) { showError('Simpan laporan terlebih dahulu!'); return; }
    try {
      if (!window.XLSX) {
        await new Promise((res,rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          s.onload=res; s.onerror=rej; document.head.appendChild(s);
        });
      }
      const XLSX = window.XLSX;
      const wb   = XLSX.utils.book_new();

      const ws1 = XLSX.utils.aoa_to_sheet([
        ['CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU'],
        [`Posyandu: ${info.namaPosyandu}  •  Bulan: ${info.bulan} ${info.tahun}  •  Tgl Pelaksanaan: ${info.tanggalPelaksanaan}`],
        [],
        ['I. UMUM'],
        ['a. Posyandu', info.namaPosyandu],['b. Dusun', info.dusun],['c. Desa', info.desa],
        ['d. Petugas Lapangan', info.petugasLapangan],['e. Jumlah Kader Aktif', info.jumlahKader],
        [],
        ['II. KEGIATAN PENIMBANGAN','0-5 bln L','0-5 bln P','6-11 bln L','6-11 bln P','12-23 bln L','12-23 bln P','24-60 bln L','24-60 bln P'],
        ['(S) Semua balita',           kegiatan.s_L_0_5,kegiatan.s_P_0_5,kegiatan.s_L_6_11,kegiatan.s_P_6_11,kegiatan.s_L_12_23,kegiatan.s_P_12_23,kegiatan.s_L_24_60,kegiatan.s_P_24_60],
        ['(K) Terdaftar KMS',          kegiatan.k_L_0_5,kegiatan.k_P_0_5,kegiatan.k_L_6_11,kegiatan.k_P_6_11,kegiatan.k_L_12_23,kegiatan.k_P_12_23,kegiatan.k_L_24_60,kegiatan.k_P_24_60],
        ['(N) Naik BB',                kegiatan.n_L_0_5,kegiatan.n_P_0_5,kegiatan.n_L_6_11,kegiatan.n_P_6_11,kegiatan.n_L_12_23,kegiatan.n_P_12_23,kegiatan.n_L_24_60,kegiatan.n_P_24_60],
        ['(T) Tidak naik BB',          kegiatan.t_L_0_5,kegiatan.t_P_0_5,kegiatan.t_L_6_11,kegiatan.t_P_6_11,kegiatan.t_L_12_23,kegiatan.t_P_12_23,kegiatan.t_L_24_60,kegiatan.t_P_24_60],
        ['(O) Ditimbang tdk bln lalu', kegiatan.o_L_0_5,kegiatan.o_P_0_5,kegiatan.o_L_6_11,kegiatan.o_P_6_11,kegiatan.o_L_12_23,kegiatan.o_P_12_23,kegiatan.o_L_24_60,kegiatan.o_P_24_60],
        ['(B) Pertama hadir',          kegiatan.b_L_0_5,kegiatan.b_P_0_5,kegiatan.b_L_6_11,kegiatan.b_P_6_11,kegiatan.b_L_12_23,kegiatan.b_P_12_23,kegiatan.b_L_24_60,kegiatan.b_P_24_60],
        [],
        ['BGM',kegiatan.bawahGarisMerah,'Vit A Bayi Feb',kegiatan.vitA_bayi_feb,'Vit A Bayi Ags',kegiata','Vit A Balita Feb',kegiatan.vitA_balita_feb,'Vit A Balita Ags',kegiatan.vitA_balita_ags],
        ['Ibu Hamil',kegiatan.jumlahHamil,'Persalinan',kegiatan.jumlahPersalinan],
        [],
        ['III. PEMANTAUAN ASI EKSKLUSIF'],
        ['No','Nama Balita','Tgl Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Ortu','Linked?'],
        ...asiRows.map((r,i) => [
          i+1, r.namaBalita, r.tglLahir, r.umurBulan,
          r.e0?'✓':'',r.e1?'✓':'',r.e2?'✓':'',r.e3?'✓':'',
          r.e4?'✓':'',r.e5?'✓':'',r.e6?'✓':'',
          r.namaOrtu, r.balitaId ? `✅ ID:${r.balitaId}` : 'Manual',
        ]),
        [],['Tgl Pencatatan',info.tanggalPencatatan,'Ketua Kader',info.ketuaKader],
      ]);
      ws1['!cols'] = [{wch:40},...Array(8).fill({wch:10})];
      XLSX.utils.book_append_sheet(wb, ws1, 'Catatan Bulanan');

      const ws2 = XLSX.utils.aoa_to_sheet([
        ['FORMULIR PEMANTAUAN PERTUMBUHAN BALITA'],
        [`Posyandu: ${info.namaPosyandu}  •  Bulan: ${info.bulan} ${info.tahun}`],
        [],
        ['No','No KK','NIK','Anak Ke','Nama Anak','Tgl Lahir','L/P',
         'Usia Kmln','BBL','PBL','UKA',
         'Nama Ortu','NIK Ayah','No Tlp','Alamat','RT','RW',
         'Tgl Ukur','BB (kg)','TB/PB (cm)','LILA',
         'N/T/O/B','ASI','VitA Feb','VitA Ags','Buku KIA','Ket Perkembangan','PKAT',
         'Linked Balita?','Status Stunting'],
        ...pemantauanRows.map((r,i) => [
          i+1, r.noKK, r.nik, r.anakKe, r.namaAnak,
          r.tglLahir ? formatTanggal(r.tglLahir) : '',
          r.lp, r.usiaKehamilanLahir, r.bbl, r.pbl, r.ukaLahir,
          r.namaOrtu, r.nikAyah, r.noTlp, r.alamat, r.rt, r.rw,
          r.tglUkurBaru || r.tglUkur,
          r.bbBaru      || r.bb,
          r.pbBaru      || r.pb,
          r.lila, r.statusNTO, r.asiEksklusif,
          r.vitAFeb, r.vitAAgs, r.bukuKIA, r.ketPerkembangan, r.pkat,
          r.balitaId ? `✅ ID:${r.balitaId}` : 'Manual',
          r._statusStunting || '',
        ]),
      ]);
      ws2['!cols'] = Array(30).fill({wch:11});
      ws2['!cols'][4]={wch:22};ws2['!cols'][11]={wch:22};ws2['!cols'][14]={wch:20};
      XLSX.utils.book_append_sheet(wb, ws2, 'Pemantauan Pertumbuhan');

      XLSX.writeFile(wb, `Laporan_${info.namaPosyandu||'Posyandu'}_${info.bulan}_${info.tahun}.xlsx`);
      showSuccess('File Excel berhasil diunduh!');
    } catch(err) { console.error(err); showError('Gagal export Excel'); }
  }

  // ── Styles ───────────────────────────────────────────────────
  const thSt = { padding:'8px 6px', background:'#F0FDF4', fontSize:10, fontWeight:700, color:'#15803D', borderBottom:'2px solid #BBF7D0', whiteSpace:'nowrap', textAlign:'center', position:'sticky', top:0 };
  const tdSt = { padding:'4px 4px', borderBottom:'1px solid #F0F0F0', verticalAlign:'middle' };
  const numIn = { padding:'5px 4px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none', width:48, textAlign:'center', background:'#fff' };
  const txtIn = { padding:'6px 8px', border:'1.5px solid #E5E7EB', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', background:'#fff' };
  const selSt = { padding:'5px 6px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:11, fontFamily:'inherit', outline:'none', background:'#fff' };

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
          <Button variant={saving?'ghost':'primary'} onClick={handleSimpan} disabled={saving}>
            {saving?'⏳ Menyimpan...':'💾 Simpan'}
          </Button>
          <div style={{ position:'relative' }}>
            <button onClick={exportExcel} style={{
              padding:'8px 16px', background:isSaved?'#1B6B3A':'#9E9E9E', color:'#fff',
              border:'none', borderRadius:8, cursor:isSaved?'pointer':'not-allowed',
              fontFamily:'inherit', fontWeight:700, fontSize:13
            }}>📊 Export Excel</button>
            {!isSaved && <div style={{ position:'absolute', right:0, top:'110%', background:'#1F2937', color:'#fff', padding:'6px 10px', borderRadius:8, fontSize:11, whiteSpace:'nowrap', zIndex:100 }}>Simpan dulu baru bisa export</div>}
          </div>
        </div>
      </div>

      {/* Info auto-fill banner */}
      {currentUser && (
        <div style={{ background:'#F0FDF4', border:'1.5px solid #BBF7D0', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#15803D', display:'flex', alignItems:'center', gap:8 }}>
          <span>✨</span>
          <span>
            Nama Posyandu & Petugas Lapangan diisi otomatis dari akun <strong>{currentUser.nama}</strong> — bisa diedit manual jika perlu.
          </span>
        </div>
      )}

      {/* Filter Tanggal */}
      <div style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ fontSize:20 }}>🔍</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#1D4ED8', marginBottom:2 }}>Muat Data Laporan Sebelumnya</div>
          <div style={{ fontSize:11, color:'#60A5FA' }}>Pilih tanggal → data laporan dimuat dari database termasuk data balita yang ter-link</div>
        </div>
        <input type="date" value={filterTanggal} onChange={e=>setFilterTanggal(e.target.value)}
          style={{ padding:'9px 14px', borderRadius:8, border:'1.5px solid #93C5FD', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}/>
        <Button onClick={handleFilterTanggal} disabled={loadingFilter}>
          {loadingFilter?'⏳ Memuat...':'📂 Muat Data'}
        </Button>
      </div>

      {/* I. Info Umum */}
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

      {/* II. Kegiatan Penimbangan */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>II. Kegiatan Penimbangan</h3>
          <button onClick={()=>setShowKodeInfo(v=>!v)} style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12, color:'#16A34A', fontFamily:'inherit', fontWeight:600 }}>
            {showKodeInfo?'▲ Sembunyikan':'📖 Keterangan Kode'}
          </button>
        </div>
        {showKodeInfo && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            {Object.entries(KODE).map(([k,v]) => (
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
                <th style={{ ...thSt, textAlign:'left', width:220, background:'#F9FAFB', color:'#6B7280' }}>Kegiatan</th>
                {['0-5L','0-5P','6-11L','6-11P','12-23L','12-23P','24-60L','24-60P'].map(h=>(
                  <th key={h} style={{ ...thSt, minWidth:56 }}>{h.replace('L',' L').replace('P',' P')} bln</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['(S) Semua balita',             ['s_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60'], KODE.S.w],
                ['(K) Terdaftar KMS',            ['k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60'], KODE.K.w],
                ['(N) Naik berat badan',         ['n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60'], KODE.N.w],
                ['(T) Tidak naik BB',            ['t_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60'], KODE.T.w],
                ['(O) Ditimbang, tdk bln lalu',  ['o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60'], KODE.O.w],
                ['(B) Pertama kali hadir',       ['b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60'], KODE.B.w],
              ].map(([label, fields, color]) => (
                <tr key={label}>
                  <td style={{ ...tdSt, paddingLeft:10, fontWeight:600, color }}>{label}</td>
                  {fields.map(f => (
                    <td key={f} style={{ ...tdSt, textAlign:'center' }}>
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
          <Field label="Vit A Bayi — Ags" type="number" min="0" value={kegiata'} onChange={v=>setKegiatan(p=>({...':v}))}/>
          <Field label="Vit A Balita — Feb" type="number" min="0" value={kegiatan.vitA_balita_feb} onChange={v=>setKegiatan(p=>({...p,vitA_balita_feb:v}))}/>
          <Field label="Vit A Balita — Ags" type="number" min="0" value={kegiatan.vitA_balita_ags} onChange={v=>setKegiatan(p=>({...p,vitA_balita_ags:v}))}/>
          <Field label="Ibu Hamil" type="number" min="0" value={kegiatan.jumlahHamil} onChange={v=>setKegiatan(p=>({...p,jumlahHamil:v}))}/>
          <Field label="Jumlah Persalinan" type="number" min="0" value={kegiatan.jumlahPersalinan} onChange={v=>setKegiatan(p=>({...p,jumlahPersalinan:v}))}/>
        </div>
      </Card>

      {/* III. ASI Eksklusif */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>III. Pemantauan ASI Eksklusif</h3>
          <Button size="sm" onClick={()=>setAsiRows(p=>[...p,{ balitaId:null,namaBalita:'',tglLahir:'',umur:'',umurBulan:0,e0:false,e1:false,e2:false,e3:false,e4:false,e5:false,e6:false,namaOrtu:'' }])}>
            ➕ Baris Manual
          </Button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr>
                {['No','Nama Balita','Tgl Lahir','Umur','E0','E1','E2','E3','E4','E5','E6','Nama Ortu',''].map(h=>(
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {asiRows.map((r,i) => (
                <tr key={i} style={{ background:r.balitaId?'#F0FDF4':'#fff' }}>
                  <td style={{ ...tdSt, textAlign:'center', fontWeight:700 }}>
                    {i+1}
                    {r.balitaId && <div style={{ fontSize:8, color:'#16A34A' }}>🔗</div>}
                  </td>
                  <td style={tdSt}><input value={r.namaBalita} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,namaBalita:e.target.value}:x))} style={txtIn}/></td>
                  <td style={tdSt}><input type="date" value={r.tglLahir} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,tglLahir:e.target.value}:x))} style={{ ...txtIn, width:120 }}/></td>
                  <td style={tdSt}><input type="number" value={r.umurBulan||''} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,umurBulan:parseInt(e.target.value)||0,umur:e.target.value+' bln'}:x))} style={numIn}/></td>
                  {['e0','e1','e2','e3','e4','e5','e6'].map(e=>(
                    <td key={e} style={{ ...tdSt, textAlign:'center' }}>
                      <input type="checkbox" checked={r[e]||false} onChange={ev=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,[e]:ev.target.checked}:x))}/>
                    </td>
                  ))}
                  <td style={tdSt}><input value={r.namaOrtu} onChange={e=>setAsiRows(p=>p.map((x,j)=>j===i?{...x,namaOrtu:e.target.value}:x))} style={txtIn}/></td>
                  <td style={tdSt}>
                    <button onClick={()=>setAsiRows(p=>p.filter((_,j)=>j!==i))} style={{ background:'#FEF2F2', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#DC2626', fontSize:12 }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* IV. Pemantauan Pertumbuhan */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>IV. Formulir Pemantauan Pertumbuhan Balita</h3>
            <p style={{ margin:'4px 0 0', fontSize:11, color:'#9E9E9E' }}>
              🔗 Baris hijau = ter-link ke database balita • 🔵 Biru = data bulan lalu • 🟡 Kuning = input bulan ini
            </p>
          </div>
          <Button onClick={()=>setShowAddBalita(true)}>➕ Tambah Balita</Button>
        </div>

        {/* Modal Tambah Balita */}
        {showAddBalita && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={()=>{ setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null); }}>
            <div style={{ background:'#fff', borderRadius:20, width:580, maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}
              onClick={e=>e.stopPropagation()}>

              <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Tambah Balita ke Laporan</h3>
                <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>Cari nama anak atau nama ibu — data & FK ter-link ke database balita</p>
              </div>

              <div style={{ padding:'16px 24px', flex:1, overflowY:'auto' }}>
                <input placeholder="🔍 Ketik nama anak atau nama ibu..." value={searchOrtu} autoFocus
                  onChange={e=>{ setSearchOrtu(e.target.value); setSelectedOrtu(null); }}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:12 }}/>

                {!selectedOrtu && searchOrtu && ortuOptions.length > 0 && (
                  <div style={{ border:'1px solid #F0F0F0', borderRadius:10, overflow:'hidden' }}>
                    {ortuOptions.map((b,i) => (
                      <div key={i} onClick={()=>setSelectedOrtu(b.namaIbu)}
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

                {selectedOrtu && (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <button onClick={()=>setSelectedOrtu(null)} style={{ background:'none', border:'none', color:'#2563EB', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>← Kembali</button>
                      <span style={{ fontSize:13, fontWeight:700, color:'#1B6B3A' }}>👩 {selectedOrtu}</span>
                      <span style={{ fontSize:11, color:'#9E9E9E' }}>({anakDariOrtu.length} anak)</span>
                    </div>
                    {anakDariOrtu.map(b => {
                      const umur    = hitungUmurBulan(b.tanggalLahir);
                      const sudahIV = pemantauanRows.find(r=>r.balitaId===b.id);
                      const sudahIII= asiRows.find(r=>r.balitaId===b.id);
                      return (
                        <div key={b.id} style={{ padding:'14px', borderRadius:12, background:'#F9FAFB', marginBottom:10, border:'1px solid #E5E7EB' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                            <div style={{ width:40, height:40, borderRadius:'50%', background:b.jenisKelamin==='Laki-laki'?'#EFF6FF':'#FDF2F8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                              {b.jenisKelamin==='Laki-laki'?'👦':'👧'}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:700, fontSize:14 }}>{b.nama}</div>
                              <div style={{ fontSize:11, color:'#9E9E9E' }}>
                                {umur} bln • {b.jenisKelamin}{b.nik?` • NIK: ${b.nik}`:''}
                              </div>
                              {(b.beratBadan||b.tinggiBadan) ? (
                                <div style={{ fontSize:11, color:'#16A34A', marginTop:3, fontWeight:600 }}>
                                  📊 Ukur terakhir: BB {b.beratBadan}kg • TB {b.tinggiBadan}cm
                                  {b.tglUkurTerakhir?` (${b.tglUkurTerakhir.split('T')[0]})`:''}
                                </div>
                              ) : (
                                <div style={{ fontSize:11, color:'#D97706', marginTop:3 }}>⚠️ Belum ada data ukuran</div>
                              )}
                              {b.statusStunting && (
                                <div style={{ fontSize:10, color:'#6B7280', marginTop:2 }}>
                                  Status: <strong>{b.statusStunting}</strong>{b.statusGizi?` • Gizi: ${b.statusGizi}`:''}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            {sudahIV ? (
                              <span style={{ fontSize:11, color:'#16A34A', fontWeight:700, padding:'6px 12px', background:'#F0FDF4', borderRadius:8, border:'1px solid #BBF7D0' }}>✅ Ada di Sec. IV</span>
                            ) : (
                              <button onClick={()=>tambahBalita(b)} style={{ padding:'7px 14px', background:'#1B6B3A', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>
                                + Sec. IV (Timbang)
                              </button>
                            )}
                            {umur<=12 && (sudahIII ? (
                              <span style={{ fontSize:11, color:'#2563EB', fontWeight:700, padding:'6px 12px', background:'#EFF6FF', borderRadius:8, border:'1px solid #BFDBFE' }}>✅ Ada di Sec. III ASI</span>
                            ) : (
                              <button onClick={()=>tambahAsiDariBalita(b)} style={{ padding:'7px 14px', background:'#2563EB', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>
                                + Sec. III (ASI)
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {searchOrtu && !selectedOrtu && ortuOptions.length===0 && (
                  <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>🔍</div>
                    <div>Tidak ada hasil untuk "{searchOrtu}"</div>
                  </div>
                )}
                {!searchOrtu && (
                  <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>👆</div>
                    <div style={{ fontSize:13 }}>Ketik nama anak atau ibu untuk mencari</div>
                  </div>
                )}
              </div>

              <div style={{ padding:'12px 24px', borderTop:'1px solid #F0F0F0', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'#9E9E9E' }}>
                  🔗 {pemantauanRows.filter(r=>r.balitaId).length}/{pemantauanRows.length} Sec.IV linked •{' '}
                  {asiRows.filter(r=>r.balitaId).length}/{asiRows.length} Sec.III linked
                </span>
                <button onClick={()=>{setShowAddBalita(false);setSearchOrtu('');setSelectedOrtu(null);}}
                  style={{ padding:'8px 18px', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {pemantauanRows.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 24px', color:'#9E9E9E' }}>
            <div style={{ fontSize:52, marginBottom:12 }}>👶</div>
            <div style={{ fontSize:14, fontWeight:600 }}>Belum ada balita di laporan ini</div>
            <div style={{ fontSize:12, marginTop:4 }}>Klik "Tambah Balita" → cari nama anak atau ibu → data otomatis ter-link ke database</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, minWidth:1900 }}>
              <thead>
                <tr>
                  {[
                    {l:'No',       bg:thSt.background}, {l:'No KK',    bg:thSt.background},
                    {l:'NIK',      bg:thSt.background}, {l:'Anak Ke',  bg:thSt.background},
                    {l:'Nama',     bg:thSt.background}, {l:'Tgl Lahir',bg:thSt.background},
                    {l:'L/P',      bg:thSt.background}, {l:'Usia Kmln',bg:thSt.background},
                    {l:'BBL',      bg:thSt.background}, {l:'PBL',      bg:thSt.background},
                    {l:'UKA',      bg:thSt.background}, {l:'Nama Ortu',bg:thSt.background},
                    {l:'NIK Ayah', bg:thSt.background}, {l:'No Tlp',   bg:thSt.background},
                    {l:'Alamat',   bg:thSt.background}, {l:'RT',       bg:thSt.background},
                    {l:'RW',       bg:thSt.background},
                    {l:'Tgl Ukur Lalu', bg:'#EFF6FF', c:'#1D4ED8'},
                    {l:'BB Lalu',       bg:'#EFF6FF', c:'#1D4ED8'},
                    {l:'TB Lalu',       bg:'#EFF6FF', c:'#1D4ED8'},
                    {l:'Tgl Ukur *',    bg:'#FFFDE7', c:'#B45309'},
                    {l:'BB Baru *',     bg:'#FFFDE7', c:'#B45309'},
                    {l:'TB/PB Baru *',  bg:'#FFFDE7', c:'#B45309'},
                    {l:'LILA',     bg:thSt.background},
                    {l:'N/T/O/B',  bg:thSt.background}, {l:'ASI',      bg:thSt.background},
                    {l:'VitA Feb', bg:thSt.background}, {l:'VitA Ags', bg:thSt.background},
                    {l:'Buku KIA', bg:thSt.background}, {l:'Ket Perkembangan',bg:thSt.background},
                    {l:'PKAT',     bg:thSt.background}, {l:'',         bg:thSt.background},
                  ].map((h,i) => (
                    <th key={i} style={{ ...thSt, background:h.bg||thSt.background, color:h.c||thSt.color, fontSize:9 }}>{h.l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pemantauanRows.map((r,i) => (
                  <tr key={r.balitaId||i} style={{ background:r.balitaId?(i%2===0?'#F0FDF4':'#E8F8EF'):(i%2===0?'#fff':'#FAFAFA') }}>
                    <td style={{ ...tdSt, textAlign:'center', fontWeight:700 }}>
                      {i+1}
                      {r.balitaId && <div style={{ fontSize:8, color:'#16A34A' }}>🔗</div>}
                    </td>
                    <td style={tdSt}><input value={r.noKK||''} onChange={e=>updateRow(i,'noKK',e.target.value)} style={{ ...txtIn, width:100 }}/></td>
                    <td style={tdSt}><input value={r.nik||''} onChange={e=>updateRow(i,'nik',e.target.value)} style={{ ...txtIn, width:110 }}/></td>
                    <td style={tdSt}><input type="number" value={r.anakKe||''} onChange={e=>updateRow(i,'anakKe',e.target.value)} style={{ ...numIn, width:36 }}/></td>
                    <td style={{ ...tdSt, fontWeight:700, whiteSpace:'nowrap', minWidth:120 }}>{r.namaAnak}</td>
                    <td style={{ ...tdSt, whiteSpace:'nowrap', fontSize:10 }}>{r.tglLahir?formatTanggal(r.tglLahir):'-'}</td>
                    <td style={{ ...tdSt, textAlign:'center', fontWeight:700, color:r.lp==='L'?'#2563EB':'#DB2777' }}>{r.lp}</td>
                    <td style={tdSt}><input type="number" value={r.usiaKehamilanLahir||''} onChange={e=>updateRow(i,'usiaKehamilanLahir',e.target.value)} style={numIn}/></td>
                    <td style={tdSt}><input type="number" step="0.01" value={r.bbl||''} onChange={e=>updateRow(i,'bbl',e.target.value)} style={numIn}/></td>
                    <td style={tdSt}><input type="number" step="0.1" value={r.pbl||''} onChange={e=>updateRow(i,'pbl',e.target.value)} style={numIn}/></td>
                    <td style={tdSt}><input type="number" step="0.1" value={r.ukaLahir||''} onChange={e=>updateRow(i,'ukaLahir',e.target.value)} style={numIn}/></td>
                    <td style={{ ...tdSt, whiteSpace:'nowrap', fontSize:10, minWidth:100 }}>{r.namaOrtu}</td>
                    <td style={tdSt}><input value={r.nikAyah||''} onChange={e=>updateRow(i,'nikAyah',e.target.value)} style={{ ...txtIn, width:100 }}/></td>
                    <td style={tdSt}><input value={r.noTlp||''} onChange={e=>updateRow(i,'noTlp',e.target.value)} style={{ ...txtIn, width:90 }}/></td>
                    <td style={tdSt}><input value={r.alamat||''} onChange={e=>updateRow(i,'alamat',e.target.value)} style={{ ...txtIn, width:110 }}/></td>
                    <td style={tdSt}><input value={r.rt||''} onChange={e=>updateRow(i,'rt',e.target.value)} style={{ ...numIn, width:34 }}/></td>
                    <td style={tdSt}><input value={r.rw||''} onChange={e=>updateRow(i,'rw',e.target.value)} style={{ ...numIn, width:34 }}/></td>
                    <td style={{ ...tdSt, background:'#EFF6FF', textAlign:'center', fontSize:10, color:'#6B7280', whiteSpace:'nowrap' }}>
                      {r._tglUkurLalu||r.tglUkur||'-'}
                    </td>
                    <td style={{ ...tdSt, background:'#EFF6FF', textAlign:'center', fontWeight:700, color:'#1D4ED8' }}>
                      {r._bbLalu||r.bb||'-'}
                    </td>
                    <td style={{ ...tdSt, background:'#EFF6FF', textAlign:'center', fontWeight:700, color:'#1D4ED8' }}>
                      {r._tbLalu||r.pb||'-'}
                    </td>
                    <td style={{ ...tdSt, background:'#FFFDE7' }}>
                      <input type="date" value={r.tglUkurBaru||''} onChange={e=>updateRow(i,'tglUkurBaru',e.target.value)} style={{ ...txtIn, width:120, borderColor:'#D97706' }}/>
                    </td>
                    <td style={{ ...tdSt, background:'#FFFDE7' }}>
                      <input type="number" step="0.01" value={r.bbBaru||''} onChange={e=>updateRow(i,'bbBaru',e.target.value)} placeholder="kg" style={{ ...numIn, borderColor:'#D97706', width:52 }}/>
                    </td>
                    <td style={{ ...tdSt, background:'#FFFDE7' }}>
                      <input type="number" step="0.1" value={r.pbBaru||''} onChange={e=>updateRow(i,'pbBaru',e.target.value)} placeholder="cm" style={{ ...numIn, borderColor:'#D97706', width:52 }}/>
                    </td>
                    <td style={tdSt}><input type="number" step="0.1" value={r.lila||''} onChange={e=>updateRow(i,'lila',e.target.value)} style={numIn}/></td>
                    <td style={tdSt}>
                      <select value={r.statusNTO||''} onChange={e=>updateRow(i,'statusNTO',e.target.value)} style={selSt}>
                        <option value="">-</option>
                        <option value="N">N</option><option value="T">T</option>
                        <option value="O">O</option><option value="B">B</option>
                      </select>
                    </td>
                    <td style={tdSt}>
                      <select value={r.asiEksklusif||''} onChange={e=>updateRow(i,'asiEksklusif',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={tdSt}>
                      <select value={r.vitAFeb||''} onChange={e=>updateRow(i,'vitAFeb',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={tdSt}>
                      <select value={r.vitAAgs||''} onChange={e=>updateRow(i,'vitAAgs',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Ya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={tdSt}>
                      <select value={r.bukuKIA||''} onChange={e=>updateRow(i,'bukuKIA',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="1">Punya</option><option value="2">Tidak</option>
                      </select>
                    </td>
                    <td style={tdSt}>
                      <select value={r.ketPerkembangan||''} onChange={e=>updateRow(i,'ketPerkembangan',e.target.value)} style={{ ...selSt, minWidth:95 }}>
                        <option value="">-</option>
                        <option value="Sesuai">Sesuai</option>
                        <option value="Meragukan">Meragukan</option>
                        <option value="Penyimpangan">Penyimpangan</option>
                      </select>
                    </td>
                    <td style={tdSt}>
                      <select value={r.pkat||''} onChange={e=>updateRow(i,'pkat',e.target.value)} style={selSt}>
                        <option value="">-</option><option value="Ya">Ya</option><option value="Belum">Belum</option>
                      </select>
                    </td>
                    <td style={tdSt}>
                      <button onClick={()=>setPemantauanRows(p=>p.filter((_,j)=>j!==i))}
                        style={{ background:'#FEF2F2', border:'none', borderRadius:6, padding:'5px 8px', cursor:'pointer', color:'#DC2626', fontSize:13 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pemantauanRows.length>0 && (
          <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Button variant="ghost" onClick={handleSimpan} disabled={saving}>{saving?'Menyimpan...':'💾 Simpan'}</Button>
            <Button onClick={exportExcel}>📊 Export Excel</Button>
          </div>
        )}
      </Card>
    </div>
  );
}