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
  // Diğer konfigürasyon değerleri buraya eklenebilir
};

export default AppConfig;