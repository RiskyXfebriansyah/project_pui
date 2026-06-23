// ============================================================
//  api.js — Service layer ke backend
//  BASE_URL: server posyandu
// ============================================================

const BASE_URL = 'http://192.168.3.248:2226';

// ── Baca token dari localStorage ──────────────────────────────
function getToken() {
  try {
    const saved = localStorage.getItem('posyandu_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // useAuth menyimpan token sebagai string di parsed.token
    return typeof parsed?.token === 'string' ? parsed.token : null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

// ── Fetch helper ───────────────────────────────────────────────
// ✅ TIDAK auto-reload saat 401 — biarkan hook handle sendiri
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

    // Kalau 401, kembalikan response kosong tapi JANGAN reload
    // agar tidak infinite loop redirect
    if (res.status === 401) {
      console.warn(`[api] 401 Unauthorized: ${endpoint}`);
      return { status: { code: 401, message: 'Unauthorized' }, data: null };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[api] Fetch error ${endpoint}:`, err);
    return { status: { code: 500, message: 'Network error' }, data: null };
  }
}

// ── Auth ───────────────────────────────────────────────────────
export const AuthAPI = {
  // Hanya fetch — TIDAK simpan ke localStorage (dilakukan di useAuth)
  login: async (email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    } catch (err) {
      console.error('[api] Login error:', err);
      throw err;
    }
  },
  logout: () => apiFetch('/api/Auth/Logout', { method: 'POST' }),
};

// ── Balita ─────────────────────────────────────────────────────
export const BalitaAPI = {
  getAll: () => apiFetch('/api/Balita/GetAll'),
  getById: (id) => apiFetch(`/api/Balita/GetById?id=${id}`),
  getPemantauan: (balitaId) => apiFetch(`/api/Balita/GetPemantauan?balitaId=${balitaId}`),
  create: (data) => apiFetch('/api/Balita/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  addPemantauan: (data) => apiFetch('/api/Balita/AddPemantauan', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiFetch(`/api/Balita/Delete?id=${id}`, { method: 'DELETE' }),
};

// ── Jadwal ─────────────────────────────────────────────────────
export const JadwalAPI = {
  getAll: () => apiFetch('/api/Jadwal/GetAll'),
  getUpcoming: () => apiFetch('/api/Jadwal/GetUpcoming'),
  create: (data) => apiFetch('/api/Jadwal/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiFetch(`/api/Jadwal/Delete?id=${id}`, { method: 'DELETE' }),
};

// ── Pengguna ───────────────────────────────────────────────────
export const PenggunaAPI = {
  getAll: () => apiFetch('/api/Pengguna/GetAll'),
  getById: (id) => apiFetch(`/api/Pengguna/GetById?id=${id}`),
  getByRole: (role) => apiFetch(`/api/Pengguna/GetByRole?role=${role}`),
  create: (data) => apiFetch('/api/Pengguna/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleAktif: (id, aktif) => apiFetch(
    `/api/Pengguna/ToggleAktif?id=${id}&aktif=${aktif}`,
    { method: 'PUT' }
  ),
  delete: (id) => apiFetch(`/api/Pengguna/Delete?id=${id}`, { method: 'DELETE' }),
};

// ── Laporan ────────────────────────────────────────────────────
export const LaporanAPI = {
  // Simpan/update laporan (insert if new, update if exists)
  simpan: (payload) => apiFetch('/api/Laporan/Simpan', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  // Load laporan berdasarkan tanggal pencatatan
  getByTanggal: (tanggal, posyandu) => {
    const q = posyandu ? `?tanggal=${tanggal}&posyandu=${encodeURIComponent(posyandu)}` : `?tanggal=${tanggal}`;
    return apiFetch(`/api/Laporan/ByTanggal${q}`);
  },
  // Daftar tanggal yang punya laporan (untuk dropdown)
  listTanggal: (posyandu) => apiFetch(`/api/Laporan/ListTanggal?posyandu=${encodeURIComponent(posyandu||'')}`),
  // Hapus laporan
  hapus: (id) => apiFetch(`/api/Laporan/Hapus/${id}`, { method: 'DELETE' }),
};