import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

const ContactUs = ({navigation}: Props) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: '',
  });

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    Alert.alert('Başarılı', 'Mesajınız başarıyla gönderildi.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      message: '',
    });
  };

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
            <IoniconsIcon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerSubtitle}>
                Elevate Your AI Startup Journey
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>First name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={text => setFormData({...formData, firstName: text})}
                    placeholder="First name"
                    placeholderTextColor={Colors.border}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={text => setFormData({...formData, lastName: text})}
                    placeholder="Last name"
                    placeholderTextColor={Colors.border}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={text => setFormData({...formData, email: text})}
                    placeholder="Email"
                    placeholderTextColor={Colors.border}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phoneNumber}
                    onChangeText={text => setFormData({...formData, phoneNumber: text})}
                    placeholder="Phone Number"
                    placeholderTextColor={Colors.border}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.messageContainer}>
                <Text style={styles.label}>Your Message</Text>
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  value={formData.message}
                  onChangeText={text => setFormData({...formData, message: text})}
                  placeholder="Your Message"
                  placeholderTextColor={Colors.border}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.submitGradient}>
                  <Text style={styles.submitButtonText}>SEND YOUR MESSAGE</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Icon name="phone" size={24} color={Colors.primary} />
                  <Text style={styles.contactText}>+90 850 757 94 27</Text>
                </View>
                <View style={styles.contactItem}>
                  <Icon name="email" size={24} color={Colors.primary} />
                  <Text style={styles.contactText}>info@aikuaiplatform.com</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
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
    top: metrics.margin.md,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl * 1.1,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: -metrics.margin.sm,
  },
  headerSubtitle: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: metrics.margin.md,
  },
  scrollContent: {
    flexGrow: 1,
    padding: metrics.padding.lg,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginTop: metrics.margin.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: metrics.margin.lg,
    gap: metrics.margin.md,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
    fontWeight: '500',
    opacity: 0.8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: metrics.borderRadius.sm,
    padding: metrics.padding.md,
    color: Colors.lightText,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageContainer: {
    marginBottom: metrics.margin.lg,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginVertical: metrics.margin.lg,
    borderRadius: metrics.borderRadius.md,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitGradient: {
    paddingVertical: metrics.padding.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
    letterSpacing: 1,
  },
  contactInfo: {
    marginTop: metrics.margin.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  contactText: {
    color: Colors.lightText,
    marginLeft: metrics.margin.md,
    fontSize: metrics.fontSize.md,
    opacity: 0.8,
  },
});

export default ContactUs; 