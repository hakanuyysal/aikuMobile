import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';
import CategoryButton from '../components/CategoryButton';

// Görsele uygun kategori butonları
const categories = ['All', 'Road', 'Path', 'Mountain', 'Helmet'];

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState(PRODUCTS);

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    // Kategoriye göre filtreleme yapılabilir burada
  };

  const handleSearch = () => {
    // Arama işlemleri burada yapılabilir
  };

  const handleProductPress = (_productId: string) => {
    // Ürün detayına gitmek için
    // Not: Şimdilik kullanılmıyor, ileride navigasyon için kullanılacak
  };

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

  const renderProductCard = ({ item }: { item: typeof products[0] }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item.id)}
      onFavoritePress={() => handleFavoritePress(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Surface style={styles.header} elevation={0}>
          <Text variant="headlineMedium" style={styles.title}>Choose Your Bike</Text>
          <IconButton
            icon="magnify"
            mode="contained"
            containerColor={Colors.primary}
            iconColor={Colors.lightText}
            size={24}
            onPress={handleSearch}
            style={styles.searchButton}
          />
        </Surface>

        <FeaturedProduct
          product={products[0]}
          discount="30% Off"
          onPress={() => handleProductPress(products[0].id)}
        />

        <View style={styles.categoriesContainer}>
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
          data={products}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          style={styles.productsList}
          contentContainerStyle={styles.productsContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
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
  productsContent: {
    paddingBottom: 120, // TabBar için daha fazla boşluk
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export default HomeScreen; 