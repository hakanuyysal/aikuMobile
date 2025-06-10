import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emülatörü için: http://10.0.2.2:3004
// Gerçek cihaz veya iOS simülatörü için: Bilgisayarınızın yerel IP adresi (örn: http://192.168.1.XX:3004)
const API_URL = 'http://10.0.2.2:3004';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public async connect() {
    if (!this.socket) {
      const token = await AsyncStorage.getItem('auth_token');

      this.socket = io(API_URL, {
        transports: ['websocket', 'polling'],
        cors: {
          origin: "*",
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          credentials: true,
          allowedHeaders: ["Content-Type", "Authorization"]
        },
        allowEIO3: true,
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        auth: {
          token
        }
      });

      this.setupEventListeners();
    }
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket.io bağlantısı başarılı');
      console.log('Socket ID:', this.socket?.id);
    });

    this.socket.on('connect_error', async (error) => {
      console.error('❌ Socket.io bağlantı hatası:', error.message);
      
      if (error.message === 'Authentication error') {
        const token = await AsyncStorage.getItem('auth_token');
        if (token && this.socket) {
          console.log('🔄 Token güncelleniyor ve yeniden bağlanılıyor...');
          this.socket.auth = { token };
          this.socket.connect();
        }
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket.io bağlantısı kesildi');
      console.log('Sebep:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket.io hatası:', error);
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public async joinChat(chatSessionId: string) {
    if (chatSessionId && this.socket) {
      console.log(`🚪 Sohbet odasına katılınıyor: chat-${chatSessionId}`);
      this.socket.emit('join-chat-session', chatSessionId);
    }
  }

  public async leaveChat(chatSessionId: string) {
    if (chatSessionId && this.socket) {
      console.log(`🚪 Sohbet odasından çıkılıyor: chat-${chatSessionId}`);
      this.socket.emit('leave-chat-session', chatSessionId);
    }
  }

  public async joinCompanyChat(companyId: string) {
    if (companyId && this.socket) {
      console.log(`🏢 Şirket odasına katılınıyor: company-${companyId}`);
      this.socket.emit('join-company-chat', companyId);
    }
  }

  public async leaveCompanyChat(companyId: string) {
    if (companyId && this.socket) {
      console.log(`🏢 Şirket odasından çıkılıyor: company-${companyId}`);
      this.socket.emit('leave-company-chat', companyId);
    }
  }
}

export default SocketService; 