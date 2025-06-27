import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput, Alert, Image } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { companyService, Company } from '../../services/companyService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Investor = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [investors, setInvestors] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const data = await companyService.getInvestors();
      console.log('Investors data:', data);
      setInvestors(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load investors.');
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors = investors.filter(
    item =>
      item.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      item.companyInfo?.toLowerCase().includes(search.toLowerCase()) ||
      item.companySector?.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}>
      <View style={styles.cardContent}>
        <View style={styles.contentContainer}>
          <View style={styles.companyHeader}>
            {item.isHighlighted && (
              <View style={styles.highlightedBadge}>
                <Icon name="star" size={16} color="#FFD700" />
              </View>
            )}
            {item.companyLogo ? (
              <Image
                source={{ uri: item.companyLogo }}
                style={styles.companyLogo}
                resizeMode="contain"
                defaultSource={require('../../assets/images/defaultCompanyLogo.png')}
                onError={(e) => {
                  console.log('Logo yüklenirken hata:', e.nativeEvent.error);
                  console.log('Logo URL:', item.companyLogo);
                }}
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Icon name="business" size={24} color="#666" />
              </View>
            )}
            <PaperText style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
              {item.companyName}
            </PaperText>
          </View>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Location</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.companyAddress}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Sector</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {Array.isArray(item.companySector)
                  ? item.companySector.join(', ')
                  : item.companySector || 'N/A'}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Business Model</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.businessModel || 'N/A'}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Company Size</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.companySize || 'N/A'}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Business Scale</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.businessScale || 'N/A'}
              </PaperText>
            </View>
          </View>
          <PaperText style={styles.description} numberOfLines={3} ellipsizeMode="tail">
            {item.companyInfo}
          </PaperText>
          <TouchableOpacity
            style={styles.visitButton}
            onPress={() => Linking.openURL(item.companyWebsite)}
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
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#3B82F7" />
        </TouchableOpacity>
        <PaperText style={styles.header}>Investors</PaperText>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search investors..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filteredInvestors}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchInvestors}
      />
    </LinearGradient>
  );
};

export default Investor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    minHeight: 180,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    marginTop: 18,
  },
  highlightedCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  highlightedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
  },
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  detailsContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  detail: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
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
  },
  visitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});