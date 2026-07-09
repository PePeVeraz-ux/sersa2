'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface UserProfile {
  first_name?: string;
  last_name?: string;
  second_last_name?: string;
  professional_license?: string;
  bio?: string;
  date_of_birth?: string;
}

interface User {
  id: string;
  email: string;
  role: 'patient' | 'nurse' | 'admin';
  status: string;
  phone?: string;
  patient_profile?: UserProfile;
  nurse_profile?: UserProfile;
  admin_profile?: UserProfile;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function enrichUser(raw: User): User {
  const profile = raw.patient_profile || raw.nurse_profile || raw.admin_profile;
  const name = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : raw.email.split('@')[0];
  return { ...raw, name };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('sersa_token');
    if (!storedToken) return;
    try {
      const profile = await apiFetch<User>('/auth/me', { token: storedToken });
      const enriched = enrichUser(profile);
      setUser(enriched);
      localStorage.setItem('sersa_user', JSON.stringify(enriched));
    } catch {
      localStorage.removeItem('sersa_token');
      localStorage.removeItem('sersa_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('sersa_token');
    const storedUser = localStorage.getItem('sersa_user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(enrichUser(JSON.parse(storedUser)));
        } catch {
          localStorage.removeItem('sersa_user');
        }
      }
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    localStorage.setItem('sersa_token', newToken);
    apiFetch<User>('/auth/me', { token: newToken })
      .then((profile) => {
        const enriched = enrichUser(profile);
        setUser(enriched);
        localStorage.setItem('sersa_user', JSON.stringify(enriched));
        redirectByRole(enriched.role);
      })
      .catch(() => {
        const enriched = enrichUser(userData);
        setUser(enriched);
        localStorage.setItem('sersa_user', JSON.stringify(enriched));
        redirectByRole(userData.role);
      });
  };

  const redirectByRole = (role: string) => {
    if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'nurse') router.push('/nurse/dashboard');
    else router.push('/patient/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sersa_token');
    localStorage.removeItem('sersa_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
