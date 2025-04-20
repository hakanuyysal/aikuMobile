/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar, View, StyleSheet, LogBox } from 'react-native';
import TabNavigator from './src/navigation/TabNavigator';
import { Colors } from './src/constants/colors';

// React Navigation tema hatalarını devre dışı bırakıyoruz
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Özelleştirilmiş tema
const MyTheme = {
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
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.statusBarBackground}
      />
      <NavigationContainer theme={MyTheme}>
        <TabNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default App;
