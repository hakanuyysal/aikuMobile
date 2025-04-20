/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar, View, StyleSheet, LogBox } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import { Colors } from './src/constants/colors';

// React Navigation tema hatalarını devre dışı bırakıyoruz
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Material UI için tema
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

// Navigation için tema
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
          <TabNavigator />
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
