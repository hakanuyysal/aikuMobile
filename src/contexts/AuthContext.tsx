import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';
import RevenueCatService from '../services/RevenueCatService';
import { configureNotificationsAfterLogin } from '../services/push/oneSignal';

interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  updateUser: (data: Partial<User>) => void;
  login: (email: string, password: string) => Promise<any>;
  googleLogin: () => Promise<any>;
  linkedInLogin: () => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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
        
        // RevenueCat User ID'sini set et
        if (userData.id) {
          try {
            const result = await RevenueCatService.setUserID(userData.id);
            if (result) {
              console.log('✅ RevenueCat User ID set:', userData.id);
            } else {
              console.log('⚠️ RevenueCat User ID set edilemedi, devam ediliyor');
            }
          } catch (error) {
            console.log('⚠️ RevenueCat User ID set error, devam ediliyor:', error);
          }
        }
        return;
      }

      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        
        // RevenueCat User ID'sini set et
        if (parsedUser.id) {
          try {
            const result = await RevenueCatService.setUserID(parsedUser.id);
            if (result) {
              console.log('✅ RevenueCat User ID set:', parsedUser.id);
            } else {
              console.log('⚠️ RevenueCat User ID set edilemedi, devam ediliyor');
            }
          } catch (error) {
            console.log('⚠️ RevenueCat User ID set error, devam ediliyor:', error);
          }
        }
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
      setLoading(true);
      const response = await AuthService.login({ email, password });
      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        
        // RevenueCat User ID'sini set et
        if (response.user.id) {
          try {
            const result = await RevenueCatService.setUserID(response.user.id);
            if (result) {
              console.log('✅ RevenueCat User ID set:', response.user.id);
            } else {
              console.log('⚠️ RevenueCat User ID set edilemedi, devam ediliyor');
            }
          } catch (error) {
            console.log('⚠️ RevenueCat User ID set error, devam ediliyor:', error);
          }
        }

        // Login sonrası bildirim ayarlarını yapılandır
        try {
          await configureNotificationsAfterLogin();
        } catch (error) {
          console.log('⚠️ Bildirim ayarları yapılandırma hatası, devam ediliyor:', error);
        }

        return response;
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
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
    // Google login implementation
    return {};
  };

  const linkedInLogin = async () => {
    // LinkedIn login implementation
    return {};
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        updateUser,
        login,
        googleLogin,
        linkedInLogin,
        logout,
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
