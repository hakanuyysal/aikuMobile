import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  View,
  Modal,
  TextInput,
  FlatList,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import countryCodes from '../services/countryCodes.json';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyDetails'>;

const sectors = [
  'AI & Machine Learning',
  'Agriculture',
  'Aerospace & Defense',
  'Automotive',
  'Biotechnology & Pharmaceuticals',
  'Blockchain & Cryptocurrency',
  'Construction',
  'Consulting',
  'Cybersecurity',
  'Data Analytics',
  'E-commerce',
  'Education',
  'Energy',
  'Entertainment & Media',
  'Environmental Services',
  'Fashion & Apparel',
  'Finance',
  'Fintech',
  'Food & Beverage',
  'Government & Public Services',
  'Healthcare',
  'Human Resources & Talent Management',
  'Hospitality & Tourism',
  'Legal Services',
  'Manufacturing',
  'Marketing & Advertising',
  'Non-Profit & NGOs',
  'Real Estate',
  'Retail',
  'Robotics & Automation',
  'Software Development',
  'Sports & Recreation',
  'Technology',
  'Telecommunications',
  'Transportation & Logistics',
];

interface Company {
  _id: string;
  companyName: string;
  companyLogo?: string;
  companyType?: string;
  openForInvestments?: boolean;
  incorporated?: string;
  companySector?: string;
  companySize?: string;
  businessModel?: string;
  businessScale?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyInfo?: string;
  detailedInfo?: string;
  companyAddress?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
  companyInstagram?: string;
  companyTwitter?: string;
  acceptMessages?: boolean;
  teamMembers?: string;
}

