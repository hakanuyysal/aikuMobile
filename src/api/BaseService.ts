import axios from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = Config.API_URL || 'https://api.aikuaiplatform.com';

class BaseService {
  private axios;

  constructor() {
    this.axios = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add the auth token
    this.axios.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
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

  // Hata yönetimi
  handleError(error: any) {
    console.error("API Hatası:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data || 'Response yok',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    if (error.response) {
      return error.response.data; // Return backend error response
    }
    return {
      status: 500,
      message: "Server connection failed. Please try again later.",
      error: error.message,
    };
  }
}

export default new BaseService(); 