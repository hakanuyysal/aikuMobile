import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text as PaperText, IconButton, Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';
import CategoryButton from '../components/CategoryButton';
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

// Update the categories array to remove Marketplace
const categories = ['Our Community', 'Resources'];

// Update subcategories to include Marketplace under Our Community
const subcategories = {
  'Our Community': ['Startups', 'Investor', 'Business', 'Marketplace'],
  'Resources': ['Talent Pool', 'Investment Opportunities', 'How It Works ?'],
};

const HomeScreen = (props: HomeScreenProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts] = useState(PRODUCTS);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipCategory, setTooltipCategory] = useState('Our Community');
  const [hasSeenTooltips, setHasSeenTooltips] = useState(false);
  const [activeTab, setActiveTab] = useState<'blog' | 'pulse'>('blog');
  const { onMenuOpen } = props;

  useEffect(() => {
    const initializeState = async () => {
      try {
        // Check if tooltips have been seen
        const hasSeenTooltipsValue = await AsyncStorage.getItem('hasSeenTooltips');
        if (hasSeenTooltipsValue !== null) {
          setHasSeenTooltips(true);
          setIsTooltipVisible(false);
        } else {
          setIsTooltipVisible(true);
          setTooltipCategory('Our Community');
        }

        // Check for saved activeCategory
        const savedCategory = await AsyncStorage.getItem('activeCategory');
        if (savedCategory !== null) {
          setActiveCategory(savedCategory);
        } else {
          setActiveCategory('Startups'); // Default to Startups
        }
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
        setActiveCategory('Startups'); // Fallback to Startups on error
      }
    };

    initializeState();
  }, []);

  const closeTooltip = async () => {
    if (tooltipCategory === 'Our Community') {
      setTooltipCategory('Resources');
      setIsTooltipVisible(true);
    } else if (tooltipCategory === 'Resources') {
      setTooltipCategory('Marketplace');
      setIsTooltipVisible(true);
    } else {
      setIsTooltipVisible(false);
      setTooltipCategory('');
      try {
        await AsyncStorage.setItem('hasSeenTooltips', 'true');
        setHasSeenTooltips(true);
      } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
      }
    }
  };

  const handleCategoryPress = async (category: string) => {
    if (category === 'Our Community' || category === 'Resources') {
      if (selectedCategory === category && dropdownVisible) {
        setDropdownVisible(false);
        setSelectedCategory(null);
      } else {
        setSelectedCategory(category);
        setDropdownVisible(true);
      }
    } else {
      setActiveCategory(category);
      setDropdownVisible(false);
      setSelectedCategory(null);
      try {
        await AsyncStorage.setItem('activeCategory', category);
      } catch (error) {
        console.error('Error saving activeCategory to AsyncStorage:', error);
      }
    }
  };

  // Update handleSubcategoryPress to include Marketplace navigation
  const handleSubcategoryPress = async (subcategory: string) => {
    setDropdownVisible(false);
    setSelectedCategory(null);
    
    // Navigate to specific detail screens based on subcategory
    if (subcategory === 'Startups') {
      navigation.navigate('StartupsDetails');
    } else if (subcategory === 'Investor') {
      navigation.navigate('InvestorDetails');
    } else if (subcategory === 'Business') {
      navigation.navigate('BusinessDetails');
    } else if (subcategory === 'Marketplace') {
      navigation.navigate('MarketPlace');
    } else if (subcategory === 'How It Works ?') {
      navigation.navigate('HowItWorksScreen');
    } else if (subcategory === 'Investment Opportunities') {
      navigation.navigate('InvestmentDetails');
    } else if (subcategory === 'Talent Pool') {
      navigation.navigate('TalentPool');
    } else {
      setActiveCategory(subcategory);
      try {
        await AsyncStorage.setItem('activeCategory', subcategory);
      } catch (error) {
        console.error('Error saving activeCategory to AsyncStorage:', error);
      }
    }
  };

  const handleMenuOpen = () => {
    if (onMenuOpen) {
      onMenuOpen();
    }
  };

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
      />
    </View>
  );

  const filteredProducts = products
    .filter(
      (product: Product) =>
        product.type === activeCategory || activeCategory === 'Startups'
    )
    .slice(0, 3);

  const renderTalentPoolCard = () => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigation.navigate('TalentPool')}
    >
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
            style={styles.spotlight}
            start={{ x: 0.4, y: 1 }}
            end={{ x: 0, y: 0.2 }}
          />
          <Image
            source={require('../assets/images/aidevedu.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <PaperText style={styles.type} numberOfLines={1} ellipsizeMode="tail">
              Training
            </PaperText>
            <PaperText style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
              AI Developer Training
            </PaperText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Update the getTooltipContent function to remove Marketplace tooltip
  const getTooltipContent = () => {
    switch (tooltipCategory) {
      case 'Our Community':
        return {
          text: 'You can look at startups, investors, businesses and marketplace here.',
          buttonLeft: SCREEN_WIDTH * 0.083,
          textLeft: SCREEN_WIDTH * 0.361,
          imageLeft: SCREEN_WIDTH * -0.306,
          marginTop: SCREEN_HEIGHT * -0.03,
        };
      case 'Resources':
        return {
          text: 'Explore talent pools, investment opportunities, and how it works.',
          buttonLeft: SCREEN_WIDTH * 0.38,
          textLeft: SCREEN_WIDTH * 0.495,
          imageLeft: SCREEN_WIDTH * -0.075,
          marginTop: SCREEN_HEIGHT * -0.03,
        };
      default:
        return {
          text: '',
          buttonLeft: SCREEN_WIDTH * 0.083,
          textLeft: SCREEN_WIDTH * 0.361,
          imageLeft: SCREEN_WIDTH * -0.306,
          marginTop: SCREEN_HEIGHT * -0.16,
        };
    }
  };

  const tooltipContent = getTooltipContent();

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
              onPress={handleMenuOpen}
              style={styles.searchButton}
            />
          </Surface>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: activeTab === 'blog' ? Colors.cardBackground : 'transparent',
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
                backgroundColor: activeTab === 'pulse' ? Colors.cardBackground : 'transparent',
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
              title="AI Blog"
              navigation={navigation}
            />
          ) : (
            <FeaturedProduct
              product={products[0]}
              discount="AI Pulse"
              onPress={() => handleProductPress(products[0].id)}
            />
          )}

          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesContent}>
              {categories.map((item, index) => (
                <View
                  key={item}
                  style={[
                    styles.categoryButtonWrapper,
                    index === 0 && styles.firstCategory,
                    index === 1 && styles.centerCategory,
                    index === 2 && styles.lastCategory,
                  ]}
                >
                  <CategoryButton
                    title={item}
                    isActive={activeCategory === item || selectedCategory === item}
                    onPress={() => handleCategoryPress(item)}
                  />
                </View>
              ))}
            </View>
            {dropdownVisible && selectedCategory && (
              <View style={styles.dropdownContainer}>
                {subcategories[selectedCategory as keyof typeof subcategories].map((subcategory: string) => (
                  <TouchableOpacity
                    key={subcategory}
                    style={styles.subcategoryItem}
                    onPress={() => handleSubcategoryPress(subcategory)}
                  >
                    <PaperText style={styles.subcategoryText}>
                      {subcategory}
                    </PaperText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {isTooltipVisible && tooltipCategory && !hasSeenTooltips && (
            <Modal
              transparent={true}
              visible={isTooltipVisible}
              animationType="fade"
              onRequestClose={closeTooltip}
            >
              <TouchableOpacity
                style={styles.tooltipOverlay}
                activeOpacity={1}
                onPress={closeTooltip}
              >
                <View style={[styles.ourCommunityButton, { left: tooltipContent.buttonLeft }]}>
                  <Text style={[styles.ourCommunityText, { marginTop: tooltipContent.marginTop }]}>
                    {tooltipCategory}
                  </Text>
                </View>
                <View style={styles.tooltipContainer}>
                  <View style={[styles.tooltipImageContainer, { left: tooltipContent.imageLeft }]}>
                    <Image
                      source={require('../assets/images/Tooltipaihands.png')}
                      style={styles.tooltipImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={[styles.tooltipTextContent, { left: tooltipContent.textLeft }]}>
                    <Text style={styles.tooltipText}>
                      {tooltipContent.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          )}

          {activeCategory === 'Talent Pool' ? (
            <View style={styles.talentPoolContent}>
              {renderTalentPoolCard()}
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={item => item.id}
              scrollEnabled={true}
              contentContainerStyle={styles.productsContent}
              style={styles.productsList}
            />
          )}
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
  categoriesContainer: {
    marginVertical: 8,
    position: 'relative',
    height: 40,
    marginTop: 20,
  },
  categoriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    zIndex: 2,
    justifyContent: 'center',
    gap: 40,
  },
  categoryButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  firstCategory: {
    marginRight: 0,
  },
  centerCategory: {
    flex: 0,
    marginLeft: 0,
  },
  lastCategory: {
    marginLeft: 0,
  },

  dropdownContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: `${Colors.cardBackground}dd`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    padding: 8,
    zIndex: 1000,
  },
  subcategoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: Colors.background,
    marginBottom: 4,
  },
  subcategoryText: {
    fontSize: 14,
    color: Colors.lightText,
    textAlign: 'center',
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
});

export default HomeScreen;