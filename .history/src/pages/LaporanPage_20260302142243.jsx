// ================================================================
//  PATCH FINAL: LaporanPage.jsx
//  Copy-paste ke LaporanPage.jsx sesuai petunjuk di setiap bagian
//
//  Masalah yang difix vs patch sebelumnya:
//  1. ortuOptions → cari berdasarkan nama ANAK juga (bukan hanya ibu)
//  2. anakDariOrtu → pakai field yang benar dari useBalita hook
//  3. tambahBalita() → ambil data bulan lalu dari b.beratBadan / b.tinggiBadan
//     (vw_balita_lengkap sudah include ukuran terakhir langsung di field balita)
//  4. tambahAsiDariBalita() → field namaIbu dari hook sudah camelCase
//  5. searchOrtu → bisa cari nama anak ATAU nama ibu
// ================================================================


// ════════════════════════════════════════════════════════════════
//  BAGIAN 1: Ganti komputasi ortuOptions dan anakDariOrtu
//  (yang ada sekarang di LaporanPage, cari baris:)
//  const ortuOptions = balitaList.filter(...)
//  const anakDariOrtu = ...
//  Ganti kedua baris itu dengan ini:
// ════════════════════════════════════════════════════════════════

  // Search bisa by nama anak ATAU nama ibu
  const ortuOptions = balitaList
    .filter(b => {
      const q = searchOrtu.toLowerCase();
      if (!q) return false;
      return (
        (b.namaIbu  || '').toLowerCase().includes(q) ||
        (b.nama     || '').toLowerCase().includes(q)
      );
    })
    // Deduplikasi per nama ibu untuk tampilan grup
    .reduce((acc, b) => {
      const key = b.namaIbu || b.nama;
      if (!acc.find(x => (x.namaIbu || x.nama) === key)) acc.push(b);
      return acc;
    }, []);

  // Anak-anak dari ibu yang dipilih
  const anakDariOrtu = selectedOrtu
    ? balitaList.filter(b => b.namaIbu === selectedOrtu)
    : [];


// ════════════════════════════════════════════════════════════════
//  BAGIAN 2: Ganti fungsi tambahBalita() yang lama
// ════════════════════════════════════════════════════════════════

  function tambahBalita(balita) {
    if (pemantauanRows.find(r => r.balitaId === balita.id)) {
      showError(`${balita.nama} sudah ada di daftar`);
      return;
    }

    // Data bulan lalu:
    // useBalita hook sudah map dari vw_balita_lengkap:
    //   beratBadan  = pm.berat_badan  (ukuran terakhir)
    //   tinggiBadan = pm.tinggi_badan (ukuran terakhir)
    //   tglUkurTerakhir = pm.tanggal
    // Kalau ada riwayat, ambil dari situ juga sebagai fallback
    const riwayat  = balita.riwayat || [];
    const lastUkur = riwayat.length > 0 ? riwayat[riwayat.length - 1] : null;

    const bbLalu  = balita.beratBadan  || lastUkur?.beratBadan  || lastUkur?.bb  || '';
    const tbLalu  = balita.tinggiBadan || lastUkur?.tinggiBadan || lastUkur?.tb  || '';
    const tglLalu = balita.tglUkurTerakhir
                  || lastUkur?.tanggal
                  || lastUkur?.tglUkur
                  || '';

    setPemantauanRows(prev => [...prev, {
      // ── FK ke tabel balita (WAJIB — agar ngelink di DB) ────────
      balitaId:           balita.id,

      // ── Identitas dari master balita ────────────────────────────
      noKK:               '',
      nik:                balita.nik           || '',
      anakKe:             '',
      namaAnak:           balita.nama          || '',
      tglLahir:           balita.tanggalLahir  || '',
      lp:                 balita.jenisKelamin === 'Laki-laki' ? 'L'
                        : balita.jenisKelamin === 'Perempuan'  ? 'P'
                        : balita.jenisKelamin || '',
      usiaKehamilanLahir: '',
      bbl: '', pbl: '', ukaLahir: '',

      // ── Data ortu dari master ───────────────────────────────────
      namaOrtu:           balita.namaIbu       || '',
      nikAyah:            '',
      noTlp:              balita.noTelepon     || '',
      alamat:             balita.alamat        || '',
      rt: '', rw: '',

      // ── Data bulan LALU (read-only referensi) ──────────────────
      tglUkur:            tglLalu,
      bb:                 bbLalu,
      pb:                 tbLalu,

      // ── Data baru bulan ini (diisi user) ───────────────────────
      tglUkurBaru:        new Date().toISOString().split('T')[0],
      bbBaru:             '',
      pbBaru:             '',
      lila:               '',
      statusNTO:          '',
      asiEksklusif:       '',
      vitAFeb:            '',
      vitAAgs:            '',
      bukuKIA:            '',
      ketPerkembangan:    '',
      pkat:               '',
      catatan:            '',
    }]);

    showSuccess(`✅ ${balita.nama} ditambahkan ke Section IV`);
  }


