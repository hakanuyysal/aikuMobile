import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tip tanımı eklendi
interface BusinessType {
  id: string;
  name: string;
  description: string;
  location: string;
  sector: string;
  link: string;
}

const businessesData: BusinessType[] = []; // Ürünler kaldırıldı, dizi boş bırakıldı

const Business = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filteredBusinesses = businessesData.filter(
    item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: BusinessType }) => (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <View style={styles.contentContainer}>
          <PaperText style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </PaperText>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Location</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.location}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Sector</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.sector}
              </PaperText>
            </View>
          </View>
          <PaperText style={styles.description} numberOfLines={3} ellipsizeMode="tail">
            {item.description}
          </PaperText>
          <TouchableOpacity
            style={styles.visitButton}
            onPress={() => Linking.openURL(item.link)}
            activeOpacity={0.8}
          >
            <PaperText style={styles.visitButtonText}>Visit</PaperText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1E29" />
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{top:10, left:10, right:10, bottom:10}}>
            <Icon name="chevron-back" size={28} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>Businesses</PaperText>
          <View style={{width:38}} />
        </View>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <FlatList
          data={filteredBusinesses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<PaperText style={styles.emptyText}>Kayıtlı işletme bulunamadı.</PaperText>}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Business;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    padding: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 0,
    paddingHorizontal: 8,
    height: 56,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 10,
    marginHorizontal: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    color: '#fff',
    height: 44,
  },
  list: {
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    minHeight: 180,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
  },
  companyName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
  },
  visitButton: {
    backgroundColor: '#3B82F7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  visitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});