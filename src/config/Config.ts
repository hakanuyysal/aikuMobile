import Config from 'react-native-config';

declare module 'react-native-config' {
  interface Env {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_IOS_CLIENT_ID: string;
    API_URL: string;
  }
}

const AppConfig = {
  API_URL: 'https://api.aikuaiplatform.com', // Production URL
  // API_URL: 'http://localhost:3000', // Development URL

  // RevenueCat API Keys
  REVENUECAT_IOS_API_KEY: 'appl_ItZJWkZzqVLPrmfIjvxQtPuUFom',
  REVENUECAT_ANDROID_API_KEY: 'goog_ItZJWkZzqVLPrmfIjvxQtPuUFom',

  // Diğer konfigürasyon değerleri buraya eklenebilir
};

// Debug için export
console.log('🔧 Config.ts loaded');
console.log('🔧 AppConfig.REVENUECAT_IOS_API_KEY:', AppConfig.REVENUECAT_IOS_API_KEY);

export default AppConfig;
