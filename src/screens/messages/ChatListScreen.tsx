import React, {useState, useEffect, useCallback} from 'react';
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
import {ChatListScreenProps, MessageStackParamList} from '../../types';
import {Colors} from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';
import chatApi from '../../api/chatApi';
import socketService from '../../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChatProvider} from '../../components/Chat/ChatProvider';
import { useProfileStore } from '../../store/profileStore';


interface Company {
  id: string;
  companyName: string;
  companyLogo: string;
}

interface ChatSession {
  _id: string;
  initiatorCompany: Company;
  targetCompany: Company;
  title: string;
  unreadCountInitiator: number;
  unreadCountTarget: number;
  lastMessageText?: string;
  lastMessageDate?: string;
  lastMessageSender?: Company;
}

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

interface ChatDetailParams {
  chatSessionId: string;
  receiverId: string;
  receiverName: string;
  companyId: string;
}

const ChatListScreen = ({navigation}: ChatListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('');
  const { profile } = useProfileStore();

  const fetchCurrentCompany = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      console.log('UserId:', userId);

      if (!token) {
        console.error('Token bulunamadı');
        return null;
      }

      const response = await fetch(
        `https://api.aikuaiplatform.com/api/company/current?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Company API Response Status:', response.status);
      const data = await response.json();
      console.log('Company API Response:', data);

      if (data.success && data.companies.length > 0) {
        const companyId = data.companies[0].id;
        console.log('Seçilen Company ID:', companyId);
        setCurrentCompanyId(companyId);
        return companyId;
      }
      console.error('Şirket bulunamadı veya API yanıtı başarısız');
      return null;
    } catch (error) {
      console.error('Şirket bilgisi alınırken hata:', error);
      return null;
    }
  };

  const fetchChatSessions = async (companyId: string) => {
    try {
      console.log('fetchChatSessions çağrıldı, companyId:', companyId);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.error('Token bulunamadı - fetchChatSessions');
        return;
      }

      const response = await fetch(
        `https://api.aikuaiplatform.com/api/chat/sessions/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Chat Sessions API Response Status:', response.status);
      const data = await response.json();
      console.log('Chat Sessions API Response:', data);

      if (data.success && Array.isArray(data.data)) {
        const formattedChats = data.data.map((session: ChatSession) => {
          const isInitiator = session.initiatorCompany.id === companyId;
          return {
            id: session._id,
            name: isInitiator
              ? session.targetCompany.companyName
              : session.initiatorCompany.companyName,
            lastMessage: session.lastMessageText || '',
            time: session.lastMessageDate
              ? new Date(session.lastMessageDate).toLocaleTimeString()
              : '',
            avatar: isInitiator
              ? session.targetCompany.companyLogo
              : session.initiatorCompany.companyLogo,
            unread: isInitiator
              ? session.unreadCountInitiator
              : session.unreadCountTarget,
            isOnline: false,
            participants: [
              session.initiatorCompany.id,
              session.targetCompany.id,
            ],
          };
        });
        console.log('Formatlanmış chat listesi:', formattedChats);
        setChats(formattedChats);
      } else {
        console.error('Chat sessions verisi alınamadı veya hatalı format');
      }
    } catch (error) {
      console.error('Sohbet oturumları yüklenirken hata:', error);
    }
  };

  const setupUser = useCallback(async () => {
    try {
      console.log('setupUser başladı');
      const userId = await AsyncStorage.getItem('user_id');
      console.log('Bulunan userId:', userId);

      if (userId) {
        const companyId = await fetchCurrentCompany(userId);
        console.log('fetchCurrentCompany sonucu:', companyId);

        if (companyId) {
          await fetchChatSessions(companyId);
        } else {
          console.error('Company ID alınamadı');
        }
      } else {
        console.error('Kullanıcı bilgisi bulunamadı');
        navigation.getParent()?.navigate('Auth');
      }
    } catch (error) {
      console.error('setupUser hata:', error);
      navigation.getParent()?.navigate('Auth');
    }
  }, [navigation]);

  const loadChatSessions = useCallback(async () => {
    try {
      setRefreshing(true);
      if (currentCompanyId) {
        await fetchChatSessions(currentCompanyId);
      }
    } catch (error) {
      console.error('Sohbet oturumları yüklenirken hata:', error);
    } finally {
      setRefreshing(false);
    }
  }, [currentCompanyId]);

  const updateChatWithNewMessage = useCallback((message: any) => {
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(chat => chat.id === message.chatSession);
      if (chatIndex === -1) return prevChats;

      const updatedChats = [...prevChats];
      const updatedChat = {...updatedChats[chatIndex]};

      // Mesaj içeriğini güncelle
      updatedChat.lastMessage = message.content;
      updatedChat.time = new Date(message.createdAt).toLocaleTimeString();

      // Eğer mesaj başka bir kullanıcıdan geldiyse okunmamış sayısını artır
      if (message.sender.id !== currentCompanyId) {
        updatedChat.unread = (updatedChat.unread || 0) + 1;
      }

      updatedChats[chatIndex] = updatedChat;

      // En son mesaj gelen sohbeti en üste taşı
      const [recentChat] = updatedChats.splice(chatIndex, 1);
      updatedChats.unshift(recentChat);

      return updatedChats;
    });
  }, [currentCompanyId]);

  const updateChatSessionStatus = useCallback((sessionUpdate: any) => {
    setChats(prevChats => {
      const chatIndex = prevChats.findIndex(chat => chat.id === sessionUpdate.chatSessionId);
      if (chatIndex === -1) return prevChats;

      const updatedChats = [...prevChats];
      const updatedChat = {...updatedChats[chatIndex]};

      // Okunma durumunu güncelle
      if (sessionUpdate.type === 'read') {
        updatedChat.unread = 0;
      }

      updatedChats[chatIndex] = updatedChat;
      return updatedChats;
    });
  }, []);

  const setupSocket = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token bulunamadı');
        return;
      }

      const socket = await socketService.connect(token);
      
      if (socket && currentCompanyId) {
        // Şirket chat odasına katıl
        socketService.joinCompanyChat(currentCompanyId);

        // Yeni mesaj dinleyicisi
        socket.on('new-message', (message) => {
          console.log('Yeni mesaj alındı:', message);
          updateChatWithNewMessage(message);
        });

        // Chat oturumu güncelleme dinleyicisi
        socket.on('chat-session-update', (sessionUpdate) => {
          console.log('Chat oturumu güncellendi:', sessionUpdate);
          updateChatSessionStatus(sessionUpdate);
        });

        // Mesaj okundu bildirimi
        socket.on('message-read', (data) => {
          console.log('Mesaj okundu bildirimi:', data);
          updateChatSessionStatus({ 
            type: 'read', 
            chatSessionId: data.chatSessionId 
          });
        });

        // Kullanıcı durumu dinleyicisi
        socket.on('user-status-change', ({userId, isOnline}) => {
          console.log('Kullanıcı durumu değişti:', userId, isOnline);
          updateUserStatus(userId, isOnline);
        });
      }

      return () => {
        if (socket) {
          socket.off('new-message');
          socket.off('chat-session-update');
          socket.off('message-read');
          socket.off('user-status-change');
          if (currentCompanyId) {
            socketService.disconnect();
          }
        }
      };
    } catch (error) {
      console.error('Socket bağlantısı kurulurken hata:', error);
    }
  }, [currentCompanyId, updateChatWithNewMessage, updateChatSessionStatus]);

  useEffect(() => {
    console.log('İlk useEffect çalıştı - setupUser');
    setupUser();
  }, [setupUser]);

  useEffect(() => {
    if (currentCompanyId) {
      console.log('CompanyId değişti, yeni değer:', currentCompanyId);
      loadChatSessions();
      setupSocket();
    }
  }, [currentCompanyId, loadChatSessions, setupSocket]);

  const updateUserStatus = (userId: string, isOnline: boolean) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === userId) {
          return {...chat, isOnline};
        }
        return chat;
      });
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Messages</Text>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.navigate('CompanyList')}>
        <Icon name="create-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({item}: {item: Chat}) => {
    const handleChatPress = () => {
      if (route.name === 'Message' && !profile.isSubscriber) {
        Alert.alert(
          'Subscription Required',
          'You need to be a subscriber to use the messaging feature.',
          [{ text: 'OK' }]
        );
        return;
      }
      const otherParticipantId = item.participants.find(p => p !== currentCompanyId);
      if (!otherParticipantId) {
        console.error('Karşı katılımcı bulunamadı');
        return;
      }

      const params: MessageStackParamList['ChatDetail'] = {
        chatSessionId: item.id,
        receiverId: otherParticipantId,
        receiverName: item.name,
        companyId: currentCompanyId
      };

      navigation.navigate('ChatDetail', params);
    };

    // Avatar url düzeltmesi:
    let avatarUrl = item.avatar;
    if (avatarUrl?.startsWith('/uploads')) {
      avatarUrl = `https://api.aikuaiplatform.com${avatarUrl}`;
    }

    return (
      <TouchableOpacity style={styles.chatItem} onPress={handleChatPress}>
        <View style={styles.avatar}>
          <Image
            source={{uri: avatarUrl || 'default_avatar_url_here'}}
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
            <Icon
              name="search"
              size={20}
              color={Colors.lightText}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search in chats"
              placeholderTextColor={Colors.inactive}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <FlatList
            data={chats.filter(chat =>
              chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
                style={{position: 'absolute', top: -20}}
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
