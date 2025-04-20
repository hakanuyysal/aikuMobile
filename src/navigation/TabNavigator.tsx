import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { View, Text } from 'react-native';
import TabBar from '../components/TabBar';
import { TabParamList } from '../types';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator<TabParamList>();

// Geçici placeholder ekranlar
const PlaceholderScreen = ({ route }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
    <Text style={{ color: Colors.lightText }}>{route.name} Ekranı</Text>
  </View>
);

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
      tabBar={props => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={PlaceholderScreen} />
      <Tab.Screen name="Cart" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
      <Tab.Screen name="Orders" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 