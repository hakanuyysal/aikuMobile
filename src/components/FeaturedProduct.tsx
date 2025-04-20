import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types';
import { Colors } from '../constants/colors';

type FeaturedProductProps = {
  product: Product;
  discount: string;
  onPress: () => void;
};

const FeaturedProduct: React.FC<FeaturedProductProps> = ({
  product: _product,
  discount,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.skewContainer}>
        <Image 
          source={require('../assets/images/bcycle.png')} 
          style={styles.image} 
        />
        <View style={styles.discountContainer}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    marginVertical: 16,
  },
  skewContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    transform: [{ skewY: '-5deg' }],
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    transform: [{ skewY: '5deg' }],
  },
  discountContainer: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.discountBackground,
    transform: [{ skewY: '5deg' }],
  },
  discountText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.lightText,
  },
});

export default FeaturedProduct; 