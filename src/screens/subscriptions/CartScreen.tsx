import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Colors } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import RevenueCatService from '../../services/RevenueCatService';
import { productMapping, planFeatures } from '../../config/revenueCat';
import SubscriptionModal from '../../components/SubscriptionModal';

type CartScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

interface PlanData {
  key: string;
  title: string;
  subtitle: string;
  price: number;
  features: string[];
  revenueCatId?: string;
  trialDays?: number;
}

interface Plan {
  title: string;
  subtitle: string;
  price: number;
  features: string[];
}

type PlanDetails = {
  name: string;
  price: number;
  description: string;
  billingCycle: 'yearly' | 'monthly';
  hasPaymentHistory: boolean;
};

interface PlanProps extends Plan {
  isYearly?: boolean;
  index: number;
  scrollX: Animated.Value;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = metrics.getWidthPercentage(80);
const SPACING = metrics.spacing.md;
const ITEM_TOTAL_WIDTH = CARD_WIDTH + SPACING;
const SIDECARD_OFFSET = (SCREEN_WIDTH - ITEM_TOTAL_WIDTH) / 2;

const PlanCard: React.FC<PlanProps> = ({
  title,
  subtitle,
  price,
  features,
  isYearly,
  index,
  scrollX,
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const [showFreeTrial, setShowFreeTrial] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [revenueCatPackages, setRevenueCatPackages] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    confirmText: '',
    isFreeTrial: false,
    planDetails: null as any,
  });

  const yearlyPrice = title === 'Business Plan' ? 809.99 : title === 'Investor Plan' ? 1000 : Math.floor(price * 12 * 0.9);
  const isStartupPlan = title === 'Startup Plan';

