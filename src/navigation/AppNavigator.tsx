import {createStackNavigator} from '@react-navigation/stack';
import CompanyListScreen from '../screens/messages/CompanyListScreen';
import ChatDetailScreen from '../screens/messages/ChatDetailScreen';
import ChatListScreen from '../screens/messages/ChatListScreen';
import BillingInfoScreen from '../screens/subscriptions/BillingInfoScreen';
import PaymentScreen from '../screens/subscriptions/PaymentScreen';
import PaymentSuccess from '../screens/subscriptions/PaymentSuccess';
import PaymentError from '../screens/subscriptions/PaymentError';
import ThreeDSecure from '../screens/subscriptions/ThreeDSecure';
import TabNavigator from './TabNavigator';
import {RootStackParamList} from '../types';
import SubscriptionDetails from '../screens/settings/SubscriptionDetails';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="CompanyList" component={CompanyListScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="BillingInfo" component={BillingInfoScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
      <Stack.Screen name="PaymentError" component={PaymentError} />
      <Stack.Screen 
        name="ThreeDSecure" 
        component={ThreeDSecure}
        options={{
          presentation: 'modal',
          gestureEnabled: false
        }}
      />
      <Stack.Screen name="SubscriptionDetails" component={SubscriptionDetails} />
    </Stack.Navigator>
  );
};
