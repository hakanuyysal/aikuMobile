import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.aikuaiplatform.com/';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ProductData {
  productName: string;
  productLogo?: string; // Opsiyonel, henüz yükleme yok
  productCategory: string;
  productDescription: string;
  detailedDescription: string;
  tags: string[];
  problems: string[];
  solutions: string[];
  improvements: string[];
  keyFeatures: string[];
  pricingModel: string;
  releaseDate: string;
  productPrice?: number; // Opsiyonel
  productWebsite: string;
  productLinkedIn: string;
  productTwitter: string;
  companyName: string;
  companyId: string;
}

interface CreateProductResponse {
  success: boolean;
  product: { id: string };
}

export const productService = {
  async createProduct(productData: ProductData) {
    try {
      const response = await api.post<CreateProductResponse>('/product', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProduct(productId: string, updatedData: Partial<ProductData>) {
    try {
      const response = await api.put<ProductData>(`/product/${productId}`, updatedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteProduct(productId: string) {
    try {
      const response = await api.delete(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 