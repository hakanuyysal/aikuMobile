import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput, Image, Alert } from 'react-native';
import { Text as PaperText, Button, Portal, Modal, TextInput as PaperTextInput } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { companyService, Company } from '../../services/companyService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Startups = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [startups, setStartups] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStartup, setNewStartup] = useState<Partial<Company>>({
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

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const data = await companyService.getStartups();
      const fixedData = (Array.isArray(data) ? data : []).map(item => {
        let id: any = item._id;
        if (id && typeof id === 'object' && '$oid' in id) {
          id = id.$oid;
        }
        return {
          ...item,
          _id: id
        };
      });
      setStartups(fixedData);
    } catch (error) {
      Alert.alert('Hata', 'Startup\'lar yüklenirken bir hata oluştu.');
      setStartups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStartup = async () => {
    try {
      await companyService.addStartup(newStartup);
      setModalVisible(false);
      fetchStartups();
      Alert.alert('Başarılı', 'Startup başarıyla eklendi.');
    } catch (error) {
      Alert.alert('Hata', 'Startup eklenirken bir hata oluştu.');
    }
  };

  const filteredStartups = (startups || []).filter(
    item =>
      item.companyName.toLowerCase().includes(search.toLowerCase()) ||
      item.companyInfo.toLowerCase().includes(search.toLowerCase())
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
            {item.companyLogo && (
              <Image
                source={{ uri: item.companyLogo }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            )}
            <PaperText style={styles.companyName}>
              {item.companyName}
            </PaperText>
          </View>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Location</PaperText>
              <PaperText style={styles.detailValue}>
                {item.companyAddress}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Sector</PaperText>
              <PaperText style={styles.detailValue}>
                {item.companySector.join(', ')}
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
        <PaperText style={styles.header}>Startups</PaperText>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Icon name="add-circle-outline" size={24} color="#3B82F7" />
        </TouchableOpacity>
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
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <PaperText style={styles.modalTitle}>Add New Startup</PaperText>
          <PaperTextInput
            label="Company Name"
            value={newStartup.companyName}
            onChangeText={(text) => setNewStartup({ ...newStartup, companyName: text })}
            style={styles.input}
          />
          <PaperTextInput
            label="Description"
            value={newStartup.companyInfo}
            onChangeText={(text) => setNewStartup({ ...newStartup, companyInfo: text })}
            multiline
            style={styles.input}
          />
          <PaperTextInput
            label="Website"
            value={newStartup.companyWebsite}
            onChangeText={(text) => setNewStartup({ ...newStartup, companyWebsite: text })}
            style={styles.input}
          />
          <PaperTextInput
            label="Address"
            value={newStartup.companyAddress}
            onChangeText={(text) => setNewStartup({ ...newStartup, companyAddress: text })}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleAddStartup} style={styles.modalButton}>
              Add Startup
            </Button>
          </View>
        </Modal>
      </Portal>
    </LinearGradient>
  );
};

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
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
  },
  companyName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  detailsContainer: {
    flexDirection: 'column',
    marginBottom: 15,
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
  addButton: {
    marginLeft: 10,
  },
  modalContainer: {
    backgroundColor: '#2A2F3D',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    marginLeft: 10,
  },
});

export default Startups;