// ════════════════════════════════════════════════════════════════
//  BAGIAN 3: Ganti fungsi tambahAsiDariBalita() yang lama
// ════════════════════════════════════════════════════════════════

  function tambahAsiDariBalita(balita) {
    if (asiRows.find(r => r.balitaId === balita.id)) {
      showError(`${balita.nama} sudah ada di daftar ASI`);
      return;
    }

    // Hitung umur dari tanggalLahir
    const today    = new Date();
    const tglLahir = balita.tanggalLahir ? new Date(balita.tanggalLahir) : null;
    let umurBulan  = 0;
    if (tglLahir) {
      umurBulan = (today.getFullYear() - tglLahir.getFullYear()) * 12
                + (today.getMonth()    - tglLahir.getMonth());
      if (today.getDate() < tglLahir.getDate()) umurBulan--;
      if (umurBulan < 0) umurBulan = 0;
    }

    setAsiRows(prev => [...prev, {
      balitaId:   balita.id,                                    // FK ke balita
      namaBalita: balita.nama                          || '',
      tglLahir:   balita.tanggalLahir?.split('T')[0]  || '',
      umur:       String(umurBulan),                            // tampilan di kolom
      umurBulan:  umurBulan,                                    // angka ke DB
      e0: false, e1: false, e2: false, e3: false,
      e4: false, e5: false, e6: false,
      namaOrtu:   balita.namaIbu                       || '',
    }]);

    showSuccess(`✅ ${balita.nama} ditambahkan ke Section III (ASI)`);
  }


