// ============================================================
//  LoginPage — LIGHT ELEGANT VERSION
//  Palette: Soft Ivory + Teal Green + Warm Gold
//  Clean editorial layout with subtle organic shapes
// ============================================================

import React, { useState } from 'react';

const DEMO_ACCOUNTS = [
  { label:'Admin Puskesmas', email:'admin@puskesmas.id', color:'#0D7B6A', bg:'#E6F5F2', icon:'🏥' },
  { label:'Bidan',           email:'bidan@posyandu.id',  color:'#7C3AED', bg:'#F5F3FF', icon:'👩‍⚕️' },
  { label:'Kader',           email:'rina@posyandu.id',   color:'#B45309', bg:'#FFFBEB', icon:'🩺' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ivory: #FAF8F4;
    --ivory2: #F3EFE7;
    --teal: #0B7B6B;
    --teal-light: #12A090;
    --teal-pale: #D4EFEB;
    --gold: #C9901A;
    --gold-pale: #FEF3C7;
    --text: #1A2332;
    --text-muted: #6B7A8D;
    --text-faint: #A0ADBC;
    --white: #FFFFFF;
    --border: #E4DDD3;
    --shadow: rgba(11,123,107,0.12);
  }

  body { background: var(--ivory); }

  .lr-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--ivory);
    position: relative;
    overflow: hidden;
  }

  /* Decorative background shapes */
  .bg-circle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .bg-c1 {
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(11,123,107,0.07) 0%, transparent 70%);
    top: -200px; left: -200px;
  }
  .bg-c2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(201,144,26,0.08) 0%, transparent 70%);
    bottom: -150px; right: 300px;
  }
  .bg-c3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(11,123,107,0.05) 0%, transparent 70%);
    top: 30%; right: -50px;
  }

  /* Decorative dots grid */
  .dots-grid {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(circle, #cfc9be 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.35;
    pointer-events: none;
  }

  /* LEFT PANEL */
  .left-panel {
    width: 52%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 64px;
    position: relative;
    z-index: 2;
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 56px;
  }
  .brand-icon {
    width: 44px; height: 44px;
    background: var(--teal);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 6px 20px rgba(11,123,107,0.25);
  }
  .brand-text-name {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 17px;
    color: var(--text);
    line-height: 1;
  }
  .brand-text-sub {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 3px;
  }
  .brand-badge-pill {
    margin-left: auto;
    background: var(--teal-pale);
    color: var(--teal);
    font-size: 10px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 100px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid rgba(11,123,107,0.15);
  }

  .live-dot {
    display: inline-block;
    width: 7px; height: 7px;
    background: #2ED36B;
    border-radius: 50%;
    margin-right: 6px;
    animation: blink 2s infinite;
    vertical-align: middle;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px #2ED36B; }
    50% { opacity: 0.5; box-shadow: 0 0 12px #2ED36B; }
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--gold-pale);
    color: var(--gold);
    font-size: 12px;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 100px;
    border: 1px solid rgba(201,144,26,0.2);
    margin-bottom: 24px;
    width: fit-content;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 50px;
    font-weight: 800;
    color: var(--text);
    line-height: 1.1;
    margin-bottom: 20px;
    letter-spacing: -1px;
  }
  .hero-title em {
    font-style: normal;
    color: var(--teal);
    position: relative;
    display: inline-block;
  }
  .hero-title em::after {
    content: '';
    position: absolute;
    bottom: 2px; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--teal-light), transparent);
    border-radius: 2px;
    opacity: 0.4;
  }

  .hero-desc {
    color: var(--text-muted);
    font-size: 15px;
    line-height: 1.85;
    margin-bottom: 44px;
    max-width: 400px;
  }

  .stats-row {
    display: flex;
    gap: 0;
    margin-bottom: 44px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    width: fit-content;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  .stat-item {
    padding: 20px 28px;
    text-align: center;
    position: relative;
  }
  .stat-item + .stat-item::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 1px; background: var(--border);
  }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 800;
    color: var(--teal); line-height: 1;
    margin-bottom: 4px;
  }
  .stat-label { font-size: 11px; color: var(--text-faint); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  .features-col { display: flex; flex-direction: column; gap: 12px; }
  .feature-row {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 20px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    transition: all 0.25s ease;
    cursor: default;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .feature-row:hover {
    border-color: var(--teal);
    box-shadow: 0 6px 24px var(--shadow);
    transform: translateY(-1px);
  }
  .feature-ico {
    width: 40px; height: 40px;
    background: var(--teal-pale);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
  }
  .feature-name { font-size: 13px; font-weight: 700; color: var(--text); }
  .feature-desc { font-size: 11px; color: var(--text-faint); margin-top: 2px; }
  .feature-arrow { margin-left: auto; color: var(--teal-pale); font-size: 18px; transition: all 0.2s; }
  .feature-row:hover .feature-arrow { color: var(--teal); transform: translateX(3px); }

  /* RIGHT PANEL */
  .right-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 48px 40px 0;
    position: relative;
    z-index: 2;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background: var(--white);
    border-radius: 32px;
    padding: 44px 40px;
    border: 1.5px solid var(--border);
    box-shadow: 0 24px 60px rgba(0,0,0,0.09), 0 8px 24px rgba(11,123,107,0.06);
    position: relative;
    overflow: hidden;
  }
  .card-top-accent {
    position: absolute; top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--teal), var(--teal-light), var(--gold));
    border-radius: 32px 32px 0 0;
  }

  .card-header { margin-bottom: 32px; padding-top: 4px; }
  .card-sup { font-size: 11px; font-weight: 700; color: var(--teal); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 800;
    color: var(--text); margin-bottom: 6px; line-height: 1.1;
  }
  .card-sub { font-size: 13px; color: var(--text-muted); }

  .field-group { margin-bottom: 18px; }
  .field-label {
    display: block;
    font-size: 11px; font-weight: 700;
    color: var(--text);
    text-transform: uppercase; letter-spacing: 0.7px;
    margin-bottom: 8px;
  }
  .input-wrap { position: relative; }
  .input-icon {
    position: absolute; left: 15px; top: 50%;
    transform: translateY(-50%); font-size: 15px; pointer-events: none;
    z-index: 1;
  }
  .text-input {
    width: 100%;
    padding: 13px 16px 13px 46px;
    border-radius: 14px;
    border: 1.5px solid var(--border);
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--ivory);
    color: var(--text);
    outline: none;
    transition: all 0.2s;
  }
  .text-input::placeholder { color: var(--text-faint); }
  .text-input:focus {
    border-color: var(--teal);
    background: var(--white);
    box-shadow: 0 0 0 4px rgba(11,123,107,0.08);
  }
  .pass-toggle {
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer; font-size: 15px; padding: 4px;
  }

  .error-box {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 14px;
    background: #FFF1F2;
    border: 1.5px solid #FECDD3;
    border-radius: 12px;
    color: #E11D48;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .forgot-row { text-align: right; margin-bottom: 20px; margin-top: -8px; }
  .forgot-btn {
    background: none; border: none;
    color: var(--teal); font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: opacity 0.2s;
  }
  .forgot-btn:hover { opacity: 0.7; text-decoration: underline; }

  .submit-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, var(--teal), var(--teal-light));
    color: #fff; border: none; border-radius: 14px;
    font-size: 15px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 8px 24px rgba(11,123,107,0.3);
    transition: all 0.2s;
    letter-spacing: 0.2px;
  }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(11,123,107,0.4);
  }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .divider {
    display: flex; align-items: center; gap: 12px; margin: 22px 0;
  }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-text { font-size: 11px; font-weight: 600; color: var(--text-faint); white-space: nowrap; }

  .demo-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px; margin-bottom: 8px;
    cursor: pointer; transition: all 0.15s;
    border: 1.5px solid var(--border);
    background: var(--ivory);
  }
  .demo-item:hover { background: var(--teal-pale); border-color: var(--teal); }
  .demo-item.active { border-color: var(--teal); background: #E6F5F2; }
  .demo-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0; background: var(--white);
    border: 1px solid var(--border);
  }
  .demo-label {
    padding: 3px 9px; border-radius: 6px;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .demo-email { flex: 1; font-size: 12px; color: var(--text-muted); font-weight: 500; }
  .demo-hint { text-align: center; font-size: 11px; color: var(--text-faint); margin-top: 8px; }
  .demo-hint strong { color: var(--teal); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(26,35,50,0.5);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
  }
  .modal-box {
    background: var(--white); border-radius: 28px;
    padding: 44px 36px; max-width: 390px; width: 90%;
    text-align: center;
    box-shadow: 0 40px 80px rgba(0,0,0,0.2);
    border: 1.5px solid var(--border);
    animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.88) translateY(16px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-icon {
    width: 76px; height: 76px; border-radius: 50%;
    background: linear-gradient(135deg, var(--teal-pale), #C7EDE8);
    border: 2.5px solid rgba(11,123,107,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 34px; margin: 0 auto 20px;
  }
  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 10px;
  }
  .modal-desc { font-size: 14px; color: var(--text-muted); line-height: 1.75; margin-bottom: 22px; }
  .modal-info {
    background: var(--ivory2);
    border: 1.5px solid var(--border);
    border-radius: 14px; padding: 16px 18px; margin-bottom: 24px;
    display: flex; align-items: flex-start; gap: 12px; text-align: left;
  }
  .modal-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, var(--teal), var(--teal-light));
    color: #fff; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 6px 20px rgba(11,123,107,0.25);
    transition: all 0.2s;
  }
  .modal-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(11,123,107,0.35); }
