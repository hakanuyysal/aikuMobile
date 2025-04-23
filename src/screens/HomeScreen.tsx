import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';
import CategoryButton from '../components/CategoryButton';

// Ekran genişliğini dinamik olarak alıyoruz
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const categories = ['Startups', 'Investor', 'Businnes', 'About us', 'Marketplace'];

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    // Set default category on mount
    setActiveCategory('Startups');
  }, []);

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
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

  const renderCategoryButton = ({ item }: { item: string }) => (
    <View style={styles.categoryButtonWrapper}>
      <CategoryButton
        title={item}
        isActive={activeCategory === item}
        onPress={() => handleCategoryPress(item)}
      />
    </View>
  );

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
      colors={['#1A1E29', '#1A1E29', '#3B82F7', '#3B82F7']}
      locations={[0.1, 0.2, 0.2, 0.5]}
      start={{ x: 0, y: 0 }}
      end={{ x: 3.5, y: 0.8 }}
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
            <Text variant="headlineMedium" style={styles.title}>
              Aiku
            </Text>
            <IconButton
              icon="menu"
              mode="contained"
              containerColor={Colors.primary}
              iconColor={Colors.lightText}
              size={30}
              onPress={handleSearch}
              style={styles.searchButton}
            />
          </Surface>

          <FeaturedProduct
            product={products[0]}
            discount="Ai News"
            onPress={() => handleProductPress(products[0].id)}
          />

          <View style={styles.categoriesContainer}>
            <View style={styles.backgroundBar} />
            <FlatList
              data={categories}
              renderItem={renderCategoryButton}
              keyExtractor={item => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
            />
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
    marginVertical: 16,
    position: 'relative',
    height: 70,
  },
  categoriesContent: {
    paddingRight: 16,
    justifyContent: 'space-between',
  },
  categoryButtonWrapper: {
    marginRight: 12,
  },
  productsList: {
    flex: 1,
  },
  productCardContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  productCardWrapper: {
    width: SCREEN_WIDTH / 2 - 32,
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
});

export default HomeScreen;