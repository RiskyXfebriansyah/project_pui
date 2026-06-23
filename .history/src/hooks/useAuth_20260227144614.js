import { useState } from 'react';
import { AuthAPI } from '../services/api';

export function useAuth() { const [user, setUser] = useState(() =>
   { const saved = localStorage.getItem('posyandu_user'); return saved ? JSON.parse(saved) : null; });
    const [isLoading, setLoading] = useState(false); const [error, setError] = useState(null); async function login(email, password) 
    { setLoading(true); setError(null); try { const res = await AuthAPI.login(email, password); if (res.status.code === 200 && res.data) 
      { const loggedUser = { id: res.data.id, nama: res.data.nama, email: res.data.email, role: res.data.role, jabatan: res.data.jabatan, posyandu: res.data.posyandu, namaAnak: res.data.namaAnak, token: res.data.token, refreshToken: res.data.refreshToken, };
       localStorage.setItem('posyandu_user', JSON.stringify(loggedUser)); setUser(loggedUser); setLoading(false); return true; } else { setError(res.status.message || 'Login gagal'); setLoading(false); return false; } }
        catch { // ← hapus 'err' karena tidak dipakai, langsung catch kosong setError('Tidak dapat terhubung ke server'); setLoading(false); return false; } }

  async function logout() {
    try { await AuthAPI.logout(); } catch { /* abaikan error logout */ }
    // ← ganti catch(_) dengan catch kosong
    localStorage.removeItem('posyandu_user');
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}
    }
