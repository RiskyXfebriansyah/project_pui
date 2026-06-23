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

      // ════════════════════════════════════════════
      //  DEBUG LENGKAP — lihat SEMUA field response
      // ════════════════════════════════════════════
      console.log('======= RAW API RESPONSE =======');
      console.log(JSON.stringify(res, null, 2));
      console.log('res.status:', res?.status);
      console.log('res.data (langsung):', res?.data);
      console.log('res.data keys:', res?.data ? Object.keys(res.data) : 'null');
      console.log('res.data.role:', res?.data?.role);
      console.log('res.data.data:', res?.data?.data);
      console.log('res.data.data?.role:', res?.data?.data?.role);
      console.log('================================');

      // Coba semua kemungkinan lokasi data user di response
      // Kemungkinan 1: { status, data: { role, nama, token: { token } } }
      // Kemungkinan 2: { status, data: { data: { role, nama, token } } }
      // Kemungkinan 3: { status, data: { user: { role, nama }, token } }

      const d1 = res?.data;           // langsung
      const d2 = res?.data?.data;     // nested satu level
      const d3 = res?.data?.user;     // nested di 'user'

      // Pilih yang punya field 'role'
      const dataUser = (d1?.role ? d1 : null)
                    || (d2?.role ? d2 : null)
                    || (d3?.role ? d3 : null)
                    || d1  // fallback ke d1 walaupun tidak ada role
                    || {};

      console.log('dataUser yang dipilih:', dataUser);
      console.log('dataUser.role:', dataUser?.role);

      if (res?.status?.code === 200) {
        // Cari token di semua kemungkinan tempat
        const tokenNested  = dataUser?.token || res?.data?.token;
        const tokenString  = tokenNested?.token
                          || (typeof tokenNested === 'string' ? tokenNested : null);
        const refreshToken = tokenNested?.refreshToken || null;

        const rawRole = dataUser?.role || dataUser?.Role || '';
        const role    = String(rawRole).toLowerCase();

        console.log('[useAuth] FINAL role:', role);
        console.log('[useAuth] FINAL token:', tokenString ? tokenString.substring(0,30)+'...' : 'NULL');

        if (role === 'orang_tua') {
          setLoading(false);
          return { ok: false, role: 'orang_tua' };
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

        console.log('[useAuth] loggedUser final:', loggedUser);

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