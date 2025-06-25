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
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import metrics from '../../constants/aikuMetric';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import PaymentService from '../../services/PaymentService';

type PaymentScreenProps = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const PaymentScreen: React.FC<PaymentScreenProps> = ({navigation, route}) => {
  const {planDetails, billingInfo} = route.params;
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

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

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Form validasyonu
      if (!cardNumber || !expiryDate || !cvv || !name) {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
      }

      // Startup Plan ve ilk kez ödeme yapılıyorsa
      if (planDetails.name === 'Startup Plan' && !planDetails.hasPaymentHistory) {
        const freePaymentData = {
          planType: planDetails.name,
          billingCycle: planDetails.billingCycle,
          billingInfo,
        };

        const response = await PaymentService.recordFreePayment(freePaymentData);
        if (response.success) {
          navigation.navigate('PaymentSuccess', {
            message: 'Your free trial has been successfully activated!',
          });
        } else {
          navigation.navigate('PaymentError', {
            message: response.message || 'An error occurred during payment process.',
          });
        }
        return;
      }

      // Normal ödeme işlemi
      const paymentData = {
        planType: planDetails.name,
        amount: planDetails.price,
        billingCycle: planDetails.billingCycle,
        billingInfo,
        cardInfo: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate: expiryDate.replace('/', ''),
          cvv,
          cardHolderName: name,
        },
      };

      const response = await PaymentService.initiatePayment(paymentData);

      if (response.success) {
        if (response.data.isRedirect) {
          // 3D Secure işlemi için yönlendirme
          navigation.navigate('ThreeDSecure', {
            htmlContent: response.data.htmlContent,
            returnUrl: response.data.returnUrl,
          });
        } else {
          // Başarılı ödeme
          navigation.navigate('PaymentSuccess', {
            message: 'Your payment has been successfully processed!',
          });
        }
      } else {
        // Ödeme hatası
        navigation.navigate('PaymentError', {
          message: response.message || 'An error occurred during payment process.',
        });
      }
    } catch (error: any) {
      console.error('Error during payment process:', error);
      navigation.navigate('PaymentError', {
        message: 'An error occurred during payment process.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Payment</Text>
        </View>

        <View style={styles.planInfo}>
          <Text style={styles.planName}>{planDetails.name}</Text>
          <Text style={styles.planPrice}>
            ${planDetails.price}/{planDetails.billingCycle === 'yearly' ? 'year' : 'month'}
          </Text>
          <Text style={styles.planDescription}>{planDetails.description}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Card Holder Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name on card"
            placeholderTextColor={Colors.secondaryText}
          />

          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={text => setCardNumber(formatCardNumber(text))}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={Colors.secondaryText}
            keyboardType="numeric"
            maxLength={19}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={text => setExpiryDate(formatExpiryDate(text))}
                placeholder="MM/YY"
                placeholderTextColor={Colors.secondaryText}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor={Colors.secondaryText}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.lightText} />
          ) : (
            <Text style={styles.buttonText}>Complete Payment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: metrics.padding.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.xl,
  },
  backButton: {
    padding: metrics.padding.sm,
    marginRight: metrics.margin.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  planInfo: {
    backgroundColor: Colors.card,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.xl,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: metrics.margin.sm,
  },
  planPrice: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: metrics.margin.sm,
  },
  planDescription: {
    fontSize: 16,
    color: Colors.secondaryText,
  },
  form: {
    marginBottom: metrics.margin.xl,
  },
  label: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: metrics.margin.sm,
  },
  input: {
    backgroundColor: Colors.input,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    fontSize: 16,
    color: Colors.text,
    marginBottom: metrics.margin.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;