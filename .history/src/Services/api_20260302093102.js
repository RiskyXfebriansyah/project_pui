const BASE_URL = 'http://192.168.3.248:2226';

function getToken() {
  const user = localStorage.getItem('posyandu_user');
  return user ? JSON.parse(user).token : null;
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: authHeaders() });
  if (res.status === 401) { localStorage.removeItem('posyandu_user'); window.location.reload(); return null; }
  return res.json();
}

export const AuthAPI = {
  login: (email, password) =>
    fetch(`${BASE_URL}/api/Auth/Login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),
  logout: () => apiFetch('/api/Auth/Logout', { method: 'POST' }),
};

export const BalitaAPI = {
  getAll:        ()     => apiFetch('/api/Balita/GetAll'),
  getById:       (id)   => apiFetch(`/api/Balita/GetById?id=${id}`),
  getPemantauan: (id)   => apiFetch(`/api/Balita/GetPemantauan?balitaId=${id}`),
  create:        (data) => apiFetch('/api/Balita/Create', { method:'POST', body:JSON.stringify(data) }),
  addPemantauan: (data) => apiFetch('/api/Balita/AddPemantauan', { method:'POST', body:JSON.stringify(data) }),
  delete:        (id)   => apiFetch(`/api/Balita/Delete?id=${id}`, { method:'DELETE' }),
};

export const JadwalAPI = {
  getAll:   ()     => apiFetch('/api/Jadwal/GetAll'),
  create:   (data) => apiFetch('/api/Jadwal/Create', { method:'POST', body:JSON.stringify(data) }),
  delete:   (id)   => apiFetch(`/api/Jadwal/Delete?id=${id}`, { method:'DELETE' }),
};

export const PenggunaAPI = {
  getAll:      ()          => apiFetch('/api/Pengguna/GetAll'),
  create:      (data)      => apiFetch('/api/Pengguna/Create', { method:'POST', body:JSON.stringify(data) }),
  toggleAktif: (id, aktif) => apiFetch(`/api/Pengguna/ToggleAktif?id=${id}&aktif=${aktif}`, { method:'PUT' }),
  delete:      (id)        => apiFetch(`/api/Pengguna/Delete?id=${id}`, { method:'DELETE' }),
};
