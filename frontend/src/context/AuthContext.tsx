import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api, clearSession, loadSession, persistSession, Session } from '../api/client';
import { AuthResponse, ChildDto, RegisterResponse } from '../api/types';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  loginParent: (email: string, password: string) => Promise<void>;
  /** Шаг 1 регистрации: возвращает needsVerification (ждём код из письма). */
  registerParent: (name: string, email: string, password: string) => Promise<{ needsVerification: boolean }>;
  /** Шаг 2 регистрации: подтвердить код — вход выполняется автоматически. */
  verifyParent: (email: string, code: string) => Promise<void>;
  loginChild: (accessKey: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(loadSession());
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener('fm:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('fm:unauthorized', handleUnauthorized);
  }, []);

  const loginParent = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const next: Session = {
      type: 'parent',
      token: res.token,
      profile: { id: res.user.id, name: res.user.name, email: res.user.email },
    };
    persistSession(next);
    setSession(next);
  };

  const registerParent = async (name: string, email: string, password: string) => {
    const res = await api.post<RegisterResponse>('/auth/register', { name, email, password });
    if (res.needsVerification) {
      return { needsVerification: true };
    }
    if (res.token && res.user) {
      const next: Session = {
        type: 'parent',
        token: res.token,
        profile: { id: res.user.id, name: res.user.name, email: res.user.email },
      };
      persistSession(next);
      setSession(next);
    }
    return { needsVerification: false };
  };

  const verifyParent = async (email: string, code: string) => {
    const res = await api.post<AuthResponse>('/auth/verify-email', { email, code });
    const next: Session = {
      type: 'parent',
      token: res.token,
      profile: { id: res.user.id, name: res.user.name, email: res.user.email },
    };
    persistSession(next);
    setSession(next);
  };

  const loginChild = async (accessKey: string) => {
    const key = accessKey.trim().toUpperCase();
    const res = await api.post<ChildDto>('/child/session', { accessKey: key });
    const next: Session = {
      type: 'child',
      accessKey: key,
      profile: { id: res.id, name: res.name, avatarEmoji: res.avatarEmoji },
    };
    persistSession(next);
    setSession(next);
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, loginParent, registerParent, verifyParent, loginChild, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
}