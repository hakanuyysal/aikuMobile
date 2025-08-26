import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
  Dimensions
} from 'react-native';
import metrics from '../../constants/aikuMetric';
import { Colors } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = (metrics?.isTablet ?? false) || SCREEN_WIDTH >= 768;

const MAX_FORM_WIDTH = IS_TABLET
  ? Math.min(Math.round(SCREEN_WIDTH * 0.7), 820)
  : SCREEN_WIDTH - metrics.padding.lg * 2;

const Register = ({ navigation }: Props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
    };

    let hasError = false;

    if (!firstName.trim()) {
      newErrors.firstName = 'Please enter your first name';
      hasError = true;
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Please enter your last name';
      hasError = true;
    }
    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      navigation.navigate('RegisterPassword', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon
                name="arrow-back"
                size={24}
                color={Colors.lightText}
              />
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Text style={styles.title}>
                Join the Future of AI Innovation!
              </Text>
              <Text style={styles.subtitle}>
                Be part of a thriving AI startup ecosystem. Connect with
                like-minded innovators, collaborate, and scale your projects.
                Sign up now!
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.firstName ? styles.inputError : null,
                  ]}>
                  <Icon
                    name="person-outline"
                    size={22}
                    color={Colors.inactive}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your first name"
                    placeholderTextColor={Colors.inactive}
                    value={firstName}
                    onChangeText={text => {
                      setFirstName(text);
                      if (errors.firstName) {
                        setErrors({ ...errors, firstName: '' });
                      }
                    }}
                    selectionColor={Colors.primary}
                  />
                </View>
                {errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.lastName ? styles.inputError : null,
                  ]}>
                  <Icon
                    name="person-outline"
                    size={24}
                    color={Colors.inactive}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your last name"
                    placeholderTextColor={Colors.inactive}
                    value={lastName}
                    onChangeText={text => {
                      setLastName(text);
                      if (errors.lastName) {
                        setErrors({ ...errors, lastName: '' });
                      }
                    }}
                    selectionColor={Colors.primary}
                  />
                </View>
                {errors.lastName ? (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email ? styles.inputError : null,
                  ]}>
                  <Icon
                    name="mail-outline"
                    size={24}
                    color={Colors.inactive}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.inactive}
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    selectionColor={Colors.primary}
                  />
                </View>
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginText}>Login!</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.privacyContainer}>
                <Text style={styles.privacyText}>
                  By continuing, you accept our{' '}
                  <Text
                    style={styles.privacyLink}
                    onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
                  >
                    Terms of Service
                  </Text>
                  {' '}|
                  <Text
                    style={styles.privacyLink}
                    onPress={() => Linking.openURL('https://aikuaiplatform.com/privacy-policy')}
                  >
                    Privacy Policy
                  </Text>
                  {' '}|
                  <Text
                    style={styles.privacyLink}
                    onPress={() => Linking.openURL('https://www.aikuaiplatform.com/cookie-policy')}
                  >
                    Cookie Policy
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
   backButton: {
    position: 'absolute',
    top: IS_TABLET ? metrics.margin.xl : metrics.margin.xs,
    left: metrics.padding.lg,
    zIndex: 10,
    padding: metrics.margin.xs,
    borderRadius: metrics.borderRadius.circle,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: metrics.padding.lg,
    alignItems: 'center',
  },
  header: {
    width: MAX_FORM_WIDTH,
    alignSelf: 'center',
    marginTop: metrics.margin.xl,
    marginBottom: metrics.margin.xl,
  },
  title: {
    fontSize: IS_TABLET ? metrics.fontSize.xxl * 1.1 : metrics.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: IS_TABLET ? metrics.margin.lg : metrics.margin.sm,
    color: Colors.lightText,
  },
  subtitle: {
    fontSize: IS_TABLET ? metrics.fontSize.lg : metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: IS_TABLET ? metrics.fontSize.xl * 1.4 : metrics.fontSize.lg * 1.4,
  },
  form: {
    flex: 1,
    width: MAX_FORM_WIDTH,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: IS_TABLET ? metrics.margin.xl : metrics.margin.lg,
  },
  label: {
    fontSize: IS_TABLET ? metrics.fontSize.lg : metrics.fontSize.md,
    fontWeight: '600',
    marginBottom: metrics.margin.md,
    color: Colors.lightText,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: IS_TABLET ? metrics.borderRadius.lg : metrics.borderRadius.md,
    height: IS_TABLET ? metrics.verticalScale(60) : metrics.verticalScale(55),
    paddingHorizontal: IS_TABLET ? metrics.padding.lg : metrics.padding.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: IS_TABLET ? metrics.fontSize.md : metrics.fontSize.sm,
    marginTop: metrics.margin.xs,
    marginLeft: metrics.margin.xs,
  },
  inputIcon: {
    marginRight: IS_TABLET ? metrics.margin.lg : metrics.margin.md,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: IS_TABLET ? metrics.fontSize.lg * 1.05 : metrics.fontSize.lg,
    color: Colors.lightText,
    height: '100%',
    paddingVertical: metrics.padding.md,
    backgroundColor: 'transparent',
    opacity: 0.8,
  },
  continueButton: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    height: IS_TABLET ? metrics.verticalScale(56) : metrics.verticalScale(50),
    borderRadius: metrics.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: IS_TABLET ? metrics.margin.xl : metrics.margin.xl,
    marginBottom: IS_TABLET ? metrics.margin.xxl : metrics.margin.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: metrics.scale(8) },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(12),
    elevation: 8,
  },
  continueButtonText: {
    color: Colors.lightText,
    fontSize: IS_TABLET ? metrics.fontSize.xl : metrics.fontSize.lg,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: IS_TABLET ? metrics.margin.xl : metrics.margin.xl,
  },
  footerText: {
    fontSize: IS_TABLET ? metrics.fontSize.md : metrics.fontSize.md,
    color: Colors.inactive,
  },
  loginText: {
    fontSize: IS_TABLET ? metrics.fontSize.md : metrics.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  privacyContainer: {
    marginTop: metrics.margin.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    color: Colors.inactive,
    fontSize: IS_TABLET ? metrics.fontSize.md : metrics.fontSize.sm,
    textAlign: 'center',
  },
  privacyLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default Register;
