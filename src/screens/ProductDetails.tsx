import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

const ProductDetails = ({navigation}: Props) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Product Details',
      headerTitleStyle: {
        fontSize: metrics.fontSize.xxl,
        fontWeight: 'bold',
        color: Colors.lightText,
      },
    });
  }, [navigation]);

  const handleAddProduct = () => {
    // Add product logic will be implemented here
    console.log('Add product pressed');
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.noProductsText}>No products found.</Text>
          </View>
          <TouchableOpacity style={styles.addProductCard} onPress={handleAddProduct}>
            <Icon name="add-business" size={24} color={Colors.primary} />
            <Text style={styles.addProductText}>Add New Product</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: metrics.padding.md,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noProductsText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    opacity: 0.7,
  },
  addProductCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addProductText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '500',
    marginLeft: metrics.margin.md,
  },
});

export default ProductDetails; 