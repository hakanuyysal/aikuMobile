import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProduct'>;

const AddProduct = ({navigation}: Props) => {
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    companyName: '',
    shortDescription: '',
    detailedDescription: '',
    tags: [],
    problems: [],
    solutions: [],
    improvements: [],
    keyFeatures: [],
    pricingModel: 'Free',
    releaseDate: '',
    website: '',
    linkedin: '',
    twitter: '',
  });

  const handleAddProduct = () => {
    console.log('Form data:', formData);
    // Burada form verilerini kaydetme işlemi yapılacak
    navigation.goBack();
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    maxLength?: number,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.lightText + '80'}
        multiline={multiline}
        maxLength={maxLength}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
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
          <TouchableOpacity style={styles.saveButton} onPress={handleAddProduct}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Product Information</Text>
            
            {renderInputField(
              'Product Name',
              formData.productName,
              (text) => setFormData({...formData, productName: text}),
              'Enter your product name',
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Product Logo</Text>
              <TouchableOpacity style={styles.fileUploadButton}>
                <Text style={styles.fileUploadText}>Dosya seçilmedi</Text>
              </TouchableOpacity>
            </View>

            {renderInputField(
              'Category',
              formData.category,
              (text) => setFormData({...formData, category: text}),
              'Select a category',
            )}

            {renderInputField(
              'Company Name',
              formData.companyName,
              (text) => setFormData({...formData, companyName: text}),
              'Select your company',
            )}

            {renderInputField(
              'Short Description',
              formData.shortDescription,
              (text) => setFormData({...formData, shortDescription: text}),
              'Brief description of your product',
              true,
              500,
            )}

            {renderInputField(
              'Detailed Description',
              formData.detailedDescription,
              (text) => setFormData({...formData, detailedDescription: text}),
              'Provide more details about your product',
              true,
              3000,
            )}

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Enter tags"
                  placeholderTextColor={Colors.lightText + '80'}
                />
                <TouchableOpacity style={styles.addTagButton}>
                  <Text style={styles.addTagText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Problems</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Enter problems"
                  placeholderTextColor={Colors.lightText + '80'}
                />
                <TouchableOpacity style={styles.addTagButton}>
                  <Text style={styles.addTagText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Solutions</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Enter solutions"
                  placeholderTextColor={Colors.lightText + '80'}
                />
                <TouchableOpacity style={styles.addTagButton}>
                  <Text style={styles.addTagText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Improvements</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Enter improvements"
                  placeholderTextColor={Colors.lightText + '80'}
                />
                <TouchableOpacity style={styles.addTagButton}>
                  <Text style={styles.addTagText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tagContainer}>
              <Text style={styles.inputLabel}>Key Features</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Enter keyFeatures"
                  placeholderTextColor={Colors.lightText + '80'}
                />
                <TouchableOpacity style={styles.addTagButton}>
                  <Text style={styles.addTagText}>Add</Text>
                </TouchableOpacity>
              </View>
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
              (text) => setFormData({...formData, releaseDate: text}),
              'gg.aa.yyyy',
            )}

            {renderInputField(
              'Product Website',
              formData.website,
              (text) => setFormData({...formData, website: text}),
              'Enter your product website',
            )}

            {renderInputField(
              'Product LinkedIn',
              formData.linkedin,
              (text) => setFormData({...formData, linkedin: text}),
              'Enter your product LinkedIn',
            )}

            {renderInputField(
              'Product X (Twitter)',
              formData.twitter,
              (text) => setFormData({...formData, twitter: text}),
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
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    marginRight: metrics.margin.sm,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
  },
  addTagText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '500',
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
});

export default AddProduct; 