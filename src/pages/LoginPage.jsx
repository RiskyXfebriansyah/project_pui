import React, { useState, useEffect } from 'react';

const DEMO_ACCOUNTS = [
  { label:'Admin Puskesmas', email:'admin@puskesmas.com', color:'#0B7B6B', bg:'#E6F5F2', icon:'🏥' },
  { label:'Bidan',           email:'rani@posyandu.com',   color:'#7C3AED', bg:'#F5F3FF', icon:'👩‍⚕️' },
  { label:'Kader',           email:'rina@posyandu.com',   color:'#B45309', bg:'#FFFBEB', icon:'🩺' },
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

  html, body { background: var(--cream); min-height: 100vh; }

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
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.88) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes progressBar {
    from { width: 0%; }
    to   { width: 100%; }
  }

  .root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 55% 45%;
    font-family: 'Cabinet Grotesk', sans-serif;
    background: var(--cream);
    animation: fadeIn 0.4s ease;
  }

  .orb {
    position: fixed; border-radius: 50%;
    pointer-events: none; z-index: 0; filter: blur(60px);
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

  .left {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    padding: 52px 60px;
    border-right: 1px solid var(--border);
    overflow: hidden;
  }

  .deco-ring {
    position: absolute; border-radius: 50%;
    border: 1.5px solid var(--border);
    pointer-events: none;
    animation: rotateSlow linear infinite;
  }
  .ring-1 { width: 180px; height: 180px; top: -50px; right: -40px; animation-duration: 30s; opacity: 0.5; }
  .ring-2 { width: 100px; height: 100px; bottom: 120px; right: 40px; animation-duration: 20s; opacity: 0.35; animation-direction: reverse; }
  .deco-dot-grid {
    position: absolute; bottom: 0; right: 0;
    width: 180px; height: 180px;
    background-image: radial-gradient(circle, var(--faint) 1.2px, transparent 1.2px);
    background-size: 18px 18px; opacity: 0.4; pointer-events: none;
  }

  .logo {
    display: flex; align-items: center; gap: 12px;
    opacity: 0; animation: slideRight 0.6s ease 0.1s forwards;
  }
  .logo-icon {
    width: 40px; height: 40px; background: var(--sage); border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    box-shadow: 0 4px 16px rgba(61,107,90,0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .logo-icon:hover { transform: rotate(-8deg) scale(1.08); box-shadow: 0 8px 24px rgba(61,107,90,0.35); }
  .logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 600; color: var(--text); letter-spacing: -0.3px;
  }

  .hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 48px 0; }

  .big-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 62px; line-height: 1.0;
    color: var(--text); letter-spacing: -2px; margin-bottom: 22px;
    opacity: 0; animation: fadeUp 0.7s ease 0.45s forwards;
  }
  .big-title em { font-style: italic; color: var(--sage); position: relative; }
  .big-title em::after {
    content: ''; position: absolute; bottom: 4px; left: 0; right: 0;
    height: 3px; background: linear-gradient(90deg, var(--sage-l), transparent);
    border-radius: 2px; transform-origin: left;
    animation: drawLine 0.6s ease 1.1s backwards;
  }

  .subtitle {
    font-size: 14px; color: var(--muted); line-height: 1.85;
    max-width: 360px; font-weight: 400; margin-bottom: 48px;
    opacity: 0; animation: fadeUp 0.6s ease 0.6s forwards;
  }

  .feat-list { border-top: 1px solid var(--border); opacity: 0; animation: fadeUp 0.6s ease 0.75s forwards; }
  .feat-item {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 0; border-bottom: 1px solid var(--border);
    transition: all 0.25s ease; cursor: default;
    position: relative; overflow: hidden;
  }
  .feat-item::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 0; background: var(--sage-p); transition: width 0.3s ease; z-index: -1;
  }
  .feat-item:hover::before { width: 100%; }
  .feat-item:hover { padding-left: 10px; }
  .feat-num { font-size: 10px; font-weight: 700; color: var(--faint); width: 22px; flex-shrink: 0; }
  .feat-ico { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
  .feat-name { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; }
  .feat-tag {
    font-size: 10px; color: var(--muted); background: var(--cream2);
    padding: 3px 9px; border-radius: 100px; border: 1px solid var(--border);
    font-weight: 500; transition: all 0.2s;
  }
  .feat-item:hover .feat-tag { background: var(--sage); color: white; border-color: var(--sage); }

  .footer-row {
    display: flex; align-items: center; justify-content: space-between;
    opacity: 0; animation: fadeIn 0.6s ease 1.2s forwards;
  }
  .status-pill {
    display: flex; align-items: center; gap: 7px;
    background: var(--cream2); border: 1px solid var(--border);
    padding: 7px 14px; border-radius: 100px;
    font-size: 11px; color: var(--muted); font-weight: 500;
  }
  .dot-live { width: 6px; height: 6px; background: #22C55E; border-radius: 50%; animation: pulseSoft 2s infinite; }
  .version-text { font-size: 11px; color: var(--faint); }

  .right {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 52px 56px; background: var(--white);
  }
  .right::before {
    content: ''; position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(61,107,90,0.035) 1px, transparent 1px);
    background-size: 24px 24px; pointer-events: none;
  }

  .form-wrap {
    width: 100%; max-width: 380px; position: relative; z-index: 1;
    opacity: 0; animation: slideLeft 0.7s ease 0.2s forwards;
  }

  .form-head { margin-bottom: 36px; }
  .form-sup {
    font-size: 10px; font-weight: 700; color: var(--sage);
    text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .form-sup-dot { width: 5px; height: 5px; background: var(--sage); border-radius: 50%; animation: pulseSoft 2.5s infinite; }
  .form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; font-weight: 700; color: var(--text);
    letter-spacing: -1px; margin-bottom: 6px; line-height: 1.1;
  }
  .form-sub { font-size: 13px; color: var(--muted); font-weight: 400; }

  .field { margin-bottom: 20px; }
  .f-label {
    display: block; font-size: 11px; font-weight: 700; color: var(--text);
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px;
  }
  .f-wrap { position: relative; }
  .f-input {
    width: 100%; padding: 13px 16px; border-radius: 12px;
    border: 1.5px solid var(--border); background: var(--cream);
    font-size: 14px; font-family: 'Cabinet Grotesk', sans-serif;
    color: var(--text); outline: none; transition: all 0.2s ease; font-weight: 400;
  }
  .f-input::placeholder { color: var(--faint); }
  .f-input:focus {
    border-color: var(--sage); background: var(--white);
    box-shadow: 0 0 0 4px rgba(61,107,90,0.1); transform: translateY(-1px);
  }
  .f-input.has-r { padding-right: 46px; }
  .eye-btn {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 14px; padding: 4px; color: var(--faint);
    transition: color 0.2s, transform 0.2s;
  }
  .eye-btn:hover { color: var(--sage); transform: translateY(-50%) scale(1.15); }

  .forgot-row { text-align: right; margin-bottom: 22px; margin-top: -10px; }
  .link-btn {
    background: none; border: none; font-size: 12px; color: var(--sage);
    font-weight: 600; cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
    transition: all 0.2s; padding: 0; position: relative;
  }
  .link-btn::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
    height: 1px; background: var(--sage);
    transform: scaleX(0); transform-origin: left; transition: transform 0.2s ease;
  }
  .link-btn:hover::after { transform: scaleX(1); }

  .err {
    display: flex; align-items: center; gap: 9px;
    padding: 11px 14px; background: #FEF2F2;
    border: 1.5px solid #FECACA; border-radius: 10px;
    color: var(--red); font-size: 12px; margin-bottom: 16px;
    animation: fadeUp 0.3s ease;
  }

  .btn-login {
    width: 100%; padding: 14px; background: var(--sage);
    color: #fff; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600; font-family: 'Cabinet Grotesk', sans-serif;
    cursor: pointer; transition: all 0.25s ease; letter-spacing: 0.3px;
    position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(61,107,90,0.25);
  }
  .btn-login::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    background-size: 400px 100%; background-position: -400px 0; transition: none;
  }
  .btn-login:hover::before { animation: shimmer 0.8s ease; }
  .btn-login:hover:not(:disabled) {
    transform: translateY(-2px); box-shadow: 0 10px 32px rgba(61,107,90,0.35); background: var(--sage-l);
  }
  .btn-login:active:not(:disabled) { transform: translateY(0) scale(0.99); }
  .btn-login:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-loading-bar {
    position: absolute; bottom: 0; left: 0; height: 3px;
    background: rgba(255,255,255,0.5); animation: progressBar 1.5s ease infinite; border-radius: 0 0 12px 12px;
  }

  .sep { display: flex; align-items: center; gap: 12px; margin: 26px 0 20px; }
  .sep-line { flex: 1; height: 1px; background: var(--border); }
  .sep-text { font-size: 11px; color: var(--faint); font-weight: 500; white-space: nowrap; }

  .demo-list { display: flex; flex-direction: column; gap: 7px; }
  .demo-btn {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 15px; border-radius: 11px;
    border: 1.5px solid var(--border); background: var(--cream);
    cursor: pointer; transition: all 0.2s ease;
    width: 100%; text-align: left; position: relative; overflow: hidden;
  }
  .demo-btn::after {
    content: ''; position: absolute; inset: 0;
    background: var(--sage-p); opacity: 0; transition: opacity 0.2s ease;
  }
  .demo-btn:hover { border-color: var(--sage); transform: translateX(3px); }
  .demo-btn:hover::after { opacity: 1; }
  .demo-btn.sel { border-color: var(--sage); background: var(--sage-p); }
  .demo-btn > * { position: relative; z-index: 1; }
  .d-ico { font-size: 16px; width: 26px; text-align: center; }
  .d-role { font-size: 10px; font-weight: 700; flex-shrink: 0; padding: 3px 9px; border-radius: 5px; letter-spacing: 0.2px; }
  .d-email { flex: 1; font-size: 12px; color: var(--muted); font-weight: 400; }
  .d-check { font-size: 13px; color: var(--sage); font-weight: 700; animation: scaleIn 0.25s ease; }

  .demo-note { text-align: center; font-size: 11px; color: var(--faint); margin-top: 12px; font-weight: 400; }
  .demo-note b { color: var(--sage); }

  .modal-bg {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(28,43,34,0.45); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.25s ease;
  }
  .modal {
    background: var(--white); border-radius: 24px;
    padding: 44px 36px; max-width: 380px; width: 92%; text-align: center;
    border: 1.5px solid var(--border); box-shadow: 0 40px 80px rgba(0,0,0,0.18);
    animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .m-ico {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--sage-p); border: 2px solid rgba(61,107,90,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; margin: 0 auto 18px; animation: float 3s ease-in-out infinite;
  }
  .m-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; margin-bottom: 10px;
  }
  .m-desc { font-size: 13px; color: var(--muted); line-height: 1.75; margin-bottom: 20px; }
  .m-info {
    background: var(--cream); border: 1.5px solid var(--border); border-radius: 12px;
    padding: 14px 16px; margin-bottom: 24px;
    display: flex; align-items: flex-start; gap: 10px; text-align: left;
    font-size: 12px; color: var(--muted); line-height: 1.65;
  }
  .m-btn {
    width: 100%; padding: 13px; background: var(--sage); color: #fff; border: none; border-radius: 11px;
    font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
    transition: all 0.2s; box-shadow: 0 4px 16px rgba(61,107,90,0.25);
  }
  .m-btn:hover { background: var(--sage-l); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(61,107,90,0.3); }

  .fp-modal {
    background: var(--white); border-radius: 24px;
    padding: 36px 32px; max-width: 420px; width: 92%;
    border: 1.5px solid var(--border); box-shadow: 0 40px 80px rgba(0,0,0,0.18);
    animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
    text-align: left;
  }
  .fp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .fp-icon-wrap {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--sage-p); border: 1.5px solid rgba(61,107,90,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  .fp-close {
    background: none; border: 1.5px solid var(--border); border-radius: 10px;
    width: 34px; height: 34px; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); transition: all 0.2s;
  }
  .fp-close:hover { background: var(--cream2); color: var(--text); }
  .fp-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; margin-bottom: 6px;
  }
  .fp-sub { font-size: 13px; color: var(--muted); line-height: 1.65; margin-bottom: 22px; }

  .fp-alert {
    display: flex; align-items: center; gap: 9px;
    padding: 11px 14px; border-radius: 10px; font-size: 12px; margin-bottom: 16px;
    animation: fadeUp 0.3s ease;
  }
  .fp-alert.ok   { background: #E4F0EC; border: 1.5px solid #5A9080; color: #3D6B5A; }
  .fp-alert.fail { background: #FEF2F2; border: 1.5px solid #FECACA; color: var(--red); }

  .fp-field { margin-bottom: 16px; }
  .fp-label {
    display: block; font-size: 11px; font-weight: 700; color: var(--text);
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 7px;
  }
  .fp-input-wrap { position: relative; }
  .fp-input {
    width: 100%; padding: 11px 44px 11px 14px; border-radius: 11px;
    border: 1.5px solid var(--border); background: var(--cream);
    font-size: 13px; font-family: 'Cabinet Grotesk', sans-serif;
    color: var(--text); outline: none; transition: all 0.2s ease;
  }
  .fp-input::placeholder { color: var(--faint); }
  .fp-input:focus { border-color: var(--sage); background: var(--white); box-shadow: 0 0 0 4px rgba(61,107,90,0.1); }
  .fp-input.fp-ok  { border-color: #3D6B5A; }
  .fp-input.fp-err { border-color: var(--red); }
  .fp-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; font-size: 14px; color: var(--faint);
    transition: color 0.2s;
  }
  .fp-eye:hover { color: var(--sage); }

  .fp-strength { margin-top: 8px; }
  .fp-bars { display: flex; gap: 4px; margin-bottom: 4px; }
  .fp-bar { height: 4px; flex: 1; border-radius: 2px; background: var(--border); transition: background 0.25s; }
  .fp-slabel { font-size: 11px; font-weight: 600; }
  .fp-rules { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 7px; }
  .fp-rule { font-size: 10px; display: flex; align-items: center; gap: 3px; color: var(--faint); transition: color 0.2s; }
  .fp-rule.ok { color: #3D6B5A; }

  .fp-match { font-size: 11px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
  .fp-match.ok   { color: #3D6B5A; }
  .fp-match.fail { color: var(--red); }

  .fp-actions { display: flex; gap: 10px; margin-top: 6px; }
  .fp-btn-cancel {
    flex: 1; padding: 12px; border-radius: 11px;
    border: 1.5px solid var(--border); background: transparent;
    font-size: 13px; font-weight: 600; cursor: pointer;
    color: var(--muted); font-family: 'Cabinet Grotesk', sans-serif;
    transition: all 0.2s;
  }
  .fp-btn-cancel:hover { background: var(--cream2); color: var(--text); }
  .fp-btn-submit {
    flex: 2; padding: 12px; border-radius: 11px;
    border: none; background: var(--sage); color: #fff;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Cabinet Grotesk', sans-serif;
    transition: all 0.25s; box-shadow: 0 4px 16px rgba(61,107,90,0.25);
  }
  .fp-btn-submit:hover:not(:disabled) { background: var(--sage-l); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(61,107,90,0.3); }
  .fp-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const S_COLORS = ['#C0392B', '#B45309', '#185FA5', '#3D6B5A'];
const S_LABELS = ['Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];

function calcStrength(p) {
  const rules = {
    len: p.length >= 8,
    up:  /[A-Z]/.test(p),
    num: /[0-9]/.test(p),
    sym: /[^A-Za-z0-9]/.test(p),
  };
  const score = Object.values(rules).filter(Boolean).length;
  return { score, rules };
}

// ─── ForgotPasswordModal ─────────────────────────────
function ForgotPasswordModal({ onClose, onForgot }) {
  const [fEmail,  setFEmail]  = useState('');
  const [fPass1,  setFPass1]  = useState('');
  const [fPass2,  setFPass2]  = useState('');
  const [showP1,  setShowP1]  = useState(false);
  const [showP2,  setShowP2]  = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [msg,     setMsg]     = useState(null);

  const str     = fPass1 ? calcStrength(fPass1) : null;
  const matched = fPass2 ? fPass1 === fPass2 : null;

  async function handleSubmit() {
    if (!fEmail)              { setMsg({ ok: false, text: 'Email wajib diisi' }); return; }
    if (!fPass1)              { setMsg({ ok: false, text: 'Password baru wajib diisi' }); return; }
    if (!str || str.score < 1){ setMsg({ ok: false, text: 'Password terlalu lemah' }); return; }
    if (!fPass2)              { setMsg({ ok: false, text: 'Konfirmasi password wajib diisi' }); return; }
    if (!matched)             { setMsg({ ok: false, text: 'Konfirmasi password tidak cocok' }); return; }

    setBusy(true); setMsg(null);
    const result = await onForgot(fEmail, fPass1);
    if (result.ok) {
      setMsg({ ok: true, text: result.message });
      setTimeout(() => onClose(), 2500);
    } else {
      setMsg({ ok: false, text: result.message });
    }
    setBusy(false);
  }

  function resetAndClose() {
    setFEmail(''); setFPass1(''); setFPass2('');
    setShowP1(false); setShowP2(false); setMsg(null);
    onClose();
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && resetAndClose()}>
      <div className="fp-modal">
        <div className="fp-header">
          <div className="fp-icon-wrap">🔑</div>
          <button className="fp-close" onClick={resetAndClose}>✕</button>
        </div>

        <div className="fp-title">Lupa Password</div>
        <p className="fp-sub">Masukkan email terdaftar dan buat password baru Anda.</p>

        {msg && (
          <div className={`fp-alert ${msg.ok ? 'ok' : 'fail'}`}>
            {msg.ok ? '✅' : '⚠️'} {msg.text}
          </div>
        )}

        <div className="fp-field">
          <label className="fp-label">Email</label>
          <div className="fp-input-wrap">
            <input
              type="email" value={fEmail}
              onChange={e => { setFEmail(e.target.value); setMsg(null); }}
              placeholder="nama@email.com"
              className="fp-input"
            />
          </div>
        </div>

        <div className="fp-field">
          <label className="fp-label">Password Baru</label>
          <div className="fp-input-wrap">
            <input
              type={showP1 ? 'text' : 'password'} value={fPass1}
              onChange={e => { setFPass1(e.target.value); setFPass2(''); setMsg(null); }}
              placeholder="Minimal 8 karakter"
              // ✅ Fix: str bisa null, guard dulu sebelum akses .score
              className={`fp-input${fPass1 && str ? (str.score >= 3 ? ' fp-ok' : str.score === 1 ? ' fp-err' : '') : ''}`}
            />
            <button type="button" className="fp-eye" onClick={() => setShowP1(p => !p)}>
              {showP1 ? '🙈' : '👁️'}
            </button>
          </div>

          {fPass1 && str && (
            <div className="fp-strength">
              <div className="fp-bars">
                {[0,1,2,3].map(i => (
                  <div key={i} className="fp-bar"
                    style={{ background: i < str.score ? S_COLORS[str.score - 1] : 'var(--border)' }} />
                ))}
              </div>
              <div className="fp-slabel" style={{ color: S_COLORS[str.score - 1] }}>
                {S_LABELS[str.score - 1]}
              </div>
              <div className="fp-rules">
                {[
                  [str.rules.len, 'Min. 8 karakter'],
                  [str.rules.up,  'Huruf besar'],
                  [str.rules.num, 'Angka'],
                  [str.rules.sym, 'Simbol (!@#...)'],
                ].map(([ok, label]) => (
                  <span key={label} className={`fp-rule${ok ? ' ok' : ''}`}>
                    {ok ? '✓' : '○'} {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="fp-field">
          <label className="fp-label">Konfirmasi Password Baru</label>
          <div className="fp-input-wrap">
            <input
              type={showP2 ? 'text' : 'password'} value={fPass2}
              onChange={e => { setFPass2(e.target.value); setMsg(null); }}
              placeholder="Ulangi password baru"
              className={`fp-input${fPass2 ? (matched ? ' fp-ok' : ' fp-err') : ''}`}
            />
            <button type="button" className="fp-eye" onClick={() => setShowP2(p => !p)}>
              {showP2 ? '🙈' : '👁️'}
            </button>
          </div>
          {fPass2 && matched !== null && (
            <div className={`fp-match ${matched ? 'ok' : 'fail'}`}>
              {matched ? '✓ Password cocok' : '✗ Password tidak cocok'}
            </div>
          )}
        </div>

        <div className="fp-actions">
          <button className="fp-btn-cancel" onClick={resetAndClose}>Batal</button>
          <button className="fp-btn-submit" disabled={busy} onClick={handleSubmit}>
            {busy ? 'Memproses...' : 'Ubah Password →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LoginPage ───────────────────────────────────────
// ✅ Tambah onForgot di props
export default function LoginPage({ onLogin, onForgot, error: externalError }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [show,  setShow]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState('');
  const [sel,   setSel]   = useState(-1);
  const [warn,  setWarn]  = useState(false);
  const [featVisible, setFeatVisible] = useState([false, false, false]);
  const [showForgot, setShowForgot]   = useState(false);

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
      else setErr(res?.message || 'Email atau password salah');
      return;
    }
    if (res.ok && res.role === 'orang_tua') {
      localStorage.removeItem('posyandu_user'); setWarn(true);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

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
              <span style={{ flexShrink: 0, fontSize: 20 }}>📲</span>
            </div>
            <button className="m-btn" onClick={() => setWarn(false)}>Mengerti</button>
          </div>
        </div>
      )}

      {/* ✅ onForgot di-pass ke modal */}
      {showForgot && (
        <ForgotPasswordModal
          onClose={() => setShowForgot(false)}
          onForgot={onForgot}
        />
      )}

      <div className="root">
        <div className="left">
          <div className="deco-ring ring-1" />
          <div className="deco-ring ring-2" />
          <div className="deco-dot-grid" />

          <div className="logo">
            <div className="logo-icon">🏥</div>
            <span className="logo-name">Posyandu Digital</span>
          </div>

          <div className="hero">
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
                ['📊', 'Dashboard Eksekutif', 'Real-time'],
                ['👶', 'Manajemen Balita',    'CRUD + Export'],
                ['📋', 'Laporan Otomatis',    'Terintegrasi Mobile'],
              ].map(([ico, name, tag], i) => (
                <div
                  key={name} className="feat-item"
                  style={{
                    opacity: featVisible[i] ? 1 : 0,
                    transform: featVisible[i] ? 'translateX(0)' : 'translateX(-16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                  }}
                >
                  <span className="feat-num">0{i + 1}</span>
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
                <button type="button" className="link-btn" onClick={() => setShowForgot(true)}>
                  Lupa password?
                </button>
              </div>

              <button type="submit" disabled={busy} className="btn-login">
                {busy ? (
                  <>Memproses… <span className="btn-loading-bar" /></>
                ) : 'Masuk ke Dashboard →'}
              </button>
            </form>

            <div className="sep">
              <div className="sep-line" />
              <span className="sep-text"></span>
              <div className="sep-line" />
            </div>

            <div className="demo-list">
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button
                  key={i} onClick={() => pickDemo(i)}
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

            <p className="demo-note">Hidup Sehat Itu Indah <b></b></p>
          </div>
        </div>
      </div>
    </>
  );
}