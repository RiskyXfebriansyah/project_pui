import { useState, useEffect } from 'react';
import { AuthAPI } from '../services/api';

export function useAuth() {
  const [user, setUser]         = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);

  // ── Baca session dari localStorage saat pertama load ─────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('posyandu_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Pastikan data valid: harus ada role dan token
        if (parsed?.role && parsed?.token) {
          setUser(parsed);
        } else {
          // Data tidak lengkap, hapus agar tidak stuck
          localStorage.removeItem('posyandu_user');
        }
      }
    } catch {
      localStorage.removeItem('posyandu_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────
  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthAPI.login(email, password);

      if (res?.status?.code === 200 && res.data) {
        // Struktur response API (dari Postman):
        // res.data = {
        //   token: { token: "eyJ...", refreshToken: "KHij..." },
        //   id, nama, email, role, jabatan, posyandu, ...
        // }
        const tokenNested  = res.data.token;
        const tokenString  = tokenNested?.token        || (typeof tokenNested === 'string' ? tokenNested : null);
        const refreshToken = tokenNested?.refreshToken || null;

        const loggedUser = {
          id:           res.data.id,
          nama:         res.data.nama,
          email:        res.data.email,
          role:         res.data.role,      // "admin" | "bidan" | "kader" | "orang_tua"
          jabatan:      res.data.jabatan,
          posyandu:     res.data.posyandu || res.data.namaPosyandu || null,
          namaAnak:     res.data.namaAnak || null,
          token:        tokenString,        // ← string JWT, bukan object
          refreshToken: refreshToken,
        };

        // Orang tua tidak boleh masuk web
        if (loggedUser.role === 'orang_tua') {
          setLoading(false);
          return { ok: false, role: 'orang_tua' };
        }

        localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return { ok: true, role: loggedUser.role };

      } else {
        const msg = res?.status?.message || 'Email atau password salah';
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

  // ── LOGOUT — hanya dipanggil saat user klik tombol logout ────
  async function logout() {
    try { await AuthAPI.logout(); } catch {}
    localStorage.removeItem('posyandu_user');
    sessionStorage.clear();
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}