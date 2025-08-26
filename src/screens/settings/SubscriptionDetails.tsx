import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';
import RevenueCatService, {
  Subscription,
} from '../../services/RevenueCatService';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionDetails'>;

const SubscriptionDetails = ({navigation}: Props) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [togglingRenewal, setTogglingRenewal] = useState<string | null>(null);

  const getPlanName = (plan: string) => {
    const planMap = {
      startup: 'Startup Plan',
      business: 'Business Plan',
      investor: 'Investor Plan',
    };
    return planMap[plan as keyof typeof planMap] || plan;
  };

  const getPeriodName = (period: string) => {
    const periodMap = {
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return periodMap[period as keyof typeof periodMap] || period;
  };

  const getStatusColor = (subscription: Subscription) => {
    if (subscription.status === 'active') {
      return '#4CAF50';
    } else if (subscription.status === 'cancelled' && subscription.isActive) {
      return '#FFC107'; // Sarı renk
    } else if (subscription.status === 'cancelled') {
      return '#FF5722';
    } else if (subscription.status === 'expired') {
      return '#FF9800';
    } else {
      return Colors.lightText;
    }
  };

  const getStatusText = (subscription: Subscription) => {
    if (subscription.status === 'active') {
      return 'Active';
    } else if (subscription.status === 'cancelled' && subscription.isActive) {
      return 'Cancelled but Active Until Expiry';
    } else if (subscription.status === 'cancelled') {
      return 'Cancelled';
    } else if (subscription.status === 'expired') {
      return 'Expired';
    } else {
      return subscription.status;
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Subscription Details',
    });
  }, [navigation]);

  React.useEffect(() => {
    fetchSubscriptions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchSubscriptions();
    }, []),
  );

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await RevenueCatService.getAllSubscriptions();
      if (response.success) {
        setSubscriptions(response.data?.subscriptions || response.subscriptions || []);
      } else {
        setError(response.message || 'Failed to fetch subscriptions');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel your ${getPlanName(
        subscription.plan,
      )} subscription? This action cannot be undone.`,
      [
        {
          text: 'No, Keep It',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(subscription._id);
            try {
              const response = await RevenueCatService.cancelSubscription(
                subscription._id,
              );
              if (response.success) {
                Alert.alert(
                  'Success',
                  'Your subscription has been cancelled successfully.',
                );
                fetchSubscriptions();
              } else {
                Alert.alert(
                  'Error',
                  response.message || 'Failed to cancel subscription',
                );
              }
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.message || 'Failed to cancel subscription',
              );
            } finally {
              setCancelling(null);
            }
          },
        },
      ],
    );
  };

  const handleToggleAutoRenewal = async (subscription: Subscription) => {
    setTogglingRenewal(subscription._id);
    try {
      const response = await RevenueCatService.toggleAutoRenewal(subscription._id);
      if (response.success) {
        // Update local state immediately for better UX
        setSubscriptions(prevSubscriptions => 
          prevSubscriptions.map(sub => 
            sub._id === subscription._id 
              ? { ...sub, autoRenewal: !sub.autoRenewal }
              : sub
          )
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to toggle auto-renewal');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to toggle auto-renewal');
    } finally {
      setTogglingRenewal(null);
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: '#fff'}}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'red'}}>{error}</Text>
      </View>
    );
  }

  // Abonelik yoksa özel ekran
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <LinearGradient
        colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{x: 0, y: 0}}
        end={{x: 2, y: 1}}
        style={{flex: 1}}>
        <SafeAreaView style={{flex: 1}}>
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
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 16,
                textAlign: 'center',
              }}>
              You don't have any subscriptions yet.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 24,
                paddingVertical: 14,
                paddingHorizontal: 32,
              }}
              onPress={() => navigation.navigate('Cart')}>
              <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>
                Subscribe Now
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          {subscriptions.map((subscription) => (
            <View key={subscription._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {getPlanName(subscription.plan)}
                </Text>
              </View>
              
              {/* İptal edilmiş ama aktif abonelikler için uyarı mesajı */}
              {subscription.status === 'cancelled' && subscription.isActive && (
                <View style={styles.warningContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={16}
                    color="#FFC107"
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.warningText}>
                    Cancelled but Active Until Expiry
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plan:</Text>
                <Text style={styles.infoValue}>
                  {getPlanName(subscription.plan)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Period:</Text>
                <Text style={styles.infoValue}>
                  {getPeriodName(subscription.period)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Amount:</Text>
                <Text style={styles.infoValue}>${subscription.amount}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Start Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(subscription.startDate).toLocaleDateString('en-US')}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Payment:</Text>
                <Text style={styles.infoValue}>
                  {new Date(subscription.lastPaymentDate).toLocaleDateString(
                    'en-US',
                  )}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {subscription.status === 'active' ? 'Next Payment:' : 'Expires:'}
                </Text>
                <Text style={styles.infoValue}>
                  {new Date(subscription.nextPaymentDate).toLocaleDateString(
                    'en-US',
                  )}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Auto Renewal:</Text>
                <View style={styles.toggleContainer}>
                  <Text style={[styles.infoValue, {marginRight: 8}]}>
                    {subscription.autoRenewal ? 'Enabled' : 'Disabled'}
                  </Text>
                  <Switch
                    trackColor={{false: Colors.inactive, true: '#4CAF50'}}
                    thumbColor={Colors.lightText}
                    ios_backgroundColor={Colors.inactive}
                    onValueChange={() => handleToggleAutoRenewal(subscription)}
                    value={subscription.autoRenewal}
                    disabled={togglingRenewal === subscription._id || (subscription.status !== 'active' && subscription.status !== 'trial')}
                    style={Platform.select({
                      ios: {transform: [{scale: 0.8}]},
                      android: {transform: [{scale: 0.9}]},
                    })}
                  />
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method:</Text>
                <Text style={styles.infoValue}>
                  {subscription.paymentMethod}
                </Text>
              </View>

              {(subscription.status === 'active' || subscription.status === 'trial') && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelSubscription(subscription)}
                  disabled={cancelling === subscription._id}>
                  <Text style={styles.cancelButtonText}>
                    {cancelling === subscription._id
                      ? 'Cancelling...'
                      : 'Cancel Subscription'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
                      <Text style={styles.legalText}>
              By using our services, you agree to our{' '}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  cardTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: metrics.fontSize.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: metrics.borderRadius.md,
    paddingVertical: metrics.padding.sm,
    paddingHorizontal: metrics.padding.lg,
    alignItems: 'center',
    marginTop: metrics.margin.md,
  },
  cancelButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  legalContainer: {
    paddingHorizontal: metrics.padding.lg,
    paddingBottom: metrics.padding.sm,
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: metrics.borderRadius.sm,
    padding: metrics.padding.sm,
    marginBottom: metrics.margin.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    fontSize: metrics.fontSize.sm,
    color: '#FFC107',
    fontWeight: '600',
  },
});

export default SubscriptionDetails;
