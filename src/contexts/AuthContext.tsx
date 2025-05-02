import React, {createContext, useState, useContext, useEffect} from 'react';
import AuthService from '../services/AuthService';

interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUser: (data: Partial<User>) => void;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  linkedInLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData as User);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      if (response.user) {
        setUser(response.user as User);
      }
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await AuthService.googleLogin(token);
      if (response.success && response.user) {
        setUser(response.user as User);
      } else {
        throw new Error(response.error || 'Google login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const linkedInLogin = async () => {
    try {
      const response = await AuthService.signInWithLinkedIn();
      if (response.user) {
        setUser(response.user as User);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? {...prev, ...data} : null);
  };

  return (
    <AuthContext.Provider value={{user, loading, updateUser, login, googleLogin, linkedInLogin}}>
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
