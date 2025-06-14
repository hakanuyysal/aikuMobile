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
  Image,
  Modal,
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
  [key: string]: string | string[] | null;
}

interface InputValues {
  tags: string;
  problems: string;
  solutions: string;
  improvements: string;
  keyFeatures: string;
  [key: string]: string;
}

const AddProduct = ({navigation}: Props) => {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<InputValues>({
    tags: '',
    problems: '',
    solutions: '',
    improvements: '',
    keyFeatures: '',
  });

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

  // AI Modal state'leri
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiWebsite, setAiWebsite] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiProtocol, setAiProtocol] = useState<'https://' | 'http://'>('https://');
  const [aiTab, setAiTab] = useState<'select' | 'website' | 'file' | 'loading'>('select');
  const [aiFile, setAiFile] = useState<any>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiMethod, setAiMethod] = useState<'website' | 'file'>('website');

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
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setFormData(prev => ({
          ...prev,
          productLogo: uri,
        }));
      }
    });
  };

  const addItem = (field: keyof InputValues) => {
    if (inputValues[field].trim() !== '') {
      const fieldName = field as keyof FormData;
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] as string[]), inputValues[field].trim()],
      }));
      setInputValues(prev => ({...prev, [field]: ''}));
    }
  };

  const removeItem = (index: number, field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i: number) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFormErrors([]);

    try {
      const response = await productService.createProduct({
        ...formData,
        productLogo: formData.productLogo || undefined,
      });
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

  // AI modalı için analiz mesajı fonksiyonu
  const getAnalysisMessage = (progress: number, method: 'website' | 'file') => {
    if (progress < 25) {
      return method === 'website' ? 'Website analiz ediliyor...' : 'Doküman okunuyor...';
    } else if (progress < 50) {
      return method === 'website' ? 'Ürün bilgileri çıkarılıyor...' : 'İçerik çıkarılıyor...';
    } else if (progress < 75) {
      return 'Bilgileriniz işleniyor...';
    } else if (progress < 90) {
      return 'Neredeyse tamamlandı...';
    } else {
      return 'Ürün detayları optimize ediliyor...';
    }
  };

  // AI ile doldurma fonksiyonu
  const handleAIFill = async () => {
    setAiError('');
    setAiTab('loading');
    setAiProgress(0);
    setAiMethod(prev => (prev === 'website' || prev === 'file') ? prev : 'website');
    let progress = 0;
    const intervalStep = 250;
    const totalDuration = 4000;
    const steps = Math.floor(totalDuration / intervalStep);
    const progressStep = 100 / steps;
    const interval = setInterval(() => {
      progress += progressStep;
      setAiProgress(Math.min(progress, 100));
    }, intervalStep);
    try {
      if (aiTab === 'website') {
        if (!aiWebsite.trim()) {
          setAiError('Lütfen bir website URL\'si girin.');
          setAiTab('website');
          clearInterval(interval);
          return;
        }
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
        let url = aiWebsite.trim();
        if (!urlPattern.test(url)) {
          setAiError('Geçersiz URL formatı.');
          setAiTab('website');
          clearInterval(interval);
          return;
        }
        if (!/^https?:\/\//i.test(url)) {
          url = aiProtocol + url;
        }
        url = url.replace(/^(https?:\/\/)+(https?:\/\/)/i, '$1');
        const response = await fetch('/ai/analyze-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        const data = await response.json();
        if (data) {
          setFormData((prev) => ({
            ...prev,
            productLogo: data.productLogo || prev.productLogo,
            productName: data.productName || prev.productName,
            productDescription: data.productDescription || prev.productDescription,
            detailedDescription: data.detailedDescription || prev.detailedDescription,
            productCategory: data.productCategory || prev.productCategory,
            productWebsite: data.productWebsite || prev.productWebsite,
            productLinkedIn: data.productLinkedIn || prev.productLinkedIn,
            productTwitter: data.productTwitter || prev.productTwitter,
            companyName: data.companyName || prev.companyName,
            companyId: data.companyId || prev.companyId,
          }));
          setAiModalVisible(false);
          setAiWebsite('');
          setAiFile(null);
          clearInterval(interval);
        } else {
          setAiError('Otomatik doldurma başarısız oldu.');
          clearInterval(interval);
        }
      } else if (aiTab === 'file') {
        if (!aiFile) {
          setAiError('Lütfen bir dosya seçin.');
          setAiTab('file');
          clearInterval(interval);
          return;
        }
        const formDataFile = new FormData();
        formDataFile.append('document', aiFile);
        const response = await fetch('/ai/analyze-document', {
          method: 'POST',
          body: formDataFile,
        });
        const data = await response.json();
        if (data) {
          setFormData((prev) => ({
            ...prev,
            productLogo: data.productLogo || prev.productLogo,
            productName: data.productName || prev.productName,
            productDescription: data.productDescription || prev.productDescription,
            detailedDescription: data.detailedDescription || prev.detailedDescription,
            productCategory: data.productCategory || prev.productCategory,
            productWebsite: data.productWebsite || prev.productWebsite,
            productLinkedIn: data.productLinkedIn || prev.productLinkedIn,
            productTwitter: data.productTwitter || prev.productTwitter,
            companyName: data.companyName || prev.companyName,
            companyId: data.companyId || prev.companyId,
          }));
          setAiModalVisible(false);
          setAiWebsite('');
          setAiFile(null);
          clearInterval(interval);
        } else {
          setAiError('Otomatik doldurma başarısız oldu.');
          clearInterval(interval);
        }
      }
    } catch (error) {
      setAiError('Bir hata oluştu. Lütfen tekrar deneyin.');
      clearInterval(interval);
    } finally {
      setAiTab('select');
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'mixed',
        includeBase64: true,
      });
      if (result.assets && result.assets[0]) {
        setAiFile(result.assets[0]);
        setAiTab('file');
      }
    } catch (err) {
      Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu.');
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
          onSubmitEditing={() => addItem(field as keyof InputValues)}
        />
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={() => addItem(field as keyof InputValues)}
          disabled={!inputValues[field].trim()}>
          <Text style={styles.addTagButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tagList}>
        {items.map((item, index) => (
          <View key={index} style={styles.tagItem}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity
              onPress={() => removeItem(index, field as keyof FormData)}
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
              onPress={() => setAiModalVisible(true)}>
              <Icon name="bulb-outline" size={24} color={Colors.primary} />
              <Text style={styles.aiButtonText}>AI ile Doldur</Text>
            </TouchableOpacity>

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

        <Modal
          visible={aiModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAiModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AI ile Doldur</Text>
                <TouchableOpacity
                  onPress={() => setAiModalVisible(false)}
                  style={styles.modalCloseButton}>
                  <Icon name="close" size={24} color={Colors.lightText} />
                </TouchableOpacity>
              </View>

              {aiTab === 'select' && (
                <View style={styles.modalBody}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => setAiTab('website')}>
                    <Icon name="globe-outline" size={24} color={Colors.primary} />
                    <Text style={styles.modalOptionText}>Websiteden Doldur</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={handlePickFile}>
                    <Icon name="document-outline" size={24} color={Colors.primary} />
                    <Text style={styles.modalOptionText}>Dokümandan Doldur</Text>
                  </TouchableOpacity>
                </View>
              )}

              {aiTab === 'website' && (
                <View style={styles.modalBody}>
                  <View style={styles.urlInputContainer}>
                    <TouchableOpacity
                      style={styles.protocolButton}
                      onPress={() =>
                        setAiProtocol(prev =>
                          prev === 'https://' ? 'http://' : 'https://',
                        )
                      }>
                      <Text style={styles.protocolButtonText}>{aiProtocol}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.urlInput}
                      value={aiWebsite}
                      onChangeText={setAiWebsite}
                      placeholder="example.com"
                      placeholderTextColor={Colors.lightText + '80'}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {aiError && (
                    <Text style={styles.errorText}>{aiError}</Text>
                  )}
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setAiTab('select')}>
                      <Text style={styles.modalButtonText}>Geri</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={handleAIFill}
                      disabled={!aiWebsite.trim()}>
                      <Text style={styles.modalButtonText}>Analiz Et</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {aiTab === 'file' && (
                <View style={styles.modalBody}>
                  {aiFile ? (
                    <View style={styles.fileInfo}>
                      <Icon name="document" size={24} color={Colors.primary} />
                      <Text style={styles.fileName}>{aiFile.name}</Text>
                      <TouchableOpacity
                        onPress={() => setAiFile(null)}
                        style={styles.removeFileButton}>
                        <Icon name="close" size={20} color={Colors.lightText} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.filePickerButton}
                      onPress={handlePickFile}>
                      <Icon name="add-circle-outline" size={24} color={Colors.primary} />
                      <Text style={styles.filePickerText}>Dosya Seç</Text>
                    </TouchableOpacity>
                  )}
                  {aiError && (
                    <Text style={styles.errorText}>{aiError}</Text>
                  )}
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setAiTab('select')}>
                      <Text style={styles.modalButtonText}>Geri</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={handleAIFill}
                      disabled={!aiFile}>
                      <Text style={styles.modalButtonText}>Analiz Et</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {aiTab === 'loading' && (
                <View style={styles.modalBody}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {width: `${aiProgress}%`},
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {getAnalysisMessage(aiProgress, aiMethod)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1E29',
    borderRadius: metrics.borderRadius.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: metrics.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  modalCloseButton: {
    padding: metrics.padding.xs,
  },
  modalBody: {
    padding: metrics.padding.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
  },
  modalOptionText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    marginLeft: metrics.margin.sm,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
  },
  protocolButton: {
    padding: metrics.padding.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  protocolButtonText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
  },
  urlInput: {
    flex: 1,
    padding: metrics.padding.md,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: metrics.margin.sm,
    marginTop: metrics.margin.md,
  },
  modalButton: {
    padding: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
  },
  fileName: {
    flex: 1,
    color: Colors.lightText,
    marginLeft: metrics.margin.sm,
  },
  removeFileButton: {
    padding: metrics.padding.xs,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.padding.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
  },
  filePickerText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
    marginLeft: metrics.margin.sm,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: metrics.margin.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    textAlign: 'center',
  },
});

export default AddProduct; 