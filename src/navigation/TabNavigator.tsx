import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { View, Text } from 'react-native';
import TabBar from '../components/TabBar';
import { TabParamList } from '../types';
import { Colors } from '../constants/colors';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import ChatListScreen from '../screens/messages/ChatListScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatDetailScreen from '../screens/messages/ChatDetailScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const MessageStack = createNativeStackNavigator();

const MessageNavigator = () => {
  return (
    <MessageStack.Navigator screenOptions={{ headerShown: false }}>
      <MessageStack.Screen name="ChatList" component={ChatListScreen} />
      <MessageStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </MessageStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          position: 'absolute',
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
          height: 0,
          zIndex: 0,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.inactive,
      }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Message" component={MessageNavigator} />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Abonelikler'
        }}
      />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 