  useEffect(() => {
    const initializePlan = async () => {
      try {
        // RevenueCat paketlerini getir
                  console.log('🔄 Loading RevenueCat packages...');
          const packages = await RevenueCatService.getRevenueCatPackages();
          setRevenueCatPackages(packages);
          console.log('📦 RevenueCat packages loaded:', packages.length);
          
          if (packages.length === 0) {
            console.error('❌ RevenueCat offerings empty! Check offerings in dashboard.');
          } else {
            console.log('✅ RevenueCat offerings loaded successfully');
          }

        // Check user's current subscriptions
        try {
          const subscriptionsResponse = await RevenueCatService.getAllSubscriptions();
          if (subscriptionsResponse.success && subscriptionsResponse.data?.subscriptions) {
            const planName = title.toLowerCase().replace(' plan', '');
            const planPeriod = isYearly ? 'yearly' : 'monthly';
            
            // Check if there's an active subscription for this plan and period
            // Consider subscription active if:
            // 1. status is 'active' OR
            // 2. isActive is true and end date hasn't passed
            const allSubscriptions = subscriptionsResponse.data?.subscriptions || subscriptionsResponse.subscriptions || [];
            console.log(`🔍 Looking for: ${planName} ${planPeriod}`);
            console.log(`📋 All subscriptions:`, allSubscriptions.map(s => `${s.plan} ${s.period} (${s.status})`));
            
            // Önce active olanları bul, sonra cancelled ama active olanları
            const activeSubscriptions = allSubscriptions.filter((sub: any) => {
              const planMatches = sub.plan === planName && sub.period === planPeriod;
              if (!planMatches) return false;
              
              console.log(`🔍 Checking subscription: ${sub.plan} ${sub.period}`);
              console.log(`   Status: ${sub.status}`);
              console.log(`   isActive: ${sub.isActive}`);
              
              // Case 1: Status is active
              if (sub.status === 'active') {
                console.log(`   ✅ Found active subscription`);
                return true;
              }
              
              // Case 2: isActive is true and end date hasn't passed
              if (sub.isActive) {
                const endDate = new Date(sub.nextPaymentDate || sub.startDate);
                const now = new Date();
                const isNotExpired = endDate > now;
                console.log(`   📅 End date: ${endDate}, Now: ${now}, Not expired: ${isNotExpired}`);
                if (isNotExpired) {
                  console.log(`   ✅ Found cancelled but active subscription`);
                  return true;
                }
              }
              
              console.log(`   ❌ Subscription not active`);
              return false;
            });
            
            // En son active olanı seç (en güncel olanı)
            const currentPlan = activeSubscriptions[activeSubscriptions.length - 1];
            
            if (currentPlan) {
              setCurrentSubscription(currentPlan);
              setHasActiveSubscription(true);
              console.log(`✅ Active subscription found: ${planName} ${planPeriod}`);
              console.log(`   Final status: ${currentPlan.status}, isActive: ${currentPlan.isActive}`);
              console.log(`   Selected plan:`, currentPlan);
            } else {
              setHasActiveSubscription(false);
              setCurrentSubscription(null);
              console.log(`❌ No active subscription found: ${planName} ${planPeriod}`);
              console.log(`   Available subscriptions for this plan:`, activeSubscriptions);
            }
          }
        } catch (error) {
          console.log('Error fetching subscriptions:', error);
          setHasActiveSubscription(false);
          setCurrentSubscription(null);
        }

        // Free trial check for Startup plan (sadece görsel için)
        if (!isStartupPlan) {
          setIsStatusLoading(false);
          return;
        }

        setIsStatusLoading(true);

        const token = await AsyncStorage.getItem('token');
        console.log('Token being sent:', token);

        if (!token) {
          setShowFreeTrial(true);
          setIsStatusLoading(false);
          return;
        }

        const api = axios.create({
          baseURL: Config.API_URL || 'https://api.aikuaiplatform.com/api',
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await api.get('/subscriptions/payment-history');
        const history = response.data?.data;

        const hasUsedStartupPlan =
          history &&
          Array.isArray(history) &&
          history.some((p: { plan: string }) => p.plan === 'startup');

        if (hasUsedStartupPlan) {
          setShowFreeTrial(false);
        } else {
          setShowFreeTrial(true);
        }
      } catch (error) {
        console.log('Error initializing plan:', error);
        setShowFreeTrial(false);
      } finally {
        setIsStatusLoading(false);
      }
    };

    initializePlan();
  }, [isStartupPlan, title, isYearly]);

  const inputRange = [
    (index - 1) * ITEM_TOTAL_WIDTH,
    index * ITEM_TOTAL_WIDTH,
    (index + 1) * ITEM_TOTAL_WIDTH,
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1.1, 0.85],
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.75, 1, 0.75],
  });

  const rotateY = scrollX.interpolate({
    inputRange,
    outputRange: ['25deg', '0deg', '-25deg'],
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [30, 0, 30],
  });

  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [-15, 0, 15],
  });



  const handleGetStarted = async () => {
    // Create plan key
    let planName = '';
    if (title === 'Startup Plan') planName = 'startup';
    else if (title === 'Business Plan') planName = 'business';
    else if (title === 'Investor Plan') planName = 'investor';
    
    const planKey = RevenueCatService.createPlanKey(
      planName,
      isYearly ? 'yearly' : 'monthly'
    );
    
    console.log('Created plan key:', planKey);
    console.log('Available product mappings:', Object.keys(productMapping));

    // Find RevenueCat package
    let packageToPurchase = null;
    packageToPurchase = RevenueCatService.findPackageByPlanKey(
      revenueCatPackages,
      planKey
    );

    console.log('Looking for package:', planKey, 'Found:', packageToPurchase ? 'Yes' : 'No');
    console.log('Available packages:', revenueCatPackages.map(p => p.identifier));

    // RevenueCat ile satın alma için modal
    if (packageToPurchase) {
      const priceText = isYearly ? `$${yearlyPrice}/year` : `$${price}/month`;
      
      setModalConfig({
        title: 'Confirm Subscription',
        confirmText: 'Subscribe',
        isFreeTrial: false,
        planDetails: {
          plan: title,
          price: priceText,
          billing: isYearly ? 'Yearly' : 'Monthly',
          autoRenewal: 'Enabled',
          cancelAnytime: 'Yes',
          nextBilling: isYearly ? '1 year' : '1 month',
        },
      });
      setShowModal(true);
    } else {
      console.error('❌ RevenueCat paketi bulunamadı:', planKey);
      console.log('Error', 'Selected plan not found. Please try again.');
    }

    // RevenueCat ile satın alma için modal
    if (packageToPurchase) {
      const priceText = isYearly ? `$${yearlyPrice}/year` : `$${price}/month`;
      
      setModalConfig({
        title: 'Confirm Subscription',
        confirmText: 'Subscribe',
        isFreeTrial: false,
        planDetails: {
          plan: title,
          price: priceText,
          billing: isYearly ? 'Yearly' : 'Monthly',
          autoRenewal: 'Enabled',
          cancelAnytime: 'Yes',
          nextBilling: isYearly ? '1 year' : '1 month',
        },
      });
      setShowModal(true);
    } else {
      console.error('❌ RevenueCat paketi bulunamadı:', planKey);
      console.log('Error', 'Selected plan not found. Please try again.');
    }
  };

  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      setShowModal(false);

      // Create plan key
      let planName = '';
      if (title === 'Startup Plan') planName = 'startup';
      else if (title === 'Business Plan') planName = 'business';
      else if (title === 'Investor Plan') planName = 'investor';
      
      const planKey = RevenueCatService.createPlanKey(
        planName,
        isYearly ? 'yearly' : 'monthly'
      );

      // Find RevenueCat package
      let packageToPurchase = null;
      packageToPurchase = RevenueCatService.findPackageByPlanKey(
        revenueCatPackages,
        planKey
      );

      // RevenueCat satın alma işlemi
      if (packageToPurchase) {
        console.log('🛒 Starting RevenueCat purchase:', packageToPurchase.identifier);
        const result = await RevenueCatService.purchasePackage(packageToPurchase);
        
        if (result.success) {
          console.log('✅ RevenueCat purchase successful:', result.customerInfo);
          navigation.navigate('PaymentSuccess', {
            message: `${title} activated successfully!`,
          });
        } else {
          throw new Error('Purchase failed');
        }
      } else {
        throw new Error('Package not found');
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      
      if (error.userCancelled) {
        Alert.alert('Cancelled', 'Purchase cancelled');
      } else {
        Alert.alert('Error', 'An error occurred during purchase. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
          <Animated.View
        style={[
          styles.planCard,
          hasActiveSubscription && styles.activePlanCard,
          {
            width: CARD_WIDTH,
            transform: [
              { scale },
              { rotateY },
              { translateY },
              { translateX },
              { perspective: 1500 },
            ],
            opacity,
          },
        ]}>
      <View style={{ flex: 1, paddingBottom: 64 }}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
        {hasActiveSubscription ? (
          // Aktif abonelik durumu
          <>
            <Text style={styles.subscriptionType}>
              Active Subscription
            </Text>
            <Text style={styles.price}>
              ${currentSubscription?.amount || price}
              <Text style={styles.period}>/{currentSubscription?.period || (isYearly ? 'year' : 'month')}</Text>
            </Text>
            <Text style={styles.activeStatus}>
              {currentSubscription?.status === 'active' ? '✅ Currently Active' : '⚠️ Cancelled but Active Until Expiry'}
            </Text>
            <Text style={styles.nextPayment}>
              {currentSubscription?.status === 'active' ? 'Next Payment: ' : 'Expires: '}
              {currentSubscription?.nextPaymentDate ? 
                new Date(currentSubscription.nextPaymentDate).toLocaleDateString('en-US') : 
                'N/A'
              }
            </Text>
            

            
            {/* Aktif abonelik için alt alta liste */}
            <View style={styles.activeFeaturesList}>
              {features.map((feature, idx) => (
                <Text key={idx} style={styles.activeFeatureText}>
                  • {feature}
                </Text>
              ))}
            </View>
          </>
        ) : (
          // Yeni abonelik durumu
          <>
            <Text style={styles.subscriptionType}>
              {isYearly ? 'Annual Subscription' : 'Monthly Subscription'}
            </Text>
            <Text style={styles.price}>
              {isStartupPlan && showFreeTrial ? (
                <>
                  <Text style={styles.originalPrice}>$49</Text>{' '}
                  <Text style={styles.newPrice}>$0</Text>
                </>
              ) : (
                `$${isYearly ? yearlyPrice : price}`
              )}
              <Text style={styles.period}>/{isYearly ? 'year' : 'month'}</Text>
              {isYearly && <Text style={styles.discount}> (10% off)</Text>}
            </Text>
            {isStartupPlan && showFreeTrial && (
              <Text  style={styles.trial}>⭐️ 6 month free trial!</Text>
            )}
            {isYearly && title !== 'Startup Plan' && (
              <Text style={styles.trial}>+3 months free with annual plan!</Text>
            )}
            {features.map((feature, idx) => (
              <Text key={idx} style={styles.feature}>
                • {feature}
              </Text>
            ))}
          </>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.button, 
          styles.absoluteButton, 
          (loading || isStatusLoading) && styles.buttonDisabled,
        ]}
        onPress={hasActiveSubscription ? 
          () => navigation.navigate('SubscriptionDetails') : 
          handleGetStarted
        }
        disabled={loading || isStatusLoading}>
        {loading || isStatusLoading ? (
          <ActivityIndicator color={Colors.lightText} />
        ) : (
          <Text style={styles.buttonText}>
            {hasActiveSubscription ? 'Manage Subscription' : 'Get Started'}
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showModal}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        confirmText={modalConfig.confirmText}
        isFreeTrial={modalConfig.isFreeTrial}
        planDetails={modalConfig.planDetails}
      />
    </Animated.View>
  );
};

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const [isYearly, setIsYearly] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={28} color={Colors.lightText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Subscriptions</Text>
            <View style={styles.headerButton} />
          </View>
          <View style={styles.toggleContainer}>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleButton, !isYearly && styles.toggleActive]}
                onPress={() => setIsYearly(false)}>
                <Text
                  style={[
                    styles.toggleText,
                    !isYearly && styles.toggleTextActive,
                  ]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isYearly && styles.toggleActive]}
                onPress={() => setIsYearly(true)}>
                <Text
                  style={[
                    styles.toggleText,
                    isYearly && styles.toggleTextActive,
                  ]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.scrollViewContainer}>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SIDECARD_OFFSET,
              }}
              snapToInterval={ITEM_TOTAL_WIDTH}
              decelerationRate="fast"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true },
              )}
              scrollEventThrottle={16}>
              {plans.map((plan, index) => {
                const { key, ...planProps } = plan;
                return (
                  <View key={key} style={styles.cardWrapper}>
                    <PlanCard
                      {...planProps}
                      isYearly={isYearly}
                      index={index}
                      scrollX={scrollX}
                      navigation={navigation}
                    />
                  </View>
                );
              })}
            </Animated.ScrollView>
          </View>

        </View>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By subscribing, you agree to our{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
              Terms of Use
            </Text>{' '}
            and{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://aikuaiplatform.com/privacy-policy')}>
              Privacy Policy
            </Text>
            . Subscriptions auto-renew unless cancelled.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const plans: PlanData[] = [
  {
    key: 'startup',
    title: 'Startup Plan',
    subtitle: 'For AI Startups & Developers',
    price: 49,
    features: planFeatures.startup,
    revenueCatId: 'startup_monthly',
    trialDays: 180,
  },
  {
    key: 'business',
    title: 'Business Plan',
    subtitle: 'For Companies & Enterprises',
    price: 75,
    features: planFeatures.business,
    revenueCatId: 'business_monthly',
    trialDays: 0,
  },
  {
    key: 'investor',
    title: 'Investor Plan',
    subtitle: 'For VCs & Angel Investors',
    price: 99,
    features: planFeatures.investor,
    revenueCatId: 'investor_monthly',
    trialDays: 0,
  },
];

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.padding.sm,
    height: 56,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
    color: Colors.lightText,
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: metrics.margin.lg,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.circle,
    padding: metrics.padding.xs,
  },
  toggleButton: {
    paddingVertical: metrics.padding.sm,
    paddingHorizontal: metrics.padding.xl,
    borderRadius: metrics.borderRadius.xl,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.md,
  },
  toggleTextActive: {
    color: Colors.lightText,
  },
  scrollViewContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: metrics.scale(80),
  },
  cardWrapper: {
    width: ITEM_TOTAL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  planCard: {
    borderRadius: metrics.borderRadius.xl,
    padding: metrics.padding.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: metrics.scale(15),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(20),
    elevation: 15,
    height: metrics.getHeightPercentage(45),
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: `${Colors.cardBackground}dd`,
    paddingBottom: 64,
  },
  activePlanCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: metrics.scale(20),
    elevation: 25,
  },
  subtitle: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.xs,
  },
  title: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: metrics.margin.sm,
    color: Colors.lightText,
  },
  subscriptionType: {
    fontSize: metrics.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: metrics.margin.sm,
  },
  price: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: metrics.margin.sm,
    color: Colors.lightText,
  },
  period: {
    fontSize: metrics.fontSize.lg,
    color: Colors.inactive,
  },
  discount: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
    marginBottom: metrics.margin.xs,
  },
  trial: {
    color: Colors.star,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.sm,
    fontWeight: 'bold',
  },
  feature: {
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.xs,
    marginTop: metrics.margin.xs,
    color: Colors.lightText,
  },
 

  button: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.circle,
    paddingVertical: metrics.padding.md,
    alignItems: 'center',
    marginTop: metrics.margin.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: metrics.scale(8),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(12),
    elevation: 8,
  },
  absoluteButton: {
    position: 'absolute',
    left: metrics.padding.xl,
    right: metrics.padding.xl,
    bottom: metrics.padding.xl,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    fontWeight: '700',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: Colors.inactive,
    fontSize: metrics.fontSize.xxxl,
    marginRight: metrics.margin.xs,
  },
  newPrice: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  legalContainer: {
    paddingHorizontal: metrics.padding.xl,
    paddingBottom: metrics.padding.xxl *2,
    marginTop: metrics.margin.md,
    alignItems: 'center',
  },
  legalText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  activeStatus: {
    fontSize: metrics.fontSize.sm,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: metrics.margin.sm,
  },
  nextPayment: {
    fontSize: metrics.fontSize.sm,
    color: Colors.inactive,
    marginBottom: metrics.margin.sm,
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  subscriptionDetailsLink: {
    alignItems: 'center',
    paddingVertical: metrics.padding.sm,
  },
  subscriptionDetailsText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.sm,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: metrics.margin.sm,
  },
  featureGridItem: {
    width: '48%',
    marginBottom: metrics.margin.sm,
  },
  featureGridText: {
    fontSize: metrics.fontSize.xs *0,
    color: Colors.lightText,
    lineHeight: 16,
  },
  activeFeaturesList: {
    marginTop: metrics.margin.md,
  },
  activeFeatureText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
    lineHeight: 18,
  },
});

export default CartScreen;