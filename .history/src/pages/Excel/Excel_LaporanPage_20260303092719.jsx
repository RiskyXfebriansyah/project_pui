// ============================================================
//  ExcelLaporanPage.jsx — Export Excel untuk Laporan Bulanan
//  Formatted version matching official Posyandu report format
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
    // Use xlsx-js-style for cell-level styling support
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => {
      // Fallback to standard xlsx
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s2.onload  = () => resolve(window.XLSX);
      s2.onerror = () => reject(new Error('Gagal load library XLSX'));
      document.head.appendChild(s2);
    };
    document.head.appendChild(script);
  });
}

// ─── Style helpers ────────────────────────────────────────────
const DARK_GREEN  = '1F5C3A';
const LIGHT_GREEN = 'C6EFCE';
const MED_GREEN   = '4CAF50';
const HEADER_BG   = '2E7D32';
const ALT_ROW     = 'F1F8E9';
const WHITE       = 'FFFFFF';
const BORDER_COLOR= '388E3C';

function border(style = 'thin') {
  const b = { style, color: { rgb: BORDER_COLOR } };
  return { top: b, bottom: b, left: b, right: b };
}

function cell(v, opts = {}) {
  const {
    bold = false, italic = false, fontSize = 10,
    bg = null, color = '000000',
    hAlign = 'left', vAlign = 'center',
    wrap = false, borders = true, numFmt = null,
    fontColor = null,
  } = opts;

  const s = {
    font: {
      name: 'Arial',
      sz: fontSize,
      bold,
      italic,
      color: { rgb: fontColor || color },
    },
    alignment: { horizontal: hAlign, vertical: vAlign, wrapText: wrap },
  };
  if (bg) s.fill = { fgColor: { rgb: bg }, patternType: 'solid' };
  if (borders) s.border = border('thin');
  if (numFmt) s.numFmt = numFmt;

  return { v, t: typeof v === 'number' ? 'n' : 's', s };
}

function headerCell(v, opts = {}) {
  return cell(v, {
    bold: true, bg: HEADER_BG, fontColor: WHITE,
    hAlign: 'center', fontSize: 10, borders: true, ...opts,
  });
}

function titleCell(v, opts = {}) {
  return cell(v, {
    bold: true, bg: DARK_GREEN, fontColor: WHITE,
    hAlign: 'center', fontSize: 12, borders: false, ...opts,
  });
}

function sectionCell(v) {
  return cell(v, {
    bold: true, bg: MED_GREEN, fontColor: WHITE,
    hAlign: 'center', fontSize: 11, borders: true,
  });
}

function labelCell(v) {
  return cell(v, { bold: false, bg: LIGHT_GREEN, hAlign: 'left', wrap: true });
}

function valueCell(v, hAlign = 'left') {
  return cell(v, { hAlign, bg: WHITE });
}

function numCell(v) {
  return cell(typeof v === 'number' ? v : num(v), {
    hAlign: 'center', bg: WHITE, numFmt: '#,##0',
  });
}

function altCell(v, hAlign = 'left', rowAlt = false) {
  return cell(v, { hAlign, bg: rowAlt ? ALT_ROW : WHITE, wrap: true });
}

// Place a cell at a specific address in a worksheet object
function setCells(ws, rowIdx, cols) {
  cols.forEach((c, ci) => {
    if (c == null) return;
    const addr = XLSX.utils.encode_cell({ r: rowIdx, c: ci });
    ws[addr] = c;
  });
}

function addMerge(merges, r1, c1, r2, c2) {
  merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
}

