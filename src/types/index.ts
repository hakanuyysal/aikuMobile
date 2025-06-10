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
  ChatDetail: { chatId: string; name: string; receiverId: string; companyId: string };
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
  PaymentSuccess: undefined;
  PaymentError: undefined;
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
  Chat: undefined;
  HowItWorks: undefined;
};