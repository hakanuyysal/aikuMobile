import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  TextInput,
  FlatList,
  Image,
  AsyncStorage,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Text, IconButton, Surface, Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Autocomplete from 'react-native-autocomplete-input';
import { Colors } from 'constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

// Örnek veri (backend'den gelecek varsayımıyla)
const searchData = [
  { id: 1, type: 'Startup', name: 'Startup A', latitude: 37.7749, longitude: -122.4194, description: 'Innovative tech solutions', icon: 'https://via.placeholder.com/40', sector: 'Health', stage: 'Seed' },
  { id: 2, type: 'Investor', name: 'Investment Opportunities', latitude: 37.7840, longitude: -122.4094, description: 'PDI', icon: 'https://via.placeholder.com/40', sector: 'Finance', stage: 'Series A' },
  { id: 3, type: 'Developer', name: 'John Doe', latitude: 37.7640, longitude: -122.4294, description: 'Full-stack developer', icon: 'https://via.placeholder.com/40', sector: 'Education', stage: 'Pre-Seed' },
];

// Sektör listesi
const initialSectors = [
  'AI & Machine Learning',
  'Agriculture',
  'Aerospace & Defense',
  'Automotive',
  'Biotechnology & Pharmaceuticals',
  'Blockchain & Cryptocurrency',
  'Construction',
  'Consulting',
  'Cybersecurity',
  'Data Analytics',
  'E-commerce',
  'Education',
  'Energy',
  'Entertainment & Media',
  'Environmental Services',
  'Fashion & Apparel',
  'Finance',
  'Fintech',
  'Food & Beverage',
  'Government & Public Services',
  'Healthcare',
  'Human Resources & Talent Management',
  'Hospitality & Tourism',
  'Legal Services',
  'Manufacturing',
  'Marketing & Advertising',
  'Non-Profit & NGOs',
  'Real Estate',
  'Retail',
  'Robotics & Automation',
  'Software Development',
  'Sports & Recreation',
  'Technology',
  'Telecommunications',
  'Transportation & Logistics',
];

