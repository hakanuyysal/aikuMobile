import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import BaseService from '../api/BaseService';
import Config from 'react-native-config';
// import placeholder from '../assets/images/defaultProductLogo.png'; // Comment out or remove if not found

// Use a default image URL or check if the local path is correct
const placeholder = require('../assets/images/defaultCompanyLogo.png');

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
const API_BASE_URL = Config.API_URL || 'https://api.aikuaiplatform.com';

// Update Product interface based on backend data structure
interface Product {
  _id: string;
  productName: string;
  productCategory: string;
  pricingModel: string;
  productDescription: string;
  tags: string[];
  releaseDate?: string;
  address?: string;
  phone?: string;
  email?: string;
  productLogo?: string;
  companyId: {
    companyName: string;
    _id: string;
  };
}

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await BaseService.getAllProducts();
        if (response.success) {
          setProducts(response.products || []);
        } else {
          setError(response.message || 'Ürünler yüklenirken bir hata oluştu.');
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Ürünler yüklenirken bir hata oluştu.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter(
        (product) =>
          product.productName.toLowerCase().includes(search.toLowerCase()) ||
          product.companyId.companyName.toLowerCase().includes(search.toLowerCase()) ||
          product.productCategory.toLowerCase().includes(search.toLowerCase()) ||
          product.productDescription.toLowerCase().includes(search.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      ),
    );
  }, [search, products]);

  const renderProductCard = (item: Product) => (
    <View key={item._id} style={styles.cardContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Image
            source={{
              uri: item.productLogo
                ? item.productLogo.startsWith('http')
                  ? item.productLogo
                  : `${API_BASE_URL}${item.productLogo.startsWith('/') ? '' : '/'}${item.productLogo}`
                : placeholder,
            }}
            style={styles.productImage}
            resizeMode="cover"
            defaultSource={placeholder}
          />
          <PaperText style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
            {item.productName}
          </PaperText>
          <PaperText style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
            {item.companyId.companyName}
          </PaperText>
          <PaperText style={styles.type} numberOfLines={1} ellipsizeMode="tail">
            Category: {item.productCategory}
          </PaperText>
          <PaperText style={styles.tags} numberOfLines={2} ellipsizeMode="tail">
            Tags: {item.tags ? item.tags.join(', ') : ''}
          </PaperText>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Price</PaperText>
              <PaperText style={styles.detailValue}>{item.pricingModel}</PaperText>
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
    colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
    locations={[0, 0.3, 0.6, 0.9]}
    start={{ x: 0, y: 0 }}
    end={{ x: 2, y: 1 }}
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

          {loading ? (
            <ActivityIndicator size="large" color="#3B82F7" style={{ marginTop: 20 }} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <PaperText style={styles.errorText}>Error: {error}</PaperText>
            </View>
          ) : filteredProducts.length > 0 ? (
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
    borderColor: 'rgb(255, 255, 255)',
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
    color: 'rgb(255, 255, 255)',
    fontSize: 14,
    marginBottom: 8,
  },
  type: {
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
    marginBottom: 4,
  },
  tags: {
    color: 'rgb(255, 255, 255)',
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
    color: 'rgb(255, 255, 255)',
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
    color: 'rgb(255, 255, 255)',
    textAlign: 'center',
    marginTop: 20,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    alignSelf: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
});

export default MarketplaceScreen;