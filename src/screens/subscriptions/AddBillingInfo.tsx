import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import BillingService from '../../services/BillingService';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'AddBillingInfo'>;

const AddBillingInfo: React.FC<Props> = ({navigation, route}) => {
  const {planDetails, editMode, billingInfo} = route.params;
  const [loading, setLoading] = useState(false);
  const [billingType, setBillingType] = useState<'individual' | 'corporate'>(
    billingInfo?.billingType || 'individual'
  );
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    identityNumber: '',
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
    city: '',
    district: '',
    zipCode: '',
    phone: '',
    email: '',
    isDefault: true,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (editMode && billingInfo) {
      setFormData({
        firstName: billingInfo.firstName || '',
        lastName: billingInfo.lastName || '',
        identityNumber: billingInfo.identityNumber || '',
        companyName: billingInfo.companyName || '',
        taxNumber: billingInfo.taxNumber || '',
        taxOffice: billingInfo.taxOffice || '',
        address: billingInfo.address || '',
        city: billingInfo.city || '',
        district: billingInfo.district || '',
        zipCode: billingInfo.zipCode || '',
        phone: billingInfo.phone || '',
        email: billingInfo.email || '',
        isDefault: billingInfo.isDefault ?? true,
      });
      setBillingType(billingInfo.billingType || 'individual');
    }
  }, [editMode, billingInfo]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (billingType === 'individual') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.identityNumber) newErrors.identityNumber = 'Identity number is required';
      if (formData.identityNumber && formData.identityNumber.length !== 11) {
        newErrors.identityNumber = 'Identity number must be 11 digits';
      }
    } else {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.taxNumber) newErrors.taxNumber = 'Tax number is required';
      if (!formData.taxOffice) newErrors.taxOffice = 'Tax office is required';
    }

    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const billingData = {
        ...formData,
        billingType,
      };

      const response = editMode && billingInfo
        ? await BillingService.updateBillingInfo(billingInfo._id, billingData)
        : await BillingService.createBillingInfo(billingData);
      
      if (response.success) {
        navigation.navigate('Payment', {
          planDetails,
          billingInfo: response.data as any,
        });
      } else {
        Alert.alert('Error', response.message || 'An error occurred while saving billing information');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving billing information');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>
            {editMode ? 'Edit Billing Information' : 'Add Billing Information'}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}
          keyboardVerticalOffset={56}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Billing Type Selection */}
            <View style={styles.billingTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.billingTypeButton,
                  billingType === 'individual' && styles.selectedBillingType,
                ]}
                onPress={() => setBillingType('individual')}>
                <Text
                  style={[
                    styles.billingTypeText,
                    billingType === 'individual' &&
                      styles.selectedBillingTypeText,
                  ]}>
                  Individual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.billingTypeButton,
                  billingType === 'corporate' && styles.selectedBillingType,
                ]}
                onPress={() => setBillingType('corporate')}>
                <Text
                  style={[
                    styles.billingTypeText,
                    billingType === 'corporate' &&
                      styles.selectedBillingTypeText,
                  ]}>
                  Corporate
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            {billingType === 'individual' ? (
              <View style={styles.rowContainer}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    placeholder="First Name"
                    placeholderTextColor={Colors.inactive}
                    value={formData.firstName}
                    onChangeText={value => handleInputChange('firstName', value)}
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.inactive}
                    value={formData.lastName}
                    onChangeText={value => handleInputChange('lastName', value)}
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>
            ) : (
              <>
                <TextInput
                  style={[
                    styles.input,
                    errors.companyName && styles.inputError,
                  ]}
                  placeholder="Company Name"
                  placeholderTextColor={Colors.inactive}
                  value={formData.companyName}
                  onChangeText={value =>
                    handleInputChange('companyName', value)
                  }
                />
                {errors.companyName && (
                  <Text style={styles.errorText}>{errors.companyName}</Text>
                )}

                <View style={styles.rowContainer}>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.taxNumber && styles.inputError,
                      ]}
                      placeholder="Tax Number"
                      placeholderTextColor={Colors.inactive}
                      value={formData.taxNumber}
                      onChangeText={value =>
                        handleInputChange('taxNumber', value)
                      }
                      keyboardType="numeric"
                    />
                    {errors.taxNumber && (
                      <Text style={styles.errorText}>{errors.taxNumber}</Text>
                    )}
                  </View>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.taxOffice && styles.inputError,
                      ]}
                      placeholder="Tax Office"
                      placeholderTextColor={Colors.inactive}
                      value={formData.taxOffice}
                      onChangeText={value =>
                        handleInputChange('taxOffice', value)
                      }
                    />
                    {errors.taxOffice && (
                      <Text style={styles.errorText}>{errors.taxOffice}</Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {billingType === 'individual' && (
              <TextInput
                style={[
                  styles.input,
                  errors.identityNumber && styles.inputError,
                ]}
                placeholder="Identity Number"
                placeholderTextColor={Colors.inactive}
                value={formData.identityNumber}
                onChangeText={value =>
                  handleInputChange('identityNumber', value)
                }
                keyboardType="numeric"
                maxLength={11}
              />
            )}

            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Address"
              placeholderTextColor={Colors.inactive}
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              multiline
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  placeholder="City"
                  placeholderTextColor={Colors.inactive}
                  value={formData.city}
                  onChangeText={value => handleInputChange('city', value)}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>
              <View style={styles.halfInput}>
                <TextInput
                  style={[styles.input, errors.district && styles.inputError]}
                  placeholder="District"
                  placeholderTextColor={Colors.inactive}
                  value={formData.district}
                  onChangeText={value => handleInputChange('district', value)}
                />
                {errors.district && (
                  <Text style={styles.errorText}>{errors.district}</Text>
                )}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <TextInput
                  style={[styles.input, errors.zipCode && styles.inputError]}
                  placeholder="Zip Code"
                  placeholderTextColor={Colors.inactive}
                  value={formData.zipCode}
                  onChangeText={value => handleInputChange('zipCode', value)}
                  keyboardType="numeric"
                />
                {errors.zipCode && (
                  <Text style={styles.errorText}>{errors.zipCode}</Text>
                )}
              </View>
              <View style={styles.halfInput}>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Phone"
                  placeholderTextColor={Colors.inactive}
                  value={formData.phone}
                  onChangeText={value => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>
            </View>

            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              placeholderTextColor={Colors.inactive}
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.lightText} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
    padding: metrics.padding.lg,
  },
  billingTypeContainer: {
    flexDirection: 'row',
    marginBottom: metrics.margin.xl,
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.xs,
  },
  billingTypeButton: {
    flex: 1,
    paddingVertical: metrics.padding.md,
    alignItems: 'center',
    borderRadius: metrics.borderRadius.md,
  },
  selectedBillingType: {
    backgroundColor: Colors.primary,
  },
  billingTypeText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  selectedBillingTypeText: {
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.margin.sm,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: metrics.margin.xs,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.sm,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.sm,
    marginLeft: metrics.margin.xs,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    alignItems: 'center',
    marginTop: metrics.margin.xl,
  },
  submitButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.padding.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: metrics.margin.sm,
  },
  headerTitle: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To center the title considering the back button width
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default AddBillingInfo; 