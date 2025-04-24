import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatDetailScreenProps } from '../../types';
import { Colors } from '../../constants/colors';

interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'me' | 'other';
}

// Mock mesaj verileri
const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Merhaba, nasılsın?',
    time: '14:30',
    sender: 'other',
  },
  {
    id: '2',
    text: 'İyiyim, teşekkür ederim. Sen nasılsın?',
    time: '14:31',
    sender: 'me',
  },
  {
    id: '3',
    text: 'Ben de iyiyim. Bugün hava çok güzel!',
    time: '14:32',
    sender: 'other',
  },
  {
    id: '4',
    text: 'Evet, gerçekten öyle. Dışarı çıkmayı düşünüyor musun?',
    time: '14:33',
    sender: 'me',
  },
];

const ChatDetailScreen = ({ navigation, route }: ChatDetailScreenProps) => {
  const { name } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        text: message.trim(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        sender: 'me',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{name}</Text>
      <TouchableOpacity style={styles.headerButton}>
        <Icon name="ellipsis-horizontal" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
      <View style={[styles.messageBubble, item.sender === 'me' ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, item.sender === 'me' ? styles.myMessageText : styles.otherMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timeText, item.sender === 'me' ? styles.myTimeText : styles.otherTimeText]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted={false}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="add-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Mesaj yazın..."
            placeholderTextColor={Colors.inactive}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Icon 
              name="send" 
              size={24} 
              color={message.trim() ? Colors.primary : Colors.inactive} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
  headerButton: {
    padding: 8,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
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
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: Colors.lightText,
  },
  otherMessageText: {
    color: Colors.lightText,
  },
  timeText: {
    fontSize: 12,
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
    padding: 8,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    color: Colors.lightText,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatDetailScreen; 