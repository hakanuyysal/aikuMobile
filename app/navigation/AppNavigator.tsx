import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import ChatListScreen from '../../src/screens/messages/ChatListScreen';
import ChatDetailScreen from '../../src/screens/messages/ChatDetailScreen';
import SubscriptionDetails from '../screens/SubscriptionDetails';
import ProfileScreen from '../../src/screens/ProfileScreen';
import Settings from '../screens/Settings';
import {Colors} from '../../src/constants/colors';

export type AppStackParamList = {
  ChatList: undefined;
  ChatDetail: {chatId: string};
  Profile: undefined;
  SubscriptionDetails: undefined;
  Settings: undefined;
};

export type AppStackNavigationProp<T extends keyof AppStackParamList> =
  StackNavigationProp<AppStackParamList, T>;

export type AppStackRouteProp<T extends keyof AppStackParamList> = RouteProp<
  AppStackParamList,
  T
>;

const Stack = createStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetails}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerTitleStyle: {
            color: Colors.lightText,
          },
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
