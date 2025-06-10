import axios, { AxiosInstance } from 'axios';
import { Message, ChatSession } from '../types/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import socketService from '../services/socketService';

// Android emülatörü için: http://10.0.2.2:3004/api
// Gerçek cihaz veya iOS simülatörü için: Bilgisayarınızın yerel IP adresi (örn: http://192.168.1.XX:3004/api)
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3004/api'  // Android emülatör için localhost
  : Config.API_URL || 'https://api.aikuaiplatform.com/api';

const SOCKET_URL = __DEV__
  ? 'http://10.0.2.2:3004'  // Android emülatör için localhost
  : Config.SOCKET_URL || 'https://api.aikuaiplatform.com';

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
      const token = await AsyncStorage.getItem('token');
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
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user_id');
          socketService.disconnect();
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
      await api.put(`/auth/users/${userId}/status`, { isOnline });
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcı bilgilerini getir
  getUserInfo: async (userId: string) => {
    try {
      const response = await api.get(`/auth/users/${userId}`);
      if (!response.data || !response.data.user) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      return response.data.user;
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      // Varsayılan kullanıcı bilgilerini döndür
      return {
        name: 'Bilinmeyen Kullanıcı',
        avatar: '',
        isOnline: false
      };
    }
  },

  // getCompanies endpoint'i
  getCompanies: async (): Promise<any[]> => {
    try {
      const response = await api.get('/auth/companies/current');
      return response.data.companies || [];
    } catch (error) {
      console.error('Şirketler alınırken hata:', error);
      return [];
    }
  },

  // Socket bağlantısını başlat
  initializeSocket: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const socket = await socketService.connect(token);
      
      if (!socket) {
        throw new Error('Socket bağlantısı kurulamadı');
      }

      return socket;
    } catch (error) {
      console.error('Socket başlatılırken hata:', error);
      throw error;
    }
  },

  // Socket bağlantısını kapat
  disconnectSocket: () => {
    socketService.disconnect();
  },

  // Socket mesajı gönder
  sendSocketMessage: (message: {
    chatSessionId: string;
    content: string;
    senderId: string;
    receiverId: string;
    attachment?: string;
  }) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('message', message);
    }
  },

  // Socket mesajlarını dinle
  onMessage: (callback: (message: Message) => void) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('message', callback);
    }
  },

  // Socket mesaj dinleyicisini kaldır
  offMessage: (callback: (message: Message) => void) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.off('message', callback);
    }
  },
};

export default chatApi; 