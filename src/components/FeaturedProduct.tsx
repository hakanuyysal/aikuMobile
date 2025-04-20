import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Product } from '../types';
import { Colors } from '../constants/colors';

type FeaturedProductProps = {
  product: Product;
  discount: string;
  onPress: () => void;
};

const { width } = Dimensions.get('window');

const FeaturedProduct: React.FC<FeaturedProductProps> = ({
  product: _product,
  discount,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Arka plan dekoratif şekli */}
      <View style={styles.backgroundShape} />
      
      {/* Ana kart */}
      <View style={styles.cardContainer}>
        {/* Resim içeren alan */}
        <View style={styles.cardContent}>
          <Image 
            source={require('../assets/images/bcycle.png')} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>
        
        {/* İndirim yazısı */}
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
    marginVertical: 10,
    position: 'relative',
  },
  backgroundShape: {
    position: 'absolute',
    top: 20,
    right: 0,
    width: width * 0.35,
    height: '75%',
    backgroundColor: Colors.primary,
    opacity: 0.15,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    transform: [
      { skewY: '-5deg' }
    ]
  },
  cardContainer: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    transform: [
      { perspective: 800 },
      { skewY: '-3deg' }
    ],
  },
  cardContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30, // Resmi biraz yukarı kaydırmak için
  },
  image: {
    width: '65%',
    height: '65%',
  },
  discountContainer: {
    position: 'absolute',
    left: 24,
    bottom: 20,
  },
  discountText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.lightText,
  },
});

export default FeaturedProduct; 