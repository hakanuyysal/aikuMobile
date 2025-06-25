import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput, Image, Alert, Platform, SafeAreaView } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { companyService, Company } from '../../services/companyService';
import { useFavoritesStore } from '../../store/favoritesStore';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext'; // token için
import axios from 'axios';

const IMAGE_BASE_URL = 'https://api.aikuaiplatform.com';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Startups = () => {
  const navigation = useNavigation();
  const { token } = useAuth(); // token al
  console.log("TOKEN:", token);
  const [search, setSearch] = useState('');
  const [startups, setStartups] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, setFavorites, addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore();

  useEffect(() => {
    fetchStartups();
  }, []);

  // Favori şirketleri çekmek için:
  // const fetchFavorites = async () => {
  //   try {
  //     const res = await axios.get('https://api.aikuaiplatform.com/api/favorites', {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setFavorites(res.data.favorites.favoriteCompanies); //
  //   } catch (error) {
  //     console.log('Favoriler yüklenirken hata:', error);
  //     Alert.alert('Hata', 'Favoriler yüklenirken bir hata oluştu.');
  //   }
  // };

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const data = await companyService.getStartups();
      console.log("Backend'den gelen startup listesi:", data);
      const processedData = data.map(item => {
        // Map id to _id if _id is missing
        if (!item._id && item.id) {
          return { ...item, _id: item.id };
        }
        if (!item._id) {
          console.warn(`Startup ${item.companyName} has undefined _id. Generating a stable temporary ID.`);
          return { ...item, _id: `${item.companyName}-${item.companyWebsite || 'no-website'}` };
        }
        return item;
      });
      setStartups(processedData);
    } catch (error) {
      Alert.alert('Hata', 'Startup\'lar yüklenirken bir hata oluştu.');
      setStartups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (startup: Company) => {
    const startupId = startup._id;
    console.log('handleToggleFavorite çağrıldı:', {
      startup,
      startupId,
      token,
      isFavorite: isFavorite(startupId),
    });

    if (!token) {
      console.log('TOKEN YOK! Favori işlemi yapılamaz.');
      Alert.alert('Hata', 'Lütfen tekrar giriş yapın.');
      return;
    }
    if (!startupId || startupId.includes('-')) {
      console.log('GEÇERSİZ ID! Favori işlemi yapılamaz.', startupId);
      Alert.alert('Hata', 'Bu startup için favori işlemi yapılamaz.');
      return;
    }
    if (isFavorite(startupId)) {
      try {
        console.log('Favoriden çıkarılıyor:', startupId);
        await axios.delete('https://api.aikuaiplatform.com/api/auth/favorites', {
          headers: { Authorization: `Bearer ${token}` },
          data: { type: 'company', itemId: startupId }
        });
        removeFromFavorites(startupId);
        console.log('Favoriden çıkarıldı:', startupId);
      } catch (e) {
        console.log('Favoriden çıkarılamadı:', e?.response?.data || e.message || e);
        Alert.alert('Hata', 'Favoriden çıkarılamadı.');
      }
    } else {
      try {
        console.log('Favoriye ekleniyor:', startupId);
        await axios.post('https://api.aikuaiplatform.com/api/auth/favorites', {
          type: 'company',
          itemId: startupId
        }, { headers: { Authorization: `Bearer ${token}` } });
        const favoriteStartupData = {
          id: startupId,
          name: startup.companyName,
          description: startup.companyInfo,
          logo: startup.companyLogo,
          website: startup.companyWebsite,
          isHighlighted: startup.isHighlighted,
        };
        addToFavorites(favoriteStartupData);
        console.log('Favoriye eklendi:', favoriteStartupData);
      } catch (e) {
        console.log('Favorilere eklenemedi:', e?.response?.data || e.message || e);
        Alert.alert('Hata', 'Favorilere eklenemedi.');
      }
    }
  };

  const filteredStartups = (startups || []).filter(item => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const nameMatch = item.companyName?.toLowerCase().includes(q);
    const infoMatch = item.companyInfo?.toLowerCase().includes(q);
    const sectorMatch = item.companySector?.join(' ').toLowerCase().includes(q);
    const locationMatch = item.companyAddress?.toLowerCase().includes(q);

    return nameMatch || infoMatch || sectorMatch || locationMatch;
  });

  const renderItem = ({ item }: { item: Company }) => {
    const itemIdForFavoriteCheck = item._id;
    const isCurrentlyFavorite = isFavorite(itemIdForFavoriteCheck);
    console.log('renderItem:', {
      item,
      itemIdForFavoriteCheck,
      isCurrentlyFavorite,
      idValid: !!item._id && !item._id.includes('-'),
    });

    return (
      <View style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}>
        <View style={styles.cardContent}>
          <View style={styles.companyHeader}>
            {item.isHighlighted && (
              <View style={styles.highlightedBadge}>
                <Icon name="star" size={16} color="#FFD700" />
              </View>
            )}
            {item.companyLogo ? (
              <Image
                source={{
                  uri: item.companyLogo.startsWith('http')
                    ? item.companyLogo
                    : `${IMAGE_BASE_URL}${item.companyLogo}`,
                }}
                style={styles.companyLogo}
                resizeMode="contain"
                onError={(e) =>
                  console.log(
                    `Failed to load image for ${item.companyName}: ${item.companyLogo}`,
                    e.nativeEvent.error
                  )
                }
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Icon name="business" size={24} color="#666" />
              </View>
            )}
            <View style={styles.companyNameContainer}>
              <PaperText style={styles.companyName}>{item.companyName}</PaperText>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => {
                  console.log('Favori butonuna tıklandı:', {
                    item,
                    itemId: item._id,
                    isCurrentlyFavorite,
                    idValid: !!item._id && !item._id.includes('-'),
                  });
                  handleToggleFavorite(item);
                }}
              >
                <Icon
                  name={isCurrentlyFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={
                    !item._id || item._id.includes('-')
                      ? "#ccc"
                      : isCurrentlyFavorite
                      ? Colors.primary
                      : `${Colors.primary}70`
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.detail}>
            <PaperText style={styles.detailLabel}>Location</PaperText>
            <PaperText style={styles.detailValue}>
              {item.companyAddress}
            </PaperText>
          </View>
          <View style={styles.detail}>
            <PaperText style={styles.detailLabel}>Sector</PaperText>
            <PaperText style={styles.detailValue}>
              {Array.isArray(item.companySector)
                ? item.companySector.length > 5
                  ? item.companySector.slice(0, 5).join(', ') + '...'
                  : item.companySector.join(', ')
                : item.companySector || 'N/A'}
            </PaperText>
          </View>
          <View style={styles.detail}>
            <PaperText style={styles.detailLabel}>Description</PaperText>
            <PaperText style={styles.description}>
              {item.companyInfo}
            </PaperText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.visitButton}
          onPress={() => Linking.openURL(item.companyWebsite)}
        >
          <PaperText style={styles.visitButtonText}>Visit</PaperText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>Startups</PaperText>
          <View style={{width: 34}}/>{/* Sağda boşluk için */}
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search startups..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredStartups}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchStartups}
          extraData={favorites}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0, // padding kaldırıldı
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 32 : 0,
    paddingHorizontal: 16, // Yatay padding eklendi
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
    width: SCREEN_WIDTH - 32, // Ekran genişliğine göre ayarlandı
    marginLeft: 16, // Sol kenardan boşluk
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
    lineHeight: 20,
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
  },
  companyNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  favoriteButton: {
    padding: 8,
  },
});

export default Startups;