import BaseService from '../api/BaseService';
import {MMKVInstance} from '../storage/mmkv';
import {PaymentHistoryResponse} from '../types';
import {Platform} from 'react-native';
import axios from 'axios';
import api from './axiosInstance';

interface PaymentHistory {
  _id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed';
  description: string;
}

interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentHistory[];
}

class PaymentService {
  private baseURL: string;
  private ACCOUNT_GUID: string;
  private navigation: any;

  constructor() {
    this.baseURL = '/api/payments';
    // Hesap GUID'i - Param POS tarafından sağlanan sabit değer
    this.ACCOUNT_GUID = '1B52D752-1980-4835-A0EC-30E3CB1077A5';
    this.navigation = null;
  }

  setNavigation(navigation: any) {
    this.navigation = navigation;
  }

  // Ödeme işlemini başlat
  async processPayment(paymentData: any): Promise<any> {
    try {
      // Platform bazlı callback URL'leri
      const successUrl = Platform.select({
        ios: 'aikumobile://payment/callback',
        android: 'aikumobile://payment/callback',
      });

      const errorUrl = Platform.select({
        ios: 'aikumobile://payment/callback',
        android: 'aikumobile://payment/callback',
      });

      // Web versiyonuna uygun olarak gerekli alanları ekle
      const paymentDataWithUrls = {
        ...paymentData,
        successUrl,
        errorUrl,
        accountGuid: this.ACCOUNT_GUID,
        cardNumber: paymentData.cardInfo.cardNumber,
        cardHolderName: paymentData.cardInfo.cardHolderName,
        expireMonth: paymentData.cardInfo.expireMonth,
        expireYear: paymentData.cardInfo.expireYear,
        cvc: paymentData.cardInfo.cvv,
        installment: 1,
        amount: paymentData.amount,
        planType: paymentData.planType,
        billingCycle: paymentData.billingCycle,
        billingInfo: paymentData.billingInfo,
        currency: 'USD',
        couponCode: paymentData.couponCode
      };

      const response = await BaseService.postRequest(
        `${this.baseURL}/process-payment`,
        paymentDataWithUrls,
      );

      // 3D Secure için veri saklama
      if (response.success && response.data.isRedirect) {
        const storeData = (key: string, value: string) => {
          try {
            MMKVInstance.setString(key, value);
          } catch (err) {
            console.error(`Error storing ${key}:`, err);
          }
        };

        storeData('param_islem_id', response.data.TURKPOS_RETVAL_Islem_ID);
        storeData('param_siparis_id', response.data.TURKPOS_RETVAL_Siparis_ID);
        storeData('param_ucd_md', response.data.UCD_MD);

        const islemGuid = response.data.TURKPOS_RETVAL_Islem_GUID;
        if (islemGuid) {
          storeData('param_islem_guid', islemGuid);
        }

        // Debug verilerini sakla
        try {
          const paymentDebugData = {
            timestamp: new Date().toISOString(),
            response: response,
            islemId: response.data.TURKPOS_RETVAL_Islem_ID,
            siparisId: response.data.TURKPOS_RETVAL_Siparis_ID,
            islemGuid: response.data.TURKPOS_RETVAL_Islem_GUID,
          };
          MMKVInstance.setString(
            'payment_debug_data',
            JSON.stringify(paymentDebugData),
          );
        } catch (err) {
          console.error('Error storing debug data:', err);
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // 3D Secure formunu göster
  async showSecureForm(paymentData: any): Promise<any> {
    try {
      if (!this.navigation) {
        throw new Error('Navigation is not initialized. Call setNavigation first.');
      }

      if (paymentData.islemGuid) {
        MMKVInstance.setString('param_islem_guid', paymentData.islemGuid);
      }

      if (paymentData.siparisId) {
        MMKVInstance.setString('param_siparis_id', paymentData.siparisId);
      }

      if (paymentData.amount) {
        MMKVInstance.setString('payment_amount', paymentData.amount.toString());
      }

      MMKVInstance.setBoolean('payment_initiated', true);

      // React Navigation ile 3D Secure sayfasına yönlendir
      this.navigation.navigate('ThreeDSecure', {
        htmlContent: paymentData.html,
        returnUrl: paymentData.redirectUrl
      });

      return {paymentStatus: 'redirected'};
    } catch (error) {
      throw error;
    }
  }

  // Ödeme işlemini tamamla
  async completePayment(callbackData: any): Promise<any> {
    try {
      const isPaymentCompleted = MMKVInstance.getBoolean('payment_completed');
      if (isPaymentCompleted) {
        const paymentResult = MMKVInstance.getString('payment_result');
        return {
          success: true,
          message: 'Payment already completed',
          data: paymentResult ? JSON.parse(paymentResult) : {},
        };
      }

      if (callbackData.mdStatus && callbackData.mdStatus !== '1') {
        return {
          success: false,
          message:
            'Payment 3D verification failed: ' +
            (callbackData.bankResult || 'Unknown error'),
          data: {
            mdStatus: callbackData.mdStatus,
            bankResult: callbackData.bankResult,
          },
        };
      }

      if (!callbackData.islemGuid) {
        throw new Error('Transaction GUID not found. Payment cannot be completed.');
      }

      if (callbackData.islemGuid.length !== 36) {
        throw new Error(
          `Invalid transaction GUID format. Transaction GUID must be 36 characters long. Current length: ${callbackData.islemGuid.length}`,
        );
      }

      if (
        !callbackData.islemGuid.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        )
      ) {
        throw new Error(
          'Transaction GUID format is invalid. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        );
      }

      const completePaymentData = {
        ...callbackData,
        accountGuid: this.ACCOUNT_GUID,
      };

      const response = await BaseService.postRequest(
        `${this.baseURL}/complete-payment`,
        completePaymentData,
      );

      if (response.success) {
        MMKVInstance.setBoolean('payment_completed', true);
        MMKVInstance.setString('payment_result', JSON.stringify(response));
      } else {
        MMKVInstance.setString('payment_error', JSON.stringify(response));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Ödeme geçmişini getir
  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    const response = await api.get('/subscriptions/payment-history');
    return response.data;
  }

  // Ücretsiz deneme kaydı
  async recordFreePayment(freePaymentData: any) {
    try {
      const response = await BaseService.postRequest(
        `${this.baseURL}/record-free-payment`,
        freePaymentData,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Abonelik detaylarını getir
  async getSubscriptionDetails() {
    try {
      const response = await BaseService.getRequest(`${this.baseURL}/subscription`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Kupon kodu doğrulama
  async validateCoupon(couponCode: string, planType: string) {
    try {
      const response = await BaseService.postRequest(
        `${this.baseURL}/validate-coupon`,
        {couponCode, planType},
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Kupon kodu uygula
  async applyCoupon(couponCode: string, planType: string) {
    try {
      const response = await BaseService.postRequest(
        `${this.baseURL}/apply-coupon`,
        {couponCode, planType},
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Doğrudan API'ye istek atan fonksiyon
export async function getPaymentHistoryDirect(): Promise<PaymentHistoryResponse> {
  try {
    // AsyncStorage yerine MMKV veya başka bir storage kullanıyorsan buradan token al
    const token = MMKVInstance.getString('token');
    const response = await axios.get('https://api.aikuaiplatform.com/api/payments/history', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export default new PaymentService(); 