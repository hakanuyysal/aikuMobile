import axiosInstance from './axiosInstance';
import { storage } from '../storage/mmkv';
import { AxiosInstance } from 'axios';

class BaseService {
  protected axios: AxiosInstance;
  protected baseURL: string;

  constructor(baseURL = "") {
    this.axios = axiosInstance;
    this.baseURL = baseURL;
  }

  async getAll(params = {}) {
    try {
      const response = await this.axios.get(this.baseURL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getById(id: string) {
    try {
      const response = await this.axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

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

  protected handleError(error: any) {
    if (error.response) {
      throw error.response.data;
    }
    throw {
      status: 500,
      message: "Sunucu bağlantısı başarısız. Lütfen daha sonra tekrar deneyin.",
      error: error.message,
    };
  }
}

export default BaseService; 