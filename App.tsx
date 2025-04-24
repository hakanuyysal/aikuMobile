import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar, View, StyleSheet, LogBox} from 'react-native';
import {Provider as PaperProvider, MD3DarkTheme} from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import {Colors} from './src/constants/colors';
import UpdateProfileScreen from './src/screens/UpdateProfileScreen';

const RootStack = createNativeStackNavigator();

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const materialTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.background,
    surface: Colors.cardBackground,
    surfaceVariant: Colors.cardBackground,
    onSurface: Colors.lightText,
    onSurfaceVariant: Colors.lightText,
    outline: Colors.border,
  },
};

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.cardBackground,
    text: Colors.lightText,
    border: Colors.border,
    notification: Colors.primary,
  },
};

function App(): React.JSX.Element {
  return (
    <PaperProvider theme={materialTheme}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.statusBarBackground}
        />
        <NavigationContainer theme={navigationTheme}>
          <RootStack.Navigator>
            <RootStack.Screen
              name="Main"
              component={TabNavigator}
              options={{headerShown: false}}
            />
            <RootStack.Screen
              name="UpdateProfile"
              component={UpdateProfileScreen}
              options={{
                presentation: 'modal',
                title: 'Edit Profile',
                headerStyle: {backgroundColor: Colors.cardBackground},
                headerTintColor: Colors.lightText,
              }}
            />
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default App;
