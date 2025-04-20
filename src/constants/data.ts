import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Road Bike',
    type: 'Road',
    brand: 'PEUGEOT',
    price: 1999.99,
    imageUri: require('../assets/images/product1.png'),
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Road Helmet',
    type: 'Road',
    brand: 'SMITH',
    price: 120,
    imageUri: require('../assets/images/product2.png'),
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Mountain Bike',
    type: 'MTB',
    brand: 'Trek',
    price: 2499.99,
    imageUri: require('../assets/images/product1.png'),
    isFavorite: false,
  },
]; 