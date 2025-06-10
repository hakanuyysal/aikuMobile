import { Message, ChatSession, ChatParticipant } from '../types/chat';

export const mockParticipants: ChatParticipant[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Ayşe Demir',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isOnline: false,
    lastSeen: new Date(),
  },
  {
    id: '3',
    name: 'Mehmet Kaya',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isOnline: true,
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Merhaba, nasılsın?',
    senderId: '1',
    receiverId: 'current-user-id',
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: '2',
    content: 'İyiyim, teşekkürler! Sen nasılsın?',
    senderId: 'current-user-id',
    receiverId: '1',
    timestamp: new Date(Date.now() - 3500000),
    read: true,
  },
  {
    id: '3',
    content: 'Projeyi ne zaman bitireceğiz?',
    senderId: '2',
    receiverId: 'current-user-id',
    timestamp: new Date(Date.now() - 7200000),
    read: false,
  },
];

export const mockChatSessions: ChatSession[] = [
  {
    id: '1',
    participants: ['current-user-id', '1'],
    lastMessage: mockMessages[1],
    unreadCount: 0,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3500000),
  },
  {
    id: '2',
    participants: ['current-user-id', '2'],
    lastMessage: mockMessages[2],
    unreadCount: 1,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    participants: ['current-user-id', '3'],
    lastMessage: undefined,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 259200000),
 