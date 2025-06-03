import { Socket } from 'socket.io-client';

interface CustomSocket extends Socket {
  joinChat?: (chatSessionId: string) => void;
  leaveChat?: (chatSessionId: string) => void;
  joinCompanyChat?: (companyId: string) => void;
  leaveCompanyChat?: (companyId: string) => void;
  debug?: () => any;
}

declare const socket: CustomSocket;

export default socket; 