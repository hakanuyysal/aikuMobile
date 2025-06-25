import {createStackNavigator} from '@react-navigation/stack';
import CompanyListScreen from '../screens/messages/CompanyListScreen';
import ChatDetailScreen from '../screens/messages/ChatDetailScreen';
import ChatListScreen from '../screens/messages/ChatListScreen';
import BillingInfoScreen from '../screens/subscriptions/BillingInfoScreen';
import PaymentScreen from '../screens/subscriptions/PaymentScreen';
import PaymentSuccess from '../screens/subscriptions/PaymentSuccess';
import PaymentError from '../screens/subscriptions/PaymentError';
import ThreeDSecure from '../screens/subscriptions/ThreeDSecure';
import {RootStackParamList} from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CompanyList"
        component={CompanyListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BillingInfo"
        component={BillingInfoScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccess}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PaymentError"
        component={PaymentError}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ThreeDSecure"
        component={ThreeDSecure}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
