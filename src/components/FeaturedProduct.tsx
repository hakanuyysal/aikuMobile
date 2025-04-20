import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Surface, Text} from 'react-native-paper';
import {Product} from '../types';
import {Colors} from '../constants/colors';

type FeaturedProductProps = {
  product: Product;
  discount: string;
  onPress: () => void;
};

const {width} = Dimensions.get('window');

const FeaturedProduct: React.FC<FeaturedProductProps> = ({
  product: _product,
  discount,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* Arka plan dekoratif şekli */}
      <View style={styles.backgroundShape} />

      {/* Ana kart */}
      <Surface style={styles.cardContainer} elevation={4}>
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
          <Text variant="displaySmall" style={styles.discountText}>
            {discount}
          </Text>
        </View>
      </Surface>
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
    transform: [{skewY: '-5deg'}],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContainer: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    transform: [{perspective: 800}, {skewY: '-3deg'}],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
  },
  cardContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  image: {
    width: '75%',
    height: '75%',
  },
  discountContainer: {
    position: 'absolute',
    left: 24,
    bottom: 20,
  },
  discountText: {
    fontWeight: '600',
    color: Colors.lightText,
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
    marginBottom: -10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
});

export default FeaturedProduct;
