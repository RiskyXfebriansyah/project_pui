// ============================================================
//  DATA DUMMY — padanan dummy_data.dart di Flutter
//  Nanti bisa diganti dengan API call ke backend
// ============================================================

export const currentUser = {
  id: 'u001', nama: 'Dr. Hendra Wijaya',
  email: 'admin@puskesmas.id', role: 'admin',
  jabatan: 'Kepala Puskesmas Sukamaju',
  puskesmas: 'Puskesmas Kecamatan Sukamaju',
};

export const balitaList = [
  { id:'b001', nama:'Muhammad Rafif', nik:'3201010101220001', jenisKelamin:'Laki-laki',
    tanggalLahir:'2022-03-15', namaIbu:'Dewi Ratnasari', namaAyah:'Agus Santoso',
    alamat:'Jl. Mawar No. 5, RT 02/RW 03', noTelepon:'08234567890',
    posyandu:'Posyandu Mawar', desa:'Sukamaju',
    riwayat:[
      { id:'p001', tanggal:'2024-10-05', bb:11.2, tb:82.5, lk:47.0 },
      { id:'p002', tanggal:'2024-11-05', bb:11.5, tb:83.0, lk:47.2 },
      { id:'p003', tanggal:'2024-12-05', bb:11.8, tb:83.8, lk:47.4 },
    ]},
  { id:'b002', nama:'Siti Aisyah', nik:'3201010203210002', jenisKelamin:'Perempuan',
    tanggalLahir:'2021-08-22', namaIbu:'Rina Wulandari', namaAyah:'Hendra Kusuma',
    alamat:'Jl. Dahlia No. 10', noTelepon:'08345678901',
    posyandu:'Posyandu Dahlia', desa:'Mekarjaya',
    riwayat:[
      { id:'p004', tanggal:'2024-10-05', bb:9.8, tb:79.2, lk:46.5 },
      { id:'p005', tanggal:'2024-11-05', bb:10.0, tb:80.0, lk:46.7 },
      { id:'p006', tanggal:'2024-12-05', bb:10.2, tb:80.5, lk:46.9 },
    ]},
  { id:'b003', nama:'Bima Sakti', nik:'3201011505230003', jenisKelamin:'Laki-laki',
    tanggalLahir:'2023-05-15', namaIbu:'Lestari Budi', namaAyah:'Wahyu Prasetyo',
    alamat:'Jl. Melati No. 7', noTelepon:'08456789012',
    posyandu:'Posyandu Mawar', desa:'Sukamaju',
    riwayat:[
      { id:'p007', tanggal:'2024-11-05', bb:7.0, tb:67.8, lk:43.8 },
      { id:'p008', tanggal:'2024-12-05', bb:7.2, tb:68.5, lk:44.0 },
    ]},
  { id:'b004', nama:'Nayla Putri', nik:'3201010707220004', jenisKelamin:'Perempuan',
    tanggalLahir:'2022-07-07', namaIbu:'Fitria Handayani', namaAyah:'Doni Setiawan',
    alamat:'Jl. Anggrek No. 3', noTelepon:'08567890123',
    posyandu:'Posyandu Anggrek', desa:'Cimawar',
    riwayat:[
      { id:'p009', tanggal:'2024-10-05', bb:8.5, tb:73.0, lk:45.5 },
      { id:'p010', tanggal:'2024-11-05', bb:8.7, tb:73.8, lk:45.7 },
      { id:'p011', tanggal:'2024-12-05', bb:9.0, tb:74.5, lk:46.0 },
    ]},
  { id:'b005', nama:'Rizky Ramadan', nik:'3201011001240005', jenisKelamin:'Laki-laki',
    tanggalLahir:'2024-01-10', namaIbu:'Yuni Astuti', namaAyah:'Roni Firmansyah',
    alamat:'Jl. Kenanga No. 8', noTelepon:'08678901234',
    posyandu:'Posyandu Kenanga', desa:'Sukamaju',
    riwayat:[
      { id:'p012', tanggal:'2024-12-05', bb:8.1, tb:71.2, lk:44.5 },
    ]},
  { id:'b006', nama:'Zahra Aulia', nik:'3201010505230006', jenisKelamin:'Perempuan',
    tanggalLahir:'2023-05-05', namaIbu:'Nila Sari', namaAyah:'Bambang W',
    alamat:'Jl. Flamboyan No. 2', noTelepon:'08789012345',
    posyandu:'Posyandu Mawar', desa:'Sukamaju',
    riwayat:[
      { id:'p013', tanggal:'2024-10-05', bb:6.2, tb:63.0, lk:42.0 },
      { id:'p014', tanggal:'2024-11-05', bb:6.5, tb:63.8, lk:42.3 },
      { id:'p015', tanggal:'2024-12-05', bb:6.8, tb:64.5, lk:42.6 },
    ]},
  { id:'b007', nama:'Arif Hidayat', nik:'3201010202210007', jenisKelamin:'Laki-laki',
    tanggalLahir:'2021-02-02', namaIbu:'Sri Mulyani', namaAyah:'Eko Wahyudi',
    alamat:'Jl. Cempaka No. 11', noTelepon:'08890123456',
    posyandu:'Posyandu Cempaka', desa:'Mekarjaya',
    riwayat:[
      { id:'p016', tanggal:'2024-10-05', bb:10.5, tb:82.0, lk:47.5 },
      { id:'p017', tanggal:'2024-11-05', bb:10.8, tb:82.5, lk:47.7 },
      { id:'p018', tanggal:'2024-12-05', bb:11.0, tb:83.0, lk:47.9 },
    ]},
  { id:'b008', nama:'Rara Febriani', nik:'3201010101230008', jenisKelamin:'Perempuan',
    tanggalLahir:'2023-01-15', namaIbu:'Ani Wahyuni', namaAyah:'Lukman H',
    alamat:'Jl. Teratai No. 5', noTelepon:'08901234567',
    posyandu:'Posyandu Dahlia', desa:'Cimawar',
    riwayat:[
      { id:'p019', tanggal:'2024-11-05', bb:6.9, tb:65.0, lk:42.8 },
      { id:'p020', tanggal:'2024-12-05', bb:7.1, tb:65.5, lk:43.0 },
    ]},
];

