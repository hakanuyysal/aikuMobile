import { supabase } from '../config/supabase';
import { Provider } from '@supabase/supabase-js';
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { Linking } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { SimpleEventEmitter } from './SimpleEventEmitter';
import { useProfileStore } from '../store/profileStore';

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
  public authEvents = new SimpleEventEmitter();

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
      iosClientId: Config.IOS_GOOGLE_CLIENT_ID || '974504980015-2e15l52tr86h8o42v8puf36lrtaamjqc.apps.googleusercontent.com',
      webClientId: '974504980015-2n6mis0omh2mot251nok4fq41ptgbqn0.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email'],
    });

    this.axios.interceptors.request.use(async config => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    Linking.addEventListener('url', this.handleDeepLink.bind(this));
    Linking.getInitialURL().then(url => {
      if (url) this.handleDeepLink({ url });
    });
  }

  private async handleDeepLink(event: { url: string }) {
    console.log('Received URL:', event.url);
    const url = event.url;

    if (!url.startsWith('com.aikumobile://')) {
      console.warn('Invalid URL scheme:', url);
      return;
    }

    const urlObj = new URL(url.replace('#', '?')); // hash'i query'ye çevir
    if (
      urlObj.pathname === '/auth/linkedin-callback' ||
      urlObj.pathname === '/linkedin-callback'
    ) {
      // access_token hash kısmında geliyor, onu al
      const paramsString = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
      const params = new URLSearchParams(paramsString);
      const accessToken = params.get('access_token');

      if (accessToken) {
        await AsyncStorage.setItem('token', accessToken);
        // Kullanıcı bilgisini almak için Supabase'den user'ı çekebilirsin
        const { data } = await supabase.auth.getUser(accessToken);
        if (data?.user) {
          await AsyncStorage.setItem('user_id', data.user.id);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          // Kullanıcıyı backend ile senkronize et
          await this.syncSupabaseUser('linkedin_oidc', accessToken, data.user);
          this.authEvents.emit('login', data.user);
          console.log('Google/LinkedIn login response user:', data.user);
        }
      } else {
        console.warn('No access_token found in callback URL');
      }
    } else {
      console.warn('Unhandled path:', urlObj.pathname);
    }
  }

  private extractCodeFromUrl(url: string): string | null {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('code');
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

  async logout(navigation: any) {
    try {
      if (!navigation || typeof navigation.reset !== 'function') {
        throw new Error('Navigation parameter is invalid!');
      }
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await this.axios.post('/logout');
        } catch (error) {
          console.warn('Logout API error:', error);
        }
      }
      await AsyncStorage.multiRemove(['token', 'user', 'user_id']);
      useProfileStore.getState().updateProfile({ social: {} });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return null;
      }
      try {
        const response = await this.axios.get('/auth/currentUser');
        if (response.data && response.data.user) {
          await this.setAuthData(token, response.data.user);
          return response.data.user;
        }
        return null;
      } catch (error) {
        if ((error as any).response?.status === 401) {
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
      await AsyncStorage.multiRemove(['token', 'user', 'user_id']);
      delete this.axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Token silme hatası:', error);
      throw error;
    }
  }

  async googleLogin(): Promise<GoogleSignInResponse> {
    try {
      console.error('[GoogleLogin] Çıkış yapılıyor...');
      await GoogleSignin.signOut();
      const isPlayServicesAvailable = await GoogleSignin.hasPlayServices();
      console.error('[GoogleLogin] Play Services:', isPlayServicesAvailable);
      if (!isPlayServicesAvailable) {
        throw new Error('Google Play Servisleri kullanılamıyor');
      }
      console.error('[GoogleLogin] GoogleSignin.signIn çağrılıyor...');
      const userInfo = await GoogleSignin.signIn();
      console.error('[GoogleLogin] Google userInfo:', userInfo);

      const idToken = (userInfo as any).data?.idToken;
      console.error('[GoogleLogin] idToken:', idToken);
      if (!idToken) {
        throw new Error('Google ID token alınamadı');
      }
      console.error('[GoogleLogin] Backend isteği atılıyor...');
      const response = await this.axios.post('/auth/google/login', { idToken });
      console.error('[GoogleLogin] Backend response:', response.data);
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        if (response.data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
          if (response.data.user.id) {
            await AsyncStorage.setItem('user_id', response.data.user.id);
          }
        }
        console.log('Google/LinkedIn login response user:', response.data.user);
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }
      return {
        success: false,
        error: 'Beklenmeyen yanıt formatı',
      };
    } catch (error: any) {
      console.error('[GoogleLogin] Hata:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: 'Google girişi iptal edildi',
        };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: 'Google girişi zaten devam ediyor',
        };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: 'Google Play Servisleri kullanılamıyor',
        };
      }
      return {
        success: false,
        error: error.message || 'Google authentication error',
        errorCode: error.code || 'unknown_error',
      };
    }
  }

  async signInWithLinkedIn(): Promise<LinkedInResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: 'com.aikumobile://auth/linkedin-callback',
          skipBrowserRedirect: true
        }
      });

      if (error) throw error;

      if (data.url) {
        await Linking.openURL(data.url);
      }

      return {
        provider: 'linkedin_oidc',
        url: data.url || '',
      };
    } catch (error) {
      console.error('LinkedIn login error:', error);
      throw error;
    }
  }

  async handleLinkedInCallback(code: string): Promise<any> {
    try {
      const storedState = await AsyncStorage.getItem('linkedin_state');
      const urlParams = new URLSearchParams(code.split('?')[1]);
      const state = urlParams.get('state');

      console.log('[LinkedIn Callback] Processing:', { code, state, storedState });

      if (state !== storedState) {
        throw new Error('State mismatch');
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;

      console.log('[LinkedIn Callback] Session:', { userId: data.user?.id });

      if (data.session?.access_token) {
        await AsyncStorage.setItem('token', data.session.access_token);
        if (data.user?.id) {
          console.log(
            'LinkedIn login sonrası kayıt edilecek user_id:',
            data.user.id,
          );
          await AsyncStorage.setItem('user_id', data.user.id);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('[LinkedIn Callback] Error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Supabase kullanıcısını backend ile senkronize et (LinkedIn, Google, vs.)
   * @param provider 'linkedin_oidc' | 'google' | ...
   * @param token Supabase access_token (veya ilgili provider tokenı)
   * @param userData Supabase user objesi (data.session.user)
   */
  async syncSupabaseUser(provider: string, token: string, userData: any) {
    try {
      const normalizedProvider = provider === 'linkedin_oidc' ? 'linkedin' : provider;
      const response = await this.axios.post(
        '/auth/supabase/sync',
        {
          provider: normalizedProvider,
          supabase_user_id: userData?.id,
          email: userData?.email,
          user_metadata: userData?.user_metadata || userData?.app_metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Backend'den dönen token ve user'ı kaydet
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        if (response.data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
          if (response.data.user.id) {
            await AsyncStorage.setItem('user_id', response.data.user.id);
          }
        }
      }
    } catch (error) {
      console.error('Supabase user sync error:', error);
      throw error;
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