import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.aikuaiplatform.com';

// Debug modu aktif (React Native ortamında localStorage simülasyonu)
const localStorage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('localStorage getItem hatası:', e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage setItem hatası:', e);
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage removeItem hatası:', e);
    }
  }
};

// React Native için debug ataması
if (global.localStorage) {
    global.localStorage.debug = 'socket.io-client:*,engine.io-client:*';
} else {
    // Eğer localStorage simülasyonu henüz global'e atanmamışsa
    global.localStorage = localStorage;
    global.localStorage.debug = 'socket.io-client:*,engine.io-client:*';
}

const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  forceNew: true,
  path: '/socket.io',
  query: {
    platform: 'mobile'
  }
});

// Token yönetimi
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Token alınamadı:', error);
    return null;
  }
};

// Socket bağlantı yönetimi
socket.on('connect', async () => {
  console.log('Socket bağlantısı başarılı');
  const token = await getToken();
  if (token) {
    socket.emit('authenticate', { token });
  }
});

socket.on('connect_error', (error) => {
  console.error('Bağlantı hatası:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Bağlantı kesildi:', reason);
});

// Tüm gelen eventleri dinle (debug için)
socket.onAny((eventName, ...args) => {
  console.log('📡 Gelen event:', eventName, args);
});

// Debug fonksiyonu
socket.debug = () => {
  return {
    id: socket.id,
    connected: socket.connected,
    disconnected: socket.disconnected,
    transport: socket.io.engine?.transport?.name,
    rooms: Array.from(socket.rooms || []),
    auth: socket.auth,
    listeners: Object.keys(socket._callbacks || {}),
    pingInterval: socket.io?.engine?.pingInterval,
    pingTimeout: socket.io?.engine?.pingTimeout
  };
};

// Sohbet odası yönetimi
socket.joinChat = (chatId) => {
  if (socket.connected) {
    socket.emit('join-chat', { chatId });
  }
};

socket.leaveChat = (chatId) => {
  if (socket.connected) {
    socket.emit('leave-chat', { chatId });
  }
};

export default socket; 