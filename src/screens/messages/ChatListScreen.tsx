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
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatListScreenProps } from '../../types';
import { Colors } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';

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
    lastMessage: 'Please review the latest gold prices',
    time: '14:30',
    avatar: 'https://mergeturkgold.vercel.app/static/media/mtg-logo-6.c6308c8ef572398d6bb4.png',
    unread: 2,
  },
  {
    id: '2',
    name: 'Aloha Digital',
    lastMessage: 'Meeting scheduled for 3 PM',
    time: '12:45',
    avatar: 'https://api.aikuaiplatform.com/uploads/images/1744635007038-746642319.png',
    unread: 0,
  },
  {
    id: '3',
    name: 'Turkau Mining',
    lastMessage: 'Project update: Mining operations',
    time: 'Yesterday',
    avatar: 'https://turkaumining.vercel.app/static/media/turkau-logo.904055d9d6e7dd0213c5.png',
    unread: 1,
  },
];

const ChatListScreen = ({ navigation }: ChatListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setChats(mockChats);
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Messages</Text>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('CompanyList')}>
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

  return (
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
            />
          }
        />
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
});

export default ChatListScreen; 