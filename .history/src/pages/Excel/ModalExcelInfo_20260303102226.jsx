// ============================================================
//  ModalExcelInfo.jsx
//  Muncul sebelum export Excel — isi data header wilayah
// ============================================================
import React, { useState } from 'react';

function InputRow({ label, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 12 }}>
      <div style={{
        width: 180, fontSize: 13, fontWeight: 600, color: '#374151',
        flexShrink: 0,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#374151', flexShrink: 0 }}>:</div>
      <input
        value={value || ''}
        placeholder={placeholder || '-'}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: 8, fontFamily: 'inherit',
          border: `1.5px solid ${focused ? '#1B6B3A' : '#E5E7EB'}`,
          fontSize: 13, outline: 'none', background: '#fff',
          transition: 'border-color 0.15s',
        }}
      />
    </div>
  );
}

/**
 * Props:
 *  initialData: { info, currentUser }
 *  onConfirm(extraData)
 *  onClose()
 */
export default function ModalExcelInfo({ initialData = {}, onConfirm, onClose }) {
  const { info = {}, currentUser = {} } = initialData;

  const [form, setForm] = useState({
    provinsi:      currentUser.provinsi     || '',
    kabupaten:     currentUser.kabupaten    || '',
    puskesmas:     currentUser.puskesmas    || '',
    desa:          info.desa               || currentUser.desa    || '',
    kaderPemantau: currentUser.nama        || info.ketuaKader     || '',
    noTelpKader:   currentUser.noTelp      || currentUser.noTelepon || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, width: 520,
          maxHeight: '94vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg,#1B6B3A,#2E7D32)',
          color: '#fff', borderRadius: '20px 20px 0 0',
        }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>📊 Export Excel</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            Lengkapi data header Formulir Pemantauan Pertumbuhan
          </div>
        </div>

        {/* Info laporan */}
        <div style={{
          padding: '10px 24px', background: '#F0FDF4',
          borderBottom: '1px solid #BBF7D0',
          display: 'flex', gap: 20, flexShrink: 0,
        }}>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#6B7280' }}>Posyandu: </span>
            <strong style={{ color: '#1B6B3A' }}>{info.namaPosyandu || '-'}</strong>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#6B7280' }}>Periode: </span>
            <strong style={{ color: '#1B6B3A' }}>{info.bulan} {info.tahun}</strong>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* Wilayah */}
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#1B6B3A', letterSpacing: 0.5,
            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            📍 DATA WILAYAH
          </div>

          <InputRow label="Provinsi"             value={form.provinsi}   onChange={v => set('provinsi', v)}   placeholder="contoh: DIY" />
          <InputRow label="Kabupaten/Kota"        value={form.kabupaten}  onChange={v => set('kabupaten', v)}  placeholder="contoh: SLEMAN" />
          <InputRow label="Puskesmas/Kecamatan"   value={form.puskesmas}  onChange={v => set('puskesmas', v)}  placeholder="contoh: MLATI I" />
          <InputRow label="Desa/Kelurahan"         value={form.desa}       onChange={v => set('desa', v)}       placeholder="contoh: SINDUADI" />

          <div style={{ height: 1, background: '#F0F0F0', margin: '16px 0' }} />

          {/* Kader */}
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#1B6B3A', letterSpacing: 0.5,
            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            👤 KADER PEMANTAU
          </div>

          <InputRow label="KADER Pemantau"  value={form.kaderPemantau} onChange={v => set('kaderPemantau', v)} placeholder="Nama kader..." />
          <InputRow label="No Telp/HP"       value={form.noTelpKader}   onChange={v => set('noTelpKader', v)}   placeholder="08xx-xxxx-xxxx" />

          <div style={{
            marginTop: 8, padding: '10px 14px', background: '#FFFBEB',
            borderRadius: 8, border: '1px solid #FDE68A',
            fontSize: 11, color: '#92400E',
          }}>
            💡 Data ini tampil di header sheet <strong>Pemantauan Pertumbuhan</strong>.
            Bisa dikosongkan jika tidak diperlukan.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #F0F0F0',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 22px', background: '#F3F4F6', border: 'none',
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 600, fontSize: 13, color: '#374151',
            }}
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(form)}
            style={{
              padding: '10px 28px', background: '#1B6B3A', color: '#fff',
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