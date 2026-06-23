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
        setUser(parsed);
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
        // Simpan semua data user + token
        const loggedUser = {
          id:           res.data.id,
          nama:         res.data.nama,
          email:        res.data.email,
          role:         res.data.role,
          jabatan:      res.data.jabatan,
          posyandu:     res.data.posyandu,
          namaAnak:     res.data.namaAnak,
          token:        res.data.token,
          refreshToken: res.data.refreshToken,
        };
        localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return true;
      } else {
        setError(res?.status?.message || 'Login gagal');
        setLoading(false);
        return false;
      }
    } catch {
      setError('Tidak dapat terhubung ke server');
      setLoading(false);
      return false;
    }
  }

  async function logout() {
    try { await AuthAPI.logout(); } catch {}
    // ✅ Clear semua session
    localStorage.removeItem('posyandu_user');
    sessionStorage.clear();
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}
