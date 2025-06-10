import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconButton, Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';
import { Product } from '../types';
import AIBlogSection from 'components/AiBlogSection';

// Define navigation stack param list
type RootStackParamList = {
  HomeScreen: undefined;
  MarketPlace: undefined;
  HowItWorksScreen: undefined;
  InvestmentDetails: undefined;
  TalentPool: undefined;
  StartupsDetails: undefined; // Added for Startups
  InvestorDetails: undefined; // Added for Investor
  BusinessDetails: undefined; // Added for Business
  AddBlogPost: undefined; // Added for AddBlogPostScreen
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = (props: HomeScreenProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState(PRODUCTS);
  const [activeTab, setActiveTab] = useState<'blog' | 'pulse'>('blog');
  const { onMenuOpen } = props;

  const handleProductPress = (_productId: string) => {};

  const handleFavoritePress = (productId: string) => {
    setProducts(
      products.map(product =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product,
      ),
    );
  };

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        onFavoritePress={() => handleFavoritePress(item.id)}
        isUnlocked={true}
      />
    </View>
  );

  const filteredProducts = products
    .filter(
      (product: Product) =>
        product.type === 'Startups'
    )
    .slice(0, 3);

  const renderCommunitySection = () => (
    <View style={styles.communitySection}>
      <Text style={styles.sectionTitle}>Our Community</Text>
      <View style={styles.communityItems}>
        <TouchableOpacity 
          style={styles.communityItem}
          onPress={() => navigation.navigate('StartupsDetails')}
        >
          <MaterialCommunityIcons name="rocket-launch" size={24} color={Colors.lightText} />
          <Text style={styles.communityItemText}>Startups</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.communityItem}
          onPress={() => navigation.navigate('InvestorDetails')}
        >
          <MaterialCommunityIcons name="account-group" size={24} color={Colors.lightText} />
          <Text style={styles.communityItemText}>Investor</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.communityItem}
          onPress={() => navigation.navigate('BusinessDetails')}
        >
          <MaterialCommunityIcons name="store" size={24} color={Colors.lightText} />
          <Text style={styles.communityItemText}>Business</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.communityItem}
          onPress={() => navigation.navigate('MarketPlace')}
        >
          <MaterialCommunityIcons name="shopping" size={24} color={Colors.lightText} />
          <Text style={styles.communityItemText}>Marketplace</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}
    >
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Surface style={styles.header} elevation={0}>
            <View style={styles.logoAndTitleContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/images/aistartupplatform.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <IconButton
              icon="menu"
              iconColor={Colors.lightText}
              size={24}
              onPress={onMenuOpen}
              style={styles.searchButton}
            />
          </Surface>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: activeTab === 'blog' ? 'rgba(43, 64, 99, 0.8)' : 'transparent',
                borderRadius: 16,
                paddingVertical: 10,
                alignItems: 'center',
                borderWidth: activeTab === 'blog' ? 1 : 0,
                borderColor: activeTab === 'blog' ? Colors.primary : 'transparent',
              }}
              onPress={() => setActiveTab('blog')}
            >
              <Text style={{ color: Colors.lightText, fontWeight: 'bold', fontSize: 16 }}>AI Blog</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: activeTab === 'pulse' ? 'rgba(43, 64, 99, 0.8)' : 'transparent',
                borderRadius: 16,
                paddingVertical: 10,
                alignItems: 'center',
                borderWidth: activeTab === 'pulse' ? 1 : 0,
                borderColor: activeTab === 'pulse' ? Colors.primary : 'transparent',
              }}
              onPress={() => setActiveTab('pulse')}
            >
              <Text style={{ color: Colors.lightText, fontWeight: 'bold', fontSize: 16 }}>AI Pulse</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'blog' ? (
            <AIBlogSection
  
              navigation={navigation}
            />
          ) : (
            <FeaturedProduct
              product={products[0]}
              discount="AI Pulse"
              onPress={() => handleProductPress(products[0].id)}
            />
          )}

          {renderCommunitySection()}

          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            scrollEnabled={true}
            contentContainerStyle={styles.productsContent}
            style={styles.productsList}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

type HomeScreenProps = {
  onMenuOpen?: () => void;
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  logoAndTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logo: {
    width: '130%',
    height: '130%',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: Colors.lightText,
    fontSize: 20,
    lineHeight: 24,
  },
  subtitle: {
    fontWeight: '400',
    color: Colors.lightText,
    fontSize: 10,
    opacity: 0.7,
  },
  searchButton: {
    margin: 0,
  },
  productsList: {
    flex: 1,
    marginTop: 0,
  },
  productsContent: {
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  productCardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 3,
  },
  talentPoolContent: {
    flex: 1,
    marginTop: 0,
    paddingBottom: 6,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    height: 80,
    marginBottom: 15,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  imageContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 50,
    top: -5,
    left: -5,
    zIndex: 0,
    opacity: 0.8,
  },
  image: {
    width: 44,
    height: 50,
    zIndex: 1,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  type: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  brandName: {
    color: Colors.lightText,
    fontSize: 16,
    marginBottom: 2,
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
    marginTop: 35,
  },
  price: {
    color: Colors.lightText,
    fontSize: 15,
    opacity: 0.8,
  },
  tooltipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  ourCommunityButton: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.498,
    zIndex: 1001,
  },
  ourCommunityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tooltipContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tooltipImageContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.478,
  },
  tooltipImage: {
    width: 500,
    height: 500,
  },
  tooltipTextContent: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.538,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    width: 200,
  },
  communitySection: {
    paddingHorizontal: 0,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: 20,
    textAlign: 'center',
  },
  communityItems: {
    gap: 12,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    paddingHorizontal: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10,
  },
  communityItemText: {
    fontSize: 18,
    color: Colors.lightText,
    marginLeft: 12,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});

export default HomeScreen;