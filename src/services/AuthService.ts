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

interface LinkedInResponse {
  provider: Provider;
  url: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
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

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_CLIENT_ID || '974504980015-2n6mis0omh2mot251nok4fq41ptgbqn0.apps.googleusercontent.com',
      offlineAccess: false, // Set to false as requested
      scopes: ['profile', 'email'],
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

  async googleLogin() {
    try {
      await GoogleSignin.signOut(); // Clear any existing session
      
      const isPlayServicesAvailable = await GoogleSignin.hasPlayServices();
      if (!isPlayServicesAvailable) {
        console.error('[GoogleAuth] Play Services not available');
        throw new Error('Google Play Servisleri kullanılamıyor');
      }

      console.log('[GoogleAuth] Attempting to sign in...');
      const userInfo = await GoogleSignin.signIn();
      console.log('[GoogleAuth] Sign in successful:', userInfo);

      const idToken = userInfo.idToken;
      if (!idToken) {
        console.error('[GoogleAuth] No ID token received');
        throw new Error('Google ID token alınamadı');
      }

      console.log('[GoogleAuth] Sending token to backend...');
      const response = await this.axios.post('/auth/google/login', { idToken });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        if (response.data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
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
          details: 'Kullanıcı giriş işlemini iptal etti',
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

      console.error('[GoogleAuth] Error:', {
        message: error.message,
        code: error.code,
      });

      return {
        success: false,
        error: 'Google authentication error',
        details: error.message || 'Authentication failed',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  async signInWithLinkedIn(): Promise<LinkedInResponse> {
    try {
      const state = Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('linkedin_state', state);

      // LinkedIn OAuth configuration
      const clientId = Config.LINKEDIN_CLIENT_ID;
      const redirectUri = Config.APP_URL + '/auth/callback';
      const scope = 'r_liteprofile r_emailaddress';
      
      // Construct LinkedIn OAuth URL
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code` +
        `&client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}` +
        `&scope=${encodeURIComponent(scope)}`;

      // Open LinkedIn auth URL in browser
      await Linking.openURL(linkedInAuthUrl);

      // Return response object
      return {
        provider: 'linkedin' as Provider,
        url: linkedInAuthUrl,
      };
    } catch (error) {
      console.error('LinkedIn signin error:', error);
      throw this.handleError(error);
    }
  }

  async handleLinkedInCallback(code: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'linkedin',
        token: code,
      });

      if (error) throw error;

      // Store token if available
      if (data.session?.access_token) {
        await AsyncStorage.setItem('token', data.session.access_token);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Bir hata oluştu');
    }
    throw error;
  }

  private async handleGoogleLoginError(error: any): Promise<GoogleSignInResponse> {
    if (error.response?.status === 500) {
      return {
        success: false,
        error: 'Internal server error',
        message: 'Please try again later',
        errorCode: 500
      };
    }

    if (error.response?.data?.message) {
      return {
        success: false,
        error: error.response.data.message,
        message: 'Authentication failed',
        errorCode: error.response.status
      };
    }

    return {
      success: false,
      error: 'Network error occurred',
      message: 'Please check your internet connection',
      errorCode: error.response?.status || 500
    };
  }
}

const authService = new AuthService();
export default authService;

