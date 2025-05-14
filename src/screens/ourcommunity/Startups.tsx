import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Linking, TextInput } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const startupsData = [
  {
    id: '1',
    name: 'Turkau Mining',
    location: 'Uzbekistan',
    sector: 'Energy, Technology',
    description: 'Turkau Mining specializes in gold and mineral exploration, extraction, and processing within Uzbekistan. The company focuses on sustainability and technological advancement in its operations. Turkau Mining is committed to responsible resource management and contributing to the economic development.',
    link: 'https://turkaumining.uz'
  },
  {
    id: '2',
    name: 'Aloha Dijital',
    location: 'Marmara Üniversitesi Teknopark, İstanbul',
    sector: 'AI & Machine Learning, Technology, Education',
    description: 'Aloha Dijital is a software company located in Teknopark. It focuses on strengthening the digital presence of businesses and providing them with a competitive advantage. The company leverages its experience and expert team to deliver these services.',
    link: 'https://alohadijital.com'
  },
  {
    id: '3',
    name: 'Merge Turk Gold',
    location: 'Ghana',
    sector: 'Energy',
    description: 'Merge Turk Gold is a nature-friendly gold mining company operating in Ghana. The company specializes in alluvion and rock mining, emphasizing the preservation of the environment. Merge Turk Gold strives to balance efficient mining practices with ecological responsibility.',
    link: 'https://mergeturkgold.com'
  },
  {
    id: '4',
    name: 'beSirius',
    location: 'Amsterdam, Noord-Holland, The Netherlands',
    sector: 'AI & Machine Learning, Manufacturing',
    description: 'beSirius provides an AI-driven platform for managing sustainability data in industries.',
    link: 'https://besirius.com'
  },
  {
    id: '5',
    name: 'Ember',
    location: 'London, England, United Kingdom',
    sector: 'AI & Machine Learning, Finance',
    description: 'Ember is a software platform to automate the accounting process for SMEs.',
    link: 'https://ember.co'
  },
  {
    id: '6',
    name: 'pyannoteAI',
    location: 'Paris, France',
    sector: 'AI & Machine Learning',
    description: 'pyannoteAI offers a speaker intelligence and diarization platform for developers. It specializes in detecting segment labels and separating speakers across various languages. The company provides tools for advanced audio analysis and speaker identification.',
    link: 'https://pyannote.ai'
  },
  {
    id: '7',
    name: 'Qevlar AI',
    location: 'Paris, Ile-de-France, France',
    sector: 'Cybersecurity, AI & Machine Learning',
    description: "Qevlar specializes in autonomous security operations center solutions to enrich, investigate, contextualize, and triage security alerts, enhancing defense mechanisms and overall SOC performance. Qevlar AI's platform integrates seamlessly with existing security infrastructures, automating Level 1 analyst tasks without manual intervention, thereby enhancing efficiency and accuracy in threat analysis.",
    link: 'https://qevlar.ai'
  },
  {
    id: '8',
    name: 'Etiq AI',
    location: 'London, England, United Kingdom',
    sector: 'AI & Machine Learning',
    description: 'Etiq AI assists data scientists by providing debugging across the full ML pipeline. It offers real-time testing as users code and learns how they work. Etiq AI aims to reduce pressure on data scientists.',
    link: 'https://etiq.ai'
  },
  {
    id: '9',
    name: 'Auquan',
    location: 'London, England, United Kingdom',
    sector: 'AI & Machine Learning, Finance',
    description: 'Auquan is a fintech company that uses AI and machine learning to help investment professionals make better decisions by turning unstructured data into actionable financial insights.',
    link: 'https://auquan.com'
  },
  {
    id: '10',
    name: 'TON Provider',
    location: 'Dufourstrasee 43, 8008 Zürich',
    sector: 'AI & Machine Learning, Blockchain & Cryptocurrency',
    description: 'TON DC is an internet company that operates as a decentralized network data center, supporting the dynamic development of the TON ecosystem.',
    link: 'https://tonprovider.com'
  }
];

const Startups = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filteredStartups = startupsData.filter(
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
          <PaperText style={styles.companyName}>
            {item.name}
          </PaperText>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Location</PaperText>
              <PaperText style={styles.detailValue}>
                {item.location}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Sector</PaperText>
              <PaperText style={styles.detailValue}>
                {item.sector}
              </PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Description</PaperText>
              <PaperText style={styles.description}>
                {item.description}
              </PaperText>
            </View>
          </View>
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
        <PaperText style={styles.header}>Startups</PaperText>
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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

export default Startups;

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
});