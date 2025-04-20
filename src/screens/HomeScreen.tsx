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
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Bike</Text>
          <View style={styles.searchContainer}>
            <SearchButton onPress={handleSearch} />
          </View>
        </View>

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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.lightText,
  },
  searchContainer: {
    transform: [{ skewY: '-5deg' }],
    overflow: 'hidden',
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
    paddingBottom: 120, // Yeni TabBar tasarımı için daha fazla boşluk
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export default HomeScreen; 