const CompanyDetails = ({ navigation }: Props) => {
  const { user } = useAuth(); // Get user from auth context
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: null as string | null,
    companyType: 'Startup',
    openForInvestments: false,
    incorporated: 'No',
    companySector: [] as string[],
    companySize: '',
    businessModel: '',
    businessScale: '',
    companyEmail: '',
    companyPhone: '',
    companyPhoneCountryCode: '+90',
    summarizedInfo: '',
    detailedInfo: '',
    companyAddress: '',
    companyWebsite: '',
    companyLinkedIn: '',
    companyInstagram: '',
    companyTwitter: '',
    acceptMessages: false,
    teamMembers: [] as string[],
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [visibleSteps, setVisibleSteps] = useState(5);
  const [sectorPickerVisible, setSectorPickerVisible] = useState(false);

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiWebsite, setAiWebsite] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiProtocol, setAiProtocol] = useState<'https://' | 'http://'>('https://');
  const [aiTab, setAiTab] = useState<'select' | 'website' | 'file' | 'loading'>('select');
  const [aiFile, setAiFile] = useState<DocumentPickerResponse | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiMethod, setAiMethod] = useState<'website' | 'file'>('website');

  // Axios instance for API calls
  const api = axios.create({
    baseURL: 'https://api.aikuaiplatform.com/api', // Adjust port if backend runs on a different port
    headers: { 'Content-Type': 'application/json' },
  });

  // Add token to requests
  api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log('API Token:', token); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const formSteps = [
    { label: 'Company Name', placeholder: 'Enter your company name', key: 'companyName', type: 'text' },
    { label: 'Company Logo', placeholder: 'Dosya seçilmedi', key: 'companyLogo', type: 'file' },
    { label: 'Company Type', key: 'companyType', type: 'picker', options: ['Startup'] },
    { label: 'Open for Investments', key: 'openForInvestments', type: 'boolean' },
    { label: 'Has the company been incorporated?', key: 'incorporated', type: 'picker', options: ['Yes', 'No'] },
    { label: 'Company Sector', key: 'companySector', type: 'multi-select', options: sectors },
    { label: 'Company Size', key: 'companySize', type: 'picker', options: ['1-10', '11-50', '51-200', '201+'] },
    { label: 'Business Model', key: 'businessModel', type: 'picker', options: ['B2B', 'B2C', 'C2C', 'Other'] },
    { label: 'Business Scale', key: 'businessScale', type: 'picker', options: ['Micro', 'Small', 'Medium', 'Large'] },
    { label: 'Company Email', key: 'companyEmail', type: 'text', placeholder: 'Enter your company email' },
    { label: 'Company Phone Number', key: 'companyPhone', type: 'phone', placeholder: 'Enter your phone number' },
    { label: 'Summarized Company Information', key: 'summarizedInfo', type: 'text', placeholder: 'Enter your summarized company information', maxLength: 500 },
    { label: 'Detailed Company Information', key: 'detailedInfo', type: 'text', placeholder: 'Enter your detailed company information', maxLength: 3000 },
    { label: 'Company Address', key: 'companyAddress', type: 'text', placeholder: 'Enter your company address' },
    { label: 'Company Website', key: 'companyWebsite', type: 'text', placeholder: 'Enter your company website' },
    { label: 'Company LinkedIn', key: 'companyLinkedIn', type: 'text', placeholder: 'Enter your company LinkedIn' },
    { label: 'Company Instagram', key: 'companyInstagram', type: 'text', placeholder: 'Enter your company Instagram' },
    { label: 'Company X (Twitter)', key: 'companyTwitter', type: 'text', placeholder: 'Enter your company Twitter' },
    { label: 'Accept messages from other companies', key: 'acceptMessages', type: 'boolean' },
    { label: 'Team Members', key: 'teamMembers', type: 'text', placeholder: 'Add Team Member' },
  ];

  useEffect(() => {
    console.log('Auth user:', user); // Debug log
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      // Kullanıcı ID'sini al
      const userId = user?._id || user?.id;
      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı ID\'si bulunamadı, lütfen tekrar giriş yapın.');
        setCompanies([]);
        setLoading(false);
        return;
      }

      // Query parametresi ile istek at
      const response = await api.get(`/company/current?userId=${userId}`);
      const companies = (response.data.companies || []).map((company: any) => ({
        ...company,
        _id: company._id || company.id,
      }));
      setCompanies(companies);
    } catch (error: any) {
      let errorMsg = 'Şirketler alınamadı. Ağ bağlantınızı veya giriş durumunuzu kontrol edin.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = 'Yetkisiz. Lütfen tekrar giriş yapın.';
        } else if (error.response.status === 404) {
          errorMsg = 'Endpoint /company/current bulunamadı. Backend çalışıyor mu ve route doğru mu?';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      console.error('Error fetching companies:', error.response ? error.response.data : error.message);
      Alert.alert('Hata', errorMsg);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (stepIndex?: number) => {
    const mandatoryFields = [
      'companyName',
      'companyType',
      'companySize',
      'businessModel',
      'businessScale',
      'summarizedInfo',
      'detailedInfo',
      'companyAddress',
      'companyWebsite',
      'companySector',
      'companyPhone',
      'companyEmail',
    ];

    // If validating a specific step, check only the field for that step
    if (stepIndex !== undefined) {
      const stepField = mandatoryFields.find(field => formSteps[stepIndex].key === field.key);
      if (stepField) {
        const value = formData[stepField.key];
        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
          return { isValid: false, message: `${stepField.label} is required.` };
        }
      }
      return { isValid: true };
    }

    // Full form validation
    for (const field of mandatoryFields) {
      const value = formData[field];
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, message: `${field} is required.` };
      }
    }
    if (formData.companyEmail && !/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      return { isValid: false, message: 'Please enter a valid email address.' };
    }
    return { isValid: true };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyName: formData.companyName,
        companyType: formData.companyType,
        businessModel: formData.businessModel,
        companySector: formData.companySector.join(', '),
        companySize: formData.companySize,
        companyInfo: formData.summarizedInfo,
        companyWebsite: formData.companyWebsite,
        companyEmail: formData.companyEmail || '',
        companyPhone: (formData.companyPhoneCountryCode || '') + (formData.companyPhone || ''),
        companyAddress: formData.companyAddress,
        companyLinkedIn: formData.companyLinkedIn || '',
        companyTwitter: formData.companyTwitter || '',
        openForInvestments: formData.openForInvestments,
        incorporated: formData.incorporated,
        businessScale: formData.businessScale,
        detailedDescription: formData.detailedInfo, // Changed to match backend field name
        companyInstagram: formData.companyInstagram || '',
        acceptMessages: formData.acceptMessages,
        teamMembers: formData.teamMembers.length > 0 ? formData.teamMembers.join(', ') : '',
      };

      let response;
      if (editingCompanyId) {
        response = await api.put(`/company/${editingCompanyId}`, payload);
        Alert.alert('Success', 'Company updated successfully.');
      } else {
        response = await api.post('/company', payload);
        Alert.alert('Success', 'Company created successfully.');
      }

      await fetchCompanies();
      setModalVisible(false);
      setCurrentStep(0);
      setEditingCompanyId(null);
      setFormData({
        companyName: '',
        companyLogo: null,
        companyType: 'Startup',
        openForInvestments: false,
        incorporated: 'No',
        companySector: [],
        companySize: '',
        businessModel: '',
        businessScale: '',
        companyEmail: '',
        companyPhone: '',
        companyPhoneCountryCode: '+90',
        summarizedInfo: '',
        detailedInfo: '',
        companyAddress: '',
        companyWebsite: '',
        companyLinkedIn: '',
        companyInstagram: '',
        companyTwitter: '',
        acceptMessages: false,
        teamMembers: [],
      });
    } catch (error) {
      console.error('Error submitting company:', error.response ? error.response.data : error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save company.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompanyId(company._id);
    setFormData({
      companyName: company.companyName || '',
      companyLogo: null,
      companyType: company.companyType || 'Startup',
      openForInvestments: company.openForInvestments || false,
      incorporated: company.incorporated || 'No',
      companySector: company.companySector ? company.companySector.split(', ') : [],
      companySize: company.companySize || '',
      businessModel: company.businessModel || '',
      businessScale: company.businessScale || '',
      companyEmail: company.companyEmail || '',
      companyPhone: company.companyPhone ? company.companyPhone.replace(/^[+\d-]+/, '') : '',
      companyPhoneCountryCode: company.companyPhone ? company.companyPhone.match(/^[+\d-]+/)?.[0] || '+90' : '+90',
      summarizedInfo: company.companyInfo || '',
      detailedInfo: company.detailedInfo || '',
      companyAddress: company.companyAddress || '',
      companyWebsite: company.companyWebsite || '',
      companyLinkedIn: company.companyLinkedIn || '',
      companyInstagram: company.companyInstagram || '',
      companyTwitter: company.companyTwitter || '',
      acceptMessages: company.acceptMessages || false,
      teamMembers: company.teamMembers ? company.teamMembers.split(', ') : [],
    });
    setModalVisible(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this company?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete(`/company/${companyId}`);
              await fetchCompanies();
              Alert.alert('Success', 'Company deleted successfully.');
            } catch (error) {
              console.error('Error deleting company:', error.response ? error.response.data : error.message);
              Alert.alert('Error', 'Failed to delete company.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleNext = () => {
    const validation = validateForm(currentStep);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handlePickLogo = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets && result.assets.length > 0) {
      setFormData({ ...formData, companyLogo: result.assets[0].uri });
    }
  };

  const renderStep = () => {
    const startIndex = Math.floor(currentStep / 5) * 5;
    const visibleFormSteps = formSteps.slice(startIndex, startIndex + 5);
    const mandatoryFields = [
      'companyName',
      'companyType',
      'companySize',
      'businessModel',
      'businessScale',
      'summarizedInfo',
      'detailedInfo',
      'companyAddress',
      'companyWebsite',
      'companySector',
      'companyPhone',
      'companyEmail',
    ];

    return (
      <ScrollView style={styles.formScrollView}>
        <View>
          {visibleFormSteps.map((step, index) => {
            const actualIndex = startIndex + index;
            const isActive = actualIndex === currentStep;
            const isMandatory = mandatoryFields.includes(step.key);

            return (
              <View key={step.key} style={[styles.stepContainer, isActive && styles.activeStep]}>
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {step.label} {isMandatory && <Text style={{ color: 'red' }}>*</Text>}
                </Text>
                {renderStepContent(step, isActive)}
              </View>
            );
          })}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  const renderStepContent = (step: any, isActive: boolean) => {
    if (!isActive) return null;

    switch (step.type) {
      case 'text':
        return (
          <TextInput
            style={styles.input}
            placeholder={step.placeholder}
            placeholderTextColor={Colors.lightText}
            value={formData[step.key]}
            onChangeText={text => handleInputChange(step.key, text)}
            maxLength={step.maxLength}
            multiline={step.maxLength > 500}
          />
        );
      case 'picker':
        return (
          <Picker
            selectedValue={formData[step.key]}
            style={styles.picker}
            onValueChange={value => handleInputChange(step.key, value)}>
            <Picker.Item label={`Select ${step.label}`} value="" />
            {step.options.map((option: string) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        );
      case 'boolean':
        return (
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleInputChange(step.key, !formData[step.key])}>
            <MaterialIcons
              name={formData[step.key] ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.checkboxText}>{formData[step.key] ? 'Yes' : 'No'}</Text>
          </TouchableOpacity>
        );
      case 'multi-select':
        return (
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setSectorPickerVisible(true)}>
            <Text style={styles.pickerButtonText}>
              {formData.companySector.length > 0
                ? formData.companySector.join(', ')
                : 'Select Sectors'}
            </Text>
          </TouchableOpacity>
        );
      case 'file':
        return (
          <TouchableOpacity style={styles.fileButton} onPress={handlePickLogo}>
            <Text style={styles.fileButtonText}>
              {formData[step.key] ? 'File Selected' : step.placeholder}
            </Text>
          </TouchableOpacity>
        );
      case 'phone':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1.2, marginRight: 8 }}>
              <Picker
                selectedValue={formData.companyPhoneCountryCode}
                style={styles.picker}
                onValueChange={value => handleInputChange('companyPhoneCountryCode', value)}>
                {countryCodes.map((item: any) => (
                  <Picker.Item key={item.code} label={`${item.name} (${item.code})`} value={item.code} />
                ))}
              </Picker>
            </View>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder={step.placeholder}
              placeholderTextColor={Colors.lightText}
              value={formData.companyPhone}
              keyboardType="phone-pad"
              onChangeText={text => handleInputChange('companyPhone', text)}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const getAnalysisMessage = (progress: number, method: 'website' | 'file') => {
    if (progress < 25) return method === 'website' ? 'Analyzing website...' : 'Reading document...';
    else if (progress < 50) return method === 'website' ? 'Extracting product information...' : 'Extracting content...';
    else if (progress < 75) return 'Processing your information...';
    else if (progress < 90) return 'Almost done...';
    else return 'Optimizing company details...';
  };

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
        if (!/^https?:\/\//i.test(url)) url = aiProtocol + url;
        url = url.replace(/^(https?:\/\/)+(https?:\/\/)/i, '$1');
        const response = await api.post('/ai/analyze-website', { url });
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            companyLogo: response.data.companyLogo || prev.companyLogo,
            companyName: response.data.companyName || prev.companyName,
            summarizedInfo: response.data.summarizedInfo || prev.summarizedInfo,
            detailedInfo: response.data.detailedDescription || response.data.detailedInfo || prev.detailedInfo,
            companySector: Array.isArray(response.data.companySector)
              ? response.data.companySector
              : typeof response.data.companySector === 'string'
                ? response.data.companySector.split(',').map((s: string) => s.trim())
                : prev.companySector,
            companySize: response.data.companySize || prev.companySize,
            businessModel: response.data.businessModel || prev.businessModel,
            businessScale: response.data.businessScale || prev.businessScale,
            companyEmail: response.data.companyEmail || prev.companyEmail,
            companyPhone: response.data.companyPhone || prev.companyPhone,
            companyAddress: response.data.companyAddress || prev.companyAddress,
            companyWebsite: response.data.companyWebsite || prev.companyWebsite,
            companyLinkedIn: response.data.companyLinkedIn || prev.companyLinkedIn,
            companyInstagram: response.data.companyInstagram || prev.companyInstagram,
            companyTwitter: response.data.companyTwitter || prev.companyTwitter,
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
        const formData = new FormData();
        formData.append('document', {
          uri: aiFile.uri,
          type: aiFile.type,
          name: aiFile.name,
        } as any);
        const response = await api.post('/ai/analyze-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            companyLogo: response.data.companyLogo || prev.companyLogo,
            companyName: response.data.companyName || prev.companyName,
            summarizedInfo: response.data.summarizedInfo || prev.summarizedInfo,
            detailedInfo: response.data.detailedDescription || response.data.detailedInfo || prev.detailedInfo,
            companySector: Array.isArray(response.data.companySector)
              ? response.data.companySector
              : typeof response.data.companySector === 'string'
                ? response.data.companySector.split(',').map((s: string) => s.trim())
                : prev.companySector,
            companySize: response.data.companySize || prev.companySize,
            businessModel: response.data.businessModel || prev.businessModel,
            businessScale: response.data.businessScale || prev.businessScale,
            companyEmail: response.data.companyEmail || prev.companyEmail,
            companyPhone: response.data.companyPhone || prev.companyPhone,
            companyAddress: response.data.companyAddress || prev.companyAddress,
            companyWebsite: response.data.companyWebsite || prev.companyWebsite,
            companyLinkedIn: response.data.companyLinkedIn || prev.companyLinkedIn,
            companyInstagram: response.data.companyInstagram || prev.companyInstagram,
            companyTwitter: response.data.companyTwitter || prev.companyTwitter,
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
      console.error('AI fill error:', err);
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

  const handlePickFile = async () => {
    setAiError('');
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });
      setAiFile(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        setAiError('File selection failed.');
      }
    }
  };

  const isStepValid = (stepIndex: number) => {
    // Sadece o adımın zorunlu olup olmadığına bakılır
    const mandatoryFields = [
      'companyName',
      'companyType',
      'companySize',
      'businessModel',
      'businessScale',
      'summarizedInfo',
      'detailedInfo',
      'companyAddress',
      'companyWebsite',
      'companySector',
      'companyPhone',
      'companyEmail',
    ];
    const currentStepKey = formSteps[stepIndex].key;
    if (mandatoryFields.includes(currentStepKey)) {
      const value = formData[currentStepKey];
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        return false;
      }
    }
    return true;
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Details</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <MaterialIcons name="add-business" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <>
              {companies.map(company => (
                <View key={company._id} style={styles.companyCard}>
                  <Image
                    source={{ uri: company.companyLogo || 'https://turkaumining.vercel.app/static/media/turkau-logo.904055d9d6e7dd0213c5.png' }}
                    style={styles.companyLogo}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>{company.companyName}</Text>
                    <View style={styles.companyActions}>
                      <TouchableOpacity onPress={() => handleEditCompany(company)}>
                        <MaterialIcons name="edit" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteCompany(company._id)} style={{ marginLeft: 10 }}>
                        <MaterialIcons name="delete" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.addCompanyCard} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add-business" size={24} color={Colors.primary} />
                <Text style={styles.addCompanyText}>Add New Company</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => { setModalVisible(false); setEditingCompanyId(null); }}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalWrapper}>
              <LinearGradient
                colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
                locations={[0, 0.3, 0.6, 0.9]}
                start={{ x: 0, y: 0 }}
                end={{ x: 2, y: 1 }}
                style={styles.modalContainer}>
                <SafeAreaView style={styles.modalSafeArea}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{editingCompanyId ? 'Edit Company' : 'Add Company'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                          marginRight: 8,
                          backgroundColor: 'transparent',
                          minWidth: 110,
                        }}
                        onPress={() => setAiModalVisible(true)}>
                        <Ionicons name="bulb-outline" size={22} color={Colors.primary} style={{ marginRight: 8 }} />
                        <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                          Auto-fill AI
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setModalVisible(false); setEditingCompanyId(null); }} style={styles.closeButton}>
                        <Icon name="close" size={24} color={Colors.lightText} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Modal
                    animationType="fade"
                    transparent={true}
                    visible={aiModalVisible}
                    onRequestClose={() => setAiModalVisible(false)}>
                    <View style={styles.modalBackdrop}>
                      <View style={[styles.modalWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={{
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
                          <TouchableOpacity
                            style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}
                            onPress={() => setAiModalVisible(false)}>
                            <Ionicons name="close" size={26} color={Colors.lightText} />
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
                          ) : aiTab === 'select' ? (
                            <>
                              <Text style={{ color: Colors.lightText, fontWeight: 'bold', fontSize: 20, marginBottom: 28, textAlign: 'center' }}>
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
                                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 18 }}>From Web</Text>
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
                                  <MaterialIcons name="insert-drive-file" size={32} color={Colors.primary} style={{ marginBottom: 6 }} />
                                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 18 }}>From File</Text>
                                </TouchableOpacity>
                              </View>
                            </>
                          ) : (
                            <>
                              <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => setAiTab('select')} style={{ width: 40, alignItems: 'flex-start' }}>
                                  <Ionicons name="chevron-back" size={28} color={Colors.lightText} />
                                </TouchableOpacity>
                                <Text style={{ color: Colors.lightText, fontWeight: 'bold', fontSize: 20, flex: 1, textAlign: 'center' }}>
                                  Auto-fill with AI
                                </Text>
                                <View style={{ width: 40 }} />
                              </View>
                              {aiTab === 'website' && (
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, width: '100%' }}>
                                    <TouchableOpacity
                                      style={{
                                        backgroundColor: aiProtocol === 'https://' ? Colors.primary : 'rgba(255,255,255,0.10)',
                                        borderRadius: 8,
                                        paddingHorizontal: 18,
                                        paddingVertical: 7,
                                        marginRight: 8,
                                      }}
                                      onPress={() => setAiProtocol('https://')}>
                                      <Text style={{ color: aiProtocol === 'https://' ? Colors.lightText : Colors.lightText, fontWeight: '500' }}>
                                        https://
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={{
                                        backgroundColor: aiProtocol === 'http://' ? Colors.primary : 'rgba(255,255,255,0.10)',
                                        borderRadius: 8,
                                        paddingHorizontal: 18,
                                        paddingVertical: 7,
                                      }}
                                      onPress={() => setAiProtocol('http://')}>
                                      <Text style={{ color: aiProtocol === 'http://' ? Colors.lightText : Colors.lightText, fontWeight: '500' }}>
                                        http://
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                  <TextInput
                                    style={[styles.input, { marginBottom: 10, width: '100%', textAlign: 'center' }]}
                                    placeholder="example.com"
                                    placeholderTextColor={Colors.lightText}
                                    value={aiWebsite}
                                    onChangeText={text => {
                                      let clean = text.replace(/^https?:\/\//i, '');
                                      setAiWebsite(clean);
                                    }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                  />
                                </View>
                              )}
                              {aiTab === 'file' && (
                                <View style={{ width: '100%', alignItems: 'center' }}>
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
                                    <Text style={{ color: Colors.lightText, fontWeight: '600' }}>
                                      {aiFile ? 'Change File' : 'Select File'}
                                    </Text>
                                  </TouchableOpacity>
                                  {aiFile && (
                                    <Text style={{ color: Colors.lightText, marginBottom: 10, textAlign: 'center', fontSize: 15 }}>
                                      {aiFile.name}
                                    </Text>
                                  )}
                                </View>
                              )}
                              {aiError ? (
                                <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{aiError}</Text>
                              ) : null}
                              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, width: '100%' }}>
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
                                  <Text style={{ color: Colors.lightText, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
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
                                  <Text style={{ color: Colors.lightText, fontWeight: '600', fontSize: 16 }}>Analyze</Text>
                                </TouchableOpacity>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </Modal>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={sectorPickerVisible}
                    onRequestClose={() => setSectorPickerVisible(false)}>
                    <View style={styles.modalBackdrop}>
                      <View style={styles.sectorPickerModal}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>Select Company Sectors</Text>
                          <TouchableOpacity onPress={() => setSectorPickerVisible(false)}>
                            <Icon name="close" size={24} color={Colors.lightText} />
                          </TouchableOpacity>
                        </View>
                        <FlatList
                          data={sectors}
                          keyExtractor={item => item}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.checkbox}
                              onPress={() => {
                                const updatedSectors = formData.companySector.includes(item)
                                  ? formData.companySector.filter(sector => sector !== item)
                                  : [...formData.companySector, item];
                                handleInputChange('companySector', updatedSectors);
                              }}>
                              <MaterialIcons
                                name={formData.companySector.includes(item) ? 'check-box' : 'check-box-outline-blank'}
                                size={24}
                                color={Colors.primary}
                              />
                              <Text style={styles.checkboxText}>{item}</Text>
                            </TouchableOpacity>
                          )}
                        />
                        <TouchableOpacity
                          style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 8 }}
                          onPress={() => setSectorPickerVisible(false)}>
                          <MaterialIcons name="check" size={40} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                  <Animated.View style={[styles.modalContent]}>
                    <View style={styles.progressContainer}>
                      {Array(Math.ceil(formSteps.length / 5)).fill(0).map((_, idx) => (
                        <View
                          key={idx}
                          style={[styles.progressDot, Math.floor(currentStep / 5) === idx && styles.activeProgressDot]}
                        />
                      ))}
                    </View>
                    {renderStep()}
                  </Animated.View>
                  <View style={styles.navigationButtons}>
                    {currentStep > 0 && (
                      <TouchableOpacity style={styles.navButton} onPress={handleBack} disabled={loading}>
                        <Text style={styles.navButtonText}>Back</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.navButton, { opacity: isStepValid(currentStep) && !loading ? 1 : 0.5 }]}
                      onPress={handleNext}
                      disabled={!isStepValid(currentStep) || loading}
                    >
                      <Text style={styles.navButtonText}>
                        {loading ? 'Submitting...' : currentStep === formSteps.length - 1 ? (editingCompanyId ? 'Update' : 'Submit') : 'Next'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </SafeAreaView>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: metrics.padding.md, alignItems: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: metrics.margin.lg, top: metrics.margin.lg, zIndex: 1 },
  headerTitle: { fontSize: metrics.fontSize.xl * 1.1, fontWeight: 'bold', marginBottom: metrics.margin.lg, color: Colors.lightText },
  content: { flex: 1, padding: metrics.padding.lg },
  companyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  companyLogo: { width: 50, height: 50, marginRight: metrics.margin.md },
  companyName: { fontSize: metrics.fontSize.lg, color: Colors.lightText, fontWeight: '500' },
  companyActions: { flexDirection: 'row', marginTop: 5 },
  addCompanyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addCompanyText: { fontSize: metrics.fontSize.lg, color: Colors.lightText, fontWeight: '500', marginLeft: metrics.margin.md },
  addButton: { position: 'absolute', right: metrics.margin.lg, top: metrics.margin.lg, zIndex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalWrapper: { flex: 1, width: '100%', height: '100%' },
  modalContainer: { flex: 1, width: '100%', height: '100%' },
  modalSafeArea: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: metrics.padding.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { fontSize: metrics.fontSize.xl, fontWeight: 'bold', color: Colors.lightText },
  closeButton: { padding: metrics.padding.sm },
  modalContent: { flex: 1, padding: metrics.padding.md },
  label: { fontSize: metrics.fontSize.lg, color: Colors.lightText, marginBottom: metrics.margin.sm },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    color: Colors.lightText,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: metrics.margin.md,
    minHeight: 40,
    maxHeight: 100,
  },
  picker: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: metrics.borderRadius.md, color: Colors.lightText, marginBottom: metrics.margin.md },
  checkbox: { flexDirection: 'row', alignItems: 'center', marginBottom: metrics.margin.sm },
  checkboxText: { fontSize: metrics.fontSize.md, color: Colors.lightText, marginLeft: metrics.margin.sm },
  fileButton: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: metrics.borderRadius.md, padding: metrics.padding.md, alignItems: 'center', marginBottom: metrics.margin.md },
  fileButtonText: { color: Colors.lightText, fontSize: metrics.fontSize.md },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: metrics.padding.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1A1E29',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: { backgroundColor: Colors.primary, borderRadius: metrics.borderRadius.md, padding: metrics.padding.md, flex: 1, alignItems: 'center', marginHorizontal: metrics.margin.sm },
  navButtonText: { color: Colors.lightText, fontSize: metrics.fontSize.md, fontWeight: '500' },
  stepContainer: { marginBottom: metrics.margin.md, padding: metrics.padding.md, borderRadius: metrics.borderRadius.md, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeStep: { backgroundColor: 'rgba(59, 130, 247, 0.1)', borderColor: Colors.primary },
  activeLabel: { color: Colors.primary, fontWeight: 'bold' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: metrics.margin.md },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  activeProgressDot: { backgroundColor: Colors.primary },
  bottomPadding: { height: 20 },
  multiSelectContainer: { maxHeight: 200 },
  pickerButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: metrics.borderRadius.md
  },
  pickerButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  sectorPickerModal: {
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.md,
    margin: metrics.margin.lg,
    maxHeight: '80%',
  },
});

export default CompanyDetails;
