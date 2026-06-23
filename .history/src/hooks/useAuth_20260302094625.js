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
        console.log('=== [useAuth] Data dari localStorage ===');
        console.log(parsed);
        console.log('Role dari localStorage:', parsed?.role);
        if (parsed && parsed.role) {
          setUser(parsed);
        } else {
          console.warn('[useAuth] Tidak ada role di localStorage, hapus session');
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

      // ── DEBUG: Lihat PERSIS struktur response dari API ──────
      console.log('=== [useAuth] RAW Response dari API ===');
      console.log(JSON.stringify(res, null, 2));
      console.log('res.data:', res?.data);
      console.log('res.data.role:', res?.data?.role);
      console.log('res.status:', res?.status);

      if (res?.status?.code === 200 && res.data) {
        // Coba semua kemungkinan letak field role di response API
        const roleRaw =
          res.data.role        ||   // { data: { role: 'bidan' } }
          res.data.Role        ||   // PascalCase
          res.data.user?.role  ||   // { data: { user: { role } } }
          res.data.User?.role  ||
          res.data.userRole    ||
          null;

        console.log('[useAuth] Role yang ditemukan:', roleRaw);

        // Normalisasi ke lowercase
        const role = roleRaw ? String(roleRaw).toLowerCase() : null;

        if (!role) {
          console.error('[useAuth] ⚠️ ROLE TIDAK DITEMUKAN! Lihat log di atas untuk cek struktur response API');
        }

        const loggedUser = {
          id:           res.data.id           || res.data.Id,
          nama:         res.data.nama         || res.data.Nama         || res.data.name  || res.data.Name,
          email:        res.data.email        || res.data.Email,
          role:         role,
          jabatan:      res.data.jabatan      || res.data.Jabatan,
          posyandu:     res.data.posyandu     || res.data.Posyandu     || res.data.namaPosyandu,
          namaAnak:     res.data.namaAnak     || res.data.NamaAnak,
          token:        res.data.token        || res.data.Token,
          refreshToken: res.data.refreshToken || res.data.RefreshToken,
        };

        console.log('=== [useAuth] User yang akan disimpan ===');
        console.log(loggedUser);

        localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
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