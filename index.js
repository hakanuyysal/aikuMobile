/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { initializePush, configureNotificationsOnStartup } from './src/services/push/oneSignal';

AppRegistry.registerComponent(appName, () => App);

// OneSignal init uygulama yüklenirken
initializePush();

// Uygulama başlatıldığında bildirim ayarlarını kontrol et
configureNotificationsOnStartup().catch(error => {
  console.error('Bildirim ayarları kontrol edilirken hata:', error);
});
