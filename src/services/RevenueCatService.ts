import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {productMapping} from '../config/revenueCat';
import {Platform} from 'react-native';

// AppConfig'i doğrudan import et
let AppConfig: any;
try {
  AppConfig = require('../config/Config').default;
  console.log('🔧 AppConfig imported successfully');
} catch (error) {
  console.error('❌ AppConfig import error:', error);
  // Fallback config
  AppConfig = {
    REVENUECAT_IOS_API_KEY: 'appl_ItZJWkZzqVLPrmfIjvxQtPuUFom',
    REVENUECAT_ANDROID_API_KEY: 'goog_ItZJWkZzqVLPrmfIjvxQtPuUFom',
  };
}

// New interfaces for subscription management
export interface Subscription {
  _id: string;
  plan: string;
  period: string;
  status: string;
  startDate: string;
  amount: number;
  autoRenewal: boolean;
  paymentMethod: string;
  lastPaymentDate: string;
  nextPaymentDate: string;
  transactionId: string;
  revenueCatProductId: string;
  isActive: boolean;
}

export interface SubscriptionsResponse {
  success: boolean;
  subscriptions: Subscription[];
  subscriptionCount: number;
  activeSubscriptionCount: number;
  message?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
  cancelledSubscription: Subscription;
  remainingActiveCount: number;
}

class RevenueCatService {
  private baseURL: string;

  constructor() {
    this.baseURL = Config.API_URL || 'https://api.aikuaiplatform.com/api';
  }

  // RevenueCat'i başlat
  async initializeRevenueCat() {
    try {
      // Dynamic import kullanarak modülü yükle
      const Purchases = require('react-native-purchases').default;

      // Debug: AppConfig'i kontrol et
      console.log('🔧 AppConfig object:', AppConfig);
      console.log(
        '🔧 AppConfig.REVENUECAT_IOS_API_KEY:',
        AppConfig.REVENUECAT_IOS_API_KEY,
      );
      console.log(
        '🔧 AppConfig.REVENUECAT_ANDROID_API_KEY:',
        AppConfig.REVENUECAT_ANDROID_API_KEY,
      );

      // Platform'a göre API key al
      let apiKey;
      if (Platform.OS === 'ios') {
        apiKey = AppConfig.REVENUECAT_IOS_API_KEY;
        console.log('📱 iOS Platform detected');
      } else {
        apiKey = AppConfig.REVENUECAT_ANDROID_API_KEY;
        console.log('🤖 Android Platform detected');
      }

      console.log(
        '🔑 RevenueCat API Key:',
        apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
      );
      console.log('🔑 Full API Key length:', apiKey ? apiKey.length : 0);
      console.log(
        '🔑 API Key starts with:',
        apiKey ? apiKey.substring(0, 5) : 'N/A',
      );
      console.log('Platform:', Platform.OS);

      // API key kontrolü - daha sıkı kontrol
      if (!apiKey) {
        console.error('❌ API key is undefined or null');
        return false;
      }

      if (apiKey.includes('YOUR_')) {
        console.error('❌ API key contains placeholder text');
        return false;
      }

      if (apiKey.includes('test_key')) {
        console.error('❌ API key contains test_key');
        return false;
      }

      if (apiKey.length < 20) {
        console.error('❌ API key is too short:', apiKey.length);
        return false;
      }

      // RevenueCat'i yapılandır
      await Purchases.configure({apiKey});
      console.log('✅ RevenueCat başarıyla başlatıldı!');
      console.log('✅ API Key:', apiKey.substring(0, 10) + '...');
      return true;
    } catch (error) {
      console.error('❌ RevenueCat başlatma hatası:', error);
      return false;
    }
  }

