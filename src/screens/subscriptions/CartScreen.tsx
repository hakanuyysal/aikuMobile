import React, {useState, useRef, useEffect} from 'react';
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
} from 'react-native';
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';
import {RootStackParamList} from '../../types';
import BillingService from '../../services/BillingService';
import {BillingInfo} from '../../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import PaymentService from '../../services/PaymentService';
import {z} from 'zod';

type CartScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

interface PlanData {
  key: string;
  title: string;
  subtitle: string;
  price: number;
  features: string[];
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

const {width: SCREEN_WIDTH} = Dimensions.get('window');
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

  const yearlyPrice = Math.floor(price * 12 * 0.9);
  const isStartupPlan = title === 'Startup Plan';

  useEffect(() => {
    const checkUserEligibility = async () => {
      if (!isStartupPlan) {
        setIsStatusLoading(false);
        return;
      }
  
      setIsStatusLoading(true);
  
      try {
        const token = await AsyncStorage.getItem('token');
        
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
        
        const hasUsedStartupPlan = history && Array.isArray(history) && history.some((p: { plan: string }) => p.plan === 'startup');

        if (hasUsedStartupPlan) {
          setShowFreeTrial(false);
        } else {
          setShowFreeTrial(true);
        }
  
      } catch (error) {
        console.log('Error checking user eligibility:', error);
        setShowFreeTrial(false);
      } finally {
        setIsStatusLoading(false);
      }
    };
  
    checkUserEligibility();
  }, [isStartupPlan]);

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

  const handleStartFreeTrial = async () => {
    console.log('--- handleStartFreeTrial ÇAĞRILDI ---');
    try {
      console.log('Fatura bilgisi alınıyor...');
      let billingInfo;
      let billingError = null;
      try {
        const billingResponse = await BillingService.getDefaultBillingInfo();
        console.log('billingResponse:', billingResponse);
        if (billingResponse && billingResponse.success && billingResponse.data) {
          billingInfo = billingResponse.data;
        } else {
          billingError = billingResponse?.message || 'Fatura bilgisi alınamadı';
        }
      } catch (err: any) {
        console.log('Fatura bilgisi alınırken catch:', err);
        billingError = err?.message || 'Fatura bilgisi alınamadı';
      }

      if (!billingInfo) {
        console.log('Fatura bilgisi YOK veya alınamadı, kullanıcı yönlendiriliyor.', billingError);
        Alert.alert(
          'Billing Information Required',
          'You need to add billing information before starting the free trial.',
          [
            {
              text: 'Add Billing Information',
              onPress: () => {
                console.log('User navigated to billing information screen.');
                navigation.navigate('BillingInfo', {
                  planDetails: {
                    name: title,
                    price: isYearly ? yearlyPrice : price,
                    description: subtitle,
                    billingCycle: isYearly ? 'yearly' : 'monthly',
                    hasPaymentHistory: false,
                  },
                  hasExistingBillingInfo: false,
                  existingBillingInfo: null,
                });
              },
            },
          ]
        );
        return;
      }

      const freePaymentData = {
        amount: isYearly ? yearlyPrice : price,
        description: `$0 First Subscription - ${title} (Original: $${isYearly ? yearlyPrice : price} / ${isYearly ? 'year' : 'month'})`,
        planName: title,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        originalPrice: isYearly ? yearlyPrice : price,
        isFirstPayment: true,
        paymentDate: new Date().toISOString(),
        billingInfo: billingInfo,
      };
      console.log('freePaymentData:', freePaymentData);

      const response = await PaymentService.recordFreePayment(freePaymentData);
      console.log('recordFreePayment response:', response);

      if (response && response.success) {
        console.log('Successfully registered, navigating to PaymentSuccess screen.');
        navigation.navigate('PaymentSuccess', {
          message: 'Your free trial has started!',
        });
      } else {
        console.log('API success=false or no response:', response);
        Alert.alert('Error', response?.message || 'An error occurred.');
      }
    } catch (error: any) {
      console.log('catch bloğu, hata:', error, error?.response?.data);
      Alert.alert('Error', error.message || 'An error occurred.');
    }
  };