export const jadwalList = [
  { id:'j001', judul:'Posyandu Rutin Januari', tanggal:'2025-01-10', waktu:'08:00–12:00', lokasi:'Balai Desa Sukamaju', tipe:'posyandu', desa:'Sukamaju', deskripsi:'Penimbangan & pengukuran balita, vitamin A, konsultasi gizi.' },
  { id:'j002', judul:'Imunisasi Campak & Rubela', tanggal:'2025-01-17', waktu:'08:00–11:00', lokasi:'Puskesmas Sukamaju', tipe:'imunisasi', desa:'Sukamaju', deskripsi:'Imunisasi MR untuk balita 9 bln–15 thn.' },
  { id:'j003', judul:'Penyuluhan Gizi & Stunting', tanggal:'2025-01-24', waktu:'09:00–11:00', lokasi:'Aula PKK RT 03', tipe:'penyuluhan', desa:'Mekarjaya', deskripsi:'Edukasi pencegahan stunting dan PHBS.' },
  { id:'j004', judul:'Posyandu Rutin Februari', tanggal:'2025-02-07', waktu:'08:00–12:00', lokasi:'Balai Desa Sukamaju', tipe:'posyandu', desa:'Sukamaju', deskripsi:'Penimbangan & pengukuran rutin bulanan.' },
  { id:'j005', judul:'Pemberian PMT', tanggal:'2025-02-14', waktu:'09:00–11:00', lokasi:'Posyandu Mawar', tipe:'pmt', desa:'Sukamaju', deskripsi:'Pemberian makanan tambahan balita stunting.' },
];

export const trenStunting = [
  { bulan:'Jul', stunting:4, risiko:6, normal:18 },
  { bulan:'Agu', stunting:4, risiko:5, normal:19 },
  { bulan:'Sep', stunting:3, risiko:6, normal:20 },
  { bulan:'Okt', stunting:3, risiko:5, normal:21 },
  { bulan:'Nov', stunting:2, risiko:5, normal:22 },
  { bulan:'Des', stunting:2, risiko:4, normal:22 },
];

export const posyanduList = [
  { id:'ps001', nama:'Posyandu Mawar', desa:'Sukamaju', kader:'Siti Rahayu', totalBalita:12, stunting:1, aktif:true },
  { id:'ps002', nama:'Posyandu Dahlia', desa:'Mekarjaya', kader:'Rina Wulandari', totalBalita:9, stunting:2, aktif:true },
  { id:'ps003', nama:'Posyandu Anggrek', desa:'Cimawar', kader:'Lestari Budi', totalBalita:7, stunting:0, aktif:true },
  { id:'ps004', nama:'Posyandu Kenanga', desa:'Sukamaju', kader:'Fitria H', totalBalita:8, stunting:1, aktif:false },
  { id:'ps005', nama:'Posyandu Cempaka', desa:'Mekarjaya', kader:'Yuni Astuti', totalBalita:6, stunting:0, aktif:true },
];

export const userList = [
  { id:'u001', nama:'Dr. Hendra Wijaya', email:'admin@puskesmas.id', role:'admin', posyandu:'Puskesmas Sukamaju', aktif:true },
  { id:'u002', nama:'Bidan Siti Rahayu', email:'bidan@posyandu.id', role:'bidan', posyandu:'Posyandu Mawar', aktif:true },
  { id:'u003', nama:'Rina Wulandari', email:'rina@posyandu.id', role:'kader', posyandu:'Posyandu Dahlia', aktif:true },
  { id:'u004', nama:'Dewi Ratnasari', email:'dewi@gmail.com', role:'orang_tua', posyandu:'-', aktif:true },
  { id:'u005', nama:'Fitria Handayani', email:'fitria@gmail.com', role:'orang_tua', posyandu:'-', aktif:false },
];
