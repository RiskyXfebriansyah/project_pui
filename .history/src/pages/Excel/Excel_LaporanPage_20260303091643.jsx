// ============================================================
//  ExcelLaporanPage.jsx — Export Excel untuk Laporan Bulanan
//  File terpisah dari LaporanPage.jsx
//
//  Usage di LaporanPage.jsx:
//    import { exportLaporanExcel } from './ExcelLaporanPage';
//    const fileName = await exportLaporanExcel({ info, kegiatan, asiRows, giziRows, pemRows });
// ============================================================

function fmtTgl(raw) {
  if (!raw) return '-';
  const d = new Date(raw);
  if (isNaN(d)) return String(raw);
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function num(v) {
  if (v === '' || v == null) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Gagal load library XLSX'));
    document.head.appendChild(script);
  });
}

// ══════════════════════════════════════════════════════════════
//  FUNGSI UTAMA
// ══════════════════════════════════════════════════════════════
export async function exportLaporanExcel({ info, kegiatan, asiRows, giziRows, pemRows }) {
  const XLSX = await loadXLSX();
  const wb   = XLSX.utils.book_new();

  // ════════════════════════════════════════════════════════════
  //  SHEET 1: Catatan Bulanan (Sec I, II, III, IV)
  // ════════════════════════════════════════════════════════════
  const s1 = [];

  s1.push(['CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU']);
  s1.push([`Posyandu: ${info.namaPosyandu || '-'}   |   Bulan: ${info.bulan || '-'} ${info.tahun || ''}`]);
  s1.push([]);

  // ── I. Informasi Umum ──────────────────────────────────────
  s1.push(['I. INFORMASI UMUM POSYANDU']);
  [
    ['Nama Posyandu',       info.namaPosyandu       || '-'],
    ['Dusun',               info.dusun              || '-'],
    ['Desa',                info.desa               || '-'],
    ['Petugas Lapangan',    info.petugasLapangan    || '-'],
    ['Jumlah Kader Aktif',  info.jumlahKader        || 0],
    ['Ketua Kader',         info.ketuaKader         || '-'],
    ['Tanggal Pelaksanaan', info.tanggalPelaksanaan || '-'],
    ['Tanggal Pencatatan',  info.tanggalPencatatan  || '-'],
  ].forEach(r => s1.push(r));
  s1.push([]);

  // ── II. Kegiatan Penimbangan ──────────────────────────────
  s1.push(['II. KEGIATAN PENIMBANGAN']);
  s1.push([
    'No', 'Keterangan', 'Kode',
    '0-5 bln L', '0-5 bln P',
    '6-11 bln L', '6-11 bln P',
    '12-23 bln L', '12-23 bln P',
    '24-60 bln L', '24-60 bln P',
    'Total L', 'Total P', 'Grand Total',
  ]);

  [
    ['01','Jumlah semua balita yang ada di kelompok penimbangan bulan ini','S',
      's_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60'],
    ['02','Jumlah balita yang terdaftar dan mempunyai KMS bulan ini','K',
      'k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60'],
    ['03','Jumlah balita yang naik berat badannya bulan ini','N',
      'n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60'],
    ['04','Jumlah balita yang tidak naik berat badannya bulan ini','T',
      't_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60'],
    ['05','Jumlah balita yang ditimbang bulan ini, tetapi tidak ditimbang bulan lalu','O',
      'o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60'],
    ['06','Jumlah balita yang baru pertama kali hadir di penimbangan bulan ini','B',
      'b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60'],
    ['07','Jumlah balita yang ditimbang bulan ini (03+04+05+06)','D',
      'd_L_0_5','d_P_0_5','d_L_6_11','d_P_6_11','d_L_12_23','d_P_12_23','d_L_24_60','d_P_24_60'],
    ['08','Jumlah balita yang tidak hadir di penimbangan bulan ini (02−07)','-',
      'm_L_0_5','m_P_0_5','m_L_6_11','m_P_6_11','m_L_12_23','m_P_12_23','m_L_24_60','m_P_24_60'],
    ['09','Jumlah balita yang ada di bawah garis merah (BGM)','A',
      'bgm_L_0_5','bgm_P_0_5','bgm_L_6_11','bgm_P_6_11','bgm_L_12_23','bgm_P_12_23','bgm_L_24_60','bgm_P_24_60'],
    ['10','Jumlah bayi mendapat vitamin A bulan Februari/Agustus','A',
      'vitAbayiFeb_L_0_5','vitAbayiFeb_P_0_5','vitAbayiFeb_L_6_11','vitAbayiFeb_P_6_11',
      'vitAbayiFeb_L_12_23','vitAbayiFeb_P_12_23','vitAbayiFeb_L_24_60','vitAbayiFeb_P_24_60'],
    ['11','Jumlah balita mendapat vitamin A bulan Februari/Agustus','A',
      'vitAbalitaFeb_L_0_5','vitAbalitaFeb_P_0_5','vitAbalitaFeb_L_6_11','vitAbalitaFeb_P_6_11',
      'vitAbalitaFeb_L_12_23','vitAbalitaFeb_P_12_23','vitAbalitaFeb_L_24_60','vitAbalitaFeb_P_24_60'],
    ['12','Jumlah bayi dengan ASI Eksklusif pada bulan ini','E',
      'asi_L_0_5','asi_P_0_5','asi_L_6_11','asi_P_6_11','asi_L_12_23','asi_P_12_23','asi_L_24_60','asi_P_24_60'],
  ].forEach(([no, label, kode, ...fields]) => {
    const vals   = fields.map(f => num(kegiatan[f]));
    const totalL = vals.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
    const totalP = vals.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
    s1.push([no, label, kode, ...vals, totalL, totalP, totalL + totalP]);
  });
  s1.push([]);

  // ── III. ASI Eksklusif ────────────────────────────────────
  s1.push(['III. PEMANTAUAN ASI EKSKLUSIF']);
  s1.push(['No','Nama Balita','Tanggal Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Orang Tua','Sumber']);
  if (asiRows.length === 0) {
    s1.push(['-','Belum ada data ASI Eksklusif']);
  } else {
    asiRows.forEach((r, i) => s1.push([
      i+1, r.namaBalita||'-', r.tglLahir?fmtTgl(r.tglLahir):'-', num(r.umurBulan),
      r.e0?'✓':'',r.e1?'✓':'',r.e2?'✓':'',r.e3?'✓':'',
      r.e4?'✓':'',r.e5?'✓':'',r.e6?'✓':'',
      r.namaOrtu||'-', r.balitaId?'Database':'Manual',
    ]));
  }
  s1.push([]);

  // ── IV. Gizi Buruk & Kurus ────────────────────────────────
  s1.push(['IV. PEMANTAUAN BALITA GIZI BURUK & KURUS']);
  s1.push(['No','Nama Balita','Tanggal Lahir','Umur (bln)','Nama Orang Tua','Pekerjaan','BB (kg)','TB (cm)','Sumber']);
  if (giziRows.length === 0) {
    s1.push(['-','Belum ada data gizi buruk & kurus']);
  } else {
    giziRows.forEach((r, i) => s1.push([
      i+1, r.namaBalita||'-', r.tglLahir?fmtTgl(r.tglLahir):'-',
      num(r.umurBulan), r.namaOrtu||'-', r.pekerjaan||'-',
      r.bb||'', r.tb||'', r.balitaId?'Database':'Manual',
    ]));
  }

  const ws1 = XLSX.utils.aoa_to_sheet(s1);
  ws1['!cols'] = [
    {wch:5},{wch:58},{wch:8},
    {wch:9},{wch:9},{wch:9},{wch:9},{wch:9},{wch:9},{wch:9},{wch:9},
    {wch:9},{wch:9},{wch:10},{wch:25},{wch:10},
  ];
  ws1['!merges'] = [
    {s:{r:0,c:0},e:{r:0,c:13}},
    {s:{r:1,c:0},e:{r:1,c:13}},
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Catatan Bulanan');

  // ════════════════════════════════════════════════════════════
  //  SHEET 2: Pemantauan Pertumbuhan (Sec V)
  // ════════════════════════════════════════════════════════════
  const s2 = [];
  s2.push(['V. FORMULIR PEMANTAUAN PERTUMBUHAN BALITA']);
  s2.push([`Posyandu: ${info.namaPosyandu||'-'}   |   Bulan: ${info.bulan||'-'} ${info.tahun||''}`]);
  s2.push([]);
  s2.push([
    'No','No KK','NIK Anak','Anak Ke','Nama Anak','Tgl Lahir','L/P',
    'Usia Kehamilan Saat Lahir (mgg)','BBL (kg)','PBL (cm)','UKA Lahir (cm)',
    'Nama Ibu','Nama Ayah','NIK Ayah','No Telp','Alamat','RT','RW',
    'Tgl Ukur Bulan Lalu','BB Bulan Lalu (kg)','TB Bulan Lalu (cm)',
    'Tgl Ukur Bulan Ini','BB Bulan Ini (kg)','TB/PB Bulan Ini (cm)',
    'LILA (cm)','LIKA (cm)',
    'Status N/T/O/B','ASI Eksklusif','Vit A Feb','Buku KIA',
    'Ket Perkembangan','PKAT',
    'Status Stunting','Status Gizi','Catatan',
  ]);

  if (pemRows.length === 0) {
    s2.push(['-','Belum ada data pemantauan pertumbuhan']);
  } else {
    pemRows.forEach((r, i) => {
      s2.push([
        i+1,
        r.noKK||'', r.nik||'', r.anakKe||'',
        r.namaAnak||'-',
        r.tglLahir ? fmtTgl(r.tglLahir) : '',
        r.lp||'',
        r.usiaKehamilanLahir||'',
        r.bbl||'', r.pbl||'', r.ukaLahir||'',
        r.namaIbu||r.namaOrtu||'',
        r.namaAyah||'', r.nikAyah||'', r.noTlp||'',
        r.alamat||'', r.rt||'', r.rw||'',
        // Bulan lalu
        (r._tglUkurLalu||r.tglUkur) ? fmtTgl(r._tglUkurLalu||r.tglUkur) : '',
        r._bbLalu||r.bb||'',
        r._tbLalu||r.pb||'',
        // Bulan baru
        r.tglUkurBaru||'', r.bbBaru||'', r.pbBaru||'',
        // Antro
        r.lila||'', r.lika||'',
        // Indikator
        r.statusNTO||'',
        r.asiEksklusif==='1'?'Ya':r.asiEksklusif==='2'?'Tidak':'',
        r.vitAFeb==='1'?'Ya':r.vitAFeb==='2'?'Tidak':'',
        r.bukuKIA==='1'?'Punya':r.bukuKIA==='2'?'Tidak':'',
        r.ketPerkembangan||'', r.pkat||'',
        // Status
        r._statusStunting||'', r._statusGizi||'',
        r.catatan||'',
      ]);
    });
  }

  const ws2 = XLSX.utils.aoa_to_sheet(s2);
  ws2['!cols'] = [
    {wch:5},{wch:16},{wch:18},{wch:7},{wch:22},{wch:12},{wch:5},
    {wch:12},{wch:9},{wch:9},{wch:9},
    {wch:20},{wch:20},{wch:18},{wch:14},{wch:22},{wch:5},{wch:5},
    {wch:14},{wch:12},{wch:12},
    {wch:14},{wch:12},{wch:14},
    {wch:9},{wch:9},
    {wch:10},{wch:12},{wch:9},{wch:10},
    {wch:16},{wch:8},
    {wch:14},{wch:12},{wch:20},
  ];
  ws2['!merges'] = [
    {s:{r:0,c:0},e:{r:0,c:34}},
    {s:{r:1,c:0},e:{r:1,c:34}},
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Pemantauan Pertumbuhan');

  // ════════════════════════════════════════════════════════════
  //  SHEET 3: Ringkasan
  // ════════════════════════════════════════════════════════════
  const sumL = (suffix) =>
    num(kegiatan[`s_L_${suffix}`]) + num(kegiatan[`s_P_${suffix}`]);

  const totalBalita =
    num(kegiatan.s_L_0_5)   + num(kegiatan.s_P_0_5)  +
    num(kegiatan.s_L_6_11)  + num(kegiatan.s_P_6_11) +
    num(kegiatan.s_L_12_23) + num(kegiatan.s_P_12_23)+
    num(kegiatan.s_L_24_60) + num(kegiatan.s_P_24_60);

  const s3 = [
    ['RINGKASAN LAPORAN BULANAN POSYANDU'],
    [`${info.namaPosyandu||'-'}  —  ${info.bulan||'-'} ${info.tahun||''}`],
    [],
    ['Indikator','Nilai'],
    ['Total Balita (semua kelompok)', totalBalita],
    ['Naik BB (N)',
      num(kegiatan.n_L_0_5)+num(kegiatan.n_P_0_5)+
      num(kegiatan.n_L_6_11)+num(kegiatan.n_P_6_11)+
      num(kegiatan.n_L_12_23)+num(kegiatan.n_P_12_23)+
      num(kegiatan.n_L_24_60)+num(kegiatan.n_P_24_60)],
    ['Tidak Naik BB (T)',
      num(kegiatan.t_L_0_5)+num(kegiatan.t_P_0_5)+
      num(kegiatan.t_L_6_11)+num(kegiatan.t_P_6_11)+
      num(kegiatan.t_L_12_23)+num(kegiatan.t_P_12_23)+
      num(kegiatan.t_L_24_60)+num(kegiatan.t_P_24_60)],
    ['Bawah Garis Merah (BGM)',
      num(kegiatan.bgm_L_0_5||0)+num(kegiatan.bgm_P_0_5||0)+
      num(kegiatan.bgm_L_6_11||0)+num(kegiatan.bgm_P_6_11||0)+
      num(kegiatan.bgm_L_12_23||0)+num(kegiatan.bgm_P_12_23||0)+
      num(kegiatan.bgm_L_24_60||0)+num(kegiatan.bgm_P_24_60||0)],
    [],
    ['Status Stunting dari Pemantauan', ''],
    ['— Normal',   pemRows.filter(r => r._statusStunting === 'Normal').length],
    ['— Risiko',   pemRows.filter(r => r._statusStunting === 'Risiko').length],
    ['— Stunting', pemRows.filter(r => r._statusStunting === 'Stunting').length],
    [],
    ['ASI Eksklusif dicatat',      asiRows.length],
    ['Gizi Buruk & Kurus dicatat', giziRows.length],
    [],
    ['Petugas Lapangan', info.petugasLapangan || '-'],
    ['Ketua Kader',      info.ketuaKader      || '-'],
    ['Tanggal Cetak',    fmtTgl(new Date().toISOString())],
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(s3);
  ws3['!cols'] = [{wch:38},{wch:20}];
  ws3['!merges'] = [
    {s:{r:0,c:0},e:{r:0,c:1}},
    {s:{r:1,c:0},e:{r:1,c:1}},
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Ringkasan');

  // ── Simpan file ─────────────────────────────────────────────
  const safe     = s => String(s||'').replace(/[/\\?*[\]]/g, '-');
  const fileName = `Laporan_${safe(info.namaPosyandu||'Posyandu')}_${safe(info.bulan||'Bulan')}_${safe(info.tahun||new Date().getFullYear())}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}