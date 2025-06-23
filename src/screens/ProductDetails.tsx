
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

type Product = {
  _id: string;
  productName: string;
  productCategory: string;
  productDescription: string;
  companyName: string;
  // Diğer ürün alanları
};

const ProductDetails = ({ navigation }: Props) => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    productName: '',
    productCategory: '',
    companyId: '',
    productDescription: '',
    detailedDescription: '',
    pricingModel: '',
    releaseDate: '',
    productPrice: '',
    productWebsite: '',
    productLinkedIn: '',
    productTwitter: '',
    productLogo: '',
    tags: '',
    problems: '',
    solutions: '',
    improvements: '',
    keyFeatures: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // Ürünleri tutmak için state
  const categories = [
    'AI', 'Fintech', 'Healthcare', 'E-commerce', 'Cybersecurity', 'Blockchain', 'LegalTech', 'EdTech', 'IoT', 'Marketing', 'Social Media', 'Other'
  ];
  const pricingModels = [
    'Free', 'Freemium', 'Subscription', 'One-time Payment', 'Other'
  ];

  const { user } = useAuth();

  const productFormSteps = [
    { label: 'Ürün Adı', placeholder: 'Ürün adını girin', key: 'productName', type: 'text', required: true },
    { label: 'Kategori', key: 'productCategory', type: 'picker', options: categories, required: true },
    { label: 'Şirket', key: 'companyId', type: 'picker', options: companies, required: true },
    { label: 'Kısa Açıklama', placeholder: 'Kısa açıklama girin', key: 'productDescription', type: 'text', required: true },
    { label: 'Detaylı Açıklama', placeholder: 'Detaylı açıklama girin', key: 'detailedDescription', type: 'text', required: true },
    { label: 'Fiyatlandırma Modeli', key: 'pricingModel', type: 'picker', options: pricingModels, required: true },
    { label: 'Çıkış Tarihi', placeholder: 'gg.aa.yyyy', key: 'releaseDate', type: 'text', required: true },
    { label: 'Ürün Fiyatı', placeholder: 'Ürün fiyatı girin', key: 'productPrice', type: 'text', required: false },
    { label: 'Ürün Web Sitesi', placeholder: 'Ürün web sitesi girin', key: 'productWebsite', type: 'text', required: true },
    { label: 'Ürün LinkedIn', placeholder: 'Ürün LinkedIn girin', key: 'productLinkedIn', type: 'text', required: false },
    { label: 'Ürün Twitter', placeholder: 'Ürün Twitter girin', key: 'productTwitter', type: 'text', required: false },
    { label: 'Ürün Logosu', placeholder: 'Logo URL girin', key: 'productLogo', type: 'text', required: false },
    { label: 'Etiketler', placeholder: 'Etiketler (virgülle ayırın)', key: 'tags', type: 'text', required: false },
    { label: 'Problemler', placeholder: 'Çözülen problemler', key: 'problems', type: 'text', required: false },
    { label: 'Çözümler', placeholder: 'Sunulan çözümler', key: 'solutions', type: 'text', required: false },
    { label: 'İyileştirmeler', placeholder: 'Geliştirme önerileri', key: 'improvements', type: 'text', required: false },
    { label: 'Ana Özellikler', placeholder: 'Ürün özellikleri', key: 'keyFeatures', type: 'text', required: false },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    console.log(`Input değişti: ${key}=${value}`);
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = user?.id;
      console.log('fetchCompanies - User ID:', userId, 'Token:', token);
      if (!token || !userId) {
        setCompanies([]);
        Alert.alert('Hata', 'Oturum bilgileri eksik.');
        return;
      }
      const response = await axios.get(
        `https://api.aikuaiplatform.com/api/company/current?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Şirketler API yanıtı:', response.data);
      const companiesData = (response.data.companies || []).map((c: any) => ({
        ...c,
        _id: String(c._id || c.id),
      }));
      setCompanies(companiesData);
      if (companiesData.length === 0) {
        Alert.alert('Uyarı', 'Kayıtlı şirket bulunamadı. Lütfen önce bir şirket ekleyin.');
      }
    } catch (e: any) {
      console.error('fetchCompanies hatası:', e.message, e.response?.data);
      setCompanies([]);
      Alert.alert('Hata', 'Şirketler yüklenemedi: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Hata', 'Oturum bilgileri eksik.');
        setProducts([]);
        return;
      }
      const response = await axios.get('https://api.aikuaiplatform.com/api/product/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Ürünler API yanıtı:', response.data);
      const productsData = response.data.products || [];
      setProducts(productsData);
      if (productsData.length === 0) {
        console.log('Ürün bulunamadı.');
      }
    } catch (e: any) {
      console.error('fetchProducts hatası:', e.message, e.response?.data);
      setProducts([]);
      Alert.alert('Hata', 'Ürünler yüklenemedi: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyProducts = async (companyId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Hata', 'Oturum bilgileri eksik.');
        return;
      }
      const response = await axios.get(`https://api.aikuaiplatform.com/api/product/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Şirket ürünleri:', response.data);
    } catch (e: any) {
      console.error('fetchCompanyProducts hatası:', e.message, e.response?.data);
      Alert.alert('Hata', 'Şirket ürünleri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchProducts(); // İlk yüklemede ürünleri çek
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      console.log('Şirketler yüklendi:', companies);
      fetchCompanyProducts(companies[0]._id);
    } else {
      console.log('Şirket bulunamadı.');
    }
  }, [companies]);

  const validateStep = () => {
    const step = productFormSteps[currentStep];
    const value = formData[step.key];
    console.log('validateStep', { step: step.label, value });
    if (step.required && (!value || value.trim() === '')) {
      Alert.alert('Eksik Bilgi', `${step.label} zorunludur.`);
      return false;
    }
    if (step.key === 'releaseDate' && value) {
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!dateRegex.test(value)) {
        Alert.alert('Hata', 'Geçerli bir tarih giriniz (gg.aa.yyyy)');
        return false;
      }
    }
    if (step.key === 'productWebsite' && value && !value.match(/^https?:\/\/.+/)) {
      Alert.alert('Hata', 'Geçerli bir URL giriniz (http:// veya https:// ile başlamalı)');
      return false;
    }
    if (step.key === 'companyId' && value) {
      const isValidCompany = companies.some(c => c._id === value);
      if (!isValidCompany) {
        Alert.alert('Hata', 'Geçerli bir şirket seçiniz.');
        return false;
      }
    }
    return true;
  };

  const validateForm = () => {
    const requiredFields = productFormSteps.filter(step => step.required).map(step => step.key);
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        Alert.alert('Eksik Bilgi', `${productFormSteps.find(step => step.key === field)?.label} zorunludur.`);
        return false;
      }
    }
    if (!companies.some(c => c._id === formData.companyId)) {
      Alert.alert('Hata', 'Geçerli bir şirket seçiniz.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < productFormSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    const step = productFormSteps[currentStep];
    switch (step.type) {
      case 'text':
        return (
          <TextInput
            style={styles.input}
            placeholder={step.placeholder}
            placeholderTextColor={Colors.lightText}
            value={formData[step.key]}
            onChangeText={text => handleInputChange(step.key, text)}
            multiline={step.key === 'detailedDescription' || step.key === 'problems' || step.key === 'solutions' || step.key === 'improvements' || step.key === 'keyFeatures'}
            keyboardType={step.key === 'productPrice' ? 'numeric' : 'default'}
          />
        );
      case 'picker':
        if (step.key === 'companyId') {
          return (
            <Picker
              selectedValue={formData.companyId}
              onValueChange={value => {
                const val = value === undefined || value === null ? '' : String(value);
                const selectedCompany = companies.find(c => c._id === val);
                console.log('Şirket seçildi:', { value: val, companyName: selectedCompany?.companyName });
                handleInputChange('companyId', val);
                handleInputChange('companyName', selectedCompany?.companyName || '');
              }}>
              <Picker.Item label="Şirket Seçin" value="" />
              {companies.map(company => (
                <Picker.Item
                  key={String(company._id)}
                  label={company.companyName}
                  value={String(company._id)}
                />
              ))}
            </Picker>
          );
        } else if (Array.isArray(step.options)) {
          return (
            <Picker
              selectedValue={formData[step.key]}
              onValueChange={(value: string) => handleInputChange(step.key, value)}>
              <Picker.Item label="Seçiniz" value="" />
              {step.options.map(opt => (
                <Picker.Item key={opt} label={opt} value={opt} />
              ))}
            </Picker>
          );
        }
        return null;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        Alert.alert('Hata', 'Oturum açmanız gerekiyor.');
        return;
      }
      let releaseDate = formData.releaseDate;
      if (releaseDate && /^\d{2}\.\d{2}\.\d{4}$/.test(releaseDate)) {
        const [day, month, year] = releaseDate.split('.');
        releaseDate = `${year}-${month}-${day}`;
      } else {
        Alert.alert('Hata', 'Geçerli bir tarih giriniz (gg.aa.yyyy)');
        return;
      }
      const selectedCompany = companies.find(c => c._id === formData.companyId);
      if (!selectedCompany) {
        Alert.alert('Hata', 'Seçilen şirket geçersiz.');
        return;
      }
      const data = {
        productName: formData.productName,
        productLogo: formData.productLogo || '',
        productCategory: formData.productCategory,
        productDescription: formData.productDescription,
        detailedDescription: formData.detailedDescription,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        problems: formData.problems || '',
        solutions: formData.solutions || '',
        improvements: formData.improvements || '',
        keyFeatures: formData.keyFeatures || '',
        pricingModel: formData.pricingModel,
        releaseDate,
        productPrice: Number(formData.productPrice) || 0,
        productWebsite: formData.productWebsite,
        productLinkedIn: formData.productLinkedIn || '',
        productTwitter: formData.productTwitter || '',
        companyName: selectedCompany.companyName || '',
        companyId: formData.companyId,
      };
      console.log('Gönderilen veri:', JSON.stringify(data, null, 2));
      const response = await axios.post(
        'https://api.aikuaiplatform.com/api/product',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('API yanıtı:', JSON.stringify(response.data, null, 2));
      if (!response.data.success || !response.data.product) {
        Alert.alert('Hata', 'Ürün eklenemedi, lütfen tekrar deneyin.');
        return;
      }
      Alert.alert('Başarılı', 'Ürün başarıyla eklendi.');
      setShowAddProductModal(false);
      setFormData({
        productName: '',
        productCategory: '',
        companyId: '',
        productDescription: '',
        detailedDescription: '',
        pricingModel: '',
        releaseDate: '',
        productPrice: '',
        productWebsite: '',
        productLinkedIn: '',
        productTwitter: '',
        productLogo: '',
        tags: '',
        problems: '',
        solutions: '',
        improvements: '',
        keyFeatures: '',
        companyName: '',
      });
      setCurrentStep(0);
      await fetchProducts(); // Ürünleri yeniden çek
    } catch (err: any) {
      console.error('Hata detayları:', JSON.stringify(err, null, 2));
      if (err.response?.status === 401) {
        Alert.alert('Oturum Hatası', 'Lütfen tekrar oturum açın.');
        // navigation.navigate('Login');
      } else if (err.response?.status === 400) {
        Alert.alert('Hata', err.response?.data?.errors?.[0]?.msg || 'Geçersiz veri gönderildi.');
      } else {
        Alert.alert('Hata', err?.response?.data?.message || err?.message || 'Ürün eklenemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: string, updatedData: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.put(
        `https://api.aikuaiplatform.com/api/product/${productId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Güncellenen ürün:', response.data);
      await fetchProducts();
    } catch (e: any) {
      console.error('updateProduct hatası:', e.message);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.delete(
        `https://api.aikuaiplatform.com/api/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Silinen ürün:', response.data);
      await fetchProducts();
    } catch (e: any) {
      console.error('deleteProduct hatası:', e.message);
    }
  };

  const renderProductCard = (product: Product) => (
    <View key={product._id} style={styles.card}>
      <Text style={styles.productTitle}>{product.productName}</Text>
      <Text style={styles.productText}>Kategori: {product.productCategory}</Text>
      <Text style={styles.productText}>Açıklama: {product.productDescription}</Text>
      <Text style={styles.productText}>Şirket: {product.companyName}</Text>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Güncelleme için örnek veri
            updateProduct(product._id, { productName: `${product.productName} (Güncellendi)` });
          }}>
          <Text style={styles.actionButtonText}>Güncelle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteProduct(product._id)}>
          <Text style={styles.actionButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <LinearGradient
        colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
        locations={[0, 0.3, 0.6, 0.9]}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 1 }}
        style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={24} color={Colors.lightText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Product Details</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddProduct}>
              <MaterialIcons name="add-business" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content}>
            {loading ? (
              <Text style={styles.noProductsText}>Yükleniyor...</Text>
            ) : products.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.noProductsText}>Ürün bulunamadı.</Text>
              </View>
            ) : (
              products.map(product => renderProductCard(product))
            )}
            <TouchableOpacity style={styles.addProductCard} onPress={handleAddProduct}>
              <MaterialIcons name="add-business" size={24} color={Colors.primary} />
              <Text style={styles.addProductText}>Yeni Ürün Ekle</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {showAddProductModal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAddProductModal}
          onRequestClose={() => setShowAddProductModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <View style={{ flex: 1 }}>
              <LinearGradient
                colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
                locations={[0, 0.3, 0.6, 0.9]}
                start={{ x: 0, y: 0 }}
                end={{ x: 2, y: 1 }}
                style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1 }}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Ürün Ekle</Text>
                    <TouchableOpacity onPress={() => setShowAddProductModal(false)}>
                      <Icon name="close" size={24} color={Colors.lightText} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.progressContainer}>
                    {productFormSteps.map((_, idx) => (
                      <View
                        key={idx}
                        style={[styles.progressDot, idx === currentStep && styles.activeProgressDot]}
                      />
                    ))}
                  </View>
                  <ScrollView style={{ flex: 1, padding: metrics.padding.lg }}>
                    <Text style={styles.inputLabel}>
                      {productFormSteps[currentStep].label}
                      {productFormSteps[currentStep].required && <Text style={{ color: 'red' }}> *</Text>}
                    </Text>
                    {renderStepContent()}
                  </ScrollView>
                  <View style={styles.navigationButtons}>
                    {currentStep > 0 && (
                      <TouchableOpacity style={styles.navButton} onPress={handleBack} disabled={loading}>
                        <Text style={styles.navButtonText}>Geri</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.navButton} onPress={handleNext} disabled={loading}>
                      <Text style={styles.navButtonText}>
                        {loading ? 'Kaydediliyor...' : currentStep === productFormSteps.length - 1 ? 'Kaydet' : 'İleri'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </SafeAreaView>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      )}
    </>
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
    padding: metrics.padding.md,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: metrics.margin.lg,
    top: metrics.margin.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl * 1.1,
    fontWeight: 'bold',
    marginBottom: metrics.margin.lg,
    color: Colors.lightText,
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
  productTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
  },
  productText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: metrics.margin.sm,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.sm,
    padding: metrics.padding.sm,
    marginLeft: metrics.margin.sm,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
  },
  noProductsText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    opacity: 0.7,
    textAlign: 'center',
  },
  addProductCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addProductText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '500',
    marginLeft: metrics.margin.md,
  },
  addButton: {
    position: 'absolute',
    right: metrics.margin.lg,
    top: metrics.margin.lg,
    zIndex: 1,
  },
  inputLabel: {
    fontSize: metrics.fontSize.md,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    marginBottom: metrics.margin.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: Colors.lightText,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: metrics.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: metrics.margin.sm,
  },
  activeProgressDot: {
    backgroundColor: Colors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: metrics.padding.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    alignItems: 'center',
    minWidth: 120,
  },
  navButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '500',
  },
});

export default ProductDetails;
