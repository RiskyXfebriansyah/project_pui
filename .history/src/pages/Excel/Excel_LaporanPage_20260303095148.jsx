// ============================================================
//  ExcelLaporanPage.jsx — Export Excel Laporan Bulanan Posyandu
//  Format disesuaikan dengan form fisik resmi
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
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s2.onload  = () => resolve(window.XLSX);
      s2.onerror = () => reject(new Error('Gagal load library XLSX'));
      document.head.appendChild(s2);
    };
    document.head.appendChild(script);
  });
}

// ══════════════════════════════════════════════════════════════
//  COLOR PALETTE
// ══════════════════════════════════════════════════════════════
const C = {
  darkGreen:  '1B6B3A',
  medGreen:   '2E7D32',
  lightGreen: 'C8E6C9',
  altGreen:   'F1F8E9',
  headerBg:   '2E7D32',
  sectionBg:  '4CAF50',
  white:      'FFFFFF',
  black:      '000000',
  altBlue:    'DBEAFE',
};

// ══════════════════════════════════════════════════════════════
//  STYLE HELPERS
// ══════════════════════════════════════════════════════════════
function bdrBlack(style = 'thin') {
  const b = { style, color: { rgb: '000000' } };
  return { top: b, bottom: b, left: b, right: b };
}

function mkCell(v, {
  bold = false, fontSize = 10, bg = null,
  fontColor = C.black, hAlign = 'left', vAlign = 'center',
  wrap = false, border = true, numFmt = null,
} = {}) {
  const s = {
    font: { name: 'Arial', sz: fontSize, bold, color: { rgb: fontColor } },
    alignment: { horizontal: hAlign, vertical: vAlign, wrapText: wrap },
  };
  if (bg) s.fill = { fgColor: { rgb: bg }, patternType: 'solid' };
  if (border) s.border = bdrBlack('thin');
  if (numFmt) s.numFmt = numFmt;
  const isNum = typeof v === 'number';
  return { v: v ?? '', t: isNum ? 'n' : 's', s };
}

const titleC   = (v, x={}) => mkCell(v, { bold:true, fontSize:13, bg:C.darkGreen, fontColor:C.white, hAlign:'center', border:false, ...x });
const sectionC = (v, x={}) => mkCell(v, { bold:true, fontSize:10, bg:C.sectionBg, fontColor:C.white, hAlign:'center', border:true, ...x });
const headerC  = (v, x={}) => mkCell(v, { bold:true, fontSize:9,  bg:C.headerBg,  fontColor:C.white, hAlign:'center', border:true, wrap:true, ...x });
const labelC   = (v, x={}) => mkCell(v, { fontSize:10, bg:C.lightGreen, hAlign:'left', border:true, ...x });
const valueC   = (v, x={}) => mkCell(v, { fontSize:10, bg:C.white, hAlign:'center', border:true, ...x });
const dataC    = (v, x={}) => mkCell(v, { fontSize:9, bg:C.white, border:true, hAlign:'left', ...x });
const numC     = (v, x={}) => mkCell(typeof v === 'number' ? v : num(v), { fontSize:9, bg:C.white, hAlign:'center', border:true, numFmt:'#,##0', ...x });
const emptyC   = ()        => mkCell('', { border:false });

