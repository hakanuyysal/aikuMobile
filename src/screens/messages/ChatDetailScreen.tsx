import React, {useState} from 'react';
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
import {ChatDetailScreenProps} from '../../types';
import {Colors} from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';

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
    text: 'Hello! I would like to inquire about your latest gold investment packages.',
    time: '14:30',
    sender: 'me',
  },
  {
    id: '2',
    text: 'Of course! We currently have several investment options available. Would you like me to share our current rates?',
    time: '14:31',
    sender: 'other',
  },
  {
    id: '3',
    text: "Yes, please. I'm particularly interested in long-term investment opportunities.",
    time: '14:32',
    sender: 'me',
  },
  {
    id: '4',
    text: 'Perfect! Our most popular long-term package offers a competitive rate of 8% annually with a minimum investment period of 2 years. Would you like more details?',
    time: '14:33',
    sender: 'other',
  },
];

const ChatDetailScreen = ({navigation, route}: ChatDetailScreenProps) => {
  const {name} = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        text: message.trim(),
        time: new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sender: 'me',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
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
        item.sender === 'me' ? styles.myMessage : styles.otherMessage,
      ]}>
      <View
        style={[
          styles.messageBubble,
          item.sender === 'me' ? styles.myBubble : styles.otherBubble,
        ]}>
        <Text
          style={[
            styles.messageText,
            item.sender === 'me'
              ? styles.myMessageText
              : styles.otherMessageText,
          ]}>
          {item.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            item.sender === 'me' ? styles.myTimeText : styles.otherTimeText,
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
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            inverted={false}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
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
