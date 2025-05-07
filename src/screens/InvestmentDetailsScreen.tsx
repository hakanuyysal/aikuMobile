import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Investment {
  id: string;
  company: string;
  product: string;
  deadline: string;
  minInvestment: string;
  funded: string;
  completed: string;
  goal: string;
}

const investments: Investment[] = [
  {
    id: '1',
    company: 'Aloha Dijital Bilişim Eğitim ve Danışmanlık AŞ',
    product: 'Aloha Live App',
    deadline: '29.04.2025',
    minInvestment: '$195',
    funded: '0%',
    completed: '$0',
    goal: '$100,000',
  },
];

const InvestmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const renderInvestmentCard = (item: Investment) => (
    <TouchableOpacity key={item.id} style={styles.cardContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <PaperText style={styles.type} numberOfLines={1} ellipsizeMode="tail">
            Investment Opportunity
          </PaperText>
          <PaperText style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
            {item.company}
          </PaperText>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Min Investment</PaperText>
              <PaperText style={styles.detailValue}>{item.minInvestment}</PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Deadline</PaperText>
              <PaperText style={styles.detailValue}>{item.deadline}</PaperText>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: item.funded }]} />
            </View>
            <View style={styles.progressDetails}>
              <PaperText style={styles.progressText}>
                {item.completed} of {item.goal}
              </PaperText>
              <PaperText style={styles.fundedText}>{item.funded} Funded</PaperText>
            </View>
          </View>
        </View>
      </View>
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
        <PaperText style={styles.header}>Investment Opportunities</PaperText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <PaperText style={styles.subtext}>
          Discover and invest in promising AI startups with high growth potential.
        </PaperText>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search investments..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {investments.map((investment) => renderInvestmentCard(investment))}
      </ScrollView>
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
    marginLeft: '10%',
  },
  subtext: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    marginBottom: 8,
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
    color: Colors.lightText,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 32, // Increased width by reducing margin
    minHeight: 180, // Increased minHeight from 150 to 180
    marginBottom: 18, // Slightly increased marginBottom
    alignSelf: 'center',
    borderRadius: 14, // Slightly larger borderRadius
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 18, // Slightly increased marginTop
  },
  contentContainer: {
    padding: 20, // Increased padding from 16 to 20
  },
  textContainer: {
    flex: 1,
  },
  type: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 20, // Increased from 18 to 20
    fontWeight: '600',
    marginBottom: 4, // Increased from 2 to 4
  },
  companyName: {
    color: Colors.lightText,
    fontSize: 15, // Increased from 16 to 18
    marginBottom: 14, // Increased from 12 to 14
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20, // Increased from 16 to 20
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14, // Increased from 12 to 14
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4, // Increased from 2 to 4
  },
  detailValue: {
    fontSize: 18, // Increased from 16 to 18
    color: Colors.lightText,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 10, // Increased from 8 to 10
  },
  progressBar: {
    height: 6, // Increased from 4 to 6
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3, // Increased from 2 to 3
    marginBottom: 10, // Increased from 8 to 10
  },
  progress: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3, // Increased from 2 to 3
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14, // Increased from 12 to 14
    color: 'rgba(255,255,255,0.6)',
  },
  fundedText: {
    fontSize: 14, // Increased from 12 to 14
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default InvestmentScreen;