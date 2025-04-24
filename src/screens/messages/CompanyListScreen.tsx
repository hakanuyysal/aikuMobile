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
import { Colors } from '../../constants/colors';
import { CompanyListScreenProps } from '../../types';

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
    avatar: 'https://mergeturkgold.vercel.app/static/media/mtg-logo-6.c6308c8ef572398d6bb4.png',
  },
  {
    id: '2',
    name: 'Aloha Dijital',
    avatar: 'https://api.aikuaiplatform.com/uploads/images/1744635007038-746642319.png',
  },
  {
    id: '3',
    name: 'Turkau Mining',
    avatar: 'https://turkaumining.vercel.app/static/media/turkau-logo.904055d9d6e7dd0213c5.png',
  },
];

const CompanyListScreen = ({ navigation }: CompanyListScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Yeni Mesaj</Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={styles.companyItem}
      onPress={() => {
        // Yeni sohbet başlat ve ChatDetail ekranına yönlendir
        navigation.navigate('ChatDetail', { 
          chatId: item.id,
          name: item.name,
        });
      }}
    >
      <View style={styles.avatar}>
        <Image 
          source={{ uri: item.avatar }} 
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
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Şirket ara"
          placeholderTextColor={Colors.inactive}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={mockCompanies.filter(company =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerButton: {
    padding: 8,
    width: 40,
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
  companyItem: {
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
  companyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
});

export default CompanyListScreen; 