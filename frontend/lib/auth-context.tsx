'use client';

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import useSWR from 'swr';
import { api } from './api';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<User | null>(
    'user',
    async () => {
      try {
        const response = await api.getMe();
        return response.data;
      } catch {
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const user = data ?? null;
  const isAuthenticated = !!user && !error;

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.data?.user) {
      await mutate(response.data.user, false);
    }
  }, [mutate]);

  const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string }) => {
    const response = await api.register(data);
    if (response.data?.user) {
      await mutate(response.data.user, false);
    }
  }, [mutate]);

  const logout = useCallback(async () => {
    await api.logout();
    await mutate(null, false);
  }, [mutate]);

  const refreshUser = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, isAuthenticated, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
