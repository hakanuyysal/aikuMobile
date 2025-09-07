/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { initializePush, configureNotificationsOnStartup } from './src/services/push/oneSignal';
import firebase from '@react-native-firebase/app';

// Firebase'i başlat - React Native Firebase otomatik başlatır ama manuel de yapabiliriz
try {
  if (!firebase.apps.length) {
    firebase.initializeApp();
    console.log('✅ Firebase manuel olarak başlatıldı');
  } else {
    console.log('✅ Firebase zaten başlatılmış');
  }
} catch (error) {
  console.log('⚠️ Firebase başlatma hatası (normal olabilir):', error.message);
}

AppRegistry.registerComponent(appName, () => App);

// OneSignal init uygulama yüklenirken
initializePush();

// Uygulama başlatıldığında bildirim ayarlarını kontrol et
configureNotificationsOnStartup().catch(error => {
  console.error('Bildirim ayarları kontrol edilirken hata:', error);
});
