import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CompanyListScreenProps } from '../../types';
import { Colors } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';
import chatApi from '../../api/chatApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Company {
  id: string;
  name: string;
  avatar: string;
}

const CompanyListScreen = ({ navigation }: CompanyListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const setupUser = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (userId) {
        setCurrentUserId(userId);
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

  const loadCompanies = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await chatApi.getCompanies();
      setCompanies(response);
    } catch (error) {
      console.error('Şirketler yüklenirken hata:', error);
      Alert.alert('Hata', 'Şirket listesi yüklenemedi');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setupUser();
  }, [setupUser]);

  useEffect(() => {
    if (currentUserId) {
      loadCompanies();
    }
  }, [currentUserId, loadCompanies]);

  const handleCompanyPress = async (company: Company) => {
    try {
      const chatSession = await chatApi.createChatSession({
        initiatorCompanyId: currentUserId,
        targetCompanyId: company.id,
        title: company.name,
      });
      navigation.navigate('ChatDetail', {
        chatId: chatSession.id,
        name: company.name,
        receiverId: company.id,
        companyId: currentUserId,
      });
    } catch (error) {
      console.error('Sohbet oturumu oluşturulurken hata:', error);
      Alert.alert('Hata', 'Sohbet oturumu oluşturulamadı');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Companies</Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={styles.companyItem}
      onPress={() => handleCompanyPress(item)}
    >
      <View style={styles.avatar}>
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.avatarImage} 
          resizeMode="contain"
        />
      </View>
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
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
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
            placeholderTextColor={Colors.inactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlatList
          data={companies.filter(company =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadCompanies}
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
  companyItem: {
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
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: metrics.margin.md,
  },
  companyName: {
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CompanyListScreen;
