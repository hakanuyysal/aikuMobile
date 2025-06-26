import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import metrics from '../../constants/aikuMetric';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import PaymentService from '../../services/PaymentService';
import LinearGradient from 'react-native-linear-gradient';
import currencyService from '../../services/CurrencyService';

type PaymentScreenProps = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const PaymentScreen: React.FC<PaymentScreenProps> = ({navigation, route}) => {
  const {planDetails, billingInfo} = route.params;
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [_isLoadingRate, setIsLoadingRate] = useState(false);

  // PaymentService için navigation'ı ayarla
  useEffect(() => {
    PaymentService.setNavigation(navigation);
  }, [navigation]);

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const rate = await currencyService.getUSDtoTRYRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    if (groups) {
      return groups.join(' ');
    }
    return text;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await PaymentService.validateCoupon(couponCode, planDetails.name);
      if (response.success) {
        const applyCouponResponse = await PaymentService.applyCoupon(couponCode, planDetails.name);
        if (applyCouponResponse.success) {
          setDiscountedPrice(applyCouponResponse.data.discountedPrice);
          Alert.alert('Success', 'Coupon code applied successfully!');
        }
      } else {
        Alert.alert('Error', response.message || 'Invalid coupon code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while applying the coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!cardNumber || !expiryDate || !cvv || !name) {
        Alert.alert('Error', 'Please fill out all fields');
        return;
      }

      // Expiry date validation and formatting
      const [month, year] = expiryDate.split('/');
      const currentYear = new Date().getFullYear();
      const fullYear = year.length === 2 ? '20' + year : year;
      
      if (parseInt(fullYear) < currentYear) {
        Alert.alert('Error', 'Card expiration year cannot be in the past');
        setLoading(false);
        return;
      }

      // Startup Plan and first payment
      if (planDetails.name === 'Startup Plan' && !planDetails.hasPaymentHistory) {
        const freePaymentData = {
          amount: planDetails.billingCycle === 'yearly' ? 529 : 49,
          description: `$0 First Subscription - ${planDetails.name} (Original: ${planDetails.billingCycle === 'yearly' ? '$529/year' : '$49/month'})`,
          planName: planDetails.name,
          planType: planDetails.name.replace(' Plan', '').toUpperCase() + '_' + planDetails.billingCycle.toUpperCase(),
          billingCycle: planDetails.billingCycle,
          originalPrice: planDetails.billingCycle === 'yearly' ? 529 : 49,
          billingInfo: billingInfo,
          isFirstPayment: true,
          paymentDate: new Date().toISOString(),
          couponCode: couponCode.trim() || null
        };

        const response = await PaymentService.recordFreePayment(freePaymentData);
        if (response.success) {
          navigation.navigate('PaymentSuccess', {
            message: 'Your free trial period has been successfully activated!',
          });
        } else {
          navigation.navigate('PaymentError', {
            message: response.message || 'An error occurred during the payment process.',
          });
        }
        return;
      }

      // Normal payment process
      const amount = discountedPrice || planDetails.price;
      const amountInTRY = exchangeRate ? Math.round(amount * exchangeRate * 100) / 100 : amount * 32;

      const paymentData = {
        planType: planDetails.name.replace(' Plan', '').toUpperCase() + '_' + planDetails.billingCycle.toUpperCase(),
        amount: amountInTRY,
        billingCycle: planDetails.billingCycle,
        billingInfo: billingInfo,
        cardInfo: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardHolderName: name,
          expireMonth: month.padStart(2, '0'),
          expireYear: fullYear,
          cvv,
        },
        couponCode: couponCode.trim() || undefined,
        currency: 'TRY',
        installment: 1,
        originalAmount: amount,
        originalCurrency: 'USD',
        exchangeRate: exchangeRate || 32
      };

      const response = await PaymentService.processPayment(paymentData);

      if (response.success) {
        if (response.data.isRedirect) {
          // Redirect for 3D Secure process
          navigation.navigate('ThreeDSecure', {
            htmlContent: response.data.html,
            returnUrl: response.data.redirectUrl
          });
        } else {
          // Successful payment
          navigation.navigate('PaymentSuccess', {
            message: 'Your payment was successfully completed!',
          });
        }
      } else {
        // Payment error
        navigation.navigate('PaymentError', {
          message: response.message || 'An error occurred during the payment process.',
        });
      }
    } catch (error: any) {
      console.error('Payment process error:', error);
      navigation.navigate('PaymentError', {
        message: error.response?.data?.message || error.message || 'An error occurred during the payment process.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Icon name="chevron-back" size={24} color={Colors.lightText} />
              </TouchableOpacity>
              <Text style={styles.title}>Payment Details</Text>
            </View>

            {/* Plan Info */}
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{planDetails.name}</Text>
              <Text style={styles.planPrice}>
                ${discountedPrice || planDetails.price}
                <Text style={styles.planPricePeriod}>
                  /{planDetails.billingCycle === 'yearly' ? 'year' : 'month'}
                </Text>
              </Text>
              {exchangeRate && (
                <Text style={styles.tryPrice}>
                  ~₺{Math.round((discountedPrice || planDetails.price) * exchangeRate * 100) / 100}
                </Text>
              )}
              <Text style={styles.planDescription}>For AI Startups & Developers</Text>
            </View>

            {/* Card Form */}
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <Icon name="card" size={20} color={Colors.lightText} />
                <Text style={styles.cardHeaderText}>Card Information</Text>
              </View>
              
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Card Number</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="card-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.cardNumberInput]}
                      value={cardNumber}
                      onChangeText={text => setCardNumber(formatCardNumber(text))}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cardholder Name</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="person-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Full Name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <View style={styles.inputWrapper}>
                      <Icon name="calendar-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={expiryDate}
                        onChangeText={text => setExpiryDate(formatExpiryDate(text))}
                        placeholder="MM/YY"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, {flex: 1, marginLeft: 12}]}>
                    <Text style={styles.label}>CVV</Text>
                    <View style={styles.inputWrapper}>
                      <Icon name="lock-closed-outline" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={cvv}
                        onChangeText={setCvv}
                        placeholder="123"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        keyboardType="numeric"
                        maxLength={3}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Coupon */}
            <View style={styles.couponContainer}>
              <Text style={styles.couponTitle}>Have a Coupon Code?</Text>
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Enter coupon code"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
                <TouchableOpacity
                  style={[styles.couponButton, !couponCode.trim() && styles.couponButtonDisabled]}
                  onPress={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}>
                  {isApplyingCoupon ? (
                    <ActivityIndicator size="small" color={Colors.lightText} />
                  ) : (
                    <Text style={styles.couponButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={[styles.payButton, loading && styles.buttonDisabled]}
              onPress={handlePayment}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.lightText} />
              ) : (
                <>
                  <Text style={styles.payButtonText}>
                    Pay {discountedPrice !== null ? `$${discountedPrice}` : `$${planDetails.price}`}
                  </Text>
                  <Icon name="arrow-forward" size={20} color={Colors.lightText} style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: metrics.padding.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: metrics.margin.md,
  },
  title: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
  },
  planInfo: {
    backgroundColor: 'rgba(59, 130, 247, 0.15)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    alignItems: 'center',
  },
  planName: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 32,
    color: Colors.lightText,
    fontWeight: 'bold',
    marginVertical: metrics.margin.xs,
  },
  planPricePeriod: {
    fontSize: metrics.fontSize.md,
    color: 'rgba(255,255,255,0.7)',
  },
  planDescription: {
    fontSize: metrics.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.md,
    marginBottom: metrics.margin.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  cardHeaderText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    fontWeight: '600',
    marginLeft: metrics.margin.xs,
  },
  form: {
    gap: metrics.margin.sm,
  },
  inputGroup: {
    gap: metrics.margin.xs,
  },
  label: {
    fontSize: metrics.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    height: 44,
  },
  inputIcon: {
    marginLeft: metrics.margin.sm,
  },
  input: {
    flex: 1,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    paddingHorizontal: metrics.padding.sm,
  },
  cardNumberInput: {
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  couponContainer: {
    marginBottom: metrics.margin.md,
  },
  couponTitle: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 44,
  },
  couponInput: {
    flex: 1,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    paddingHorizontal: metrics.padding.md,
  },
  couponButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: metrics.padding.lg,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: metrics.borderRadius.md,
    borderBottomRightRadius: metrics.borderRadius.md,
  },
  couponButtonDisabled: {
    opacity: 0.5,
  },
  couponButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.circle,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    marginRight: metrics.margin.sm,
  },
  buttonIcon: {
    marginLeft: metrics.margin.xs,
  },
  tryPrice: {
    fontSize: metrics.fontSize.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: metrics.margin.xs,
  },
});

export default PaymentScreen;