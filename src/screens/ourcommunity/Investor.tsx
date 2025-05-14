import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const investorsData = [
  {
    id: '1',
    name: 'Vision Capital',
    location: 'San Francisco, CA, USA',
    sector: 'AI & Machine Learning, Technology',
    description: 'Vision Capital is a venture capital firm specializing in early-stage AI and technology startups. They focus on innovative solutions with high growth potential, providing funding and strategic guidance.',
    link: 'https://visioncapital.vc'
  },
  {
    id: '2',
    name: 'TechTrend Investments',
    location: 'London, England, United Kingdom',
    sector: 'AI & Machine Learning, Fintech',
    description: 'TechTrend Investments supports fintech and AI startups with a focus on disruptive technologies. They offer capital, mentorship, and access to a global network of industry leaders.',
    link: 'https://techtrendinvest.com'
  },
  {
    id: '3',
    name: 'Innovate Ventures',
    location: 'Berlin, Germany',
    sector: 'AI & Machine Learning, Healthcare',
    description: 'Innovate Ventures invests in AI-driven healthcare solutions, aiming to transform patient care and medical research through cutting-edge technology and innovation.',
    link: 'https://innovateventures.de'
  },
  {
    id: '4',
    name: 'Future Fund',
    location: 'Singapore',
    sector: 'AI & Machine Learning, Blockchain',
    description: 'Future Fund is a global investment firm focusing on AI and blockchain startups. They provide funding and resources to help companies scale and succeed in competitive markets.',
    link: 'https://futurefund.sg'
  },
  {
    id: '5',
    name: 'AI Growth Partners',
    location: 'New York, NY, USA',
    sector: 'AI & Machine Learning, Cybersecurity',
    description: 'AI Growth Partners specializes in AI and cybersecurity investments, supporting companies that enhance digital security through advanced machine learning technologies.',
    link: 'https://aigrowthpartners.com'
  }
];

const Investor = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filteredInvestors = investorsData.filter(
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
        <PaperText style={styles.header}>Investors</PaperText>
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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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