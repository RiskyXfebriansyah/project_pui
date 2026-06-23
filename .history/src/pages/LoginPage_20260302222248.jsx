// ============================================================
//  LoginPage — REDESIGNED VERSION
//  New color: Deep Navy + Warm Amber + Soft Cream
//  Modern glass morphism + elegant typography
// ============================================================

import React, { useState } from 'react';

const DEMO_ACCOUNTS = [
  { label:'Admin Puskesmas', email:'admin@puskesmas.id', color:'#D97706', bg:'#FFFBEB', icon:'🏥' },
  { label:'Bidan',           email:'bidan@posyandu.id',  color:'#7C3AED', bg:'#F5F3FF', icon:'👩‍⚕️' },
  { label:'Kader',           email:'rina@posyandu.id',   color:'#0369A1', bg:'#F0F9FF', icon:'🩺' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    display: flex;
    background: #0A0F1E;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: floatBlob 8s ease-in-out infinite;
    pointer-events: none;
  }
  .blob-1 { width: 500px; height: 500px; background: #F59E0B; top: -100px; left: -100px; animation-delay: 0s; }
  .blob-2 { width: 400px; height: 400px; background: #7C3AED; bottom: -80px; left: 30%; animation-delay: 3s; }
  .blob-3 { width: 350px; height: 350px; background: #0EA5E9; top: 40%; right: -50px; animation-delay: 1.5s; }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  }

  .left-panel {
    width: 48%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 64px 56px;
    position: relative;
    z-index: 1;
  }

  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 10px 18px;
    border-radius: 100px;
    margin-bottom: 48px;
    width: fit-content;
    backdrop-filter: blur(10px);
  }
  .brand-dot {
    width: 8px; height: 8px;
    background: #F59E0B;
    border-radius: 50%;
    animation: pulseDot 2s infinite;
  }
  @keyframes pulseDot {
    0%, 100% { box-shadow: 0 0 6px #F59E0B; }
    50% { box-shadow: 0 0 18px #F59E0B, 0 0 30px rgba(245,158,11,0.4); }
  }
  .brand-name { color: #fff; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px; }
  .brand-sub { color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 500; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 10px; margin-left: 2px; }

  .hero-title {
    font-family: 'Sora', sans-serif;
    color: #fff;
    font-size: 42px;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 18px;
    letter-spacing: -0.5px;
  }
  .hero-title span { color: #F59E0B; }

  .hero-desc {
    color: rgba(255,255,255,0.45);
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 40px;
    max-width: 380px;
  }

  .feature-card {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    padding: 16px 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    cursor: default;
  }
  .feature-card:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(245,158,11,0.3);
    transform: translateX(4px);
  }
  .feature-icon {
    width: 42px; height: 42px;
    background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05));
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .feature-title { color: #fff; font-weight: 600; font-size: 13px; }
  .feature-sub { color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 2px; }

  .right-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;
    z-index: 1;
  }

  .login-card {
    width: 100%;
    max-width: 440px;
    background: rgba(255,255,255,0.97);
    border-radius: 28px;
    padding: 44px 40px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08);
  }

  .card-title {
    font-family: 'Sora', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #0A0F1E;
    margin-bottom: 6px;
  }
  .card-subtitle { color: #94A3B8; font-size: 13px; margin-bottom: 30px; }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 8px;
  }
  .input-wrap { position: relative; margin-bottom: 18px; }
  .input-icon {
    position: absolute; left: 16px; top: 50%;
    transform: translateY(-50%); font-size: 15px;
    pointer-events: none; z-index: 1;
  }
  .text-input {
    width: 100%;
    padding: 13px 16px 13px 46px;
    border-radius: 14px;
    border: 1.5px solid #E2E8F0;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    background: #F8FAFC;
    color: #0F172A;
    outline: none;
    transition: all 0.2s;
  }
  .text-input:focus {
    border-color: #F59E0B;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(245,158,11,0.1);
  }
  .pass-toggle {
    position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer; font-size: 15px; padding: 4px;
  }

  .error-box {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 14px;
    background: #FEF2F2;
    border: 1.5px solid #FECACA;
    border-radius: 12px;
    color: #DC2626;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .forgot-row { text-align: right; margin-bottom: 20px; margin-top: -6px; }
  .forgot-btn {
    background: none; border: none;
    color: #F59E0B; font-size: 12px;
    font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.2s;
  }
  .forgot-btn:hover { color: #D97706; text-decoration: underline; }

  .submit-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #F59E0B, #D97706);
    color: #fff; border: none; border-radius: 14px;
    font-size: 15px; font-weight: 700;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 8px 24px rgba(245,158,11,0.35);
    transition: all 0.2s;
    letter-spacing: 0.2px;
  }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(245,158,11,0.45);
  }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0;
  }
  .divider-line { flex: 1; height: 1px; background: #F1F5F9; }
  .divider-text { font-size: 11px; font-weight: 600; white-space: nowrap; color: #94A3B8; }

  .demo-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px; margin-bottom: 8px;
    cursor: pointer; transition: all 0.15s;
    border: 1.5px solid #F1F5F9;
    background: #F8FAFC;
  }
  .demo-item:hover { background: #F1F5F9; border-color: #E2E8F0; }
  .demo-item.active { border-color: #F59E0B !important; background: #FFFBEB !important; }

  .demo-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
    background: rgba(0,0,0,0.04);
  }
  .demo-label {
    padding: 2px 8px; border-radius: 6px;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .demo-email { flex: 1; font-size: 12px; color: #475569; font-weight: 500; }
  .demo-hint { text-align: center; font-size: 11px; color: #94A3B8; margin-top: 6px; }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(10,15,30,0.75);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
  }
  .modal-box {
    background: #fff; border-radius: 28px;
    padding: 44px 36px; max-width: 400px; width: 90%;
    text-align: center;
    box-shadow: 0 40px 80px rgba(0,0,0,0.35);
    animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.85) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, #FFF7ED, #FED7AA);
    border: 3px solid #FDE68A;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin: 0 auto 20px;
  }
  .modal-title {
    font-family: 'Sora', sans-serif;
    font-size: 20px; font-weight: 800; color: #0A0F1E; margin-bottom: 10px;
  }
  .modal-desc { font-size: 14px; color: #64748B; line-height: 1.7; margin-bottom: 22px; }
  .modal-info {
    background: #FFF7ED; border: 1.5px solid #FED7AA;
    border-radius: 14px; padding: 16px 20px; margin-bottom: 24px;
    display: flex; align-items: flex-start; gap: 12px; text-align: left;
  }
  .modal-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #F59E0B, #D97706);
    color: #fff; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: 'Sora', sans-serif;
    box-shadow: 0 6px 20px rgba(245,158,11,0.3);
    transition: all 0.2s;
  }
  .modal-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(245,158,11,0.4); }
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
    if (!email || !password) { setError('Isi email dan password'); return; }
    setLoading(true);
    setError('');
    setShowMobileWarning(false);
    const result = await onLogin(email, password);
    setLoading(false);
    if (!result || result.ok === false) {
      if (result?.role === 'orang_tua') { setShowMobileWarning(true); }
      else { setError('Email atau password salah'); }
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
      <div className="login-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Modal */}
        {showMobileWarning && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-icon">📱</div>
              <div className="modal-title">Akun Orang Tua</div>
              <p className="modal-desc">
                Akun <strong style={{color:'#D97706'}}>{email}</strong> adalah akun <strong>Orang Tua</strong>.
                <br/>Halaman ini khusus untuk <strong>Tenaga Medis & Admin</strong>.
              </p>
              <div className="modal-info">
                <span style={{fontSize:22, flexShrink:0}}>📲</span>
                <div>
                  <div style={{fontWeight:700, fontSize:13, color:'#C2410C', marginBottom:4}}>
                    Gunakan Aplikasi Mobile
                  </div>
                  <div style={{fontSize:12, color:'#92400E', lineHeight:1.6}}>
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

        {/* Left */}
        <div className="left-panel">
          <div className="brand-badge">
            <div className="brand-dot" />
            <span className="brand-name">Posyandu Digital</span>
            <span className="brand-sub">Admin Panel</span>
          </div>

          <h1 className="hero-title">
            Kelola Data<br/>
            Balita <span>Lebih</span><br/>
            <span>Cerdas</span>
          </h1>
          <p className="hero-desc">
            Dashboard terpadu untuk monitoring stunting, manajemen data balita,
            dan pelaporan resmi ke Dinas Kesehatan secara real-time.
          </p>

          {[
            ['📊','Dashboard Eksekutif','Grafik tren stunting real-time'],
            ['👶','Manajemen Balita','CRUD data lengkap & export Excel'],
            ['📋','Laporan Otomatis','Format resmi standar Kemenkes'],
          ].map(([icon, title, sub]) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <div>
                <div className="feature-title">{title}</div>
                <div className="feature-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right */}
        <div className="right-panel">
          <div className="login-card">
            <h2 className="card-title">Selamat Datang 👋</h2>
            <p className="card-subtitle">Masuk menggunakan akun yang terdaftar di sistem</p>

            <form onSubmit={handleLogin}>
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

              <label className="field-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-input"
                  style={{paddingRight:44}}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
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
              <span className="divider-text">Akun Demo</span>
              <div className="divider-line" />
            </div>

            {DEMO_ACCOUNTS.map((acc, i) => (
              <div
                key={i}
                onClick={() => fillDemo(i)}
                className={`demo-item${selectedDemo === i ? ' active' : ''}`}
              >
                <div className="demo-icon">{acc.icon}</div>
                <span className="demo-label" style={{background: acc.bg, color: acc.color}}>
                  {acc.label}
                </span>
                <span className="demo-email">{acc.email}</span>
                <span style={{
                  fontSize: selectedDemo === i ? 18 : 14,
                  color: selectedDemo === i ? '#F59E0B' : '#CBD5E1',
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