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
} from 'react-native';
import { Text as PaperText, IconButton, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';
import CategoryButton from '../components/CategoryButton';
import NewsScreen from '../components/AiNews';

// Ekran genişliğini dinamik olarak alıyoruz
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const categories = ['Our Community', 'Resources', 'Marketplace'];

const subcategories = {
  'Our Community': ['Startups', 'Investor', 'Business'],
  'Resources': ['Talent Pool', 'Investment Opportunities', 'How It Works'],
};

interface HomeScreenProps {
  onMenuOpen: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({onMenuOpen}) => {
  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts] = useState(PRODUCTS);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Set default category on mount
    setActiveCategory('Startups');
  }, []);

  const handleCategoryPress = (category: string) => {
    if (category === 'Our Community' || category === 'Resources') {
      // Toggle dropdown for the selected category
      if (selectedCategory === category && dropdownVisible) {
        setDropdownVisible(false);
        setSelectedCategory(null);
      } else {
        setSelectedCategory(category);
        setDropdownVisible(true);
      }
    } else {
      setActiveCategory(category);
      setDropdownVisible(false); // Close dropdown if another category is selected
      setSelectedCategory(null);
    }
  };

  const handleSubcategoryPress = (subcategory: string) => {
    setActiveCategory(subcategory);
    setDropdownVisible(false);
    setSelectedCategory(null);
  };

  const handleSearch = () => {};

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

  // Ürünleri ikili gruplara ayır
  const groupProductsInPairs = (products: typeof PRODUCTS) => {
    const grouped = [];
    for (let i = 0; i < products.length; i += 2) {
      grouped.push(products.slice(i, i + 2));
    }
    return grouped;
  };

  const renderProductGroup = ({ item }: { item: typeof products }) => (
    <View style={styles.productCardContainer}>
      <View style={styles.productCardRow}>
        {item.map(product => (
          <View key={product.id} style={styles.productCardWrapper}>
            <ProductCard
              product={product}
              onPress={() => handleProductPress(product.id)}
              onFavoritePress={() => handleFavoritePress(product.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );

  // Kategoriye göre ürünleri filtreleme
  const filteredProducts = products.filter(product => 
    product.category === activeCategory || activeCategory === 'Startups'
  );

  const groupedProducts = groupProductsInPairs(filteredProducts);

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
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <PaperText variant="headlineMedium" style={styles.title}>
              Aiku
            </PaperText>
            <IconButton
              icon="menu"
              iconColor={Colors.lightText}
              size={30}
              onPress={onMenuOpen}
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
                <View key={item} style={[
                  styles.categoryButtonWrapper,
                  index === 0 && styles.firstCategory, // Align "Our Community" to left edge
                  index === 1 && styles.centerCategory, // Center "Resources"
                  index === 2 && styles.lastCategory, // Align "Marketplace" to right
                ]}>
                  <CategoryButton
                    title={item}
                    isActive={activeCategory === item || selectedCategory === item}
                    onPress={() => handleCategoryPress(item)}
                  />
                  <PaperText style={styles.divider}>ᐯ</PaperText>
                </View>
              ))}
            </View>
            {dropdownVisible && selectedCategory && (
              <View style={styles.dropdownContainer}>
                {subcategories[selectedCategory].map((subcategory) => (
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

          <FlatList
            data={groupedProducts}
            renderItem={renderProductGroup}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContent}
            style={styles.productsList}
            snapToInterval={SCREEN_WIDTH}
            snapToAlignment="center"
            decelerationRate="fast"
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
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
    paddingHorizontal: 16,
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
  title: {
    fontWeight: '700',
    color: Colors.lightText,
  },
  searchButton: {
    margin: 0,
  },
  categoriesContainer: {
    marginVertical: 8,
    position: 'relative',
    height: 50, // Fixed height for category buttons
  },
  categoriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0, // Remove padding to allow left-edge alignment
  },
  categoryButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstCategory: {
    marginRight: 'auto', // Push "Our Community" to the left edge
  },
  centerCategory: {
    flex: 1,
    justifyContent: 'center', // Center "Resources" horizontally
  },
  lastCategory: {
    marginLeft: 'auto', // Push "Marketplace" to the right
  },
  divider: {
    color: Colors.lightText,
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8, // Space between button and divider
    marginLeft:-3
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: `${Colors.cardBackground}dd`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    padding: 10,
    zIndex: 1000,
  },
  subcategoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 5,
  },
  subcategoryText: {
    fontSize: 16,
    color: Colors.lightText,
    textAlign: 'center',
  },
  productsList: {
    flex: 1,
    marginTop: 0,
  },
  productCardContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: -70,
  },
  productCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  productCardWrapper: {
    width: (SCREEN_WIDTH - 60) / 2.1,
    alignItems: 'center',
    marginTop: -10,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  productsContent: {
    paddingHorizontal: 0,
  },
});

export default HomeScreen;