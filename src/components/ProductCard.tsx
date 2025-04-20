import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Product} from '../types';
import {Colors} from '../constants/colors';

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
      <View style={styles.skewContainer}>
        <Image
          source={product.imageUri}
          style={styles.image}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}>
          <Icon
            name={product.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={product.isFavorite ? Colors.primary : Colors.lightText}
          />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.type}>{product.type}</Text>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>- {product.name}</Text>
          <Text style={styles.price}>$ {product.price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    height: 200,
    marginBottom: 16,
  },
  skewContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    transform: [{skewY: '-5deg'}],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  image: {
    width: '80%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10,
    transform: [{skewY: '5deg'}],
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{skewY: '5deg'}],
  },
  infoContainer: {
    padding: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    transform: [{skewY: '5deg'}],
  },
  type: {
    fontSize: 12,
    color: Colors.inactive,
    marginBottom: 4,
  },
  brand: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.lightText,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.lightText,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.lightText,
  },
});

export default ProductCard;
