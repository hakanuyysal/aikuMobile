import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  FlatList,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, IconButton, Surface, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { companyService, Company } from '../services/companyService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
const companyTypes = ['Startup', 'Investor'];
const investmentStages = ['Pre-Seed', 'Seed', 'Series A', 'Series B'];

type RootStackParamList = {
  DetailScreen: { itemId: string; itemType: string; };
  StartupsDetails: { item: Company };
  InvestorDetails: { item: Company };
};

type MapScreenNavigationProp = NavigationProp<RootStackParamList>;

const IS_TABLET = SCREEN_WIDTH >= 768;
const MAX_CONTENT_WIDTH = IS_TABLET ? Math.min(SCREEN_WIDTH * 0.85, 980) : SCREEN_WIDTH - 24;


const MapScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<Company[]>([]);
  const [selectedItem, setSelectedItem] = useState<Company | null>(null);
  const [_searchHistory, _setSearchHistory] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    types: [] as string[],
    sectors: [] as string[],
    stages: [] as string[],
  });
  const [filteredSectors, setFilteredSectors] = useState(initialSectors);
  const [filteredTypes, setFilteredTypes] = useState(companyTypes);
  const [filteredStages, setFilteredStages] = useState(investmentStages);
  const [sectorSearchQuery, setSectorSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [stageSearchQuery, setStageSearchQuery] = useState('');
  const [typesExpanded, setTypesExpanded] = useState(false);
  const [sectorsExpanded, setSectorsExpanded] = useState(false);
  const [stagesExpanded, setStagesExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<MapScreenNavigationProp>();

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const { companies } = await companyService.getAllCompanies();
      setFilteredResults(companies);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Arama işlemi
  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    try {
      const { companies } = await companyService.getAllCompanies();

      // Filtreleme işlemi
      let filtered = companies;

      // Metin araması
      if (text) {
        filtered = filtered.filter(item =>
          item.companyName?.toLowerCase().includes(text.toLowerCase()) ||
          item.companyInfo?.toLowerCase().includes(text.toLowerCase()) ||
          (Array.isArray(item.companySector) ? item.companySector.join(' ').toLowerCase().includes(text.toLowerCase()) : false)
        );
      }

      // Tip filtresi
      if (filters.types.length > 0) {
        filtered = filtered.filter(item => filters.types.includes(item.companyType));
      }

      // Sektör filtresi
      if (filters.sectors.length > 0) {
        filtered = filtered.filter(item =>
          Array.isArray(item.companySector) && item.companySector.some(sector => filters.sectors.includes(sector))
        );
      }

      setFilteredResults(filtered);
    } catch (error) {
      console.error('Arama yapılırken hata:', error);
    }
  };

  // Filtre uygulama
  const applyFilters = () => {
    handleSearch(searchQuery);
    setFilterModalVisible(false);
  };

  // Şirket türü arama
  const handleTypeSearch = (text: string) => {
    setTypeSearchQuery(text);
    const filtered = companyTypes.filter(type =>
      type.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTypes(filtered);
  };

  // Sektör arama
  const handleSectorSearch = (text: string) => {
    setSectorSearchQuery(text);
    const filtered = initialSectors.filter(sector =>
      sector.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSectors(filtered);
  };

  // Yatırım aşaması arama
  const handleStageSearch = (text: string) => {
    setStageSearchQuery(text);
    const filtered = investmentStages.filter(stage =>
      stage.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStages(filtered);
  };

  // Şirket türü seçimi (çoklu seçim)
  const toggleTypeSelection = (type: string) => {
    setFilters(prev => {
      const updatedTypes = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types: updatedTypes };
    });
  };

  // Sektör seçimi (çoklu seçim)
  const toggleSectorSelection = (sector: string) => {
    setFilters(prev => {
      const updatedSectors = prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector];
      return { ...prev, sectors: updatedSectors };
    });
  };

  // Yatırım aşaması seçimi (çoklu seçim)
  const toggleStageSelection = (stage: string) => {
    setFilters(prev => {
      const updatedStages = prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage];
      return { ...prev, stages: updatedStages };
    });
  };

  // Kart render fonksiyonu
  const renderItemCard = ({ item }: { item: Company }) => {
    const isSelected = item._id === selectedItem?._id;

    const handleCardPress = () => {
      setSelectedItem(isSelected ? null : item);
      // Navigate to detail screen based on company type
      if (item.companyType === 'Startup') {
        navigation.navigate('StartupsDetails', { item });
      } else if (item.companyType === 'Investor') {
        navigation.navigate('InvestorDetails', { item });
      }
    };

    return (
      <TouchableOpacity
        onPress={handleCardPress}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={styles.cardContent}>
          <View style={styles.companyHeader}>
            {item.companyLogo ? (
              <Image
                source={{ uri: item.companyLogo }}
                style={styles.companyLogo}
                defaultSource={require('../assets/images/defaultCompanyLogo.png')}
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Icon name="business" size={24} color="#666" />
              </View>
            )}
            <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">{item.companyName}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.companyAddress}
              </Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Sector</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {Array.isArray(item.companySector) ? item.companySector.join(', ') : 'N/A'}
              </Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Business Model</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.businessModel || 'N/A'}
              </Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Company Size</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.companySize || 'N/A'}
              </Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Business Scale</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.businessScale || 'N/A'}
              </Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
            {item.companyInfo}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Şirket türü render fonksiyonu
  const renderTypeItem = ({ item }: { item: string }) => {
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
  const renderSectorItem = ({ item }: { item: string }) => {
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
  const renderStageItem = ({ item }: { item: string }) => {
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
          <Icon name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in Aiku"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
            accessibilityLabel="Startup veya yatırımcı ara"
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
        {searchQuery.length === 0 && _searchHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <FlatList
              horizontal
              data={_searchHistory}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.historyItem}
                  onPress={() => {
                    setSearchQuery(item);
                    handleSearch(item);
                  }}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
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
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadInitialData}
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

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: IS_TABLET ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3B82F680',
    width: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  logoContainer: {
    width: IS_TABLET ? 96 : 100,
    height: IS_TABLET ? 96 : 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1E29',
    borderRadius: 16,
  },
  logo: { width: '130%', height: '130%' },

  // SEARCH
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginVertical: IS_TABLET ? 14 : 16,
    width: MAX_CONTENT_WIDTH,            // <- Daha geniş
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: IS_TABLET ? 50 : undefined,  // <- Biraz daha yüksek
  },
  searchIcon: {
    marginRight: 8,
    color: 'rgba(255,255,255,0.5)',
  },
  searchInput: {
    flex: 1,
    paddingVertical: IS_TABLET ? 8 : 8,
    fontSize: IS_TABLET ? 16 : 16,       // <- Tablet font +1
    color: '#fff',
    backgroundColor: 'transparent',
    paddingRight: 10,
  },
  filterButton: { marginLeft: 8 },

  // LIST & CARD
  listContent: {
    paddingHorizontal: 0,                // <- Yan boşluğu kaldır
    paddingBottom: 24,
    width: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  card: {
    width: MAX_CONTENT_WIDTH,            // <- Daha geniş kart
    minHeight: IS_TABLET ? 170 : 180,
    marginBottom: IS_TABLET ? 16 : 18,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: IS_TABLET ? 16 : 16,        // <- Tablet için padding’i artır
    marginTop: IS_TABLET ? 16 : 18,
  },
  selectedCard: { borderColor: '#3B82F7', borderWidth: 2 },
  cardContent: { flex: 1, backgroundColor: 'transparent' },

  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IS_TABLET ? 12 : 14,
  },
  companyLogo: {
    width: IS_TABLET ? 40 : 40,          // <- Logo biraz daha büyük
    height: IS_TABLET ? 40 : 40,
    marginRight: IS_TABLET ? 12 : 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  placeholderLogo: {
    width: IS_TABLET ? 40 : 40,
    height: IS_TABLET ? 40 : 40,
    marginRight: IS_TABLET ? 12 : 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    color: '#fff',
    fontSize: IS_TABLET ? 20 : 18,       // <- Başlık +2
    fontWeight: '600',
    marginBottom: IS_TABLET ? 12 : 14,
    flexShrink: 1,
  },

  detailsContainer: {
    flexDirection: 'column',
    marginBottom: IS_TABLET ? 16 : 20,
  },
  detail: { marginBottom: IS_TABLET ? 10 : 12 },
  detailLabel: {
    fontSize: IS_TABLET ? 13 : 14,       // <- Etiket +1
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: IS_TABLET ? 16 : 16,       // <- Değer +2 (öncekine göre)
    color: '#fff',
    fontWeight: '400',
  },

  description: {
    fontSize: IS_TABLET ? 15 : 14,       // <- Açıklama +2
    color: 'rgba(255,255,255,0.8)',
    marginBottom: IS_TABLET ? 14 : 15,
    lineHeight: IS_TABLET ? 22 : 20,     // <- Satır aralığı artışı
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 20,
    backgroundColor: '#1A1E2920',
    borderRadius: 12,
    width: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  emptyText: { color: '#9CA3AF', fontSize: IS_TABLET ? 16 : 16, textAlign: 'center', fontWeight: '500' },
  emptySuggestion: { color: '#9CA3AF', fontSize: IS_TABLET ? 14 : 14, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },


  // HISTORY / SUGGESTION (değişmedi, ufak font düşüşü)
  suggestionItem: {
    padding: 12,
    backgroundColor: '#2D3748',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F620',
  },
  suggestionText: { color: '#E5E7EB', fontSize: IS_TABLET ? 15 : 16, fontWeight: '400' },
  historyContainer: { paddingHorizontal: 12, marginBottom: 12 },
  historyTitle: {
    color: '#F9FAFB',
    fontSize: IS_TABLET ? 15 : 16,
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
  historyText: { color: '#E5E7EB', fontSize: IS_TABLET ? 13 : 14, fontWeight: '400' },

  // MODAL
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: IS_TABLET ? 60 : 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1A1E29',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: '80%',
    alignSelf: 'center',
    width: IS_TABLET ? Math.min(SCREEN_WIDTH * 0.7, 780) : '100%',
  },
  modalScrollContent: { paddingBottom: 20 },
  modalTitle: {
    color: '#F9FAFB',
    fontSize: IS_TABLET ? 21 : 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterSection: { marginBottom: 10 },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  filterLabel: { color: '#F9FAFB', fontSize: IS_TABLET ? 15 : 16, fontWeight: '500' },
  selectionSearchInput: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 10,
    color: '#E5E7EB',
    fontSize: IS_TABLET ? 14 : 14,
    marginBottom: 10,
  },
  selectionList: {
    maxHeight: IS_TABLET ? 180 : 150,
    backgroundColor: '#2D3748',
    borderRadius: 12,
    marginBottom: 10,
  },
  selectionListContent: { paddingVertical: 5 },
  selectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  selectionItemSelected: { backgroundColor: '#3B82F620' },
  selectionItemText: { color: '#E5E7EB', fontSize: IS_TABLET ? 14 : 14 },
  checkIcon: { marginLeft: 5 },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#3B82F620',
  },
  modalActionButton: { borderRadius: 12, paddingHorizontal: 12 },
  modalActionButtonLabel: { fontSize: IS_TABLET ? 14 : 14, fontWeight: '500' },
});


export default MapScreen;