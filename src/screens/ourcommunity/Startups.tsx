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
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { companyService, Company } from '../../services/companyService';
import { useFavoritesStore } from '../../store/favoritesStore';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const IMAGE_BASE_URL = 'https://api.aikuaiplatform.com';
const API_URL = 'https://api.aikuaiplatform.com/api';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

const Startups = () => {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [search, setSearch] = useState('');
  const [startups, setStartups] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Company | null>(null);
  const [startupDetails, setStartupDetails] = useState<Company | null>(null);
  const [founders, setFounders] = useState<TeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const data = await companyService.getStartups();
      console.log('Backend startup list:', data);
      const processedData = data.map(item => {
        if (!item._id && item.id) {
          return { ...item, _id: item.id };
        }
        if (!item._id) {
          console.warn(`Startup ${item.companyName} has undefined _id. Using temporary ID.`);
          return { ...item, _id: `${item.companyName}-${item.companyWebsite || 'no-website'}` };
        }
        return item;
      });
      setStartups(processedData);
    } catch (err) {
      const error = err as any;
      console.error('Error fetching startups:', error);
      Alert.alert('Error', 'Failed to load startups.');
      setStartups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStartupDetails = async (startup: Company) => {
    const startupId = startup._id;
    setApiError(false);
    setFounders([]);
    setTeamMembers([]);
    setProducts([]);
    if (!token) {
      console.error('No token available');
      Alert.alert('Error', 'Please log in again.');
      setStartupDetails(startup);
      setApiError(true);
      return;
    }
    if (!startupId || startupId.includes('-')) {
      console.error('Invalid startup ID:', startupId);
      Alert.alert('Error', 'This startup cannot be viewed.');
      setStartupDetails(startup);
      setApiError(true);
      return;
    }
    try {
      setDetailsLoading(true);
      let companyData;
      try {
        const companyResponse = await axios.get(`${API_URL}/company/${startupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        companyData = companyResponse.data.company || companyResponse.data;
      } catch (err) {
        const currentResponse = await axios.get(`${API_URL}/company/current?userId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        companyData = currentResponse.data.companies.find((c: any) => c._id === startupId) || currentResponse.data.companies[0];
      }
      if (!companyData) {
        throw new Error('No company data found');
      }
      setStartupDetails(companyData);

      // Fetch founder and team members in parallel
      try {
        const [teamResponse, userResponse] = await Promise.all([
          axios.get(`${API_URL}/team-members/company/${startupId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          companyData.user || companyData.userId
            ? axios.get(`${API_URL}/auth/user/${companyData.user || companyData.userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: { user: null } }),
        ]);

        // Process founder
        const allMembers = teamResponse.data.teamMembers || [];
        const creator = userResponse.data.user;
        const foundersList = [];

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

        // Filter additional founders from team members (those with "founder" or "ceo" in title)
        const extraFounders = allMembers.filter(m =>
          /founder|ceo/i.test(m.title || '')
        );
        foundersList.push(
          ...extraFounders.map(member => ({
            _id: member._id || member.id,
            id: member._id || member.id,
            firstName: member.firstName,
            lastName: member.lastName || '',
            title: member.title || 'N/A',
            profilePhoto: member.profilePhoto,
          }))
        );

        setFounders(foundersList);

        // Filter out team members who are not founders or the creator
        const filteredTeam = allMembers.filter(m => {
          const isCreator = creator && (m._id || m.id) === (creator._id || creator.id);
          const isExtra = /founder|ceo/i.test(m.title || '');
          return !isCreator && !isExtra;
        });
        setTeamMembers(
          filteredTeam.map(member => ({
            _id: member._id || member.id,
            id: member._id || member.id,
            firstName: member.firstName,
            lastName: member.lastName || '',
            title: member.title || 'N/A',
            profilePhoto: member.profilePhoto,
          }))
        );
      } catch (err) {
        console.error('Error fetching team data:', err);
        setFounders([]);
        setTeamMembers([]);
      }

      // Fetch products
      try {
        const productsResponse = await axios.get(`${API_URL}/product/company/${startupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedProducts = productsResponse.data.products || [];
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        Alert.alert('Warning', 'Failed to load products.');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching startup details:', err);
      Alert.alert('Error', 'Failed to load additional startup details. Showing available info.');
      setStartupDetails(startup);
      setApiError(true);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleFavorite = async (startup: Company) => {
    const startupId = startup._id;
    if (!token) {
      Alert.alert('Error', 'Please log in again.');
      return;
    }
    if (!startupId || startupId.includes('-')) {
      Alert.alert('Error', 'Cannot favorite this startup.');
      return;
    }
    if (isFavorite(startupId)) {
      try {
        await axios.delete(`${API_URL}/auth/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { type: 'company', itemId: startupId },
        });
        removeFromFavorites(startupId);
      } catch (err) {
        const error = err as any;
        console.error('Error removing favorite:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to remove from favorites.');
      }
    } else {
      try {
        await axios.post(
          `${API_URL}/auth/favorites`,
          { type: 'company', itemId: startupId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToFavorites({
          id: startupId,
          name: startup.companyName,
          description: startup.companyInfo,
          logo: startup.companyLogo,
          website: startup.companyWebsite,
          isHighlighted: startup.isHighlighted,
        });
      } catch (err) {
        const error = err as any;
        console.error('Error adding favorite:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to add to favorites.');
      }
    }
  };

  const handleSendMessageClick = async () => {
    if (!startupDetails?._id) {
      Alert.alert('Error', 'Unable to start chat. Please try again.');
      return;
    }
    try {
      const payload = {
        targetCompanyId: startupDetails._id,
        title: startupDetails.companyName,
      };
      const response = await axios.post(`${API_URL}/chats/create-session`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Chat session created:', response.data);
      Alert.alert('Success', 'Chat session started!');
    } catch (err) {
      const error = err as any;
      console.error('Error creating chat session:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to start chat.');
    }
  };

  const openModal = (startup: Company) => {
    console.log('Opening modal for startup:', startup._id, startup.companyName);
    setSelectedStartup(startup);
    setModalVisible(true);
    fetchStartupDetails(startup);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStartup(null);
    setStartupDetails(null);
    setFounders([]);
    setTeamMembers([]);
    setProducts([]);
    setApiError(false);
  };

  const filteredStartups = startups.filter(item => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.companyName?.toLowerCase().includes(q) ||
      item.companyInfo?.toLowerCase().includes(q) ||
      item.companySector?.join(' ').toLowerCase().includes(q) ||
      item.companyAddress?.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: Company }) => {
    const isCurrentlyFavorite = isFavorite(item._id);

    return (
      <TouchableOpacity
        onPress={() => openModal(item)}
        style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}
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
                onError={(e) => console.log(`Image load error for ${item.companyName}:`, e.nativeEvent.error)}
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
                onPress={() => handleToggleFavorite(item)}
              >
                <Icon
                  name={isCurrentlyFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={
                    !item._id || item._id.includes('-')
                      ? '#ccc'
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
        </View>
        <TouchableOpacity
          style={styles.visitButton}
          onPress={() => item.companyWebsite && Linking.openURL(item.companyWebsite)}
        >
          <PaperText style={styles.visitButtonText}>Visit</PaperText>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderModal = () => {
    console.log('Rendering modal with:', { startupDetails, founders, products });
    return (
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
                {startupDetails?.companyName || selectedStartup?.companyName || 'Startup Details'}
                {(startupDetails?.openForInvestments || selectedStartup?.openForInvestments) && (
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
                (startupDetails?.isHighlighted || selectedStartup?.isHighlighted) && styles.highlightedCard,
                { marginTop: 0, marginBottom: 0, width: '100%' }, // Modalda tam genişlik ve üstte boşluk olmasın
              ]}>
                {detailsLoading ? (
                  <PaperText style={styles.loadingText}>Loading details...</PaperText>
                ) : (startupDetails || selectedStartup) ? (
                  <View style={styles.modalBody}>
                    {apiError && (
                      <PaperText style={styles.warningText}>
                        Showing basic info due to failed data fetch.
                      </PaperText>
                    )}
                    {(startupDetails?.companyLogo || selectedStartup?.companyLogo) && (
                      <Image
                        source={{
                          uri: (startupDetails?.companyLogo ?? selectedStartup?.companyLogo ?? '').startsWith('http')
                            ? (startupDetails?.companyLogo ?? selectedStartup?.companyLogo ?? '')
                            : (startupDetails?.companyLogo ?? selectedStartup?.companyLogo ?? '').startsWith('/uploads')
                            ? `${IMAGE_BASE_URL}${startupDetails?.companyLogo ?? selectedStartup?.companyLogo ?? ''}`
                            : `${IMAGE_BASE_URL}/uploads/images/defaultCompanyLogo.png`,
                        }}
                        style={styles.modalLogo}
                        resizeMode="contain"
                        onError={(e) => console.log('Modal image load error:', e.nativeEvent.error)}
                      />
                    )}
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Name</PaperText>
                      <PaperText style={styles.detailValue}>
                        {startupDetails?.companyName || selectedStartup?.companyName || 'N/A'}
                      </PaperText>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Company Type</PaperText>
                      <PaperText style={styles.detailValue}>
                        {startupDetails?.companyType || selectedStartup?.companyType || 'N/A'}
                      </PaperText>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Sector</PaperText>
                      <PaperText style={styles.detailValue}>
                        {Array.isArray(startupDetails?.companySector ?? selectedStartup?.companySector)
                          ? (startupDetails?.companySector ?? selectedStartup?.companySector)?.join(', ')
                          : (startupDetails?.companySector ?? 'N/A')}
                      </PaperText>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Business Model</PaperText>
                      <PaperText style={styles.detailValue}>
                        {startupDetails?.businessModel || selectedStartup?.businessModel || 'N/A'}
                      </PaperText>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Company Size</PaperText>
                      <PaperText style={styles.detailValue}>
                        {startupDetails?.companySize || selectedStartup?.companySize || 'N/A'}
                      </PaperText>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Business Scale</PaperText>
                      <PaperText style={styles.detailValue}>
                        {startupDetails?.businessScale || selectedStartup?.businessScale || 'N/A'}
                      </PaperText>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Incorporated</PaperText>
                      <PaperText style={styles.detailValue}>
                        {(startupDetails?.isIncorporated || selectedStartup?.isIncorporated) ? 'Yes' : 'No'}
                      </PaperText>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Contact Information</PaperText>
                      <View style={styles.contactContainer}>
                        <View style={styles.detail}>
                          <PaperText style={styles.detailLabel}>Address</PaperText>
                          <PaperText style={styles.detailValue}>
                            {startupDetails?.companyAddress || selectedStartup?.companyAddress || 'N/A'}
                          </PaperText>
                        </View>
                        {(startupDetails?.companyPhone || selectedStartup?.companyPhone) && (
                          <View style={styles.detail}>
                            <PaperText style={styles.detailLabel}>Phone</PaperText>
                            <PaperText style={styles.detailValue}>
                              {startupDetails?.companyPhone || selectedStartup?.companyPhone}
                            </PaperText>
                          </View>
                        )}
                        {(startupDetails?.companyEmail || selectedStartup?.companyEmail) && (
                          <View style={styles.detail}>
                            <PaperText style={styles.detailLabel}>Email</PaperText>
                            <PaperText style={styles.detailValue}>
                              {startupDetails?.companyEmail || selectedStartup?.companyEmail}
                            </PaperText>
                          </View>
                        )}
                        <View style={styles.detail}>
                          <PaperText style={styles.detailLabel}>Website</PaperText>
                          <TouchableOpacity
                            onPress={() => {
                              const url = startupDetails?.companyWebsite ?? selectedStartup?.companyWebsite;
                              if (url) Linking.openURL(url);
                            }}
                          >
                            <PaperText
                              style={[
                                styles.detailValue,
                                { color: (startupDetails?.companyWebsite ?? selectedStartup?.companyWebsite) ? '#3B82F7' : '#ccc' },
                              ]}
                            >
                              {(startupDetails?.companyWebsite ?? selectedStartup?.companyWebsite ?? 'N/A').replace(/^https?:\/\//, '')}
                            </PaperText>
                          </TouchableOpacity>
                        </View>
                        {(startupDetails?.companyLinkedIn || selectedStartup?.companyLinkedIn ||
                          startupDetails?.companyInstagram || selectedStartup?.companyInstagram ||
                          startupDetails?.companyTwitter || selectedStartup?.companyTwitter) && (
                          <View style={styles.detail}>
                            <PaperText style={styles.detailLabel}>Social Media</PaperText>
                            <View style={styles.socialMediaContainer}>
                              {(startupDetails?.companyLinkedIn || selectedStartup?.companyLinkedIn) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = startupDetails?.companyLinkedIn ?? selectedStartup?.companyLinkedIn;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-linkedin" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                              {(startupDetails?.companyInstagram || selectedStartup?.companyInstagram) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = startupDetails?.companyInstagram ?? selectedStartup?.companyInstagram;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-instagram" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                              {(startupDetails?.companyTwitter || selectedStartup?.companyTwitter) && (
                                <TouchableOpacity
                                  onPress={() => {
                                    const url = startupDetails?.companyTwitter ?? selectedStartup?.companyTwitter;
                                    if (url) Linking.openURL(url);
                                  }}
                                >
                                  <Icon name="logo-twitter" size={24} color="#3B82F7" style={styles.socialIcon} />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}
                        {(startupDetails?.acceptMessages || selectedStartup?.acceptMessages) !== false &&
                          startupDetails?._id && (
                            <TouchableOpacity
                              style={styles.sendMessageButton}
                              onPress={handleSendMessageClick}
                            >
                              <PaperText style={styles.sendMessageButtonText}>Send Message</PaperText>
                            </TouchableOpacity>
                          )}
                      </View>
                    </View>
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Summary</PaperText>
                      <PaperText style={styles.description}>
                        {(startupDetails?.companyInfo || selectedStartup?.companyInfo || 'No summary available')
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
                        {(startupDetails?.detailedDescription || selectedStartup?.detailedDescription || 'No detailed description available')
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
                          {founders.map(founder => (
                            <View key={founder._id || founder.id} style={styles.teamCard}>
                              {founder.profilePhoto && (
                                <Image
                                  source={{
                                    uri: founder.profilePhoto.startsWith('http')
                                      ? founder.profilePhoto
                                      : founder.profilePhoto.startsWith('/uploads')
                                      ? `${IMAGE_BASE_URL}${founder.profilePhoto}`
                                      : `${IMAGE_BASE_URL}/uploads/images/default-avatar.png`,
                                  }}
                                  style={styles.teamPhoto}
                                  resizeMode="cover"
                                  onError={(e) => console.log(`Founder image error for ${founder.firstName}:`, e.nativeEvent.error)}
                                />
                              )}
                              <PaperText style={styles.teamName}>
                                {founder.firstName} {founder.lastName || ''}
                              </PaperText>
                              <PaperText style={styles.teamTitle}>{founder.title || 'N/A'}</PaperText>
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
                          {teamMembers.map(member => (
                            <View key={member._id || member.id} style={styles.teamCard}>
                              {member.profilePhoto && (
                                <Image
                                  source={{
                                    uri: member.profilePhoto.startsWith('http')
                                      ? member.profilePhoto
                                      : member.profilePhoto.startsWith('/uploads')
                                      ? `${IMAGE_BASE_URL}${member.profilePhoto}`
                                      : `${IMAGE_BASE_URL}/uploads/images/default-avatar.png`,
                                  }}
                                  style={styles.teamPhoto}
                                  resizeMode="cover"
                                  onError={(e) => console.log(`Team member image error for ${member.firstName}:`, e.nativeEvent.error)}
                                />
                              )}
                              <PaperText style={styles.teamName}>
                                {member.firstName} {member.lastName || ''}
                              </PaperText>
                              <PaperText style={styles.teamTitle}>{member.title || 'N/A'}</PaperText>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    <View style={styles.detail}>
                      <PaperText style={styles.detailLabel}>Products</PaperText>
                      {products.length > 0 ? (
                        <View style={styles.productContainer}>
                          {products.map(product => (
                            <View key={product._id} style={styles.productCard}>
                              {product.productLogo && (
                                <Image
                                  source={{
                                    uri: product.productLogo.startsWith('http')
                                      ? product.productLogo
                                      : `${IMAGE_BASE_URL}${product.productLogo}`,
                                  }}
                                  style={styles.productLogo}
                                  resizeMode="contain"
                                  onError={(e) => console.log(`Product image error for ${product.productName}:`, e.nativeEvent.error)}
                                />
                              )}
                              <PaperText style={styles.productName}>{product.productName}</PaperText>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <PaperText style={styles.warningText}>No products available.</PaperText>
                      )}
                    </View>
                  </View>
                ) : (
                  <PaperText style={styles.errorText}>No details available for this startup.</PaperText>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    );
  };

  return (
    <LinearGradient
      colors={['#181C2A', '#232946', '#3B82F7', '#232946']}
      locations={[0, 0.4, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>Startups</PaperText>
          <View style={styles.placeholder} />
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

        {renderModal()}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 32 : 0,
    paddingHorizontal: 16,
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
  placeholder: {
    width: 34,
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
    width: SCREEN_WIDTH - 32,
    marginLeft: 16,
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
    marginBottom: 5,
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
  modalOverlay: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
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
  modalBody: {
    marginBottom: 20,
  },
  modalLogo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 12,
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
  socialMediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  socialIcon: {
    marginRight: 12,
  },
  contactContainer: {
    marginTop: 8,
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
    width: (SCREEN_WIDTH - 80) / 2,
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
    width: (SCREEN_WIDTH - 80) / 2,
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

export default Startups;
