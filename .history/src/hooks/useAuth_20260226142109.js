// ============================================================
//  useAuth — CONTROLLER LOGIN
//  Padanan: C_login.dart di Flutter
//
//  Di Flutter  → StateNotifier + loginProvider
//  Di React    → hook useState + localStorage
//
//  Cara pakai di komponen:
//    const { user, login, logout, isLoading } = useAuth();
// ============================================================

import { useState, useEffect } from 'react';

// ── Data lengkap tiap akun demo ───────────────────────────────
// INI yang jadi masalah sebelumnya:
// dulu pakai ...currentUser (selalu admin) lalu override email+role saja
// sekarang tiap akun punya data sendiri yang lengkap
const DEMO = [
  {
    email:    'admin@puskesmas.id',
    password: '123456',
    id:       'u001',
    nama:     'Dr. Hendra Wijaya',
    role:     'admin',
    jabatan:  'Kepala Puskesmas Sukamaju',
    posyandu: 'Puskesmas Kecamatan Sukamaju',
    puskesmas:'Puskesmas Kecamatan Sukamaju',
  },
  {
    email:    'bidan@posyandu.id',
    password: '123456',
    id:       'u002',
    nama:     'Bidan Siti Rahayu',
    role:     'bidan',
    jabatan:  'Bidan Desa Sukamaju',
    posyandu: 'Posyandu Mawar – Sukamaju',
    puskesmas:'Puskesmas Kecamatan Sukamaju',
  },
  {
    email:    'rina@posyandu.id',
    password: '123456',
    id:       'u003',
    nama:     'Rina Wulandari',
    role:     'kader',
    jabatan:  'Kader Posyandu Dahlia',
    posyandu: 'Posyandu Dahlia – Mekarjaya',
    puskesmas:'Puskesmas Kecamatan Sukamaju',
  },
];

export function useAuth() {
  // useState = padanan .obs di GetX / state di Riverpod
  const [user, setUser]         = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  // useEffect = padanan initState() di Flutter
  // Dijalankan sekali saat komponen pertama kali dimuat
  useEffect(() => {
    const saved = localStorage.getItem('posyandu_user');
    if (saved) setUser(JSON.parse(saved));
  }, []); // [] artinya: jalankan sekali saja

  // ── Fungsi login ──────────────────────────────────────────
  async function login(email, password) {
    setLoading(true);
    setError(null);

    // Simulasi network delay (nanti ganti dengan fetch() ke API)
    await new Promise(r => setTimeout(r, 1200));

    const found = DEMO.find(d => d.email === email && d.password === password);
    if (found) {
      const { password: _pw, ...loggedUser } = found;
      localStorage.setItem('posyandu_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoading(false);
      return true;
    } else {
      setError('Email atau password salah');
      setLoading(false);
      return false;
    }
  }

  // ── Fungsi logout ─────────────────────────────────────────
  function logout() {
    localStorage.removeItem('posyandu_user');
    setUser(null);
  }

  return { user, isLoading, error, login, logout };
}