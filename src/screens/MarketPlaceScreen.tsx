import React, { useState, useEffect } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';

// Define navigation stack param list
type RootStackParamList = {
  HomeScreen: undefined;
  MarketplaceScreen: undefined;
  MarketPlaceProductDetails: { product: Product };
  HowItWorksScreen: undefined;
  InvestmentDetails: undefined;
  TalentPool: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Product {
  id: string;
  company: string;
  name: string;
  category: string;
  price: string;
  description: string;
  tags: string;
  releaseDate: string;
  address: string;
  phone: string;
  email: string;
}

const products: Product[] = [
  {
    id: '1',
    company: 'Aloha Dijital Bilişim',
    name: 'Aloha Live App',
    category: 'AI',
    price: 'Freemium',
    description: 'A real-time AI-powered collaboration tool.',
    tags: 'live streaming, social networking, video broadcasting, interactive platform, community',
    releaseDate: '15.03.2025',
    address: 'Marmara Üniversitesi Teknopark, Başıbüyük Mah. Süreyyapaşa Başıbüyük Yolu Sk. 4/1 İç Kapı No:1 Maltepe/İstanbul',
    phone: '+908507579427',
    email: 'support@alohalive.online',
  },
  {
    id: '2',
    company: 'Aloha Dijital',
    name: 'PDI AI',
    category: 'AI',
    price: 'One-time Payment',
    description: 'PDI AI is an AI solution designed to securely optimize document processes for businesses, focusing on innovation and efficiency.',
    tags: 'AI, Document Processing, Optimization, Security, Efficiency',
    releaseDate: '01.01.2025',
    address: 'Marmara Üniversitesi Teknopark, Başıbüyük Mah. Süreyyapaşa Başıbüyük Yolu Sk. 4/1 İç Kapı No:1 Maltepe/İstanbul',
    phone: '+908507579427',
    email: 'orkide@alohalive.online',
  },
  {
    id: '3',
    company: 'QuantumLabs',
    name: 'Quantum Analytics',
    category: 'Data Analytics',
    price: '$299',
    description: 'Advanced AI-driven data insights.',
    tags: 'AI, Data Analysis, Insights, Automation',
    releaseDate: '10.02.2025',
    address: 'QuantumLabs HQ, 123 Tech Street, Istanbul',
    phone: '+905551234567',
    email: 'info@quantumlabs.com',
  },
];

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    setFilteredProducts(
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.company.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase()) ||
          product.tags.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search]);

  const renderProductCard = (item: Product) => (
    <View key={item.id} style={styles.cardContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <PaperText style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </PaperText>
          <PaperText style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
            {item.company}
          </PaperText>
          <PaperText style={styles.type} numberOfLines={1} ellipsizeMode="tail">
            Category: {item.category}
          </PaperText>
          <PaperText style={styles.tags} numberOfLines={2} ellipsizeMode="tail">
            Tags: {item.tags}
          </PaperText>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Price</PaperText>
              <PaperText style={styles.detailValue}>{item.price}</PaperText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('MarketPlaceProductDetails', { product: item })}
          >
            <PaperText style={styles.detailsButtonText}>Details</PaperText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#3B82F740']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>AI Marketplace</PaperText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <PaperText style={styles.headerSubtitle} numberOfLines={2} ellipsizeMode="tail">
            Powering the Next Generation of Innovation
          </PaperText>
          <PaperText style={styles.subtext}>
            Welcome to the marketplace for AI startups. Connect with investors, customers, and
            partners to grow your AI models, applications, or automation tools.
          </PaperText>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <PaperText style={styles.sectionTitle}>Products</PaperText>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => renderProductCard(product))
          ) : (
            <PaperText style={styles.noResults}>No products found.</PaperText>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1E29',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
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
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    minHeight: 140,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 14,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  contentContainer: {
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  productName: {
    color: Colors.lightText,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  companyName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  type: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginBottom: 4,
  },
  tags: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.lightText,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: '#3B82F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  noResults: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MarketplaceScreen;