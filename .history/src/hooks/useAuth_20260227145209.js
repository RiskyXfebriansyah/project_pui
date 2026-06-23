import { useState, useEffect } from 'react';
import { AuthAPI } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 Sync dengan api.js format
  useEffect(() => {
    try {
      const saved = localStorage.getItem('posyandu_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || parsed); // Fleksibel
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
      if (res.status?.code === 200 && res.data) {
        // api.js sudah handle localStorage, kita cuma set state
        setUser(res.data.user || res.data);
        return true;
      } else {
        setError(res.status?.message || 'Login gagal');
        return false;
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await AuthAPI.logout();
    } catch {}
    localStorage.removeItem('posyandu_user');
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}
