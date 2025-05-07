import React, { useState, useEffect } from 'react';
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
import { Text as PaperText, IconButton, Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';
import CategoryButton from '../components/CategoryButton';
import { Product } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const categories = ['Our Community', 'Resources', 'Marketplace'];

const subcategories = {
  'Our Community': ['Startups', 'Investor', 'Business'],
  'Resources': ['Talent Pool', 'Investment Opportunities', 'How It Works'],
};



const HomeScreen = (props: HomeScreenProps) => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts] = useState(PRODUCTS);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);
  const { onMenuOpen } = props;

  useEffect(() => {
    setActiveCategory('Startups');
  }, []);

  const closeTooltip = () => {
    setIsTooltipVisible(false);
  };

  const handleCategoryPress = (category: string) => {
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
    }
  };

  const handleSubcategoryPress = (subcategory: string) => {
    setActiveCategory(subcategory);
    setDropdownVisible(false);
    setSelectedCategory(null);
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
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.titleContainer}>
                <PaperText variant="titleLarge" style={styles.title}>
                  Aiku
                </PaperText>
                <PaperText variant="bodySmall" style={styles.subtitle}>
                  ai startup platform
                </PaperText>
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

          <FeaturedProduct
            product={products[0]}
            discount="Ai News"
            onPress={() => handleProductPress(products[0].id)}
          />

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
                  <MaterialCommunityIcons
                    name="chevron-double-down"
                    size={18}
                    color={Colors.lightText}
                    style={styles.divider}
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
                      {subcategories[subcategory as keyof typeof subcategories] || subcategory}
                    </PaperText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Tooltip Modal */}
          {isTooltipVisible && (
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
                {/* Our Community yazısı */}
                <View style={styles.ourCommunityButton}>
                  <Text style={styles.ourCommunityText}>Our Community</Text>
                </View>
                
                {/* Tooltip */}
                <View style={styles.tooltipContainer}>
                  <View style={styles.tooltipContentRow}>
                    <View style={styles.tooltipImageContainer}>
                      <Image 
                        source={require('../assets/images/Tooltipaihands.png')}
                        style={styles.tooltipImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.tooltipTextContent}>
                      <Text style={styles.tooltipDescription}>
                      You can look at startups, investors and businesses here
                      </Text>
                    </View>
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
    width: 40,
    height: 40,
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
    zIndex: 2, // Ensure categories are above the tooltip overlay
  },
  categoryButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstCategory: {
    marginRight: 'auto',
  },
  centerCategory: {
    flex: 1,
    justifyContent: 'center',
  },
  lastCategory: {
    marginLeft: 'auto',
  },
  divider: {
    marginTop: 5,
    marginHorizontal: 8,
    marginLeft: -3,
    opacity: 0.7,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  ourCommunityButton: {
    position: 'absolute',
    top: 350,
    left: 30,
    zIndex: 1001,
    backgroundColor: 'transparent',
  },
  ourCommunityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 360,
    left: 150,
    width: 200,
    zIndex: 1000,
    borderRadius: 8,
    padding: 16,
  },
  tooltipTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tooltipContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tooltipImageContainer: {
    position: 'absolute',
    left: -290,
    top: -90,
  },
  tooltipImage: {
    width: 500,
    height: 500,
    marginLeft:0,
    marginTop:65,
  },
  tooltipTextContent: {
    flex: 1,
  },
  tooltipDescription: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 8,
    marginLeft:-50,
  },
  tooltipList: {
    marginTop: 4,
  },
});

export default HomeScreen;