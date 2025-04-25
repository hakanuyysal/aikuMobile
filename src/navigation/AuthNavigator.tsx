import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import RegisterPassword from '../screens/auth/RegisterPassword';

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
    </Stack.Navigator>
  );
};

export default AuthNavigator; 