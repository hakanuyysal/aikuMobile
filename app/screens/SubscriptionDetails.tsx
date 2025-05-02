import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../src/constants/colors';
import metrics from '../../src/constants/aikuMetric';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

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

  const handleAutoRenewalToggle = () => {
    setIsAutoRenewalEnabled(!isAutoRenewalEnabled);
    // Add API call here to update auto renewal status
    console.log('Auto renewal toggled:', !isAutoRenewalEnabled);
  };

  const handleCancelSubscription = () => {
    // Add cancellation logic here
    console.log('Subscription cancellation requested');
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
              <TouchableOpacity 
                style={styles.toggleContainer}
                onPress={handleAutoRenewalToggle}>
                <Text style={[styles.infoValue, {marginRight: 8}]}>
                  {isAutoRenewalEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <View style={[styles.toggle, isAutoRenewalEnabled && styles.toggleActive]} />
              </TouchableOpacity>
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
    marginBottom: metrics.margin.lg,
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
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.inactive,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
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
    marginTop: metrics.margin.md,
    marginBottom: metrics.margin.xl,
  },
  cancelButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
});

export default SubscriptionDetails; 