  const handleGetStarted = async () => {
    console.log('--- handleGetStarted ÇAĞRILDI ---');
    setLoading(true);
    try {
      if (showFreeTrial) {
        console.log('showFreeTrial TRUE, handleStartFreeTrial çağrılıyor.');
        await handleStartFreeTrial();
        setLoading(false);
        return;
      }

      console.log('Fatura bilgisi alınıyor...');
      const billingResponse = await BillingService.getDefaultBillingInfo();
      console.log('billingResponse:', billingResponse);
      const billingInfo = billingResponse?.data as BillingInfo | undefined;
      const hasBillingInfo = billingInfo && !Array.isArray(billingInfo);
      console.log('billingInfo:', billingInfo, 'hasBillingInfo:', hasBillingInfo);

      const finalPrice = isYearly ? yearlyPrice : price;
      const planDetails: PlanDetails = {
        name: title,
        price: finalPrice,
        description: subtitle,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        hasPaymentHistory: !showFreeTrial,
      };
      console.log('planDetails:', planDetails);

      navigation.navigate('BillingInfoScreen', {
        planDetails: {
          name: title,
          price: isYearly ? yearlyPrice : price,
          description: subtitle,
          billingCycle: isYearly ? 'yearly' : 'monthly',
          hasPaymentHistory: !showFreeTrial,
        },
        hasExistingBillingInfo: hasBillingInfo,
        existingBillingInfo: billingInfo,
      });
    } catch (error: any) {
      console.log('catch bloğu, hata:', error);
      Alert.alert('Error', error.message || 'An error occurred.');
      const errorPlanDetails: PlanDetails = {
        name: title,
        price: isYearly ? yearlyPrice : price,
        description: subtitle,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        hasPaymentHistory: !showFreeTrial,
      };
      navigation.navigate('BillingInfoScreen', {
        planDetails: errorPlanDetails,
        hasExistingBillingInfo: false,
        existingBillingInfo: null,
      });
    } finally {
      setLoading(false);
      console.log('--- handleGetStarted BİTTİ ---');
    }
  };

  return (
    <Animated.View
      style={[
        styles.planCard,
        {
          width: CARD_WIDTH,
          transform: [
            {scale},
            {rotateY},
            {translateY},
            {translateX},
            {perspective: 1500},
          ],
          opacity,
        },
      ]}>
      <View style={{flex: 1, paddingBottom: 64}}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
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
          <Text style={styles.trial}>⭐️ 6 month free trial!</Text>
        )}
        {isYearly && title !== 'Startup Plan' && (
          <Text style={styles.trial}>+3 months free with annual plan!</Text>
        )}
        {features.map((feature, idx) => (
          <Text key={idx} style={styles.feature}>
            • {feature}
          </Text>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.button, styles.absoluteButton, (loading || isStatusLoading) && styles.buttonDisabled]}
        onPress={handleGetStarted}
        disabled={loading || isStatusLoading}>
        {loading || isStatusLoading ? (
          <ActivityIndicator color={Colors.lightText} />
        ) : (
          <Text style={styles.buttonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const CartScreen: React.FC<CartScreenProps> = ({navigation}) => {
  const [isYearly, setIsYearly] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
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
                [{nativeEvent: {contentOffset: {x: scrollX}}}],
                {useNativeDriver: true},
              )}
              scrollEventThrottle={16}>
              {plans.map((plan, index) => {
                const {key, ...planProps} = plan;
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
    features: [
      'List AI solutions',
      'Get investor access',
      'Use premium AI tools',
      'Chat with businesses and investors',
    ],
  },
  {
    key: 'business',
    title: 'Business Plan',
    subtitle: 'For Companies & Enterprises',
    price: 75,
    features: [
      'AI discovery',
      'API integrations',
      'Exclusive tools',
      'Chat with all companies',
    ],
  },
  {
    key: 'investor',
    title: 'Investor Plan',
    subtitle: 'For VCs & Angel Investors',
    price: 99,
    features: [
      'AI startup deal flow',
      'Analytics',
      'AI-powered investment insights',
      'Chat with all companies',
    ],
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
    height: metrics.getHeightPercentage(52),
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: `${Colors.cardBackground}dd`,
    paddingBottom: 64,
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
  description: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.sm,
    lineHeight: metrics.scale(16),
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
});

export default CartScreen;