'use client';
// =============================================================
// AuthContext - gerencia estado de autenticacao global
// NOTA: login esta usando MOCK por enquanto. Marcado abaixo onde
// trocar pela chamada real da API (lib/services/auth.service.ts).
// =============================================================
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { setStoredToken, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/lib/api';
import type { LoginPayload, User } from '@/types';
import { MOCK_USER } from '@/lib/mock-data';
// import { authService } from '@/lib/services'; // TODO: REPLACE_WITH_API

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reidrata estado a partir do localStorage no mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignora
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      // =========================================================
      // TODO: REPLACE_WITH_API
      // Trocar o bloco abaixo pela chamada real quando a API FastAPI
      // estiver disponivel. Exemplo:
      //
      //   const res = await authService.login(payload);
      //   setStoredToken(res.access_token);
      //   window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      //   setUser(res.user);
      // =========================================================
      await new Promise((r) => setTimeout(r, 400)); // simula latencia
      const fakeUser: User = { ...MOCK_USER, login: payload.login || MOCK_USER.login };
      const fakeToken = 'mock-jwt-token-' + Date.now();
      setStoredToken(fakeToken);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fakeUser));
      setUser(fakeUser);
      router.push('/painel');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
