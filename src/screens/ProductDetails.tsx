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
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

const ProductDetails = ({navigation}: Props) => {
  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}>
            <MaterialIcons name="add-business" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.noProductsText}>No products found.</Text>
          </View>
          <TouchableOpacity style={styles.addProductCard} onPress={handleAddProduct}>
            <MaterialIcons name="add-business" size={24} color={Colors.primary} />
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
  header: {
    padding: metrics.padding.md,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: metrics.margin.lg,
    top: metrics.margin.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl * 1.1,
    fontWeight: 'bold',
    marginBottom: metrics.margin.lg,
    color: Colors.lightText,
  },
  content: {
    flex: 1,
    padding: metrics.padding.lg,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  noProductsText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    opacity: 0.7,
  },
  addProductCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addProductText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '500',
    marginLeft: metrics.margin.md,
  },
  addButton: {
    position: 'absolute',
    right: metrics.margin.lg,
    top: metrics.margin.lg,
    zIndex: 1,
  },
});

export default ProductDetails; 