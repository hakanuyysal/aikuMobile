import { supabase } from '../config/supabase';
import { Provider } from '@supabase/supabase-js';
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

interface UserData {
  email: string;
  password: string;
  name?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LinkedInResponse {
  provider: Provider;
  url: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

class AuthService {
  private baseURL: string;
  private axios: AxiosInstance;

  constructor() {
    this.baseURL = 'https://api.aikuaiplatform.com/api';
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Token'ı her istekte otomatik ekle
    this.axios.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async register(userData: UserData) {
    const response = await this.axios.post('/register', userData);
    return response.data;
  }

  async login(credentials: LoginCredentials) {
    try {
      const response = await this.axios.post('/auth/login', credentials);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Token yoksa direkt çıkış yapmış sayılır
        return;
      }

      try {
        // Önce API'ye çıkış isteği gönder
        await this.axios.post('/logout');
      } catch (error) {
        // API hatası olsa bile devam et
        console.warn('Logout API error:', error);
      }

      // Her durumda local storage'ı temizle
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile sessizce devam et
    }
  }

  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Yetkisiz erişim');
      }

      const response = await this.axios.get('/auth/currentUser', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async googleLogin(token: string) {
    try {
      const isIdToken = token.startsWith('eyJ');
      const requestData = isIdToken ? { idToken: token } : { accessToken: token };

      const response = await this.axios.post(
        '/auth/google/login',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 30000,
        },
      );

      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        return {
          ...response.data,
          success: true,
        };
      }

      return {
        success: false,
        error: 'Beklenmeyen yanıt formatı',
        details: 'Sunucu yanıtı token içermiyor',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google authentication error',
        details: error.response?.data?.details || 'Authentication failed',
        errorCode: error.response?.status || 'unknown_error',
      };
    }
  }

  async signInWithLinkedIn(): Promise<LinkedInResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${Config.APP_URL}/auth/callback`,
          scopes: 'openid profile email',
          queryParams: {
            prompt: 'consent',
            access_type: 'offline',
          },
        },
      });

      if (error) throw error;
      return data as LinkedInResponse;
    } catch (error) {
      throw error;
    }
  }

  private handleError(error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Bir hata oluştu');
    }
    throw error;
  }
}

const authService = new AuthService();
export default authService;
