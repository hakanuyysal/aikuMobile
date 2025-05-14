import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import { Colors } from './src/constants/colors';
import UpdateProfileScreen from './src/screens/UpdateProfileScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import SplashScreen from './src/screens/splash/SplashScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Menu from './src/components/Menu';
import SubscriptionDetails from './src/screens/settings/SubscriptionDetails';
import Favorites from './src/screens/Favorites';
import CompanyDetails from './src/screens/CompanyDetails';
import ProductDetails from './src/screens/ProductDetails';
import Settings from './src/screens/settings/Settings';
import ContactUs from './src/screens/settings/ContactUs';
import TermsOfService from './src/screens/legal/TermsOfService';
import PrivacyPolicy from './src/screens/legal/PrivacyPolicy';
import PersonalDataProtection from './src/screens/legal/PersonalDataProtection';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import InvestmentScreen from 'screens/InvestmentDetailsScreen';
import OnboardingScreen from 'screens/onboarding';
import TalentPoolScreen from 'components/TalentPool';
import TrainingDetailScreen from 'components/TrainingDetailScreen';
import PaymentSuccess from 'screens/subscriptions/PaymentSuccess';
import PaymentError from 'screens/subscriptions/PaymentError';
import HowItWorksScreen from 'components/Faq';
import MarketPlaceScreen from 'screens/MarketPlaceScreen';
import ProductDetailsScreen from 'screens/MarketPlaceProductDetails';
import Startups from 'screens/ourcommunity/Startups';
import Investor from 'screens/ourcommunity/Investor';
import Business from 'screens/ourcommunity/Business';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  UpdateProfile: undefined;
  ProfileDetail: undefined;
  SubscriptionDetails: undefined;
  Favorites: undefined;
  CompanyDetails: undefined;
  ProductDetails: undefined;
  Settings: undefined;
  ContactUs: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  PersonalDataProtection: undefined;
  PaymentSuccess: undefined;
  PaymentError: undefined;
  InvestmentDetails: undefined;
  Onboarding: undefined;
  TalentPool: undefined;
  TrainingDetail: undefined;
  MarketPlace: undefined;
  MarketPlaceProductDetails: undefined;
  StartupsDetails: undefined;
  InvestorDetails: undefined;
  BusinessDetails: undefined;
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
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Handle Splash screen timeout
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 9000); // 9 seconds for Splash
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Close menu if user logs out
  useEffect(() => {
    if (!loading && !user) {
      setIsMenuOpen(false);
    }
  }, [user, loading]);

  // Function to handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  // Determine initial route based on state
  const initialRouteName = showOnboarding ? 'Onboarding' : user ? 'Main' : 'Auth';

  return (
    <View style={styles.mainContainer}>
      <Animated.View
        style={[
          styles.mainContent,
          {
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}>
        <RootStack.Navigator initialRouteName={initialRouteName}>
          <RootStack.Screen
            name="Onboarding"
            options={{ headerShown: false }}
          >
            {(props) => (
              <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />
            )}
          </RootStack.Screen>
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
          {user && (
            <>
              <RootStack.Screen
                name="Main"
                component={(props: Props) => (
                  <TabNavigator {...props} onMenuOpen={handleMenuOpen} />
                )}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="UpdateProfile"
                component={UpdateProfileScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="SubscriptionDetails"
                component={SubscriptionDetails}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="Favorites"
                component={Favorites}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="CompanyDetails"
                component={CompanyDetails}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="ProductDetails"
                component={ProductDetails}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="Settings"
                component={Settings}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="ContactUs"
                component={ContactUs}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="TermsOfService"
                component={TermsOfService}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicy}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="PersonalDataProtection"
                component={PersonalDataProtection}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="InvestmentDetails"
                component={InvestmentScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="TalentPool"
                component={TalentPoolScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="TrainingDetail"
                component={TrainingDetailScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="PaymentSuccess"
                component={PaymentSuccess}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="PaymentError"
                component={PaymentError}
                options={{ headerShown: false }}
              />
               <RootStack.Screen
                name="HowItWorksScreen"
                component={HowItWorksScreen}
                options={{ headerShown: false }}
              />
               <RootStack.Screen
                name="MarketPlace"
                component={MarketPlaceScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="MarketPlaceProductDetails"
                component={ProductDetailsScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="StartupsDetails"
                component={Startups}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="InvestorDetails"
                component={Investor}
                options={{ headerShown: false }}
              />
               <RootStack.Screen
                name="BusinessDetails"
                component={Business}
                options={{ headerShown: false }}
              />
            </>
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
  );
}

function App(): React.JSX.Element {
  return (
    <NavigationContainer theme={navigationTheme}>
      <PaperProvider theme={materialTheme}>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
          <AppContent />
        </AuthProvider>
      </PaperProvider>
    </NavigationContainer>
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