  // Kullanıcı ID'sini set et
  async setUserID(userId: string) {
    try {
      // API key kontrolü
      const apiKey = Platform.OS === 'ios' 
        ? AppConfig.REVENUECAT_IOS_API_KEY
        : AppConfig.REVENUECAT_ANDROID_API_KEY;

      if (!apiKey || apiKey.includes('test_key') || apiKey.includes('YOUR_')) {
        console.log('Test modunda RevenueCat User ID set edildi (simüle):', userId);
        return true;
      }

      // RevenueCat'in başlatılıp başlatılmadığını kontrol et
      try {
        const Purchases = require('react-native-purchases').default;
        
        // RevenueCat'in hazır olup olmadığını kontrol et
        if (typeof Purchases.setUserID !== 'function') {
          console.log('⚠️ RevenueCat henüz başlatılmamış, User ID set edilemiyor');
          return false;
        }
        
        await Purchases.setUserID(userId);
        console.log('✅ RevenueCat User ID set:', userId);
        return true;
      } catch (purchaseError) {
        console.log('⚠️ RevenueCat setUserID hatası, test modunda devam ediliyor:', purchaseError);
        return true; // Hata olsa bile devam et
      }
    } catch (error) {
      console.error('❌ RevenueCat setUserID genel hatası:', error);
      return false;
    }
  }

