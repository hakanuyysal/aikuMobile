import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { Product } from '../types';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  onFavoritePress: () => void;
  isUnlocked: boolean;
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onFavoritePress,
  isUnlocked,
}) => {
  const navigation = useNavigation();
  const isLocked = !isUnlocked;

  const contentStyle = [
    styles.contentContainer,
    isLocked && styles.lockedContentContainer,
  ];

  const handleLockPress = () => {
    navigation.navigate('Cart');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={isLocked} // Disable clicking when locked
    >
      <Surface style={styles.cardContainer} elevation={4}>
        {/* Favorite Button */}
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

        {/* 🔒 Locked Overlay */}
        {isLocked && (
          <>
            <BlurView
              style={styles.blurOverlay}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="transparent"
            />
            <TouchableOpacity 
              style={styles.lockContainer}
              onPress={handleLockPress}
            >
              <Icon name="lock-closed" size={24} color={Colors.lightText} />
              <Text style={styles.lockText}>Subscribe For FREE</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 🟢 Content (Locked or Unlocked) */}
        <View style={contentStyle}>
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
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

// Styles remain unchanged
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
  lockedContentContainer: {
    opacity: 0.3,
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
    width: 60,
    height: 60,
    borderRadius: 50,
    top: -5,
    left: -5,
    zIndex: 1,
  },
  image: {
    width: 44,
    height: 50,
    zIndex: 2,
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
    zIndex: 5,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    backgroundColor: Colors.cardBackground,
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
});

export default ProductCard;