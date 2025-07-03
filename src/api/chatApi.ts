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

// Update or add these interfaces
interface Company {
  _id?: string;
  id?: string;
  companyName: string;
  companyLogo: string;
  companyType: string;
  acceptMessages: boolean;
}

const chatApi = {
  // Update getChatSessions function to match web implementation
  getChatSessions: async (companyId: string): Promise<ChatSession[]> => {
    try {
      const response = await api.get(`https://api.aikuaiplatform.com/api/chat/sessions/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Sohbet oturumları alınırken hata:', error);
      throw error;
    }
  },

  getMessages: async (chatSessionId: string, companyId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`https://api.aikuaiplatform.com/api/chat/messages/${chatSessionId}`, { 
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
      const response = await api.post('https://api.aikuaiplatform.com/api/chat/messages', message);
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  },

 

  // Update createChatSession to match backend implementation
  createChatSession: async (data: {
    initiatorCompanyId: string;
    targetCompanyId: string;
    title: string;
  }): Promise<ChatSession> => {
    try {
      // Input validation
      if (!data.initiatorCompanyId || !data.targetCompanyId || !data.title) {
        throw new Error('Başlatıcı şirket ID, hedef şirket ID ve başlık alanları zorunludur');
      }

      // Check if trying to chat with self
      if (data.initiatorCompanyId === data.targetCompanyId) {
        throw new Error('Bir şirket kendisiyle sohbet başlatamaz');
      }

      const response = await api.post('/chat/sessions', {
        initiatorCompanyId: data.initiatorCompanyId,
        targetCompanyId: data.targetCompanyId,
        title: data.title
      });

      // Backend success response check
      if (!response.data.success) {
        throw new Error(response.data.message || 'Sohbet oturumu oluşturulamadı');
      }

      // Return chat session data
      return response.data.data;

    } catch (error) {
      console.error('Sohbet oturumu oluşturulurken hata:', error);
      
      // Handle specific error cases from backend
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error(error.response.data.message || 'Geçersiz istek');
          case 404:
            throw new Error('Bir veya her iki şirket bulunamadı');
          case 403:
            throw new Error('Bu işlem için yetkiniz yok');
          default:
            throw new Error(error.response.data.message || 'Sohbet oturumu oluşturulurken bir hata oluştu');
        }
      }

      throw error;
    }
  },

  // Kullanıcı durumunu güncelle
  updateUserStatus: async (userId: string, isOnline: boolean): Promise<void> => {
    try {
      await api.put(`https://api.aikuaiplatform.com/api/auth/users/${userId}/status`, { isOnline });
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcı bilgilerini getir
  getUserInfo: async (userId: string) => {
    try {
      const response = await api.get(`https://api.aikuaiplatform.com/api/auth/users/${userId}`);
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
  getCompanies: async (): Promise<Company[]> => {
    try {
      const response = await api.get('https://api.aikuaiplatform.com/api/company/all');
      const companies = response.data.companies || response.data;
      
      // Filter companies based on criteria
      const allowedTypes = ["Startup", "Business", "Investor"];
      const filteredCompanies = (companies as Company[]).filter(company => {
        return (
          company.acceptMessages !== false &&
          allowedTypes.includes(company.companyType)
        );
      });
      
      return filteredCompanies;
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

  // Add new functions for chat session management
  archiveChat: async (chatSessionId: string, data: { 
    companyId: string;
    archive: boolean;
  }): Promise<any> => {
    try {
      const response = await api.patch(`https://api.aikuaiplatform.com/api/chat/archive/${chatSessionId}`, data);
      return response.data;
    } catch (error) {
      console.error('Sohbet arşivlenirken hata:', error);
      throw error;
    }
  },

  deleteChat: async (chatSessionId: string, companyId: string): Promise<any> => {
    try {
      const response = await api.delete(`https://api.aikuaiplatform.com/api/chat/sessions/${chatSessionId}`, {
        data: { companyId }
      });
      return response.data;
    } catch (error) {
      console.error('Sohbet silinirken hata:', error);
      throw error;
    }
  },
};

export default chatApi;