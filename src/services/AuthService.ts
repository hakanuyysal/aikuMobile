import { supabase } from '../config/supabase';
import { Provider } from '@supabase/supabase-js';
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { Linking } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

interface UserData {
  email: string;
  password: string;
  name?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface GoogleSignInResponse {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
  message?: string;
  errorCode?: number | string;
}

class AuthService {
  private baseURL: string;
  private axios: AxiosInstance;

  constructor() {
    this.baseURL = Config.API_URL || 'https://api.aikuaiplatform.com/api';
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    GoogleSignin.configure({
      webClientId: Config.GOOGLE_CLIENT_ID || '940825068315-qqvvmj2v7dlj4gmf9tq5f7l7vt6gvp8q.apps.googleusercontent.com',
      iosClientId: '940825068315-qqvvmj2v7dlj4gmf9tq5f7l7vt6gvp8q.apps.googleusercontent.com',
      offlineAccess: false,
      scopes: ['profile', 'email'],
    });

    this.axios.interceptors.request.use(async config => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Deep link listener'ı initialize et
    this.initializeDeepLinkListener();
  }

  private initializeDeepLinkListener() {
    // Uygulama açıkken gelen deep link'leri dinle
    Linking.addEventListener('url', this.handleDeepLink.bind(this));
    
    // Uygulama kapalıyken gelen deep link'leri kontrol et
    Linking.getInitialURL().then(url => {
      if (url) this.handleDeepLink({ url });
    });
  }

  private async handleDeepLink(event: { url: string }) {
    console.log('[DeepLink] Received URL:', event.url);
    const url = event.url;

    if (!url.startsWith('yourapp://')) {
      console.warn('[DeepLink] Invalid URL scheme:', url);
      return;
    }

    const urlObj = new URL(url);
    console.log('[DeepLink] Parsed URL:', {
      protocol: urlObj.protocol,
      host: urlObj.host,
      pathname: urlObj.pathname,
      searchParams: Object.fromEntries(urlObj.searchParams),
    });

    // LinkedIn deep link'lerinin burada işlenmemesi gerektiğini belirttik
    // Bu kısım artık LinkedInWebView tarafından yönetiliyor.
    // Bu nedenle burada LinkedIn callback URL'sini işlemiyoruz.
    console.warn('[DeepLink] Unhandled path:', urlObj.pathname);
  }

  async register(userData: UserData) {
    const response = await this.axios.post('/register', userData);
    return response.data;
  }

  async login(credentials: LoginCredentials) {
    try {
      const response = await this.axios.post('/auth/login', credentials);
      if (response.data.token) {
        await this.setAuthData(response.data.token, response.data.user);
        return response.data;
      }
      throw new Error('Token alınamadı');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await this.axios.post('/logout');
        } catch (error) {
          console.warn('Logout API error:', error);
        }
      }
      // LinkedIn için kullanılan 'linkedin_auth_state' de temizlenmeli
      await AsyncStorage.multiRemove(['token', 'user', 'user_id', 'linkedin_auth_state']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return null;
      }
      try {
        const response = await this.axios.get('/auth/me');
        if (response.data && response.data.user) {
          await this.setAuthData(token, response.data.user);
          return response.data.user;
        }
        return null;
      } catch (error) {
        if (error.response?.status === 401) {
          await this.clearAuth();
        }
        return null;
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alma hatası:', error);
      return null;
    }
  }

  private async setAuthData(token: string, user: any) {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      if (user.id) {
        await AsyncStorage.setItem('user_id', user.id);
      }
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Token kaydetme hatası:', error);
      throw error;
    }
  }

  async clearAuth() {
    try {
      // LinkedIn için kullanılan 'linkedin_auth_state' de temizlenmeli
      await AsyncStorage.multiRemove(['token', 'user', 'user_id', 'linkedin_auth_state']);
      delete this.axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Token silme hatası:', error);
      throw error;
    }
  }

  async googleLogin(): Promise<GoogleSignInResponse> {
    try {
      await GoogleSignin.signOut();
      const isPlayServicesAvailable = await GoogleSignin.hasPlayServices();
      if (!isPlayServicesAvailable) {
        throw new Error('Google Play Servisleri kullanılamıyor');
      }
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;
      if (!idToken) {
        throw new Error('Google ID token alınamadı');
      }
      const response = await this.axios.post('/auth/google/login', { idToken });
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        if (response.data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
          if (response.data.user.id) {
            await AsyncStorage.setItem('user_id', response.data.user.id);
          }
        }
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }
      return {
        success: false,
        error: 'Beklenmeyen yanıt formatı',
        details: 'Sunucu yanıtı token içermiyor',
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: 'Google girişi iptal edildi',
          details: 'Kullanıcı giriş işlemi iptal edildi',
        };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: 'Google girişi zaten devam ediyor',
          details: 'Başka bir giriş işlemi sürüyor',
        };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: 'Google Play Servisleri kullanılamıyor',
          details: 'Cihazda Google Play Servisleri mevcut değil',
        };
      }
      return {
        success: false,
        error: 'Google authentication error',
        details: error.message || 'Authentication failed',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'Bir hata oluştu';
      return new Error(message);
    } else if (error.request) {
      return new Error('Sunucuya ulaşılamıyor');
    } else {
      return new Error(error.message || 'Bir hata oluştu');
    }
  }
}

const authService = new AuthService();
export default authService; 