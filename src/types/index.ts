import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
  Message: undefined;
};

export type MessageStackParamList = {
  ChatList: undefined;
  ChatDetail: { chatId: string; name: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  UpdateProfile: { presentation: 'modal' };
};

export type UpdateProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'UpdateProfile'
>;

export type ChatListScreenProps = NativeStackScreenProps<
  MessageStackParamList,
  'ChatList'
>;

export type ChatDetailScreenProps = NativeStackScreenProps<
  MessageStackParamList,
  'ChatDetail'
>;