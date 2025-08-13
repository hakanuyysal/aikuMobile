import axios, {AxiosInstance} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import Config from 'react-native-config';

type ModalMessage = {
  _id: string;
  title?: string;
  message: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

const DEV_API_BASE_ANDROID = 'http://10.0.2.2:3004/api';
const DEV_API_BASE_IOS = 'http://localhost:3004/api';
const PROD_API_BASE = 'https://api.aikuaiplatform.com/api';

const BASE_URL = __DEV__
  ? Platform.select({ios: DEV_API_BASE_IOS, android: DEV_API_BASE_ANDROID}) || DEV_API_BASE_ANDROID
  : Config.API_URL || PROD_API_BASE;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {'Content-Type': 'application/json'},
  timeout: 30000,
});

axiosInstance.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getActiveMobileModalMessage(): Promise<ModalMessage | null> {
  try {
    const response = await axiosInstance.get('/modal-messages/mobile/active');
    const data = response.data;
    if (data?.success && data?.data) {
      return data.data as ModalMessage;
    }
    // some backends may return the object directly
    if (data?._id) return data as ModalMessage;
    return null;
  } catch (error) {
    console.warn('Active modal message fetch failed:', error);
    return null;
  }
}


