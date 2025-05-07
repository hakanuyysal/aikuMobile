import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
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
        {/* Add BlurView as overlay */}
        <BlurView
          style={styles.blurOverlay}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="transparent"
        />
        
        {/* Add lock icon */}
        <View style={styles.lockContainer}>
          <Icon name="lock-closed" size={24} color={Colors.lightText} />
          <Text style={styles.lockText}>Subscribe For FREE </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            name={product.isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={product.isFavorite ? Colors.primary : Colors.lightText}
          />
        </TouchableOpacity>

        {/* Existing content with reduced opacity */}
        <View style={[styles.contentContainer, { opacity: 0.3 }]}>
          <View style={styles.imageContainer}>
            {/* PROFESYONEL SPOTLIGHT EFEKTİ */}
                      <LinearGradient
            colors={[
              'rgb(255, 255, 255)', // Ortada daha yoğun beyaz
              'rgb(255, 255, 255)', // Kenara doğru beyazlığı biraz azalt
              'rgb(255, 255, 255)'     // Sonunda tamamen şeffaf
            ]}
            style={styles.spotlight}
            start={{ x: 0.4, y: 1 }}
            end={{ x: 0, y: 0.2 }}
          />

            <Image
              source={product.imageUri}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.type} numberOfLines={1} ellipsizeMode="tail">
                {product.type}
              </Text>
              <Text style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
                {product.brand} - {product.name}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price} numberOfLines={1} ellipsizeMode="tail">
                {product.price}
              </Text>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 40,
    height: 80,
    marginBottom: 15,
    alignSelf: 'center',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
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
    width: 60, // Geniş alan kaplasın
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
    zIndex: 1, // Spotlight altında kalacak
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
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 30, 41, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5, // Make sure it's above the blur
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    backgroundColor: 'rgba(26, 30, 41, 0.7)',
  },

  lockContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },

  lockText: {
    color: Colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.9,
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
    zIndex: 1,
  },
});

export default ProductCard;
