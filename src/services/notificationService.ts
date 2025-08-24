import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConfig from '../config/Config';

interface NotificationSettings {
  chatNotifications: boolean;
  pushNotifications: boolean;
}

interface PushNotificationSettings {
  pushNotificationsEnabled: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PushTokenData {
  playerId: string;
  pushToken: string;
  platform: 'ios' | 'android';
  deviceId?: string;
}

class NotificationService {
  private axios = axios.create({
    baseURL: `${AppConfig.API_URL}/api`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Token interceptor ekle
    this.axios.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('Token alınırken hata:', error);
          return config;
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Tüm notification ayarlarını getir
   * GET /api/notifications/all-settings
   */
  async getAllSettings(): Promise<NotificationSettings> {
    try {
      const response = await this.axios.get<ApiResponse<NotificationSettings>>('/notifications/all-settings');
      return response.data.data;
    } catch (error) {
      console.error('Notification ayarları alınırken hata:', error);
      throw error;
    }
  }

  /**
   * Push notification ayarlarını getir
   * GET /api/notifications/push-settings
   */
  async getPushSettings(): Promise<PushNotificationSettings> {
    try {
      const response = await this.axios.get<ApiResponse<PushNotificationSettings>>('/notifications/push-settings');
      return response.data.data;
    } catch (error) {
      console.error('Push notification ayarları alınırken hata:', error);
      throw error;
    }
  }

  /**
   * Push notification ayarlarını güncelle
   * PUT /api/notifications/push-settings
   */
  async updatePushSettings(enabled: boolean): Promise<PushNotificationSettings> {
    try {
      const response = await this.axios.put<ApiResponse<PushNotificationSettings>>('/notifications/push-settings', {
        pushNotificationsEnabled: enabled
      });
      return response.data.data;
    } catch (error) {
      console.error('Push notification ayarları güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Chat notification ayarlarını güncelle (gelecekte kullanım için)
   */
  async updateChatSettings(enabled: boolean): Promise<NotificationSettings> {
    try {
      const response = await this.axios.put<ApiResponse<NotificationSettings>>('/notifications/chat-settings', {
        chatNotificationsEnabled: enabled
      });
      return response.data.data;
    } catch (error) {
      console.error('Chat notification ayarları güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Push token'ı backend'e kaydet
   * POST /api/notifications/push-tokens
   */
  async savePushToken(
    playerId: string, 
    pushToken: string, 
    platform: 'ios' | 'android', 
    deviceId?: string
  ): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('❌ Token bulunamadı, push token kaydedilemedi');
        return false;
      }

      const pushTokenData: PushTokenData = {
        playerId,
        pushToken,
        platform,
        deviceId
      };

      console.log('🔔 Push token kaydediliyor:', {
        playerId,
        platform,
        deviceId,
        pushTokenLength: pushToken.length
      });

      const response = await this.axios.post<ApiResponse<any>>('/notifications/push-tokens', pushTokenData);

      if (response.data.success) {
        console.log('✅ Push token başarıyla kaydedildi');
        return true;
      } else {
        console.error('❌ Push token kaydetme hatası:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Push token kaydetme hatası:', error);
      return false;
    }
  }

  /**
   * Push token'ı backend'den sil
   * DELETE /api/notifications/push-tokens
   */
  async deletePushToken(playerId: string): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('❌ Token bulunamadı, push token silinemedi');
        return false;
      }

      console.log('🗑️ Push token siliniyor:', playerId);

      const response = await this.axios.delete<ApiResponse<any>>('/notifications/push-tokens', {
        data: { playerId }
      });

      if (response.data.success) {
        console.log('✅ Push token başarıyla silindi');
        return true;
      } else {
        console.error('❌ Push token silme hatası:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Push token silme hatası:', error);
      return false;
    }
  }

  /**
   * Test bildirimi gönder
   * POST /api/notifications/test-push
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('❌ Token bulunamadı, test bildirimi gönderilemedi');
        return false;
      }

      console.log('🧪 Test bildirimi gönderiliyor...');

      const response = await this.axios.post<ApiResponse<any>>('/notifications/test-push', {});

      if (response.data.success) {
        console.log('✅ Test bildirimi başarıyla gönderildi');
        return true;
      } else {
        console.error('❌ Test bildirimi hatası:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Test bildirimi hatası:', error);
      return false;
    }
  }
}

export default new NotificationService();

