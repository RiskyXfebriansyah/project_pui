// src/pages/PosyanduPage.jsx
import React, { useState } from 'react';

const C = {
  bg: '#F8FAF8', white: '#FFFFFF', sage: '#3D6B5A', sageDark: '#2D5244',
  sagePale: '#E4F0EC', text: '#1C2B22', muted: '#6E7E72', faint: '#B0BDB4',
  border: '#DDD8CF', red: '#DC2626', redPale: '#FEF2F2', redBd: '#FECACA',
  blue: '#1565C0'
};
const font = "'Plus Jakarta Sans','Segoe UI',sans-serif";

export function PosyanduPage({
  posyanduList = [], isLoading = false, error = null,
  onAdd = null, onDelete = null, onRefresh, role = 'kader'
}) {
  const isAdmin = role === 'admin';
  const [showAdd, setShowAdd]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]               = useState({ nama: '', desa: '', kecamatan: '', aktif: true });
  const [formErr, setFormErr]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [toast, setToast]             = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  function openAdd() {
    setForm({ nama: '', desa: '', kecamatan: '', aktif: true });
    setFormErr('');
    setShowAdd(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama.trim())      return setFormErr('Nama posyandu wajib diisi');
    if (!form.desa.trim())      return setFormErr('Desa wajib diisi');
    if (!form.kecamatan.trim()) return setFormErr('Kecamatan wajib diisi');

    setFormErr('');
    setSubmitting(true);
    const res = await onAdd?.(form);
    setSubmitting(false);

    if (res?.ok) {
      setShowAdd(false);
      showToast('Posyandu berhasil ditambahkan');
    } else {
      setFormErr(res?.msg || 'Gagal menambah posyandu');
    }
  }

  async function handleDelete() {
    if (!deleteTarget || !onDelete) return;
    setDeleting(true);
    const res = await onDelete(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);

    if (res?.ok) {
      showToast('Posyandu berhasil dihapus');
    } else {
      showToast(res?.msg || 'Gagal menghapus posyandu', 'error');
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: font, minHeight: '100vh', background: C.bg }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? C.redPale : C.sagePale,
          color: toast.type === 'error' ? C.red : C.sageDark,
          border: `1.5px solid ${toast.type === 'error' ? C.redBd : '#A7D3C0'}`,
          borderRadius: 12, padding: '12px 18px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}  {/* FIX: toast.msg bukan toast.toast */}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>
            🏥 Data Posyandu
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
            {isLoading ? 'Memuat...' : `${posyanduList.length} posyandu terdaftar`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onRefresh} style={btnSecondary}>🔄 Refresh</button>
          {isAdmin && onAdd && (
            <button onClick={openAdd} style={btnPrimary}>+ Tambah Posyandu</button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: C.redPale, border: `1px solid ${C.redBd}`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          color: C.red, fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: 170, borderRadius: 18,
              background: 'linear-gradient(90deg,#E4F0EC 0%,#F0F7F4 50%,#E4F0EC 100%)',
              animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      ) : posyanduList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
          Belum ada posyandu terdaftar
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {posyanduList.map(p => (
            <PosyanduCard
              key={p.id}
              p={p}
              isAdmin={isAdmin && !!onDelete}
              onDelete={() => setDeleteTarget({ id: p.id, nama: p.nama, totalBalita: p.totalBalita })}
            />
          ))}
        </div>
      )}

      {/* ── Modal Tambah ─────────────────────────────────────────── */}
      {showAdd && (
        <Overlay onClick={() => !submitting && setShowAdd(false)}>
          {/* FIX: stopPropagation di sini agar klik dalam modal tidak tutup overlay */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.white, borderRadius: 22, padding: 28,
              width: '100%', maxWidth: 440,
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              border: `1px solid ${C.border}`,
            }}
          >
            <ModalHeader
              emoji="🏥"
              title="Tambah Posyandu"
              sub="Isi data posyandu baru"
              onClose={() => !submitting && setShowAdd(false)}
            />
            <form onSubmit={handleSubmit}>
              <Field label="Nama Posyandu *">
                <input
                  style={inputSt}
                  placeholder="Posyandu Melati"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                />
              </Field>
              <Field label="Desa *">
                <input
                  style={inputSt}
                  placeholder="Desa Sukamaju"
                  value={form.desa}
                  onChange={e => setForm(f => ({ ...f, desa: e.target.value }))}
                />
              </Field>
              <Field label="Kecamatan *">
                <input
                  style={inputSt}
                  placeholder="Kec. Ciawi"
                  value={form.kecamatan}
                  onChange={e => setForm(f => ({ ...f, kecamatan: e.target.value }))}
                />
              </Field>
              <Field label="Status">
                <select
                  style={inputSt}
                  value={form.aktif ? 'aktif' : 'nonaktif'}
                  onChange={e => setForm(f => ({ ...f, aktif: e.target.value === 'aktif' }))}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </Field>
              {formErr && <ErrBox msg={formErr} />}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  style={{ ...btnSecondary, flex: 1 }}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ ...btnPrimary, flex: 1, opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* ── Modal Hapus ──────────────────────────────────────────── */}
      {deleteTarget && (
        <Overlay onClick={() => !deleting && setDeleteTarget(null)}>
          {/* FIX: stopPropagation agar klik dalam modal tidak tutup overlay */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.white, borderRadius: 22, padding: 28,
              width: '100%', maxWidth: 420,
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: C.redPale, border: `2px solid ${C.redBd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>🗑️</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: C.text, marginBottom: 8 }}>
                Hapus Posyandu?
              </div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 24 }}>
                Posyandu <strong style={{ color: C.text }}>{deleteTarget.nama}</strong> akan dihapus permanen.
                {deleteTarget.totalBalita > 0 && (
                  <div style={{ color: C.red, fontWeight: 600, marginTop: 8 }}>
                    ⚠️ Terdapat {deleteTarget.totalBalita} balita terdaftar
                  </div>
                )}
                <div style={{ color: C.red, fontSize: 12, marginTop: 4 }}>
                  Pastikan tidak ada kader/user terdaftar di posyandu ini
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>
                  Data balita tidak ikut terhapus
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteTarget(null)}
                  style={{ ...btnSecondary, flex: 1 }}
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 11, border: 'none',
                    cursor: deleting ? 'not-allowed' : 'pointer', background: C.red,
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    opacity: deleting ? 0.7 : 1, fontFamily: font,
                  }}
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        button,input,select { font-family:${font}; }
        input:focus,select:focus { outline:none; border-color:${C.sage}!important; }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function PosyanduCard({ p, isAdmin, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white, borderRadius: 18,
        border: `1.5px solid ${hov ? C.sage : C.border}`,
        padding: 18, transition: 'all 0.18s',
        boxShadow: hov ? '0 8px 24px rgba(61,107,90,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, background: C.sagePale,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>🏥</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.nama}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            Desa {p.desa} · Kec. {p.kecamatan}
          </div>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, flexShrink: 0,
          background: p.aktif ? C.sagePale : '#F9FAFB',
          color: p.aktif ? C.sage : C.faint,
          border: `1px solid ${p.aktif ? '#A7D3C0' : C.border}`,
        }}>
          {p.aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <StatBox label="Total Balita" value={p.totalBalita ?? 0} color={C.blue} />
        <StatBox label="Stunting"     value={p.stunting ?? 0}
          color={(p.stunting ?? 0) > 0 ? C.red : C.faint} />
      </div>

      {p.namaKader && (
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
          👤 Kader: <strong style={{ color: C.text }}>{p.namaKader}</strong>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={onDelete}
          style={{
            width: '100%', padding: '8px 0', borderRadius: 10,
            border: `1.5px solid ${C.redBd}`, background: C.redPale,
            color: C.red, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.15s', fontFamily: font,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.redPale; e.currentTarget.style.color = C.red; }}
          title="Pastikan tidak ada kader/user terdaftar sebelum hapus"
        >
          🗑️ Hapus
        </button>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: C.bg, borderRadius: 10, padding: '10px 12px',
      textAlign: 'center', border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{label}</div>
    </div>
  );
}

// FIX: Overlay hanya backdrop — stopPropagation dilakukan di dalam setiap modal
function Overlay({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(28,43,34,0.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      {children}
    </div>
  );
}

function ModalHeader({ emoji, title, sub, onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: C.sagePale,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>
        {emoji}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
      </div>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto', width: 30, height: 30, borderRadius: 8,
          border: `1px solid ${C.border}`, background: C.bg, color: C.muted,
          fontSize: 12, cursor: 'pointer', fontFamily: font,
        }}
      >✕</button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: C.muted, marginBottom: 6, letterSpacing: 0.3,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrBox({ msg }) {
  return (
    <div style={{
      background: C.redPale, border: `1px solid ${C.redBd}`,
      borderRadius: 10, padding: '10px 14px', marginBottom: 16,
      color: C.red, fontSize: 13,
    }}>
      ⚠️ {msg}
    </div>
  );
}

const inputSt = {
  width: '100%', padding: '10px 13px', borderRadius: 11,
  border: `1.5px solid ${C.border}`, background: C.bg,
  fontSize: 13, color: '#1C2B22', boxSizing: 'border-box',
};

const btnPrimary = {
  padding: '10px 18px', borderRadius: 11, border: 'none',
  background: '#3D6B5A', color: '#fff', fontWeight: 700, fontSize: 13,
  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
};

const btnSecondary = {
  padding: '10px 18px', borderRadius: 11,
  border: '1.5px solid #DDD8CF', background: '#FFFFFF',
  color: '#1C2B22', fontWeight: 600, fontSize: 13,
  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
};