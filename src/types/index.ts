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

export type ProfileStackParamList = {
  ProfileMain: undefined;
  UpdateProfile: { presentation: 'modal' };
};

export type UpdateProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'UpdateProfile'
>;