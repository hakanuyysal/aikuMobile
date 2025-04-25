import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { Product } from '../types';
import { Colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  onFavoritePress: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onFavoritePress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Surface style={styles.cardContainer} elevation={4}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={product.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={product.isFavorite ? Colors.primary : Colors.lightText}
          />
        </TouchableOpacity>

        <Image
          source={product.imageUri}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.infoContainer}>
          <Text style={styles.type}>{product.type}</Text>
          <Text style={styles.brandName}>
            {product.brand} - {product.name}
          </Text>
          <Text style={styles.price}>
            $ {product.price}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (SCREEN_WIDTH - 50) / 2.1,
    height: 250,
    marginBottom: 16,
    alignSelf: 'center',
    marginHorizontal: 8,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: `${Colors.cardBackground}dd`, // Matches the muted tone of other screens
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // Updated to match other cards
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 20,
  },
  infoContainer: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Changed to transparent for consistency
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  type: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  brandName: {
    color: Colors.lightText,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    color: Colors.lightText,
    fontSize: 14,
    opacity: 0.8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 30, 41, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default ProductCard;