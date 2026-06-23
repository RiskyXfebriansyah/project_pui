// ============================================================
//  useAuth.js — CONTROLLER LOGIN (VERSI API)
//  Ganti dummy data → fetch ke C# API
// ============================================================

import { useState } from 'react';
import { AuthAPI } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('posyandu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  // ── Login → panggil API ───────────────────────────────────
  async function login(email, password) {
    setLoading(true);
    setError(null);

    try {
      const res = await AuthAPI.login(email, password);

      if (res.status.code === 200 && res.data) {
        // Simpan semua data user + token ke localStorage
        const loggedUser = {
          id:           res.data.id,
          nama:         res.data.nama,
          email:        res.data.email,
          role:         res.data.role,
          jabatan:      res.data.jabatan,
          posyandu:     res.data.posyandu,
          namaAnak:     res.data.namaAnak,
          token:        res.data.token,        // ← JWT token untuk request berikutnya
          refreshToken: res.data.refreshToken,
        };
        localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return true;
      } else {
        // Pesan error dari API (email tidak ditemukan / password salah)
        setError(res.status.message || 'Login gagal');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server');
      setLoading(false);
      return false;
    }
  }

  // ── Logout ────────────────────────────────────────────────
  async function logout() {
    try {
      await AuthAPI.logout(); // revoke refresh token di server
    } catch (_) {}
    localStorage.removeItem('posyandu_user');
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}
