import { io, Socket } from 'socket.io-client';

const API_URL = 'https://api.aikuaiplatform.com';

class SocketService {
  private socket: Socket | null = null;

  connect = async (token: string): Promise<Socket | null> => {
    try {
      if (this.socket?.connected) {
        return this.socket;
      }

      this.socket = io(API_URL, {
        transports: ['websocket', 'polling'],
        auth: {
          token
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
        path: '/socket.io',
      });

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket could not be created'));
          return;
        }

        this.socket.on('connect', () => {
          console.log('Socket connection successful');
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket connection closed:', reason);
        });

        // Bağlantı timeout kontrolü
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error('Socket connection timeout'));
          }
        }, 20000);
      });
    } catch (error) {
      console.error('Error while establishing socket connection:', error);
      return null;
    }
  };

  joinChat = (chatSessionId: string) => {
    if (this.socket?.connected) {
      console.log('Joining chat room:', chatSessionId);
      this.socket.emit('join-chat-session', chatSessionId);
    } else {
      console.error('Socket not connected - joinChat');
    }
  };

  joinCompanyChat = (companyId: string) => {
    if (this.socket?.connected) {
      console.log('Joining company chat room:', companyId);
      this.socket.emit('join-company-chat', companyId);
    } else {
      console.error('Socket not connected - joinCompanyChat');
    }
  };

  leaveChat = (chatSessionId: string) => {
    if (this.socket?.connected) {
      console.log('Leaving chat room:', chatSessionId);
      this.socket.emit('leave-chat-session', chatSessionId);
    }
  };

  disconnect = () => {
    if (this.socket) {
      console.log('Closing socket connection');
      this.socket.disconnect();
      this.socket = null;
    }
  };

  getSocket = () => this.socket;

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