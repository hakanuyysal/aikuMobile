import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const businessesData = [
  {
    id: '1',
    name: 'TechSolutions Inc.',
    location: 'Silicon Valley, CA, USA',
    sector: 'AI & Machine Learning, Software Development',
    description: 'TechSolutions Inc. provides AI-powered software solutions for enterprise automation, specializing in workflow optimization and data analytics to enhance business efficiency.',
    link: 'https://techsolutions.com'
  },
  {
    id: '2',
    name: 'GreenWave Technologies',
    location: 'Munich, Germany',
    sector: 'Energy, AI & Machine Learning',
    description: 'GreenWave Technologies develops AI-driven energy management systems for sustainable business operations, focusing on renewable energy integration and efficiency.',
    link: 'https://greenwavetech.de'
  },
  {
    id: '3',
    name: 'SmartRetail Solutions',
    location: 'Tokyo, Japan',
    sector: 'AI & Machine Learning, Retail',
    description: 'SmartRetail Solutions offers AI-based tools for inventory management and customer analytics, helping retailers optimize operations and enhance customer experiences.',
    link: 'https://smartretail.jp'
  },
  {
    id: '4',
    name: 'HealthTech Innovations',
    location: 'Boston, MA, USA',
    sector: 'Healthcare, AI & Machine Learning',
    description: 'HealthTech Innovations leverages AI to streamline healthcare operations, offering solutions for patient data management and predictive diagnostics.',
    link: 'https://healthtechinnovations.com'
  },
  {
    id: '5',
    name: 'ChainSecure',
    location: 'Dubai, UAE',
    sector: 'Blockchain, Cybersecurity',
    description: 'ChainSecure provides blockchain-based cybersecurity solutions for businesses, ensuring secure transactions and data integrity across digital platforms.',
    link: 'https://chainsecure.ae'
  }
];

const Business = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filteredBusinesses = businessesData.filter(
    item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.cardContainer}>
      <LinearGradient
        colors={['#2A2F3D', '#3B82F720']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.contentContainer}>
          <PaperText style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </PaperText>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Location</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.location}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Sector</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                {item.sector}
              </PaperText>
            </View>
          </View>
          <PaperText style={styles.description} numberOfLines={3} ellipsizeMode="tail">
            {item.description}
          </PaperText>
          <TouchableOpacity
            style={styles.visitButton}
            onPress={() => Linking.openURL(item.link)}
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
        <PaperText style={styles.header}>Businesses</PaperText>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filteredBusinesses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

export default Business;

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
  companyName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
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
});