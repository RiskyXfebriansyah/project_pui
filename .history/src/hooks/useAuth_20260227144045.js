import { useState } from 'react';
import { AuthAPI } from '../services/api';

export const AuthAPI = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/api/Auth/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data?.data?.token) {
      // Simpan ke localStorage
      localStorage.setItem(
        'posyandu_user',
        JSON.stringify({
          token: data.data.token,
          refreshToken: data.data.refreshToken,
          user: data.data.user
        })
      );
    }

    return data;
  },

  logout: () =>
    apiFetch('/api/Auth/Logout', { method: 'POST' }),

  refreshToken: (refreshToken) =>
    fetch(`${BASE_URL}/api/Auth/RefreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: '', refreshToken }),
    }).then(r => r.json()),
};
