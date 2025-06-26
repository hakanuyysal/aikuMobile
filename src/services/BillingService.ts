import BaseService from '../api/BaseService';
import {BillingInfo, BillingResponse} from '../types';

class BillingService {
  private baseURL: string;

  constructor() {
    this.baseURL = '/api/billing-info';
  }

  // Tüm fatura bilgilerini getir
  async getAllBillingInfo(): Promise<BillingResponse> {
    try {
      const response = await BaseService.getRequest(this.baseURL);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Varsayılan fatura bilgisini getir
  async getDefaultBillingInfo(): Promise<BillingResponse> {
    try {
      const response = await BaseService.getRequest(this.baseURL);
      const defaultBilling = Array.isArray(response) ? response.find(info => info.isDefault) : null;
      return {
        success: true,
        data: defaultBilling || null,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Belirli bir fatura bilgisini getir
  async getBillingInfoById(id: string): Promise<BillingResponse> {
    try {
      const response = await BaseService.getRequest(`${this.baseURL}/${id}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Yeni fatura bilgisi oluştur
  async createBillingInfo(billingData: Partial<BillingInfo>): Promise<BillingResponse> {
    try {
      const response = await BaseService.postRequest(this.baseURL, billingData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Fatura bilgisini güncelle
  async updateBillingInfo(id: string, billingData: Partial<BillingInfo>): Promise<BillingResponse> {
    try {
      const response = await BaseService.putRequest(`${this.baseURL}/${id}`, billingData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Fatura bilgisini varsayılan yap
  async setDefaultBillingInfo(id: string): Promise<BillingResponse> {
    try {
      const response = await BaseService.putRequest(`${this.baseURL}/${id}/set-default`, {});
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Fatura bilgisini sil
  async deleteBillingInfo(id: string): Promise<BillingResponse> {
    try {
      const response = await BaseService.deleteRequest(`${this.baseURL}/${id}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): BillingResponse {
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Bir hata oluştu',
        data: error.response.data,
      };
    }
    return {
      success: false,
      message: error.message || 'Bir hata oluştu',
    };
  }
}

export default new BillingService(); 