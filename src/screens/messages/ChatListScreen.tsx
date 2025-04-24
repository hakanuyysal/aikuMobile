import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatListScreenProps } from '../../types';
import { Colors } from '../../constants/colors';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unread: number;
}

// Mock data
const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Merge Turk Gold',
    lastMessage: 'Merhaba, nasılsın?',
    time: '14:30',
    avatar: 'https://mergeturkgold.vercel.app/static/media/mtg-logo-6.c6308c8ef572398d6bb4.png',
    unread: 2,
  },
  {
    id: '2',
    name: 'Aloha Dijital',
    lastMessage: 'Toplantı saat 15:00\'da',
    time: '12:45',
    avatar: 'https://api.aikuaiplatform.com/uploads/images/1744635007038-746642319.png',
    unread: 0,
  },
  {
    id: '3',
    name: 'Turkau Mining',
    lastMessage: 'Tamam, görüşürüz!',
    time: 'Dün',
    avatar: 'https://turkaumining.vercel.app/static/media/turkau-logo.904055d9d6e7dd0213c5.png',
    unread: 1,
  },
];

const ChatListScreen = ({ navigation }: ChatListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mesajlar</Text>
      <TouchableOpacity style={styles.headerButton}>
        <Icon name="create-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, name: item.name })}
    >
      <View style={styles.avatar}>
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.avatarImage} 
          resizeMode="contain"
        />
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sohbetlerde ara"
          placeholderTextColor={Colors.inactive}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={mockChats.filter(chat =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.lightText,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.cardBackground,
    marginBottom: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
  time: {
    fontSize: 14,
    color: Colors.inactive,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.inactive,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: Colors.lightText,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
});

export default ChatListScreen; 