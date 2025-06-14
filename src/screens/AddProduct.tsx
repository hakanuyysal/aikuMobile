import React, {useState, useEffect} from 'react';
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
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {productService} from '../services/api';
import {AxiosError} from 'axios';
import * as ImagePicker from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProduct'>;

interface FormData {
  productName: string;
  productLogo: string | null;
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
  productWebsite: string;
  productLinkedIn: string;
  productTwitter: string;
  companyName: string;
  companyId: string;
}

const AddProduct = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    productName: '',
    productLogo: null,
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
    productWebsite: '',
    productLinkedIn: '',
    productTwitter: '',
    companyName: '',
    companyId: '',
  });

  const [inputValues, setInputValues] = useState({
    tags: '',
    problems: '',
    solutions: '',
    improvements: '',
    keyFeatures: '',
  });

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 500,
      maxWidth: 500,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
        return;
      }
      if (response.assets && response.assets[0]) {
        setFormData(prev => ({
          ...prev,
          productLogo: response.assets[0].uri || null,
        }));
      }
    });
  };

  const addItem = (field: string) => {
    if (inputValues[field].trim() !== '') {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], inputValues[field].trim()],
      }));
      setInputValues(prev => ({...prev, [field]: ''}));
    }
  };

  const removeItem = (index: number, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFormErrors([]);

    try {
      const response = await productService.createProduct(formData);
      Alert.alert('Başarılı', 'Ürün başarıyla eklendi!');
      navigation.navigate('ProductDetails', {id: response.product.id});
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.errors) {
        const msgs = error.response.data.errors.map((e: any) => e.msg);
        setFormErrors(msgs);
      } else {
        Alert.alert('Hata', 'Ürün eklenirken bir hata oluştu.');
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
    required: boolean = false,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={String(value)}
        onChangeText={onChangeText}
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
    field: string,
    items: string[],
    placeholder: string,
  ) => (
    <View style={styles.tagContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.tagInputContainer}>
        <TextInput
          style={[styles.input, styles.tagInput]}
          placeholder={placeholder}
          placeholderTextColor={Colors.lightText + '80'}
          value={inputValues[field]}
          onChangeText={(text) =>
            setInputValues(prev => ({...prev, [field]: text}))
          }
          onSubmitEditing={() => addItem(field)}
        />
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={() => addItem(field)}
          disabled={!inputValues[field].trim()}>
          <Text style={styles.addTagButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tagList}>
        {items.map((item, index) => (
          <View key={index} style={styles.tagItem}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity
              onPress={() => removeItem(index, field)}
              style={styles.removeTagButton}>
              <Icon name="close" size={16} color={Colors.lightText} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
          <Text style={styles.headerTitle}>Yeni Ürün Ekle</Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => setShowAIOptions(!showAIOptions)}>
              <Icon name="bulb-outline" size={24} color={Colors.primary} />
              <Text style={styles.aiButtonText}>AI ile Doldur</Text>
            </TouchableOpacity>

            {showAIOptions && (
              <View style={styles.aiOptionsContainer}>
                <TouchableOpacity
                  style={styles.aiOption}
                  onPress={() => {
                    setShowAIOptions(false);
                    // Website analizi için modal göster
                  }}>
                  <Text style={styles.aiOptionText}>Websiteden Doldur</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.aiOption}
                  onPress={() => {
                    setShowAIOptions(false);
                    // Doküman analizi için dosya seçici göster
                  }}>
                  <Text style={styles.aiOptionText}>Dokümandan Doldur</Text>
                </TouchableOpacity>
              </View>
            )}

            {renderInputField(
              'Ürün Adı',
              formData.productName,
              (text) => setFormData({...formData, productName: text}),
              'Ürün adını girin',
              false,
              undefined,
              'default',
              true,
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ürün Logosu</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handleImagePicker}>
                {formData.productLogo ? (
                  <Image
                    source={{uri: formData.productLogo}}
                    style={styles.productLogo}
                  />
                ) : (
                  <View style={styles.placeholderLogo}>
                    <Icon name="image-outline" size={32} color={Colors.lightText} />
                    <Text style={styles.placeholderText}>Logo Seç</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Kategori <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.selectContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.productCategory}
                  onChangeText={(text) =>
                    setFormData({...formData, productCategory: text})
                  }
                  placeholder="Kategori seçin"
                  placeholderTextColor={Colors.lightText + '80'}
                />
                <Icon name="chevron-down" size={24} color={Colors.lightText} />
              </View>
            </View>

            {renderInputField(
              'Kısa Açıklama',
              formData.productDescription,
              (text) => setFormData({...formData, productDescription: text}),
              'Ürününüz hakkında kısa açıklama',
              true,
              500,
              'default',
              true,
            )}

            {renderInputField(
              'Detaylı Açıklama',
              formData.detailedDescription,
              (text) => setFormData({...formData, detailedDescription: text}),
              'Ürününüz hakkında detaylı açıklama',
              true,
              3000,
            )}

            {renderTagInput('Etiketler', 'tags', formData.tags, 'Etiket ekleyin')}
            {renderTagInput('Problemler', 'problems', formData.problems, 'Problem ekleyin')}
            {renderTagInput('Çözümler', 'solutions', formData.solutions, 'Çözüm ekleyin')}
            {renderTagInput('İyileştirmeler', 'improvements', formData.improvements, 'İyileştirme ekleyin')}
            {renderTagInput('Özellikler', 'keyFeatures', formData.keyFeatures, 'Özellik ekleyin')}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Fiyatlandırma Modeli <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.selectContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.pricingModel}
                  onChangeText={(text) =>
                    setFormData({...formData, pricingModel: text})
                  }
                  placeholder="Fiyatlandırma modeli seçin"
                  placeholderTextColor={Colors.lightText + '80'}
                />
                <Icon name="chevron-down" size={24} color={Colors.lightText} />
              </View>
            </View>

            {renderInputField(
              'Yayın Tarihi',
              formData.releaseDate,
              (text) => setFormData({...formData, releaseDate: text}),
              'gg.aa.yyyy',
              false,
              undefined,
              'default',
              true,
            )}

            {renderInputField(
              'Ürün Websitesi',
              formData.productWebsite,
              (text) => setFormData({...formData, productWebsite: text}),
              'Ürün websitesini girin',
              false,
              undefined,
              'default',
              true,
            )}

            {renderInputField(
              'LinkedIn',
              formData.productLinkedIn,
              (text) => setFormData({...formData, productLinkedIn: text}),
              'LinkedIn profilini girin',
            )}

            {renderInputField(
              'Twitter',
              formData.productTwitter,
              (text) => setFormData({...formData, productTwitter: text}),
              'Twitter profilini girin',
            )}

            {formErrors.length > 0 && (
              <View style={styles.errorContainer}>
                {formErrors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.lightText} />
              ) : (
                <Text style={styles.submitButtonText}>Ürünü Kaydet</Text>
              )}
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
  inputContainer: {
    marginBottom: metrics.margin.md,
  },
  inputLabel: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
  },
  requiredStar: {
    color: 'red',
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
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    paddingRight: metrics.padding.md,
  },
  imagePickerButton: {
    width: 100,
    height: 100,
    borderRadius: metrics.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  productLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.lightText,
    marginTop: metrics.margin.xs,
  },
  tagContainer: {
    marginBottom: metrics.margin.md,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: metrics.margin.sm,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    padding: metrics.padding.sm,
    borderRadius: metrics.borderRadius.md,
  },
  addTagButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: metrics.margin.sm,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.sm,
    marginRight: metrics.margin.sm,
    marginBottom: metrics.margin.sm,
  },
  tagText: {
    color: Colors.lightText,
    marginRight: metrics.margin.xs,
  },
  removeTagButton: {
    padding: metrics.padding.xs,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
  },
  aiButtonText: {
    color: Colors.primary,
    marginLeft: metrics.margin.sm,
    fontSize: metrics.fontSize.md,
  },
  aiOptionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
    overflow: 'hidden',
  },
  aiOption: {
    padding: metrics.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  aiOptionText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,0,0,0.1)',
    padding: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
  },
  errorText: {
    color: 'red',
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.xs,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: metrics.padding.lg,
    borderRadius: metrics.borderRadius.md,
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