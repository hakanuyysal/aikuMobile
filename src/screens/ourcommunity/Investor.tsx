import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Text as PaperText, Button, Portal, Modal, TextInput as PaperTextInput } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { companyService, Company } from '../../services/companyService';
import * as ImagePicker from 'react-native-image-picker';
import type { ImageLibraryOptions, MediaType } from 'react-native-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Investor = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [investors, setInvestors] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newInvestor, setNewInvestor] = useState<Partial<Company>>({
    companyName: '',
    companyInfo: '',
    companyWebsite: '',
    companyAddress: '',
    companySector: [],
    businessModel: '',
    companySize: '',
    businessScale: '',
    openForInvestments: false
  });
  const [logoFile, setLogoFile] = useState<any>(null);

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

  const handleAddInvestor = async () => {
    const formData = new FormData();
    formData.append('companyName', newInvestor.companyName || '');
    formData.append('companyInfo', newInvestor.companyInfo || '');
    formData.append('companyWebsite', newInvestor.companyWebsite || '');
    formData.append('companyAddress', newInvestor.companyAddress || '');
    formData.append('companySector', JSON.stringify(newInvestor.companySector || []));
    formData.append('businessModel', newInvestor.businessModel || '');
    formData.append('companySize', newInvestor.companySize || '');
    formData.append('businessScale', newInvestor.businessScale || '');
    formData.append('companyType', 'Investor');

    if (logoFile) {
      formData.append('companyLogo', {
        uri: logoFile.uri,
        type: logoFile.type,
        name: logoFile.fileName || 'upload.jpg',
      });
    }

    try {
      await companyService.addStartup(formData);
      setModalVisible(false);
      setNewInvestor({
        companyName: '',
        companyInfo: '',
        companyWebsite: '',
        companyAddress: '',
        companySector: [],
        businessModel: '',
        companySize: '',
        businessScale: '',
        openForInvestments: false
      });
      setLogoFile(null);
      fetchInvestors();
      Alert.alert('Success', 'Investor added successfully.');
    } catch (error) {
      console.error('Yatırımcı eklenirken hata:', error);
      Alert.alert('Error', 'Failed to add investor.');
    }
  };

  const selectLogo = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Resim seçimi iptal edildi');
      } else if (response.errorCode) {
        console.log('ImagePicker Hatası: ', response.errorCode);
        Alert.alert('Error', 'Failed to pick image.');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setLogoFile(asset);
      } else {
        Alert.alert('Error', 'Failed to pick image.');
      }
    });
  };

  const filteredInvestors = investors.filter(
    item =>
      item.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      item.companyInfo?.toLowerCase().includes(search.toLowerCase()) ||
      item.companySector?.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity style={styles.cardContainer}>
      <LinearGradient
        colors={['#2A2F3D', '#3B82F720']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
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
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#3B82F740']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#3B82F7" />
        </TouchableOpacity>
        <PaperText style={styles.header}>Investors</PaperText>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Icon name="add-circle-outline" size={24} color="#3B82F7" />
        </TouchableOpacity>
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

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.modalGradient}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
              >
                <PaperText style={styles.modalTitle}>Add New Investor</PaperText>
                <View style={styles.modalContent}>
                  <PaperTextInput
                    label="Company Name"
                    value={newInvestor.companyName}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, companyName: text })}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />
                  <PaperTextInput
                    label="Description"
                    value={newInvestor.companyInfo}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, companyInfo: text })}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />
                  <PaperTextInput
                    label="Website"
                    value={newInvestor.companyWebsite}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, companyWebsite: text })}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />
                  <PaperTextInput
                    label="Address"
                    value={newInvestor.companyAddress}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, companyAddress: text })}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />
                  <PaperTextInput
                    label="Sectors (comma separated)"
                    value={newInvestor.companySector?.join(', ')}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, companySector: text.split(',').map(s => s.trim()) })}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />
                  <PaperTextInput
                    label="Business Model"
                    value={newInvestor.businessModel}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, businessModel: text })}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />
                  <PaperTextInput
                    label="Company Size"
                    value={newInvestor.companySize}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, companySize: text })}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />
                  <PaperTextInput
                    label="Business Scale"
                    value={newInvestor.businessScale}
                    onChangeText={(text) => setNewInvestor({ ...newInvestor, businessScale: text })}
                    style={styles.input}
                    mode="outlined"
                    theme={{ colors: { primary: '#60A5FA' } }}
                  />

                  <Button mode="outlined" onPress={selectLogo} style={styles.logoButton} labelStyle={{ color: '#60A5FA' }}>
                    {logoFile ? 'Logo Değiştir' : 'Logo Seç'}
                  </Button>
                  {logoFile && <PaperText style={styles.fileNameText}>{logoFile.fileName}</PaperText>}

                </View>
              </ScrollView>
              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => setModalVisible(false)} 
                  style={[styles.modalButton, styles.cancelButton]}
                  labelStyle={{ color: '#60A5FA' }}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleAddInvestor} 
                  style={[styles.modalButton, styles.submitButton]}
                  labelStyle={{ color: '#fff' }}
                >
                  Add Investor
                </Button>
              </View>
            </KeyboardAvoidingView>
          </LinearGradient>
        </Modal>
      </Portal>
    </LinearGradient>
  );
};

export default Investor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1A1E29',
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
  addButton: {
    marginLeft: 10,
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
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#2A2F3D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 18,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
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
  },
  modalContainer: {
    margin: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalGradient: {
    flex: 1,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingVertical: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
    marginBottom: 45,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: '#60A5FA',
    borderWidth: 2,
  },
  submitButton: {
    backgroundColor: '#60A5FA',
  },
  logoButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  fileNameText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 16,
  },
});