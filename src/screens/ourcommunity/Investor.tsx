import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { companyService, Company } from '../../services/companyService';
import metrics from '../../constants/aikuMetric';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const IMAGE_BASE_URL = 'https://api.aikuaiplatform.com';
const API_URL = 'https://api.aikuaiplatform.com/api';

// Responsive ölçekleme fonksiyonu
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const guidelineBaseWidth = 375;

const scale = (size: number) => {
  if (metrics.isTablet) {
    return size * 1.2;
  }
  return size;
};

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

const Investor = () => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [search, setSearch] = useState('');
  const [investors, setInvestors] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Company | null>(null);
  const [investorDetails, setInvestorDetails] = useState<Company | null>(null);
  const [founders, setFounders] = useState<TeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const data = await companyService.getInvestors();
      // Startups’taki gibi _id doğrula
      const processed = (data || []).map((item: any) => {
        if (!item._id && item.id) return { ...item, _id: item.id };
        if (!item._id) {
          return {
            ...item,
            _id: `${item.companyName}-${item.companyWebsite || 'no-website'}`,
          };
        }
        return item;
      });
      setInvestors(processed);
    } catch (error) {
      Alert.alert('Error', 'Failed to load investors.');
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestorDetails = async (company: Company) => {
    const companyId = company._id;
    setApiError(false);
    setFounders([]);
    setTeamMembers([]);
    setProducts([]);

    if (!token) {
      Alert.alert('Error', 'Please log in again.');
      setInvestorDetails(company);
      setApiError(true);
      return;
    }
    if (!companyId || companyId.includes('-')) {
      Alert.alert('Error', 'This investor cannot be viewed.');
      setInvestorDetails(company);
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
      } catch (err) {
        // fallback: current companies
        const currentResponse = await axios.get(
          `${API_URL}/company/current?userId=${user?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        companyData =
          currentResponse.data.companies.find((c: any) => c._id === companyId) ||
          currentResponse.data.companies[0];
      }
      if (!companyData) throw new Error('No company data found');

      setInvestorDetails(companyData);

      // Founder & team paralel (Startups gibi)
      try {
        const [teamResponse, userResponse] = await Promise.all([
          axios.get(`${API_URL}/team-members/company/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          companyData.user || companyData.userId
            ? axios.get(`${API_URL}/auth/user/${companyData.user || companyData.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            : Promise.resolve({ data: { user: null } }),
        ]);

        const allMembers = teamResponse.data.teamMembers || [];
        const creator = userResponse.data.user;
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

        const extraFounders = allMembers.filter((m: any) =>
          /founder|ceo/i.test(m.title || '')
        );
        foundersList.push(
          ...extraFounders.map((m: any) => ({
            _id: m._id || m.id,
            id: m._id || m.id,
            firstName: m.firstName,
            lastName: m.lastName || '',
            title: m.title || 'N/A',
            profilePhoto: m.profilePhoto,
          }))
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
          }))
        );
      } catch (err) {
        setFounders([]);
        setTeamMembers([]);
      }

      // Products
      try {
        const productsResponse = await axios.get(
          `${API_URL}/product/company/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(productsResponse.data.products || []);
      } catch (err) {
        setProducts([]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load additional investor details. Showing available info.');
      setInvestorDetails(company);
      setApiError(true);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSendMessageClick = async () => {
    if (!investorDetails?._id) {
      Alert.alert('Error', 'Unable to start chat. Please try again.');
      return;
    }
    try {
      const payload = {
        targetCompanyId: investorDetails._id,
        title: investorDetails.companyName,
      };
      await axios.post(`${API_URL}/chats/create-session`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Chat session started!');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to start chat.');
    }
  };

  const filteredInvestors = investors.filter(item => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.companyName?.toLowerCase().includes(q) ||
      item.companyInfo?.toLowerCase().includes(q) ||
      (Array.isArray(item.companySector) ? item.companySector.join(' ').toLowerCase() : '').includes(q) ||
      item.companyAddress?.toLowerCase().includes(q)
    );
  });

  const openModal = (company: Company) => {
    setSelectedInvestor(company);
    setModalVisible(true);
    fetchInvestorDetails(company); // Startups ile aynı: modal açarken detayları çek
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedInvestor(null);
    setInvestorDetails(null);
    setFounders([]);
    setTeamMembers([]);
    setProducts([]);
    setApiError(false);
  };


  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}
      onPress={() => openModal(item)}
    >
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
                {item.companyAddress || 'N/A'}
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

          {item.companyWebsite ? (
            <TouchableOpacity style={styles.visitButton} onPress={() => Linking.openURL(item.companyWebsite)}>
              <PaperText style={styles.visitButtonText}>Visit</PaperText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <LinearGradient
        colors={['#181C2A', '#232946', '#3B82F7', '#232946']}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 1 }}
        style={styles.modalOverlay}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <PaperText style={styles.modalTitle}>
              {investorDetails?.companyName || selectedInvestor?.companyName || 'Investor Details'}
              {(investorDetails?.openForInvestments || selectedInvestor?.openForInvestments) && (
                <Icon name="rocket" size={20} color="#1A73E8" style={{ marginLeft: 8 }} />
              )}
            </PaperText>
            <TouchableOpacity onPress={closeModal}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={[
              styles.cardContainer,
              (investorDetails?.isHighlighted || selectedInvestor?.isHighlighted) && styles.highlightedCard,
              { marginTop: 0, marginBottom: 0, width: '100%' },
            ]}>
              {detailsLoading ? (
                <PaperText style={styles.loadingText}>Loading details...</PaperText>
              ) : (investorDetails || selectedInvestor) ? (
                <View style={styles.modalBody}>
                  {apiError && (
                    <PaperText style={styles.warningText}>
                      Showing basic info due to failed data fetch.
                    </PaperText>
                  )}

                  {(investorDetails?.companyLogo || selectedInvestor?.companyLogo) && (
                    <Image
                      source={{
                        uri: (investorDetails?.companyLogo ?? selectedInvestor?.companyLogo ?? '').startsWith('http')
                          ? (investorDetails?.companyLogo ?? selectedInvestor?.companyLogo ?? '')
                          : (investorDetails?.companyLogo ?? selectedInvestor?.companyLogo ?? '').startsWith('/uploads')
                            ? `${IMAGE_BASE_URL}${investorDetails?.companyLogo ?? selectedInvestor?.companyLogo ?? ''}`
                            : `${IMAGE_BASE_URL}/uploads/images/defaultCompanyLogo.png`,
                      }}
                      style={styles.modalLogo}
                      resizeMode="contain"
                    />
                  )}

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Name</PaperText>
                    <PaperText style={styles.detailValue}>
                      {investorDetails?.companyName || selectedInvestor?.companyName || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Company Type</PaperText>
                    <PaperText style={styles.detailValue}>
                      {investorDetails?.companyType || selectedInvestor?.companyType || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Sector</PaperText>
                    <PaperText style={styles.detailValue}>
                      {Array.isArray(investorDetails?.companySector ?? selectedInvestor?.companySector)
                        ? (investorDetails?.companySector ?? selectedInvestor?.companySector)?.join(', ')
                        : (investorDetails?.companySector ?? 'N/A')}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Business Model</PaperText>
                    <PaperText style={styles.detailValue}>
                      {investorDetails?.businessModel || selectedInvestor?.businessModel || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Company Size</PaperText>
                    <PaperText style={styles.detailValue}>
                      {investorDetails?.companySize || selectedInvestor?.companySize || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Business Scale</PaperText>
                    <PaperText style={styles.detailValue}>
                      {investorDetails?.businessScale || selectedInvestor?.businessScale || 'N/A'}
                    </PaperText>
                  </View>
                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Incorporated</PaperText>
                    <PaperText style={styles.detailValue}>
                      {(investorDetails?.isIncorporated || selectedInvestor?.isIncorporated) ? 'Yes' : 'No'}
                    </PaperText>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Contact Information</PaperText>
                    <View style={styles.contactContainer}>
                      <View style={styles.detail}>
                        <PaperText style={styles.detailLabel}>Address</PaperText>
                        <PaperText style={styles.detailValue}>
                          {investorDetails?.companyAddress || selectedInvestor?.companyAddress || 'N/A'}
                        </PaperText>
                      </View>

                      {(investorDetails?.companyPhone || selectedInvestor?.companyPhone) && (
                        <View style={styles.detail}>
                          <PaperText style={styles.detailLabel}>Phone</PaperText>
                          <PaperText style={styles.detailValue}>
                            {investorDetails?.companyPhone || selectedInvestor?.companyPhone}
                          </PaperText>
                        </View>
                      )}

                      {(investorDetails?.companyEmail || selectedInvestor?.companyEmail) && (
                        <View style={styles.detail}>
                          <PaperText style={styles.detailLabel}>Email</PaperText>
                          <PaperText style={styles.detailValue}>
                            {investorDetails?.companyEmail || selectedInvestor?.companyEmail}
                          </PaperText>
                        </View>
                      )}

                      <View style={styles.detail}>
                        <PaperText style={styles.detailLabel}>Website</PaperText>
                        <TouchableOpacity
                          onPress={() => {
                            const url = investorDetails?.companyWebsite ?? selectedInvestor?.companyWebsite;
                            if (url) Linking.openURL(url);
                          }}
                        >
                          <PaperText
                            style={[
                              styles.detailValue,
                              { color: (investorDetails?.companyWebsite ?? selectedInvestor?.companyWebsite) ? '#3B82F7' : '#ccc' },
                            ]}
                          >
                            {(investorDetails?.companyWebsite ?? selectedInvestor?.companyWebsite ?? 'N/A').replace(/^https?:\/\//, '')}
                          </PaperText>
                        </TouchableOpacity>
                      </View>

                      {(investorDetails?.companyLinkedIn || selectedInvestor?.companyLinkedIn ||
                        investorDetails?.companyInstagram || selectedInvestor?.companyInstagram ||
                        investorDetails?.companyTwitter || selectedInvestor?.companyTwitter) && (
                          <View style={styles.detail}>
                            <PaperText style={styles.detailLabel}>Social Media</PaperText>
                            <View style={styles.socialMediaContainer}>
                              {(investorDetails?.companyLinkedIn || selectedInvestor?.companyLinkedIn) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = investorDetails?.companyLinkedIn ?? selectedInvestor?.companyLinkedIn;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-linkedin" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                              {(investorDetails?.companyInstagram || selectedInvestor?.companyInstagram) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = investorDetails?.companyInstagram ?? selectedInvestor?.companyInstagram;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-instagram" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                              {(investorDetails?.companyTwitter || selectedInvestor?.companyTwitter) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = investorDetails?.companyTwitter ?? selectedInvestor?.companyTwitter;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-twitter" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}

                      {(investorDetails?.acceptMessages || selectedInvestor?.acceptMessages) !== false &&
                        investorDetails?._id && (
                          <TouchableOpacity style={styles.sendMessageButton} onPress={handleSendMessageClick}>
                            <PaperText style={styles.sendMessageButtonText}>Send Message</PaperText>
                          </TouchableOpacity>
                        )}
                    </View>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Summary</PaperText>
                    <PaperText style={styles.description}>
                      {(investorDetails?.companyInfo || selectedInvestor?.companyInfo || 'No summary available')
                        .split(/\r?\n/)
                        .filter(line => line.trim() !== '')
                        .map((paragraph, index) => (
                          <PaperText key={index} style={styles.description}>
                            {paragraph}
                          </PaperText>
                        ))}
                    </PaperText>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Description</PaperText>
                    <PaperText style={styles.description}>
                      {(investorDetails?.detailedDescription || selectedInvestor?.detailedDescription || 'No detailed description available')
                        .split(/\r?\n/)
                        .filter(line => line.trim() !== '')
                        .map((paragraph, index) => (
                          <PaperText key={index} style={styles.description}>
                            {paragraph}
                          </PaperText>
                        ))}
                    </PaperText>
                  </View>

                  <View style={styles.detail}>
                    <PaperText style={styles.detailLabel}>Founder</PaperText>
                    {founders.length > 0 ? (
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

                  {teamMembers.length > 0 && (
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
                    {products.length > 0 ? (
                      <View style={styles.productContainer}>
                        {products.map(p => (
                          <View key={p._id} style={styles.productCard}>
                            {p.productLogo && (
                              <Image
                                source={{
                                  uri: p.productLogo.startsWith('http')
                                    ? p.productLogo
                                    : `${IMAGE_BASE_URL}${p.productLogo}`,
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
                <PaperText style={styles.errorText}>No details available for this investor.</PaperText>
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
        keyExtractor={(item, index) => (item._id ? item._id.toString() : index.toString())}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchInvestors}
      />

      {renderModal()}
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
    width: metrics.isTablet ? Math.min(metrics.WIDTH * 0.8, 800) : SCREEN_WIDTH - 32,
    alignSelf: 'center',
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
    backgroundColor: '#fff',
  },
  placeholderLogo: {
    width: scale(36),
    height: scale(36),
    marginRight: scale(8),
    borderRadius: scale(6),
    backgroundColor: '#fff',
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
  },

  // --- MODAL STYLES (Startups ile aynı) ---
  modalOverlay: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalLogo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  errorText: {
    color: '#FF5555',
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  warningText: {
    color: '#FFD700',
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
    marginBottom: 10,
  },
  contactContainer: {
    marginTop: 8,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  socialIcon: {
    marginRight: 12,
  },
  sendMessageButton: {
    backgroundColor: '#3B82F7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 12,
  },
  sendMessageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamCard: {
    width: metrics.isTablet ? (metrics.WIDTH / 3) - 40 : (SCREEN_WIDTH - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  teamPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  teamTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  productContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: metrics.isTablet ? (metrics.WIDTH / 3) - 40 : (SCREEN_WIDTH - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  productLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});