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
import { Colors } from 'constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PortfolioInvestment {
  id: string;
  company: string;
  investedAmount: string;
  currentValue: string;
  returns: string;
  status: 'Active' | 'Exited';
}

const portfolioInvestments: PortfolioInvestment[] = [
  {
    id: '1',
    company: 'Aloha Dijital Bilişim Eğitim ve Danışmanlık AŞ',
    investedAmount: '$10,000',
    currentValue: '$12,500',
    returns: '+25%',
    status: 'Active',
  },
  {
    id: '2',
    company: 'TechAI Innovations',
    investedAmount: '$5,000',
    currentValue: '$4,800',
    returns: '-4%',
    status: 'Active',
  },
  {
    id: '3',
    company: 'SmartAI Solutions',
    investedAmount: '$8,000',
    currentValue: '$8,000',
    returns: '0%',
    status: 'Exited',
  },
];

const PortfolioScreen: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Exited'>('All');

  const filteredInvestments = portfolioInvestments.filter(
    (investment) =>
      (filter === 'All' || investment.status === filter) &&
      investment.company.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filteredInvestments
    .reduce((sum, inv) => sum + parseFloat(inv.currentValue.replace('$', '').replace(',', '')), 0)
    .toFixed(2);

  const totalReturns = filteredInvestments
    .reduce((sum, inv) => {
      const returns = parseFloat(inv.returns.replace('%', ''));
      return sum + (isNaN(returns) ? 0 : returns);
    }, 0)
    .toFixed(2);

  const renderPortfolioCard = (item: PortfolioInvestment) => (
    <TouchableOpacity
      key={item.id}
      style={styles.cardContainer}
      onPress={() => {
        // Navigate to a detailed investment view (not implemented here)
      }}
    >
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <PaperText style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
            {item.company}
          </PaperText>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Invested</PaperText>
              <PaperText style={styles.detailValue}>{item.investedAmount}</PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Current Value</PaperText>
              <PaperText style={styles.detailValue}>{item.currentValue}</PaperText>
            </View>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Returns</PaperText>
              <PaperText
                style={[
                  styles.detailValue,
                  { color: item.returns.startsWith('-') ? '#FF4C4C' : '#34C759' },
                ]}
              >
                {item.returns}
              </PaperText>
            </View>
          </View>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, item.status === 'Exited' && styles.disabledButton]}
              disabled={item.status === 'Exited'}
              onPress={() => {
                // Logic to add funds (e.g., navigate to add funds screen)
              }}
            >
              <PaperText style={styles.actionText}>Add Funds</PaperText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, item.status === 'Exited' && styles.disabledButton]}
              disabled={item.status === 'Exited'}
              onPress={() => {
                // Logic to exit investment (e.g., confirm exit)
              }}
            >
              <PaperText style={styles.actionText}>Exit</PaperText>
            </TouchableOpacity>
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
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>My Portfolio</PaperText>
        </View>

        <View style={styles.overviewContainer}>
          <PaperText style={styles.overviewTitle}>Portfolio Overview</PaperText>
          <View style={styles.overviewDetails}>
            <View style={styles.overviewItem}>
              <PaperText style={styles.overviewLabel}>Total Value</PaperText>
              <PaperText style={styles.overviewValue}>${totalValue}</PaperText>
            </View>
            <View style={styles.overviewItem}>
              <PaperText style={styles.overviewLabel}>Total Returns</PaperText>
              <PaperText
                style={[
                  styles.overviewValue,
                  { color: parseFloat(totalReturns) < 0 ? '#FF4C4C' : '#34C759' },
                ]}
              >
                {totalReturns}%
              </PaperText>
            </View>
            <View style={styles.overviewItem}>
              <PaperText style={styles.overviewLabel}>Investments</PaperText>
              <PaperText style={styles.overviewValue}>{filteredInvestments.length}</PaperText>
            </View>
          </View>
        </View>

        <View style={styles.filterContainer}>
          {['All', 'Active', 'Exited'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filter === status && styles.activeFilterButton,
              ]}
              onPress={() => setFilter(status as 'All' | 'Active' | 'Exited')}
            >
              <PaperText
                style={[
                  styles.filterText,
                  filter === status && styles.activeFilterText,
                ]}
              >
                {status}
              </PaperText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search portfolio..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredInvestments.length > 0 ? (
            filteredInvestments.map((investment) => renderPortfolioCard(investment))
          ) : (
            <PaperText style={styles.noResultsText}>No investments found.</PaperText>
          )}
        </ScrollView>
      </SafeAreaView>
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
    marginLeft: '30%',
  },
  overviewContainer: {
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  overviewDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
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
    width: SCREEN_WIDTH - 32,
    minHeight: 200,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 18,
  },
  contentContainer: {
    padding: 20,
  },
  textContainer: {
    flex: 1,
  },
  companyName: {
    color: Colors.lightText,
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  noResultsText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PortfolioScreen;