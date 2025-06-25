import { createStackNavigator } from '@react-navigation/stack';
import { CompanyListScreen } from '../screens/messages/CompanyListScreen';
import { ChatDetailScreen } from '../screens/messages/ChatDetailScreen';
import { ChatListScreen } from '../screens/messages/ChatListScreen';
import { LinkedInAuthScreen } from '../screens/LinkedInAuthScreen';
import { LinkedInCallback } from '../components/LinkedInCallback';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CompanyList" 
        component={CompanyListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="LinkedInAuth" component={LinkedInAuthScreen} />
      <Stack.Screen 
        name="LinkedInCallback" 
        component={LinkedInCallback}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export type RootStackParamList = {
  ChatList: undefined;
  CompanyList: undefined;
  ChatDetail: {
    chatId: string;
  };
  LinkedInAuth: undefined;
  LinkedInCallback: undefined;
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
  };
};