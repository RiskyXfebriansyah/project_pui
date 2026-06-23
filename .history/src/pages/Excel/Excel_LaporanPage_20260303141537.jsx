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
//  KOLOM (27 total, A=0 … AA=26):
//  0  No
//  1  No KK
//  2  NIK
//  3  Anak Ke
//  4  Nama Anak
//  5  Tgl Lahir
//  6  L/P
//  7  Usia Kehamilan Saat Lahir
//  8  BBL
//  9  PBL
//  10 UKA Lahir
//  11 Nama Ortu (Ayah & Ibu)
//  12 NIK Ayah
//  13 No Tlp/HP Ortu
//  14 Alamat
//  15 RT
//  16 RW
//  17 Tanggal Ukur   ← biru
//  18 BB (kg)         ← biru
//  19 PB/TB (cm)      ← biru
//  20 LILA/LIKA       ← biru
//  21 KET N/T/O/B
//  22 ASI Eksklusif
//  23 Vit A Feb
//  24 Buku KIA
//  25 Ket Perkembangan/PKAT
//  26 Status Gizi
//
//  HEADER WILAYAH (rows 0-4):
//  Row 0 : Full-width green bar — JUDUL
//  Row 1 : Provinsi (A-C)  |  Nama Posyandu (I-L)  |  KADER Pemantau (R-V)  |  BALITA badge (Z-AA / col 25-26) ← merge rows 1-4
//  Row 2 : Kab/Kota        |  Alamat               |  No Telp/HP             |
//  Row 3 : Puskesmas       |  Bulan                |                         |
//  Row 4 : Desa/Kelurahan  |  Tahun                |                         |
//  Row 5 : kosong
//  Row 6 : nomor (1)-(27)
//  Row 7 : nama kolom
//  Row 8+: data
// ══════════════════════════════════════════════════════════════
function sheet2(info, pemRows, extra={}) {
  const rows = [], mg = [];
  const TC = 27;
  const M = (r1,c1,r2,c2) => mg.push({s:{r:r1,c:c1},e:{r:r2,c:c2}});

  // Row 0: Title (FULL WIDTH)
  const r0 = Array(TC).fill(cell('',{bg:GRN,bdr:false}));
  r0[0] = TIT('FORMULIR PEMANTAUAN PERTUMBUHAN BALITA DI POSYANDU');
  rows.push(r0);
  M(0,0,0,TC-1);

  // ── Rows 1-4: Header wilayah ──────────────────────────────
  //
  // Mapping kolom berdasarkan gambar:
  //   Kiri  : label=col0, titik dua=col1, nilai=col2..col6  (merge 2-6)
  //   Tengah: label=col8, titik dua=col9, nilai=col10..col16 (merge 10-16)
  //   Kanan : label=col17, titik dua=col18, nilai=col19..col22 (merge 19-22)
  //   Badge : col25..col26 merge rows 1-4
  //
  const left  = [['Provinsi',info.desa&&''||'',extra.provinsi||'-'],['Kabupaten/Kota','',extra.kabupaten||'-'],['Puskesmas/Kecamatan','',extra.puskesmas||'-'],['Desa/Kelurahan','',extra.desa||info.desa||'-']];
  // Pakai array bersih supaya lebih rapi
  const leftLabels  = ['Provinsi','Kabupaten/Kota','Puskesmas/Kecamatan','Desa/Kelurahan'];
  const leftValues  = [extra.provinsi||'-', extra.kabupaten||'-', extra.puskesmas||'-', extra.desa||info.desa||'-'];
  const midLabels   = ['Nama Posyandu','Alamat','Bulan','Tahun'];
  const midValues   = [info.namaPosyandu||'-', info.dusun||'-', info.bulan||'-', String(info.tahun||'')];
  const rightLabels = ['KADER Pemantau','No Telp/HP','',''];
  const rightValues = [extra.kaderPemantau||'-', extra.noTelpKader||'-','',''];

  for(let i=0;i<4;i++){
    const ri = rows.length;
    const row = Array(TC).fill(E());

    // Kiri: label(0), titik dua(1), nilai(2-6)
    row[0] = PLN(leftLabels[i]);
    row[1] = PLN(':');
    row[2] = PLN(leftValues[i], {bold:true});

    // Tengah: label(8), titik dua(9), nilai(10-16)
    row[8]  = PLN(midLabels[i]);
    row[9]  = PLN(':');
    row[10] = PLN(midValues[i], {bold:true});

    // Kanan: label(17), titik dua(18), nilai(19-22)
    if(rightLabels[i]){
      row[17] = PLN(rightLabels[i]);
      row[18] = PLN(':');
      row[19] = PLN(rightValues[i], {bold:true});
    }

    // Badge BALITA — hanya letakkan cell di row pertama (ri=1), sisanya merge
    if(i===0){
      row[25] = cell('BALITA',{bold:true,sz:18,bg:WHT,fc:BLK,ha:'center',va:'center',bdr:true});
    }

    rows.push(row);
    M(ri, 2,  ri, 7);   // merge nilai kiri  → col 2-7
    M(ri, 10, ri, 16);  // merge nilai tengah → col 10-16
    M(ri, 19, ri, 23);  // merge nilai kanan  → col 19-23
  }
  // Merge badge BALITA vertikal rows 1-4, cols 25-26
  M(1, 25, 4, 26);

  // ── Row 5: kosong ─────────────────────────────────────────
  rows.push(Array(TC).fill(E()));

  // ── Row 6: nomor kolom (1)-(27) ──────────────────────────
  rows.push(Array.from({length:TC},(_,ci)=>HDR(`(${ci+1})`,{sz:8})));

  // ── Row 7: nama kolom ─────────────────────────────────────
  rows.push([
    HDR('No'),
    HDR('No Kartu\nKeluarga'),
    HDR('NIK\n(Nomor Induk\nKependudukan)'),
    HDR('Anak\nKe'),
    HDR('Nama Anak'),
    HDR('Tanggal\nLahir'),
    HDR('L/P'),
    HDR('Usia\nKehamilan\nSaat Lahir'),
    HDR('BBL'),
    HDR('PBL'),
    HDR('UKA\nLahir'),
    HDR('Nama Ortu\n(Ayah & Ibu)'),
    HDR('NIK Ayah'),
    HDR('No Tlp/HP\nOrtu'),
    HDR('Alamat'),
    HDR('RT'),
    HDR('RW'),
    HDR('Tanggal\nUkur',   {bg:BLU}),
    HDR('BB\n(kg)',         {bg:BLU}),
    HDR('PB/TB\n(cm)',      {bg:BLU}),
    HDR('LILA/\nLIKA',     {bg:BLU}),
    HDR('KET\nN/T/\nO/B'),
    HDR('ASI\nEksklusif\n1=Ya\n2=Tdk',    {sz:7}),
    HDR('Vit A\nFeb\n1=Ya\n2=Tdk',        {sz:7}),
    HDR('Buku\nKIA\n1=Pny\n2=Tdk',        {sz:7}),
    HDR('Ket. Perkembangan\n(Sesuai/Merag/\nPenyimp)\nPKAT (Ya/Blm)', {sz:7}),
    HDR('Status\nGizi'),
  ]);

  // ── Data rows ─────────────────────────────────────────────
  if(!pemRows.length){
    const ri=rows.length;
    const er=Array(TC).fill(EB());
    er[0]=DAT('-',{ha:'center'}); er[1]=DAT('Belum ada data pemantauan pertumbuhan');
    rows.push(er);
    M(ri,1,ri,TC-1);
  } else {
    pemRows.forEach((r,i)=>{
      const bg  = i%2===1 ? GRN5 : WHT;
      const d   = (v,x={}) => DAT(v??'',{bg,...x});

      const ortu = [
        r.namaIbu  && `Ibu: ${r.namaIbu}`,
        r.namaAyah && `Ayah: ${r.namaAyah}`,
      ].filter(Boolean).join(' / ') || r.namaOrtu || '';

      rows.push([
        cell(i+1,{ha:'center',bg,sz:9,bdr:true}),
        d(r.noKK||''),
        d(r.nik||''),
        d(r.anakKe||'',{ha:'center'}),
        d(r.namaAnak||'-',{bold:true}),
        d(fmtTgl(r.tglLahir),{ha:'center'}),
        d(r.lp||'',{ha:'center',bold:true, fc:r.lp==='L'?BLU:r.lp==='P'?'C2185B':BLK}),
        d(String(r.usiaKehamilanLahir||''),{ha:'center'}),
        d(String(r.bbl||''),{ha:'center'}),
        d(String(r.pbl||''),{ha:'center'}),
        d(String(r.ukaLahir||''),{ha:'center'}),
        d(ortu,{wrap:true}),
        d(r.nikAyah||''),
        d(r.noTlp||''),
        d(r.alamat||'',{wrap:true}),
        d(r.rt||'',{ha:'center'}),
        d(r.rw||'',{ha:'center'}),
        // Kolom pengukuran — biru
        d(r.tglUkurBaru||r.tglUkur||'',{ha:'center',bg:BLU2}),
        d(String(r.bbBaru||r.bb||''),    {ha:'center',bg:BLU2}),
        d(String(r.pbBaru||r.pb||''),    {ha:'center',bg:BLU2}),
        d([r.lila,r.lika].filter(Boolean).join(' / '),{ha:'center',bg:BLU2}),
        // Indikator
        d(r.statusNTO||'',{ha:'center',bold:true}),
        d(r.asiEksklusif==='1'?'1':r.asiEksklusif==='2'?'2':'',{ha:'center'}),
        d(r.vitAFeb==='1'?'1':r.vitAFeb==='2'?'2':'',{ha:'center'}),
        d(r.bukuKIA==='1'?'1':r.bukuKIA==='2'?'2':'',{ha:'center'}),
        d([r.ketPerkembangan,r.pkat].filter(Boolean).join(' / '),{wrap:true}),
        d([r._statusStunting,r._statusGizi].filter(Boolean).join(' / '),{ha:'center'}),
      ]);
    });
  }

  // ── Kolom widths ──────────────────────────────────────────
  const cw=[
    5,   // 0  No
    16,  // 1  No KK
    18,  // 2  NIK
    6,   // 3  Anak Ke
    22,  // 4  Nama Anak
    11,  // 5  Tgl Lahir
    5,   // 6  L/P
    8,   // 7  Usia Kehamilan
    7,   // 8  BBL
    7,   // 9  PBL
    7,   // 10 UKA Lahir
    24,  // 11 Nama Ortu
    16,  // 12 NIK Ayah
    13,  // 13 No Tlp
    18,  // 14 Alamat
    4,   // 15 RT
    4,   // 16 RW
    12,  // 17 Tgl Ukur
    8,   // 18 BB
    8,   // 19 PB/TB
    10,  // 20 LILA/LIKA
    8,   // 21 KET
    8,   // 22 ASI
    7,   // 23 Vit A
    7,   // 24 Buku KIA
    20,  // 25 Perkembangan
    12,  // 26 Status Gizi
  ];

  const rh = rows.map((_,i)=>{
    if(i===0)           return 26;  // title bar
    if(i>=1 && i<=4)    return 16;  // header wilayah
    if(i===5)           return 6;   // kosong
    if(i===6)           return 16;  // nomor kolom
    if(i===7)           return 36;  // nama kolom header (tinggi — wrap)
    return 20;                       // data rows
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
