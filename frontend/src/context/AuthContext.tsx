import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (token: string, name: string, email: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.verify();
        setUser(response.user);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register({ name, email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (token: string, name: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.googleLogin({ token, name, email });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Google login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};