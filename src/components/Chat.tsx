import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import SocketService from '../services/socketService';
import { messageService } from '../services/apiService';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
}

interface ChatProps {
  currentUserId: string;
  receiverId: string;
  chatSessionId: string;
}

const Chat: React.FC<ChatProps> = ({ currentUserId, receiverId, chatSessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketService = SocketService.getInstance();

  useEffect(() => {
    setupChat();
    return () => {
      cleanupChat();
    };
  }, [chatSessionId]);

  const setupChat = async () => {
    try {
      setLoading(true);
      await loadMessages();
      const socket = await socketService.connect();
      await socketService.joinChat(chatSessionId);

      socket?.on('message', (message: Message) => {
        if (
          (message.senderId === currentUserId && message.receiverId === receiverId) ||
          (message.senderId === receiverId && message.receiverId === currentUserId)
        ) {
          setMessages(prevMessages => [...prevMessages, message]);
        }
      });
    } catch (error) {
      console.error('Sohbet kurulumu sırasında hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupChat = async () => {
    await socketService.leaveChat(chatSessionId);
  };

  const loadMessages = async () => {
    try {
      const response = await messageService.getMessages(currentUserId);
      setMessages(response);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const messageData = {
          senderId: currentUserId,
          receiverId: receiverId,
          content: newMessage,
        };

        const savedMessage = await messageService.sendMessage(messageData);
        const socket = socketService.getSocket();
        
        if (socket) {
          socket.emit('message', {
            ...savedMessage,
            timestamp: new Date(),
          });
        }

        setNewMessage('');
      } catch (error) {
        console.error('Mesaj gönderilirken hata:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === currentUserId
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              item.senderId === currentUserId ? styles.sentMessageText : styles.receivedMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.timestamp,
              item.senderId === currentUserId ? styles.sentTimestamp : styles.receivedTimestamp
            ]}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Mesajınızı yazın..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
  sentTimestamp: {
    color: '#fff',
  },
  receivedTimestamp: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
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
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Chat; 