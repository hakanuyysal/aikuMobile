import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput, Alert, Image, Platform, Dimensions } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { companyService, Company } from '../../services/companyService';

// Responsive ölçekleme fonksiyonu
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

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
      (Array.isArray(item.companySector) ? item.companySector.join(' ').toLowerCase() : '').includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}>
      <View style={styles.cardContent}>
        <View style={styles.contentContainer}>
          <View style={styles.companyHeader}>
            {item.isHighlighted && (
              <View style={styles.highlightedBadge}>
                <Icon name="star" size={scale(16)} color="#FFD700" />
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
                <Icon name="business" size={scale(24)} color="#666" />
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
          <Icon name="chevron-back" size={scale(24)} color="#3B82F7" />
        </TouchableOpacity>
        <PaperText style={styles.header}>Investors</PaperText>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={scale(20)} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
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
    padding: scale(12),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  backButton: {
    marginRight: scale(8),
  },
  header: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: scale(12),
    paddingHorizontal: scale(12),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: scale(6),
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? scale(10) : scale(8),
    fontSize: scale(16),
    color: '#fff',
  },
  list: {
    paddingBottom: scale(16),
  },
  cardContainer: {
    width: '100%',
    minHeight: scale(160),
    marginBottom: scale(14),
    alignSelf: 'center',
    borderRadius: scale(10),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: scale(12),
    marginTop: scale(12),
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
    marginBottom: scale(10),
  },
  highlightedBadge: {
    position: 'absolute',
    top: -scale(8),
    right: -scale(8),
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: scale(10),
    padding: scale(3),
    zIndex: 1,
  },
  companyLogo: {
    width: scale(36),
    height: scale(36),
    marginRight: scale(8),
    borderRadius: scale(6),
  },
  placeholderLogo: {
    width: scale(36),
    height: scale(36),
    marginRight: scale(8),
    borderRadius: scale(6),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(10),
  },
  detailsContainer: {
    flexDirection: 'column',
    marginBottom: scale(14),
  },
  detail: {
    marginBottom: scale(8),
  },
  detailLabel: {
    fontSize: scale(12),
    color: 'rgba(255,255,255,0.5)',
    marginBottom: scale(2),
  },
  detailValue: {
    fontSize: scale(14),
    color: '#fff',
    fontWeight: '400',
  },
  description: {
    fontSize: scale(12),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: scale(10),
  },
  visitButton: {
    backgroundColor: '#3B82F7',
    paddingVertical: scale(6),
    paddingHorizontal: scale(12),
    borderRadius: scale(4),
    alignSelf: 'flex-start',
  },
  visitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scale(12),
  }
});