// Şirket türleri ve yatırım aşamaları
const companyTypes = ['Startup', 'Investor', 'Developer'];
const investmentStages = ['Pre-Seed', 'Seed', 'Series A', 'Series B'];

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState(searchData);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    sectors: [],
    stages: [],
    location: '',
  });
  const [page, setPage] = useState(1);
  const [sectors, setSectors] = useState(initialSectors);
  const [filteredSectors, setFilteredSectors] = useState(initialSectors);
  const [filteredTypes, setFilteredTypes] = useState(companyTypes);
  const [filteredStages, setFilteredStages] = useState(investmentStages);
  const [sectorSearchQuery, setSectorSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [stageSearchQuery, setStageSearchQuery] = useState('');
  const [typesExpanded, setTypesExpanded] = useState(false);
  const [sectorsExpanded, setSectorsExpanded] = useState(false);
  const [stagesExpanded, setStagesExpanded] = useState(false);

  // Konum izni
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => console.log('Location error:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchLocation();
    loadFavorites();
    loadSearchHistory();
  }, []);

  // Favorileri yükleme
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  // Arama geçmişini yükleme
  const loadSearchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('searchHistory');
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch (error) {
      console.log('Error loading search history:', error);
    }
  };

  // Arama işlemi (Backend entegrasyonu simülasyonu)
  const handleSearch = async (text) => {
    setSearchQuery(text);

    const filteredSuggestions = searchData
      .filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.type.toLowerCase().includes(text.toLowerCase()) ||
        item.sector.toLowerCase().includes(text.toLowerCase())
      )
      .map(item => item.name);
    setSuggestions(text.length > 0 ? filteredSuggestions : []);

    if (text.length > 0) {
      const updatedHistory = [text, ...searchHistory.filter(item => item !== text)].slice(0, 5);
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    }

    try {
      const filtered = searchData.filter(item =>
        (item.name.toLowerCase().includes(text.toLowerCase()) ||
         item.type.toLowerCase().includes(text.toLowerCase()) ||
         item.description.toLowerCase().includes(text.toLowerCase()) ||
         item.sector.toLowerCase().includes(text.toLowerCase())) &&
        (filters.types.length === 0 || filters.types.includes(item.type)) &&
        (filters.sectors.length === 0 || filters.sectors.includes(item.sector)) &&
        (filters.stages.length === 0 || filters.stages.includes(item.stage)) &&
        (!filters.location || item.description.toLowerCase().includes(filters.location.toLowerCase()))
      );
      setFilteredResults(filtered);
    } catch (error) {
      console.log('Search error:', error);
    }
  };

  // Favori ekleme/kaldırma
  const toggleFavorite = async (item) => {
    const isFavorite = favorites.some(fav => fav.id === item.id);
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.id !== item.id);
    } else {
      updatedFavorites = [...favorites, item];
    }
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Filtre uygulama
  const applyFilters = () => {
    handleSearch(searchQuery);
    setFilterModalVisible(false);
  };

  // Şirket türü arama
  const handleTypeSearch = (text) => {
    setTypeSearchQuery(text);
    const filtered = companyTypes.filter(type =>
      type.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTypes(filtered);
  };

  // Sektör arama
  const handleSectorSearch = (text) => {
    setSectorSearchQuery(text);
    const filtered = sectors.filter(sector =>
      sector.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSectors(filtered);
  };

  // Yatırım aşaması arama
  const handleStageSearch = (text) => {
    setStageSearchQuery(text);
    const filtered = investmentStages.filter(stage =>
      stage.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStages(filtered);
  };

  // Şirket türü seçimi (çoklu seçim)
  const toggleTypeSelection = (type) => {
    setFilters(prev => {
      const updatedTypes = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types: updatedTypes };
    });
  };

  // Sektör seçimi (çoklu seçim)
  const toggleSectorSelection = (sector) => {
    setFilters(prev => {
      const updatedSectors = prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector];
      return { ...prev, sectors: updatedSectors };
    });
  };

  // Yatırım aşaması seçimi (çoklu seçim)
  const toggleStageSelection = (stage) => {
    setFilters(prev => {
      const updatedStages = prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage];
      return { ...prev, stages: updatedStages };
    });
  };

  // Daha fazla sonuç yükleme (pagination)
  const fetchMoreResults = () => {
    setPage(prev => prev + 1);
    // Backend'den yeni veriler çekilir: fetch(`https://api.example.com/search?page=${page + 1}`)
  };

  // Kart render fonksiyonu
  const renderItemCard = ({ item }) => {
    const isSelected = item.id === selectedItem?.id;
    const isFavorite = favorites.some(fav => fav.id === item.id);
    return (
      <TouchableOpacity onPress={() => setSelectedItem(isSelected ? null : item)}>
        <Surface style={[styles.card, isSelected && styles.selectedCard]}>
          <Image source={{ uri: item.icon }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <IconButton
                icon={isFavorite ? 'heart' : 'heart-outline'}
                iconColor={isFavorite ? '#FF0000' : '#FFFFFF'}
                size={20}
                onPress={() => toggleFavorite(item)}
              />
            </View>
            <Text style={styles.cardSubtitle}>{item.type} • {item.sector}</Text>
            {isSelected && (
              <>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <Text style={styles.cardStage}>Stage: {item.stage}</Text>
              </>
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  // Şirket türü render fonksiyonu
  const renderTypeItem = ({ item }) => {
    const isSelected = filters.types.includes(item);
    return (
      <TouchableOpacity
        style={[styles.selectionItem, isSelected && styles.selectionItemSelected]}
        onPress={() => toggleTypeSelection(item)}
      >
        <Text style={styles.selectionItemText}>{item}</Text>
        {isSelected && (
          <Icon name="check-circle" size={20} color="#60A5FA" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  // Sektör render fonksiyonu
  const renderSectorItem = ({ item }) => {
    const isSelected = filters.sectors.includes(item);
    return (
      <TouchableOpacity
        style={[styles.selectionItem, isSelected && styles.selectionItemSelected]}
        onPress={() => toggleSectorSelection(item)}
      >
        <Text style={styles.selectionItemText}>{item}</Text>
        {isSelected && (
          <Icon name="check-circle" size={20} color="#60A5FA" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  // Yatırım aşaması render fonksiyonu
  const renderStageItem = ({ item }) => {
    const isSelected = filters.stages.includes(item);
    return (
      <TouchableOpacity
        style={[styles.selectionItem, isSelected && styles.selectionItemSelected]}
        onPress={() => toggleStageSelection(item)}
      >
        <Text style={styles.selectionItemText}>{item}</Text>
        {isSelected && (
          <Icon name="check-circle" size={20} color="#60A5FA" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}
    >
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/aistartupplatform.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Arama Çubuğu ve Filtre Butonu */}
        <View style={styles.searchContainer}>
          <Autocomplete
            data={suggestions}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search in Aiku"
            placeholderTextColor="#9CA3AF"
            inputContainerStyle={styles.autocompleteContainer}
            style={styles.searchInput}
            flatListProps={{
              keyboardShouldPersistTaps: 'always',
              renderItem: ({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchQuery(item);
                    handleSearch(item);
                    setSuggestions([]);
                  }}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ),
            }}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
            accessibilityLabel="Search startups or investors"
          />
          <IconButton
            icon="filter"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          />
        </View>

        {/* Filtre Modalı */}
        <Modal visible={filterModalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.modalContainer}>
              <Surface style={styles.modalContent}>
                <ScrollView contentContainerStyle={styles.modalScrollContent}>
                  <Text style={styles.modalTitle}>Filters</Text>

                  {/* Şirket Türü (Çoklu seçim) */}
                  <View style={styles.filterSection}>
                    <TouchableOpacity
                      style={styles.filterHeader}
                      onPress={() => setTypesExpanded(!typesExpanded)}
                    >
                      <Text style={styles.filterLabel}>Company Types</Text>
                      <Icon
                        name={typesExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                    {typesExpanded && (
                      <>
                        <TextInput
                          style={styles.selectionSearchInput}
                          placeholder="Search types..."
                          placeholderTextColor="#9CA3AF"
                          value={typeSearchQuery}
                          onChangeText={handleTypeSearch}
                        />
                        <FlatList
                          data={filteredTypes}
                          renderItem={renderTypeItem}
                          keyExtractor={(item) => item}
                          style={styles.selectionList}
                          contentContainerStyle={styles.selectionListContent}
                          showsVerticalScrollIndicator={false}
                        />
                      </>
                    )}
                  </View>

                  {/* Sektör Seçimi (Çoklu seçim) */}
                  <View style={styles.filterSection}>
                    <TouchableOpacity
                      style={styles.filterHeader}
                      onPress={() => setSectorsExpanded(!sectorsExpanded)}
                    >
                      <Text style={styles.filterLabel}>Company Sectors</Text>
                      <Icon
                        name={sectorsExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                    {sectorsExpanded && (
                      <>
                        <TextInput
                          style={styles.selectionSearchInput}
                          placeholder="Search sectors..."
                          placeholderTextColor="#9CA3AF"
                          value={sectorSearchQuery}
                          onChangeText={handleSectorSearch}
                        />
                        <FlatList
                          data={filteredSectors}
                          renderItem={renderSectorItem}
                          keyExtractor={(item) => item}
                          style={styles.selectionList}
                          contentContainerStyle={styles.selectionListContent}
                          showsVerticalScrollIndicator={false}
                        />
                      </>
                    )}
                  </View>

                  {/* Yatırım Aşaması (Çoklu seçim) */}
                  <View style={styles.filterSection}>
                    <TouchableOpacity
                      style={styles.filterHeader}
                      onPress={() => setStagesExpanded(!stagesExpanded)}
                    >
                      <Text style={styles.filterLabel}>Investment Stages</Text>
                      <Icon
                        name={stagesExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                    {stagesExpanded && (
                      <>
                        <TextInput
                          style={styles.selectionSearchInput}
                          placeholder="Search stages..."
                          placeholderTextColor="#9CA3AF"
                          value={stageSearchQuery}
                          onChangeText={handleStageSearch}
                        />
                        <FlatList
                          data={filteredStages}
                          renderItem={renderStageItem}
                          keyExtractor={(item) => item}
                          style={styles.selectionList}
                          contentContainerStyle={styles.selectionListContent}
                          showsVerticalScrollIndicator={false}
                        />
                      </>
                    )}
                  </View>
                </ScrollView>
                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => setFilterModalVisible(false)}
                    style={styles.modalActionButton}
                    labelStyle={styles.modalActionButtonLabel}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={applyFilters}
                    style={styles.modalActionButton}
                    labelStyle={styles.modalActionButtonLabel}
                  >
                    Apply
                  </Button>
                </View>
              </Surface>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Arama Geçmişi */}
        {searchQuery.length === 0 && searchHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <FlatList
              horizontal
              data={searchHistory}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.historyItem}
                  onPress={() => {
                    setSearchQuery(item);
                    handleSearch(item);
                  }}
                >
                  <Text style={styles.historyText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => String(index)}
            />
          </View>
        )}

        {/* Sonuçlar */}
        <FlatList
          data={filteredResults}
          renderItem={renderItemCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onEndReached={fetchMoreResults}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySuggestion}>
                Try broadening your search or adjusting filters.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3B82F680',
  },
  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1E29',
    borderRadius: 16,
    marginLeft:'33%'
  },
  logo: { width: '130%', height: '130%' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginVertical: 12,
    width: SCREEN_WIDTH * 0.88,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  autocompleteContainer: { flex: 1, borderWidth: 0, paddingVertical: 2 },
  searchInput: {
    paddingVertical: 10,
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  filterButton: { marginLeft: 8 },
  listContent: { paddingHorizontal: 12, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginVertical: 8,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  selectedCard: {
    borderColor: Colors.border,
    borderWidth: 2,
    backgroundColor: Colors.cardBackground,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#3B82F640',
  },
  cardContent: { flex: 1, justifyContent: 'center' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    maxWidth: '80%',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '400',
  },
  cardDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 6,
    lineHeight: 20,
  },
  cardStage: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
    backgroundColor: '#1A1E2920',
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
  },
  emptyText: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', fontWeight: '500' },
  emptySuggestion: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  suggestionItem: {
    padding: 12,
    backgroundColor: '#2D3748',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F620',
  },
  suggestionText: { color: '#E5E7EB', fontSize: 16, fontWeight: '400' },
  historyContainer: { paddingHorizontal: 12, marginBottom: 12 },
  historyTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  historyItem: {
    backgroundColor: '#2D3748',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyText: { color: '#E5E7EB', fontSize: 14, fontWeight: '400' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1A1E29',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: '80%',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  filterLabel: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '500',
  },
  selectionSearchInput: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 10,
    color: '#E5E7EB',
    fontSize: 14,
    marginBottom: 10,
  },
  selectionList: {
    maxHeight: 150,
    backgroundColor: '#2D3748',
    borderRadius: 12,
    marginBottom: 10,
  },
  selectionListContent: {
    paddingVertical: 5,
  },
  selectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  selectionItemSelected: {
    backgroundColor: '#3B82F620',
  },
  selectionItemText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  checkIcon: {
    marginLeft: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#3B82F620',
  },
  modalActionButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  modalActionButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MapScreen;