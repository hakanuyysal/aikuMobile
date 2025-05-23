import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Picker } from '@react-native-picker/picker';

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

const CompanyDetails = ({ navigation }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
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

  const [slideAnim] = useState(new Animated.Value(0));
  const [visibleSteps, setVisibleSteps] = useState(5);

  const formSteps = [
    {
      label: 'Company Name',
      placeholder: 'Enter your company name',
      key: 'companyName',
      type: 'text',
    },
    {
      label: 'Company Logo',
      placeholder: 'Dosya seçilmedi',
      key: 'companyLogo',
      type: 'file',
    },
    {
      label: 'Company Type',
      key: 'companyType',
      type: 'picker',
      options: ['Startup', ],
    },
    {
      label: 'Open for Investments',
      key: 'openForInvestments',
      type: 'boolean',
    },
    {
      label: 'Has the company been incorporated?',
      key: 'incorporated',
      type: 'picker',
      options: ['Yes', 'No'],
    },
    {
      label: 'Company Sector',
      key: 'companySector',
      type: 'multi-select',
      options: sectors,
    },
    {
      label: 'Company Size',
      key: 'companySize',
      type: 'picker',
      options: ['1-10', '11-50', '51-200', '201+'],
    },
    {
      label: 'Business Model',
      key: 'businessModel',
      type: 'picker',
      options: ['B2B', 'B2C', 'C2C', 'Other'],
    },
    {
      label: 'Business Scale',
      key: 'businessScale',
      type: 'picker',
      options: ['Local', 'Regional', 'National', 'Global'],
    },
    {
      label: 'Company Email',
      key: 'companyEmail',
      type: 'text',
      placeholder: 'Enter your company email',
    },
    {
      label: 'Company Phone Number',
      key: 'companyPhone',
      type: 'text',
      placeholder: 'Enter your phone number',
    },
    {
      label: 'Summarized Company Information',
      key: 'summarizedInfo',
      type: 'text',
      placeholder: 'Enter your summarized company information',
      maxLength: 500,
    },
    {
      label: 'Detailed Company Information',
      key: 'detailedInfo',
      type: 'text',
      placeholder: 'Enter your detailed company information',
      maxLength: 3000,
    },
    {
      label: 'Company Address',
      key: 'companyAddress',
      type: 'text',
      placeholder: 'Enter your company address',
    },
    {
      label: 'Company Website',
      key: 'companyWebsite',
      type: 'text',
      placeholder: 'Enter your company website',
    },
    {
      label: 'Company LinkedIn',
      key: 'companyLinkedIn',
      type: 'text',
      placeholder: 'Enter your company LinkedIn',
    },
    {
      label: 'Company Instagram',
      key: 'companyInstagram',
      type: 'text',
      placeholder: 'Enter your company Instagram',
    },
    {
      label: 'Company X (Twitter)',
      key: 'companyTwitter',
      type: 'text',
      placeholder: 'Enter your company Twitter',
    },
    {
      label: 'Accept messages from other companies',
      key: 'acceptMessages',
      type: 'boolean',
    },
    {
      label: 'Team Members',
      key: 'teamMembers',
      type: 'text',
      placeholder: 'Add Team Member',
    },
  ];

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form data
      console.log('Form submitted:', formData);
      setModalVisible(false);
      setCurrentStep(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const renderStep = () => {
    const startIndex = Math.floor(currentStep / 5) * 5;
    const visibleFormSteps = formSteps.slice(startIndex, startIndex + 5);

    return (
      <ScrollView style={styles.formScrollView}>
        <View>
          {visibleFormSteps.map((step, index) => {
            const actualIndex = startIndex + index;
            const isActive = actualIndex === currentStep;

            return (
              <View 
                key={step.key} 
                style={[
                  styles.stepContainer,
                  isActive && styles.activeStep
                ]}
              >
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {step.label}
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

  const renderStepContent = (step, isActive) => {
    if (!isActive) return null;

    switch (step.type) {
      case 'text':
        return (
          <TextInput
            style={styles.input}
            placeholder={step.placeholder}
            placeholderTextColor={Colors.lightText}
            value={formData[step.key]}
            onChangeText={(text) => handleInputChange(step.key, text)}
            maxLength={step.maxLength}
            multiline={step.maxLength > 500}
          />
        );
      case 'picker':
        return (
          <Picker
            selectedValue={formData[step.key]}
            style={styles.picker}
            onValueChange={(value) => handleInputChange(step.key, value)}
          >
            {step.options.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        );
      case 'boolean':
        return (
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleInputChange(step.key, !formData[step.key])}
          >
            <MaterialIcons
              name={formData[step.key] ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.checkboxText}>
              {formData[step.key] ? 'Yes' : 'No'}
            </Text>
          </TouchableOpacity>
        );
      case 'multi-select':
        return (
          <View style={styles.multiSelectContainer}>
            <FlatList
              data={step.options}
              keyExtractor={(item) => item}
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => {
                    const updatedSectors = formData[step.key].includes(item)
                      ? formData[step.key].filter((sector) => sector !== item)
                      : [...formData[step.key], item];
                    handleInputChange(step.key, updatedSectors);
                  }}
                >
                  <MaterialIcons
                    name={
                      formData[step.key].includes(item)
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={24}
                    color={Colors.primary}
                  />
                  <Text style={styles.checkboxText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        );
      case 'file':
        return (
          <TouchableOpacity style={styles.fileButton}>
            <Text style={styles.fileButtonText}>
              {formData[step.key] ? 'File Selected' : step.placeholder}
            </Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Details</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add-business" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <TouchableOpacity style={styles.companyCard}>
            <Image
              source={{
                uri: 'https://turkaumining.vercel.app/static/media/turkau-logo.904055d9d6e7dd0213c5.png',
              }}
              style={styles.companyLogo}
              resizeMode="contain"
            />
            <Text style={styles.companyName}>Turkau Mining</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addCompanyCard}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add-business" size={24} color={Colors.primary} />
            <Text style={styles.addCompanyText}>Add New Company</Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalWrapper}>
              <LinearGradient
                colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
                locations={[0, 0.3, 0.6, 0.9]}
                start={{ x: 0, y: 0 }}
                end={{ x: 2, y: 1 }}
                style={styles.modalContainer}
              >
                <SafeAreaView style={styles.modalSafeArea}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Company Form</Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <Icon name="close" size={24} color={Colors.lightText} />
                    </TouchableOpacity>
                  </View>
                  <Animated.View style={[styles.modalContent]}>
                    <View style={styles.progressContainer}>
                      {Array(Math.ceil(formSteps.length / 5)).fill(0).map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.progressDot,
                            Math.floor(currentStep / 5) === idx && styles.activeProgressDot
                          ]}
                        />
                      ))}
                    </View>
                    {renderStep()}
                  </Animated.View>
                  <View style={styles.navigationButtons}>
                    {currentStep > 0 && (
                      <TouchableOpacity
                        style={styles.navButton}
                        onPress={handleBack}
                      >
                        <Text style={styles.navButtonText}>Back</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={handleNext}
                    >
                      <Text style={styles.navButtonText}>
                        {currentStep === formSteps.length - 1 ? 'Submit' : 'Next'}
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
  companyLogo: {
    width: 50,
    height: 50,
    marginRight: metrics.margin.md,
  },
  companyName: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '500',
  },
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
  addCompanyText: {
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalSafeArea: {
    flex: 1,
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
  closeButton: {
    padding: metrics.padding.sm,
  },
  modalContent: {
    flex: 1,
    padding: metrics.padding.md,
  },
  label: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
  },
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
  picker: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    color: Colors.lightText,
    marginBottom: metrics.margin.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  checkboxText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginLeft: metrics.margin.sm,
  },
  fileButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  fileButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
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
  navButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: metrics.margin.sm,
  },
  navButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '500',
  },
  charCount: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    textAlign: 'right',
  },
  stepContainer: {
    marginBottom: metrics.margin.md,
    padding: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeStep: {
    backgroundColor: 'rgba(59,130,247,0.1)',
    borderColor: Colors.primary,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: metrics.margin.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  activeProgressDot: {
    backgroundColor: Colors.primary,
  },
  formScrollView: {
    flex: 1,
    marginBottom: 80, // Add space for navigation buttons
  },
  bottomPadding: {
    height: 20, // Adds extra padding at the bottom of the scroll view
  },
  multiSelectContainer: {
    maxHeight: 200, // Limit the height of the multi-select container
  }
});

export default CompanyDetails;