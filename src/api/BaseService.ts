import axios from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = Config.API_URL || 'https://api.aikuaiplatform.com/api';

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

  async getNews(page = 1, limit = 5, search = '') {
    try {
      const params: any = { limit, page };
      if (search.trim()) {
        params.search = search.trim();
      }
      const response = await this.axios.get('/news', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNewsById(id: string) {
    try {
      const response = await this.axios.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 🔹 **PRODUCT API METOTLARI**

  // Tüm ürünleri getirme
  async getAllProducts() {
    try {
      const response = await this.axios.get(`/product/all`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Belirli bir ürünü ID'ye göre getir (getProductById)
  async getProductById(productId: string) {
    try {
      const response = await this.axios.get(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 🔹 **BLOG API METOTLARI**

  async getBlogs(page = 1, limit = 5) {
    try {
      const response = await this.axios.get(`/blog/all?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBlogById(blogId: string) {
    try {
      const response = await this.axios.get(`/blog/${blogId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBlog(blogData: { title: string; fullContent: string }) {
    try {
      const response = await this.axios.post('/blog', blogData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBlog(blogId: string, updatedData: { title?: string; fullContent?: string }) {
    try {
      const response = await this.axios.put(`/blog/${blogId}`, updatedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBlog(blogId: string) {
    try {
      const response = await this.axios.delete(`/blog/${blogId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadBlogCover(blogId: string, file: any) { // Use 'any' for File type compatibility
    try {
      const formData = new FormData();
      formData.append('cover', file);

      const response = await this.axios.post(
        `/upload/blog-cover/${blogId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

   async deleteBlogCover(blogId: string) {
    try {
      const response = await this.axios.delete(
        `/upload/blog-cover/${blogId}`
      );
      return response.data;
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