// ============================================================
//  ModalExcelInfo.jsx
//  Modal muncul sebelum export Excel untuk mengisi data header
//  yang belum ada di profile / laporan
// ============================================================
import React, { useState } from 'react';

function Field({ label, value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box',
          background: disabled ? '#F9FAFB' : '#fff',
          color: disabled ? '#9E9E9E' : '#1A1A1A',
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = '#1B6B3A'; }}
        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
      />
    </div>
  );
}

/**
 * Props:
 *  - initialData: { info, currentUser }  → pre-fill dari laporan & profile
 *  - onConfirm(extraData)  → dipanggil saat klik Export, extraData = { provinsi, kabupaten, puskesmas, kecamatan, desa, kaderPemantau, noTelpKader }
 *  - onClose()
 */
export default function ModalExcelInfo({ initialData = {}, onConfirm, onClose }) {
  const { info = {}, currentUser = {} } = initialData;

  const [form, setForm] = useState({
    provinsi:      currentUser.provinsi      || '',
    kabupaten:     currentUser.kabupaten     || '',
    kecamatan:     currentUser.kecamatan     || '',
    puskesmas:     currentUser.puskesmas     || '',
    desa:          info.desa                 || currentUser.desa || '',
    kaderPemantau: currentUser.nama          || info.ketuaKader  || '',
    noTelpKader:   currentUser.noTelp        || currentUser.noTelepon || '',
    // Dari laporan (read-only display)
    namaPosyandu:  info.namaPosyandu         || currentUser.posyandu || '',
    bulan:         info.bulan                || '',
    tahun:         info.tahun                || String(new Date().getFullYear()),
    alamat:        currentUser.alamat        || info.dusun || '',
  });

  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleConfirm() {
    onConfirm(form);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, width: 560,
          maxHeight: '90vh', overflow: 'hidden', display: 'flex',
          flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px', background: '#1B6B3A', color: '#fff',
          borderRadius: '20px 20px 0 0', flexShrink: 0,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>📊 Export Excel</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Lengkapi data header sebelum file dibuat</div>
        </div>

        {/* Info laporan (read-only) */}
        <div style={{
          padding: '12px 24px', background: '#F0FDF4', borderBottom: '1px solid #BBF7D0',
          display: 'flex', gap: 20, flexShrink: 0,
        }}>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#9E9E9E' }}>Posyandu: </span>
            <strong style={{ color: '#1B6B3A' }}>{form.namaPosyandu || '-'}</strong>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#9E9E9E' }}>Periode: </span>
            <strong style={{ color: '#1B6B3A' }}>{form.bulan} {form.tahun}</strong>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            📍 Wilayah
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Provinsi" value={form.provinsi} onChange={v => f('provinsi', v)} placeholder="Contoh: DIY" />
            <Field label="Kabupaten / Kota" value={form.kabupaten} onChange={v => f('kabupaten', v)} placeholder="Contoh: SLEMAN" />
            <Field label="Puskesmas / Kecamatan" value={form.puskesmas} onChange={v => f('puskesmas', v)} placeholder="Contoh: MLATI I" />
            <Field label="Kecamatan" value={form.kecamatan} onChange={v => f('kecamatan', v)} placeholder="Contoh: MLATI" />
            <Field label="Desa / Kelurahan" value={form.desa} onChange={v => f('desa', v)} placeholder="Contoh: SINDUADI" />
            <Field label="Alamat Posyandu" value={form.alamat} onChange={v => f('alamat', v)} placeholder="Contoh: Kutu Wates" />
          </div>

          <div style={{ height: 1, background: '#F0F0F0', margin: '12px 0' }} />

          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            👤 Kader Pemantau
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Nama Kader Pemantau" value={form.kaderPemantau} onChange={v => f('kaderPemantau', v)} placeholder="Nama kader..." />
            <Field label="No Telp / HP" value={form.noTelpKader} onChange={v => f('noTelpKader', v)} placeholder="08xx-xxxx-xxxx" />
          </div>

          <div style={{
            padding: '10px 14px', background: '#FFFBEB', borderRadius: 8,
            border: '1px solid #FDE68A', fontSize: 11, color: '#92400E', marginTop: 4,
          }}>
            💡 Data ini akan muncul di header formulir pemantauan pertumbuhan. Bisa dikosongkan jika tidak diperlukan.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #F0F0F0',
          display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', background: '#F3F4F6', border: 'none',
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 600, fontSize: 13, color: '#374151',
            }}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '9px 24px', background: '#1B6B3A', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            📊 Buat Excel
          </button>
        </div>
      </div>
    </div>
  );
}