import { storage } from '../storage/mmkv';
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = 'YOUR_API_URL'; // API URL'nizi buraya ekleyin

export class BaseService {
  private static instance: BaseService;
  private axios: AxiosInstance;
  private baseURL: string;

  private constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL: 'https://api.aikuaiplatform.com/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): BaseService {
    if (!BaseService.instance) {
      BaseService.instance = new BaseService();
    }
    return BaseService.instance;
  }

  // Tüm öğeleri getirme
  async getAll(params = {}) {
    try {
      const response = await this.axios.get(this.baseURL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Belirli bir öğeyi ID'ye göre getir
  async getById(id: string) {
    try {
      const response = await this.axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Yeni bir öğe oluştur
  async create(data: any) {
    try {
      const token = storage.getString('auth_token');
      const response = await this.axios.post(this.baseURL, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Belirli bir öğeyi güncelle
  async update(id: string, data: any) {
    try {
      const token = storage.getString('auth_token');
      const response = await this.axios.put(`${this.baseURL}/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Belirli bir öğeyi sil
  async delete(id: string) {
    try {
      const token = storage.getString('auth_token');
      const response = await this.axios.delete(`${this.baseURL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Kullanıcı Giriş
  async login(email: string, password: string) {
    try {
      const response = await this.axios.post('/auth/login', { email, password });
      if (response.data.token) {
        storage.set('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Kullanıcı Kayıt
  async register(userData: any) {
    try {
      const response = await this.axios.post('/auth/register', userData);
      if (response.data.token) {
        storage.set('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Google ile Giriş
  async googleLogin(token: string) {
    try {
      const requestData = token.startsWith('eyJ')
        ? { idToken: token }
        : { accessToken: token };

      const response = await this.axios.post('/auth/google/login', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (response.data && response.data.token) {
        storage.set('auth_token', response.data.token);
        return {
          ...response.data,
          success: true
        };
      }

      return {
        success: false,
        error: 'Token alınamadı',
        details: 'Sunucu yanıtı token içermiyor'
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Google authentication error';
        const errorDetails = error.response?.data?.details || 'Authentication failed';
        const errorCode = error.response?.data?.errorCode || error.response?.status || 'unknown_error';

        return {
          success: false,
          error: errorMessage,
          details: errorDetails,
          errorCode: errorCode
        };
      }
      
      return {
        success: false,
        error: 'Bilinmeyen bir hata oluştu',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: 'unknown_error'
      };
    }
  }

  // Mevcut Kullanıcı Bilgisi
  async getCurrentUser() {
    try {
      const token = storage.getString('auth_token');
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

  // Supabase kullanıcısını backend ile senkronize et
  async syncSupabaseUser(provider: string, token: string, userData: any) {
    try {
      const normalizedProvider = provider === 'linkedin_oidc' ? 'linkedin' : provider;
      
      const response = await this.axios.post('/auth/supabase/sync', 
        {
          provider: normalizedProvider,
          supabase_user_id: userData?.id,
          email: userData?.email,
          user_metadata: userData?.user_metadata || userData?.app_metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.token) {
        storage.set('auth_token', response.data.token);
        if (response.data.user) {
          storage.set('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Hata yönetimi
  private handleError(error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error.response.data;
    }
    throw {
      status: 500,
      message: 'Server connection failed. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }

  static async getAllProducts() {
    try {
      const response = await axios.get(`${API_URL}/products`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/user/current`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const baseServiceInstance = BaseService.getInstance();
export default baseServiceInstance; 