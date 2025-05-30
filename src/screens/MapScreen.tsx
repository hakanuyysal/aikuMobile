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
import { Colors } from 'constants/colors';
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
      <TouchableOpacity onPress={handleCardPress}>
        <Surface style={[styles.card, isSelected && styles.selectedCard]}>
          <Image 
            source={{ uri: item.companyLogo }} 
            style={styles.cardImage}
            defaultSource={require('../assets/images/defaultCompanyLogo.png')}
          />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.companyName}</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              {item.companyType} • {Array.isArray(item.companySector) ? item.companySector.join(', ') : 'N/A'}
            </Text>
            {isSelected && (
              <>
                <Text style={styles.cardDescription}>{item.companyInfo}</Text>
                <Text style={styles.cardStage}>Location: {item.companyAddress}</Text>
              </>
            )}
          </View>
        </Surface>
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
            placeholder="Search in aiku"
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
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