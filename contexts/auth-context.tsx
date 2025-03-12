"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, setAuthToken, removeAuthToken, apiGet, apiPost } from '@/lib/api-client';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }
      
      try {
        const userData = await apiGet('/api/users/me');
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        setUser(null);
        setIsLoggedIn(false);
        removeAuthToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsLoggedIn(false);
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (getAuthToken()) {
        try {
          await apiPost('/api/users/logout', {});
        } catch (error) {
          console.error('Logout API error:', error);
        }
      }
      
      // Even if API call fails, clear local state
      removeAuthToken();
      setUser(null);
      setIsLoggedIn(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local state
      removeAuthToken();
      setUser(null);
      setIsLoggedIn(false);
      window.location.href = '/login';
    }
  };

  // Check auth status on initial load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage events to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (e.newValue) {
          checkAuth();
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn, checkAuth, logout, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