// ════════════════════════════════════════════════════════════════
//  BAGIAN 4: Ganti seluruh blok modal {showAddBalita && (...)}
//  Cari baris:  {showAddBalita && (
//  Sampai baris: )} yang menutup modal
//  Ganti dengan blok di bawah ini:
// ════════════════════════════════════════════════════════════════

  {showAddBalita && (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={() => { setShowAddBalita(false); setSearchOrtu(''); setSelectedOrtu(null); }}
    >
      <div
        style={{ background:'#fff', borderRadius:20, width:580, maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Tambah Balita ke Laporan</h3>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'#9E9E9E' }}>
            Cari nama anak atau nama ibu — data otomatis ter-link ke database
          </p>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div style={{ padding:'16px 24px', flex:1, overflowY:'auto' }}>

          {/* Search */}
          <input
            placeholder="🔍 Ketik nama anak atau nama ibu..."
            value={searchOrtu}
            autoFocus
            onChange={e => { setSearchOrtu(e.target.value); setSelectedOrtu(null); }}
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:12 }}
          />

          {/* List grup ibu */}
          {!selectedOrtu && searchOrtu && ortuOptions.length > 0 && (
            <div style={{ border:'1px solid #F0F0F0', borderRadius:10, overflow:'hidden' }}>
              {ortuOptions.map((b, i) => {
                const jumlahAnak = balitaList.filter(x => x.namaIbu === b.namaIbu).length;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedOrtu(b.namaIbu)}
                    style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #F9FAFB', display:'flex', alignItems:'center', gap:12, background:'#fff', transition:'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F0FDF4'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}
                  >
                    <span style={{ fontSize:24 }}>👩</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{b.namaIbu || '-'}</div>
                      <div style={{ fontSize:11, color:'#9E9E9E' }}>
                        {b.desa || b.namaPosyandu || '-'}
                      </div>
                    </div>
                    <span style={{ fontSize:12, color:'#16A34A', fontWeight:700, background:'#F0FDF4', padding:'2px 10px', borderRadius:20 }}>
                      {jumlahAnak} anak
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* List anak dari ibu terpilih */}
          {selectedOrtu && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <button
                  onClick={() => setSelectedOrtu(null)}
                  style={{ background:'none', border:'none', color:'#2563EB', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}
                >
                  ← Kembali
                </button>
                <span style={{ fontSize:13, fontWeight:700, color:'#1B6B3A' }}>👩 {selectedOrtu}</span>
                <span style={{ fontSize:11, color:'#9E9E9E' }}>({anakDariOrtu.length} anak)</span>
              </div>

              {anakDariOrtu.length === 0 && (
                <div style={{ textAlign:'center', padding:'24px', color:'#9E9E9E' }}>
                  Tidak ada data anak untuk ibu ini
                </div>
              )}

              {anakDariOrtu.map(b => {
                const umur    = hitungUmurBulan(b.tanggalLahir);
                const sudahIV = pemantauanRows.find(r => r.balitaId === b.id);
                const sudahIII= asiRows.find(r => r.balitaId === b.id);

                // Data ukuran terakhir — dari vw_balita_lengkap via hook
                const bbTerakhir = b.beratBadan  || '';
                const tbTerakhir = b.tinggiBadan || '';
                const tglTerakhir= b.tglUkurTerakhir || '';

                return (
                  <div
                    key={b.id}
                    style={{ padding:'14px', borderRadius:12, background:'#F9FAFB', marginBottom:10, border:'1px solid #E5E7EB' }}
                  >
                    {/* Info anak */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background: b.jenisKelamin==='Laki-laki'?'#EFF6FF':'#FDF2F8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                        {b.jenisKelamin==='Laki-laki' ? '👦' : '👧'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{b.nama}</div>
                        <div style={{ fontSize:11, color:'#9E9E9E' }}>
                          {umur} bln • {b.jenisKelamin}
                          {b.nik ? ` • NIK: ${b.nik}` : ''}
                        </div>
                        {/* Ukuran terakhir dari vw_balita_lengkap */}
                        {(bbTerakhir || tbTerakhir) ? (
                          <div style={{ fontSize:11, color:'#16A34A', marginTop:3, fontWeight:600 }}>
                            📊 Bulan lalu: BB {bbTerakhir}kg • TB {tbTerakhir}cm
                            {tglTerakhir ? ` (${tglTerakhir.split('T')[0]})` : ''}
                          </div>
                        ) : (
                          <div style={{ fontSize:11, color:'#D97706', marginTop:3 }}>
                            ⚠️ Belum ada data ukuran
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tombol aksi */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>

                      {/* Section IV — Pemantauan Pertumbuhan */}
                      {sudahIV ? (
                        <span style={{ fontSize:11, color:'#16A34A', fontWeight:700, padding:'6px 12px', background:'#F0FDF4', borderRadius:8, border:'1px solid #BBF7D0' }}>
                          ✅ Ada di Sec. IV
                        </span>
                      ) : (
                        <button
                          onClick={() => tambahBalita(b)}
                          style={{ padding:'7px 14px', background:'#1B6B3A', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}
                        >
                          + Sec. IV (Timbang)
                        </button>
                      )}

                      {/* Section III — ASI (hanya bayi ≤ 12 bln) */}
                      {umur <= 12 && (
                        sudahIII ? (
                          <span style={{ fontSize:11, color:'#2563EB', fontWeight:700, padding:'6px 12px', background:'#EFF6FF', borderRadius:8, border:'1px solid #BFDBFE' }}>
                            ✅ Ada di Sec. III ASI
                          </span>
                        ) : (
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
              <div style={{ fontWeight:600 }}>Tidak ada hasil untuk "{searchOrtu}"</div>
              <div style={{ fontSize:11, marginTop:4 }}>
                Coba ketik nama anak atau nama ibu yang berbeda
              </div>
            </div>
          )}

          {/* Belum ketik apa-apa */}
          {!searchOrtu && (
            <div style={{ textAlign:'center', padding:'32px', color:'#9E9E9E' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>👆</div>
              <div style={{ fontSize:13 }}>Ketik nama untuk mencari balita</div>
            </div>
          )}

        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div style={{ padding:'12px 24px', borderTop:'1px solid #F0F0F0', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#9E9E9E' }}>
            {pemantauanRows.length} di Sec.IV • {asiRows.filter(r=>r.balitaId).length} di Sec.III
          </span>
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