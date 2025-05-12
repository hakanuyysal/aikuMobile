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
import {BillingInfoScreenProps} from '../../types';

interface FormErrors {
  [key: string]: string;
}

interface BaseFormData {
  address: string;
  city: string;
  district: string;
  zipCode: string;
  phone: string;
  email: string;
  isDefault: boolean;
}

interface CorporateFormData extends BaseFormData {
  companyName: string;
  taxNumber: string;
  taxOffice: string;
}

interface IndividualFormData extends BaseFormData {
  firstName: string;
  lastName: string;
  identityNumber: string;
}

type FormData = CorporateFormData | IndividualFormData;

const BillingInfoScreen: React.FC<BillingInfoScreenProps> = ({
  navigation,
  route,
}) => {
  const {planDetails} = route.params;
  const [billingType, setBillingType] = useState<'Individual' | 'Corporate'>(
    'Individual',
  );
  const [formData, setFormData] = useState<FormData>(
    billingType === 'Individual'
      ? {
          firstName: '',
          lastName: '',
          identityNumber: '',
          address: '',
          city: '',
          district: '',
          zipCode: '',
          phone: '',
          email: '',
          isDefault: true,
        }
      : {
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
        },
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const validateInput = (field: string, value: string): boolean => {
    // Sadece harf ve boşluk kontrolü (ad soyad için)
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/;
    // Sadece rakam kontrolü
    const numberRegex = /^[0-9]*$/;

    switch (field) {
      case 'firstName':
      case 'lastName':
        return nameRegex.test(value);
      case 'identityNumber':
      case 'phone':
      case 'zipCode':
        return numberRegex.test(value);
      default:
        return true;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Input validasyonu
    if (!validateInput(field, value)) {
      return;
    }

    // Maksimum karakter sınırlamaları
    if (field === 'identityNumber' && value.length > 11) {
      return;
    }
    if (field === 'zipCode' && value.length > 5) {
      return;
    }

    if (billingType === 'Individual') {
      setFormData(
        (prev: FormData) =>
          ({
            ...prev,
            [field]: value,
          } as IndividualFormData),
      );
    } else {
      setFormData(
        (prev: FormData) =>
          ({
            ...prev,
            [field]: value,
          } as CorporateFormData),
      );
    }
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const handleBillingTypeChange = (type: 'Individual' | 'Corporate') => {
    setBillingType(type);
    if (type === 'Individual') {
      setFormData({
        firstName: '',
        lastName: '',
        identityNumber: '',
        address: '',
        city: '',
        district: '',
        zipCode: '',
        phone: '',
        email: '',
        isDefault: true,
      } as IndividualFormData);
    } else {
      setFormData({
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
      } as CorporateFormData);
    }
    setErrors({});
  };

  const handleSave = () => {
    if (validateForm()) {
      const phoneNumber = formData.phone;
      
      const commonFields = {
        address: formData.address,
        city: formData.city,
        district: formData.district,
        zipCode: formData.zipCode,
        phone: phoneNumber,
        email: formData.email,
        isDefault: formData.isDefault,
      };

      const navigationParams = {
        planDetails,
        billingInfo: billingType === 'Individual'
          ? {
              ...commonFields,
              firstName: (formData as IndividualFormData).firstName,
              lastName: (formData as IndividualFormData).lastName,
              identityNumber: (formData as IndividualFormData).identityNumber,
            }
          : {
              ...commonFields,
              companyName: (formData as CorporateFormData).companyName,
              taxNumber: (formData as CorporateFormData).taxNumber,
              taxOffice: (formData as CorporateFormData).taxOffice,
            }
      };

      navigation.navigate('Payment', navigationParams);
    } else {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const commonValidation = () => {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.district.trim()) {
        newErrors.district = 'District is required';
      }
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'Zip code is required';
      } else if (formData.zipCode.length !== 5) {
        newErrors.zipCode = 'Zip code must be 5 digits';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    };

    if (billingType === 'Individual') {
      const individualForm = formData as IndividualFormData;
      if (!individualForm.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!individualForm.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!individualForm.identityNumber?.trim()) {
        newErrors.identityNumber = 'Identity number is required';
      } else if (individualForm.identityNumber.length !== 11) {
        newErrors.identityNumber = 'Identity number must be 11 digits';
      }
    } else {
      const corporateForm = formData as CorporateFormData;
      if (!corporateForm.companyName?.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!corporateForm.taxNumber?.trim()) {
        newErrors.taxNumber = 'Tax number is required';
      }
      if (!corporateForm.taxOffice?.trim()) {
        newErrors.taxOffice = 'Tax office is required';
      }
    }

    commonValidation();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Billing Information</Text>
          <TouchableOpacity style={styles.checkButton} onPress={handleSave}>
            <Icon name="checkmark" size={24} color={Colors.lightText} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container}>
          <View style={styles.billingTypeContainer}>
            <Text style={styles.label}>Billing Type</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  billingType === 'Individual' && styles.radioButtonActive,
                ]}
                onPress={() => handleBillingTypeChange('Individual')}>
                <Text
                  style={[
                    styles.radioText,
                    billingType === 'Individual' && styles.radioTextActive,
                  ]}>
                  Individual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  billingType === 'Corporate' && styles.radioButtonActive,
                ]}
                onPress={() => handleBillingTypeChange('Corporate')}>
                <Text
                  style={[
                    styles.radioText,
                    billingType === 'Corporate' && styles.radioTextActive,
                  ]}>
                  Corporate
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {billingType === 'Individual' ? (
            <>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>First Name</Text>
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
                        errors.firstName && styles.inputError,
                      ]}
                      value={(formData as IndividualFormData).firstName}
                      onChangeText={value =>
                        handleInputChange('firstName', value)
                      }
                      placeholderTextColor={Colors.inactive}
                      placeholder="Enter first name"
                      maxLength={50}
                    />
                  </View>
                  {renderError('firstName')}
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Last Name</Text>
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
                        errors.lastName && styles.inputError,
                      ]}
                      value={(formData as IndividualFormData).lastName}
                      onChangeText={value =>
                        handleInputChange('lastName', value)
                      }
                      placeholderTextColor={Colors.inactive}
                      placeholder="Enter last name"
                      maxLength={50}
                    />
                  </View>
                  {renderError('lastName')}
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Company Name</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="business-outline"
                    size={20}
                    color={Colors.inactive}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      errors.companyName && styles.inputError,
                    ]}
                    value={(formData as CorporateFormData).companyName}
                    onChangeText={value =>
                      handleInputChange('companyName', value)
                    }
                    placeholderTextColor={Colors.inactive}
                    placeholder="Enter company name"
                  />
                </View>
                {renderError('companyName')}
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Tax Number</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="document-text-outline"
                      size={20}
                      color={Colors.inactive}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        errors.taxNumber && styles.inputError,
                      ]}
                      value={(formData as CorporateFormData).taxNumber}
                      onChangeText={value =>
                        handleInputChange('taxNumber', value)
                      }
                      keyboardType="numeric"
                      placeholderTextColor={Colors.inactive}
                      placeholder="Enter tax number"
                    />
                  </View>
                  {renderError('taxNumber')}
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Tax Office</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="business-outline"
                      size={20}
                      color={Colors.inactive}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        errors.taxOffice && styles.inputError,
                      ]}
                      value={(formData as CorporateFormData).taxOffice}
                      onChangeText={value =>
                        handleInputChange('taxOffice', value)
                      }
                      placeholderTextColor={Colors.inactive}
                      placeholder="Enter tax office"
                    />
                  </View>
                  {renderError('taxOffice')}
                </View>
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <View
              style={[
                styles.textAreaWrapper,
                errors.address && styles.textAreaError,
              ]}>
              <View style={styles.textAreaContent}>
                <Icon
                  name="location-outline"
                  size={20}
                  color={Colors.inactive}
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={value => handleInputChange('address', value)}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={Colors.inactive}
                  placeholder="Enter address"
                />
              </View>
            </View>
            {renderError('address')}
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="location-outline"
                  size={20}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  value={formData.city}
                  onChangeText={value => handleInputChange('city', value)}
                  placeholderTextColor={Colors.inactive}
                  placeholder="Enter city"
                />
              </View>
              {renderError('city')}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>District</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="location-outline"
                  size={20}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, errors.district && styles.inputError]}
                  value={formData.district}
                  onChangeText={value => handleInputChange('district', value)}
                  placeholderTextColor={Colors.inactive}
                  placeholder="Enter district"
                />
              </View>
              {renderError('district')}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Identity Number</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="card-outline"
                  size={20}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    errors.identityNumber && styles.inputError,
                  ]}
                  value={(formData as IndividualFormData).identityNumber}
                  onChangeText={value =>
                    handleInputChange('identityNumber', value)
                  }
                  keyboardType="numeric"
                  maxLength={11}
                  placeholderTextColor={Colors.inactive}
                  placeholder="Enter identity number"
                />
              </View>
              {renderError('identityNumber')}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Zip Code</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="mail-outline"
                  size={20}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, errors.zipCode && styles.inputError]}
                  value={formData.zipCode}
                  onChangeText={value => handleInputChange('zipCode', value)}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholderTextColor={Colors.inactive}
                  placeholder="Enter zip code"
                />
              </View>
              {renderError('zipCode')}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="call-outline"
                size={20}
                color={Colors.inactive}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={value => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.inactive}
                placeholder="Enter phone number"
                maxLength={11}
              />
            </View>
            {renderError('phone')}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="mail-outline"
                size={20}
                color={Colors.inactive}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={value => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.inactive}
                placeholder="Enter email address"
              />
            </View>
            {renderError('email')}
          </View>
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
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: metrics.margin.lg,
    zIndex: 1,
  },
  checkButton: {
    position: 'absolute',
    right: metrics.margin.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  billingTypeContainer: {
    marginBottom: metrics.margin.lg,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: metrics.margin.sm,
  },
  radioButton: {
    paddingVertical: metrics.padding.sm,
    paddingHorizontal: metrics.padding.xl,
    borderRadius: metrics.borderRadius.xl,
    marginRight: metrics.margin.md,
    backgroundColor: Colors.cardBackground,
  },
  radioButtonActive: {
    backgroundColor: Colors.primary,
  },
  radioText: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.md,
  },
  radioTextActive: {
    color: Colors.lightText,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.margin.md,
  },
  halfInput: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: metrics.margin.md,
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
    marginBottom: metrics.margin.xs,
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderColor: Colors.inactive,
    borderRadius: metrics.borderRadius.md,
    marginTop: metrics.margin.xs,
  },
  textAreaContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: metrics.padding.md,
  },
  textAreaIcon: {
    marginRight: metrics.margin.sm,
    marginTop: metrics.margin.xs,
  },
  inputIcon: {
    marginRight: metrics.margin.sm,
    color: Colors.inactive,
  },
  input: {
    flex: 1,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    paddingVertical: metrics.padding.md,
    backgroundColor: 'transparent',
  },
  textArea: {
    flex: 1,
    height: metrics.scale(60),
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: metrics.margin.lg,
    marginBottom: metrics.margin.xl,
  },
  checkboxLabel: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    marginLeft: metrics.margin.sm,
  },
  errorText: {
    color: '#ff4444',
    fontSize: metrics.fontSize.xs,
    marginTop: metrics.margin.xs,
  },
  inputError: {
    borderBottomColor: '#ff4444',
  },
  textAreaError: {
    borderColor: '#ff4444',
  },
  phoneContainer: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: Colors.inactive,
  },
  phoneContainerError: {
    borderBottomColor: '#ff4444',
  },
  phoneTextContainer: {
    backgroundColor: 'transparent',
    paddingLeft: 0,
  },
  phoneTextInput: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    height: 50,
    backgroundColor: 'transparent',
  },
  phoneCodeText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  countryPickerButton: {
    backgroundColor: 'transparent',
    width: 80,
  },
  flagButton: {
    width: 80,
  },
});

export default BillingInfoScreen;