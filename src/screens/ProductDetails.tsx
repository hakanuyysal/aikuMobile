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
};

const ProductDetails: React.FC<Props> = ({ navigation }) => {
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
  const [products, setProducts] = useState<Product[]>([]);
  const categories = [
    'AI', 'Fintech', 'Healthcare', 'E-commerce', 'Cybersecurity', 'Blockchain', 'LegalTech', 'EdTech', 'IoT', 'Marketing', 'Social Media', 'Other'
  ];
  const pricingModels = [
    'Free', 'Freemium', 'Subscription', 'One-time Payment', 'Other'
  ];

  const { user } = useAuth();

  const productFormSteps = [
    { label: 'Product Name', placeholder: 'Enter product name', key: 'productName', type: 'text', required: true },
    { label: 'Category', key: 'productCategory', type: 'picker', options: categories, required: true },
    { label: 'Company', key: 'companyId', type: 'picker', options: companies, required: true },
    { label: 'Short Description', placeholder: 'Enter short description', key: 'productDescription', type: 'text', required: true },
    { label: 'Detailed Description', placeholder: 'Enter detailed description', key: 'detailedDescription', type: 'text', required: true },
    { label: 'Pricing Model', key: 'pricingModel', type: 'picker', options: pricingModels, required: true },
    { label: 'Release Date', placeholder: 'dd.mm.yyyy', key: 'releaseDate', type: 'text', required: true },
    { label: 'Product Price', placeholder: 'Enter product price', key: 'productPrice', type: 'text', required: false },
    { label: 'Product Website', placeholder: 'Enter product website', key: 'productWebsite', type: 'text', required: true },
    { label: 'Product LinkedIn', placeholder: 'Enter product LinkedIn', key: 'productLinkedIn', type: 'text', required: false },
    { label: 'Product Twitter', placeholder: 'Enter product Twitter', key: 'productTwitter', type: 'text', required: false },
    { label: 'Product Logo', placeholder: 'Enter logo URL', key: 'productLogo', type: 'text', required: false },
    { label: 'Tags', placeholder: 'Enter tags', key: 'tags', type: 'text', required: false },
    { label: 'Problems', placeholder: 'Enter problems', key: 'problems', type: 'text', required: false },
    { label: 'Solutions', placeholder: 'Enter solutions', key: 'solutions', type: 'text', required: false },
    { label: 'Improvements', placeholder: 'Enter improvements', key: 'improvements', type: 'text', required: false },
    { label: 'Key Features', placeholder: 'Enter key features', key: 'keyFeatures', type: 'text', required: false },
  ];

  const fieldsPerPage = 5;
  const totalPages = Math.ceil(productFormSteps.length / fieldsPerPage);
  const [currentPage, setCurrentPage] = useState(0);

  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    console.log(`Input changed: ${key}=${value}`);
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = user?.id;
      console.log('fetchCompanies - User ID:', userId, 'Token:', token);
      if (!token || !userId) {
        setCompanies([]);
        Alert.alert('Error', 'Session information missing.');
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
      console.log('Companies API response:', JSON.stringify(response.data, null, 2));
      const companiesData = (response.data.companies || []).map((c: any) => ({
        ...c,
        _id: String(c._id || c.id),
      }));
      setCompanies(companiesData);
      if (companiesData.length === 0) {
        Alert.alert('Warning', 'No registered companies found. Please add a company first.');
      }
    } catch (e: any) {
      console.error('fetchCompanies error:', e.message, e.response?.data);
      setCompanies([]);
      Alert.alert('Error', 'Failed to load companies: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = user?.id;
      console.log('fetchProducts - User ID:', userId, 'Token:', token);
      if (!token) {
        Alert.alert('Error', 'Session information missing.');
        setProducts([]);
        return;
      }
      const response = await axios.get(`https://api.aikuaiplatform.com/api/product/user?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Products API response:', JSON.stringify(response.data, null, 2));
      const productsData = response.data.products || [];
      setProducts(productsData);
      console.log('Updated products:', productsData);
      if (productsData.length === 0) {
        console.log('No products found.');
      }
    } catch (e: any) {
      console.error('fetchProducts error:', e.message, e.response?.data);
      setProducts([]);
      Alert.alert('Error', 'Failed to load products: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyProducts = async (companyId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Session information missing.');
        return;
      }
      const response = await axios.get(`https://api.aikuaiplatform.com/api/product/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Company products:', JSON.stringify(response.data, null, 2));
    } catch (e: any) {
      console.error('fetchCompanyProducts error:', e.message, e.response?.data);
      Alert.alert('Error', 'Failed to load company products: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initial load - User:', user);
    fetchCompanies();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      console.log('Companies loaded:', companies);
      fetchCompanyProducts(companies[0]._id);
    } else {
      console.log('No companies found.');
    }
  }, [companies]);

  const validateField = (step: typeof productFormSteps[0]) => {
    const value = formData[step.key];
    console.log('validateField', { field: step.label, value });
    if (step.required && (!value || value.trim() === '')) {
      Alert.alert('Missing Information', `${step.label} is required.`);
      return false;
    }
    if (step.key === 'releaseDate' && value) {
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!dateRegex.test(value)) {
        Alert.alert('Error', 'Enter a valid date (dd.mm.yyyy).');
        return false;
      }
    }
    if (step.key === 'productWebsite' && value && !value.match(/^https?:\/\/.+/)) {
      Alert.alert('Error', 'Enter a valid URL (must start with http:// or https://).');
      return false;
    }
    if (step.key === 'companyId' && value) {
      const isValidCompany = companies.some(c => c._id === value);
      if (!isValidCompany) {
        Alert.alert('Error', 'Select a valid company.');
        return false;
      }
    }
    return true;
  };

  const validatePage = () => {
    const startIndex = currentPage * fieldsPerPage;
    const endIndex = Math.min(startIndex + fieldsPerPage, productFormSteps.length);
    for (let i = startIndex; i < endIndex; i++) {
      if (!validateField(productFormSteps[i])) return false;
    }
    return true;
  };

  const validateForm = () => {
    const requiredFields = productFormSteps.filter(step => step.required).map(step => step.key);
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        Alert.alert('Missing Information', `${productFormSteps.find(step => step.key === field)?.label} is required.`);
        return false;
      }
    }
    if (!companies.some(c => c._id === formData.companyId)) {
      Alert.alert('Error', 'Select a valid company.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validatePage()) return;
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const renderField = (step: typeof productFormSteps[0]) => {
    switch (step.type) {
      case 'text':
        return (
          <TextInput
            style={styles.input}
            placeholder={step.placeholder}
            placeholderTextColor={Colors.lightText}
            value={formData[step.key]}
            onChangeText={text => handleInputChange(step.key, text)}
            multiline={['detailedDescription', 'tags', 'problems', 'solutions', 'improvements', 'keyFeatures'].includes(step.key)}
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
                console.log('Company selected:', { value: val, companyName: selectedCompany?.companyName });
                handleInputChange('companyId', val);
                handleInputChange('companyName', selectedCompany?.companyName || '');
              }}
              style={styles.picker}>
              <Picker.Item label="Select Company" value="" />
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
              onValueChange={(value: string) => handleInputChange(step.key, value)}
              style={styles.picker}>
              <Picker.Item label="Select" value="" />
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

  const renderPageContent = () => {
    const startIndex = currentPage * fieldsPerPage;
    const endIndex = Math.min(startIndex + fieldsPerPage, productFormSteps.length);
    const currentFields = productFormSteps.slice(startIndex, endIndex);

    return currentFields.map((step, index) => (
      <View key={step.key} style={{ marginBottom: metrics.margin.md }}>
        <Text style={styles.inputLabel}>
          {step.label}
          {step.required && <Text style={{ color: 'red' }}> *</Text>}
        </Text>
        {renderField(step)}
      </View>
    ));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = user?.id;
      console.log('handleSubmit - Token:', token, 'User ID:', userId);
      if (!token) {
        Alert.alert('Error', 'You need to log in.');
        return;
      }
      let releaseDate = formData.releaseDate;
      if (releaseDate && /^\d{2}\.\d{2}\.\d{4}$/.test(releaseDate)) {
        const [day, month, year] = releaseDate.split('.');
        releaseDate = `${year}-${month}-${day}`;
      } else {
        Alert.alert('Error', 'Enter a valid date (dd.mm.yyyy).');
        return;
      }
      const selectedCompany = companies.find(c => c._id === formData.companyId);
      if (!selectedCompany) {
        Alert.alert('Error', 'Selected company is invalid.');
        return;
      }
      const data = {
        productName: formData.productName,
        productLogo: formData.productLogo || '',
        productCategory: formData.productCategory,
        productDescription: formData.productDescription,
        detailedDescription: formData.detailedDescription,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        problems: formData.problems ? formData.problems.split(',').map(item => item.trim()).filter(item => item) : [],
        solutions: formData.solutions ? formData.solutions.split(',').map(item => item.trim()).filter(item => item) : [],
        improvements: formData.improvements ? formData.improvements.split(',').map(item => item.trim()).filter(item => item) : [],
        keyFeatures: formData.keyFeatures ? formData.keyFeatures.split(',').map(item => item.trim()).filter(item => item) : [],
        pricingModel: formData.pricingModel,
        releaseDate,
        productPrice: Number(formData.productPrice) || 0,
        productWebsite: formData.productWebsite,
        productLinkedIn: formData.productLinkedIn || '',
        productTwitter: formData.productTwitter || '',
        companyName: selectedCompany.companyName || '',
        companyId: formData.companyId,
      };
      console.log('Data sent:', JSON.stringify(data, null, 2));
      const response = await axios.post(
        'https://api.aikuaiplatform.com/api/product',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('API response:', JSON.stringify(response.data, null, 2));
      console.log('Added product ID:', response.data.product?._id);
      if (!response.data.success || !response.data.product || !response.data.product._id) {
        Alert.alert('Error', 'Product could not be added. Please try again.');
        return;
      }
      Alert.alert('Success', 'Product added successfully.');
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
      setCurrentPage(0);
      await fetchProducts();
    } catch (err: any) {
      console.error('Error details:', JSON.stringify(err, null, 2));
      if (err.response?.status === 401) {
        Alert.alert('Session Error', 'Please log in again.');
      } else if (err.response?.status === 400) {
        Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || 'Invalid data sent.');
      } else {
        Alert.alert('Error', err?.response?.data?.message || err?.message || 'Product could not be added.');
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
      console.log('Updated product:', JSON.stringify(response.data, null, 2));
      await fetchProducts();
    } catch (e: any) {
      console.error('updateProduct error:', e.message);
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
      console.log('Deleted product:', JSON.stringify(response.data, null, 2));
      await fetchProducts();
    } catch (e: any) {
      console.error('deleteProduct error:', e.message);
    }
  };

  const renderProductCard = (product: Product) => (
    <View key={product._id} style={styles.card}>
      <Text style={styles.productTitle}>{product.productName}</Text>
      <Text style={styles.productText}>Category: {product.productCategory}</Text>
      <Text style={styles.productText}>Description: {product.productDescription}</Text>
      <Text style={styles.productText}>Company: {product.companyName}</Text>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            updateProduct(product._id, { productName: `${product.productName} (Updated)` });
          }}>
          <Text style={styles.actionButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteProduct(product._id)}>
          <Text style={styles.actionButtonText}>Delete</Text>
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
              <Text style={styles.noProductsText}>Loading...</Text>
            ) : products.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.noProductsText}>No products found.</Text>
              </View>
            ) : (
              products.map(product => renderProductCard(product))
            )}
            <TouchableOpacity style={styles.addProductCard} onPress={handleAddProduct}>
              <MaterialIcons name="add-business" size={24} color={Colors.primary} />
              <Text style={styles.addProductText}>Add New Product</Text>
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
                    <Text style={styles.modalTitle}>Add Product</Text>
                    <TouchableOpacity onPress={() => setShowAddProductModal(false)}>
                      <Icon name="close" size={24} color={Colors.lightText} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.progressContainer}>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <View
                        key={idx}
                        style={[styles.progressDot, idx === currentPage && styles.activeProgressDot]}
                      />
                    ))}
                  </View>
                  <ScrollView style={{ flex: 1, padding: metrics.padding.lg }}>
                    {renderPageContent()}
                  </ScrollView>
                  <View style={styles.navigationButtons}>
                    {currentPage > 0 && (
                      <TouchableOpacity style={styles.navButton} onPress={handleBack} disabled={loading}>
                        <Text style={styles.navButtonText}>Back</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.navButton} onPress={handleNext} disabled={loading}>
                      <Text style={styles.navButtonText}>
                        {loading ? 'Saving...' : currentPage === totalPages - 1 ? 'Save' : 'Next'}
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
  picker: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
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