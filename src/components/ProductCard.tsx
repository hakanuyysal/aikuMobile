import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Product } from '../types';
import { Colors } from '../constants/colors';

// Ekran genişliğini dinamik olarak alıyoruz
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
      <Surface style={styles.skewContainer} elevation={3}>
        <LinearGradient
          colors={['white', '#4966A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <Image
          source={product.imageUri}
          style={styles.image}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
        >
          <Icon
            name={product.isFavorite ? 'heart' : 'heart-outline'}
            size={30} // İkonu biraz büyüttük
            color={product.isFavorite ? Colors.primary : Colors.lightText}
          />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.type} variant="labelMedium">{product.type}</Text>
          <Text style={styles.brandName} variant="titleLarge">
            {product.brand} - {product.name}
          </Text>
          <Text style={styles.price} variant="titleLarge">
            $ {product.price}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (SCREEN_WIDTH - 50) / 2.2, // İki kart yan yana sığacak şekilde
    height: 250, // Yüksekliği biraz azalttık
    marginBottom: '80%', // Margin değerini azalttık
    alignSelf: 'center',
    marginHorizontal: 5, // Yatay boşluk ekledik
    marginRight: -2,
    zIndex:1,
  },
  skewContainer: {
    width: '100%', // Genişliği düzelttik
    height: '98%',
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    transform: [{ skewY: '0deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '50%',
    height: '50%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16, // Padding artırıldı
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  type: {
    color: Colors.inactive,
    marginBottom: 2, // Metinler arası boşluğu artırdık
    fontSize: 15,
  },
  brandName: {
    fontWeight: '300',
    color: Colors.lightText,
    marginBottom: 6,
    fontSize: 15,
  },
  price: {
    fontWeight: 'bold',
    color: Colors.lightText,
    fontSize: 15,
  },
});

export default ProductCard;