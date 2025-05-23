import Config from 'react-native-config';

declare module 'react-native-config' {
  interface Env {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_IOS_CLIENT_ID: string;
    API_URL: string;
  }
}

export default Config;