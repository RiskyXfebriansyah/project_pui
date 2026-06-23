// ============================================================
//  LoginPage — VIEW LOGIN (FIXED)
//  - onLogin sekarang return { ok, role }
//  - Orang tua dapat peringatan mobile
//  - Login sukses → parent (App) otomatis render Dashboard karena user ter-set
// ============================================================

import React, { useState } from 'react';

const DEMO_ACCOUNTS = [
  { label:'Admin Puskesmas', email:'admin@puskesmas.id', color:'#1B5E20', bg:'#F0FDF4' },
  { label:'Bidan',           email:'bidan@posyandu.id',  color:'#1565C0', bg:'#EFF6FF' },
  { label:'Kader',           email:'rina@posyandu.id',   color:'#6A1B9A', bg:'#F5F3FF' },
];

export default function LoginPage({ onLogin, error: externalError }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState('');
  const [selectedDemo, setDemo] = useState(-1);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  function fillDemo(idx) {
    setDemo(idx);
    setEmail(DEMO_ACCOUNTS[idx].email);
    setPassword('123456');
    setError('');
    setShowMobileWarning(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) { setError('Isi email dan password'); return; }

    setLoading(true);
    setError('');
    setShowMobileWarning(false);

    // onLogin return { ok, role } dari useAuth
    const result = await onLogin(email, password);

    setLoading(false);

    if (!result || result.ok === false) {
      // Cek apakah role orang_tua
      if (result?.role === 'orang_tua') {
        setShowMobileWarning(true);
      } else {
        setError('Email atau password salah');
      }
      return;
    }

    // ✅ Kalau result.ok === true → App.jsx otomatis re-render ke dashboard
    // karena user state di useAuth sudah ter-set, tidak perlu redirect manual
    // Hanya perlu handle orang_tua yang tidak boleh masuk web
    if (result.ok && result.role === 'orang_tua') {
      // Hapus session yang baru disimpan
      localStorage.removeItem('posyandu_user');
      setShowMobileWarning(true);
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      fontFamily:"'Plus Jakarta Sans', sans-serif", background:'#F7FAF8'
    }}>

      {/* ── MODAL notif orang tua ─────────────────────────────── */}
      {showMobileWarning && (
        <div style={{
          position:'fixed', inset:0, zIndex:99999,
          background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            background:'#fff', borderRadius:24, padding:'40px 36px',
            maxWidth:400, width:'90%', textAlign:'center',
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width:80, height:80, borderRadius:'50%',
              background:'linear-gradient(135deg,#FFF7ED,#FED7AA)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:40, margin:'0 auto 20px',
              border:'3px solid #FDE68A',
            }}>📱</div>

            <h2 style={{ fontSize:20, fontWeight:800, color:'#1A1A1A', margin:'0 0 10px' }}>
              Akun Orang Tua
            </h2>
            <p style={{
              fontSize:14, color:'#6B7280', lineHeight:1.7, margin:'0 0 24px'
            }}>
              Akun <strong style={{color:'#EA580C'}}>{email}</strong> adalah akun <strong>Orang Tua</strong>.
              <br/>
              Halaman web ini khusus untuk <strong>Tenaga Medis & Admin</strong>.
            </p>

            <div style={{
              background:'#FFF7ED', border:'1.5px solid #FED7AA',
              borderRadius:14, padding:'16px 20px', marginBottom:24,
              display:'flex', alignItems:'flex-start', gap:12, textAlign:'left',
            }}>
              <span style={{fontSize:22, flexShrink:0}}>📲</span>
              <div>
                <div style={{fontWeight:700, fontSize:13, color:'#C2410C', marginBottom:4}}>
                  Gunakan Aplikasi Mobile
                </div>
                <div style={{fontSize:12, color:'#92400E', lineHeight:1.6}}>
                  Unduh aplikasi <strong>Posyandu Digital</strong> di Play Store atau App Store
                  untuk memantau perkembangan anak Anda.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileWarning(false)}
              style={{
                width:'100%', padding:'13px', background:'#1B6B3A',
                color:'#fff', border:'none', borderRadius:12,
                fontSize:14, fontWeight:700, cursor:'pointer',
                fontFamily:'inherit',
              }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ── Kolom kiri — ilustrasi ── */}
      <div style={{
        width:'45%', background:'linear-gradient(135deg, #0D3D1E 0%, #1B6B3A 60%, #2E9B56 100%)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 48px', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48 }}>
            <div style={{
              width:44, height:44, background:'rgba(255,255,255,0.15)',
              borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:24
            }}>❤️</div>
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:18 }}>Posyandu Digital</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>Admin Web Panel</div>
            </div>
          </div>

          <h1 style={{ color:'#fff', fontSize:36, fontWeight:800, lineHeight:1.2, margin:'0 0 16px' }}>
            Kelola Posyandu<br/>
            <span style={{ color:'#86EFAC' }}>Lebih Cerdas</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.7, margin:'0 0 40px' }}>
            Dashboard admin untuk monitoring stunting, manajemen data balita,
            dan laporan ke Dinas Kesehatan.
          </p>

          {[
            ['📊','Dashboard Eksekutif','Grafik tren stunting real-time'],
            ['👶','Manajemen Balita','CRUD data & export Excel'],
            ['📋','Laporan Otomatis','Format resmi Kemenkes'],
          ].map(([icon,title,sub])=>(
            <div key={title} style={{ display:'flex', gap:14, marginBottom:20, alignItems:'flex-start' }}>
              <div style={{
                width:38, height:38, background:'rgba(255,255,255,0.1)',
                borderRadius:10, display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:18, flexShrink:0
              }}>{icon}</div>
              <div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{title}</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kolom kanan — form ── */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40
      }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:'#1A1A1A', margin:'0 0 4px' }}>
            Masuk ke Akun
          </h2>
          <p style={{ color:'#9E9E9E', fontSize:13, margin:'0 0 32px' }}>
            Gunakan akun yang terdaftar di sistem
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#6B7280', display:'block', marginBottom:6 }}>
                Email
              </label>
              <div style={{ position:'relative' }}>
                <span style={{
                  position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
                  fontSize:16, color:'#1B6B3A'
                }}>✉️</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  style={{
                    width:'100%', padding:'12px 14px 12px 42px', borderRadius:12,
                    border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'inherit',
                    outline:'none', boxSizing:'border-box', background:'#F9FAFB',
                  }}
                  onFocus={e=>e.target.style.borderColor='#1B6B3A'}
                  onBlur={e=>e.target.style.borderColor='#E5E7EB'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:8 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#6B7280', display:'block', marginBottom:6 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <span style={{
                  position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16
                }}>🔒</span>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width:'100%', padding:'12px 44px 12px 42px', borderRadius:12,
                    border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:'inherit',
                    outline:'none', boxSizing:'border-box', background:'#F9FAFB',
                  }}
                  onFocus={e=>e.target.style.borderColor='#1B6B3A'}
                  onBlur={e=>e.target.style.borderColor='#E5E7EB'}
                />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:16, padding:4
                }}>{showPass?'🙈':'👁️'}</button>
              </div>
            </div>

            {/* Error — tampilkan dari state lokal atau dari prop */}
            {(error || externalError) && (
              <div style={{
                padding:'10px 14px', borderRadius:10, background:'#FEF2F2',
                border:'1px solid #FECACA', color:'#DC2626', fontSize:13,
                display:'flex', alignItems:'center', gap:8, marginBottom:12, marginTop:8
              }}>
                ⚠️ {error || externalError}
              </div>
            )}

            {/* Lupa password */}
            <div style={{ textAlign:'right', marginBottom:20 }}>
              <button type="button" style={{
                background:'none', border:'none', color:'#1B6B3A', fontSize:12,
                fontWeight:600, cursor:'pointer', fontFamily:'inherit'
              }}>Lupa Password?</button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} style={{
              width:'100%', padding:'14px', background:'#1B6B3A', color:'#fff',
              border:'none', borderRadius:12, fontSize:15, fontWeight:700,
              cursor: isLoading?'not-allowed':'pointer', fontFamily:'inherit',
              opacity: isLoading?0.8:1, display:'flex', alignItems:'center',
              justifyContent:'center', gap:8
            }}>
              {isLoading ? '⏳ Memuat...' : '🚀 Masuk'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:28 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:12, marginBottom:14, color:'#BDBDBD'
            }}>
              <div style={{ flex:1, height:1, background:'#F0F0F0' }}/>
              <span style={{ fontSize:11, fontWeight:500 }}>Demo Akun</span>
              <div style={{ flex:1, height:1, background:'#F0F0F0' }}/>
            </div>

            {DEMO_ACCOUNTS.map((acc, i) => (
              <div key={i} onClick={()=>fillDemo(i)} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'10px 14px', borderRadius:12, marginBottom:8,
                cursor:'pointer', transition:'all .15s',
                background: selectedDemo===i ? acc.bg : '#F9FAFB',
                border: `1.5px solid ${selectedDemo===i ? acc.color+'44' : 'transparent'}`,
              }}>
                <div style={{
                  width:8, height:8, borderRadius:'50%', background:acc.color, flexShrink:0
                }}/>
                <span style={{
                  padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700,
                  background:acc.bg, color:acc.color
                }}>{acc.label}</span>
                <span style={{ flex:1, fontSize:12, color:'#374151', fontWeight:500 }}>
                  {acc.email}
                </span>
                {selectedDemo===i
                  ? <span style={{ fontSize:16 }}>✅</span>
                  : <span style={{ fontSize:12, color:'#BDBDBD' }}>○</span>
                }
              </div>
            ))}
            <div style={{ textAlign:'center', fontSize:11, color:'#BDBDBD', marginTop:8 }}>
              Password semua akun: <strong>123456</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}