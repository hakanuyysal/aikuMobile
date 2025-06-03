import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  chatSessionId?: string;
  companyId?: string;
}

const API_URL = __DEV__ ? 'http://localhost:4000' : 'https://api.aikuaiplatform.com';

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        
        const newSocket = io(API_URL, {
          transports: ['websocket', 'polling'],
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

        // Bağlantı olaylarını dinle
        newSocket.on('connect', () => {
          setIsConnected(true);
          console.log('Socket bağlantısı başarılı');
        });

        newSocket.on('connect_error', (error) => {
          setIsConnected(false);
          if (error.message === 'Authentication error') {
            Alert.alert('Bağlantı Hatası', 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
          } else {
            Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanırken bir hata oluştu.');
          }
        });

        newSocket.on('disconnect', (reason) => {
          setIsConnected(false);
          console.log('Bağlantı kesildi:', reason);
        });

        // Mesaj alma olayını dinle
        newSocket.on('message', (message: Message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
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

  const sendMessage = () => {
    if (inputText.trim() && socket && isConnected) {
      const message: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user', // Kullanıcı kimliğini buraya ekleyin
        timestamp: Date.now(),
        chatSessionId: 'default', // Sohbet oturumu ID'sini buraya ekleyin
      };

      socket.emit('message', message);
      setInputText('');
    } else if (!isConnected) {
      Alert.alert('Bağlantı Hatası', 'Sunucuya bağlı değilsiniz.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Mesajınızı yazın..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatScreen; 