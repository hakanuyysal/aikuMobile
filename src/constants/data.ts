import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'LR01',
    type: 'Road Bike',
    brand: 'PEUGEOT',
    price: 1999.99,
    imageUri: require('../assets/images/product1.png'),
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Trade',
    type: 'Road Helmet',
    brand: 'SMITH',
    price: 120,
    imageUri: require('../assets/images/product2.png'),
    isFavorite: false,
  },
  {
    id: '3',
    name: 'SLR01',
    type: 'Road Bike',
    brand: 'BMC',
    price: 2499.99,
    imageUri: require('../assets/images/product1.png'),
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Gravel',
    type: 'Road Bike',
    brand: 'CANNONDALE',
    price: 2099.99,
    imageUri: require('../assets/images/product1.png'),
    isFavorite: false,
  },
]; 