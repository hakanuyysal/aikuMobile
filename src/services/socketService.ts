import { io, Socket } from 'socket.io-client';
import Config from 'react-native-config';

class SocketService {
  private socket: Socket | null = null;

  async connect(token: string): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const SOCKET_URL = __DEV__
      ? 'http://10.0.2.2:3004'  // Android emülatör için localhost
      : Config.SOCKET_URL || 'https://api.aikuaiplatform.com';

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket oluşturulamadı'));
        return;
      }

      this.socket.on('connect', () => {
        console.log('Socket bağlantısı başarılı');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket bağlantı hatası:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinChat(chatSessionId: string) {
    if (this.socket && chatSessionId) {
      this.socket.emit('join-chat-session', chatSessionId);
    }
  }

  leaveChat(chatSessionId: string) {
    if (this.socket && chatSessionId) {
      this.socket.emit('leave-chat-session', chatSessionId);
    }
  }

  joinCompanyChat(companyId: string) {
    if (this.socket && companyId) {
      this.socket.emit('join-company-chat', companyId);
    }
  }

  leaveCompanyChat(companyId: string) {
    if (this.socket && companyId) {
      this.socket.emit('leave-company-chat', companyId);
    }
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new-message', callback);
  }

  onChatNotification(callback: (notification: any) => void) {
    this.socket?.on('chat-notification', callback);
  }

  onChatSessionUpdate(callback: (session: any) => void) {
    this.socket?.on('chat-session-update', callback);
  }

  offNewMessage(callback: (message: any) => void) {
    this.socket?.off('new-message', callback);
  }

  offChatNotification(callback: (notification: any) => void) {
    this.socket?.off('chat-notification', callback);
  }

  offChatSessionUpdate(callback: (session: any) => void) {
    this.socket?.off('chat-session-update', callback);
  }
}

export default new SocketService(); 