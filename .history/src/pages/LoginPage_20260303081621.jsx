import React, { useState } from 'react';

const DEMO_ACCOUNTS = [
  { label:'Admin Puskesmas', email:'admin@puskesmas.id', color:'#0B7B6B', bg:'#E6F5F2', icon:'🏥' },
  { label:'Bidan',           email:'bidan@posyandu.id',  color:'#7C3AED', bg:'#F5F3FF', icon:'👩‍⚕️' },
  { label:'Kader',           email:'rina@posyandu.id',   color:'#B45309', bg:'#FFFBEB', icon:'🩺' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F7F5F2;
    --white: #FFFFFF;
    --teal: #0B7B6B;
    --teal-pale: #EAF5F3;
    --text: #18211C;
    --muted: #7A8A82;
    --faint: #B5C0BB;
    --border: #E3E0DA;
    --red: #D92B3A;
  }

  html, body { background: var(--bg); }

  .root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Geist', sans-serif;
    background: var(--bg);
  }

  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 56px;
    border-right: 1px solid var(--border);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-mark {
    width: 36px; height: 36px;
    background: var(--teal);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .logo-name {
    font-family: 'Instrument Serif', serif;
    font-size: 18px;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 0;
  }

  .eyebrow {
    font-size: 11px;
    font-weight: 500;
    color: var(--teal);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 20px;
  }

  .big-title {
    font-family: 'Instrument Serif', serif;
    font-size: 54px;
    line-height: 1.08;
    color: var(--text);
    letter-spacing: -1.5px;
    margin-bottom: 24px;
  }
  .big-title i {
    font-style: italic;
    color: var(--teal);
  }

  .subtitle {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.9;
    max-width: 340px;
    font-weight: 300;
    margin-bottom: 52px;
  }

  .feat-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    border-top: 1px solid var(--border);
  }
  .feat-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 0;
    border-bottom: 1px solid var(--border);
    cursor: default;
    transition: padding-left 0.2s;
  }
  .feat-item:hover { padding-left: 6px; }
  .feat-num {
    font-size: 10px;
    font-weight: 600;
    color: var(--faint);
    width: 20px;
    flex-shrink: 0;
  }
  .feat-ico {
    font-size: 18px;
    width: 32px;
    text-align: center;
    flex-shrink: 0;
  }
  .feat-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    flex: 1;
  }
  .feat-desc {
    font-size: 12px;
    color: var(--faint);
  }

  .footer-note {
    font-size: 11px;
    color: var(--faint);
    font-weight: 300;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dot-live {
    width: 6px; height: 6px;
    background: #22C55E;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
  }

  .form-wrap {
    width: 100%;
    max-width: 360px;
  }

  .form-head { margin-bottom: 40px; }
  .form-title {
    font-family: 'Instrument Serif', serif;
    font-size: 32px;
    color: var(--text);
    letter-spacing: -0.8px;
    margin-bottom: 6px;
  }
  .form-sub { font-size: 13px; color: var(--muted); font-weight: 300; }

  .field { margin-bottom: 20px; }
  .f-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .f-wrap { position: relative; }
  .f-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--white);
    font-size: 14px;
    font-family: 'Geist', sans-serif;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-weight: 300;
  }
  .f-input::placeholder { color: var(--faint); }
  .f-input:focus {
    border-color: var(--teal);
    box-shadow: 0 0 0 3px rgba(11,123,107,0.1);
  }
  .f-input.has-toggle { padding-right: 44px; }
  .eye-btn {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 14px; padding: 4px; color: var(--faint);
    line-height: 1;
  }

  .row-between {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 24px;
    margin-top: -8px;
  }
  .link-btn {
    background: none; border: none;
    font-size: 12px; color: var(--teal);
    font-weight: 500; cursor: pointer;
    font-family: 'Geist', sans-serif;
    transition: opacity 0.15s;
    padding: 0;
  }
  .link-btn:hover { opacity: 0.65; }

  .err {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    background: #FFF1F2;
    border: 1px solid #FECDD3;
    border-radius: 8px;
    color: var(--red);
    font-size: 12px;
    margin-bottom: 16px;
    font-weight: 400;
  }

  .btn-login {
    width: 100%; padding: 13px;
    background: var(--teal);
    color: #fff; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 500;
    font-family: 'Geist', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.2px;
  }
  .btn-login:hover:not(:disabled) { background: #0a6a5b; }
  .btn-login:active:not(:disabled) { transform: scale(0.99); }
  .btn-login:disabled { opacity: 0.55; cursor: not-allowed; }

  .sep {
    display: flex; align-items: center; gap: 12px;
    margin: 28px 0 20px;
  }
  .sep-line { flex: 1; height: 1px; background: var(--border); }
  .sep-text { font-size: 11px; color: var(--faint); font-weight: 400; }

  .demo-list { display: flex; flex-direction: column; gap: 6px; }
  .demo-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--white);
    cursor: pointer;
    transition: all 0.15s;
    width: 100%;
    text-align: left;
  }
  .demo-btn:hover { border-color: var(--teal); background: var(--teal-pale); }
  .demo-btn.sel { border-color: var(--teal); background: var(--teal-pale); }
  .d-ico { font-size: 15px; width: 24px; text-align: center; }
  .d-role {
    font-size: 10px; font-weight: 600; flex-shrink: 0;
    padding: 2px 8px; border-radius: 4px;
  }
  .d-email { flex: 1; font-size: 12px; color: var(--muted); font-weight: 300; }
  .d-check { font-size: 12px; color: var(--teal); font-weight: 600; }

  .demo-note { text-align: center; font-size: 11px; color: var(--faint); margin-top: 12px; font-weight: 300; }
  .demo-note b { color: var(--muted); font-weight: 500; }

  .modal-bg {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(24,33,28,0.4);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: var(--white);
    border-radius: 20px;
    padding: 40px 32px;
    max-width: 360px; width: 90%;
    text-align: center;
    border: 1px solid var(--border);
    animation: up 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes up {
    from { opacity: 0; transform: translateY(16px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .m-ico {
    width: 64px; height: 64px; border-radius: 50%;
    background: var(--teal-pale);
    border: 1px solid rgba(11,123,107,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin: 0 auto 18px;
  }
  .m-title {
    font-family: 'Instrument Serif', serif;
    font-size: 22px; color: var(--text);
    letter-spacing: -0.5px; margin-bottom: 10px;
  }
  .m-desc { font-size: 13px; color: var(--muted); line-height: 1.75; margin-bottom: 20px; font-weight: 300; }
  .m-info {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 16px; margin-bottom: 22px;
    display: flex; align-items: flex-start; gap: 10px; text-align: left;
    font-size: 12px; color: var(--muted); line-height: 1.6;
  }
  .m-btn {
    width: 100%; padding: 12px;
    background: var(--teal); color: #fff; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: 'Geist', sans-serif; transition: background 0.15s;
  }
  .m-btn:hover { background: #0a6a5b; }
`;

export default function LoginPage({ onLogin, error: externalError }) {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [show, setShow]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');
  const [sel, setSel]     = useState(-1);
  const [warn, setWarn]   = useState(false);

  function pickDemo(i) {
    setSel(i); setEmail(DEMO_ACCOUNTS[i].email); setPass('123456');
    setErr(''); setWarn(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (!email || !pass) { setErr('Email dan password wajib diisi'); return; }
    setBusy(true); setErr(''); setWarn(false);
    const res = await onLogin(email, pass);
    setBusy(false);
    if (!res || res.ok === false) {
      if (res?.role === 'orang_tua') setWarn(true);
      else setErr('Email atau password tidak sesuai');
      return;
    }
    if (res.ok && res.role === 'orang_tua') {
      localStorage.removeItem('posyandu_user'); setWarn(true);
    }
  }

  return (
    <>
      <style>{styles}</style>

      {warn && (
        <div className="modal-bg">
          <div className="modal">
            <div className="m-ico">📱</div>
            <div className="m-title">Akun Orang Tua</div>
            <p className="m-desc">
              <strong>{email}</strong> adalah akun Orang Tua.
              Halaman ini khusus untuk Tenaga Medis &amp; Admin.
            </p>
            <div className="m-info">
              <span style={{flexShrink:0}}>📲</span>
              <div>Unduh <strong>Posyandu Digital</strong> di Play Store atau App Store untuk memantau perkembangan anak Anda.</div>
            </div>
            <button className="m-btn" onClick={() => setWarn(false)}>Mengerti</button>
          </div>
        </div>
      )}

      <div className="root">
        {/* LEFT */}
        <div className="left">
          <div className="logo">
            <div className="logo-mark">🏥</div>
            <span className="logo-name">Posyandu Digital</span>
          </div>

          <div className="hero">
            <div className="eyebrow">Platform Resmi Kemenkes RI</div>
            <h1 className="big-title">
              Kelola Data<br/>
              Balita <i>Lebih</i><br/>
              Efisien
            </h1>
            <p className="subtitle">
              Dashboard terpadu untuk monitoring stunting, manajemen
              data balita, dan pelaporan resmi ke Dinas Kesehatan.
            </p>

            <div className="feat-list">
              {[
                ['📊','Dashboard Eksekutif','Grafik real-time'],
                ['👶','Manajemen Balita','Data lengkap & export'],
                ['📋','Laporan Otomatis','Standar Kemenkes'],
              ].map(([ico, name, desc], i) => (
                <div key={name} className="feat-item">
                  <span className="feat-num">0{i+1}</span>
                  <span className="feat-ico">{ico}</span>
                  <span className="feat-name">{name}</span>
                  <span className="feat-desc">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-note">
            <span className="dot-live" />
            Sistem aktif · Versi 2.4.1
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="form-wrap">
            <div className="form-head">
              <h2 className="form-title">Masuk</h2>
              <p className="form-sub">Gunakan akun yang terdaftar di sistem</p>
            </div>

            <form onSubmit={submit}>
              <div className="field">
                <label className="f-label">Email</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="f-input"
                />
              </div>

              <div className="field">
                <label className="f-label">Password</label>
                <div className="f-wrap">
                  <input
                    type={show ? 'text' : 'password'} value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="••••••••"
                    className="f-input has-toggle"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShow(!show)}>
                    {show ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {(err || externalError) && (
                <div className="err">⚠️ {err || externalError}</div>
              )}

              <div className="row-between">
                <button type="button" className="link-btn">Lupa password?</button>
              </div>

              <button type="submit" disabled={busy} className="btn-login">
                {busy ? 'Memproses…' : 'Masuk ke Dashboard →'}
              </button>
            </form>

            <div className="sep">
              <div className="sep-line" />
              <span className="sep-text">Akun Demo</span>
              <div className="sep-line" />
            </div>

            <div className="demo-list">
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button key={i} onClick={() => pickDemo(i)} className={`demo-btn${sel===i?' sel':''}`}>
                  <span className="d-ico">{acc.icon}</span>
                  <span className="d-role" style={{background: acc.bg, color: acc.color}}>{acc.label}</span>
                  <span className="d-email">{acc.email}</span>
                  {sel === i && <span className="d-check">✓</span>}
                </button>
              ))}
            </div>

            <p className="demo-note">Password semua akun: <b>123456</b></p>
          </div>
        </div>
      </div>
    </>
  );
}