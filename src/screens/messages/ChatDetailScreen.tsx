import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Message } from '../../types/chat';
import { Colors } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';
import chatApi from '../../api/chatApi';
import socketService from '../../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3004'  // Android emülatör için localhost
  : Config.API_URL || 'https://api.aikuaiplatform.com';

interface RouteParams {
  chatSessionId: string;
  receiverId: string;
  receiverName: string;
  companyId: string;
}

interface APIMessage {
  _id: string;
  chatSession: string;
  sender: {
    _id: string;
    companyName: string;
    companyLogo: string;
    slug: string;
    id: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  chatSessionId: string;
}

const ChatDetailScreen: React.FC = () => {
  const [messages, setMessages] = useState<APIMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const route = useRoute();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const { chatSessionId, receiverId, receiverName, companyId } = route.params as RouteParams;

  const markAllMessagesAsRead = useCallback(async () => {
    try {
      await chatApi.markAsRead(chatSessionId, currentUserId);
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
    }
  }, [chatSessionId, currentUserId]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await chatApi.markAsRead(chatSessionId, currentUserId, messageId);
    } catch (error) {
      console.error('Mesaj okundu olarak işaretlenirken hata:', error);
    }
  }, [chatSessionId, currentUserId]);

  const setupUser = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        setCurrentUserId(userId);
        try {
          const token = await AsyncStorage.getItem('auth_token');
          const response = await fetch(`${API_URL}/auth/users/${userId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isOnline: true })
          });

          if (!response.ok) {
            console.error('Kullanıcı durumu güncellenirken fetch hatası (ChatDetailScreen):', response.status, response.statusText);
          }
        } catch (fetchError) {
          console.error('Kullanıcı durumu güncellenirken manuel fetch hatası (ChatDetailScreen):', fetchError);
        }
      } else {
        console.error('Kullanıcı bilgisi bulunamadı');
        navigation.getParent()?.navigate('Auth');
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alınırken hata (ChatDetailScreen):', error);
      navigation.getParent()?.navigate('Auth');
    }
  }, [navigation]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token bulunamadı');
        return;
      }

      console.log('Mesajlar yükleniyor:', chatSessionId, companyId);
      const response = await fetch(
        `https://api.aikuaiplatform.com/api/chat/messages/${chatSessionId}?companyId=${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('API Yanıtı:', data);

      if (data.success) {
        setMessages(data.data);
        markAllMessagesAsRead();
      } else {
        console.error('Mesajlar alınamadı:', data);
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [chatSessionId, companyId, markAllMessagesAsRead]);

  const setupSocket = useCallback(async () => {
    try {
      const socket = await socketService.connect();
      
      socket?.on('new-message', (message: APIMessage) => {
        if (message.chatSessionId === chatSessionId) {
          setMessages(prevMessages => [...prevMessages, message]);
          markMessageAsRead(message._id);
        }
      });

      return () => {
        const disconnectUserStatus = async () => {
          if (currentUserId) {
            try {
              const token = await AsyncStorage.getItem('auth_token');
              const response = await fetch(`${API_URL}/auth/users/${currentUserId}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isOnline: false })
              });

              if (!response.ok) {
                console.error('Kullanıcı durumu güncellenirken fetch hatası (ChatDetailScreen):', response.status, response.statusText);
              }
            } catch (fetchError) {
              console.error('Kullanıcı durumu güncellenirken manuel fetch hatası (ChatDetailScreen):', fetchError);
            }
          }
        };
        disconnectUserStatus();
      };
    } catch (error) {
      console.error('Socket bağlantısı kurulurken hata (ChatDetailScreen):', error);
    }
  }, [currentUserId, chatSessionId, markMessageAsRead]);

  useEffect(() => {
    setupUser();
  }, [setupUser]);

  useEffect(() => {
    if (chatSessionId && companyId) {
      console.log('Mesajlar yüklenmeye başlıyor...');
      loadMessages();
      setupSocket();
    }
  }, [chatSessionId, companyId, loadMessages, setupSocket]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && !sending) {
      try {
        setSending(true);
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          console.error('Token bulunamadı');
          return;
        }

        const messageToSend = {
          chatSessionId: chatSessionId,
          senderId: companyId,
          content: newMessage.trim()
        };

        const response = await fetch('https://api.aikuaiplatform.com/api/chat/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageToSend)
        });

        const data = await response.json();
        
        if (data.success) {
          setMessages(prevMessages => [...prevMessages, data.data]);
          setNewMessage('');
        } else {
          console.error('Mesaj gönderilemedi:', data);
        }
      } catch (error) {
        console.error('Mesaj gönderilirken hata:', error);
      } finally {
        setSending(false);
      }
    }
  };

  const formatMessageDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = messageDate.toDateString() === now.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return 'Bugün';
    } else if (isYesterday) {
      return 'Dün';
    } else {
      return messageDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const renderDateBadge = (date: string) => (
    <View style={styles.dateBadgeContainer}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateBadgeText}>{formatMessageDate(date)}</Text>
      </View>
    </View>
  );

  const renderMessages = () => {
    let currentDate = '';
    const messageElements: React.ReactNode[] = [];

    messages.forEach((item, index) => {
      const messageDate = new Date(item.createdAt).toDateString();
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        messageElements.push(
          <React.Fragment key={`date-${item._id}`}>
            {renderDateBadge(item.createdAt)}
          </React.Fragment>
        );
      }

      messageElements.push(
        <View
          key={item._id}
          style={[
            styles.messageContainer,
            item.sender._id === companyId ? styles.myMessage : styles.otherMessage,
          ]}>
          <View
            style={[
              styles.messageBubble,
              item.sender._id === companyId ? styles.myBubble : styles.otherBubble,
            ]}>
            <Text style={[styles.messageText, item.sender._id === companyId ? styles.myMessageText : styles.otherMessageText]}>
              {item.content}
            </Text>
            <Text style={[styles.timeText, item.sender._id === companyId ? styles.myTimeText : styles.otherTimeText]}>
              {new Date(item.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
        </View>
      );
    });

    return messageElements;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{receiverName}</Text>
      <View style={styles.headerButton} />
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{x: 0, y: 0}}
        end={{x: 2, y: 1}}
        style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
          <ScrollView
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}>
            {renderMessages()}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor={Colors.inactive}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                newMessage.trim() ? styles.sendButtonActive : null,
                !newMessage.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}>
              {sending ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Icon
                  name="send"
                  size={metrics.scale(24)}
                  color={newMessage.trim() ? Colors.primary : Colors.inactive}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.sm,
  },
  backButton: {
    padding: metrics.padding.sm,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
    color: Colors.lightText,
    marginLeft: -metrics.margin.sm,
  },
  headerButton: {
    padding: metrics.padding.sm,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: metrics.padding.md,
    paddingBottom: metrics.padding.xl,
  },
  messageContainer: {
    marginVertical: 2,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 8,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#E1FFC7',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 18,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000000',
  },
  otherMessageText: {
    color: '#000000',
  },
  timeText: {
    fontSize: 11,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: '#7EAA71',
  },
  otherTimeText: {
    color: '#8D8D8D',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: metrics.isIOS ? metrics.padding.lg : metrics.padding.sm,
    marginTop: metrics.margin.xs,
    marginBottom: -35,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.xl,
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.sm,
    marginHorizontal: metrics.margin.sm,
    minHeight: metrics.scale(40),
    maxHeight: metrics.scale(100),
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: {
    padding: metrics.padding.sm,
    width: metrics.scale(40),
    height: metrics.scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: metrics.borderRadius.circle,
    backgroundColor: 'transparent',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary + '20',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadgeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateBadge: {
    backgroundColor: 'rgba(225, 245, 254, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateBadgeText: {
    color: '#1B1B1B',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ChatDetailScreen;
