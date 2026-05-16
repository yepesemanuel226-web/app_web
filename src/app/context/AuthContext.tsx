import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

interface User {
  email: string;
  name: string;
  role: UserRole;
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Derivar usuario SOLO de la sesión, sin consultar la tabla users
  const sessionToUser = (session: Session | null): User | null => {
    if (!session?.user) return null;

    const supaUser = session.user;
    const email = supaUser.email || '';
    const isAdmin = email.endsWith('@edu.co') || !!email.match(/@.*\.edu\./);
    const role: UserRole = isAdmin ? 'admin' : 'user';
    const name = supaUser.user_metadata?.name || email.split('@')[0] || 'Usuario';

    return { id: supaUser.id, email, name, role };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(sessionToUser(session));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(sessionToUser(session));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No se pudo crear el usuario');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
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