`;

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
    if (!email || !password) { setError('Isi email dan password terlebih dahulu'); return; }
    setLoading(true);
    setError('');
    setShowMobileWarning(false);
    const result = await onLogin(email, password);
    setLoading(false);
    if (!result || result.ok === false) {
      if (result?.role === 'orang_tua') { setShowMobileWarning(true); }
      else { setError('Email atau password tidak sesuai'); }
      return;
    }
    if (result.ok && result.role === 'orang_tua') {
      localStorage.removeItem('posyandu_user');
      setShowMobileWarning(true);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="lr-root">
        {/* Backgrounds */}
        <div className="dots-grid" />
        <div className="bg-circle bg-c1" />
        <div className="bg-circle bg-c2" />
        <div className="bg-circle bg-c3" />

        {/* Mobile Warning Modal */}
        {showMobileWarning && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-icon">📱</div>
              <div className="modal-title">Akun Orang Tua</div>
              <p className="modal-desc">
                Akun <strong style={{color:'var(--teal)'}}>{email}</strong> adalah akun <strong>Orang Tua</strong>.
                Halaman ini khusus untuk <strong>Tenaga Medis & Admin</strong>.
              </p>
              <div className="modal-info">
                <span style={{fontSize:22, flexShrink:0}}>📲</span>
                <div>
                  <div style={{fontWeight:700, fontSize:13, color:'var(--teal)', marginBottom:4}}>
                    Gunakan Aplikasi Mobile
                  </div>
                  <div style={{fontSize:12, color:'var(--text-muted)', lineHeight:1.6}}>
                    Unduh <strong>Posyandu Digital</strong> di Play Store atau App Store
                    untuk memantau perkembangan anak Anda.
                  </div>
                </div>
              </div>
              <button className="modal-btn" onClick={() => setShowMobileWarning(false)}>
                Mengerti
              </button>
            </div>
          </div>
        )}

        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <div className="brand-row">
            <div className="brand-icon">🏥</div>
            <div>
              <div className="brand-text-name">Posyandu Digital</div>
              <div className="brand-text-sub">Sistem Informasi Kesehatan Balita</div>
            </div>
           
          </div>

        

          <h1 className="hero-title">
            Kelola Data<br/>
            Balita <em>Lebih</em><br/>
            Cerdas & Cepat
          </h1>

          <p className="hero-desc">
            Dashboard terpadu untuk monitoring stunting, manajemen data balita,
            dan pelaporan resmi ke Dinas Kesehatan secara real-time.
          </p>

         

          <div className="features-col">
            {[
              ['📊', 'Dashboard Eksekutif', 'Grafik tren stunting real-time'],
              ['👶', 'Manajemen Balita',    'CRUD data lengkap & export Excel'],
              ['📋', 'Laporan Otomatis',    'Format resmi standar Kemenkes'],
            ].map(([icon, name, desc]) => (
              <div key={name} className="feature-row">
                <div className="feature-ico">{icon}</div>
                <div>
                  <div className="feature-name">{name}</div>
                  <div className="feature-desc">{desc}</div>
                </div>
                <div className="feature-arrow">›</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <div className="login-card">
            <div className="card-top-accent" />

            <div className="card-header">
              <div className="card-sup">Admin Portal</div>
              <h2 className="card-title">Selamat Datang 👋</h2>
              <p className="card-sub">Masuk menggunakan akun yang terdaftar di sistem</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="field-group">
                <label className="field-label">Email</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="text-input"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-input"
                    style={{paddingRight: 44}}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {(error || externalError) && (
                <div className="error-box">⚠️ {error || externalError}</div>
              )}

              <div className="forgot-row">
                <button type="button" className="forgot-btn">Lupa Password?</button>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? '⏳ Memproses...' : '🚀 Masuk ke Dashboard'}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">Coba Akun Demo</span>
              <div className="divider-line" />
            </div>

            {DEMO_ACCOUNTS.map((acc, i) => (
              <div
                key={i}
                onClick={() => fillDemo(i)}
                className={`demo-item${selectedDemo === i ? ' active' : ''}`}
              >
                <div className="demo-icon">{acc.icon}</div>
                <span className="demo-label" style={{ background: acc.bg, color: acc.color }}>
                  {acc.label}
                </span>
                <span className="demo-email">{acc.email}</span>
                <span style={{
                  fontSize: selectedDemo === i ? 18 : 14,
                  color: selectedDemo === i ? 'var(--teal)' : '#CBD5E1',
                  fontWeight: 700,
                }}>
                  {selectedDemo === i ? '✓' : '›'}
                </span>
              </div>
            ))}

            <p className="demo-hint">Password semua akun demo: <strong>123456</strong></p>
          </div>
        </div>
      </div>
    </>
  );
}