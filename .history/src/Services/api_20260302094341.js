const BASE_URL = 'http://192.168.3.248:2226';

function getToken() {
  try {
    const user = localStorage.getItem('posyandu_user');
    if (!user) return null;
    const parsed = JSON.parse(user);
    return parsed?.token || parsed?.data?.token;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: authHeaders(),
  });

  if (res.status === 401) {
    localStorage.removeItem('posyandu_user');
    window.location.reload();
    return null;
  }

  return res.json();
}

export const AuthAPI = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/api/Auth/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // ✅ JANGAN simpan ke localStorage di sini!
    // Penyimpanan dilakukan di useAuth.login() agar data user lengkap tersimpan
    // dengan benar termasuk role

    return data;
  },
  logout: () => apiFetch('/api/Auth/Logout', { method: 'POST' }),
};

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

export const JadwalAPI = {
  getAll: () => apiFetch('/api/Jadwal/GetAll'),
  getUpcoming: () => apiFetch('/api/Jadwal/GetUpcoming'),
  create: (data) => apiFetch('/api/Jadwal/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiFetch(`/api/Jadwal/Delete?id=${id}`, { method: 'DELETE' }),
};

export const PenggunaAPI = {
  getAll: () => apiFetch('/api/Pengguna/GetAll'),
  getById: (id) => apiFetch(`/api/Pengguna/GetById?id=${id}`),
  getByRole: (role) => apiFetch(`/api/Pengguna/GetByRole?role=${role}`),
  create: (data) => apiFetch('/api/Pengguna/Create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleAktif: (id, aktif) => apiFetch(`/api/Pengguna/ToggleAktif?id=${id}&aktif=${aktif}`, { method: 'PUT' }),
  delete: (id) => apiFetch(`/api/Pengguna/Delete?id=${id}`, { method: 'DELETE' }),
};