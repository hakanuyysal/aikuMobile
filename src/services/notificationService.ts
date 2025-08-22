import { BaseService } from './BaseService';

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

class NotificationService extends BaseService {
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

