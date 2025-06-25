import React, {useState, useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar} from 'react-native';
import {Provider as PaperProvider, MD3DarkTheme} from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import {Colors} from './src/constants/colors';
import UpdateProfileScreen from './src/screens/UpdateProfileScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import SplashScreen from './src/screens/splash/SplashScreen';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
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
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import InvestmentScreen from 'screens/InvestmentDetailsScreen';
import OnboardingScreen from 'screens/onboarding';
import TalentPoolScreen from 'components/TalentPool';
import TrainingDetailScreen from 'components/TrainingDetailScreen';
import PaymentSuccess from 'screens/subscriptions/PaymentSuccess';
import PaymentError from 'screens/subscriptions/PaymentError';
import BillingInfoScreen from 'screens/subscriptions/BillingInfoScreen';
import PaymentScreen from 'screens/subscriptions/PaymentScreen';
import HowItWorksScreen from 'components/Faq';
import MarketPlaceScreen from 'screens/MarketPlaceScreen';
import ProductDetailsScreen from 'screens/MarketPlaceProductDetails';
import Startups from 'screens/ourcommunity/Startups';
import Investor from 'screens/ourcommunity/Investor';
import Business from 'screens/ourcommunity/Business';
import InvestorDetails from 'screens/Investor/InvestorDetailsScreen';
import AddBlogPostScreen from './src/screens/AddBlogPostScreen';
import AddProduct from './src/screens/AddProduct';
import {ChatProvider} from './src/contexts/ChatContext';
import ChatScreen from './src/screens/ChatScreen';
import SubscriptionNavigator from './src/navigation/SubscriptionNavigator';
import {
  useAppInitialization,
  markOnboardingComplete,
} from './src/hooks/useAppInitialization';
import { Company } from './src/services/companyService';
import { BillingInfo } from './src/types';
import authService from './src/services/AuthService';
import { useNavigation } from '@react-navigation/native';
import AddBillingInfo from './src/screens/subscriptions/AddBillingInfo';

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  UpdateProfile: undefined;
  ProfileDetail: undefined;
  SubscriptionDetails: undefined;
  Favorites: undefined;
  CompanyDetails: undefined;
  ProductDetails: {id: string};
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
  InvestorMenuDetails: undefined;
  AddBlogPost: undefined;
  AddProduct: undefined;
  Chat: undefined;
  HowItWorks: undefined;
  CompanyProfile: { company: Company };
  BillingInfo: {
    planDetails: {
      name: string;
      price: number;
      description: string;
      billingCycle: 'yearly' | 'monthly';
      hasPaymentHistory?: boolean;
    };
    hasExistingBillingInfo?: boolean;
    existingBillingInfo?: BillingInfo;
  };
  Payment: {planDetails: any; billingInfo: any};
  AddBillingInfo: {
    planDetails: {
      name: string;
      price: number;
      description: string;
      billingCycle: 'yearly' | 'monthly';
      hasPaymentHistory?: boolean;
    };
  };
};

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
  const { user, refreshUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const {showSplash, initialRoute} = useAppInitialization();
  const navigation = useNavigation<import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const onLogin = async (user: any) => {
      await refreshUser?.(); // context'teki kullanıcıyı güncelle
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    };
    authService.authEvents.on('login', onLogin);
    return () => {
      authService.authEvents.off('login', onLogin);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setIsMenuOpen(false);
    }
  }, [user]);

  if (showSplash) {
    return <SplashScreen />;
  }

  const MainScreen = (props: any) => {
    const handleMenuOpen = () => {
      setIsMenuOpen(true);
    };
    return <TabNavigator {...props} onMenuOpen={handleMenuOpen} />;
  };

  return (
    <View style={styles.mainContainer}>
      <Animated.View
        style={[
          styles.mainContent,
          {
            transform: [{translateX: slideAnim}, {scale: scaleAnim}],
          },
        ]}>
        <RootStack.Navigator initialRouteName={initialRoute}>
          <RootStack.Screen name="Onboarding" options={{headerShown: false}}>
            {props => (
              <OnboardingScreen
                {...props}
                onComplete={markOnboardingComplete}
              />
            )}
          </RootStack.Screen>
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Main"
            component={MainScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="UpdateProfile"
            component={UpdateProfileScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="SubscriptionDetails"
            component={SubscriptionDetails}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Favorites"
            component={Favorites}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="CompanyDetails"
            component={CompanyDetails}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="ProductDetails"
            component={ProductDetails}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Settings"
            component={Settings}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="ContactUs"
            component={ContactUs}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="TermsOfService"
            component={TermsOfService}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicy}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="PersonalDataProtection"
            component={PersonalDataProtection}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="InvestmentDetails"
            component={InvestmentScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="TalentPool"
            component={TalentPoolScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="TrainingDetail"
            component={TrainingDetailScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="PaymentSuccess"
            component={PaymentSuccess}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="PaymentError"
            component={PaymentError}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="HowItWorks"
            component={HowItWorksScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="MarketPlace"
            component={MarketPlaceScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="MarketPlaceProductDetails"
            component={ProductDetailsScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="StartupsDetails"
            component={Startups}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="InvestorDetails"
            component={Investor}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="BusinessDetails"
            component={Business}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="InvestorMenuDetails"
            component={InvestorDetails}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="AddBlogPost"
            component={AddBlogPostScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="AddProduct"
            component={AddProduct}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Chat"
            component={ChatScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="CompanyProfile"
            component={CompanyDetails}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="BillingInfo"
            component={BillingInfoScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="AddBillingInfo"
            component={AddBillingInfo}
            options={{
              title: 'Fatura Bilgileri',
              headerShown: true,
            }}
          />
        </RootStack.Navigator>
      </Animated.View>
      {isMenuOpen && (
        <Menu
          user={user}
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
    <AuthProvider>
      <PaperProvider theme={materialTheme}>
        <NavigationContainer theme={navigationTheme}>
          <ChatProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor={Colors.background}
            />
            <AppContent />
          </ChatProvider>
        </NavigationContainer>
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
