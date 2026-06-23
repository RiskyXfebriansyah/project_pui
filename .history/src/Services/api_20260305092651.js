// ============================================================
//  api.js — Service layer ke backend IoTManagerAPI
//  BASE_URL: server posyandu
// ============================================================

const BASE_URL = 'http://192.168.3.248:2226';

function getToken() {
  try {
    const saved = localStorage.getItem('posyandu_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return typeof parsed?.token === 'string' ? parsed.token : null;
  } catch { return null; }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    if (res.status === 401) {
      console.warn(`[api] 401 Unauthorized: ${endpoint}`);
      return { status: { code: 401, message: 'Unauthorized' }, data: null };
    }
    return await res.json();
  } catch (err) {
    console.error(`[api] Fetch error ${endpoint}:`, err);
    return { status: { code: 500, message: 'Network error' }, data: null };
  }
}

// ── Auth ───────────────────────────────────────────────────────
export const AuthAPI = {
  login: async (email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    } catch (err) { console.error('[api] Login error:', err); throw err; }
  },
  logout: () => apiFetch('/api/Auth/Logout', { method: 'POST' }),
};

// ── Balita ─────────────────────────────────────────────────────
export const BalitaAPI = {
  getAll:        ()     => apiFetch('/api/Balita/GetAll'),
  getById:       (id)   => apiFetch(`/api/Balita/GetById?id=${id}`),
  getPemantauan: (id)   => apiFetch(`/api/Balita/GetPemantauan?balitaId=${id}`),
  create: (data) => apiFetch('/api/Balita/Create', {
    method: 'POST',
    body:   JSON.stringify(data),
  }),
  addPemantauan: (data) => apiFetch('/api/Balita/AddPemantauan', {
    method: 'POST',
    body:   JSON.stringify(data),
  }),
  delete: (id) => apiFetch(`/api/Balita/Delete?id=${id}`, { method: 'DELETE' }),
};

// ── Jadwal ─────────────────────────────────────────────────────
export const JadwalAPI = {
  getAll:      ()     => apiFetch('/api/Jadwal/GetAll'),
  getUpcoming: ()     => apiFetch('/api/Jadwal/GetUpcoming'),
  create:     (data)  => apiFetch('/api/Jadwal/Create', { method: 'POST', body: JSON.stringify(data) }),
  delete:     (id)    => apiFetch(`/api/Jadwal/Delete?id=${id}`, { method: 'DELETE' }),
};

// ── Pengguna ───────────────────────────────────────────────────
export const PenggunaAPI = {
  getAll:     ()          => apiFetch('/api/Pengguna/GetAll'),
  getById:    (id)        => apiFetch(`/api/Pengguna/GetById?id=${id}`),
  getByRole:  (role)      => apiFetch(`/api/Pengguna/GetByRole?role=${role}`),

  // Untuk tenaga medis (admin / bidan / kader)
  create: (data) => apiFetch('/api/Pengguna/Create', {
    method: 'POST',
    body:   JSON.stringify(data),
  }),

  // Untuk orang tua + balita (1 transaksi)
  // DTO: { nama, email, password, noTelepon, posyanduId,
  //        namaAnak?, tanggalLahirAnak?, jenisKelaminAnak?, nikAnak? }
  createOrtu: (data) => apiFetch('/api/Pengguna/CreateOrtu', {
    method: 'POST',
    body:   JSON.stringify(data),
  }),

  toggleAktif: (id, aktif) => apiFetch(`/api/Pengguna/ToggleAktif?id=${id}&aktif=${aktif}`, { method: 'PUT' }),
  delete:      (id)        => apiFetch(`/api/Pengguna/Delete?id=${id}`, { method: 'DELETE' }),
};

// ── Laporan ────────────────────────────────────────────────────
export const LaporanAPI = {
  simpan: (payload) => apiFetch('/api/Laporan/Simpan', {
    method: 'POST',
    body:   JSON.stringify(payload),
  }),
  getByTanggal: (tanggal, posyandu) => {
    const q = posyandu
      ? `?tanggal=${tanggal}&posyandu=${encodeURIComponent(posyandu)}`
      : `?tanggal=${tanggal}`;
    return apiFetch(`/api/Laporan/ByTanggal${q}`);
  },
  listTanggal: (posyandu) =>
    apiFetch(`/api/Laporan/ListTanggal?posyandu=${encodeURIComponent(posyandu || '')}`),
  hapus: (id) => apiFetch(`/api/Laporan/Delete?id=${id}`, { method: 'DELETE' }),
};