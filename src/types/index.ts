import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationState, ParamListBase } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { NavigationProp } from '@react-navigation/native';

export interface Product {
  id: string;
  name: string;
  type: string;
  brand: string;
  price: number;
  imageUri: any;
  isFavorite?: boolean;
}

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Cart: undefined;
  Profile: undefined;
  Message: { state?: NavigationState };
};

export type MessageStackParamList = {
  ChatList: undefined;
  ChatDetail: { 
    chatSessionId: string; 
    receiverId: string; 
    receiverName: string; 
    companyId: string 
  };
  CompanyList: undefined;
} & ParamListBase;

export type ProfileStackParamList = {
  ProfileMain: undefined;
  UpdateProfile: { presentation: 'modal' };
};

export type UpdateProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'UpdateProfile'
>;

export type ChatListScreenProps = StackScreenProps<
  MessageStackParamList,
  'ChatList'
>;

export type ChatDetailScreenProps = StackScreenProps<
  MessageStackParamList,
  'ChatDetail'
>;

export type CompanyListScreenProps = StackScreenProps<
  MessageStackParamList,
  'CompanyList'
>;

export interface TabBarProps {
  state: NavigationState;
  descriptors: Record<string, any>;
  navigation: NavigationProp<ParamListBase>;
}

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  HowItWorks: undefined;
  BillingInfo: {
    planDetails: {
      name: string;
      price: number;
      description: string;
      billingCycle: 'yearly' | 'monthly';
      hasPaymentHistory?: boolean;
    };
    hasExistingBillingInfo?: boolean;
    existingBillingInfo?: BillingInfo;
  };
  AddBillingInfo: {
    planDetails: {
      name: string;
      price: number;
      description: string;
      billingCycle: 'yearly' | 'monthly';
      hasPaymentHistory?: boolean;
    };
    editMode?: boolean;
    billingInfo?: BillingInfo;
  };
  Payment: {
    planDetails: {
      name: string;
      price: number;
      description: string;
      billingCycle: 'yearly' | 'monthly';
      hasPaymentHistory?: boolean;
    };
    billingInfo: BillingInfo;
  };
  PaymentSuccess: {
    message: string;
  };
  PaymentError: {
    message: string;
  };
  ThreeDSecure: {
    htmlContent: string;
    returnUrl: string;
  };
  Main: undefined;
  Auth: undefined;
  UpdateProfile: undefined;
  ProfileDetail: undefined;
  SubscriptionDetails: undefined;
  Favorites: undefined;
  CompanyDetails: undefined;
  ProductDetails: undefined;
  Settings: undefined;
  ContactUs: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  PersonalDataProtection: undefined;
  InvestmentDetails: undefined;
  Onboarding: undefined;
  TalentPool: undefined;
  TrainingDetail: undefined;
  MarketPlace: undefined;
  MarketPlaceProductDetails: undefined;
  StartupsDetails: undefined;
  InvestorDetails: undefined;
  BusinessDetails: undefined;
  InvestorMenuDetails: undefined;
  AddBlogPost: undefined;
  AddProduct: undefined;
  Message: { state?: NavigationState };
};

export type BillingInfoScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'BillingInfo'
>;

export interface BillingInfo {
  _id: string;
  user: string;
  billingType: 'individual' | 'corporate';
  identityNumber: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  district: string;
  zipCode: string;
  phone: string;
  email: string;
  isDefault: boolean;
  companyName?: string;
  taxNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingResponse {
  success: boolean;
  data?: BillingInfo | BillingInfo[] | null;
  message?: string;
}

export interface PaymentHistory {
  _id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  description: string;
  type: 'subscription' | 'one-time';
  plan: 'startup' | 'business' | 'investor';
  period: 'monthly' | 'yearly';
  id: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentHistory[];
  message?: string;
}