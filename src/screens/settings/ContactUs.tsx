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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: '',
  });

  const handleSubmit = () => {
    // Form validasyonu
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    // TODO: Form gönderme işlemi burada yapılacak
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
      colors={[Colors.background, Colors.cardBackground]}
      style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>GET IN TOUCH</Text>
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

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>SEND YOUR MESSAGE</Text>
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: metrics.padding.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: metrics.margin.xl,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: metrics.margin.sm,
  },
  headerSubtitle: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: metrics.borderRadius.sm,
    padding: metrics.padding.md,
    color: Colors.lightText,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageContainer: {
    marginBottom: metrics.margin.lg,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.lg,
    alignItems: 'center',
    marginBottom: metrics.margin.xl,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  contactInfo: {
    marginTop: metrics.margin.lg,
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
  },
});

export default ContactUs; 