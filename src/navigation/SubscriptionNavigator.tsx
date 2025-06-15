import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CartScreen from '../screens/subscriptions/CartScreen';
import BillingInfoScreen from '../screens/subscriptions/BillingInfoScreen';
import PaymentScreen from '../screens/subscriptions/PaymentScreen';
import PaymentSuccess from '../screens/subscriptions/PaymentSuccess';
import PaymentError from '../screens/subscriptions/PaymentError';

export type SubscriptionStackParamList = {
  Cart: undefined;
  BillingInfo: {planDetails: {title: string; price: number; isYearly: boolean}};
  Payment: {planDetails: any; billingInfo: any};
  PaymentSuccess: undefined;
  PaymentError: undefined;
};

const Stack = createNativeStackNavigator<SubscriptionStackParamList>();

const SubscriptionNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="BillingInfo" component={BillingInfoScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
      <Stack.Screen name="PaymentError" component={PaymentError} />
    </Stack.Navigator>
  );
};

export default SubscriptionNavigator; 