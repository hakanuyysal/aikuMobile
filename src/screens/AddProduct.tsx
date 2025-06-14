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
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import {productService} from '../services/api';
import {AxiosError} from 'axios';
import DocumentPicker from 'react-native-document-picker';

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

const AddProduct = ({navigation}: Props) => {
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

  // AI Modal state'leri
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiWebsite, setAiWebsite] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiProtocol, setAiProtocol] = useState<'https://' | 'http://'>('https://');
  const [aiTab, setAiTab] = useState<'select' | 'website' | 'file' | 'loading'>('select');
  const [aiFile, setAiFile] = useState<any>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiMethod, setAiMethod] = useState<'website' | 'file'>('website');

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

  // AI modalı için analiz mesajı fonksiyonu
  const getAnalysisMessage = (progress: number, method: 'website' | 'file') => {
    if (progress < 25) {
      return method === 'website' ? 'Analyzing website...' : 'Reading document...';
    } else if (progress < 50) {
      return method === 'website' ? 'Extracting product information...' : 'Extracting content...';
    } else if (progress < 75) {
      return 'Processing your information...';
    } else if (progress < 90) {
      return 'Almost done...';
    } else {
      return 'Optimizing product details...';
    }
  };

  // AI ile doldurma fonksiyonu
  const handleAIFill = async () => {
    setAiError('');
    setAiLoading(true);
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
          setAiError('Please enter a website URL.');
          setAiLoading(false);
          setAiTab('website');
          clearInterval(interval);
          return;
        }
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
        let url = aiWebsite.trim();
        if (!urlPattern.test(url)) {
          setAiError('Invalid URL format.');
          setAiLoading(false);
          setAiTab('website');
          clearInterval(interval);
          return;
        }
        if (!/^https?:\/\//i.test(url)) {
          url = aiProtocol + url;
        }
        url = url.replace(/^(https?:\/\/)+(https?:\/\/)/i, '$1');
        // API endpoint: /ai/analyze-website (ürün için de aynı endpoint kullanılacak)
        const response = await productService.axios.post('/ai/analyze-website', { url });
        if (response.data) {
          setFormData((prev) => ({
            ...prev,
            productLogo: response.data.productLogo || prev.productLogo,
            productName: response.data.productName || prev.productName,
            productDescription: response.data.productDescription || prev.productDescription,
            detailedDescription: response.data.detailedDescription || prev.detailedDescription,
            productCategory: response.data.productCategory || prev.productCategory,
            productWebsite: response.data.productWebsite || prev.productWebsite,
            productLinkedIn: response.data.productLinkedIn || prev.productLinkedIn,
            productTwitter: response.data.productTwitter || prev.productTwitter,
            companyName: response.data.companyName || prev.companyName,
            companyId: response.data.companyId || prev.companyId,
          }));
          setAiModalVisible(false);
          setAiWebsite('');
          setAiFile(null);
          clearInterval(interval);
        } else {
          setAiError('Auto-fill failed.');
          clearInterval(interval);
        }
      } else if (aiTab === 'file') {
        if (!aiFile) {
          setAiError('Please select a file.');
          setAiLoading(false);
          clearInterval(interval);
          return;
        }
        const formDataFile = new FormData();
        formDataFile.append('document', {
          uri: aiFile.uri,
          type: aiFile.type,
          name: aiFile.name,
        });
        // API endpoint: /ai/analyze-document
        const response = await productService.axios.post('/ai/analyze-document', formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data) {
          setFormData((prev) => ({
            ...prev,
            productLogo: response.data.productLogo || prev.productLogo,
            productName: response.data.productName || prev.productName,
            productDescription: response.data.productDescription || prev.productDescription,
            detailedDescription: response.data.detailedDescription || prev.detailedDescription,
            productCategory: response.data.productCategory || prev.productCategory,
            productWebsite: response.data.productWebsite || prev.productWebsite,
            productLinkedIn: response.data.productLinkedIn || prev.productLinkedIn,
            productTwitter: response.data.productTwitter || prev.productTwitter,
            companyName: response.data.companyName || prev.companyName,
            companyId: response.data.companyId || prev.companyId,
          }));
          setAiModalVisible(false);
          setAiWebsite('');
          setAiFile(null);
          clearInterval(interval);
        } else {
          setAiError('Auto-fill failed.');
          clearInterval(interval);
        }
      }
    } catch (err) {
      setAiError('Could not connect to AI service.');
      clearInterval(interval);
    } finally {
      setAiLoading(false);
      setTimeout(() => {
        setAiProgress(0);
        setAiTab('select');
      }, 500);
    }
  };

  // Dosya seçme fonksiyonu
  const handlePickFile = async () => {
    setAiError('');
    try {
      const res = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
      });
      setAiFile(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        setAiError('File selection failed.');
      }
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
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: 'transparent',
              minWidth: 140,
            }}
            onPress={() => setAiModalVisible(true)}
          >
            <Icon
              name="bulb-outline"
              size={22}
              color={Colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              Auto-fill AI
            </Text>
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
            )}

            {renderInputField(
              'Company Name',
              formData.companyName,
              (text) => setFormData({...formData, companyName: text.trim()}),
              'Select your company',
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
                onChangeText={(text) => setFormData({...formData, tags: text.split(',').map(tag => tag.trim())})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Problems</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter problems (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.problems.join(', ')}
                onChangeText={(text) => setFormData({...formData, problems: text.split(',').map(problem => problem.trim())})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Solutions</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter solutions (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.solutions.join(', ')}
                onChangeText={(text) => setFormData({...formData, solutions: text.split(',').map(solution => solution.trim())})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Improvements</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter improvements (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.improvements.join(', ')}
                onChangeText={(text) => setFormData({...formData, improvements: text.split(',').map(improvement => improvement.trim())})}
              />
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Key Features</Text>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="Enter key features (comma-separated)"
                placeholderTextColor={Colors.lightText + '80'}
                value={formData.keyFeatures.join(', ')}
                onChangeText={(text) => setFormData({...formData, keyFeatures: text.split(',').map(feature => feature.trim())})}
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
      {/* AI Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={aiModalVisible}
        onRequestClose={() => setAiModalVisible(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: '#23283A',
              borderRadius: 32,
              padding: 28,
              width: 350,
              alignItems: 'center',
              position: 'relative',
              borderWidth: 1.5,
              borderColor: Colors.primary,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 12,
            }}>
            {/* Sağ üst köşe çarpı */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}
              onPress={() => setAiModalVisible(false)}>
              <Icon name="close" size={26} color={Colors.lightText} />
            </TouchableOpacity>
            {aiTab === 'loading' ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 180 }}>
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 18 }} />
                <Text style={{ color: Colors.lightText, fontSize: 17, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
                  {getAnalysisMessage(aiProgress, aiMethod)}
                </Text>
                <View style={{ width: '80%', height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
                  <View style={{ width: `${aiProgress}%`, height: 8, backgroundColor: Colors.primary, borderRadius: 4 }} />
                </View>
              </View>
            ) : aiTab === 'select' && (
              <>
                <Text
                  style={{
                    color: Colors.lightText,
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginBottom: 28,
                    textAlign: 'center',
                  }}>
                  Auto-fill with AI
                </Text>
                <View style={{ width: '100%', flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      borderWidth: 2,
                      borderColor: Colors.primary,
                      borderRadius: 16,
                      paddingVertical: 18,
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                    onPress={() => setAiTab('website')}>
                    <MaterialIcons name="language" size={32} color={Colors.primary} style={{ marginBottom: 6 }} />
                    <Text
                      style={{
                        color: Colors.primary,
                        fontWeight: '700',
                        fontSize: 18,
                      }}>
                      From Website
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      borderWidth: 2,
                      borderColor: Colors.primary,
                      borderRadius: 16,
                      paddingVertical: 18,
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginLeft: 8,
                    }}
                    onPress={() => setAiTab('file')}>
                    <Icon name="document-outline" size={32} color={Colors.primary} style={{ marginBottom: 6 }} />
                    <Text
                      style={{
                        color: Colors.primary,
                        fontWeight: '700',
                        fontSize: 18,
                      }}>
                      From File
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {aiTab !== 'select' && aiTab !== 'loading' && (
              <>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => setAiTab('select')}
                    style={{width: 40, alignItems: 'flex-start'}}>
                    <Icon
                      name="chevron-back"
                      size={28}
                      color={Colors.lightText}
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      color: Colors.lightText,
                      fontWeight: 'bold',
                      fontSize: 20,
                      flex: 1,
                      textAlign: 'center',
                    }}>
                    Auto-fill with AI
                  </Text>
                  <View style={{width: 40}} />
                </View>
                {aiTab === 'website' && (
                  <View style={{width: '100%', alignItems: 'center'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginBottom: 10,
                        width: '100%',
                      }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor:
                            aiProtocol === 'https://'
                              ? Colors.primary
                              : 'rgba(255,255,255,0.10)',
                          borderRadius: 8,
                          paddingHorizontal: 18,
                          paddingVertical: 7,
                          marginRight: 8,
                        }}
                        onPress={() => setAiProtocol('https://')}>
                        <Text
                          style={{
                            color:
                              aiProtocol === 'https://'
                                ? Colors.lightText
                                : Colors.lightText,
                            fontWeight: '500',
                          }}>
                          https://
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor:
                            aiProtocol === 'http://'
                              ? Colors.primary
                              : 'rgba(255,255,255,0.10)',
                          borderRadius: 8,
                          paddingHorizontal: 18,
                          paddingVertical: 7,
                        }}
                        onPress={() => setAiProtocol('http://')}>
                        <Text
                          style={{
                            color:
                              aiProtocol === 'http://'
                                ? Colors.lightText
                                : Colors.lightText,
                            fontWeight: '500',
                          }}>
                          http://
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          marginBottom: 10,
                          width: '100%',
                          textAlign: 'center',
                        },
                      ]}
                      placeholder="example.com"
                      placeholderTextColor={Colors.lightText}
                      value={aiWebsite}
                      onChangeText={text => {
                        let clean = text.replace(
                          /^https?:\/\//i,
                          '',
                        );
                        setAiWebsite(clean);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}
                {aiTab === 'file' && (
                  <View style={{width: '100%', alignItems: 'center'}}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: Colors.primary,
                        borderRadius: 10,
                        padding: 14,
                        marginBottom: 10,
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onPress={handlePickFile}
                      disabled={aiLoading}>
                      <Text
                        style={{
                          color: Colors.lightText,
                          fontWeight: '600',
                        }}>
                        {aiFile ? 'Change File' : 'Select File'}
                      </Text>
                    </TouchableOpacity>
                    {aiFile && (
                      <Text
                        style={{
                          color: Colors.lightText,
                          marginBottom: 10,
                          textAlign: 'center',
                          fontSize: 15,
                        }}>
                        {aiFile.name}
                      </Text>
                    )}
                  </View>
                )}
                {aiError ? (
                  <Text
                    style={{
                      color: 'red',
                      marginBottom: 10,
                      textAlign: 'center',
                    }}>
                    {aiError}
                  </Text>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 10,
                    width: '100%',
                  }}>
                  <TouchableOpacity
                    style={{
                      marginRight: 16,
                      paddingVertical: 10,
                      paddingHorizontal: 22,
                      borderRadius: 8,
                      backgroundColor: 'rgba(255,255,255,0.10)',
                    }}
                    onPress={() => setAiModalVisible(false)}
                    disabled={aiLoading}>
                    <Text
                      style={{
                        color: Colors.lightText,
                        fontWeight: '600',
                        fontSize: 16,
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: Colors.primary,
                      borderRadius: 8,
                      paddingHorizontal: 28,
                      paddingVertical: 10,
                    }}
                    onPress={handleAIFill}
                    disabled={aiLoading}>
                    <Text
                      style={{
                        color: Colors.lightText,
                        fontWeight: '600',
                        fontSize: 16,
                      }}>
                      Analyze
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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