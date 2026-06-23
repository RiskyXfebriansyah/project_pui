import React, { useState, useEffect, useRef } from 'react';

const DEMO_ACCOUNTS = [
  { label:'Admin Puskesmas', email:'admin@puskesmas.id', color:'#0B7B6B', bg:'#E6F5F2', icon:'🏥' },
  { label:'Bidan',           email:'bidan@posyandu.id',  color:'#7C3AED', bg:'#F5F3FF', icon:'👩‍⚕️' },
  { label:'Kader',           email:'rina@posyandu.id',   color:'#B45309', bg:'#FFFBEB', icon:'🩺' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cabinet+Grotesk:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:   #FBF8F3;
    --cream2:  #F2EDE4;
    --sage:    #3D6B5A;
    --sage-l:  #5A9080;
    --sage-p:  #E4F0EC;
    --gold:    #B8914A;
    --gold-p:  #FDF3E0;
    --text:    #1C2B22;
    --muted:   #6E7E72;
    --faint:   #B0BDB4;
    --border:  #DDD8CF;
    --white:   #FFFFFF;
    --red:     #C0392B;
  }

  html, body {
    background: var(--cream);
    min-height: 100vh;
  }

  /* ──────────────────────────────────
     PAGE LOAD ANIMATION KEYFRAMES
  ────────────────────────────────── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes drawLine {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%  { transform: translateY(-12px) rotate(1deg); }
    66%  { transform: translateY(6px) rotate(-1deg); }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50%  { transform: translateY(-18px); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulseSoft {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(61,107,90,0.4); }
    50%       { opacity: 0.7; box-shadow: 0 0 0 8px rgba(61,107,90,0); }
  }
  @keyframes typing {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.88) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes progressBar {
    from { width: 0%; }
    to   { width: 100%; }
  }

  /* ──────────────────────────────────
     ROOT LAYOUT
  ────────────────────────────────── */
  .root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 55% 45%;
    font-family: 'Cabinet Grotesk', sans-serif;
    background: var(--cream);
    animation: fadeIn 0.4s ease;
  }

  /* ──────────────────────────────────
     DECORATIVE BACKGROUND ORBS
  ────────────────────────────────── */
  .orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(60px);
  }
  .orb-1 {
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(61,107,90,0.12) 0%, transparent 70%);
    top: -120px; left: -100px;
    animation: floatSlow 12s ease-in-out infinite;
  }
  .orb-2 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(184,145,74,0.1) 0%, transparent 70%);
    bottom: -80px; left: 20%;
    animation: floatSlow 16s ease-in-out infinite reverse;
  }
  .orb-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(61,107,90,0.08) 0%, transparent 70%);
    top: 40%; right: -60px;
    animation: floatSlow 10s ease-in-out infinite 2s;
  }

  /* ──────────────────────────────────
     LEFT PANEL
  ────────────────────────────────── */
  .left {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    padding: 52px 60px;
    border-right: 1px solid var(--border);
    overflow: hidden;
  }

  /* Floating decorative shapes on left */
  .deco-ring {
    position: absolute;
    border-radius: 50%;
    border: 1.5px solid var(--border);
    pointer-events: none;
    animation: rotateSlow linear infinite;
  }
  .ring-1 { width: 180px; height: 180px; top: -50px; right: -40px; animation-duration: 30s; opacity: 0.5; }
  .ring-2 { width: 100px; height: 100px; bottom: 120px; right: 40px; animation-duration: 20s; opacity: 0.35; animation-direction: reverse; }
  .deco-dot-grid {
    position: absolute;
    bottom: 0; right: 0;
    width: 180px; height: 180px;
    background-image: radial-gradient(circle, var(--faint) 1.2px, transparent 1.2px);
    background-size: 18px 18px;
    opacity: 0.4;
    pointer-events: none;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    animation: slideRight 0.6s ease 0.1s forwards;
  }
  .logo-icon {
    width: 40px; height: 40px;
    background: var(--sage);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 16px rgba(61,107,90,0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .logo-icon:hover { transform: rotate(-8deg) scale(1.08); box-shadow: 0 8px 24px rgba(61,107,90,0.35); }
  .logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 600;
    color: var(--text); letter-spacing: -0.3px;
  }
  .logo-badge {
    margin-left: 4px;
    background: var(--sage-p);
    color: var(--sage);
    font-size: 9px; font-weight: 700;
    padding: 3px 9px; border-radius: 100px;
    text-transform: uppercase; letter-spacing: 0.8px;
    border: 1px solid rgba(61,107,90,0.15);
  }

  .hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 48px 0; }

  .eyebrow {
    opacity: 0;
    animation: fadeUp 0.6s ease 0.3s forwards;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 22px;
  }
  .eyebrow-line {
    width: 24px; height: 1.5px; background: var(--gold);
    transform-origin: left;
    animation: drawLine 0.5s ease 0.7s backwards;
  }
  .eyebrow-text {
    font-size: 11px; font-weight: 700; color: var(--gold);
    text-transform: uppercase; letter-spacing: 2px;
  }

  .big-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 62px; line-height: 1.0;
    color: var(--text); letter-spacing: -2px;
    margin-bottom: 22px;
    opacity: 0;
    animation: fadeUp 0.7s ease 0.45s forwards;
  }
  .big-title em {
    font-style: italic;
    color: var(--sage);
    position: relative;
  }
  .big-title em::after {
    content: '';
    position: absolute; bottom: 4px; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--sage-l), transparent);
    border-radius: 2px;
    transform-origin: left;
    animation: drawLine 0.6s ease 1.1s backwards;
  }

  .subtitle {
    font-size: 14px; color: var(--muted);
    line-height: 1.85; max-width: 360px;
    font-weight: 400; margin-bottom: 48px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.6s forwards;
  }

  .feat-list {
    border-top: 1px solid var(--border);
    opacity: 0;
    animation: fadeUp 0.6s ease 0.75s forwards;
  }
  .feat-item {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
    transition: all 0.25s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .feat-item::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 0;
    background: var(--sage-p);
    transition: width 0.3s ease;
    z-index: -1;
  }
  .feat-item:hover::before { width: 100%; }
  .feat-item:hover { padding-left: 10px; }
  .feat-num { font-size: 10px; font-weight: 700; color: var(--faint); width: 22px; flex-shrink: 0; }
  .feat-ico { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
  .feat-name { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; }
  .feat-tag {
    font-size: 10px; color: var(--muted);
    background: var(--cream2);
    padding: 3px 9px; border-radius: 100px;
    border: 1px solid var(--border);
    font-weight: 500;
    transition: all 0.2s;
  }
  .feat-item:hover .feat-tag { background: var(--sage); color: white; border-color: var(--sage); }

  .footer-row {
    display: flex; align-items: center; justify-content: space-between;
    opacity: 0;
    animation: fadeIn 0.6s ease 1.2s forwards;
  }
  .status-pill {
    display: flex; align-items: center; gap: 7px;
    background: var(--cream2);
    border: 1px solid var(--border);
    padding: 7px 14px; border-radius: 100px;
    font-size: 11px; color: var(--muted); font-weight: 500;
  }
  .dot-live {
    width: 6px; height: 6px;
    background: #22C55E; border-radius: 50%;
    animation: pulseSoft 2s infinite;
  }
  .version-text { font-size: 11px; color: var(--faint); }

  /* ──────────────────────────────────
     RIGHT PANEL
  ────────────────────────────────── */
  .right {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 56px;
    background: var(--white);
  }

  /* Subtle texture on right bg */
  .right::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(61,107,90,0.035) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }

  .form-wrap {
    width: 100%; max-width: 380px;
    position: relative; z-index: 1;
    opacity: 0;
    animation: slideLeft 0.7s ease 0.2s forwards;
  }

  .form-head { margin-bottom: 36px; }
  .form-sup {
    font-size: 10px; font-weight: 700;
    color: var(--sage); text-transform: uppercase;
    letter-spacing: 1.8px; margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .form-sup-dot { width: 5px; height: 5px; background: var(--sage); border-radius: 50%; animation: pulseSoft 2.5s infinite; }
  .form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; font-weight: 700;
    color: var(--text); letter-spacing: -1px;
    margin-bottom: 6px; line-height: 1.1;
  }
  .form-sub { font-size: 13px; color: var(--muted); font-weight: 400; }

  /* Input fields */
  .field { margin-bottom: 20px; }
  .f-label {
    display: block; font-size: 11px; font-weight: 700;
    color: var(--text); text-transform: uppercase;
    letter-spacing: 0.7px; margin-bottom: 8px;
  }
  .f-wrap { position: relative; }
  .f-input {
    width: 100%; padding: 13px 16px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--cream);
    font-size: 14px; font-family: 'Cabinet Grotesk', sans-serif;
    color: var(--text); outline: none;
    transition: all 0.2s ease;
    font-weight: 400;
  }
  .f-input::placeholder { color: var(--faint); }
  .f-input:focus {
    border-color: var(--sage);
    background: var(--white);
    box-shadow: 0 0 0 4px rgba(61,107,90,0.1);
    transform: translateY(-1px);
  }
  .f-input.has-r { padding-right: 46px; }
  .eye-btn {
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 14px; padding: 4px; color: var(--faint);
    transition: color 0.2s, transform 0.2s;
  }
  .eye-btn:hover { color: var(--sage); transform: translateY(-50%) scale(1.15); }

  /* Floating label effect hint */
  .input-hint {
    font-size: 10px; color: var(--faint);
    margin-top: 5px; padding-left: 2px;
    height: 0; overflow: hidden;
    transition: height 0.2s ease, opacity 0.2s ease;
    opacity: 0;
  }
  .f-input:focus + .input-hint,
  .field:focus-within .input-hint { height: 16px; opacity: 1; }

  .forgot-row { text-align: right; margin-bottom: 22px; margin-top: -10px; }
  .link-btn {
    background: none; border: none;
    font-size: 12px; color: var(--sage); font-weight: 600;
    cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
    transition: all 0.2s; padding: 0;
    position: relative;
  }
  .link-btn::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0;
    height: 1px; background: var(--sage);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.2s ease;
  }
  .link-btn:hover::after { transform: scaleX(1); }

  .err {
    display: flex; align-items: center; gap: 9px;
    padding: 11px 14px;
    background: #FEF2F2;
    border: 1.5px solid #FECACA;
    border-radius: 10px;
    color: var(--red); font-size: 12px;
    margin-bottom: 16px;
    animation: fadeUp 0.3s ease;
  }

  /* Submit button with shimmer */
  .btn-login {
    width: 100%; padding: 14px;
    background: var(--sage);
    color: #fff; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600;
    font-family: 'Cabinet Grotesk', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    letter-spacing: 0.3px;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 20px rgba(61,107,90,0.25);
  }
  .btn-login::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    background-size: 400px 100%;
    background-position: -400px 0;
    transition: none;
  }
  .btn-login:hover::before { animation: shimmer 0.8s ease; }
  .btn-login:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 32px rgba(61,107,90,0.35);
    background: var(--sage-l);
  }
  .btn-login:active:not(:disabled) { transform: translateY(0) scale(0.99); }
  .btn-login:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-loading-bar {
    position: absolute; bottom: 0; left: 0;
    height: 3px; background: rgba(255,255,255,0.5);
    animation: progressBar 1.5s ease infinite;
    border-radius: 0 0 12px 12px;
  }

  /* Divider */
  .sep { display: flex; align-items: center; gap: 12px; margin: 26px 0 20px; }
  .sep-line { flex: 1; height: 1px; background: var(--border); }
  .sep-text { font-size: 11px; color: var(--faint); font-weight: 500; white-space: nowrap; }

  /* Demo account buttons */
  .demo-list { display: flex; flex-direction: column; gap: 7px; }
  .demo-btn {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 15px;
    border-radius: 11px;
    border: 1.5px solid var(--border);
    background: var(--cream);
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%; text-align: left;
    position: relative; overflow: hidden;
  }
  .demo-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: var(--sage-p);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .demo-btn:hover { border-color: var(--sage); transform: translateX(3px); }
  .demo-btn:hover::after { opacity: 1; }
  .demo-btn.sel { border-color: var(--sage); background: var(--sage-p); }
  .demo-btn > * { position: relative; z-index: 1; }
  .d-ico { font-size: 16px; width: 26px; text-align: center; }
  .d-role {
    font-size: 10px; font-weight: 700; flex-shrink: 0;
    padding: 3px 9px; border-radius: 5px;
    letter-spacing: 0.2px;
  }
  .d-email { flex: 1; font-size: 12px; color: var(--muted); font-weight: 400; }
  .d-check {
    font-size: 13px; color: var(--sage); font-weight: 700;
    animation: scaleIn 0.25s ease;
  }

  .demo-note {
    text-align: center; font-size: 11px; color: var(--faint);
    margin-top: 12px; font-weight: 400;
  }
  .demo-note b { color: var(--sage); }

  /* ──────────────────────────────────
     MODAL
  ────────────────────────────────── */
  .modal-bg {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(28,43,34,0.45);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.25s ease;
  }
  .modal {
    background: var(--white); border-radius: 24px;
    padding: 44px 36px; max-width: 380px; width: 92%;
    text-align: center;
    border: 1.5px solid var(--border);
    box-shadow: 0 40px 80px rgba(0,0,0,0.18);
    animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .m-ico {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--sage-p); border: 2px solid rgba(61,107,90,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; margin: 0 auto 18px;
    animation: float 3s ease-in-out infinite;
  }
  .m-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; font-weight: 700; color: var(--text);
    letter-spacing: -0.5px; margin-bottom: 10px;
  }
  .m-desc { font-size: 13px; color: var(--muted); line-height: 1.75; margin-bottom: 20px; }
  .m-info {
    background: var(--cream); border: 1.5px solid var(--border);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;
    display: flex; align-items: flex-start; gap: 10px; text-align: left;
    font-size: 12px; color: var(--muted); line-height: 1.65;
  }
  .m-btn {
    width: 100%; padding: 13px;
    background: var(--sage); color: #fff; border: none; border-radius: 11px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'Cabinet Grotesk', sans-serif;
    transition: all 0.2s; box-shadow: 0 4px 16px rgba(61,107,90,0.25);
  }
  .m-btn:hover { background: var(--sage-l); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(61,107,90,0.3); }
