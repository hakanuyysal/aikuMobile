import React, {useState} from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {productService} from '../services/api';
import {AxiosError} from 'axios';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProduct'>;

interface FormData {
  productName: string;
  productCategory: string;
  companyName: string;
  productDescription: string;
  pricingModel: string;
  releaseDate: string;
  productWebsite: string;
  // Opsiyonel alanlar
  productLogo: string;
  detailedDescription: string;
  tags: string[];
  problems: string[];
  solutions: string[];
  improvements: string[];
  keyFeatures: string[];
  productPrice: number;
  productLinkedIn: string;
  productTwitter: string;
  companyId: string;
}

const AddProduct = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    productCategory: '',
    companyName: '',
    productDescription: '',
    pricingModel: 'Free',
    releaseDate: '',
    productWebsite: '',
    // Opsiyonel alanlar için varsayılan değerler
    productLogo: '',
    detailedDescription: '',
    tags: [],
    problems: [],
    solutions: [],
    improvements: [],
    keyFeatures: [],
    productPrice: 0,
    productLinkedIn: '',
    productTwitter: '',
    companyId: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.productName.trim()) {
      newErrors.productName = 'Ürün adı zorunludur';
    }
    if (!formData.productCategory.trim()) {
      newErrors.productCategory = 'Kategori seçimi zorunludur';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Şirket adı zorunludur';
    }
    if (!formData.productDescription.trim()) {
      newErrors.productDescription = 'Ürün açıklaması zorunludur';
    }
    if (!formData.pricingModel.trim()) {
      newErrors.pricingModel = 'Fiyatlandırma modeli zorunludur';
    }
    if (!formData.releaseDate.trim()) {
      newErrors.releaseDate = 'Yayın tarihi zorunludur';
    }
    if (!formData.productWebsite.trim()) {
      newErrors.productWebsite = 'Ürün websitesi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const response = await productService.createProduct(formData);
      Alert.alert('Başarılı', 'Ürün başarıyla eklendi!');
      navigation.navigate('ProductDetails', {id: response.product.id});
    } catch (error: unknown) {
      Alert.alert('Hata', 'Ürün eklenirken bir hata oluştu.');
      console.error('Ürün ekleme hatası:', error);
      if (error instanceof AxiosError) {
        console.error('API Hatası Durumu:', error.response?.status);
        console.error('API Hatası Verisi:', error.response?.data);
      } else if (error instanceof Error) {
        console.error('Genel Hata Mesajı:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    label: string,
    value: string | number,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    maxLength?: number,
    keyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' = 'default',
    fieldName?: keyof FormData,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          fieldName && errors[fieldName] && styles.inputError,
        ]}
        value={String(value)}
        onChangeText={(text) => {
          onChangeText(text.trim());
          if (fieldName && errors[fieldName]) {
            setErrors(prev => ({...prev, [fieldName]: undefined}));
          }
        }}
        placeholder={placeholder}
        placeholderTextColor={Colors.lightText + '80'}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
      />
      {fieldName && errors[fieldName] && (
        <Text style={styles.errorText}>{errors[fieldName]}</Text>
      )}
      {maxLength && (
        <Text style={styles.characterCount}>
          {String(value).length}/{maxLength}
        </Text>
      )}
    </View>
  );

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
            <Icon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Product</Text>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleAddProduct}
            disabled={loading}>
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
              (text) => setFormData({...formData, productName: text.trim()}),
              'Enter your product name',
              false,
              undefined,
              'default',
              'productName'
            )}

            {renderInputField(
              'Product Logo URL',
              formData.productLogo,
              (text) => setFormData({...formData, productLogo: text.trim()}),
              'Enter product logo URL',
            )}

            {renderInputField(
              'Product Category',
              formData.productCategory,
              (text) => setFormData({...formData, productCategory: text.trim()}),
              'Select a category',
              false,
              undefined,
              'default',
              'productCategory'
            )}

            {renderInputField(
              'Company Name',
              formData.companyName,
              (text) => setFormData({...formData, companyName: text.trim()}),
              'Select your company',
              false,
              undefined,
              'default',
              'companyName'
            )}

            {renderInputField(
              'Company ID',
              formData.companyId,
              (text) => setFormData({...formData, companyId: text.trim()}),
              'Enter company ID',
            )}

            {renderInputField(
              'Product Description',
              formData.productDescription,
              (text) => setFormData({...formData, productDescription: text.trim()}),
              'Brief description of your product',
              true,
              500,
              'default',
              'productDescription'
            )}

            {renderInputField(
              'Detailed Description',
              formData.detailedDescription,
              (text) => setFormData({...formData, detailedDescription: text.trim()}),
              'Provide more details about your product',
              true,
              3000,
            )}

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Tags</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter tags (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.tags.join(', ')}
                onChangeText={(text) => setFormData({...formData, tags: text.split(',').map(tag => tag.trim()).filter(Boolean)})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Problems</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter problems (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.problems.join(', ')}
                onChangeText={(text) => setFormData({...formData, problems: text.split(',').map(problem => problem.trim()).filter(Boolean)})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Solutions</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter solutions (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.solutions.join(', ')}
                onChangeText={(text) => setFormData({...formData, solutions: text.split(',').map(solution => solution.trim()).filter(Boolean)})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Improvements</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter improvements (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.improvements.join(', ')}
                onChangeText={(text) => setFormData({...formData, improvements: text.split(',').map(improvement => improvement.trim()).filter(Boolean)})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Key Features</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter key features (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.keyFeatures.join(', ')}
                onChangeText={(text) => setFormData({...formData, keyFeatures: text.split(',').map(feature => feature.trim()).filter(Boolean)})}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pricing Model</Text>
              <TouchableOpacity style={styles.pricingButton}>
                <Text style={styles.pricingButtonText}>Free</Text>
                <Icon name="chevron-down" size={20} color={Colors.lightText} />
              </TouchableOpacity>
            </View>

            {renderInputField(
              'Release Date',
              formData.releaseDate,
              (text) => setFormData({...formData, releaseDate: text.trim()}),
              'gg.aa.yyyy',
              false,
              undefined,
              'default',
              'releaseDate'
            )}

            {renderInputField(
              'Product Price',
              formData.productPrice,
              (text) => setFormData({...formData, productPrice: Number(text)}),
              'Enter product price',
              false,
              undefined,
              'numeric',
            )}

            {renderInputField(
              'Product Website',
              formData.productWebsite,
              (text) => setFormData({...formData, productWebsite: text.trim()}),
              'Enter your product website',
              false,
              undefined,
              'default',
              'productWebsite'
            )}

            {renderInputField(
              'Product LinkedIn',
              formData.productLinkedIn,
              (text) => setFormData({...formData, productLinkedIn: text.trim()}),
              'Enter your product LinkedIn',
            )}

            {renderInputField(
              'Product X (Twitter)',
              formData.productTwitter,
              (text) => setFormData({...formData, productTwitter: text.trim()}),
              'Enter your product Twitter',
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleAddProduct}>
              <Text style={styles.submitButtonText}>Submit Product</Text>
            </TouchableOpacity>
          </View>
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
  fileUploadButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    alignItems: 'center',
  },
  fileUploadText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
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
  disabledButton: {
    opacity: 0.5,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: metrics.fontSize.sm,
    marginTop: metrics.margin.xs,
  },
});

export default AddProduct; 