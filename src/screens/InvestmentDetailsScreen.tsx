import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';

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
              <View style={[styles.progress, { width: item.funded as `${number}%` }]} />
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
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
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
    padding: metrics.padding.md,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  backButton: {
    marginRight: metrics.margin.sm,
  },
  header: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: '10%',
  },
  subtext: {
    fontSize: metrics.fontSize.sm,
    color: '#ccc',
    marginBottom: metrics.margin.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: metrics.margin.md,
    marginBottom: metrics.margin.sm,
    paddingHorizontal: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: metrics.margin.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: metrics.padding.sm,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
  },
  cardContainer: {
    width: SCREEN_WIDTH - metrics.scale(32),
    minHeight: metrics.verticalScale(180),
    marginBottom: metrics.margin.md,
    alignSelf: 'center',
    borderRadius: metrics.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: metrics.padding.md,
    marginTop: metrics.margin.md,
  },
  contentContainer: {
    padding: metrics.scale(20),
  },
  textContainer: {
    flex: 1,
  },
  type: {
    color: '#fff',
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
    marginBottom: metrics.verticalScale(14),
    paddingLeft: metrics.scale(50),
  },
  companyName: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    marginBottom: metrics.verticalScale(14),
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.verticalScale(20),
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: metrics.fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: metrics.verticalScale(4),
  },
  detailValue: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: metrics.verticalScale(10),
  },
  progressBar: {
    height: metrics.verticalScale(6),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.scale(3),
    marginBottom: metrics.verticalScale(10),
  },
  progress: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: metrics.scale(3),
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: metrics.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  fundedText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default InvestmentScreen;