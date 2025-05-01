import BaseService from './BaseService';
import { storage } from '../storage/mmkv';
import { supabase } from '../config/supabase';
import { Provider } from '@supabase/supabase-js';

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

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async register(userData: UserData) {
    return await this.create(userData);
  }

  async login(credentials: LoginCredentials) {
    try {
      const response = await this.axios.post(
        `${this.baseURL}/login`,
        credentials,
      );
      if (response.data.token) {
        storage.set('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.axios.post(`${this.baseURL}/logout`);
      storage.clearAll();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const token = storage.getString('auth_token');
      if (!token) throw new Error('Yetkisiz erişim');

      const response = await this.axios.get(`${this.baseURL}/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
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
        storage.set('auth_token', response.data.token);
        return {
          ...response.data,
          success: true,
        };
      }

      return {
        ...response.data,
        success: false,
        error: 'Beklenmeyen yanıt formatı',
        details: 'Sunucu yanıtı token içermiyor',
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Google authentication error';
      const errorDetails =
        error.response?.data?.details || 'Authentication failed';
      const errorCode =
        error.response?.data?.errorCode ||
        error.response?.status ||
        'unknown_error';

      return {
        success: false,
        error: errorMessage,
        details: errorDetails,
        errorCode: errorCode,
      };
    }
  }

  async signInWithLinkedIn(): Promise<LinkedInResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/auth/callback`,
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
}

export default new AuthService();