// Build worksheet from rows array with !ref, !merges, !cols
function buildWs(rows, colWidths) {
  const ws = {};
  let maxR = 0, maxC = 0;
  rows.forEach((row, ri) => {
    row.forEach((cellObj, ci) => {
      if (cellObj == null) return;
      const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
      ws[addr] = cellObj;
      if (ri > maxR) maxR = ri;
      if (ci > maxC) maxC = ci;
    });
  });
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
  if (colWidths) ws['!cols'] = colWidths.map(w => ({ wch: w }));
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 1 — Catatan Bulanan
// ══════════════════════════════════════════════════════════════
function buildSheet1(XLSX, info, kegiatan, asiRows, giziRows) {
  const rows = [];
  const merges = [];
  const TOTAL_COLS = 14; // A–N

  // ── Title ──
  rows.push([titleCell('CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU', { fontSize: 13 })]);
  merges.push({ s:{r:0,c:0}, e:{r:0,c:TOTAL_COLS-1} });

  rows.push([titleCell(`Posyandu: ${info.namaPosyandu || '-'}   |   Bulan: ${info.bulan || '-'} ${info.tahun || ''}`)]);
  merges.push({ s:{r:1,c:0}, e:{r:1,c:TOTAL_COLS-1} });

  rows.push(Array(TOTAL_COLS).fill(cell('', { borders: false, bg: null })));

  // ── Section I — Informasi Umum ──
  rows.push([sectionCell('I. INFORMASI UMUM POSYANDU')]);
  merges.push({ s:{r:rows.length-1,c:0}, e:{r:rows.length-1,c:TOTAL_COLS-1} });

  const infoFields = [
    ['a. Nama Posyandu',       info.namaPosyandu       || '-'],
    ['b. Dusun',               info.dusun              || '-'],
    ['c. Desa',                info.desa               || '-'],
    ['d. Petugas Lapangan',    info.petugasLapangan    || '-'],
    ['e. Jumlah Kader Aktif',  info.jumlahKader        || 0],
    ['f. Ketua Kader',         info.ketuaKader         || '-'],
    ['g. Tanggal Pelaksanaan', info.tanggalPelaksanaan || '-'],
    ['h. Tanggal Pencatatan',  info.tanggalPencatatan  || '-'],
  ];

  infoFields.forEach(([lbl, val]) => {
    const r = rows.length;
    rows.push([
      labelCell(lbl),
      valueCell(typeof val === 'number' ? val : String(val), 'center'),
      ...Array(TOTAL_COLS - 2).fill(cell('', { borders: false, bg: null })),
    ]);
    merges.push({ s:{r,c:1}, e:{r,c:TOTAL_COLS-1} });
  });

  rows.push(Array(TOTAL_COLS).fill(cell('', { borders: false })));

  // ── Section II — Kegiatan Penimbangan ──
  const secIIRow = rows.length;
  rows.push([sectionCell('II. KEGIATAN PENIMBANGAN')]);
  merges.push({ s:{r:secIIRow,c:0}, e:{r:secIIRow,c:TOTAL_COLS-1} });

  // Sub-header row 1
  const hdr1Row = rows.length;
  rows.push([
    headerCell('No'),
    headerCell('Keterangan'),
    headerCell('Kode'),
    headerCell('0-5 bln'), null,
    headerCell('6-11 bln'), null,
    headerCell('12-23 bln'), null,
    headerCell('24-60 bln'), null,
    headerCell('Total L'),
    headerCell('Total P'),
    headerCell('Grand Total'),
  ]);
  merges.push(
    { s:{r:hdr1Row,c:0}, e:{r:hdr1Row+1,c:0} }, // No
    { s:{r:hdr1Row,c:1}, e:{r:hdr1Row+1,c:1} }, // Keterangan
    { s:{r:hdr1Row,c:2}, e:{r:hdr1Row+1,c:2} }, // Kode
    { s:{r:hdr1Row,c:3}, e:{r:hdr1Row,c:4} },   // 0-5 bln
    { s:{r:hdr1Row,c:5}, e:{r:hdr1Row,c:6} },   // 6-11 bln
    { s:{r:hdr1Row,c:7}, e:{r:hdr1Row,c:8} },   // 12-23 bln
    { s:{r:hdr1Row,c:9}, e:{r:hdr1Row,c:10} },  // 24-60 bln
    { s:{r:hdr1Row,c:11}, e:{r:hdr1Row+1,c:11} }, // Total L
    { s:{r:hdr1Row,c:12}, e:{r:hdr1Row+1,c:12} }, // Total P
    { s:{r:hdr1Row,c:13}, e:{r:hdr1Row+1,c:13} }, // Grand Total
  );

  // Sub-header row 2 (L/P)
  rows.push([
    null, null, null,
    headerCell('L'), headerCell('P'),
    headerCell('L'), headerCell('P'),
    headerCell('L'), headerCell('P'),
    headerCell('L'), headerCell('P'),
    null, null, null,
  ]);

  const kegiatanDefs = [
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
  ];

  kegiatanDefs.forEach(([no, label, kode, ...fields], idx) => {
    const vals   = fields.map(f => num(kegiatan[f]));
    const totalL = vals.filter((_, i) => i % 2 === 0).reduce((a,b) => a+b, 0);
    const totalP = vals.filter((_, i) => i % 2 === 1).reduce((a,b) => a+b, 0);
    const isAlt  = idx % 2 === 1;
    const bg     = isAlt ? ALT_ROW : WHITE;
    rows.push([
      cell(no,    { hAlign:'center', bg }),
      cell(label, { hAlign:'left',   bg, wrap: true }),
      cell(kode,  { hAlign:'center', bg }),
      ...vals.map(v => cell(v, { hAlign:'center', bg, numFmt:'#,##0' })),
      cell(totalL, { hAlign:'center', bg, bold:true, numFmt:'#,##0' }),
      cell(totalP, { hAlign:'center', bg, bold:true, numFmt:'#,##0' }),
      cell(totalL+totalP, { hAlign:'center', bg, bold:true, bg: LIGHT_GREEN, numFmt:'#,##0' }),
    ]);
  });

  rows.push(Array(TOTAL_COLS).fill(cell('', { borders: false })));

  // ── Section III — ASI Eksklusif ──
  const secIIIRow = rows.length;
  rows.push([sectionCell('III. PEMANTAUAN ASI EKSKLUSIF')]);
  merges.push({ s:{r:secIIIRow,c:0}, e:{r:secIIIRow,c:TOTAL_COLS-1} });

  const asiHdrs = ['No','Nama Balita','Tanggal Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Orang Tua','Sumber'];
  rows.push(asiHdrs.map(h => headerCell(h)));
  merges.push({ s:{r:rows.length-1,c:TOTAL_COLS-1}, e:{r:rows.length-1,c:TOTAL_COLS-1} });

  if (asiRows.length === 0) {
    const eRow = rows.length;
    rows.push([cell('-', {hAlign:'center'}), cell('Belum ada data ASI Eksklusif', {hAlign:'left'})]);
    merges.push({ s:{r:eRow,c:1}, e:{r:eRow,c:TOTAL_COLS-1} });
  } else {
    asiRows.forEach((r, i) => {
      const isAlt = i % 2 === 1;
      const bg = isAlt ? ALT_ROW : WHITE;
      rows.push([
        cell(i+1,             { hAlign:'center', bg }),
        cell(r.namaBalita||'-', { bg, wrap:true }),
        cell(r.tglLahir ? fmtTgl(r.tglLahir) : '-', { hAlign:'center', bg }),
        cell(num(r.umurBulan), { hAlign:'center', bg }),
        cell(r.e0?'✓':'', { hAlign:'center', bg }),
        cell(r.e1?'✓':'', { hAlign:'center', bg }),
        cell(r.e2?'✓':'', { hAlign:'center', bg }),
        cell(r.e3?'✓':'', { hAlign:'center', bg }),
        cell(r.e4?'✓':'', { hAlign:'center', bg }),
        cell(r.e5?'✓':'', { hAlign:'center', bg }),
        cell(r.e6?'✓':'', { hAlign:'center', bg }),
        cell(r.namaOrtu||'-', { bg }),
        cell(r.balitaId ? 'Database' : 'Manual', { hAlign:'center', bg }),
      ]);
    });
  }

  rows.push(Array(TOTAL_COLS).fill(cell('', { borders: false })));

  // ── Section IV — Gizi Buruk & Kurus ──
  const secIVRow = rows.length;
  rows.push([sectionCell('IV. PEMANTAUAN BALITA GIZI BURUK & KURUS')]);
  merges.push({ s:{r:secIVRow,c:0}, e:{r:secIVRow,c:TOTAL_COLS-1} });

  const giziHdrs = ['No','Nama Balita','Tanggal Lahir','Umur (bln)','Nama Orang Tua','Pekerjaan','BB (kg)','TB (cm)','Sumber'];
  rows.push(giziHdrs.map(h => headerCell(h)));

  if (giziRows.length === 0) {
    const eRow = rows.length;
    rows.push([cell('-', {hAlign:'center'}), cell('Belum ada data gizi buruk & kurus', {hAlign:'left'})]);
    merges.push({ s:{r:eRow,c:1}, e:{r:eRow,c:TOTAL_COLS-1} });
  } else {
    giziRows.forEach((r, i) => {
      const isAlt = i % 2 === 1;
      const bg = isAlt ? ALT_ROW : WHITE;
      rows.push([
        cell(i+1, { hAlign:'center', bg }),
        cell(r.namaBalita||'-', { bg, wrap:true }),
        cell(r.tglLahir ? fmtTgl(r.tglLahir) : '-', { hAlign:'center', bg }),
        cell(num(r.umurBulan), { hAlign:'center', bg }),
        cell(r.namaOrtu||'-', { bg }),
        cell(r.pekerjaan||'-', { bg }),
        cell(r.bb||'', { hAlign:'center', bg }),
        cell(r.tb||'', { hAlign:'center', bg }),
        cell(r.balitaId ? 'Database' : 'Manual', { hAlign:'center', bg }),
      ]);
    });
  }

  const ws = buildWs(rows, [5,55,8, 9,9,9,9,9,9,9,9, 9,9,12, 25,12]);
  ws['!merges'] = merges;
  ws['!rows']   = rows.map(() => ({ hpt: 18 }));
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 2 — Pemantauan Pertumbuhan
// ══════════════════════════════════════════════════════════════
function buildSheet2(XLSX, info, pemRows) {
  const rows  = [];
  const merges = [];
  const COLS  = 35;

  rows.push([titleCell('V. FORMULIR PEMANTAUAN PERTUMBUHAN BALITA', { fontSize: 13 })]);
  merges.push({ s:{r:0,c:0}, e:{r:0,c:COLS-1} });

  rows.push([titleCell(`Posyandu: ${info.namaPosyandu||'-'}   |   Bulan: ${info.bulan||'-'} ${info.tahun||''}`)]);
  merges.push({ s:{r:1,c:0}, e:{r:1,c:COLS-1} });

  rows.push(Array(COLS).fill(cell('', { borders: false })));

  const headers = [
    'No','No KK','NIK Anak','Anak Ke','Nama Anak','Tgl Lahir','L/P',
    'Usia Kehamilan Saat Lahir (mgg)','BBL (kg)','PBL (cm)','UKA Lahir (cm)',
    'Nama Ibu','Nama Ayah','NIK Ayah','No Telp','Alamat','RT','RW',
    'Tgl Ukur Bln Lalu','BB Bln Lalu (kg)','TB Bln Lalu (cm)',
    'Tgl Ukur Bln Ini','BB Bln Ini (kg)','TB/PB Bln Ini (cm)',
    'LILA (cm)','LIKA (cm)',
    'Status N/T/O/B','ASI Eksklusif','Vit A Feb','Buku KIA',
    'Ket Perkembangan','PKAT',
    'Status Stunting','Status Gizi','Catatan',
  ];
  rows.push(headers.map(h => headerCell(h, { wrap: true })));

  if (pemRows.length === 0) {
    const eRow = rows.length;
    rows.push([cell('-', {hAlign:'center'}), cell('Belum ada data pemantauan pertumbuhan', {hAlign:'left'})]);
    merges.push({ s:{r:eRow,c:1}, e:{r:eRow,c:COLS-1} });
  } else {
    pemRows.forEach((r, i) => {
      const isAlt = i % 2 === 1;
      const bg = isAlt ? ALT_ROW : WHITE;
      const c = (v, a='left') => cell(v ?? '', { hAlign: a, bg, wrap: true });
      rows.push([
        cell(i+1, { hAlign:'center', bg }),
        c(r.noKK),
        c(r.nik),
        c(r.anakKe, 'center'),
        c(r.namaAnak||'-'),
        c(r.tglLahir ? fmtTgl(r.tglLahir) : '', 'center'),
        c(r.lp||'', 'center'),
        c(r.usiaKehamilanLahir||'', 'center'),
        c(r.bbl||'', 'center'),
        c(r.pbl||'', 'center'),
        c(r.ukaLahir||'', 'center'),
        c(r.namaIbu||r.namaOrtu||''),
        c(r.namaAyah||''),
        c(r.nikAyah||''),
        c(r.noTlp||''),
        c(r.alamat||''),
        c(r.rt||'', 'center'),
        c(r.rw||'', 'center'),
        c((r._tglUkurLalu||r.tglUkur) ? fmtTgl(r._tglUkurLalu||r.tglUkur) : '', 'center'),
        c(r._bbLalu||r.bb||'', 'center'),
        c(r._tbLalu||r.pb||'', 'center'),
        c(r.tglUkurBaru||'', 'center'),
        c(r.bbBaru||'', 'center'),
        c(r.pbBaru||'', 'center'),
        c(r.lila||'', 'center'),
        c(r.lika||'', 'center'),
        c(r.statusNTO||'', 'center'),
        c(r.asiEksklusif==='1'?'Ya':r.asiEksklusif==='2'?'Tidak':'', 'center'),
        c(r.vitAFeb==='1'?'Ya':r.vitAFeb==='2'?'Tidak':'', 'center'),
        c(r.bukuKIA==='1'?'Punya':r.bukuKIA==='2'?'Tidak':'', 'center'),
        c(r.ketPerkembangan||''),
        c(r.pkat||'', 'center'),
        c(r._statusStunting||'', 'center'),
        c(r._statusGizi||'', 'center'),
        c(r.catatan||''),
      ]);
    });
  }

  const colWidths = [
    5,16,18,7,22,12,5,
    12,9,9,9,
    20,20,18,14,22,5,5,
    14,12,12,
    14,12,14,
    9,9,
    10,12,9,10,
    16,8,
    14,12,20,
  ];

  const ws = buildWs(rows, colWidths);
  ws['!merges'] = merges;
  ws['!rows']   = rows.map(() => ({ hpt: 20 }));
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 3 — Ringkasan
// ══════════════════════════════════════════════════════════════
function buildSheet3(XLSX, info, kegiatan, asiRows, giziRows, pemRows) {
  const rows   = [];
  const merges = [];

  rows.push([titleCell('RINGKASAN LAPORAN BULANAN POSYANDU', { fontSize: 13 })]);
  merges.push({ s:{r:0,c:0}, e:{r:0,c:1} });

  rows.push([titleCell(`${info.namaPosyandu||'-'}  —  ${info.bulan||'-'} ${info.tahun||}`)]);
  merges.push({ s:{r:1,c:0}, e:{r:1,c:1} });

  rows.push([cell('', {borders:false}), cell('', {borders:false})]);

  rows.push([headerCell('Indikator'), headerCell('Nilai')]);

  const totalBalita =
    num(kegiatan.s_L_0_5)+num(kegiatan.s_P_0_5)+
    num(kegiatan.s_L_6_11)+num(kegiatan.s_P_6_11)+
    num(kegiatan.s_L_12_23)+num(kegiatan.s_P_12_23)+
    num(kegiatan.s_L_24_60)+num(kegiatan.s_P_24_60);

  const summaryRows = [
    ['Total Balita (semua kelompok)', totalBalita],
    ['Naik BB (N)',
      num(kegiatan.n_L_0_5)+num(kegiatan.n_P_0_5)+num(kegiatan.n_L_6_11)+num(kegiatan.n_P_6_11)+
      num(kegiatan.n_L_12_23)+num(kegiatan.n_P_12_23)+num(kegiatan.n_L_24_60)+num(kegiatan.n_P_24_60)],
    ['Tidak Naik BB (T)',
      num(kegiatan.t_L_0_5)+num(kegiatan.t_P_0_5)+num(kegiatan.t_L_6_11)+num(kegiatan.t_P_6_11)+
      num(kegiatan.t_L_12_23)+num(kegiatan.t_P_12_23)+num(kegiatan.t_L_24_60)+num(kegiatan.t_P_24_60)],
    ['Bawah Garis Merah (BGM)',
      num(kegiatan.bgm_L_0_5||0)+num(kegiatan.bgm_P_0_5||0)+num(kegiatan.bgm_L_6_11||0)+num(kegiatan.bgm_P_6_11||0)+
      num(kegiatan.bgm_L_12_23||0)+num(kegiatan.bgm_P_12_23||0)+num(kegiatan.bgm_L_24_60||0)+num(kegiatan.bgm_P_24_60||0)],
    null,
    ['Status Stunting dari Pemantauan', ''],
    ['  — Normal',   pemRows.filter(r => r._statusStunting === 'Normal').length],
    ['  — Risiko',   pemRows.filter(r => r._statusStunting === 'Risiko').length],
    ['  — Stunting', pemRows.filter(r => r._statusStunting === 'Stunting').length],
    null,
    ['ASI Eksklusif dicatat',      asiRows.length],
    ['Gizi Buruk & Kurus dicatat', giziRows.length],
    null,
    ['Petugas Lapangan', info.petugasLapangan || '-'],
    ['Ketua Kader',      info.ketuaKader      || '-'],
    ['Tanggal Cetak',    fmtTgl(new Date().toISOString())],
  ];

  summaryRows.forEach((row, i) => {
    if (row === null) {
      rows.push([cell('', {borders:false}), cell('', {borders:false})]);
      return;
    }
    const [lbl, val] = row;
    const isSection = lbl.startsWith('Status Stunting');
    if (isSection) {
      rows.push([sectionCell(lbl), cell('', {bg: MED_GREEN, borders:true})]);
    } else {
      const isAlt = i % 2 === 0;
      rows.push([
        cell(lbl, { bg: isAlt ? LIGHT_GREEN : WHITE, bold: false, wrap:true }),
        cell(typeof val === 'number' ? val : val,
             { hAlign: typeof val === 'number' ? 'center' : 'left',
               bg: isAlt ? LIGHT_GREEN : WHITE,
               bold: typeof val === 'number',
               numFmt: typeof val === 'number' ? '#,##0' : undefined }),
      ]);
    }
  });

  const ws = buildWs(rows, [42, 22]);
  ws['!merges'] = merges;
  ws['!rows']   = rows.map(() => ({ hpt: 20 }));
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  FUNGSI UTAMA EXPORT
// ══════════════════════════════════════════════════════════════
export async function exportLaporanExcel({ info, kegiatan, asiRows, giziRows, pemRows }) {
  const XLSX = await loadXLSX();
  const wb   = XLSX.utils.book_new();

  const ws1 = buildSheet1(XLSX, info, kegiatan, asiRows, giziRows);
  const ws2 = buildSheet2(XLSX, info, pemRows);
  const ws3 = buildSheet3(XLSX, info, kegiatan, asiRows, giziRows, pemRows);

  XLSX.utils.book_append_sheet(wb, ws1, 'Catatan Bulanan');
  XLSX.utils.book_append_sheet(wb, ws2, 'Pemantauan Pertumbuhan');
  XLSX.utils.book_append_sheet(wb, ws3, 'Ringkasan');

  const safe     = s => String(s||'').replace(/[/\\?*[\]]/g, '-');
  const fileName = `Laporan_${safe(info.namaPosyandu||'Posyandu')}_${safe(info.bulan||'Bulan')}_${safe(info.tahun||new Date().getFullYear())}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}