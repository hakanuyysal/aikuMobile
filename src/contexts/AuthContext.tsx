import React, {createContext, useState, useContext, useEffect} from 'react';
import AuthService from '../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // <-- EKLE
  loading: boolean;
  updateUser: (data: Partial<User>) => void;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<any>;
  linkedInLogin: () => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // <-- EKLE
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData);
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
        return;
      }

      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
        await AuthService.clearAuth();
      }
    } catch (error) {
      setUser(null);
      setToken(null);
      await AuthService.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({email, password});
      if (response.user) {
        setUser(response.user);
      }
      if (response.token) {
        setToken(response.token);
        await AsyncStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.clearAuth();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  const googleLogin = async () => {
    try {
      const response = await AuthService.googleLogin();
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const linkedInLogin = async () => {
    try {
      const response = await AuthService.signInWithLinkedIn();
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => (prev ? {...prev, ...data} : null));
  };

  const refreshUser = async () => {
    // AsyncStorage'den user'ı oku ve set et
    const userStr = await AsyncStorage.getItem('user');
    setUser(userStr ? JSON.parse(userStr) : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // <-- EKLE
        loading,
        login,
        logout,
        googleLogin,
        linkedInLogin,
        updateUser,
      }}>
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
