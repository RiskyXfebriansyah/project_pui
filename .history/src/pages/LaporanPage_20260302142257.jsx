// ================================================================
//  PATCH: LaporanPage.jsx
//  Perubahan utama:
//  1. tambahBalita() → auto-populate SEMUA field dari data balita
//  2. tambahAsiDariBalita() → Section III auto-link dari balita
//  3. Modal "Tambah Balita" juga bisa tambah ke Section III (ASI)
//  4. Saat load dari DB, BalitaId di-preserve agar FK tetap terjaga
// ================================================================

// ── PASTE ini menggantikan fungsi tambahBalita() yang ada ────────

  /**
   * Tambah balita ke Section IV (Pemantauan Pertumbuhan)
   * Auto-populate semua field dari data balita master (DB)
   * BalitaId disimpan agar FK ke tabel balita terjaga di DB
   */
  function tambahBalita(balita) {
    if (pemantauanRows.find(r => r.balitaId === balita.id)) {
      showError(`${balita.nama} sudah ada di daftar`);
      return;
    }

    // Riwayat pemantauan terakhir (bulan lalu)
    const riwayat  = balita.riwayat || [];
    const lastUkur = riwayat.length > 0 ? riwayat[riwayat.length - 1] : null;

    setPemantauanRows(prev => [...prev, {
      // ─── FK ke tabel balita — WAJIB ADA agar ngelink di DB ────
      balitaId:            balita.id,

      // ─── Data identitas dari master balita ─────────────────────
      noKK:                '',
      nik:                 balita.nik        || '',
      anakKe:              '',
      namaAnak:            balita.nama       || '',
      tglLahir:            balita.tanggalLahir || '',
      lp:                  balita.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
      usiaKehamilanLahir:  '',
      bbl: '', pbl: '', ukaLahir: '',

      // Nama ortu dari data master
      namaOrtu:            balita.namaIbu    || '',
      nikAyah:             '',
      noTlp:               balita.noTelepon  || '',
      alamat:              balita.alamat     || '',
      rt: '', rw: '',

      // ─── Data bulan lalu (dari riwayat pemantauan terakhir) ────
      // Ini ditampilkan sebagai referensi, tidak diubah user
      tglUkur:             lastUkur?.tanggal || lastUkur?.tglUkur || '',
      bb:                  lastUkur?.beratBadan || lastUkur?.bb || '',
      pb:                  lastUkur?.tinggiBadan || lastUkur?.tb || '',

      // ─── Data baru bulan ini — diisi user ──────────────────────
      tglUkurBaru:         new Date().toISOString().split('T')[0],
      bbBaru:              '',
      pbBaru:              '',
      lila:                '',
      statusNTO:           '',
      asiEksklusif:        '',
      vitAFeb:             '',
      vitAAgs:             '',
      bukuKIA:             '',
      ketPerkembangan:     '',
      pkat:                '',
      catatan:             '',
    }]);

    showSuccess(`✅ ${balita.nama} ditambahkan ke Section IV`);
  }

  /**
   * Tambah balita ke Section III (ASI Eksklusif)
   * Auto-populate nama, tgl lahir, nama ortu, dan hitung umur
   */
  function tambahAsiDariBalita(balita) {
    if (asiRows.find(r => r.balitaId === balita.id)) {
      showError(`${balita.nama} sudah ada di daftar ASI`);
      return;
    }

    const today = new Date();
    const tglLahir = balita.tanggalLahir ? new Date(balita.tanggalLahir) : null;
    let umurBulan = 0;
    if (tglLahir) {
      umurBulan = (today.getFullYear() - tglLahir.getFullYear()) * 12
                + (today.getMonth()   - tglLahir.getMonth());
      if (today.getDate() < tglLahir.getDate()) umurBulan--;
      if (umurBulan < 0) umurBulan = 0;
    }

    setAsiRows(prev => [...prev, {
      balitaId:   balita.id,                          // FK ke balita
      namaBalita: balita.nama || '',
      tglLahir:   balita.tanggalLahir?.split('T')[0] || '',
      umur:       String(umurBulan),                  // tampilan
      umurBulan:  umurBulan,                          // angka ke DB
      e0: false, e1: false, e2: false, e3: false,
      e4: false, e5: false, e6: false,
      namaOrtu:   balita.namaIbu || '',
    }]);

    showSuccess(`✅ ${balita.nama} ditambahkan ke Section III (ASI)`);
  }


