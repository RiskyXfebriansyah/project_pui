import { useState, useEffect } from 'react';
import { AuthAPI } from '../services/api';

export function useAuth() {
  const [user, setUser]         = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('posyandu_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          // Normalisasi role saat baca dari localStorage juga
          if (parsed.role) parsed.role = String(parsed.role).toLowerCase();
          setUser(parsed);
        } else {
          localStorage.removeItem('posyandu_user');
        }
      }
    } catch {
      localStorage.removeItem('posyandu_user');
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthAPI.login(email, password);

      if (res?.status?.code === 200 && res.data) {
        const tokenNested  = res.data.token;
        const tokenString  = tokenNested?.token || (typeof tokenNested === 'string' ? tokenNested : null);
        const refreshToken = tokenNested?.refreshToken || null;

        // ✅ Paksa lowercase agar cocok dengan ALLOWED_PAGES di App.jsx
        // API mungkin return "Admin", "ADMIN", "admin" — semua jadi lowercase
        const rawRole = res.data.role || res.data.Role || '';
        const role    = String(rawRole).toLowerCase();

        console.log('[useAuth] raw role dari API:', rawRole, '→ normalized:', role);

        if (role === 'orang_tua') {
          setLoading(false);
          return { ok: false, role: 'orang_tua' };
        }

        const loggedUser = {
          id:           res.data.id,
          nama:         res.data.nama,
          email:        res.data.email,
          role,                              // ← sudah lowercase
          jabatan:      res.data.jabatan,
          posyandu:     res.data.posyandu || res.data.namaPosyandu || null,
          namaAnak:     res.data.namaAnak || null,
          token:        tokenString,
          refreshToken,
        };

        localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return { ok: true, role };

      } else {
        setError(res?.status?.message || 'Email atau password salah');
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