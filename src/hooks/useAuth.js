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
      console.log('======= RAW API RESPONSE =======');
      console.log(JSON.stringify(res, null, 2));
      console.log('================================');

      const d1 = res?.data;
      const d2 = res?.data?.data;
      const d3 = res?.data?.user;

      const dataUser = (d1?.role ? d1 : null)
                    || (d2?.role ? d2 : null)
                    || (d3?.role ? d3 : null)
                    || d1
                    || {};

      if (res?.status?.code === 200) {
        const tokenNested  = dataUser?.token || res?.data?.token;
        const tokenString  = tokenNested?.token
                          || (typeof tokenNested === 'string' ? tokenNested : null);
        const refreshToken = tokenNested?.refreshToken || null;

        const rawRole = dataUser?.role || dataUser?.Role || '';
        const role    = String(rawRole).toLowerCase();

        if (role === 'orang_tua') {
          setLoading(false);
          return { ok: false, role: 'orang_tua', message: null };
        }

        const loggedUser = {
          id:           dataUser?.id,
          nama:         dataUser?.nama || dataUser?.name,
          email:        dataUser?.email,
          role,
          jabatan:      dataUser?.jabatan,
          posyandu:     dataUser?.posyandu || dataUser?.namaPosyandu || null,
          namaAnak:     dataUser?.namaAnak || null,
          token:        tokenString,
          refreshToken,
        };

        localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return { ok: true, role, message: null };

      } else {
        const message = res?.status?.message || 'Email atau password salah';
        setError(message);
        setLoading(false);
        return { ok: false, role: null, message };
      }
    } catch (err) {
      console.error('[useAuth] Login error:', err);
      const message = 'Tidak dapat terhubung ke server';
      setError(message);
      setLoading(false);
      return { ok: false, role: null, message };
    }
  }

 async function forgotPassword(email, passwordBaru) {
  try {
    const data = await AuthAPI.forgotPassword(email, passwordBaru);
    console.log('[forgotPassword] response:', data);

    if (data?.status?.code === 200) {
      return { ok: true, message: data.status.message || 'Password berhasil diubah!' };
    } else {
      return { ok: false, message: data?.status?.message || 'Gagal mengubah password' };
    }
  } catch (err) {
    console.error('[useAuth] forgotPassword error:', err);
    return { ok: false, message: 'Gagal terhubung ke server' };
  }
}

  async function logout() {
    try { await AuthAPI.logout(); } catch {}
    localStorage.removeItem('posyandu_user');
    sessionStorage.clear();
    setUser(null);
  }

  return { user, isLoading, error, login, logout, forgotPassword };
}