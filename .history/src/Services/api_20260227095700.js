// ============================================================
//  api.js — SERVICE LAYER
//  Semua komunikasi ke C# API ada di sini
//  Base URL: http://192.168.3.248:2226
// ============================================================

const BASE_URL = 'http://192.168.3.248:2226';

// ── Helper: ambil token dari localStorage ─────────────────────
function getToken() {
  const user = localStorage.getItem('posyandu_user');
  return user ? JSON.parse(user).token : null;
}

// ── Helper: header default dengan JWT token ───────────────────
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

// ── Helper: fetch wrapper — auto handle error ─────────────────
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: authHeaders(),
  });

  // Kalau 401 → token expired → redirect ke login
  if (res.status === 401) {
    localStorage.removeItem('posyandu_user');
    window.location.reload();
    return null;
  }

  return res.json();
}

// ============================================================
//  AUTH
// ============================================================
export const AuthAPI = {
  login: async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/Auth/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // ⬇️ TAMBAHKAN INI
  if (res.ok && data?.data?.token) {
    localStorage.setItem(
      'posyandu_user',
      JSON.stringify({
        token: data.data.token,
        refreshToken: data.data.refreshToken,
        user: data.data.user
      })
    );
  }

  return data;
},

// ============================================================
//  BALITA
// ============================================================
export const BalitaAPI = {
  getAll: () =>
    apiFetch('/api/Balita/GetAll'),

  getById: (id) =>
    apiFetch(`/api/Balita/GetById?id=${id}`),

  getPemantauan: (balitaId) =>
    apiFetch(`/api/Balita/GetPemantauan?balitaId=${balitaId}`),

  create: (data) =>
    apiFetch('/api/Balita/Create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addPemantauan: (data) =>
    apiFetch('/api/Balita/AddPemantauan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiFetch(`/api/Balita/Delete?id=${id}`, { method: 'DELETE' }),
};

// ============================================================
//  JADWAL
// ============================================================
export const JadwalAPI = {
  getAll: () =>
    apiFetch('/api/Jadwal/GetAll'),

  getUpcoming: () =>
    apiFetch('/api/Jadwal/GetUpcoming'),

  create: (data) =>
    apiFetch('/api/Jadwal/Create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiFetch(`/api/Jadwal/Delete?id=${id}`, { method: 'DELETE' }),
};

// ============================================================
//  PENGGUNA
// ============================================================
export const PenggunaAPI = {
  getAll: () =>
    apiFetch('/api/Pengguna/GetAll'),

  getById: (id) =>
    apiFetch(`/api/Pengguna/GetById?id=${id}`),

  getByRole: (role) =>
    apiFetch(`/api/Pengguna/GetByRole?role=${role}`),

  create: (data) =>
    apiFetch('/api/Pengguna/Create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleAktif: (id, aktif) =>
    apiFetch(`/api/Pengguna/ToggleAktif?id=${id}&aktif=${aktif}`, { method: 'PUT' }),

  delete: (id) =>
    apiFetch(`/api/Pengguna/Delete?id=${id}`, { method: 'DELETE' }),
};
