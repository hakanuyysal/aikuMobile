import BaseService from '../api/BaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PaymentHistoryResponse} from '../types';

class PaymentService {
  private baseURL: string;
  private ACCOUNT_GUID: string;

  constructor() {
    this.baseURL = '/api/payments';
    this.ACCOUNT_GUID = '1B52D752-1980-4835-A0EC-30E3CB1077A5';
  }

  // Ödeme geçmişini getir
  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    try {
      const response = await BaseService.getRequest(`${this.baseURL}/history`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Ücretsiz deneme kaydı
  async recordFreePayment(freePaymentData: any) {
    try {
      return await BaseService.postRequest(
        `${this.baseURL}/record-free-payment`,
        freePaymentData
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Ödeme işlemini başlat
  async initiatePayment(paymentData: any): Promise<any> {
    try {
      const response = await BaseService.postRequest(`${this.baseURL}/initiate`, paymentData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 3D Secure işlemini tamamla
  async complete3DSecure(paymentData: any): Promise<any> {
    try {
      const response = await BaseService.postRequest(`${this.baseURL}/complete-3d`, paymentData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Abonelik detaylarını getir
  async getSubscriptionDetails() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await BaseService.getRequest(`${this.baseURL}/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Kupon kodu doğrulama
  async validateCoupon(couponCode: string, planType: string) {
    try {
      return await BaseService.postRequest(
        `${this.baseURL}/validate-coupon`,
        { couponCode, planType }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Kupon kodu uygula
  async applyCoupon(couponCode: string, planType: string) {
    try {
      return await BaseService.postRequest(
        `${this.baseURL}/apply-coupon`,
        { couponCode, planType }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Ödeme işlemi sırasında bir hata oluştu',
        data: error.response.data,
      };
    }
    return {
      success: false,
      message: error.message || 'Ödeme işlemi sırasında bir hata oluştu',
    };
  }
}

export default new PaymentService(); 