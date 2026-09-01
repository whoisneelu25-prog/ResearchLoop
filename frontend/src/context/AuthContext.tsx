import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, inst?: string, field?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateProfile: (profile: { full_name?: string; institution?: string; research_field?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch {
          api.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
  };

  const register = async (name: string, email: string, pass: string, inst?: string, field?: string) => {
    const res = await api.register(name, email, pass, inst, field);
    setUser(res.user);
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    setUser(res.user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateProfile = async (profile: { full_name?: string; institution?: string; research_field?: string }) => {
    const updated = await api.updateProfile(profile);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, demoLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
