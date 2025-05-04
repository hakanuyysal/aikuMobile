import React, {useState, useRef} from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar, View, StyleSheet, Animated} from 'react-native';
import {Provider as PaperProvider, MD3DarkTheme} from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import {Colors} from './src/constants/colors';
import UpdateProfileScreen from './src/screens/UpdateProfileScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import SplashScreen from './src/screens/splash/SplashScreen';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import Menu from './src/components/Menu';
import SubscriptionDetails from './src/screens/subscriptions/SubscriptionDetails';
import Favorites from './src/screens/Favorites';
import CompanyDetails from './src/screens/CompanyDetails';
import ProductDetails from './src/screens/ProductDetails';
import Settings from './src/screens/settings/Settings';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  UpdateProfile: undefined;
  SubscriptionDetails: undefined;
  Favorites: undefined;
  CompanyDetails: undefined;
  ProductDetails: undefined;
  Settings: undefined;
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (loading) {
    return <SplashScreen />;
  }

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={styles.mainContainer}>
        <Animated.View
          style={[
            styles.mainContent,
            {
              transform: [
                {
                  translateX: slideAnim,
                },
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}>
          <RootStack.Navigator initialRouteName={user ? 'Main' : 'Auth'}>
            {user ? (
              <>
                <RootStack.Screen
                  name="Main"
                  component={(props: Props) => (
                    <TabNavigator {...props} onMenuOpen={handleMenuOpen} />
                  )}
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
                <RootStack.Screen
                  name="Favorites"
                  component={Favorites}
                  options={{
                    title: 'Favorites',
                    headerTransparent: true,
                    headerTintColor: Colors.lightText,
                    headerBackTitle: undefined,
                    headerStyle: {
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <RootStack.Screen
                  name="CompanyDetails"
                  component={CompanyDetails}
                  options={{
                    title: 'Company Details',
                    headerTransparent: true,
                    headerTintColor: Colors.lightText,
                    headerBackTitle: undefined,
                    headerStyle: {
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <RootStack.Screen
                  name="ProductDetails"
                  component={ProductDetails}
                  options={{
                    title: 'Product Details',
                    headerTransparent: true,
                    headerTintColor: Colors.lightText,
                    headerBackTitle: undefined,
                    headerStyle: {
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <RootStack.Screen
                  name="Settings"
                  component={Settings}
                  options={{
                    title: 'Settings',
                    headerStyle: {
                      backgroundColor: Colors.background,
                    },
                    headerTintColor: Colors.lightText,
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
        </Animated.View>

        {isMenuOpen && user && (
          <Menu
            user={{
              name: user.name || user.email,
              email: user.email,
              avatar: user.photoURL,
              role: user.role || 'Member',
            }}
            onClose={() => setIsMenuOpen(false)}
            mainViewRef={slideAnim}
            scaleRef={scaleAnim}
          />
        )}
      </View>
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
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default App;
