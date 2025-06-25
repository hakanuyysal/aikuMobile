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
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import metrics from '../../constants/aikuMetric';
import LinearGradient from 'react-native-linear-gradient';
import {BillingInfoScreenProps} from '../../types';
import PaymentService from '../../services/PaymentService';

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
  const {planDetails, hasExistingBillingInfo, existingBillingInfo} = route.params;
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
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

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

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Form validasyonu
      if (!cardNumber || !expiryDate || !cvv || !name) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
        return;
      }

      // Startup Plan ve ilk kez ödeme yapılıyorsa
      if (planDetails.name === 'Startup Plan' && !planDetails.hasPaymentHistory) {
        const freePaymentData = {
          planType: planDetails.name,
          billingCycle: planDetails.billingCycle,
          billingInfo: formData,
        };

        await PaymentService.recordFreePayment(freePaymentData);
        navigation.navigate('PaymentSuccess', {
          message: 'Ücretsiz deneme süreniz başarıyla aktifleştirildi!',
        });
        return;
      }

      // Normal ödeme işlemi
      const paymentData = {
        planType: planDetails.name,
        amount: planDetails.price,
        billingCycle: planDetails.billingCycle,
        billingInfo: formData,
        cardInfo: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate: expiryDate.replace('/', ''),
          cvv,
          cardHolderName: name,
        },
      };

      const response = await PaymentService.processPayment(paymentData);

      if (response.success) {
        if (response.data.isRedirect) {
          // 3D Secure işlemi için yönlendirme
          navigation.navigate('ThreeDSecure', {
            redirectUrl: response.data.redirectUrl,
            paymentData: response.data,
          });
        } else {
          // Başarılı ödeme
          navigation.navigate('PaymentSuccess', {
            message: 'Ödemeniz başarıyla gerçekleştirildi!',
          });
        }
      } else {
        // Ödeme hatası
        navigation.navigate('PaymentError', {
          message: response.message || 'Ödeme işlemi sırasında bir hata oluştu.',
        });
      }
    } catch (error) {
      console.error('Ödeme işlemi sırasında hata:', error);
      navigation.navigate('PaymentError', {
        message: 'Ödeme işlemi sırasında bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // 16 digit + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <Text style={styles.errorText}>{errors[field]}</Text>;
    }
    return null;
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
          {/* Plan Detayları */}
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

          {/* Kayıtlı Adres */}
          {hasExistingBillingInfo && existingBillingInfo && (
            <View style={styles.savedAddressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>{existingBillingInfo.firstName} {existingBillingInfo.lastName}</Text>
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
                <TouchableOpacity style={styles.editButton}>
                  <Icon name="create-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton}>
                  <Icon name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Yeni Adres Ekleme Butonu */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={handleAddNewBillingInfo}>
            <Icon name="add" size={24} color={Colors.primary} />
            <Text style={styles.addNewText}>Add New Billing Information</Text>
          </TouchableOpacity>

          {/* Devam Et Butonu */}
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