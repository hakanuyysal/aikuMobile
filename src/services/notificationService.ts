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
}

export default new NotificationService();

