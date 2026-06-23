// ── PosyanduPage ───────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, EmptyState } from '../components/ui/Components';

type PosyanduItem = {
  id: number;
  nama: string;
  desa: string;
  kecamatan: string;
  aktif: boolean;
  totalBalita: number;
  stunting: number;
  namaKader?: string; // sesuaikan dengan field dari API
};

type ApiResponse<T> = {
  status: {
    code: number;
    count: number;
    message: string;
  };
  data: T;
};

export function PosyanduPage() {
  const [data, setData] = useState<PosyanduItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama: '',
    desa: '',
    kecamatan: '',
    aktif: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get<ApiResponse<PosyanduItem[]>>(
        '/api/Posyandu/GetAll'
      );
      setData(res.data.data || []);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.desa || !form.kecamatan) return;

    try {
      setError(null);
      await axios.post('/api/Posyandu/Create', {
        nama: form.nama,
        desa: form.desa,
        kecamatan: form.kecamatan,
        aktif: form.aktif,
      });

      setForm({ nama: '', desa: '', kecamatan: '', aktif: true });
      await loadData();
    } catch (e: any) {
      setError(e?.message || 'Gagal menambah posyandu');
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Hapus Posyandu "${nama}"?`)) return;

    try {
      setError(null);
      await axios.delete('/api/Posyandu/Delete', { params: { id } });

      // optimistik: hapus langsung di state
      setData(prev => prev.filter(p => p.id !== id));
      // atau kalau mau aman, panggil lagi loadData();
    } catch (e: any) {
      setError(e?.message || 'Gagal menghapus posyandu');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* FORM TAMBAH POSYANDU */}
      <form
        onSubmit={handleCreate}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <input
          placeholder="Nama Posyandu"
          value={form.nama}
          onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #E5E7EB' }}
        />
        <input
          placeholder="Desa"
          value={form.desa}
          onChange={e => setForm(f => ({ ...f, desa: e.target.value }))}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #E5E7EB' }}
        />
        <input
          placeholder="Kecamatan"
          value={form.kecamatan}
          onChange={e => setForm(f => ({ ...f, kecamatan: e.target.value }))}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #E5E7EB' }}
        />
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={form.aktif}
            onChange={e => setForm(f => ({ ...f, aktif: e.target.checked }))}
            style={{ marginRight: 4 }}
          />
          Aktif
        </label>
        <button
          type="submit"
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#16A34A',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Tambah Posyandu
        </button>
      </form>

      {/* ERROR / LOADING */}
      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            background: '#FEF2F2',
            color: '#B91C1C',
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* GRID DATA POSYANDU */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
          gap: 14,
        }}
      >
        {loading && <div>Loading...</div>}

        {!loading && data.length === 0 && (
          <EmptyState
            emoji="📭"
            message="Belum ada data posyandu"
          />
        )}

        {!loading &&
          data.map(p => (
            <Card key={p.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: '#F0FDF4',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  🏥
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.nama}</div>
                  <div style={{ fontSize: 11, color: '#9E9E9E' }}>
                    Desa {p.desa} · Kec. {p.kecamatan}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    background: p.aktif ? '#F0FDF4' : '#F9FAFB',
                    color: p.aktif ? '#16A34A' : '#9E9E9E',
                  }}
                >
                  {p.aktif ? 'Aktif' : 'Nonaktif'}
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.nama)}
                  style={{
                    marginLeft: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#DC2626',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                  title="Hapus"
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                {[
                  ['Total Balita', p.totalBalita, '#1565C0'],
                  [
                    'Stunting',
                    p.stunting,
                    p.stunting > 0 ? '#DC2626' : '#9E9E9E',
                  ],
                ].map(([l, v, c]) => (
                  <div
                    key={l as string}
                    style={{
                      background: '#F9FAFB',
                      borderRadius: 8,
                      padding: '10px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: c as string,
                      }}
                    >
                      {v as number}
                    </div>
                    <div style={{ fontSize: 10, color: '#9E9E9E' }}>
                      {l as string}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: '#6B7280',
                }}
              >
                👤 Kader:{' '}
                <strong>{p.namaKader || p['kader'] || '-'}</strong>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
