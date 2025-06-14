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
import BaseService from '../../services/BaseService';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionDetails'>;

const SubscriptionDetails = ({navigation}: Props) => {
  const [isAutoRenewalEnabled, setIsAutoRenewalEnabled] = useState(true);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAutoRenewal, setUpdatingAutoRenewal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await BaseService.getCurrentUser();
      setPlanInfo(user.subscription || {});
      setIsAutoRenewalEnabled(!!user.subscription?.autoRenewal);
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoRenewalToggle = async (value: boolean) => {
    setUpdatingAutoRenewal(true);
    try {
      await BaseService.toggleAutoRenewal(value);
      setIsAutoRenewalEnabled(value);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Otomatik yenileme güncellenemedi');
    } finally {
      setUpdatingAutoRenewal(false);
    }
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
          onPress: async () => {
            setCancelling(true);
            try {
              await BaseService.cancelSubscription();
              Alert.alert('Başarılı', 'Aboneliğiniz iptal edildi.');
              fetchData();
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Abonelik iptal edilemedi');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{color:'#fff'}}>Yükleniyor...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{color:'red'}}>{error}</Text>
      </View>
    );
  }

  // Abonelik yoksa özel ekran
  if (!planInfo || !planInfo.status) {
    return (
      <LinearGradient
        colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{x: 0, y: 0}}
        end={{x: 2, y: 1}}
        style={{flex:1}}>
        <SafeAreaView style={{flex:1}}>
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
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text style={{color:'#fff', fontSize:16, fontWeight:'500', marginBottom:16, textAlign:'center'}}>You do not have any subscription.</Text>
            <TouchableOpacity
              style={{backgroundColor: Colors.primary, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32}}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={{color:'#fff', fontSize:18, fontWeight:'bold'}}>Subscribe Now</Text>
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
          {/* Plan Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <MaterialCommunityIcons
                  name={planInfo?.status === 'active' ? 'check-circle' : 'close-circle'}
                  size={20}
                  color={planInfo?.status === 'active' ? '#4CAF50' : 'red'}
                />
                <Text style={[styles.infoValue, planInfo?.status === 'active' ? styles.activeText : {color:'red'}]}>
                  {planInfo?.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start Date:</Text>
              <Text style={styles.infoValue}>{planInfo?.startDate ? new Date(planInfo.startDate).toLocaleDateString() : '-'}</Text>
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
                  disabled={updatingAutoRenewal}
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
              <Text style={styles.infoValue}>{planInfo?.paymentMethod || '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Payment Date:</Text>
              <Text style={styles.infoValue}>{planInfo?.lastPaymentDate ? new Date(planInfo.lastPaymentDate).toLocaleDateString() : '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subscription Plan:</Text>
              <Text style={styles.infoValue}>{planInfo?.planName || '-'}</Text>
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
            onPress={handleCancelSubscription}
            disabled={cancelling}
          >
            <Text style={styles.cancelButtonText}>{cancelling ? 'İptal Ediliyor...' : 'Cancel Subscription'}</Text>
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
