import React, { useState } from 'react';
import { Card, Button, Modal, InputField, SelectField, EmptyState, Table, RoleBadge } from '../components/ui/Components';

function useToast() {
  const [toast, setToast] = useState(null);
  function show(type, msg) { setToast({ type, msg }); setTimeout(() => setToast(null), 3200); }
  return { toast, showSuccess: m => show('success', m), showError: m => show('error', m) };
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 99999, padding: '14px 24px', borderRadius: 14,
      background: toast.type === 'success' ? '#16A34A' : '#DC2626',
      color: '#fff', fontWeight: 700, fontSize: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit',
    }}>
      {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
    </div>
  );
}

export default function PenggunaPage({
  users,
  onToggleAktif,
  onDelete,
  onAdd,      // untuk tenaga medis → PenggunaAPI.create
  onAddOrtu,  // untuk orang tua   → PenggunaAPI.createOrtu  ← BARU
  onRefresh,
}) {
  const [tab,      setTab]      = useState('medis');
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const { toast, showSuccess, showError } = useToast();

  // ── Form tenaga medis ─────────────────────────────────────
  const [formMedis, setFormMedis] = useState({
    nama: '', email: '', password: '123456', role: 'bidan',
    jabatan: '', noTelepon: '', posyanduId: '',
  });

  // ── Form orang tua + anak ─────────────────────────────────
  const [formOrtu, setFormOrtu] = useState({
    nama: '', email: '', password: '123456', noTelepon: '', posyanduId: '',
    namaAnak: '', tanggalLahirAnak: '', jenisKelaminAnak: 'Laki-laki', nikAnak: '',
  });

  const tenagaMedis = (users || []).filter(u =>
    ['admin', 'bidan', 'kader'].includes(u.role) &&
    (!search || u.nama?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );
  const orangTua = (users || []).filter(u =>
    u.role === 'orang_tua' &&
    (!search || u.nama?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()) ||
     (u.namaAnak || '').toLowerCase().includes(search.toLowerCase()))
  );
  const activeList = tab === 'medis' ? tenagaMedis : orangTua;

  // ── Reset form helper ─────────────────────────────────────
  function resetMedis() {
    setFormMedis({ nama: '', email: '', password: '123456', role: 'bidan', jabatan: '', noTelepon: '', posyanduId: '' });
  }
  function resetOrtu() {
    setFormOrtu({ nama: '', email: '', password: '123456', noTelepon: '', posyanduId: '', namaAnak: '', tanggalLahirAnak: '', jenisKelaminAnak: 'Laki-laki', nikAnak: '' });
  }

  // ── Save tenaga medis ─────────────────────────────────────
  async function saveMedis() {
    if (!formMedis.nama)  { showError('Nama wajib diisi'); return; }
    if (!formMedis.email) { showError('Email wajib diisi'); return; }
    setSaving(true);
    const result = await onAdd({
      ...formMedis,
      posyanduId: formMedis.posyanduId ? parseInt(formMedis.posyanduId) : null,
      namaAnak: null,
      aktif: true,
    });
    setSaving(false);
    if (result?.ok) {
      showSuccess('Tenaga medis berhasil ditambahkan!');
      resetMedis();
      setShowForm(false);
      if (typeof onRefresh === 'function') onRefresh();
    } else {
      showError(result?.message || 'Gagal menyimpan');
    }
  }

  // ── Save orang tua + balita via onAddOrtu (hook → API) ────
  async function saveOrtu() {
    if (!formOrtu.nama)  { showError('Nama orang tua wajib diisi'); return; }
    if (!formOrtu.email) { showError('Email wajib diisi'); return; }
    if (formOrtu.namaAnak && !formOrtu.tanggalLahirAnak) {
      showError('Tanggal lahir anak wajib diisi jika nama anak diisi'); return;
    }
    if (formOrtu.namaAnak && !formOrtu.posyanduId) {
      showError('ID Posyandu wajib diisi jika mendaftarkan anak'); return;
    }

    setSaving(true);
    const result = await onAddOrtu({
      nama:             formOrtu.nama,
      email:            formOrtu.email,
      password:         formOrtu.password || '123456',
      noTelepon:        formOrtu.noTelepon        || '',
      posyanduId:       formOrtu.posyanduId ? parseInt(formOrtu.posyanduId) : null,
      namaAnak:         formOrtu.namaAnak         || '',
      tanggalLahirAnak: formOrtu.tanggalLahirAnak || null,
      jenisKelaminAnak: formOrtu.jenisKelaminAnak || 'Laki-laki',
      nikAnak:          formOrtu.nikAnak          || '',
    });
    setSaving(false);

    if (result?.ok) {
      showSuccess(result.message || 'Akun orang tua berhasil dibuat!');
      resetOrtu();
      setShowForm(false);
      if (typeof onRefresh === 'function') onRefresh();
    } else {
      showError(result?.message || 'Gagal menyimpan');
    }
  }

  async function handleToggle(id, aktif) {
    const result = await onToggleAktif(id, aktif);
    if (result?.ok !== false) showSuccess(aktif ? 'Akun diaktifkan' : 'Akun dinonaktifkan');
    else showError(result?.message || 'Gagal');
  }

  async function handleDelete(id) {
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
    const result = await onDelete(id);
    if (result?.ok !== false) showSuccess('Berhasil dihapus');
    else showError(result?.message || 'Gagal');
  }

  // ── Kolom tabel tenaga medis ──────────────────────────────
  const colsMedis = [
    {
      key: 'nama', label: 'NAMA', render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: { admin: '#F0FDF4', bidan: '#EFF6FF', kader: '#FFF7ED' }[r.role] || '#F9FAFB',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {r.role === 'admin' ? '👨‍⚕️' : r.role === 'bidan' ? '👩‍⚕️' : '🤝'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{v}</div>
            <div style={{ fontSize: 11, color: '#9E9E9E' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role',     label: 'ROLE',      render: v => <RoleBadge role={v} /> },
    { key: 'posyandu', label: 'UNIT KERJA', render: v => <span style={{ fontSize: 12 }}>{v || '-'}</span> },
    {
      key: 'aktif', label: 'STATUS', render: (v, r) => (
        <button onClick={() => handleToggle(r.id, !r.aktif)} style={{
          padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: v ? '#F0FDF4' : '#F9FAFB',
          color: v ? '#16A34A' : '#9E9E9E',
          fontWeight: 700, fontSize: 11, fontFamily: 'inherit',
        }}>
          {v ? '● Aktif' : '○ Nonaktif'}
        </button>
      ),
    },
    {
      key: 'aksi', label: 'AKSI', render: (_, r) => (
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); handleDelete(r.id); }}>
          🗑️ Hapus
        </Button>
      ),
    },
  ];

  // ── Kolom tabel orang tua ─────────────────────────────────
  const colsOrtu = [
    {
      key: 'nama', label: 'NAMA ORANG TUA', render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#F5F3FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>👨‍👩‍👧</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{v}</div>
            <div style={{ fontSize: 11, color: '#9E9E9E' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'namaAnak', label: 'NAMA ANAK', render: v => (
        <span style={{
          padding: '4px 10px', borderRadius: 20,
          background: v ? '#F0FDF4' : '#F9FAFB',
          fontSize: 12, fontWeight: 600,
          color: v ? '#16A34A' : '#9E9E9E',
        }}>
          {v ? `👶 ${v}` : 'Belum terhubung'}
        </span>
      ),
    },
    { key: 'posyandu', label: 'POSYANDU', render: v => <span style={{ fontSize: 12 }}>{v || '-'}</span> },
    {
      key: 'aktif', label: 'AKUN', render: (v, r) => (
        <button onClick={() => handleToggle(r.id, !r.aktif)} style={{
          padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: v ? '#F0FDF4' : '#FEF2F2',
          color: v ? '#16A34A' : '#DC2626',
          fontWeight: 700, fontSize: 11, fontFamily: 'inherit',
        }}>
          {v ? '● Aktif' : '○ Nonaktif'}
        </button>
      ),
    },
    {
      key: 'aksi', label: 'AKSI', render: (_, r) => (
        <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); handleDelete(r.id); }}>
          🗑️ Hapus
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Toast toast={toast} />

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          ['👨‍⚕️', 'Tenaga Medis', tenagaMedis.length,                       '#1B6B3A', '#F0FDF4'],
          ['👨‍👩‍👧', 'Orang Tua',  orangTua.length,                           '#6D28D9', '#F5F3FF'],
          ['✅',   'Akun Aktif',  (users || []).filter(u => u.aktif).length,  '#16A34A', '#F0FDF4'],
          ['⭕',   'Nonaktif',   (users || []).filter(u => !u.aktif).length,  '#9E9E9E', '#F9FAFB'],
        ].map(([i, l, v, c, bg]) => (
          <div key={l} style={{
            flex: 1, padding: '16px', background: bg, borderRadius: 14,
            border: `1px solid ${c}22`, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 26 }}>{i}</span>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 11, color: '#9E9E9E' }}>{l}</div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Manajemen Pengguna</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                placeholder="🔍 Cari nama, email..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB',
                  fontSize: 12, fontFamily: 'inherit', outline: 'none', width: 240, background: '#F9FAFB',
                }}
              />
              <Button onClick={() => setShowForm(true)}>
                ➕ {tab === 'medis' ? 'Tambah Tenaga Medis' : 'Daftarkan Orang Tua'}
              </Button>
            </div>
          </div>

          {/* Tab */}
          <div style={{ display: 'flex', borderBottom: '2px solid #F0F0F0' }}>
            {[
              { k: 'medis', label: '👨‍⚕️ Tenaga Medis', count: tenagaMedis.length, color: '#1B6B3A' },
              { k: 'ortu',  label: '👨‍👩‍👧 Orang Tua',  count: orangTua.length,   color: '#6D28D9' },
            ].map(t => (
              <button key={t.k} onClick={() => { setTab(t.k); setSearch(''); }} style={{
                padding: '10px 24px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                fontWeight: tab === t.k ? 700 : 500,
                color: tab === t.k ? t.color : '#9E9E9E',
                borderBottom: tab === t.k ? `2.5px solid ${t.color}` : '2.5px solid transparent',
                marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {t.label}
                <span style={{
                  padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: tab === t.k ? `${t.color}18` : '#F3F4F6',
                  color: tab === t.k ? t.color : '#9E9E9E',
                }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tab === 'ortu' && (
          <div style={{
            padding: '10px 14px', background: '#F5F3FF', borderRadius: 10,
            border: '1px solid #DDD6FE', marginBottom: 14, fontSize: 12, color: '#6D28D9',
          }}>
            💡 Orang tua hanya bisa login di aplikasi <strong>Mobile</strong>. Data anak otomatis terhubung ke akun ini.
          </div>
        )}

        {activeList.length === 0
          ? <EmptyState
              emoji={tab === 'medis' ? '👨‍⚕️' : '👨‍👩‍👧'}
              message={search
                ? `Tidak ditemukan "${search}"`
                : tab === 'medis' ? 'Belum ada tenaga medis' : 'Belum ada orang tua'}
            />
          : <Table columns={tab === 'medis' ? colsMedis : colsOrtu} data={activeList} />
        }
      </Card>

      {/* ── Modal Tambah Tenaga Medis ─────────────────────── */}
      <Modal open={showForm && tab === 'medis'} onClose={() => setShowForm(false)} title="Tambah Tenaga Medis" width={440}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <InputField label="Nama Lengkap *" value={formMedis.nama}       onChange={v => setFormMedis(p => ({ ...p, nama: v }))} />
          <InputField label="Email *"        value={formMedis.email}      onChange={v => setFormMedis(p => ({ ...p, email: v }))} type="email" />
          <SelectField label="Role *"        value={formMedis.role}       onChange={v => setFormMedis(p => ({ ...p, role: v }))}
            options={[{ value: 'admin', label: 'Admin' }, { value: 'bidan', label: 'Bidan' }, { value: 'kader', label: 'Kader' }]} />
          <InputField label="No. Telepon"    value={formMedis.noTelepon}  onChange={v => setFormMedis(p => ({ ...p, noTelepon: v }))} placeholder="08xx" />
          <InputField label="Jabatan"        value={formMedis.jabatan}    onChange={v => setFormMedis(p => ({ ...p, jabatan: v }))} />
          <InputField label="ID Posyandu"    value={formMedis.posyanduId} onChange={v => setFormMedis(p => ({ ...p, posyanduId: v }))} type="number" />
        </div>
        <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A', fontSize: 12, color: '#92400E', marginBottom: 14 }}>
          🔑 Password default: <strong>123456</strong>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={saveMedis} disabled={saving}>{saving ? 'Menyimpan...' : '💾 Simpan'}</Button>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
        </div>
      </Modal>

      {/* ── Modal Daftarkan Orang Tua + Anak ─────────────── */}
      <Modal open={showForm && tab === 'ortu'} onClose={() => setShowForm(false)} title="Daftarkan Akun Orang Tua" width={500}>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#6B7280', marginBottom: 8 }}>👤 Data Akun</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <InputField label="Nama Orang Ibu *" value={formOrtu.nama}       onChange={v => setFormOrtu(p => ({ ...p, nama: v }))} />
          <InputField label="Email *"          value={formOrtu.email}      onChange={v => setFormOrtu(p => ({ ...p, email: v }))} type="email" />
          <InputField label="No. Telepon"      value={formOrtu.noTelepon}  onChange={v => setFormOrtu(p => ({ ...p, noTelepon: v }))} type="tel" />
          <InputField label="ID Posyandu"      value={formOrtu.posyanduId} onChange={v => setFormOrtu(p => ({ ...p, posyanduId: v }))} type="number" />
        </div>

        {/* Divider data anak */}
        <div style={{ margin: '16px 0 12px', borderTop: '1.5px dashed #E5E7EB', position: 'relative' }}>
          <span style={{
            position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
            background: '#fff', padding: '0 10px', fontSize: 11, fontWeight: 700, color: '#9E9E9E',
          }}>
            👶 Data Anak (opsional)
          </span>
        </div>

        <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', border: '1px solid #BBF7D0' }}>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginBottom: 10 }}>
            ✅ Jika diisi → data balita otomatis terbuat & terhubung ke akun ini
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <InputField label="Nama Anak"          value={formOrtu.namaAnak}         onChange={v => setFormOrtu(p => ({ ...p, namaAnak: v }))} />
            <InputField label="NIK Anak"           value={formOrtu.nikAnak}          onChange={v => setFormOrtu(p => ({ ...p, nikAnak: v }))} placeholder="opsional" />
            <InputField label="Tanggal Lahir Anak" value={formOrtu.tanggalLahirAnak} onChange={v => setFormOrtu(p => ({ ...p, tanggalLahirAnak: v }))} type="date" />
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>Jenis Kelamin</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Laki-laki', 'Perempuan'].map(jk => (
                  <button key={jk} onClick={() => setFormOrtu(p => ({ ...p, jenisKelaminAnak: jk }))} style={{
                    flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${formOrtu.jenisKelaminAnak === jk ? '#1B6B3A' : '#E5E7EB'}`,
                    background: formOrtu.jenisKelaminAnak === jk ? '#F0FDF4' : '#fff',
                    color: formOrtu.jenisKelaminAnak === jk ? '#1B6B3A' : '#6B7280',
                    fontWeight: 600, fontSize: 12,
                  }}>
                    {jk === 'Laki-laki' ? '👦' : '👧'} {jk}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A', fontSize: 12, color: '#92400E', margin: '12px 0' }}>
          🔑 Password default: <strong>123456</strong>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={saveOrtu} disabled={saving}>{saving ? 'Menyimpan...' : '💾 Daftarkan'}</Button>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}