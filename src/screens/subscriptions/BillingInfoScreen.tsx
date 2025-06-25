import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import metrics from '../../constants/aikuMetric';
import LinearGradient from 'react-native-linear-gradient';
import {BillingInfoScreenProps} from '../../types';
import BillingService from '../../services/BillingService';

const BillingInfoScreen: React.FC<BillingInfoScreenProps> = ({
  navigation,
  route,
}) => {
  const {planDetails, hasExistingBillingInfo, existingBillingInfo} = route.params;
  const [loading, setLoading] = useState(false);

  const handleEdit = async (id: string) => {
    setLoading(true);
    try {
      const response = await BillingService.getBillingInfoById(id);
      if (response.success && response.data) {
        const billingInfo = Array.isArray(response.data) ? response.data[0] : response.data;
        navigation.navigate('AddBillingInfo', {
          planDetails,
          editMode: true,
          billingInfo,
        });
      } else {
        Alert.alert('Error', 'Could not load billing information');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this billing information?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await BillingService.deleteBillingInfo(id);
              if (response.success) {
                Alert.alert('Success', 'Billing information deleted successfully');
                navigation.goBack();
              } else {
                Alert.alert('Error', response.message || 'Could not delete billing information');
              }
            } catch (error) {
              Alert.alert('Error', 'Could not delete billing information');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleContinueToPayment = () => {
    if (existingBillingInfo) {
      navigation.navigate('Payment', {
        planDetails,
        billingInfo: existingBillingInfo,
      });
    }
  };

  const handleAddNewBillingInfo = () => {
    navigation.navigate('AddBillingInfo', {
      planDetails,
    });
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
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Billing Information</Text>
        </View>

        <ScrollView style={styles.container}>
          {/* Plan Details */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>{planDetails.name}</Text>
            <Text style={styles.planSubtitle}>For AI Startups & Developers</Text>
            <Text style={styles.planPrice}>
              ${planDetails.price}/{planDetails.billingCycle === 'yearly' ? 'year' : 'month'}
            </Text>
            {planDetails.billingCycle === 'yearly' && (
              <Text style={styles.planDiscount}>10% off</Text>
            )}
            <Text style={styles.renewalInfo}>
              Your membership renews on July 10, 2025. Your payment method will be charged on that date.
            </Text>
          </View>

          {/* Saved Address */}
          {hasExistingBillingInfo && existingBillingInfo && (
            <View style={styles.savedAddressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>
                  {existingBillingInfo.firstName} {existingBillingInfo.lastName}
                </Text>
                {existingBillingInfo.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressType}>
                {existingBillingInfo.billingType === 'individual' ? 'Individual' : 'Corporate'}
              </Text>
              <Text style={styles.addressText}>{existingBillingInfo.address}</Text>
              <Text style={styles.addressText}>
                {existingBillingInfo.district}, {existingBillingInfo.city} {existingBillingInfo.zipCode}
              </Text>
              <Text style={styles.addressText}>{existingBillingInfo.phone}</Text>
              <View style={styles.addressActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEdit(existingBillingInfo._id)}>
                  <Icon name="create-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(existingBillingInfo._id)}>
                  <Icon name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Add New Button */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={handleAddNewBillingInfo}>
            <Icon name="add" size={24} color={Colors.primary} />
            <Text style={styles.addNewText}>Add New Billing Information</Text>
          </TouchableOpacity>

          {/* Continue Button */}
          {hasExistingBillingInfo && existingBillingInfo && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueToPayment}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.lightText} />
              ) : (
                <>
                  <Text style={styles.continueText}>Continue to Payment</Text>
                  <Icon name="arrow-forward" size={20} color={Colors.lightText} />
                </>
              )}
            </TouchableOpacity>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.lg,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: metrics.padding.lg,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    color: Colors.lightText,
    fontWeight: 'bold',
  },
  planCard: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.xl,
    marginBottom: metrics.margin.xl,
  },
  planTitle: {
    fontSize: metrics.fontSize.xl,
    color: Colors.lightText,
    fontWeight: 'bold',
  },
  planSubtitle: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    opacity: 0.8,
    marginTop: metrics.margin.xs,
  },
  planPrice: {
    fontSize: metrics.fontSize.xxl,
    color: Colors.lightText,
    fontWeight: 'bold',
    marginTop: metrics.margin.md,
  },
  planDiscount: {
    fontSize: metrics.fontSize.sm,
    color: Colors.success,
    marginTop: metrics.margin.xs,
  },
  renewalInfo: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.8,
    marginTop: metrics.margin.lg,
  },
  savedAddressCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.lg,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: metrics.margin.sm,
  },
  addressTitle: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: 'bold',
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: metrics.padding.sm,
    paddingVertical: metrics.padding.xs,
    borderRadius: metrics.borderRadius.sm,
  },
  defaultText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.xs,
  },
  addressType: {
    fontSize: metrics.fontSize.sm,
    color: Colors.inactive,
    marginBottom: metrics.margin.sm,
  },
  addressText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: metrics.margin.md,
  },
  editButton: {
    marginRight: metrics.margin.md,
  },
  deleteButton: {},
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.lg,
  },
  addNewText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
    marginLeft: metrics.margin.sm,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.circle,
    padding: metrics.padding.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: metrics.margin.xl,
  },
  continueText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    marginRight: metrics.margin.sm,
  },
});

export default BillingInfoScreen;
