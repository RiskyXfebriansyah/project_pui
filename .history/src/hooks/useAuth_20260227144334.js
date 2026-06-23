import { useState } from 'react';
import { AuthAPI } from '../services/api';

async function login(username, password) {

  const res = await fetch('/api/Auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.message);
    return;
  }

  const userData = {
    username: data.username,
    role: data.role,
    token: data.token   // 🔥 WAJIB ADA
  };

  localStorage.setItem('posyandu_user', JSON.stringify(userData));
  setUser(userData);
}
}

  async function logout() {
    try { await AuthAPI.logout(); } catch { /* abaikan error logout */ }
    // ← ganti catch(_) dengan catch kosong
    localStorage.removeItem('posyandu_user');
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}
