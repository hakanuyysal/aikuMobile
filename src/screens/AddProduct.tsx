import React, { useState } from 'react';
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
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { productService } from '../services/api'; // Güncellenmiş import

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

const AddProduct = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
    pricingModel: 'Free',
    releaseDate: '',
    productPrice: 0,
    productWebsite: '',
    productLinkedIn: '',
    productTwitter: '',
    companyName: '',
    companyId: '',
  });

  const handleAddProduct = async () => {
    console.log('Form data:', formData);

    // Client-side validation
    if (
      !formData.productName ||
      !formData.productCategory ||
      !formData.productDescription ||
      !formData.companyId
    ) {
      Alert.alert(
        'Eksik Bilgi',
        'Lütfen tüm zorunlu alanları doldurun: Ürün Adı, Kategori, Açıklama, Şirket ID'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await productService.createProduct(formData);
      Alert.alert('Başarılı', 'Ürün başarıyla eklendi!');
      navigation.navigate('ProductDetails', { id: response.product.id });
    } catch (error: unknown) {
      Alert.alert('Hata', 'Ürün eklenirken bir hata oluştu.');
      console.error('Ürün ekleme hatası:', error);
      if (error instanceof Error) {
        console.error('API Hatası Durumu:', (error as any).response?.status);
        console.error('API Hatası Verisi:', (error as any).response?.data);
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
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
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

  return (
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
              (text) => setFormData({ ...formData, productName: text }),
              'Enter your product name',
            )}

            {renderInputField(
              'Product Logo URL',
              formData.productLogo,
              (text) => setFormData({ ...formData, productLogo: text }),
              'Enter product logo URL',
            )}

            {renderInputField(
              'Product Category',
              formData.productCategory,
              (text) => setFormData({ ...formData, productCategory: text }),
              'Select a category',
            )}

            {renderInputField(
              'Company Name',
              formData.companyName,
              (text) => setFormData({ ...formData, companyName: text }),
              'Select your company',
            )}

            {renderInputField(
              'Company ID',
              formData.companyId,
              (text) => setFormData({ ...formData, companyId: text }),
              'Enter company ID',
            )}

            {renderInputField(
              'Product Description',
              formData.productDescription,
              (text) => setFormData({ ...formData, productDescription: text }),
              'Brief description of your product',
              true,
              500,
            )}

            {renderInputField(
              'Detailed Description',
              formData.detailedDescription,
              (text) => setFormData({ ...formData, detailedDescription: text }),
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
                onChangeText={(text) => setFormData({ ...formData, tags: text.split(',').map(tag => tag.trim()) })}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Problems</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter problems (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.problems.join(', ')}
                onChangeText={(text) => setFormData({ ...formData, problems: text.split(',').map(problem => problem.trim()) })}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Solutions</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter solutions (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.solutions.join(', ')}
                onChangeText={(text) => setFormData({ ...formData, solutions: text.split(',').map(solution => solution.trim()) })}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Improvements</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter improvements (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.improvements.join(', ')}
                onChangeText={(text) => setFormData({ ...formData, improvements: text.split(',').map(improvement => improvement.trim()) })}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Key Features</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter key features (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.keyFeatures.join(', ')}
                onChangeText={(text) => setFormData({ ...formData, keyFeatures: text.split(',').map(feature => feature.trim()) })}
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
              (text) => setFormData({ ...formData, releaseDate: text }),
              'gg.aa.yyyy',
            )}

            {renderInputField(
              'Product Price',
              formData.productPrice,
              (text) => setFormData({ ...formData, productPrice: Number(text) || 0 }),
              'Enter product price',
              false,
              undefined,
              'numeric',
            )}

            {renderInputField(
              'Product Website',
              formData.productWebsite,
              (text) => setFormData({ ...formData, productWebsite: text }),
              'Enter your product website',
            )}

            {renderInputField(
              'Product LinkedIn',
              formData.productLinkedIn,
              (text) => setFormData({ ...formData, productLinkedIn: text }),
              'Enter your product LinkedIn',
            )}

            {renderInputField(
              'Product X (Twitter)',
              formData.productTwitter,
              (text) => setFormData({ ...formData, productTwitter: text }),
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
});

export default AddProduct;