// Build worksheet from 2D array
function encodeCol(c) {
  let s = '';
  c++;
  while (c > 0) { c--; s = String.fromCharCode(65 + (c % 26)) + s; c = Math.floor(c / 26); }
  return s;
}
function buildWs(rows, colWidths, rowHeights) {
  const ws = {};
  let maxR = 0, maxC = 0;
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell == null) return;
      const addr = encodeCol(ci) + (ri + 1);
      ws[addr] = cell;
      if (ri > maxR) maxR = ri;
      if (ci > maxC) maxC = ci;
    });
  });
  ws['!ref'] = `A1:${encodeCol(maxC)}${maxR + 1}`;
  if (colWidths)  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  if (rowHeights) ws['!rows'] = rowHeights.map(h => ({ hpt: h }));
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 1 — Catatan Bulanan
// ══════════════════════════════════════════════════════════════
function buildSheet1(info, kegiatan, asiRows, giziRows) {
  const rows = [], merges = [];
  const TC = 14;
  const mg = (r1,c1,r2,c2) => merges.push({s:{r:r1,c:c1},e:{r:r2,c:c2}});
  const blank = () => Array(TC).fill(emptyC());

  // Title
  rows.push([titleC('CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU', {fontSize:13})]); mg(0,0,0,TC-1);
  rows.push([titleC(`Posyandu: ${info.namaPosyandu||'-'}   |   Bulan: ${info.bulan||'-'} ${info.tahun||''}`, {fontSize:11})]); mg(1,0,1,TC-1);
  rows.push(blank());

  // Section I
  rows.push([sectionC('I. INFORMASI UMUM POSYANDU')]); mg(rows.length-1,0,rows.length-1,TC-1);
  [
    ['a. Nama Posyandu',       info.namaPosyandu      || '-'],
    ['b. Dusun',               info.dusun             || '-'],
    ['c. Desa',                info.desa              || '-'],
    ['d. Petugas Lapangan',    info.petugasLapangan   || '-'],
    ['e. Jumlah Kader Aktif',  info.jumlahKader       || 0],
    ['f. Ketua Kader',         info.ketuaKader        || '-'],
    ['g. Tanggal Pelaksanaan', info.tanggalPelaksanaan|| '-'],
    ['h. Tanggal Pencatatan',  info.tanggalPencatatan || '-'],
  ].forEach(([lbl, val]) => {
    const ri = rows.length;
    rows.push([labelC(lbl), valueC(String(val)), ...Array(TC-2).fill(mkCell('',{border:false}))]);
    mg(ri, 1, ri, TC-1);
  });
  rows.push(blank());

  // Section II
  rows.push([sectionC('II. KEGIATAN PENIMBANGAN')]); mg(rows.length-1,0,rows.length-1,TC-1);
  const h1r = rows.length;
  rows.push([
    headerC('No'), headerC('Keterangan'), headerC('Kode'),
    headerC('0-5 bln'), null, headerC('6-11 bln'), null,
    headerC('12-23 bln'), null, headerC('24-60 bln'), null,
    headerC('Total L'), headerC('Total P'), headerC('Grand Total'),
  ]);
  [[0,0],[1,1],[2,2],[3,4],[5,6],[7,8],[9,10],[11,11],[12,12],[13,13]].forEach(([c1,c2]) => mg(h1r,c1,h1r+(c1===3||c1===5||c1===7||c1===9?0:1),c2));
  // Simpler: merge No, Keterangan, Kode, Totals across 2 rows; group cols per usia
  mg(h1r,0,h1r+1,0); mg(h1r,1,h1r+1,1); mg(h1r,2,h1r+1,2);
  mg(h1r,3,h1r,4); mg(h1r,5,h1r,6); mg(h1r,7,h1r,8); mg(h1r,9,h1r,10);
  mg(h1r,11,h1r+1,11); mg(h1r,12,h1r+1,12); mg(h1r,13,h1r+1,13);
  rows.push([null,null,null, headerC('L'),headerC('P'), headerC('L'),headerC('P'), headerC('L'),headerC('P'), headerC('L'),headerC('P'), null,null,null]);

  const kegDefs = [
    ['01','Jumlah semua balita yang ada di kelompok penimbangan bulan ini','S','s_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60'],
    ['02','Jumlah balita yang terdaftar dan mempunyai KMS bulan ini','K','k_L_0_5','k_P_0_5','k_L_6_11','k_P_6_11','k_L_12_23','k_P_12_23','k_L_24_60','k_P_24_60'],
    ['03','Jumlah balita yang naik berat badannya bulan ini','N','n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60'],
    ['04','Jumlah balita yang tidak naik berat badannya bulan ini','T','t_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60'],
    ['05','Jumlah balita yang ditimbang bulan ini, tetapi tidak ditimbang bulan lalu','O','o_L_0_5','o_P_0_5','o_L_6_11','o_P_6_11','o_L_12_23','o_P_12_23','o_L_24_60','o_P_24_60'],
    ['06','Jumlah balita yang baru pertama kali hadir di penimbangan bulan ini','B','b_L_0_5','b_P_0_5','b_L_6_11','b_P_6_11','b_L_12_23','b_P_12_23','b_L_24_60','b_P_24_60'],
    ['07','Jumlah balita yang ditimbang bulan ini (03+04+05+06)','D','d_L_0_5','d_P_0_5','d_L_6_11','d_P_6_11','d_L_12_23','d_P_12_23','d_L_24_60','d_P_24_60'],
    ['08','Jumlah balita yang tidak hadir di penimbangan bulan ini (02-07)','-','m_L_0_5','m_P_0_5','m_L_6_11','m_P_6_11','m_L_12_23','m_P_12_23','m_L_24_60','m_P_24_60'],
    ['09','Jumlah balita yang ada di bawah garis merah (BGM)','A','bgm_L_0_5','bgm_P_0_5','bgm_L_6_11','bgm_P_6_11','bgm_L_12_23','bgm_P_12_23','bgm_L_24_60','bgm_P_24_60'],
    ['10','Jumlah bayi mendapat vitamin A bulan Februari/Agustus','A','vitAbayiFeb_L_0_5','vitAbayiFeb_P_0_5','vitAbayiFeb_L_6_11','vitAbayiFeb_P_6_11','vitAbayiFeb_L_12_23','vitAbayiFeb_P_12_23','vitAbayiFeb_L_24_60','vitAbayiFeb_P_24_60'],
    ['11','Jumlah balita mendapat vitamin A bulan Februari/Agustus','A','vitAbalitaFeb_L_0_5','vitAbalitaFeb_P_0_5','vitAbalitaFeb_L_6_11','vitAbalitaFeb_P_6_11','vitAbalitaFeb_L_12_23','vitAbalitaFeb_P_12_23','vitAbalitaFeb_L_24_60','vitAbalitaFeb_P_24_60'],
    ['12','Jumlah bayi dengan ASI Eksklusif pada bulan ini','E','asi_L_0_5','asi_P_0_5','asi_L_6_11','asi_P_6_11','asi_L_12_23','asi_P_12_23','asi_L_24_60','asi_P_24_60'],
  ];

  kegDefs.forEach(([no,label,kode,...fields],idx) => {
    const vals = fields.map(f => num(kegiatan[f]));
    const totalL = vals.filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0);
    const totalP = vals.filter((_,i)=>i%2===1).reduce((a,b)=>a+b,0);
    const bg = idx%2===1 ? C.altGreen : C.white;
    rows.push([
      mkCell(no,    {hAlign:'center',bg,fontSize:9,border:true}),
      mkCell(label, {bg,wrap:true,fontSize:9,border:true}),
      mkCell(kode,  {hAlign:'center',bg,bold:true,fontSize:10,border:true}),
      ...vals.map(v=>numC(v,{bg})),
      numC(totalL,{bg,bold:true}),
      numC(totalP,{bg,bold:true}),
      numC(totalL+totalP,{bg:C.lightGreen,bold:true}),
    ]);
  });
  rows.push(blank());

  // Section III — ASI
  rows.push([sectionC('III. PEMANTAUAN ASI EKSKLUSIF')]); mg(rows.length-1,0,rows.length-1,TC-1);
  rows.push(['No','Nama Balita','Tanggal Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Orang Tua','Sumber'].map(h=>headerC(h)));
  if (!asiRows.length) {
    const er=rows.length; rows.push([dataC('-',{hAlign:'center'}),dataC('Belum ada data ASI Eksklusif'),...Array(TC-2).fill(emptyC())]);
    mg(er,1,er,TC-1);
  } else {
    asiRows.forEach((r,i) => {
      const bg=i%2===1?C.altGreen:C.white;
      rows.push([
        mkCell(i+1,{hAlign:'center',bg,fontSize:9,border:true}),
        dataC(r.namaBalita||'-',{bg,bold:true}),
        dataC(fmtTgl(r.tglLahir),{hAlign:'center',bg}),
        numC(r.umurBulan,{bg}),
        dataC(r.e0?'v':'',{hAlign:'center',bg}),
        dataC(r.e1?'v':'',{hAlign:'center',bg}),
        dataC(r.e2?'v':'',{hAlign:'center',bg}),
        dataC(r.e3?'v':'',{hAlign:'center',bg}),
        dataC(r.e4?'v':'',{hAlign:'center',bg}),
        dataC(r.e5?'v':'',{hAlign:'center',bg}),
        dataC(r.e6?'v':'',{hAlign:'center',bg}),
        dataC(r.namaOrtu||'-',{bg}),
        dataC(r.balitaId?'Database':'Manual',{hAlign:'center',bg}),
      ]);
    });
  }
  rows.push(blank());

  // Section IV — Gizi
  rows.push([sectionC('IV. PEMANTAUAN BALITA GIZI BURUK & KURUS')]); mg(rows.length-1,0,rows.length-1,TC-1);
  rows.push(['No','Nama Balita','Tanggal Lahir','Umur (bln)','Nama Orang Tua','Pekerjaan','BB (kg)','TB (cm)','Sumber'].map(h=>headerC(h)));
  if (!giziRows.length) {
    const er=rows.length; rows.push([dataC('-',{hAlign:'center'}),dataC('Belum ada data gizi buruk & kurus'),...Array(TC-2).fill(emptyC())]);
    mg(er,1,er,TC-1);
  } else {
    giziRows.forEach((r,i)=>{
      const bg=i%2===1?C.altGreen:C.white;
      rows.push([
        mkCell(i+1,{hAlign:'center',bg,fontSize:9,border:true}),
        dataC(r.namaBalita||'-',{bg,bold:true}),
        dataC(fmtTgl(r.tglLahir),{hAlign:'center',bg}),
        numC(r.umurBulan,{bg}),
        dataC(r.namaOrtu||'-',{bg}),
        dataC(r.pekerjaan||'-',{bg}),
        dataC(String(r.bb||''),{hAlign:'center',bg}),
        dataC(String(r.tb||''),{hAlign:'center',bg}),
        dataC(r.balitaId?'Database':'Manual',{hAlign:'center',bg}),
      ]);
    });
  }

  const ws = buildWs(rows, [5,56,8,9,9,9,9,9,9,9,9,9,9,12], rows.map((_,i)=>i<2?22:18));
  ws['!merges'] = merges;
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 2 — Formulir Pemantauan Pertumbuhan (sesuai form fisik)
// ══════════════════════════════════════════════════════════════
function buildSheet2(info, pemRows, extra = {}) {
  const rows = [], merges = [];
  const TC = 27;
  const mg = (r1,c1,r2,c2) => merges.push({s:{r:r1,c:c1},e:{r:r2,c:c2}});
  const plain = (v,x={}) => mkCell(v,{border:false,fontSize:10,...x});

  // ── Header Wilayah ──────────────────────────────────────
  // Row 0: Judul (tengah, col 7–TC-1)
  const titleRow = Array(TC).fill(emptyC());
  titleRow[7] = titleC('FORMULIR PEMANTAUAN PERTUMBUHAN BALITA DI POSYANDU', {fontSize:13});
  rows.push(titleRow);
  mg(0,7,0,TC-1);

  // Rows 1–4: Info wilayah kiri / posyandu kanan
  const wilayah = [
    ['Provinsi',            extra.provinsi   || '-'],
    ['Kabupaten/Kota',      extra.kabupaten  || '-'],
    ['Puskesmas/Kecamatan', extra.puskemas   || extra.puskesmas || '-'],
    ['Desa/Kelurahan',      extra.desa       || info.desa || '-'],
  ];
  const posyInfo = [
    ['Nama Posyandu', info.namaPosyandu || '-'],
    ['Alamat',        extra.alamat      || info.dusun || '-'],
    ['Bulan',         info.bulan        || '-'],
    ['Tahun',         info.tahun        || ''],
  ];

  wilayah.forEach(([lbl, val], i) => {
    const ri = rows.length;
    const row = Array(TC).fill(emptyC());
    // Kiri
    row[0] = plain(lbl);
    row[1] = plain(':');
    row[2] = plain(val, {bold:true});
    // Tengah kanan: info posyandu
    row[8]  = plain(posyInfo[i][0]);
    row[9]  = plain(':');
    row[10] = plain(posyInfo[i][1], {bold:true});
    // Pojok kanan: kader + badge
    if (i === 0) {
      row[17] = plain('KADER Pemantau');
      row[18] = plain(':');
      row[19] = plain(extra.kaderPemantau || '-', {bold:true});
      // Badge BALITA (col 25-26)
      row[25] = mkCell('BALITA', {bold:true,fontSize:14,bg:C.white,hAlign:'center',border:true});
    }
    if (i === 1) {
      row[17] = plain('No Telp/HP');
      row[18] = plain(':');
      row[19] = plain(extra.noTelpKader || '-');
    }
    rows.push(row);
    mg(ri,2,ri,6);
    mg(ri,10,ri,16);
    if (i === 0) { mg(ri,19,ri,23); mg(ri,25,ri+3,TC-1); }
  });

  rows.push(Array(TC).fill(emptyC()));

  // ── Header tabel kolom ────────────────────────────────
  // Nomor urut kolom (1)–(27)
  const numHdr = Array(TC).fill(null).map((_,ci) => headerC(`(${ci+1})`, {fontSize:8}));
  rows.push(numHdr);

  const hdr = [
    headerC('No'),
    headerC('No Kartu\nKeluarga'),
    headerC('NIK\n(Nomor Induk\nKependudukan)'),
    headerC('Anak\nKe'),
    headerC('Nama Anak'),
    headerC('Tanggal\nLahir'),
    headerC('L/P'),
    headerC('Usia\nKehamilan\nSaat Lahir'),
    headerC('BBL'),
    headerC('PBL'),
    headerC('UKA\nLahir'),
    headerC('Nama Ortu\n(Ayah & Ibu)'),
    headerC('NIK Ayah'),
    headerC('No Tlp/HP\nOrtu'),
    headerC('Alamat'),
    headerC('RT'),
    headerC('RW'),
    headerC('Tanggal\nUkur', {bg:'1565C0'}),
    headerC('BB\n(kg)',       {bg:'1565C0'}),
    headerC('PB/TB\n(cm)',   {bg:'1565C0'}),
    headerC('LILA/\nLIKA',  {bg:'1565C0'}),
    headerC('KET\nN/T/\nO/B'),
    headerC('ASI\nEksklusif\n1=Ya\n2=Tidak', {fontSize:7}),
    headerC('Vit A\nFeb\n1=Ya\n2=Tdk',       {fontSize:7}),
    headerC('Buku\nKIA\n1=Pny\n2=Tdk',       {fontSize:7}),
    headerC('Ket. Perkembangan\n(Sesuai/Merag./Penyimp)\nPKAT (Ya/Blm)', {fontSize:7}),
    headerC('Status\nGizi'),
  ];
  rows.push(hdr);

  // ── Data rows ────────────────────────────────────────
  if (!pemRows.length) {
    const er = rows.length;
    const erow = Array(TC).fill(mkCell('',{border:true,bg:C.white}));
    erow[0] = dataC('-',{hAlign:'center'}); erow[1] = dataC('Belum ada data pemantauan pertumbuhan');
    rows.push(erow); mg(er,1,er,TC-1);
  } else {
    pemRows.forEach((r,i) => {
      const bg  = i%2===1 ? C.altGreen : C.white;
      const bgB = 'DBEAFE';
      const d = (v,x={}) => dataC(v??'',{bg,...x});
      const n = (v,x={}) => numC(v,{bg,...x});

      const ortuTxt = [
        r.namaAyah && `Ayah: ${r.namaAyah}`,
        r.namaIbu  && `Ibu: ${r.namaIbu}`,
      ].filter(Boolean).join('\n') || r.namaOrtu || '';

      const lilaLika  = [r.lila, r.lika].filter(Boolean).join(' / ') || '';
      const asiTxt    = r.asiEksklusif==='1'?'1':r.asiEksklusif==='2'?'2':'';
      const vitTxt    = r.vitAFeb==='1'?'1':r.vitAFeb==='2'?'2':'';
      const kiaTxt    = r.bukuKIA==='1'?'1':r.bukuKIA==='2'?'2':'';
      const perkTxt   = [r.ketPerkembangan, r.pkat].filter(Boolean).join(' / ');
      const statusTxt = [r._statusStunting, r._statusGizi].filter(Boolean).join(' / ');
      const tglUkur   = r.tglUkurBaru || r.tglUkur || '';
      const bb        = r.bbBaru  || r.bb  || '';
      const pb        = r.pbBaru  || r.pb  || '';

      rows.push([
        mkCell(i+1,{hAlign:'center',bg,fontSize:9,border:true}),
        d(r.noKK||''),
        d(r.nik||''),
        d(r.anakKe||'',{hAlign:'center'}),
        d(r.namaAnak||'-',{bold:true}),
        d(fmtTgl(r.tglLahir),{hAlign:'center'}),
        d(r.lp||'',{hAlign:'center',bold:true,
          fontColor:r.lp==='L'?'1565C0':r.lp==='P'?'C2185B':C.black}),
        d(r.usiaKehamilanLahir||'',{hAlign:'center'}),
        d(String(r.bbl||''),{hAlign:'center'}),
        d(String(r.pbl||''),{hAlign:'center'}),
        d(String(r.ukaLahir||''),{hAlign:'center'}),
        d(ortuTxt,{wrap:true}),
        d(r.nikAyah||''),
        d(r.noTlp||''),
        d(r.alamat||'',{wrap:true}),
        d(r.rt||'',{hAlign:'center'}),
        d(r.rw||'',{hAlign:'center'}),
        // Pengukuran bulan ini (biru muda)
        d(tglUkur,{hAlign:'center',bg:bgB}),
        d(String(bb),{hAlign:'center',bg:bgB}),
        d(String(pb),{hAlign:'center',bg:bgB}),
        d(lilaLika,{hAlign:'center',bg:bgB}),
        // Indikator
        d(r.statusNTO||'',{hAlign:'center',bold:true}),
        d(asiTxt,{hAlign:'center'}),
        d(vitTxt,{hAlign:'center'}),
        d(kiaTxt,{hAlign:'center'}),
        d(perkTxt,{wrap:true}),
        d(statusTxt,{hAlign:'center'}),
      ]);
    });
  }

  const colWidths = [
    5,16,18,6,22,11,5,
    8,7,7,7,
    22,16,12,18,4,4,
    12,8,8,10,
    8,8,7,7,18,14,
  ];
  const rowHeights = rows.map((_,i) => i===0?26 : i<5?18 : i===rows.length-2||i===rows.length-3?32 : 20);

  const ws = buildWs(rows, colWidths, rowHeights);
  ws['!merges'] = merges;
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 3 — Ringkasan
// ══════════════════════════════════════════════════════════════
function buildSheet3(info, kegiatan, asiRows, giziRows, pemRows) {
  const rows = [], merges = [];
  const mg = (r1,c1,r2,c2) => merges.push({s:{r:r1,c:c1},e:{r:r2,c:c2}});

  rows.push([titleC('RINGKASAN LAPORAN BULANAN POSYANDU',{fontSize:13})]); mg(0,0,0,1);
  rows.push([titleC(`${info.namaPosyandu||'-'}  —  ${info.bulan||'-'} ${info.tahun||''}`,{fontSize:11})]); mg(1,0,1,1);
  rows.push([emptyC(),emptyC()]);
  rows.push([headerC('Indikator'),headerC('Nilai')]);

  const sum = (...fields) => fields.reduce((a,f)=>a+num(kegiatan[f]),0);
  const totalS = sum('s_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60');

  [
    ['Total Balita (S)',          totalS],
    ['Naik BB (N)',               sum('n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60')],
    ['Tidak Naik BB (T)',         sum('t_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60')],
    ['Bawah Garis Merah (BGM)',   sum('bgm_L_0_5','bgm_P_0_5','bgm_L_6_11','bgm_P_6_11','bgm_L_12_23','bgm_P_12_23','bgm_L_24_60','bgm_P_24_60')],
    null,
    ['Stunting — Normal',   pemRows.filter(r=>r._statusStunting==='Normal').length],
    ['Stunting — Risiko',   pemRows.filter(r=>r._statusStunting==='Risiko').length],
    ['Stunting — Stunting', pemRows.filter(r=>r._statusStunting==='Stunting').length],
    null,
    ['ASI Eksklusif dicatat',      asiRows.length],
    ['Gizi Buruk & Kurus dicatat', giziRows.length],
    ['Pemantauan Pertumbuhan',     pemRows.length],
    null,
    ['Petugas Lapangan', info.petugasLapangan || '-'],
    ['Ketua Kader',      info.ketuaKader      || '-'],
    ['Tanggal Cetak',    fmtTgl(new Date().toISOString())],
  ].forEach((row,i) => {
    if (!row) { rows.push([emptyC(),emptyC()]); return; }
    const [lbl,val] = row;
    const bg = i%2===0 ? C.altGreen : C.white;
    rows.push([
      labelC(lbl,{bg}),
      typeof val==='number' ? numC(val,{bg,bold:true}) : valueC(String(val),{bg}),
    ]);
  });

  const ws = buildWs(rows,[44,22],rows.map(()=>20));
  ws['!merges'] = merges;
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  FUNGSI UTAMA EXPORT
// ══════════════════════════════════════════════════════════════
export async function exportLaporanExcel({ info, kegiatan, asiRows, giziRows, pemRows, extraData = {} }) {
  const XLSX = await loadXLSX();
  const wb   = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildSheet1(info, kegiatan, asiRows, giziRows),  'Catatan Bulanan');
  XLSX.utils.book_append_sheet(wb, buildSheet2(info, pemRows, extraData),            'Pemantauan Pertumbuhan');
  XLSX.utils.book_append_sheet(wb, buildSheet3(info, kegiatan, asiRows, giziRows, pemRows), 'Ringkasan');

  const safe = s => String(s||'').replace(/[/\\?*[\]:']/g,'-');
  const fn   = `Laporan_${safe(info.namaPosyandu||'Posyandu')}_${safe(info.bulan||'Bulan')}_${safe(info.tahun||new Date().getFullYear())}.xlsx`;
  XLSX.writeFile(wb, fn);
  return fn;
}