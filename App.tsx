import React, {useState} from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar, View, StyleSheet} from 'react-native';
import {Provider as PaperProvider, MD3DarkTheme} from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import {Colors} from './src/constants/colors';
import UpdateProfileScreen from './src/screens/UpdateProfileScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import SplashScreen from './src/screens/splash/SplashScreen';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import Menu from './app/components/Menu';
import SubscriptionDetails from './app/screens/SubscriptionDetails';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  UpdateProfile: undefined;
  SubscriptionDetails: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList>;

const RootStack = createNativeStackNavigator<RootStackParamList>();

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

function AppContent(): React.JSX.Element {
  const {user, loading} = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return <SplashScreen />;
  }

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator initialRouteName={user ? 'Main' : 'Auth'}>
        {user ? (
          <>
            <RootStack.Screen
              name="Main"
              component={(props: Props) => <TabNavigator {...props} onMenuOpen={handleMenuOpen} />}
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
            <RootStack.Screen
              name="SubscriptionDetails"
              component={SubscriptionDetails}
              options={{
                title: 'Subscription Details',
                headerTransparent: true,
                headerTintColor: Colors.lightText,
                headerBackTitle: undefined,
                headerStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            />
          </>
        ) : (
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{headerShown: false}}
          />
        )}
      </RootStack.Navigator>

      {isMenuOpen && user && (
        <Menu
          user={{
            name: user.name || user.email,
            email: user.email,
            avatar: user.photoURL,
            role: user.role || 'Member'
          }}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <PaperProvider theme={materialTheme}>
        <View style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Colors.statusBarBackground}
          />
          <AppContent />
        </View>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
