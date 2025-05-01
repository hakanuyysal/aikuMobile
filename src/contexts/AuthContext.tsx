import React, {createContext, useState, useContext, useEffect} from 'react';
import {storage} from '../storage/mmkv';
import BaseService from '../services/BaseService';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  linkedInLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = storage.getString('auth_token');
      if (token) {
        const userData = await BaseService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await BaseService.login(email, password);
      setUser(response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Giriş başarısız');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await BaseService.register(userData);
      setUser(response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kayıt başarısız');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      storage.delete('auth_token');
      storage.delete('user');
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Çıkış başarısız');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await BaseService.googleLogin(token);
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        throw new Error(response.error || 'Google girişi başarısız');
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Google girişi başarısız',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const linkedInLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      // LinkedIn girişi için gerekli işlemler burada yapılacak
      throw new Error('LinkedIn girişi henüz implement edilmedi');
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'LinkedIn girişi başarısız',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    googleLogin,
    linkedInLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
