import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import RegisterPassword from '../screens/auth/RegisterPassword';
import EmailVerification from '../screens/auth/EmailVerification';
import TermsOfService from '../screens/legal/TermsOfService';
import PrivacyPolicy from '../screens/legal/PrivacyPolicy';
import PersonalDataProtection from '../screens/legal/PersonalDataProtection';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="RegisterPassword" component={RegisterPassword} />
      <Stack.Screen name="EmailVerification" component={EmailVerification} />
      <Stack.Screen name="TermsOfService" component={TermsOfService} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="PersonalDataProtection" component={PersonalDataProtection} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 