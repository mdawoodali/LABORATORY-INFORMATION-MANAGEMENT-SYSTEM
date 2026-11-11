"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ADMIN_EMAIL = 'precisionqualityserviceslabs@gmail.com';
const ADMIN_PASSWORD = 'pqs@1234';
const STORAGE_KEY = 'pqs_admin_session_v1';

interface AdminAuthSession {
  email: string;
  token: string;
  loginAt: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminEmail: string;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const session: AdminAuthSession = JSON.parse(raw);
          if (session && session.email === ADMIN_EMAIL && session.token) {
            setIsAuthenticated(true);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanEmail === ADMIN_EMAIL && cleanPass === ADMIN_PASSWORD) {
      const session: AdminAuthSession = {
        email: ADMIN_EMAIL,
        token: `pqs_auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        loginAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.warn('Could not persist session to localStorage:', e);
      }

      setIsAuthenticated(true);
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Invalid administrator email or password. Access is restricted to authorized laboratory personnel.' 
    };
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        adminEmail: ADMIN_EMAIL,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