`;

export default function LoginPage({ onLogin, error: externalError }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [show,  setShow]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState('');
  const [sel,   setSel]   = useState(-1);
  const [warn,  setWarn]  = useState(false);
  const [featVisible, setFeatVisible] = useState([false, false, false]);

  // Stagger feature items
  useEffect(() => {
    [0, 1, 2].forEach(i => {
      setTimeout(() => {
        setFeatVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 900 + i * 120);
    });
  }, []);

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

      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Modal */}
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
              <span style={{flexShrink:0, fontSize:20}}>📲</span>
              <div>Unduh <strong>Posyandu Digital</strong> di Play Store atau App Store untuk memantau perkembangan anak Anda.</div>
            </div>
            <button className="m-btn" onClick={() => setWarn(false)}>Mengerti</button>
          </div>
        </div>
      )}

      <div className="root">
        {/* ── LEFT ── */}
        <div className="left">
          <div className="deco-ring ring-1" />
          <div className="deco-ring ring-2" />
          <div className="deco-dot-grid" />

          <div className="logo">
            <div className="logo-icon">🏥</div>
            <span className="logo-name">Posyandu Digital</span>
            <span className="logo-badge">Admin</span>
          </div>

          <div className="hero">
            
            </div>

            <h1 className="big-title">
              Kelola Data<br />
              Balita <em>Lebih</em><br />
              Efisien
            </h1>

            <p className="subtitle">
              Dashboard terpadu untuk monitoring stunting, manajemen
              data balita, dan pelaporan resmi ke Dinas Kesehatan secara real-time.
            </p>

            <div className="feat-list">
              {[
                ['📊','Dashboard Eksekutif','Real-time'],
                ['👶','Manajemen Balita','CRUD + Export'],
                ['📋','Laporan Otomatis','Standar Kemenkes'],
              ].map(([ico, name, tag], i) => (
                <div
                  key={name}
                  className="feat-item"
                  style={{
                    opacity: featVisible[i] ? 1 : 0,
                    transform: featVisible[i] ? 'translateX(0)' : 'translateX(-16px)',
                    transition: `opacity 0.5s ease, transform 0.5s ease`,
                  }}
                >
                  <span className="feat-num">0{i+1}</span>
                  <span className="feat-ico">{ico}</span>
                  <span className="feat-name">{name}</span>
                  <span className="feat-tag">{tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-row">
            <div className="status-pill">
              <span className="dot-live" />
              Sistem Aktif
            </div>
            <span className="version-text">v2.4.1 · 2025</span>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <div className="form-wrap">
            <div className="form-head">
              <div className="form-sup">
                <span className="form-sup-dot" />
                Portal Admin
              </div>
              <h2 className="form-title">Selamat Datang 👋</h2>
              <p className="form-sub">Masuk menggunakan akun yang terdaftar</p>
            </div>

            <form onSubmit={submit}>
              <div className="field">
                <label className="f-label">Email</label>
                <div className="f-wrap">
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="f-input"
                  />
                </div>
              </div>

              <div className="field">
                <label className="f-label">Password</label>
                <div className="f-wrap">
                  <input
                    type={show ? 'text' : 'password'} value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="••••••••"
                    className="f-input has-r"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShow(!show)}>
                    {show ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {(err || externalError) && (
                <div className="err">⚠️ {err || externalError}</div>
              )}

              <div className="forgot-row">
                <button type="button" className="link-btn">Lupa password?</button>
              </div>

              <button type="submit" disabled={busy} className="btn-login">
                {busy ? (
                  <>
                    Memproses…
                    <span className="btn-loading-bar" />
                  </>
                ) : 'Masuk ke Dashboard →'}
              </button>
            </form>

            <div className="sep">
              <div className="sep-line" />
              <span className="sep-text">Coba Akun Demo</span>
              <div className="sep-line" />
            </div>

            <div className="demo-list">
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  onClick={() => pickDemo(i)}
                  className={`demo-btn${sel === i ? ' sel' : ''}`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <span className="d-ico">{acc.icon}</span>
                  <span className="d-role" style={{ background: acc.bg, color: acc.color }}>{acc.label}</span>
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