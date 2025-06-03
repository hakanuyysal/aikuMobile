import React, {useState, useEffect, useRef} from 'react';
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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ChatDetailScreenProps} from '../../types';
import {Colors} from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';
import socket from '../../socket';

interface Message {
  id: string;
  text: string;
  time: string;
  senderType: 'me' | 'other';
  timestamp: number;
  chatSessionId?: string;
  chatSession?: string;
  content?: string;
  createdAt?: string;
  sender?: {
    id?: string;
    _id?: string;
  };
}

const ChatDetailScreen = ({navigation, route}: ChatDetailScreenProps) => {
  const {name, chatId} = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Socket bağlantı durumunu dinle
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket bağlantısı başarılı');
      if (socket.joinChat) {
        socket.joinChat(chatId);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket bağlantısı kesildi');
    };

    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      console.error('Bağlantı hatası:', error);
      
      if (error.message === 'Authentication error') {
        Alert.alert('Bağlantı Hatası', 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
      } else if (error.message.includes('xhr poll error')) {
        Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        Alert.alert('Bağlantı Hatası', `Sunucuya bağlanırken bir hata oluştu: ${error.message}`);
      }
    };

    // Mesaj dinleyicileri
    const handleNewMessage = (message: Message) => {
      if (message.chatSessionId === chatId || message.chatSession === chatId) {
        setMessages(prevMessages => {
          const exists = prevMessages.some(m => m.id === message.id);
          if (!exists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      }
    };

    const handleChatNotification = (notification: any) => {
      if (notification.type === 'new-message' && 
          (notification.chatSessionId === chatId || notification.chatSession === chatId)) {
        const newMessage = notification.message;
        setMessages(prevMessages => {
          const exists = prevMessages.some(m => m.id === newMessage.id);
          if (!exists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
    };

    // Event dinleyicilerini ekle
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('new-message', handleNewMessage);
    socket.on('chat-notification', handleChatNotification);

    // Sohbet odasına katıl
    if (socket.connected && socket.joinChat) {
      socket.joinChat(chatId);
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('new-message', handleNewMessage);
      socket.off('chat-notification', handleChatNotification);
      if (socket.leaveChat) {
        socket.leaveChat(chatId);
      }
    };
  }, [chatId]);

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        time: new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        senderType: 'me',
        timestamp: Date.now(),
        content: message.trim(),
        chatSessionId: chatId,
        createdAt: new Date().toISOString()
      };

      socket.emit('message', {
        chatSessionId: chatId,
        content: message.trim(),
        timestamp: Date.now()
      });
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage('');
    } else if (!isConnected) {
      Alert.alert('Bağlantı Hatası', 'Sunucuya bağlı değilsiniz.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{name}</Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderMessage = ({item}: {item: Message}) => (
    <View
      style={[
        styles.messageContainer,
        item.senderType === 'me' ? styles.myMessage : styles.otherMessage,
      ]}>
      <View
        style={[
          styles.messageBubble,
          item.senderType === 'me' ? styles.myBubble : styles.otherBubble,
        ]}>
        <Text
          style={[
            styles.messageText,
            item.senderType === 'me'
              ? styles.myMessageText
              : styles.otherMessageText,
          ]}>
          {item.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            item.senderType === 'me' ? styles.myTimeText : styles.otherTimeText,
          ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

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
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            inverted={false}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor={Colors.inactive}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim() ? styles.sendButtonActive : null,
                !message.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim()}>
              <Icon
                name="send"
                size={metrics.scale(24)}
                color={message.trim() ? Colors.primary : Colors.inactive}
              />
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
    marginVertical: metrics.margin.xs,
    flexDirection: 'row',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: metrics.padding.sm,
    borderRadius: metrics.borderRadius.lg,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: metrics.borderRadius.xs,
  },
  otherBubble: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: metrics.borderRadius.xs,
  },
  messageText: {
    fontSize: metrics.fontSize.md,
    marginBottom: metrics.margin.xs,
  },
  myMessageText: {
    color: Colors.lightText,
  },
  otherMessageText: {
    color: Colors.lightText,
  },
  timeText: {
    fontSize: metrics.fontSize.xs,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: Colors.lightText + '80',
  },
  otherTimeText: {
    color: Colors.inactive,
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
});

export default ChatDetailScreen;
