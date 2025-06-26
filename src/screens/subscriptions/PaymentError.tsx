import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import LinearGradient from 'react-native-linear-gradient';

type PaymentErrorScreenParams = {
  message: string;
  planDetails?: {
    name: string;
    price: number;
    description: string;
    billingCycle: 'yearly' | 'monthly';
    hasPaymentHistory?: boolean;
  };
  billingInfo?: any;
};

type PaymentErrorProps = NativeStackScreenProps<
  RootStackParamList,
  'PaymentError'
>;

const PaymentError: React.FC<PaymentErrorProps> = ({navigation, route}) => {
  const {message, planDetails, billingInfo} = route.params as PaymentErrorScreenParams;

  const handleTryAgain = () => {
    if (planDetails && billingInfo) {
      navigation.navigate('Payment', {
        planDetails,
        billingInfo,
      });
    } else {
      navigation.navigate('Main');
    }
  };

  const handleClose = () => {
    navigation.navigate('Main');
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={24} color={Colors.lightText} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Icon name="close-circle" size={80} color="#FF4B55" />
          </View>

          {/* Error Message */}
          <Text style={styles.title}>Error!</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Try Again Button */}
          <TouchableOpacity style={styles.tryAgainButton} onPress={handleTryAgain}>
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: metrics.padding.lg,
  },
  iconContainer: {
    marginBottom: metrics.margin.lg,
  },
  title: {
    fontSize: metrics.fontSize.xl,
    color: Colors.lightText,
    fontWeight: 'bold',
    marginBottom: metrics.margin.sm,
  },
  message: {
    fontSize: metrics.fontSize.md,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: metrics.margin.xl,
  },
  tryAgainButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: metrics.padding.xl,
    paddingVertical: metrics.padding.md,
    borderRadius: metrics.borderRadius.circle,
    minWidth: 200,
    alignItems: 'center',
  },
  tryAgainText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
  },
});

export default PaymentError; 