// ── PASTE ini menggantikan bagian Modal "Tambah Balita" ──────────
// Cari: {showAddBalita && (  ... sampai )} (penutup modal)
// Ganti dengan ini:

  {showAddBalita && (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={() => { setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null); }}
    >
      <div
        style={{ background:'#fff', borderRadius:20, width:560, maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header modal */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Tambah Balita ke Laporan</h3>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>
            Cari nama anak atau nama ibu — data otomatis ter-link ke database balita
          </p>
        </div>

        <div style={{ padding:'16px 24px', flex:1, overflowY:'auto' }}>
          {/* Search input */}
          <input
            placeholder="🔍 Ketik nama anak atau nama ibu..."
            value={searchOrtu}
            autoFocus
            onChange={e => { setSearchOrtu(e.target.value); setSelectedOrtu(null); }}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:12 }}
          />

          {/* Daftar orang tua yang cocok */}
          {!selectedOrtu && searchOrtu && ortuOptions.length > 0 && (
            <div style={{ border:'1px solid #F0F0F0', borderRadius:10, overflow:'hidden' }}>
              {ortuOptions.map((b, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedOrtu(b.namaIbu)}
                  style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', gap:12 }}
                  onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}
                >
                  <span style={{ fontSize:24 }}>👩</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{b.namaIbu}</div>
                    <div style={{ fontSize:11, color:'#9E9E9E' }}>{b.desa || b.namaPosyandu || '-'}</div>
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:12, color:'#9E9E9E', background:'#F0FDF4', padding:'2px 8px', borderRadius:20 }}>
                    {balitaList.filter(x => x.namaIbu === b.namaIbu).length} anak
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Daftar anak dari ortu terpilih */}
          {selectedOrtu && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <button onClick={() => setSelectedOrtu(null)} style={{ background:'none', border:'none', color:'#2563EB', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  ← Kembali
                </button>
                <span style={{ fontSize:13, fontWeight:700, color:'#1B6B3A' }}>👩 {selectedOrtu}</span>
              </div>

              {anakDariOrtu.map(b => {
                const umur       = hitungUmurBulan(b.tanggalLahir);
                const lastUkur   = b.riwayat?.[b.riwayat.length - 1];
                const sudahIV    = pemantauanRows.find(r => r.balitaId === b.id);
                const sudahIII   = asiRows.find(r => r.balitaId === b.id);

                return (
                  <div key={b.id} style={{ padding:'14px', borderRadius:12, background:'#F9FAFB', marginBottom:10, border:'1px solid #E5E7EB' }}>
                    {/* Info anak */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <span style={{ fontSize:28 }}>{b.jenisKelamin==='Laki-laki'?'👦':'👧'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{b.nama}</div>
                        <div style={{ fontSize:11, color:'#9E9E9E' }}>
                          {umur} bln • {b.jenisKelamin}
                          {b.nik && ` • NIK: ${b.nik}`}
                        </div>
                        {lastUkur && (
                          <div style={{ fontSize:11, color:'#16A34A', marginTop:2 }}>
                            📊 Ukur terakhir: BB {lastUkur.beratBadan || lastUkur.bb}kg • TB {lastUkur.tinggiBadan || lastUkur.tb}cm
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tombol tambah ke Section III dan IV */}
                    <div style={{ display:'flex', gap:8 }}>
                      {/* Section IV — Pemantauan Pertumbuhan */}
                      {sudahIV
                        ? <span style={{ fontSize:11, color:'#16A34A', fontWeight:700, padding:'6px 10px', background:'#F0FDF4', borderRadius:8 }}>✅ Ada di Section IV</span>
                        : (
                          <button
                            onClick={() => tambahBalita(b)}
                            style={{ padding:'7px 14px', background:'#1B6B3A', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}
                          >
                            + Sec. IV (Timbang)
                          </button>
                        )
                      }

                      {/* Section III — ASI Eksklusif (hanya bayi ≤ 12 bln) */}
                      {umur <= 12 && (
                        sudahIII
                          ? <span style={{ fontSize:11, color:'#2563EB', fontWeight:700, padding:'6px 10px', background:'#EFF6FF', borderRadius:8 }}>✅ Ada di Sec. III ASI</span>
                          : (
                            <button
                              onClick={() => tambahAsiDariBalita(b)}
                              style={{ padding:'7px 14px', background:'#2563EB', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}
                            >
                              + Sec. III (ASI)
                            </button>
                          )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tidak ditemukan */}
          {searchOrtu && !selectedOrtu && ortuOptions.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🔍</div>
              <div>Tidak ada data untuk "{searchOrtu}"</div>
              <div style={{ fontSize:11, marginTop:4 }}>Data balita diambil dari menu Data Balita</div>
            </div>
          )}
        </div>

        <div style={{ padding:'12px 24px', borderTop:'1px solid #F0F0F0', flexShrink:0 }}>
          <button
            onClick={() => { setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null); }}
            style={{ padding:'8px 18px', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )}