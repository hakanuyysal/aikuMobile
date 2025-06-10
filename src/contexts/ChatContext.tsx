import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3004'
  : Config.API_URL || 'https://api.aikuaiplatform.com';

interface ChatSession {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  chatSessionId: string;
  content: string;
  senderId: string;
  timestamp: string;
}

interface ChatContextType {
  chatSessions: ChatSession[];
  messages: { [key: string]: Message[] };
  sendMessage: (chatSessionId: string, content: string) => Promise<void>;
  joinChat: (chatSessionId: string) => void;
  leaveChat: (chatSessionId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      const chatSessionId = message.chatSessionId;
      
      setMessages(prev => ({
        ...prev,
        [chatSessionId]: [...(prev[chatSessionId] || []), message]
      }));

      // Sohbet oturumunu güncelle
      setChatSessions(prev => 
        prev.map(session => 
          session.id === chatSessionId 
            ? {
                ...session,
                lastMessage: {
                  content: message.content,
                  timestamp: message.timestamp
                },
                unreadCount: session.unreadCount + 1
              }
            : session
        )
      );
    };

    const handleChatNotification = (notification: any) => {
      console.log('Chat bildirimi:', notification);
      // Bildirim işlemleri burada yapılabilir
    };

    const handleChatSessionUpdate = (session: ChatSession) => {
      setChatSessions(prev => 
        prev.map(s => s.id === session.id ? session : s)
      );
    };

    // Socket event dinleyicileri
    socketService.onNewMessage(handleNewMessage);
    socketService.onChatNotification(handleChatNotification);
    socketService.onChatSessionUpdate(handleChatSessionUpdate);

    return () => {
      socketService.offNewMessage(handleNewMessage);
      socketService.offChatNotification(handleChatNotification);
      socketService.offChatSessionUpdate(handleChatSessionUpdate);
    };
  }, []);

  const sendMessage = async (chatSessionId: string, content: string) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatSessionId,
          content
        })
      });

      if (!response.ok) {
        throw new Error('Mesaj gönderilemedi');
      }

      const message = await response.json();
      
      // Mesajı local state'e ekle
      setMessages(prev => ({
        ...prev,
        [chatSessionId]: [...(prev[chatSessionId] || []), message]
      }));

      // Sohbet oturumunu güncelle
      setChatSessions(prev => 
        prev.map(session => 
          session.id === chatSessionId 
            ? {
                ...session,
                lastMessage: {
                  content: message.content,
                  timestamp: message.timestamp
                }
              }
            : session
        )
      );
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  };

  const joinChat = (chatSessionId: string) => {
    socketService.joinChat(chatSessionId);
  };

  const leaveChat = (chatSessionId: string) => {
    socketService.leaveChat(chatSessionId);
  };

  return (
    <ChatContext.Provider value={{ 
      chatSessions, 
      messages,
      sendMessage,
      joinChat,
      leaveChat
    }}>
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