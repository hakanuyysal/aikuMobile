import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionDetails'>;

const SubscriptionDetails = ({navigation}: Props) => {
  const [isAutoRenewalEnabled, setIsAutoRenewalEnabled] = useState(true);
  
  const planFeatures = [
    'List AI solutions',
    'Get investor access',
    'Use premium AI tools',
    'Access to all features',
    'Priority support',
    'Custom AI integration',
  ];

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Subscription Details',
    });
  }, [navigation]);

  const handleAutoRenewalToggle = (value: boolean) => {
    setIsAutoRenewalEnabled(value);
    // Add API call here to update auto renewal status
    console.log('Auto renewal toggled:', value);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? This action cannot be undone.',
      [
        {
          text: 'No, Keep It',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Add cancellation logic here
            console.log('Subscription cancellation confirmed');
          },
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content}>
          {/* Plan Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={[styles.infoValue, styles.activeText]}>Active</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start Date:</Text>
              <Text style={styles.infoValue}>4/25/2025</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Auto Renewal:</Text>
              <View style={styles.toggleContainer}>
                <Text style={[styles.infoValue, {marginRight: 8}]}>
                  {isAutoRenewalEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <Switch
                  trackColor={{false: Colors.inactive, true: '#4CAF50'}}
                  thumbColor={Colors.lightText}
                  ios_backgroundColor={Colors.inactive}
                  onValueChange={handleAutoRenewalToggle}
                  value={isAutoRenewalEnabled}
                  style={Platform.select({
                    ios: {transform: [{scale: 0.8}]},
                    android: {transform: [{scale: 0.9}]},
                  })}
                />
              </View>
            </View>
          </View>

          {/* Payment Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <Text style={styles.infoValue}>Credit Card</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Payment Date:</Text>
              <Text style={styles.infoValue}>4/25/2025</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subscription Plan:</Text>
              <Text style={styles.infoValue}>Startup Plan</Text>
            </View>
          </View>

          {/* Features Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Features</Text>
            {planFeatures.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Icon name="check" size={20} color={Colors.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}>
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </ScrollView>
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
  content: {
    flex: 1,
    padding: metrics.padding.md,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  infoLabel: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    color: '#4CAF50',
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  featureText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginLeft: metrics.margin.sm,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.md,
    alignItems: 'center',
    marginTop: metrics.margin.sm,
    marginBottom: metrics.margin.lg,
  },
  cancelButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
});

export default SubscriptionDetails; 