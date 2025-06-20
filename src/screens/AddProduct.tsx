import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { productService } from '../services/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProduct'>;

interface FormData {
  productName: string;
  productLogo: string;
  productCategory: string;
  productDescription: string;
  detailedDescription: string;
  tags: string[];
  problems: string[];
  solutions: string[];
  improvements: string[];
  keyFeatures: string[];
  pricingModel: string;
  releaseDate: string;
  productPrice: number;
  productWebsite: string;
  productLinkedIn: string;
  productTwitter: string;
  companyName: string;
  companyId: string;
}

interface Company {
  id: string;
  companyName: string;
}

interface Product {
  id: string;
  productName: string;
  productLogo?: string;
  productCategory?: string;
  productDescription?: string;
  detailedDescription?: string;
  tags?: string[];
  problems?: string[];
  solutions?: string[];
  improvements?: string[];
  keyFeatures?: string[];
  pricingModel?: string;
  releaseDate?: string;
  productPrice?: number;
  productWebsite?: string;
  productLinkedIn?: string;
  productTwitter?: string;
  companyName?: string;
  companyId?: string;
}

const AddProduct = ({ navigation, route }: Props) => {
  const { user } = route.params;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageCompany, setErrorMessageCompany] = useState('');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showPricingOptions, setShowPricingOptions] = useState(false);
  const [showCompanyOptions, setShowCompanyOptions] = useState(false);
  const pricingOptions = ['Free', 'Paid', 'Freemium', 'Subscription'];

  const initialFormData: FormData = {
    productName: '',
    productLogo: '',
    productCategory: '',
    productDescription: '',
    detailedDescription: '',
    tags: [],
    problems: [],
    solutions: [],
    improvements: [],
    keyFeatures: [],
    pricingModel: '',
    releaseDate: '',
    productPrice: 0,
    productWebsite: '',
    productLinkedIn: '',
    productTwitter: '',
    companyName: '',
    companyId: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const fetchUserCompanies = useCallback(async () => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error("Kullanıcı ID'si bulunamadı.");
      }
      const userCompanies = await productService.getUserCompanies(userId);
      setCompanies(userCompanies.companies || []);
    } catch (error) {
      console.error('Error fetching user companies:', error);
      setErrorMessageCompany('Failed to load companies. Please add a company first.');
      setCompanies([]);
    }
  }, [user]);

  const fetchUserProducts = useCallback(async () => {
    try {
      const userProducts = await productService.getUserProducts();
      const normalizedProducts = (userProducts.products || []).map((p: any) => ({
        ...p,
        id: p.id || p._id || '',
      }));
      setProducts(normalizedProducts);
    } catch (error) {
      console.error('Error fetching user products:', error);
      setErrorMessage('Failed to load products.');
    }
  }, []);

  useEffect(() => {
    fetchUserProducts();
    fetchUserCompanies();
  }, [fetchUserProducts, fetchUserCompanies]);

  const handleNewProduct = () => {
    setFormErrors([]);
    if (companies.length === 0) {
      setErrorMessageCompany('You need to add a company first');
      return;
    }

    const allowedPlans = ['startup', 'investor', 'business'];
    if (
      !user.subscriptionPlan ||
      !allowedPlans.includes(user.subscriptionPlan.toLowerCase())
    ) {
      setErrorMessage('Subscription required');
      return;
    }

    setErrorMessage('');
    setErrorMessageCompany('');
    setSelectedProduct(null);
    setFormData(initialFormData);
    setShowProductForm(true);
    setMessage('');
  };

  const handleProductSelect = (product: Product) => {
    setFormErrors([]);
    setSelectedProduct(product);
    setFormData({
      productName: product.productName || '',
      productLogo: product.productLogo || '',
      productCategory: product.productCategory || '',
      productDescription: product.productDescription || '',
      detailedDescription: product.detailedDescription || '',
      tags: product.tags || [],
      problems: product.problems || [],
      solutions: product.solutions || [],
      improvements: product.improvements || [],
      keyFeatures: product.keyFeatures || [],
      pricingModel: product.pricingModel || '',
      releaseDate: product.releaseDate
        ? new Date(product.releaseDate).toISOString().split('T')[0]
        : '',
      productPrice: product.productPrice || 0,
      productWebsite: product.productWebsite || '',
      productLinkedIn: product.productLinkedIn || '',
      productTwitter: product.productTwitter || '',
      companyId: product.companyId || '',
      companyName: product.companyName || '',
    });
    setShowProductForm(true);
  };

  const handleAddProduct = async () => {
    // Client-side validation
    if (
      !formData.productName ||
      !formData.productCategory ||
      !formData.productDescription ||
      !formData.detailedDescription ||
      !formData.pricingModel ||
      !formData.companyId
    ) {
      Alert.alert(
        'Eksik Bilgi',
        'Lütfen tüm zorunlu alanları doldurun: Ürün Adı, Kategori, Açıklama, Detaylı Açıklama, Fiyatlandırma Modeli, Şirket'
      );
      setFormErrors([
        'Please fill in all required fields: Product Name, Category, Short Description, Detailed Description, Pricing Model, Company',
      ]);
      return;
    }

    try {
      setLoading(true);
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, formData);
        Alert.alert('Başarılı', 'Ürün başarıyla güncellendi!');
        setMessage('Product successfully updated!');
      } else {
        const response = await productService.createProduct(formData);
        Alert.alert('Başarılı', 'Ürün başarıyla eklendi!');
        setMessage('Product successfully added!');
        navigation.navigate('ProductDetails', { id: response.product.id });
      }
      await fetchUserProducts();
      setShowProductForm(false);
      setSelectedProduct(null);
      setFormData(initialFormData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessages =
          error.response?.data?.errors?.map((err: any) => err.msg) || ['Ürün işlenirken bir hata oluştu.'];
        setFormErrors(errorMessages);
        Alert.alert('Hata', errorMessages.join(', '));
        console.error('API Hatası Durumu:', error.response?.status);
        console.error('API Hatası Verisi:', error.response?.data);
      } else {
        setFormErrors(['Bilinmeyen bir hata oluştu.']);
        Alert.alert('Hata', 'Bilinmeyen bir hata oluştu.');
        console.error('Ürün işleme hatası:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Ürünü Sil',
      `"${selectedProduct?.productName}" ürününü silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await productService.deleteProduct(selectedProduct!.id);
              Alert.alert('Başarılı', 'Ürün başarıyla silindi!');
              setMessage('Product deleted successfully!');
              await fetchUserProducts();
              setShowProductForm(false);
              setSelectedProduct(null);
              setFormData(initialFormData);
            } catch (error: unknown) {
              if (axios.isAxiosError(error)) {
                const errorMessages =
                  error.response?.data?.errors?.map((err: any) => err.msg) || ['Ürün silinirken bir hata oluştu.'];
                setFormErrors(errorMessages);
                Alert.alert('Hata', errorMessages.join(', '));
              } else {
                setFormErrors(['Bilinmeyen bir hata oluştu.']);
                Alert.alert('Hata', 'Bilinmeyen bir hata oluştu.');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderInputField = (
    label: string,
    value: string | number,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    maxLength?: number,
    keyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url' = 'default',
    required: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={String(value)}
        onChangeText={(text) => onChangeText(text.trim())}
        placeholder={placeholder}
        placeholderTextColor={Colors.lightText + '80'}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {String(value).length}/{maxLength}
        </Text>
      )}
    </View>
  );

  const renderTagInput = (
    label: string,
    value: string[],
    onChangeText: (tags: string[]) => void,
    placeholder: string
  ) => (
    <View style={styles.tagContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, styles.tagInput]}
        placeholder={placeholder}
        placeholderTextColor={Colors.lightText + '80'}
        value={value.join(', ')}
        onChangeText={(text) =>
          onChangeText(text.split(',').map((tag) => tag.trim()).filter(Boolean))
        }
      />
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductSelect(item)}
    >
      <Image
        source={item.productLogo ? { uri: `${process.env.REACT_APP_IMG_URL}${item.productLogo}` } : undefined}
        style={styles.productImage}
      />
      <Text style={styles.productName}>{item.productName}</Text>
    </TouchableOpacity>
  );

  console.log('user:', user);

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {!showProductForm ? (
          <>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="chevron-back" size={24} color={Colors.lightText} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Product Details</Text>
            </View>
            <ScrollView style={styles.content}>
              <Text style={styles.sectionTitle}>Product Information</Text>
              {errorMessage && (
                <TouchableOpacity
                  onPress={() => navigation.navigate({ name: 'Pricing' })}
                  style={styles.warningMessage}
                >
                  <Icon name="warning-outline" size={30} color={Colors.error} />
                  <Text style={styles.warningText}>{errorMessage}</Text>
                </TouchableOpacity>
              )}
              {errorMessageCompany && (
                <TouchableOpacity
                  onPress={() => navigation.navigate({ name: 'CompanyProfile' })}
                  style={styles.warningMessage}
                >
                  <Icon name="warning-outline" size={30} color={Colors.error} />
                  <Text style={styles.warningText}>{errorMessageCompany}</Text>
                </TouchableOpacity>
              )}
              {message && (
                <View style={styles.successMessage}>
                  <Icon name="checkmark-circle-outline" size={30} color={Colors.primary} />
                  <Text style={styles.successText}>{message}</Text>
                </View>
              )}
              <View style={styles.productListContainer}>
                {products === null ? (
                  <Text style={styles.loadingText}>Loading...</Text>
                ) : products.length > 0 ? (
                  <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.productRow}
                  />
                ) : (
                  <Text style={styles.noProductsText}>No products found.</Text>
                )}
                <TouchableOpacity style={styles.addProductButton} onPress={handleNewProduct}>
                  <Icon name="add-circle-outline" size={30} color={Colors.primary} />
                  <Text style={styles.addProductText}>Add New Product</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowProductForm(false)}
              >
                <Icon name="close" size={24} color={Colors.lightText} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {selectedProduct ? 'Edit Product' : 'Add Product'}
              </Text>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleAddProduct}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
              <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Product Information</Text>

                {renderInputField(
                  'Product Name',
                  formData.productName,
                  (text) => setFormData({ ...formData, productName: text }),
                  'Enter your product name',
                  false,
                  undefined,
                  'default',
                  true
                )}

                {renderInputField(
                  'Product Logo URL',
                  formData.productLogo,
                  (text) => setFormData({ ...formData, productLogo: text }),
                  'Enter product logo URL',
                  false,
                  undefined,
                  'url'
                )}

                {renderInputField(
                  'Product Category',
                  formData.productCategory,
                  (text) => setFormData({ ...formData, productCategory: text }),
                  'Enter a category',
                  false,
                  undefined,
                  'default',
                  true
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Company Name <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pricingButton}
                    onPress={() => setShowCompanyOptions(!showCompanyOptions)}
                  >
                    <Text style={styles.pricingButtonText}>
                      {formData.companyName || 'Select your company'}
                    </Text>
                    <Icon name="chevron-down" size={20} color={Colors.lightText} />
                  </TouchableOpacity>
                  {showCompanyOptions && (
                    <View style={styles.pricingOptions}>
                      {companies.map((company) => (
                        <TouchableOpacity
                          key={company.id}
                          style={styles.pricingOption}
                          onPress={() => {
                            setFormData({
                              ...formData,
                              companyId: company.id,
                              companyName: company.companyName,
                            });
                            setShowCompanyOptions(false);
                          }}
                        >
                          <Text style={styles.pricingOptionText}>{company.companyName}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {renderInputField(
                  'Product Description',
                  formData.productDescription,
                  (text) => setFormData({ ...formData, productDescription: text }),
                  'Brief description of your product',
                  true,
                  500,
                  'default',
                  true
                )}

                {renderInputField(
                  'Detailed Description',
                  formData.detailedDescription,
                  (text) => setFormData({ ...formData, detailedDescription: text }),
                  'Provide more details about your product',
                  true,
                  3000,
                  'default',
                  true
                )}

                {renderTagInput(
                  'Tags',
                  formData.tags,
                  (tags) => setFormData({ ...formData, tags }),
                  'Enter tags (comma-separated)'
                )}

                {renderTagInput(
                  'Problems',
                  formData.problems,
                  (problems) => setFormData({ ...formData, problems }),
                  'Enter problems (comma-separated)'
                )}

                {renderTagInput(
                  'Solutions',
                  formData.solutions,
                  (solutions) => setFormData({ ...formData, solutions }),
                  'Enter solutions (comma-separated)'
                )}

                {renderTagInput(
                  'Improvements',
                  formData.improvements,
                  (improvements) => setFormData({ ...formData, improvements }),
                  'Enter improvements (comma-separated)'
                )}

                {renderTagInput(
                  'Key Features',
                  formData.keyFeatures,
                  (keyFeatures) => setFormData({ ...formData, keyFeatures }),
                  'Enter key features (comma-separated)'
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Pricing Model <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pricingButton}
                    onPress={() => setShowPricingOptions(!showPricingOptions)}
                  >
                    <Text style={styles.pricingButtonText}>
                      {formData.pricingModel || 'Select pricing model'}
                    </Text>
                    <Icon name="chevron-down" size={20} color={Colors.lightText} />
                  </TouchableOpacity>
                  {showPricingOptions && (
                    <View style={styles.pricingOptions}>
                      {pricingOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.pricingOption}
                          onPress={() => {
                            setFormData({ ...formData, pricingModel: option });
                            setShowPricingOptions(false);
                          }}
                        >
                          <Text style={styles.pricingOptionText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {renderInputField(
                  'Release Date',
                  formData.releaseDate,
                  (text) => setFormData({ ...formData, releaseDate: text }),
                  'dd.mm.yyyy'
                )}

                {renderInputField(
                  'Product Price',
                  formData.productPrice,
                  (text) => setFormData({ ...formData, productPrice: Number(text) || 0 }),
                  'Enter product price',
                  false,
                  undefined,
                  'numeric'
                )}

                {renderInputField(
                  'Product Website',
                  formData.productWebsite,
                  (text) => setFormData({ ...formData, productWebsite: text }),
                  'Enter your product website',
                  false,
                  undefined,
                  'url'
                )}

                {renderInputField(
                  'Product LinkedIn',
                  formData.productLinkedIn,
                  (text) => setFormData({ ...formData, productLinkedIn: text }),
                  'Enter your product LinkedIn',
                  false,
                  undefined,
                  'url'
                )}

                {renderInputField(
                  'Product X (Twitter)',
                  formData.productTwitter,
                  (text) => setFormData({ ...formData, productTwitter: text }),
                  'Enter your product Twitter',
                  false,
                  undefined,
                  'url'
                )}

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={handleAddProduct}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {selectedProduct ? 'Update Product' : 'Add Product'}
                  </Text>
                </TouchableOpacity>

                {selectedProduct && (
                  <TouchableOpacity
                    style={[styles.deleteButton, loading && styles.disabledButton]}
                    onPress={handleDeleteProduct}
                    disabled={loading}
                  >
                    <Text style={styles.deleteButtonText}>Delete Product</Text>
                  </TouchableOpacity>
                )}

                {formErrors.length > 0 && (
                  <View style={styles.errorContainer}>
                    {formErrors.map((err, i) => (
                      <Text key={i} style={styles.errorText}>
                        • {err}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </>
        )}
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
  saveButton: {
    position: 'absolute',
    right: metrics.margin.lg,
    top: metrics.margin.lg,
    zIndex: 1,
  },
  saveButtonText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: metrics.padding.lg,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.xl,
    color: Colors.lightText,
    fontWeight: 'bold',
    marginBottom: metrics.margin.lg,
  },
  inputContainer: {
    marginBottom: metrics.margin.md,
  },
  inputLabel: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
  },
  requiredAsterisk: {
    color: Colors.error,
    fontSize: metrics.fontSize.md,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: Colors.lightText + '80',
    fontSize: metrics.fontSize.sm,
    textAlign: 'right',
    marginTop: metrics.margin.xs,
  },
  tagContainer: {
    marginBottom: metrics.margin.md,
  },
  tagInput: {
    marginRight: 0,
  },
  pricingButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  pricingOptions: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    marginTop: metrics.margin.sm,
    padding: metrics.padding.sm,
  },
  pricingOption: {
    padding: metrics.padding.sm,
  },
  pricingOptionText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.lg,
    alignItems: 'center',
    marginTop: metrics.margin.lg,
  },
  submitButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.lg,
    alignItems: 'center',
    marginTop: metrics.margin.md,
  },
  deleteButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  productListContainer: {
    marginBottom: metrics.margin.lg,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    margin: metrics.margin.sm,
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: metrics.borderRadius.sm,
    backgroundColor: '#fff',
  },
  productName: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    marginTop: metrics.margin.sm,
    textAlign: 'center',
  },
  productRow: {
    justifyContent: 'space-between',
  },
  addProductButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.lg,
    alignItems: 'center',
    marginTop: metrics.margin.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addProductText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
    marginLeft: metrics.margin.sm,
  },
  loadingText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    textAlign: 'center',
  },
  noProductsText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    textAlign: 'center',
  },
  warningMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  warningText: {
    color: Colors.error,
    fontSize: metrics.fontSize.md,
    marginLeft: metrics.margin.sm,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  successText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
    marginLeft: metrics.margin.sm,
  },
  errorContainer: {
    marginTop: metrics.margin.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: metrics.fontSize.sm,
  },
});

export default AddProduct;
