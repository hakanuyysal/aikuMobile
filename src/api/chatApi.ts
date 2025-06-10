import axios, { AxiosInstance } from 'axios';
import { Message, ChatSession } from '../types/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emülatörü için: http://10.0.2.2:3004/api
// Gerçek cihaz veya iOS simülatörü için: Bilgisayarınızın yerel IP adresi (örn: http://192.168.1.XX:3004/api)
const API_URL = 'https://api.aikuaiplatform.com/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token yönetimi için interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Token alınırken hata:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hata yönetimi için interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // 401 hatası durumunda token'ı temizle ve kullanıcıyı çıkış yap
      if (error.response.status === 401) {
        try {
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_id');
          // Burada bir event emitter veya global state yönetimi ile login ekranına yönlendirme yapılabilir
        } catch (e) {
          console.error('Token temizlenirken hata:', e);
        }
      }
      
      // Hata mesajını daha detaylı hale getir
      const errorMessage = error.response.data?.message || error.message;
      console.error('API Hatası:', {
        status: error.response.status,
        message: errorMessage,
        endpoint: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

const chatApi = {
  getChatSessions: async (companyId: string): Promise<ChatSession[]> => {
    try {
      const response = await api.get(`/chat/sessions/${companyId}`);
      return response.data.sessions || [];
    } catch (error) {
      console.error('Sohbet oturumları alınırken hata:', error);
      throw error;
    }
  },

  getMessages: async (chatSessionId: string, companyId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`/chat/messages/${chatSessionId}`, { 
        params: { companyId } 
      });
      return response.data;
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      throw error;
    }
  },

  sendMessage: async (message: {
    chatSessionId: string;
    content: string;
    senderId: string;
    receiverId: string;
    attachment?: string;
  }): Promise<Message> => {
    try {
      const response = await api.post('/chat/messages', message);
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  },

  markAsRead: async (
    chatSessionId: string,
    userId: string,
    messageId?: string
  ): Promise<void> => {
    try {
      const payload: { chatSessionId: string; userId: string; messageId?: string } = {
        chatSessionId,
        userId,
      };
      if (messageId) {
        payload.messageId = messageId;
      }
      await api.put('/chat/messages/read', payload);
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
      throw error;
    }
  },

  createChatSession: async (data: {
    initiatorCompanyId: string;
    targetCompanyId: string;
    title: string;
  }): Promise<ChatSession> => {
    try {
      const response = await api.post('/chat/sessions', data);
      return response.data;
    } catch (error) {
      console.error('Sohbet oturumu oluşturulurken hata:', error);
      throw error;
    }
  },

  // Kullanıcı durumunu güncelle
  updateUserStatus: async (userId: string, isOnline: boolean): Promise<void> => {
    try {
      await api.put(`/users/${userId}/status`, { isOnline });
    } catch (error) {
      console.error('Kullanıcı durumu güncellenirken hata:', error);
      throw error;
    }
  },

  // Kullanıcı bilgilerini getir
  getUserInfo: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      throw error;
    }
  },

  // getCompanies endpoint'i eksik, backend'e eklenmeli veya doğrulanmalı
  getCompanies: async (): Promise<any[]> => {
    try {
      const response = await api.get('/companies/current');
      return response.data.companies;
    } catch (error) {
      console.error('Şirketler alınırken hata:', error);
      throw error;
    }
  },
};

export default chatApi; 