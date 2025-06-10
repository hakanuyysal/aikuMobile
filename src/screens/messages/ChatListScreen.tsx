<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> c88be93c794dbe2100913e9be531e3dc39bd2955
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatListScreenProps } from '../../types';
import { Colors } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';
<<<<<<< HEAD
import chatApi from '../../api/chatApi';
import socketService from '../../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { ChatProvider } from '../../components/Chat/ChatProvider';
=======
import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
>>>>>>> c88be93c794dbe2100913e9be531e3dc39bd2955

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unread: number;
  isOnline?: boolean;
  participants: string[];
}

<<<<<<< HEAD
=======
const API_URL = __DEV__ ? 'http://localhost:3004' : 'https://api.aikuaiplatform.com';

>>>>>>> c88be93c794dbe2100913e9be531e3dc39bd2955
const ChatListScreen = ({ navigation }: ChatListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
<<<<<<< HEAD
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const setupUser = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        setCurrentUserId(userId);
        try {
          const token = await AsyncStorage.getItem('auth_token');
          const response = await fetch(`https://api.aikuaiplatform.com/auth/users/${userId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isOnline: true })
          });

          if (!response.ok) {
            console.error('Kullanıcı durumu güncellenirken fetch hatası:', response.status, response.statusText);
          }
        } catch (fetchError) {
          console.error('Kullanıcı durumu güncellenirken manuel fetch hatası:', fetchError);
        }
      } else {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
        navigation.getParent()?.navigate('Auth');
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alınırken hata:', error);
      Alert.alert('Hata', 'Kullanıcı bilgisi alınamadı');
      navigation.getParent()?.navigate('Auth');
    }
  }, [navigation]);

  const loadChatSessions = useCallback(async () => {
    try {
      setRefreshing(true);
      const sessions = await chatApi.getChatSessions(currentUserId);
      const formattedChats = await Promise.all(
        sessions.map(async (session) => {
          const otherParticipant = session.participants.find(p => p !== currentUserId);
          let userInfo: any = { name: 'Bilinmeyen', avatar: '', isOnline: false };
          if (otherParticipant) {
            userInfo = await chatApi.getUserInfo(otherParticipant);
          }
          return {
            id: session.id,
            name: userInfo.name,
            lastMessage: session.lastMessage?.content || '',
            time: session.lastMessage ? new Date(session.lastMessage.timestamp).toLocaleTimeString() : '',
            avatar: userInfo.avatar || '',
            unread: session.unreadCount,
            isOnline: userInfo.isOnline,
            participants: session.participants,
          };
        })
      );
      setChats(formattedChats);
    } catch (error) {
      console.error('Sohbet oturumları yüklenirken hata:', error);
      Alert.alert('Hata', 'Sohbet listesi yüklenemedi');
    } finally {
      setRefreshing(false);
    }
  }, [currentUserId]);

  const setupSocket = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }
      
      const socket = await socketService.connect(token);
      
      socket?.on('new-message', (message) => {
        updateChatWithNewMessage(message);
      });

      socket?.on('user-online', (userId) => {
        updateUserStatus(userId, true);
      });

      socket?.on('user-offline', (userId) => {
        updateUserStatus(userId, false);
      });

      return () => {
        if (currentUserId) {
          chatApi.updateUserStatus(currentUserId, false);
        }
      };
    } catch (error) {
      console.error('Socket bağlantısı kurulurken hata:', error);
      Alert.alert('Hata', 'Mesajlaşma bağlantısı kurulamadı');
    }
  }, [currentUserId]);

  useEffect(() => {
    setupUser();
  }, [setupUser]);

  useEffect(() => {
    if (currentUserId) {
      loadChatSessions();
      setupSocket();
    }
  }, [currentUserId, loadChatSessions, setupSocket]);

  const updateChatWithNewMessage = (message: any) => {
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(chat => chat.id === message.chatSessionId);
      if (chatIndex === -1) return prevChats;

      const updatedChats = [...prevChats];
      updatedChats[chatIndex] = {
        ...updatedChats[chatIndex],
        lastMessage: message.content,
        time: new Date(message.timestamp).toLocaleTimeString(),
        unread: updatedChats[chatIndex].unread + 1,
      };

      return updatedChats;
    });
  };

  const updateUserStatus = (userId: string, isOnline: boolean) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === userId) {
          return { ...chat, isOnline };
        }
        return chat;
      });
    });
  };
=======
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        
        const newSocket = io(API_URL, {
          transports: ['websocket'],
          withCredentials: true,
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          auth: {
            token
          },
          path: '/socket.io',
          forceNew: true,
          extraHeaders: {
            'Access-Control-Allow-Origin': '*'
          }
        });

        newSocket.on('connect', () => {
          setIsConnected(true);
          console.log('Socket bağlantısı başarılı');
          // Sohbet listesini al
          newSocket.emit('get-chat-list');
        });

        newSocket.on('connect_error', (error) => {
          setIsConnected(false);
          console.log('Bağlantı hatası detayları:', {
            message: error.message,
            stack: error.stack
          });
          
          if (error.message === 'Authentication error') {
            Alert.alert('Bağlantı Hatası', 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
          } else if (error.message.includes('xhr poll error')) {
            Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
          } else {
            Alert.alert('Bağlantı Hatası', `Sunucuya bağlanırken bir hata oluştu: ${error.message}`);
          }
        });

        newSocket.on('disconnect', (reason) => {
          setIsConnected(false);
          console.log('Bağlantı kesildi:', reason);
        });

        // Sohbet listesi güncellemelerini dinle
        newSocket.on('chat-list', (chatList: Chat[]) => {
          setChats(chatList);
        });

        // Yeni mesaj geldiğinde sohbet listesini güncelle
        newSocket.on('new-message', (message: any) => {
          setChats(prevChats => {
            const updatedChats = [...prevChats];
            const chatIndex = updatedChats.findIndex(chat => chat.id === message.chatId);
            
            if (chatIndex !== -1) {
              updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                lastMessage: message.text,
                time: new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                unread: updatedChats[chatIndex].unread + 1,
              };
            }
            
            return updatedChats;
          });
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Socket başlatma hatası:', error);
        Alert.alert('Hata', 'Mesajlaşma sistemi başlatılamadı.');
      }
    };

    initializeSocket();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (socket && isConnected) {
      socket.emit('get-chat-list');
    }
    setRefreshing(false);
  }, [socket, isConnected]);
>>>>>>> c88be93c794dbe2100913e9be531e3dc39bd2955

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Mesajlar</Text>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('CompanyList')}>
        <Icon name="create-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Chat }) => {
    const handleChatPress = async () => {
      try {
        const otherParticipant = item.participants.find(p => p !== currentUserId);
        if (!otherParticipant) {
          throw new Error('Katılımcı bulunamadı');
        }
        const userInfo = await chatApi.getUserInfo(otherParticipant);
        navigation.navigate('ChatDetail', {
          chatId: item.id,
          receiverId: otherParticipant,
          name: userInfo.name,
          companyId: currentUserId,
        });
      } catch (error) {
        console.error('Kullanıcı bilgileri alınırken hata:', error);
        Alert.alert('Hata', 'Sohbet başlatılamadı');
      }
    };

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={handleChatPress}
      >
        <View style={styles.avatar}>
          <Image 
            source={{ uri: item.avatar }} 
            style={styles.avatarImage} 
            resizeMode="contain"
          />
          {item.isOnline && <View style={styles.onlineIndicator} />}
          {item.unread > 0 && (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadDotText}>{item.unread}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
<<<<<<< HEAD
    <ChatProvider>
      <LinearGradient
        colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{x: 0, y: 0}}
        end={{x: 2, y: 1}}
        style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {renderHeader()}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search in chats"
              placeholderTextColor={Colors.inactive}
              value={searchQuery}
              onChangeText={setSearchQuery}
=======
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sohbetlerde ara..."
            placeholderTextColor={Colors.inactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlatList
          data={chats.filter(chat =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
              progressBackgroundColor="transparent"
              progressViewOffset={-20}
              style={{ position: 'absolute', top: -20 }}
>>>>>>> c88be93c794dbe2100913e9be531e3dc39bd2955
            />
          </View>
          <FlatList
            data={chats.filter(chat =>
              chat.name.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadChatSessions}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
                progressBackgroundColor="transparent"
                progressViewOffset={-20}
                style={{ position: 'absolute', top: -20 }}
              />
            }
          />
        </SafeAreaView>
      </LinearGradient>
    </ChatProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.sm,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: metrics.padding.sm,
    width: metrics.scale(40),
  },
  headerButton: {
    padding: metrics.padding.sm,
    width: metrics.scale(40),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: metrics.margin.md,
    marginBottom: metrics.margin.sm,
    paddingHorizontal: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: metrics.margin.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: metrics.padding.sm,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
  },
  list: {
    flex: 1,
    paddingTop: metrics.padding.xl,
  },
  listContent: {
    paddingHorizontal: metrics.padding.md,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: metrics.padding.sm,
    paddingHorizontal: metrics.padding.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: metrics.scale(52),
    height: metrics.scale(52),
    borderRadius: metrics.scale(26),
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: metrics.padding.xs,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: metrics.scale(24),
  },
  unreadDot: {
    position: 'absolute',
    top: -metrics.scale(2),
    right: -metrics.scale(2),
    backgroundColor: Colors.primary,
    minWidth: metrics.scale(20),
    height: metrics.scale(20),
    borderRadius: metrics.scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1E29',
  },
  unreadDotText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.xs,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
    marginLeft: metrics.margin.sm,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.margin.xs,
  },
  name: {
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
    color: Colors.lightText,
    letterSpacing: 0.3,
  },
  time: {
    fontSize: metrics.fontSize.xs,
    color: Colors.inactive,
  },
  lastMessage: {
    fontSize: metrics.fontSize.sm,
    color: Colors.inactive,
    lineHeight: metrics.scale(20),
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#1A1E29',
  },
});

export default ChatListScreen; 