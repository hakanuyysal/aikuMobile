import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import BillingService from '../../services/BillingService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddBillingInfo'>;

const AddBillingInfo: React.FC<Props> = ({navigation, route}) => {
  const {planDetails} = route.params;
  const [loading, setLoading] = useState(false);
  const [billingType, setBillingType] = useState<'individual' | 'corporate'>('individual');
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (billingType === 'individual') {
      if (!formData.firstName) newErrors.firstName = 'Ad alanı zorunludur';
      if (!formData.lastName) newErrors.lastName = 'Soyad alanı zorunludur';
      if (!formData.identityNumber) newErrors.identityNumber = 'TC Kimlik No zorunludur';
      if (formData.identityNumber && formData.identityNumber.length !== 11) {
        newErrors.identityNumber = 'TC Kimlik No 11 haneli olmalıdır';
      }
    } else {
      if (!formData.companyName) newErrors.companyName = 'Şirket adı zorunludur';
      if (!formData.taxNumber) newErrors.taxNumber = 'Vergi numarası zorunludur';
      if (!formData.taxOffice) newErrors.taxOffice = 'Vergi dairesi zorunludur';
    }

    if (!formData.address) newErrors.address = 'Adres alanı zorunludur';
    if (!formData.city) newErrors.city = 'İl alanı zorunludur';
    if (!formData.district) newErrors.district = 'İlçe alanı zorunludur';
    if (!formData.zipCode) newErrors.zipCode = 'Posta kodu zorunludur';
    if (!formData.phone) newErrors.phone = 'Telefon alanı zorunludur';
    if (!formData.email) newErrors.email = 'E-posta alanı zorunludur';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
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

      const response = await BillingService.createBillingInfo(billingData);
      
      if (response.success) {
        navigation.navigate('Payment', {
          planDetails,
          billingInfo: response.data as any,
        });
      } else {
        Alert.alert('Hata', response.message || 'Fatura bilgisi eklenirken bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Fatura bilgisi eklenirken bir hata oluştu');
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
          <Text style={styles.headerTitle}>Fatura Bilgileri</Text>
        </View>

        <ScrollView style={styles.container}>
          {/* Fatura Tipi Seçimi */}
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
                  billingType === 'individual' && styles.selectedBillingTypeText,
                ]}>
                Bireysel
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
                  billingType === 'corporate' && styles.selectedBillingTypeText,
                ]}>
                Kurumsal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Alanları */}
          {billingType === 'individual' ? (
            <>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Ad"
                placeholderTextColor={Colors.inactive}
                value={formData.firstName}
                onChangeText={value => handleInputChange('firstName', value)}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}

              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Soyad"
                placeholderTextColor={Colors.inactive}
                value={formData.lastName}
                onChangeText={value => handleInputChange('lastName', value)}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}

              <TextInput
                style={[styles.input, errors.identityNumber && styles.inputError]}
                placeholder="TC Kimlik No"
                placeholderTextColor={Colors.inactive}
                value={formData.identityNumber}
                onChangeText={value => handleInputChange('identityNumber', value)}
                keyboardType="numeric"
                maxLength={11}
              />
              {errors.identityNumber && (
                <Text style={styles.errorText}>{errors.identityNumber}</Text>
              )}
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, errors.companyName && styles.inputError]}
                placeholder="Şirket Adı"
                placeholderTextColor={Colors.inactive}
                value={formData.companyName}
                onChangeText={value => handleInputChange('companyName', value)}
              />
              {errors.companyName && (
                <Text style={styles.errorText}>{errors.companyName}</Text>
              )}

              <TextInput
                style={[styles.input, errors.taxNumber && styles.inputError]}
                placeholder="Vergi Numarası"
                placeholderTextColor={Colors.inactive}
                value={formData.taxNumber}
                onChangeText={value => handleInputChange('taxNumber', value)}
                keyboardType="numeric"
              />
              {errors.taxNumber && (
                <Text style={styles.errorText}>{errors.taxNumber}</Text>
              )}

              <TextInput
                style={[styles.input, errors.taxOffice && styles.inputError]}
                placeholder="Vergi Dairesi"
                placeholderTextColor={Colors.inactive}
                value={formData.taxOffice}
                onChangeText={value => handleInputChange('taxOffice', value)}
              />
              {errors.taxOffice && (
                <Text style={styles.errorText}>{errors.taxOffice}</Text>
              )}
            </>
          )}

          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Adres"
            placeholderTextColor={Colors.inactive}
            value={formData.address}
            onChangeText={value => handleInputChange('address', value)}
            multiline
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}

          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            placeholder="İl"
            placeholderTextColor={Colors.inactive}
            value={formData.city}
            onChangeText={value => handleInputChange('city', value)}
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          <TextInput
            style={[styles.input, errors.district && styles.inputError]}
            placeholder="İlçe"
            placeholderTextColor={Colors.inactive}
            value={formData.district}
            onChangeText={value => handleInputChange('district', value)}
          />
          {errors.district && (
            <Text style={styles.errorText}>{errors.district}</Text>
          )}

          <TextInput
            style={[styles.input, errors.zipCode && styles.inputError]}
            placeholder="Posta Kodu"
            placeholderTextColor={Colors.inactive}
            value={formData.zipCode}
            onChangeText={value => handleInputChange('zipCode', value)}
            keyboardType="numeric"
          />
          {errors.zipCode && (
            <Text style={styles.errorText}>{errors.zipCode}</Text>
          )}

          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Telefon"
            placeholderTextColor={Colors.inactive}
            value={formData.phone}
            onChangeText={value => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="E-posta"
            placeholderTextColor={Colors.inactive}
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.lightText} />
            ) : (
              <Text style={styles.submitButtonText}>Devam Et</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: metrics.margin.xxl,
  },
  submitButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
  },
});

export default AddBillingInfo; 