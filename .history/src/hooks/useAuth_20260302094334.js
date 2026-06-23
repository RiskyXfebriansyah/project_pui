import { useState, useEffect } from 'react';
import { AuthAPI } from '../services/api';

export function useAuth() {
  const [user, setUser]         = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);

  // Baca session saat pertama load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('posyandu_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Pastikan ada role sebelum di-set
        if (parsed && parsed.role) {
          setUser(parsed);
        } else {
          // Data tidak valid, hapus
          localStorage.removeItem('posyandu_user');
        }
      }
    } catch {
      localStorage.removeItem('posyandu_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── LOGIN — return { ok: true/false, role } ──────────────────
  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthAPI.login(email, password);

      // Debug: log response untuk memastikan struktur data
      console.log('[useAuth] Login response:', res);

      if (res?.status?.code === 200 && res.data) {
        const loggedUser = {
          id:           res.data.id,
          nama:         res.data.nama,
          email:        res.data.email,
          role:         res.data.role,           // ← KUNCI: harus ada
          jabatan:      res.data.jabatan,
          posyandu:     res.data.posyandu,
          namaAnak:     res.data.namaAnak,
          token:        res.data.token,
          refreshToken: res.data.refreshToken,
        };

        console.log('[useAuth] Saving user:', loggedUser);
        console.log('[useAuth] Role:', loggedUser.role);

        // Simpan ke localStorage
        localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);

        // Kembalikan { ok: true, role } agar LoginPage bisa redirect
        return { ok: true, role: loggedUser.role };

      } else {
        const msg = res?.status?.message || 'Login gagal';
        setError(msg);
        setLoading(false);
        return { ok: false, role: null };
      }
    } catch (err) {
      console.error('[useAuth] Login error:', err);
      setError('Tidak dapat terhubung ke server');
      setLoading(false);
      return { ok: false, role: null };
    }
  }

  async function logout() {
    try { await AuthAPI.logout(); } catch {}
    localStorage.removeItem('posyandu_user');
    sessionStorage.clear();
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}