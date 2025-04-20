import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import SearchButton from '../components/SearchButton';
import CategoryButton from '../components/CategoryButton';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';

const categories = ['All', 'Road', 'Mountain', 'Urban', 'Touring'];

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
    <CategoryButton
      title={item}
      isActive={activeCategory === item}
      onPress={() => handleCategoryPress(item)}
    />
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
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Bike</Text>
          <SearchButton onPress={handleSearch} />
        </View>

        <FeaturedProduct
          product={products[0]}
          discount="30% Off"
          onPress={() => handleProductPress(products[0].id)}
        />

        <FlatList
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContent}
        />

        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          style={styles.productsList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 16, // iOS için dinamik island altında kalmaması için daha fazla padding
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.lightText,
  },
  categoriesList: {
    marginVertical: 12,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  productsList: {
    flex: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export default HomeScreen; 