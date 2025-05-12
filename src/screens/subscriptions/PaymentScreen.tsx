import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import metrics from '../../constants/aikuMetric';
import LinearGradient from 'react-native-linear-gradient';
import {PaymentScreenProps} from '../../types';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../App';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  couponCode: string;
}

interface FormErrors {
  [key: string]: string;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({navigation: stackNavigation, route}) => {
  const {planDetails} = route.params;
  const rootNavigation = useNavigation<RootNavigationProp>();
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    couponCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCouponInput, setShowCouponInput] = useState(false);

  const navigateToLegalScreen = (screenName: keyof RootStackParamList) => {
    rootNavigation.navigate(screenName);
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Kart numarası formatlaması
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').substring(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    }
    // Ay formatlaması
    else if (field === 'expiryMonth') {
      formattedValue = value.replace(/\D/g, '').substring(0, 2);
      if (parseInt(formattedValue) > 12) formattedValue = '12';
    }
    // Yıl formatlaması
    else if (field === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    // CVC formatlaması
    else if (field === 'cvc') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }

    setFormData(prev => ({...prev, [field]: formattedValue}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    if (!formData.expiryMonth.match(/^(0[1-9]|1[0-2])$/)) {
      newErrors.expiryMonth = 'Invalid month';
    }
    if (!formData.expiryYear.match(/^\d{4}$/)) {
      newErrors.expiryYear = 'Invalid year';
    }
    if (!formData.cvc.match(/^\d{3}$/)) {
      newErrors.cvc = 'Invalid CVC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = () => {
    if (validateForm()) {
      rootNavigation.navigate('PaymentSuccess');
    }
  };

  const handleApplyCoupon = () => {
    if (formData.couponCode.trim()) {
      Alert.alert('Info', 'Validating coupon code...');
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <Text style={styles.errorText}>{errors[field]}</Text>;
    }
    return null;
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => stackNavigation.goBack()}>
            <Icon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Details</Text>
        </View>

        <ScrollView style={styles.container}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Number</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="card-outline"
                size={20}
                color={Colors.inactive}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.cardNumber && styles.inputError]}
                value={formData.cardNumber}
                onChangeText={value => handleInputChange('cardNumber', value)}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={Colors.inactive}
                keyboardType="numeric"
              />
            </View>
            {renderError('cardNumber')}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cardholder Name</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="person-outline"
                size={20}
                color={Colors.inactive}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  errors.cardholderName && styles.inputError,
                ]}
                value={formData.cardholderName}
                onChangeText={value =>
                  handleInputChange('cardholderName', value)
                }
                placeholder="Full Name"
                placeholderTextColor={Colors.inactive}
                autoCapitalize="words"
              />
            </View>
            {renderError('cardholderName')}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
              <Text style={styles.label}>Expiration Date</Text>
              <View style={styles.expiryContainer}>
                <View style={[styles.inputWrapper, {flex: 1, marginRight: 5}]}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.expiryMonth && styles.inputError,
                    ]}
                    value={formData.expiryMonth}
                    onChangeText={value =>
                      handleInputChange('expiryMonth', value)
                    }
                    placeholder="MM"
                    placeholderTextColor={Colors.inactive}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <Text style={styles.expiryDivider}>/</Text>
                <View style={[styles.inputWrapper, {flex: 1, marginLeft: 5}]}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.expiryYear && styles.inputError,
                    ]}
                    value={formData.expiryYear}
                    onChangeText={value =>
                      handleInputChange('expiryYear', value)
                    }
                    placeholder="YYYY"
                    placeholderTextColor={Colors.inactive}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
              {(errors.expiryMonth || errors.expiryYear) && (
                <Text style={styles.errorText}>
                  {errors.expiryMonth || errors.expiryYear}
                </Text>
              )}
            </View>

            <View style={[styles.inputContainer, {flex: 1}]}>
              <Text style={styles.label}>CVC/CVV</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, errors.cvc && styles.inputError]}
                  value={formData.cvc}
                  onChangeText={value => handleInputChange('cvc', value)}
                  placeholder="123"
                  placeholderTextColor={Colors.inactive}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
              {renderError('cvc')}
            </View>
          </View>

          <TouchableOpacity
            style={styles.useCouponButton}
            onPress={() => setShowCouponInput(!showCouponInput)}>
            <Icon
              name={showCouponInput ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.useCouponText}>
              {showCouponInput ? 'Hide Coupon Code' : 'Use Coupon Code'}
            </Text>
          </TouchableOpacity>

          {showCouponInput && (
            <View style={styles.couponContainer}>
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  value={formData.couponCode}
                  onChangeText={value => handleInputChange('couponCode', value)}
                  placeholder="Enter coupon code"
                  placeholderTextColor={Colors.inactive}
                />
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyCoupon}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By clicking "Pay", you agree to our{' '}
              <Text 
                onPress={() => navigateToLegalScreen('TermsOfService')}
                style={styles.termsLink}>
                Terms of Service
              </Text> and{' '}
              <Text 
                onPress={() => navigateToLegalScreen('PrivacyPolicy')}
                style={styles.termsLink}>
                Privacy Policy
              </Text> and acknowledge our{' '}
              <Text 
                onPress={() => navigateToLegalScreen('PersonalDataProtection')}
                style={styles.termsLink}>
                Personal Data Protection Notice
              </Text>.
            </Text>
          </View>

          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <Text style={styles.payButtonText}>Pay ${planDetails.price}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: metrics.padding.lg,
  },
  header: {
    padding: metrics.padding.md,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    left: metrics.margin.lg,
    zIndex: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  inputContainer: {
    marginBottom: metrics.margin.lg,
  },
  label: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.inactive,
  },
  inputIcon: {
    marginRight: metrics.margin.sm,
  },
  input: {
    flex: 1,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    paddingVertical: metrics.padding.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryDivider: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    marginHorizontal: metrics.margin.xs,
  },
  errorText: {
    color: '#ff4444',
    fontSize: metrics.fontSize.xs,
    marginTop: metrics.margin.xs,
  },
  inputError: {
    borderBottomColor: '#ff4444',
  },
  useCouponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: metrics.margin.sm,
    alignSelf: 'flex-start',
  },
  useCouponText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
    marginLeft: metrics.margin.sm,
  },
  couponContainer: {
    marginBottom: metrics.margin.lg,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inactive,
    borderRadius: metrics.borderRadius.md,
    overflow: 'hidden',
  },
  couponInput: {
    flex: 1,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    padding: metrics.padding.md,
  },
  applyButton: {
    backgroundColor: Colors.inactive,
    padding: metrics.padding.md,
  },
  applyButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  termsContainer: {
    marginTop: metrics.margin.xl,
    marginBottom: metrics.margin.lg,
  },
  termsText: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
    lineHeight: metrics.fontSize.lg * 1,
  },
  termsLink: {
    color: Colors.primary,
  },
  payButton: {
    backgroundColor: Colors.primary,
    padding: metrics.padding.lg,
    borderRadius: metrics.borderRadius.md,
    alignItems: 'center',
    marginBottom: metrics.margin.xl,
    width: '80%',
    alignSelf: 'center',
  },
  payButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;