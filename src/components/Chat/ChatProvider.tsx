import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import chatApi from '../../api/chatApi';
import { Message } from '../../types/chat';

interface ChatContextType {
  messages: Message[];
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Socket bağlantısını başlat
  const setupSocket = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }
      setCurrentUserId(userId);

      const socket = await chatApi.initializeSocket();
      setIsConnected(true);

      // Kullanıcı durumunu güncelle
      await chatApi.updateUserStatus(userId, true);

      // Socket event listener'ları
      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('user-online', (userId: string) => {
        // Kullanıcı durumunu güncelle
        console.log(`${userId} kullanıcısı çevrimiçi`);
      });

      socket.on('user-offline', (userId: string) => {
        // Kullanıcı durumunu güncelle
        console.log(`${userId} kullanıcısı çevrimdışı`);
      });

    } catch (error) {
      console.error('Socket kurulumu hatası:', error);
      setIsConnected(false);
    }
  }, []);

  // Uygulama durumu değişikliklerini izle
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (currentUserId) {
          try {
            await chatApi.updateUserStatus(currentUserId, false);
          } catch (error) {
            console.error('Kullanıcı durumu güncellenirken hata:', error);
          }
        }
      } else if (nextAppState === 'active') {
        if (currentUserId) {
          try {
            await chatApi.updateUserStatus(currentUserId, true);
          } catch (error) {
            console.error('Kullanıcı durumu güncellenirken hata:', error);
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (currentUserId) {
        chatApi.updateUserStatus(currentUserId, false).catch(console.error);
      }
      chatApi.disconnectSocket();
    };
  }, [currentUserId]);

  // Socket bağlantısını başlat
  useEffect(() => {
    setupSocket();
  }, [setupSocket]);

  // Mesaj gönderme fonksiyonu
  const sendMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      chatApi.sendSocketMessage(message);
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isConnected }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 