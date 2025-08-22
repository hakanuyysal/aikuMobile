import axios, { AxiosInstance, AxiosError } from 'axios';
import { MMKV } from 'react-native-mmkv';
import Config from '../config/Config';

export const storage = new MMKV();

class BaseService {
  protected axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: `${Config.API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axios.interceptors.request.use(
      config => {
        const token = storage.getString('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );
  }

  protected handleError(error: unknown) {
    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      throw new Error(message);
    }
    throw error;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
      const response = await this.axios.post('/auth/register', userData);

      if (response.data.token) {
        storage.set('token', response.data.token);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic GET request
  async getRequest(url: string, config?: any) {
    try {
      const response = await this.axios.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic POST request
  async postRequest(url: string, data: any, config?: any) {
    try {
      const response = await this.axios.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PUT request
  async putRequest(url: string, data: any, config?: any) {
    try {
      const response = await this.axios.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic DELETE request
  async deleteRequest(url: string, config?: any) {
    try {
      const response = await this.axios.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNews(page = 1, limit = 5, search = '') {
    try {
      const params: any = { limit, page };
      if (search.trim()) {
        params.search = search.trim();
      }
      return await this.getRequest('/news', { params });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNewsById(id: string) {
    try {
      return await this.getRequest(`/news/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 🔹 **PRODUCT API METOTLARI**

  // Tüm ürünleri getirme
  async getAllProducts() {
    try {
      return await this.getRequest('/product/all');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Belirli bir ürünü ID'ye göre getir (getProductById)
  async getProductById(productId: string) {
    try {
      return await this.getRequest(`/product/${productId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 🔹 **BLOG API METOTLARI**

  async getBlogs(page = 1, limit = 5) {
    try {
      return await this.getRequest(`/blog/all?page=${page}&limit=${limit}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBlogById(blogId: string) {
    try {
      return await this.getRequest(`/blog/${blogId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBlog(blogData: { title: string; fullContent: string }) {
    try {
      return await this.postRequest('/blog', blogData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBlog(blogId: string, updatedData: { title?: string; fullContent?: string }) {
    try {
      return await this.putRequest(`/blog/${blogId}`, updatedData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBlog(blogId: string) {
    try {
      return await this.deleteRequest(`/blog/${blogId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadBlogCover(blogId: string, file: any) { // Use 'any' for File type compatibility
    try {
      const formData = new FormData();
      formData.append('cover', file);

      return await this.postRequest(
        `/upload/blog-cover/${blogId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBlogCover(blogId: string) {
    try {
      return await this.deleteRequest(`/upload/blog-cover/${blogId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mevcut kullanıcı
  async getCurrentUser() {
    try {
      const res = await this.axios.get('/auth/currentUser');
      return res.data; // { success, user: {...} }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Kullanıcı güncelle (acceptChatNotification, accountStatus vb.)
  async updateUser(userData: Partial<{
    acceptChatNotification: boolean;
    accountStatus: 'active' | 'deactivated';
    email?: string;
  }>) {
    try {
      const res = await this.axios.put('/auth/updateUser', userData);
      return res.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Şifre değiştir
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    try {
      const res = await this.axios.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return res.data; // { success, message }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email değişimi — kod gönder
  async requestEmailChange(newEmail: string) {
    try {
      const res = await this.axios.post('/auth/email/change/request', { newEmail });
      return res.data; // { success, message }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email değişimi — kod doğrula
  async confirmEmailChange(code: string) {
    try {
      const res = await this.axios.post('/auth/email/change/confirm', { code });
      return res.data; // { success, message }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Hesabı sil (email kullanıcılarında şifre gerekebilir)
  async deleteAccount(password?: string) {
    try {
      const config: any = { data: {} };
      if (password) config.data.password = password;
      const res = await this.axios.delete('/auth/delete-account', config);
      // token'ı temizle
      storage.delete('token');
      return res.data; // { success, message }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Opsiyonel: logout’u burada da tutmak istersen
  async logout() {
    try {
      const res = await this.axios.post('/auth/logout', {});
      storage.delete('token');
      return res.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default new BaseService(); 