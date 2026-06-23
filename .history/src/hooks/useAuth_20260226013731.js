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
import { currentUser } from '../data/dummyData';

// DEMO ACCOUNTS — bisa login pakai akun ini
const DEMO = [
  { email:'admin@puskesmas.id',  password:'123456', role:'admin'    },
  { email:'bidan@posyandu.id',   password:'123456', role:'bidan'    },
  { email:'rina@posyandu.id',    password:'123456', role:'kader'    },
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
      const loggedUser = { ...currentUser, email: found.email, role: found.role };
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
