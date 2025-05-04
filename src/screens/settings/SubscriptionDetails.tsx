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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={30}
              color={Colors.lightText}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Details</Text>
        </View>
        <ScrollView style={styles.content}>
          {/* Plan Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={[styles.infoValue, styles.activeText]}>
                  Active
                </Text>
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
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={Colors.primary}
                />
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
  header: {
    padding: metrics.padding.xs,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: metrics.margin.lg,
    top: metrics.margin.xxs * 1.1,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl * 1.1,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: -metrics.margin.xs,
  },
  content: {
    flex: 1,
    padding: metrics.padding.lg,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
