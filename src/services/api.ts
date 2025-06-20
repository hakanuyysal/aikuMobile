
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.aikuaiplatform.com/api';

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
  id?: string;
  productName: string;
  productLogo?: string;
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
  productPrice?: number;
  productWebsite: string;
  productLinkedIn: string;
  productTwitter: string;
  companyName: string;
  companyId: string;
}

interface Company {
  id: string;
  companyName: string;
}

interface CreateProductResponse {
  success: boolean;
  product: { id: string };
}

interface ProductsResponse {
  products: ProductData[];
}

interface DeleteProductResponse {
  success: boolean;
}

export const productService = {
  async createProduct(productData: ProductData): Promise<CreateProductResponse> {
    try {
      const response = await api.post<CreateProductResponse>('/product', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProduct(productId: string, updatedData: Partial<ProductData>): Promise<ProductData> {
    try {
      const response = await api.put<ProductData>(`/product/${productId}`, updatedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteProduct(productId: string): Promise<DeleteProductResponse> {
    try {
      const response = await api.delete<DeleteProductResponse>(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserProducts(): Promise<ProductsResponse> {
    try {
      const response = await api.get<ProductsResponse>('/product/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProductsByCompany(companyId: string): Promise<ProductsResponse> {
    try {
      const response = await api.get<ProductsResponse>(`/product/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAllProducts(): Promise<ProductsResponse> {
    try {
      const response = await api.get<ProductsResponse>('/product/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProductById(productId: string): Promise<ProductData> {
    try {
      const response = await api.get<ProductData>(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Placeholder for getUserCompanies (not in provided backend router, but used in AddProduct.tsx)
  async getUserCompanies(userId: string): Promise<{ companies: Company[] }> {
    try {
      const response = await api.get<{ companies: Company[] }>(`/companies/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
