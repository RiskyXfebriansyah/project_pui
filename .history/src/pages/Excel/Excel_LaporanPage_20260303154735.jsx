// ============================================================
//  ExcelLaporanPage.jsx — Export 3-sheet Excel Posyandu
//  Sheet 2: layout PERSIS gambar referensi
//    Row 0 : bar hijau — judul tengah
//    Row 1-4: header wilayah 3 kolom (kiri/tengah/kanan) + badge BALITA
//    Row 5 : kosong
//    Row 6 : nomor kolom (1)-(27)
//    Row 7 : nama kolom
//    Row 8+: data balita
// ============================================================

// ── helpers ──────────────────────────────────────────────────
function fmtTgl(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d)) return String(raw);
  const bl = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${String(d.getDate()).padStart(2,'0')} ${bl[d.getMonth()]} ${d.getFullYear()}`;
}
function num(v) {
  const n = Number(v);
  return (v === '' || v == null || isNaN(n)) ? 0 : n;
}

// ── XLSX loader ───────────────────────────────────────────────
async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
    s.onload  = () => res(window.XLSX);
    s.onerror = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s2.onload  = () => res(window.XLSX);
      s2.onerror = () => rej(new Error('Gagal load XLSX'));
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  });
}

// ── Colors ───────────────────────────────────────────────────
const GRN  = '1B6B3A'; // dark green header
const GRN2 = '2E7D32'; // medium green col header
const GRN3 = '4CAF50'; // section green
const GRN4 = 'C8E6C9'; // light green label
const GRN5 = 'F1F8E9'; // alt row
const BLU  = '1565C0'; // blue (ukur cols)
const BLU2 = 'DBEAFE'; // light blue cell
const WHT  = 'FFFFFF';
const BLK  = '000000';

// ── Cell builder ─────────────────────────────────────────────
function cell(v, {
  bold=false, sz=10, bg=null, fc=BLK,
  ha='left', va='center', wrap=false, bdr=true,
}={}) {
  const s = {
    font: { name:'Arial', sz, bold, color:{ rgb:fc } },
    alignment: { horizontal:ha, vertical:va, wrapText:wrap },
  };
  if (bg) s.fill = { fgColor:{ rgb:bg }, patternType:'solid' };
  if (bdr) {
    const b = { style:'thin', color:{ rgb:BLK } };
    s.border = { top:b, bottom:b, left:b, right:b };
  }
  return { v: v ?? '', t: typeof v === 'number' ? 'n' : 's', s };
}

// shorthands
const E    = () => cell('', { bdr:false });
const EB   = () => cell('', { bdr:true, bg:WHT });
const TIT  = (v,x={}) => cell(v, { bold:true, sz:13, bg:GRN,  fc:WHT, ha:'center', bdr:false, ...x });
const SEC  = (v,x={}) => cell(v, { bold:true, sz:10, bg:GRN3, fc:WHT, ha:'center', bdr:true,  ...x });
const HDR  = (v,x={}) => cell(v, { bold:true, sz:9,  bg:GRN2, fc:WHT, ha:'center', bdr:true, wrap:true, ...x });
const LBL  = (v,x={}) => cell(v, { sz:10, bg:GRN4, ha:'left',   bdr:true, ...x });
const VAL  = (v,x={}) => cell(v, { sz:10, bg:WHT,  ha:'center', bdr:true, ...x });
const DAT  = (v,x={}) => cell(v, { sz:9,  bg:WHT,  ha:'left',   bdr:true, ...x });
const NUM  = (v,x={}) => cell(typeof v==='number'?v:num(v), { sz:9, bg:WHT, ha:'center', bdr:true, ...x });
const PLN  = (v,x={}) => cell(v, { bdr:false, sz:10, ...x });

// ── Worksheet builder ─────────────────────────────────────────
function encCol(c) {
  let s=''; c++;
  while(c>0){ c--; s=String.fromCharCode(65+(c%26))+s; c=Math.floor(c/26); }
  return s;
}

function makeWs(rows, cw, rh) {
  const ws={};
  let R=0, CC=0;
  rows.forEach((row, ri)=>{
    row.forEach((cl, ci)=>{
      if (cl==null) return;
      ws[encCol(ci)+(ri+1)] = cl;
      if(ri>R) R=ri; if(ci>CC) CC=ci;
    });
  });
  ws['!ref'] = `A1:${encCol(CC)}${R+1}`;
  if(cw) ws['!cols'] = cw.map(w=>({wch:w}));
  if(rh) ws['!rows'] = rh.map(h=>({hpt:h}));
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 1 — Catatan Bulanan
// ══════════════════════════════════════════════════════════════
function sheet1(info, keg, asi, gizi) {
  const rows=[], mg=[], TC=14;
  const M = (r1,c1,r2,c2) => mg.push({s:{r:r1,c:c1},e:{r:r2,c:c2}});
  const BL = () => Array(TC).fill(E());

  // ROW 0: Judul
  rows.push([TIT('CATATAN BULANAN KEGIATAN PENIMBANGAN DI POSYANDU')]); 
  M(0,0,0,TC-1);
  
  // ROW 1: Sub judul
  rows.push([TIT(`Posyandu: ${info.namaPosyandu||'-'}   |   Bulan: ${info.bulan||'-'} ${info.tahun||''}`,{sz:11})]); 
  M(1,0,1,TC-1);

  // ROW 2: Kosong
  rows.push(BL());

  // ROW 3: Section header I
  rows.push([SEC('I. INFORMASI UMUM POSYANDU')]); 
  M(rows.length-1,0,rows.length-1,TC-1);
  
  // ✅ PERBAIKAN: Info rows — label di col 0 (lebar), value merge col 1–6
  [
    ['a. Nama Posyandu',       info.namaPosyandu      ||'-'],
    ['b. Dusun',               info.dusun             ||'-'],
    ['c. Desa',                info.desa              ||'-'],
    ['d. Petugas Lapangan',    info.petugasLapangan   ||'-'],
    ['e. Jumlah Kader Aktif',  info.jumlahKader       ||0 ],
    ['f. Ketua Kader',         info.ketuaKader        ||'-'],
    ['g. Tanggal Pelaksanaan', info.tanggalPelaksanaan||'-'],
    ['h. Tanggal Pencatatan',  info.tanggalPencatatan ||'-'],
  ].forEach(([l,v])=>{
    const ri = rows.length;
    // Col 0 : label (hijau muda)
    // Col 1 : value di kolom B saja (putih, rata tengah)
    // Col 2–TC-1 : merge kosong putih
    // Setiap cell C–N diisi eksplisit dengan border agar outline merged cell tampil penuh
    const bThin = { style:'thin', color:{ rgb:BLK } };
    const mkBdr = (isFirst) => ({
      v: '', t: 's',
      s: {
        font: { name:'Arial', sz:10 },
        alignment: { horizontal:'center', vertical:'center' },
        fill: { fgColor:{ rgb:WHT }, patternType:'solid' },
        border: {
          top:    bThin,
          bottom: bThin,
          left:   isFirst ? bThin : { style:'thin', color:{ rgb:'CCCCCC' } },
          right:  bThin,
        },
      }
    });
    rows.push([
      LBL(l),                                               // col 0 — label (A)
      VAL(String(v), { ha: 'center' }),                     // col 1 — value (B)
      ...Array(TC-2).fill(0).map((_,i) => mkBdr(i===0)),   // col 2–13 — C sampai N, semua ber-border
    ]);
    M(ri, 2, ri, TC-1); // merge C sampai N
  });

  rows.push(BL());
  // II. KEGIATAN PENIMBANGAN
  rows.push([SEC('II. KEGIATAN PENIMBANGAN')]); 
  M(rows.length-1,0,rows.length-1,TC-1);
  
  const hr=rows.length;
  rows.push([HDR('No'),HDR('Keterangan'),HDR('Kode'),HDR('0-5 bln'),null,HDR('6-11 bln'),null,HDR('12-23 bln'),null,HDR('24-60 bln'),null,HDR('Total L'),HDR('Total P'),HDR('Grand Total')]);
  M(hr,0,hr+1,0); M(hr,1,hr+1,1); M(hr,2,hr+1,2);
  M(hr,3,hr,4);   M(hr,5,hr,6);   M(hr,7,hr,8);   M(hr,9,hr,10);
  M(hr,11,hr+1,11); M(hr,12,hr+1,12); M(hr,13,hr+1,13);
  rows.push([null,null,null,HDR('L'),HDR('P'),HDR('L'),HDR('P'),HDR('L'),HDR('P'),HDR('L'),HDR('P'),null,null,null]);

  const dataRows = [
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

  dataRows.forEach(([no,lbl,kode,...ff], idx)=>{
    const vals = ff.map(f => num(keg[f] || 0));
    const tL = vals.filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0);
    const tP = vals.filter((_,i)=>i%2===1).reduce((a,b)=>a+b,0);
    const bg = idx%2===1?GRN5:WHT;
    
    rows.push([
      cell(no,{ha:'center',bg,sz:9,bdr:true}),
      cell(lbl,{bg,wrap:true,sz:9,bdr:true}),
      cell(kode,{ha:'center',bg,bold:true,sz:10,bdr:true}),
      ...vals.map(v => NUM(v,{bg})),
      NUM(tL,{bg,bold:true}), 
      NUM(tP,{bg,bold:true}),
      NUM(tL+tP,{bg:GRN4,bold:true}),
    ]);
  });
  rows.push(BL());

  // III. PEMANTAUAN ASI EKSKLUSIF
  rows.push([SEC('III. PEMANTAUAN ASI EKSKLUSIF')]); 
  M(rows.length-1,0,rows.length-1,TC-1);
  
  rows.push(['No','Nama Balita','Tanggal Lahir','Umur (bln)','E0','E1','E2','E3','E4','E5','E6','Nama Orang Tua','Sumber',''].map(h=>HDR(h)));
  
  if(!asi || !asi.length){
    rows.push([DAT('1'),DAT('Belum ada data'),...Array(TC-2).fill(EB())]);
  } else {
    asi.forEach((r,i)=>{
      const bg=i%2===1?GRN5:WHT;
      rows.push([
        cell(i+1,{ha:'center',bg,sz:9,bdr:true}),
        DAT(r.namaBalita||'-',{bg,bold:true}),
        DAT(fmtTgl(r.tglLahir),{ha:'center',bg}),
        NUM(r.umurBulan,{bg}),
        ...['e0','e1','e2','e3','e4','e5','e6'].map(e => DAT(r[e]?'v':'',{ha:'center',bg})),
        DAT(r.namaOrtu||'-',{bg}),
        DAT(r.balitaId?'Database':'Manual',{ha:'center',bg}),
        EB()
      ]);
    });
  }
  rows.push(BL());

  // IV. PEMANTAUAN BALITA GIZI BURUK & KURUS
  rows.push([SEC('IV. PEMANTAUAN BALITA GIZI BURUK & KURUS')]); 
  M(rows.length-1,0,rows.length-1,TC-1);
  
  rows.push(['No','Nama Balita','Tanggal Lahir','Umur (bln)','Nama Orang Tua','Pekerjaan','BB (kg)','TB (cm)','Sumber','','','','',''].map(h=>HDR(h)));
  
  if(!gizi || !gizi.length){
    rows.push([DAT('1'),DAT('Belum ada data'),...Array(TC-2).fill(EB())]);
  } else {
    gizi.forEach((r,i)=>{
      const bg=i%2===1?GRN5:WHT;
      rows.push([
        cell(i+1,{ha:'center',bg,sz:9,bdr:true}),
        DAT(r.namaBalita||'-',{bg,bold:true}),
        DAT(fmtTgl(r.tglLahir),{ha:'center',bg}),
        NUM(r.umurBulan,{bg}),
        DAT(r.namaOrtu||'-',{bg}),
        DAT(r.pekerjaan||'-',{bg}),
        DAT(String(r.bb||''),{ha:'center',bg}),
        DAT(String(r.tb||''),{ha:'center',bg}),
        DAT(r.balitaId?'Database':'Manual',{ha:'center',bg}),
        ...Array(5).fill(EB())
      ]);
    });
  }

  // ✅ PERBAIKAN: Kolom A (index 0) diperlebar dari 5 → 22 agar label tidak terpotong
  const ws = makeWs(rows, [22, 55, 12, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 12], rows.map((_,i)=> i<2?22 : 18));
  ws['!merges'] = mg;
  return ws;
}




// ══════════════════════════════════════════════════════════════
//  SHEET 2 — Formulir Pemantauan Pertumbuhan
//
//  KOLOM (26 total, A=0 … Z=25):
//  A(0)  = Label kiri  (Provinsi, Kab/Kota, Puskesmas, Desa)
//  B(1)  = Titik dua kiri
//  C(2)  = Nilai kiri  → ANCHOR, merge C–H (D–H = col 3–7)
//  I(8)  = Label tengah (Nama Posyandu, Alamat, Bulan, Tahun)
//  J(9)  = Titik dua tengah
//  K(10) = Nilai tengah → ANCHOR, merge K–Q (L–Q = col 11–16)
//  R(17) = Label kanan (KADER Pemantau, No Telp/HP)
//  S(18) = Titik dua kanan
//  T(19) = Nilai kanan → ANCHOR, merge T–Y (U–Y = col 20–24)
//  Z(25) = Badge BALITA → merge rows 1–4
//  STATUS GIZI DIHAPUS
// ══════════════════════════════════════════════════════════════
function sheet2(info, pemRows, extra={}) {
  const rows = [], mg = [];
  const TC = 26; // A–Z (0–25)
  const M = (r1,c1,r2,c2) => mg.push({s:{r:r1,c:c1},e:{r:r2,c:c2}});

  // helper: cell kosong ber-border untuk isi area merge
  const bT = { style:'thin', color:{ rgb:BLK } };
  const mkB = () => ({ v:'', t:'s', s:{
    font:{name:'Arial',sz:10},
    alignment:{horizontal:'center',vertical:'center'},
    fill:{fgColor:{rgb:WHT},patternType:'solid'},
    border:{top:bT,bottom:bT,left:bT,right:bT},
  }});

  // ── Row 0: Judul full-width ──────────────────────────────
  const r0 = Array(TC).fill(cell('',{bg:GRN,bdr:false}));
  r0[0] = TIT('FORMULIR PEMANTAUAN PERTUMBUHAN BALITA DI POSYANDU');
  rows.push(r0);
  M(0,0,0,TC-1);

    // ── Rows 1–4: Header wilayah ─────────────────────────────
  //
  //  STRUKTUR PER KOLOM:
  //  A  = label kiri        (row 1–4, masing-masing baris)
  //  B  = titik dua kiri    (row 1–4)
  //  C  = nilai kiri        (row 1–4, SENDIRI — tidak merge horizontal)
  //  D–H= MERGE VERTIKAL    (row 1–4 = rows.index 1–4, kosong, all border)
  //  I  = label tengah      (row 1–4)
  //  J  = titik dua tengah  (row 1–4)
  //  K  = nilai tengah      (row 1–4, SENDIRI — tidak merge horizontal)
  //  L–Q= MERGE VERTIKAL    (row 1–4, kosong, all border)
  //  R  = label kanan       (hanya row 1–2, row 3–4 kosong)
  //  S  = titik dua kanan   (hanya row 1–2)
  //  T  = nilai kanan       (hanya row 1–2)
  //  U–Y= MERGE row 1–2     (all border), lalu R–Y row 3–4 merge jadi 1 area kosong
  //  Z  = BALITA badge      (merge vertikal row 1–4)

  const leftLabels = ['Provinsi','Kabupaten/Kota','Puskesmas/Kecamatan','Desa/Kelurahan'];
  const leftValues = [
    extra.provinsi  || info.provinsi  || '-',
    extra.kabupaten || info.kabupaten || '-',
    extra.puskesmas || info.puskesmas || '-',
    extra.desa      || info.desa      || '-',
  ];
  const midLabels = ['Nama Posyandu','Alamat','Bulan','Tahun'];
  const midValues = [
    info.namaPosyandu || '-',
    info.alamat || info.dusun || '-',
    info.bulan  || '-',
    String(info.tahun || ''),
  ];
  const rightLabels = ['KADER Pemantau','No Telp/HP'];
  const rightValues = [
    extra.kaderPemantau || info.ketuaKader || '-',
    extra.noTelpKader   || '-',
  ];

  // Buat 4 baris (row 1–4)
  for(let i = 0; i < 4; i++){
    const ri = rows.length;
    const row = Array(TC).fill(E());

    // Helper: cell dengan border untuk label/titik dua/nilai di header wilayah
    const hLBL = (v) => cell(v, {sz:10, bg:WHT, ha:'left',   va:'center', bdr:true});
    const hCOL = (v) => cell(v, {sz:10, bg:WHT, ha:'center', va:'center', bdr:true});
    const hVAL = (v) => cell(v, {sz:10, bg:WHT, ha:'left',   va:'center', bdr:true, bold:true});

    // A=label, B=titik dua, C=nilai (masing-masing SENDIRI, all border)
    row[0] = hLBL(leftLabels[i]);
    row[1] = hCOL(':');
    row[2] = hVAL(leftValues[i]);

    // D–H (col 3–7): border, merge vertikal D–H row 1–4
    for(let j=3; j<=7; j++) row[j] = mkB();

    // I=label, J=titik dua, K=nilai (masing-masing SENDIRI, all border)
    row[8]  = hLBL(midLabels[i]);
    row[9]  = hCOL(':');
    row[10] = hVAL(midValues[i]);

    // L–Q (col 11–16): border, merge vertikal L–Q row 1–4
    for(let j=11; j<=16; j++) row[j] = mkB();

    // R(17), S(18), T(19): hanya row 1 dan 2 (i=0,1), row 3-4 masuk merge R–Y
    if(i < 2){
      row[17] = hLBL(rightLabels[i] || '');
      row[18] = hCOL(':');
      row[19] = hVAL(rightValues[i] || '');
      // U–Y (col 20–24): all border, merge horizontal per baris
      for(let j=20; j<=24; j++) row[j] = mkB();
    } else {
      // Row 3 & 4: R–Y semua border (merge jadi 1 area kosong)
      for(let j=17; j<=24; j++) row[j] = mkB();
    }

    // Z(25) = BALITA badge
    if(i === 0){
      row[25] = cell('BALITA', {bold:true, sz:18, bg:WHT, fc:BLK,
                                ha:'center', va:'center', bdr:true});
    } else {
      row[25] = cell('', {bdr:true, bg:WHT});
    }

    rows.push(row);
  }

  // ── Merge vertikal D–H (rows 1–4, col 3–7): satu blok kosong ──
  M(1, 3, 4, 7);   // D–H, row 1–4

  // ── Merge vertikal L–Q (rows 1–4, col 11–16): satu blok kosong ──
  M(1, 11, 4, 16); // L–Q, row 1–4

  // ── U–Y row 1 (i=0 → rows index 1): merge horizontal ──
  M(1, 20, 1, 24); // U–Y baris 1

  // ── U–Y row 2 (i=1 → rows index 2): merge horizontal ──
  M(2, 20, 2, 24); // U–Y baris 2

  // ── R–Y row 3–4 (rows index 3–4): merge jadi 1 area kosong ──
  M(3, 17, 4, 24); // R–Y, row 3–4

  // ── BALITA vertikal rows 1–4 col Z ──
  M(1, 25, 4, 25);

  // ── Row 5: kosong ────────────────────────────────────────
  rows.push(Array(TC).fill(E()));

  // ── Row 6: nomor kolom (1)–(26) ─────────────────────────
  rows.push(Array.from({length:TC}, (_,ci) => HDR(`(${ci+1})`, {sz:8})));

  // ── Row 7: header kolom ──────────────────────────────────
  rows.push([
    HDR('No'),                                                          // A
    HDR('No Kartu\nKeluarga'),                                          // B
    HDR('NIK\n(Nomor Induk\nKependudukan)'),                            // C
    HDR('Anak\nKe'),                                                    // D
    HDR('Nama Anak'),                                                   // E
    HDR('Tanggal\nLahir'),                                              // F
    HDR('L/P'),                                                         // G
    HDR('Usia\nKehamilan\nSaat Lahir'),                                 // H
    HDR('BBL'),                                                         // I
    HDR('PBL'),                                                         // J
    HDR('UKA\nLahir'),                                                  // K
    HDR('Nama Ortu\n(Ayah & Ibu)'),                                     // L
    HDR('NIK Ayah'),                                                    // M
    HDR('No Tlp/HP\nOrtu'),                                             // N
    HDR('Alamat'),                                                      // O
    HDR('RT'),                                                          // P
    HDR('RW'),                                                          // Q
    HDR('Tanggal\nUkur',   {bg:BLU}),                                  // R
    HDR('BB\n(kg)',         {bg:BLU}),                                  // S
    HDR('PB/TB\n(cm)',      {bg:BLU}),                                  // T
    HDR('LILA/\nLIKA',     {bg:BLU}),                                  // U
    HDR('KET\nN/T/\nO/B'),                                             // V
    HDR('ASI\nEksklusif\n1=Ya\n2=Tdk',  {sz:7}),                      // W
    HDR('Vit A\nFeb\n1=Ya\n2=Tdk',      {sz:7}),                      // X
    HDR('Buku\nKIA\n1=Pny\n2=Tdk',      {sz:7}),                      // Y
    HDR('Ket. Perkembangan\n(Sesuai/Merag/\nPenyimp)\nPKAT (Ya/Blm)', {sz:7}), // Z
  ]);

  // ── Data rows ────────────────────────────────────────────
  const dataToShow = (pemRows && pemRows.length) ? pemRows : [];

  if(!dataToShow.length){
    const ri = rows.length;
    const er = Array(TC).fill(EB());
    er[0] = DAT('-', {ha:'center'});
    er[1] = DAT('Belum ada data pemantauan pertumbuhan');
    rows.push(er);
    M(ri, 1, ri, TC-1);
  } else {
    dataToShow.forEach((r, i) => {
      const bg = i % 2 === 1 ? GRN5 : WHT;
      const d = (v, x={}) => DAT(v ?? '', {bg, ...x});
      const ortu = [
        r.namaIbu  && `Ibu: ${r.namaIbu}`,
        r.namaAyah && `Ayah: ${r.namaAyah}`,
      ].filter(Boolean).join(' / ') || r.namaOrtu || '';

      rows.push([
        cell(i+1, {ha:'center', bg, sz:9, bdr:true}),                         // A  No
        d(r.noKK || ''),                                                        // B  No KK
        d(r.nik  || ''),                                                        // C  NIK
        d(r.anakKe || '', {ha:'center'}),                                      // D  Anak Ke
        d(r.namaAnak || '-', {bold:true}),                                     // E  Nama Anak
        d(fmtTgl(r.tglLahir), {ha:'center'}),                                  // F  Tgl Lahir
        d(r.lp || '', {ha:'center', bold:true,                                 // G  L/P
          fc: r.lp==='L' ? BLU : r.lp==='P' ? 'C2185B' : BLK}),
        d(String(r.usiaKehamilanLahir || ''), {ha:'center'}),                  // H  Usia Kehamilan
        d(String(r.bbl || ''), {ha:'center'}),                                 // I  BBL
        d(String(r.pbl || ''), {ha:'center'}),                                 // J  PBL
        d(String(r.ukaLahir || ''), {ha:'center'}),                            // K  UKA Lahir
        d(ortu, {wrap:true}),                                                  // L  Nama Ortu
        d(r.nikAyah || ''),                                                    // M  NIK Ayah
        d(r.noTlp   || ''),                                                    // N  No Tlp
        d(r.alamat  || '', {wrap:true}),                                       // O  Alamat
        d(r.rt || '', {ha:'center'}),                                          // P  RT
        d(r.rw || '', {ha:'center'}),                                          // Q  RW
        d(r.tglUkurBaru||r.tglUkur||'', {ha:'center', bg:BLU2}),              // R  Tgl Ukur
        d(String(r.bbBaru||r.bb||''),   {ha:'center', bg:BLU2}),              // S  BB
        d(String(r.pbBaru||r.pb||r.tb||''), {ha:'center', bg:BLU2}),          // T  PB/TB
        d([r.lila,r.lika].filter(Boolean).join('/'), {ha:'center', bg:BLU2}), // U  LILA/LIKA
        d(r.statusNTO || '', {ha:'center', bold:true}),                        // V  KET
        d(r.asiEksklusif==='1'?'1':r.asiEksklusif==='2'?'2':'', {ha:'center'}), // W ASI
        d(r.vitAFeb==='1'?'1':r.vitAFeb==='2'?'2':'',           {ha:'center'}), // X Vit A
        d(r.bukuKIA==='1'?'1':r.bukuKIA==='2'?'2':'',           {ha:'center'}), // Y Buku KIA
        d([r.ketPerkembangan, r.pkat].filter(Boolean).join('/'), {wrap:true}), // Z Perkembangan
      ]);
    });
  }

  // ── Column widths ─────────────────────────────────────────
  const cw = [
    18,   // A  No
    16,  // B  No KK
    18,  // C  NIK
    6,   // D  Anak Ke
    22,  // E  Nama Anak
    11,  // F  Tgl Lahir
    5,   // G  L/P
    8,   // H  Usia Kehamilan
    18,   // I  BBL
    8,   // J  PBL
    17,   // K  UKA Lahir
    24,  // L  Nama Ortu
    16,  // M  NIK Ayah
    13,  // N  No Tlp
    18,  // O  Alamat
    4,   // P  RT
    4,   // Q  RW
    12,  // R  Tgl Ukur
    8,   // S  BB
    12,   // T  PB/TB
    10,  // U  LILA/LIKA
    8,   // V  KET
    8,   // W  ASI
    7,   // X  Vit A
    7,   // Y  Buku KIA
    20,  // Z  Perkembangan/PKAT
  ];

  const rh = rows.map((_,i) => {
    if(i===0)        return 26;
    if(i>=1&&i<=4)   return 16;
    if(i===5)        return 6;
    if(i===6)        return 16;
    if(i===7)        return 40;
    return 20;
  });

  const ws = makeWs(rows, cw, rh);
  ws['!merges'] = mg;
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  SHEET 3 — Ringkasan
// ══════════════════════════════════════════════════════════════
function sheet3(info, keg, asi, gizi, pem) {
  const rows=[], mg=[];
  const M=(r1,c1,r2,c2)=>mg.push({s:{r:r1,c:c1},e:{r:r2,c:c2}});

  rows.push([TIT('RINGKASAN LAPORAN BULANAN POSYANDU')]); M(0,0,0,1);
  rows.push([TIT(`${info.namaPosyandu||'-'}  —  ${info.bulan||'-'} ${info.tahun||''}`,{sz:11})]); M(1,0,1,1);
  rows.push([E(),E()]);
  rows.push([HDR('Indikator'),HDR('Nilai')]);

  const sum=(...ff)=>ff.reduce((a,f)=>a+num(keg[f]),0);
  const tS=sum('s_L_0_5','s_P_0_5','s_L_6_11','s_P_6_11','s_L_12_23','s_P_12_23','s_L_24_60','s_P_24_60');

  [
    ['Total Balita (S)',        tS],
    ['Naik BB (N)',             sum('n_L_0_5','n_P_0_5','n_L_6_11','n_P_6_11','n_L_12_23','n_P_12_23','n_L_24_60','n_P_24_60')],
    ['Tidak Naik BB (T)',       sum('t_L_0_5','t_P_0_5','t_L_6_11','t_P_6_11','t_L_12_23','t_P_12_23','t_L_24_60','t_P_24_60')],
    ['Bawah Garis Merah (BGM)',sum('bgm_L_0_5','bgm_P_0_5','bgm_L_6_11','bgm_P_6_11','bgm_L_12_23','bgm_P_12_23','bgm_L_24_60','bgm_P_24_60')],
    null,
    ['Stunting Normal',  pem.filter(r=>r._statusStunting==='Normal').length],
    ['Stunting Risiko',  pem.filter(r=>r._statusStunting==='Risiko').length],
    ['Stunting',         pem.filter(r=>r._statusStunting==='Stunting').length],
    null,
    ['ASI Eksklusif dicatat',      asi.length],
    ['Gizi Buruk & Kurus dicatat', gizi.length],
    ['Pemantauan Pertumbuhan',     pem.length],
    null,
    ['Petugas Lapangan', info.petugasLapangan||'-'],
    ['Ketua Kader',      info.ketuaKader||'-'],
    ['Tanggal Cetak',    fmtTgl(new Date().toISOString())],
  ].forEach((row,i)=>{
    if(!row){ rows.push([E(),E()]); return; }
    const [l,v]=row, bg=i%2===0?GRN5:WHT;
    rows.push([LBL(l,{bg}), typeof v==='number'?NUM(v,{bg,bold:true}):VAL(String(v),{bg})]);
  });

  const ws=makeWs(rows,[44,22],rows.map(()=>20));
  ws['!merges']=mg;
  return ws;
}

// ══════════════════════════════════════════════════════════════
//  EXPORT UTAMA
//  extraData: { provinsi, kabupaten, puskesmas, desa,
//               kaderPemantau, noTelpKader }
// ══════════════════════════════════════════════════════════════
export async function exportLaporanExcel({ info, kegiatan, asiRows, giziRows, pemRows, extraData={} }) {
  const XLSX = await loadXLSX();
  const wb   = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, sheet1(info,kegiatan,asiRows,giziRows),     'Catatan Bulanan');
  XLSX.utils.book_append_sheet(wb, sheet2(info,pemRows,extraData),              'Pemantauan Pertumbuhan');
  XLSX.utils.book_append_sheet(wb, sheet3(info,kegiatan,asiRows,giziRows,pemRows), 'Ringkasan');

  const safe = s => String(s||'').replace(/[/\\?*[\]:']/g,'-');
  const fn   = `Laporan_${safe(info.namaPosyandu||'Posyandu')}_${safe(info.bulan||'Bulan')}_${safe(info.tahun||new Date().getFullYear())}.xlsx`;
  XLSX.writeFile(wb, fn);
  return fn;
}
