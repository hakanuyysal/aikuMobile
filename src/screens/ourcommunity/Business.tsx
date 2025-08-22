import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import metrics from '../../constants/aikuMetric';
import { companyService, Company } from '../../services/companyService';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const IMAGE_BASE_URL = 'https://api.aikuaiplatform.com';
const API_URL = 'https://api.aikuaiplatform.com/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size: number) => (metrics.isTablet ? size * 1.2 : size);

interface TeamMember {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  title: string;
  profilePhoto?: string;
}
interface Product {
  _id: string;
  productName: string;
  productLogo?: string;
}

// Type definition added
interface BusinessType {
  id: string;
  name: string;
  description: string;
  location: string;
  sector: string;
  link: string;
}

const businessesData: BusinessType[] = []; // Products removed, array left empty

const Business = () => {
  const navigation = useNavigation();
  const { token, user } = useAuth();

  const [search, setSearch] = useState('');
  const [businesses, setBusinesses] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Company | null>(null);
  const [businessDetails, setBusinessDetails] = useState<Company | null>(null);
  const [founders, setFounders] = useState<TeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      // Eğer sende isim farklıysa (ör. getCompaniesByType('business')) bu satırı değiştir.
      const data = await companyService.getBusinesses?.() ?? [];
      const processed = data.map((item: any) => {
        if (!item._id && item.id) return { ...item, _id: item.id };
        if (!item._id) {
          return {
            ...item,
            _id: `${item.companyName}-${item.companyWebsite || 'no-website'}`,
          };
        }
        return item;
      });
      setBusinesses(processed);
    } catch (e) {
      Alert.alert('Error', 'Failed to load businesses.');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessDetails = async (company: Company) => {
    const companyId = company._id;
    setApiError(false);
    setFounders([]);
    setTeamMembers([]);
    setProducts([]);

    if (!token) {
      Alert.alert('Error', 'Please log in again.');
      setBusinessDetails(company);
      setApiError(true);
      return;
    }
    if (!companyId || companyId.includes('-')) {
      Alert.alert('Error', 'This business cannot be viewed.');
      setBusinessDetails(company);
      setApiError(true);
      return;
    }

    try {
      setDetailsLoading(true);
      let companyData;
      try {
        const res = await axios.get(`${API_URL}/company/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        companyData = res.data.company || res.data;
      } catch {
        const currentRes = await axios.get(`${API_URL}/company/current?userId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        companyData =
          currentRes.data.companies.find((c: any) => c._id === companyId) ||
          currentRes.data.companies[0];
      }
      if (!companyData) throw new Error('No company data');

      setBusinessDetails(companyData);

      // founders & team parallel
      try {
        const [teamRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/team-members/company/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          companyData.user || companyData.userId
            ? axios.get(`${API_URL}/auth/user/${companyData.user || companyData.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            : Promise.resolve({ data: { user: null } }),
        ]);

        const allMembers = teamRes.data.teamMembers || [];
        const creator = userRes.data.user;
        const foundersList: TeamMember[] = [];

        if (creator && creator.firstName !== 'Aiku') {
          foundersList.push({
            _id: creator._id || creator.id,
            id: creator._id || creator.id,
            firstName: creator.firstName,
            lastName: creator.lastName || '',
            title: creator.title || 'Founder',
            profilePhoto: creator.profilePhoto,
          });
        }
        const extraFounders = allMembers.filter((m: any) => /founder|ceo/i.test(m.title || ''));
        foundersList.push(
          ...extraFounders.map((m: any) => ({
            _id: m._id || m.id,
            id: m._id || m.id,
            firstName: m.firstName,
            lastName: m.lastName || '',
            title: m.title || 'N/A',
            profilePhoto: m.profilePhoto,
          })),
        );
        setFounders(foundersList);

        const filteredTeam = allMembers.filter((m: any) => {
          const isCreator = creator && (m._id || m.id) === (creator._id || creator.id);
          const isExtra = /founder|ceo/i.test(m.title || '');
          return !isCreator && !isExtra;
        });
        setTeamMembers(
          filteredTeam.map((m: any) => ({
            _id: m._id || m.id,
            id: m._id || m.id,
            firstName: m.firstName,
            lastName: m.lastName || '',
            title: m.title || 'N/A',
            profilePhoto: m.profilePhoto,
          })),
        );
      } catch {
        setFounders([]);
        setTeamMembers([]);
      }

      // products
      try {
        const pr = await axios.get(`${API_URL}/product/company/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(pr.data.products || []);
      } catch {
        setProducts([]);
      }
    } catch {
      Alert.alert('Error', 'Failed to load additional business details. Showing available info.');
      setBusinessDetails(company);
      setApiError(true);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openModal = (company: Company) => {
    setSelectedBusiness(company);
    setModalVisible(true);
    fetchBusinessDetails(company);
  };
  const closeModal = () => {
    setModalVisible(false);
    setSelectedBusiness(null);
    setBusinessDetails(null);
    setFounders([]);
    setTeamMembers([]);
    setProducts([]);
    setApiError(false);
  };

  const filtered = businesses.filter(item => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.companyName?.toLowerCase().includes(q) ||
      item.companyInfo?.toLowerCase().includes(q) ||
      (Array.isArray(item.companySector) ? item.companySector.join(' ').toLowerCase() : '').includes(q) ||
      item.companyAddress?.toLowerCase().includes(q)
    );
  });

  const filteredBusinesses = businessesData.filter(
    item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}
      onPress={() => openModal(item)}
      activeOpacity={0.9}
    >
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
                  : item.companyLogo.startsWith('/uploads')
                    ? `${IMAGE_BASE_URL}${item.companyLogo}`
                    : `${IMAGE_BASE_URL}/uploads/images/defaultCompanyLogo.png`,
              }}
              style={styles.companyLogo}
              resizeMode="contain"
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

        <View style={styles.detail}>
          <PaperText style={styles.detailLabel}>Location</PaperText>
          <PaperText style={styles.detailValue}>{item.companyAddress || 'N/A'}</PaperText>
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
          <PaperText style={styles.description}>{item.companyInfo || 'No description available'}</PaperText>
        </View>

        {!!item.companyWebsite && (
          <TouchableOpacity style={styles.visitButton} onPress={() => Linking.openURL(item.companyWebsite)}>
            <PaperText style={styles.visitButtonText}>Visit</PaperText>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={closeModal}>
      <LinearGradient
        colors={['#181C2A', '#232946', '#3B82F7', '#232946']}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 1 }}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <PaperText style={styles.modalTitle}>
                {businessDetails?.companyName || selectedBusiness?.companyName || 'Business Details'}
              </PaperText>
              {(businessDetails?.openForInvestments || selectedBusiness?.openForInvestments) && (
                <Icon name="rocket" size={20} color="#1A73E8" style={{ marginLeft: 8 }} />
              )}
            </View>
            <TouchableOpacity onPress={closeModal}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View
              style={[
                styles.cardContainer,
                (businessDetails?.isHighlighted || selectedBusiness?.isHighlighted) && styles.highlightedCard,
                { marginTop: 0, marginBottom: 0, width: '100%' },
              ]}
            >
              {detailsLoading ? (
                <PaperText style={styles.loadingText}>Loading details...</PaperText>
              ) : businessDetails || selectedBusiness ? (
                <View style={styles.modalBody}>
                  {apiError && (
                    <PaperText style={styles.warningText}>Showing basic info due to failed data fetch.</PaperText>
                  )}

                  {(businessDetails?.companyLogo || selectedBusiness?.companyLogo) && (
                    <Image
                      source={{
                        uri: (businessDetails?.companyLogo ?? selectedBusiness?.companyLogo ?? '').startsWith('http')
                          ? (businessDetails?.companyLogo ?? selectedBusiness?.companyLogo ?? '')
                          : (businessDetails?.companyLogo ?? selectedBusiness?.companyLogo ?? '').startsWith('/uploads')
                            ? `${IMAGE_BASE_URL}${businessDetails?.companyLogo ?? selectedBusiness?.companyLogo ?? ''}`
                            : `${IMAGE_BASE_URL}/uploads/images/defaultCompanyLogo.png`,
                      }}
                      style={styles.modalLogo}
                      resizeMode="contain"
                    />
                  )}

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Name</PaperText>
                    <PaperText style={styles.detailValue}>
                      {businessDetails?.companyName || selectedBusiness?.companyName || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Company Type</PaperText>
                    <PaperText style={styles.detailValue}>
                      {businessDetails?.companyType || selectedBusiness?.companyType || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Sector</PaperText>
                    <PaperText style={styles.detailValue}>
                      {Array.isArray(businessDetails?.companySector ?? selectedBusiness?.companySector)
                        ? (businessDetails?.companySector ?? selectedBusiness?.companySector)?.join(', ')
                        : businessDetails?.companySector ?? 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Business Model</PaperText>
                    <PaperText style={styles.detailValue}>
                      {businessDetails?.businessModel || selectedBusiness?.businessModel || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Company Size</PaperText>
                    <PaperText style={styles.detailValue}>
                      {businessDetails?.companySize || selectedBusiness?.companySize || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Business Scale</PaperText>
                    <PaperText style={styles.detailValue}>
                      {businessDetails?.businessScale || selectedBusiness?.businessScale || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Incorporated</PaperText>
                    <PaperText style={styles.detailValue}>
                      {(businessDetails?.isIncorporated || selectedBusiness?.isIncorporated) ? 'Yes' : 'No'}
                    </PaperText>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Contact Information</PaperText>
                    <View style={styles.contactContainer}>
                      <View style={styles.detail}>
                        <PaperText style={styles.detailLabel}>Address</PaperText>
                        <PaperText style={styles.detailValue}>
                          {businessDetails?.companyAddress || selectedBusiness?.companyAddress || 'N/A'}
                        </PaperText>
                      </View>

                      {(businessDetails?.companyPhone || selectedBusiness?.companyPhone) && (
                        <View style={styles.detail}>
                          <PaperText style={styles.detailLabel}>Phone</PaperText>
                          <PaperText style={styles.detailValue}>
                            {businessDetails?.companyPhone || selectedBusiness?.companyPhone}
                          </PaperText>
                        </View>
                      )}

                      {(businessDetails?.companyEmail || selectedBusiness?.companyEmail) && (
                        <View style={styles.detail}>
                          <PaperText style={styles.detailLabel}>Email</PaperText>
                          <PaperText style={styles.detailValue}>
                            {businessDetails?.companyEmail || selectedBusiness?.companyEmail}
                          </PaperText>
                        </View>
                      )}

                      <View style={styles.detail}>
                        <PaperText style={styles.detailLabel}>Website</PaperText>
                        <TouchableOpacity
                          onPress={() => {
                            const url = businessDetails?.companyWebsite ?? selectedBusiness?.companyWebsite;
                            if (url) Linking.openURL(url);
                          }}
                        >
                          <PaperText
                            style={[
                              styles.detailValue,
                              { color: (businessDetails?.companyWebsite ?? selectedBusiness?.companyWebsite) ? '#3B82F7' : '#ccc' },
                            ]}
                          >
                            {(() => {
                              const w = businessDetails?.companyWebsite ?? selectedBusiness?.companyWebsite;
                              return w ? w.replace(/^https?:\/\//, '') : 'N/A';
                            })()}
                          </PaperText>
                        </TouchableOpacity>
                      </View>

                      {(businessDetails?.companyLinkedIn || selectedBusiness?.companyLinkedIn ||
                        businessDetails?.companyInstagram || selectedBusiness?.companyInstagram ||
                        businessDetails?.companyTwitter || selectedBusiness?.companyTwitter) && (
                          <View style={styles.detail}>
                            <PaperText style={styles.detailLabel}>Social Media</PaperText>
                            <View style={styles.socialMediaContainer}>
                              {(businessDetails?.companyLinkedIn || selectedBusiness?.companyLinkedIn) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = businessDetails?.companyLinkedIn ?? selectedBusiness?.companyLinkedIn;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-linkedin" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                              {(businessDetails?.companyInstagram || selectedBusiness?.companyInstagram) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = businessDetails?.companyInstagram ?? selectedBusiness?.companyInstagram;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-instagram" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                              {(businessDetails?.companyTwitter || selectedBusiness?.companyTwitter) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = businessDetails?.companyTwitter ?? selectedBusiness?.companyTwitter;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-twitter" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}
                    </View>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Summary</PaperText>
                    <PaperText style={styles.description}>
                      {(businessDetails?.companyInfo || selectedBusiness?.companyInfo || 'No summary available')
                        .split(/\r?\n/)
                        .filter(line => line.trim() !== '')
                        .map((p, i) => (
                          <PaperText key={i} style={styles.description}>
                            {p}
                          </PaperText>
                        ))}
                    </PaperText>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Description</PaperText>
                    <PaperText style={styles.description}>
                      {(businessDetails?.detailedDescription || selectedBusiness?.detailedDescription || 'No detailed description available')
                        .split(/\r?\n/)
                        .filter(line => line.trim() !== '')
                        .map((p, i) => (
                          <PaperText key={i} style={styles.description}>
                            {p}
                          </PaperText>
                        ))}
                    </PaperText>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Founder</PaperText>
                    {founders.length ? (
                      <View style={styles.teamContainer}>
                        {founders.map(f => (
                          <View key={f._id || f.id} style={styles.teamCard}>
                            {f.profilePhoto && (
                              <Image
                                source={{
                                  uri: f.profilePhoto.startsWith('http')
                                    ? f.profilePhoto
                                    : f.profilePhoto.startsWith('/uploads')
                                      ? `${IMAGE_BASE_URL}${f.profilePhoto}`
                                      : `${IMAGE_BASE_URL}/uploads/images/default-avatar.png`,
                                }}
                                style={styles.teamPhoto}
                                resizeMode="cover"
                              />
                            )}
                            <PaperText style={styles.teamName}>
                              {f.firstName} {f.lastName || ''}
                            </PaperText>
                            <PaperText style={styles.teamTitle}>{f.title || 'N/A'}</PaperText>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <PaperText style={styles.warningText}>No info.</PaperText>
                    )}
                  </View>

                  {!!teamMembers.length && (
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Team Members</PaperText>
                      <View style={styles.teamContainer}>
                        {teamMembers.map(m => (
                          <View key={m._id || m.id} style={styles.teamCard}>
                            {m.profilePhoto && (
                              <Image
                                source={{
                                  uri: m.profilePhoto.startsWith('http')
                                    ? m.profilePhoto
                                    : m.profilePhoto.startsWith('/uploads')
                                      ? `${IMAGE_BASE_URL}${m.profilePhoto}`
                                      : `${IMAGE_BASE_URL}/uploads/images/default-avatar.png`,
                                }}
                                style={styles.teamPhoto}
                                resizeMode="cover"
                              />
                            )}
                            <PaperText style={styles.teamName}>
                              {m.firstName} {m.lastName || ''}
                            </PaperText>
                            <PaperText style={styles.teamTitle}>{m.title || 'N/A'}</PaperText>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Products</PaperText>
                    {products.length ? (
                      <View style={styles.productContainer}>
                        {products.map(p => (
                          <View key={p._id} style={styles.productCard}>
                            {p.productLogo && (
                              <Image
                                source={{
                                  uri: p.productLogo.startsWith('http') ? p.productLogo : `${IMAGE_BASE_URL}${p.productLogo}`,
                                }}
                                style={styles.productLogo}
                                resizeMode="contain"
                              />
                            )}
                            <PaperText style={styles.productName}>{p.productName}</PaperText>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <PaperText style={styles.warningText}>No products available.</PaperText>
                    )}
                  </View>
                </View>
              ) : (
                <PaperText style={styles.errorText}>No details available for this business.</PaperText>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={scale(24)} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>Businesses</PaperText>
          <View style={{ width: 34 }} />
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={scale(20)} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
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
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item._id ? item._id.toString() : index.toString())}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchBusinesses}
        />

        {renderModal()}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Business;

const styles = StyleSheet.create({
  container: { flex: 1, padding: scale(12) },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  backButton: { marginRight: scale(8) },
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
    width: metrics.isTablet ? Math.min(metrics.WIDTH * 0.8, 800) : SCREEN_WIDTH - 32,
    alignSelf: 'center',
  },
  searchIcon: { marginRight: scale(6) },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? scale(10) : scale(8),
    fontSize: scale(16),
    color: '#fff',
  },

  list: { paddingBottom: scale(16) },

  cardContainer: {
    width: metrics.isTablet ? Math.min(metrics.WIDTH * 0.8, 900) : SCREEN_WIDTH - 32,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    marginTop: 18,
  },
  highlightedCard: { borderColor: '#FFD700', borderWidth: 2 },
  cardContent: { flex: 1, backgroundColor: 'transparent' },

  companyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
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
    backgroundColor: '#fff',
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 14 },

  detail: { marginBottom: 12 },
  detailLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  detailValue: { fontSize: 16, color: '#fff', fontWeight: '400' },
  description: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 5 },

  visitButton: {
    backgroundColor: '#3B82F7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  visitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // MODAL
  modalOverlay: { flex: 1 },
  modalSafeArea: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalBody: { marginBottom: 20 },
  modalLogo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  loadingText: { color: '#fff', textAlign: 'center', fontSize: 16, padding: 20 },
  errorText: { color: '#FF5555', textAlign: 'center', fontSize: 16, padding: 20 },
  warningText: { color: '#FFD700', textAlign: 'center', fontSize: 14, padding: 10, marginBottom: 10 },

  contactContainer: { marginTop: 8 },
  socialMediaContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  socialIcon: { marginRight: 12 },

  teamContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  teamCard: {
    width: metrics.isTablet ? (metrics.WIDTH / 3) - 40 : (SCREEN_WIDTH - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  teamPhoto: { width: 50, height: 50, borderRadius: 25, marginBottom: 8 },
  teamName: { fontSize: 14, color: '#fff', fontWeight: '600', textAlign: 'center' },
  teamTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  productContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: {
    width: metrics.isTablet ? (metrics.WIDTH / 3) - 40 : (SCREEN_WIDTH - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  productLogo: { width: 50, height: 50, borderRadius: 8, marginBottom: 8 },
  productName: { fontSize: 14, color: '#fff', fontWeight: '600', textAlign: 'center' },
});