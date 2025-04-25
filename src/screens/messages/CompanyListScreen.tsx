import React, {useState} from 'react';
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
import {Colors} from '../../constants/colors';
import {CompanyListScreenProps} from '../../types';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';

interface Company {
  id: string;
  name: string;
  avatar: string;
}

// Mock şirket verileri
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Merge Turk Gold',
    avatar:
      'https://mergeturkgold.vercel.app/static/media/mtg-logo-6.c6308c8ef572398d6bb4.png',
  },
  {
    id: '2',
    name: 'Aloha Dijital',
    avatar:
      'https://api.aikuaiplatform.com/uploads/images/1744635007038-746642319.png',
  },
  {
    id: '3',
    name: 'Turkau Mining',
    avatar:
      'https://turkaumining.vercel.app/static/media/turkau-logo.904055d9d6e7dd0213c5.png',
  },
];

const CompanyListScreen = ({navigation}: CompanyListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Select Company</Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderItem = ({item}: {item: Company}) => (
    <TouchableOpacity
      style={styles.companyItem}
      onPress={() => {
        navigation.navigate('ChatDetail', {
          chatId: item.id,
          name: item.name,
        });
      }}>
      <View style={styles.avatar}>
        <Image
          source={{uri: item.avatar}}
          style={styles.avatarImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.companyInfo}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
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
            placeholder="Search companies"
            placeholderTextColor={Colors.inactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlatList
          data={mockCompanies.filter(company =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
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
    fontSize: metrics.fontSize.xl,
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
    backgroundColor: Colors.cardBackground,
    margin: metrics.margin.md,
    paddingHorizontal: metrics.padding.sm,
    borderRadius: metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
  },
  listContent: {
    paddingHorizontal: metrics.padding.md,
  },
  companyItem: {
    flexDirection: 'row',
    padding: metrics.padding.sm,
    backgroundColor: Colors.cardBackground,
    marginBottom: metrics.margin.sm,
    borderRadius: metrics.borderRadius.md,
  },
  avatar: {
    width: metrics.scale(50),
    height: metrics.scale(50),
    borderRadius: metrics.scale(25),
    backgroundColor: '#FFFFFF',
    padding: metrics.padding.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  companyInfo: {
    flex: 1,
    marginLeft: metrics.margin.sm,
    justifyContent: 'center',
  },
  name: {
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
    color: Colors.lightText,
  },
});

export default CompanyListScreen;