  // Abonelik planlarını getir
  async getPlans() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${this.baseURL}/revenuecat/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Planlar getirilemedi:', error);
      throw error;
    }
  }

  // RevenueCat paketlerini getir
  async getRevenueCatPackages() {
    try {
      console.log('📦 RevenueCat paketleri getiriliyor...');
      
      const Purchases = require('react-native-purchases').default;
      const offerings = await Purchases.getOfferings();
      
      console.log('🔍 RevenueCat offerings:', offerings);
      
      if (offerings?.current) {
        console.log('✅ RevenueCat paketleri başarıyla getirildi:', offerings.current.availablePackages.length);
        return offerings.current.availablePackages;
      }
      
      console.error('❌ RevenueCat offerings bulunamadı!');
      console.error('❌ Offerings:', offerings);
      console.error('❌ Current offering:', offerings?.current);
      
      // Offerings yoksa boş array döndür
      return [];
    } catch (error) {
      console.error('❌ RevenueCat getOfferings hatası:', error);
      return [];
    }
  }

  // Paket satın al
  async purchasePackage(packageToPurchase: any) {
    try {
      console.log('🛒 RevenueCat satın alma başlatılıyor:', packageToPurchase.identifier);
      
      const Purchases = require('react-native-purchases').default;
      
      // Gerçek RevenueCat satın alma yap
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      console.log('✅ RevenueCat satın alma başarılı:', customerInfo);
      
      // Backend'e satın alma bilgisini gönder
      await this.syncRevenueCatId(customerInfo.originalAppUserId);
      return { customerInfo, success: true };
    } catch (error: any) {
      console.error('❌ RevenueCat satın alma hatası:', error);
      
      // Kullanıcı iptal ettiyse
      if (error.userCancelled) {
        throw { userCancelled: true, message: 'Satın alma iptal edildi' };
      }
      
      // Diğer hataları fırlat
      throw error;
    }
  }

  // RevenueCat ID'yi backend ile senkronize et
  async syncRevenueCatId(revenueCatId: string) {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Syncing RevenueCat ID to backend:', revenueCatId);

      // Backend'de endpoint yoksa mock başarı döndür
      if (!token) {
        console.log('Token yok, sync atlanıyor');
        return {success: false, message: 'No token'};
      }

      // JWT token'dan user ID'yi çıkar
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('Geçersiz token formatı, sync atlanıyor');
        return {success: false, message: 'Invalid token format'};
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      if (!userId) {
        console.log("Token'da user ID bulunamadı, sync atlanıyor");
        return {success: false, message: 'User ID not found in token'};
      }

      console.log('User ID from token:', userId);

      const response = await axios.post(
        `${this.baseURL}/revenuecat/sync-user`,
        {
          userId: userId,
          revenueCatId: revenueCatId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('✅ RevenueCat ID sync successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        '❌ RevenueCat ID sync hatası:',
        error.response?.status,
        error.response?.data,
      );

      // 400 hatası backend'de endpoint yok demek, devam et
      if (error.response?.status === 400) {
        console.log('Backend RevenueCat endpoint yok, sync atlanıyor');
        return {success: false, message: 'Endpoint not found'};
      }

      // Hata durumunda da devam et, sync başarısız olsa bile
      return {success: false, error: error.message};
    }
  }

  // Abonelik durumunu kontrol et
  async getSubscriptionStatus(userId: string) {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${this.baseURL}/revenuecat/subscription/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Abonelik durumu kontrol edilemedi:', error);
      throw error;
    }
  }

  // Ödeme yöntemi kontrolü
  async getPaymentMethod() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${this.baseURL}/revenuecat/payment-method`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Ödeme yöntemi kontrol edilemedi:', error);
      throw error;
    }
  }

  // Aboneliği restore et
  async restorePurchases() {
    try {
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.restorePurchases();

      // Backend'e restore bilgisini gönder
      await this.syncRevenueCatId(customerInfo.originalAppUserId);
      return {customerInfo, success: true};
    } catch (error) {
      console.error('Abonelik restore hatası:', error);
      throw error;
    }
  }

  // Plan detaylarını getir
  getPlanDetails(planKey: string) {
    return productMapping[planKey as keyof typeof productMapping];
  }

  // Plan key'ini oluştur
  createPlanKey(plan: string, period: 'monthly' | 'yearly') {
    return `${plan}_${period}`;
  }

  // RevenueCat paketini plan key'ine göre bul
  findPackageByPlanKey(packages: any[], planKey: string) {
    console.log('🔍 Paket aranıyor:', planKey);
    console.log('📦 Mevcut paketler:', packages.map(p => p.identifier));
    
    const planDetails = this.getPlanDetails(planKey);
    console.log('📋 Plan detayları:', planDetails);
    
    if (!planDetails) {
      console.error('❌ Plan detayları bulunamadı:', planKey);
      return null;
    }

    const foundPackage = packages.find(pkg => pkg.identifier === planDetails.revenueCatId);
    console.log('🎯 Aranan RevenueCat ID:', planDetails.revenueCatId);
    console.log('✅ Bulunan paket:', foundPackage ? foundPackage.identifier : 'BULUNAMADI');
    
    return foundPackage;
  }

  // RevenueCat durumunu kontrol et
  async checkRevenueCatStatus() {
    try {
      console.log('🔍 RevenueCat durumu kontrol ediliyor...');
      
      const Purchases = require('react-native-purchases').default;
      
      // Customer info al
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('👤 Customer Info:', customerInfo);
      
      // Offerings al
      const offerings = await Purchases.getOfferings();
      console.log('📦 Offerings:', offerings);
      
      if (offerings?.current) {
        console.log('✅ Current offering:', offerings.current.identifier);
        console.log('✅ Available packages:', offerings.current.availablePackages.length);
        offerings.current.availablePackages.forEach((pkg: any, index: number) => {
          console.log(`📦 Package ${index + 1}:`, pkg.identifier, pkg.product?.price);
        });
      } else {
        console.error('❌ Current offering bulunamadı!');
        console.error('❌ All offerings:', offerings);
      }
      
      return { customerInfo, offerings };
    } catch (error) {
      console.error('❌ RevenueCat status check hatası:', error);
      return null;
    }
  }

  // Kullanıcının tüm aboneliklerini getir
  async getAllSubscriptions(): Promise<SubscriptionsResponse> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${this.baseURL}/revenuecat/subscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Belirli bir aboneliği iptal et
  async cancelSubscription(subscriptionId: string): Promise<CancelSubscriptionResponse> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(`${this.baseURL}/revenuecat/subscriptions/${subscriptionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred',
        data: error.response?.data,
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

export default new RevenueCatService();
