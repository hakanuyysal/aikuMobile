import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import metrics from '../../constants/aikuMetric';
import {Colors} from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../contexts/AuthContext';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterPassword'>;

const RegisterPassword = ({navigation, route}: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const {register, loading} = useAuth();
  const {firstName, lastName, email} = route.params;

  const validatePassword = () => {
    const newErrors = {
      password: '',
      confirmPassword: '',
    };

    let isValid = true;

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (validatePassword()) {
      try {
        await register({
          email,
          password,
          name: `${firstName} ${lastName}`,
        });
        navigation.navigate('EmailVerification');
      } catch (error) {
        Alert.alert('Hata', error instanceof Error ? error.message : 'Kayıt işlemi başarısız oldu');
      }
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color={Colors.lightText} />
              </TouchableOpacity>
              <Text style={styles.title}>Set Your Password</Text>
            </View>
            <Text style={styles.subtitle}>
              Create a strong password to secure your account. Make sure it's at
              least 8 characters long.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                <Icon
                  name="lock-closed-outline"
                  size={22}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.inactive}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({...errors, password: ''});
                    }
                  }}
                  secureTextEntry={!showPassword}
                  selectionColor={Colors.primary}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color={Colors.inactive}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : null]}>
                <Icon
                  name="lock-closed-outline"
                  size={24}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.inactive}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors({...errors, confirmPassword: ''});
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  selectionColor={Colors.primary}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={
                      showConfirmPassword ? 'eye-outline' : 'eye-off-outline'
                    }
                    size={24}
                    color={Colors.inactive}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <Text style={styles.termsText}>
              By clicking "Sign Up", you agree to our{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('TermsOfService')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                Privacy Policy
              </Text>{' '}
              and acknowledge our{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('PersonalDataProtection')}>
                Personal Data Protection Notice
              </Text>
              .
            </Text>

            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handleSignUp}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.lightText} />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Login!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    padding: metrics.padding.lg,
  },
  header: {
    marginTop: metrics.margin.lg,
    marginBottom: metrics.margin.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  title: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginLeft: metrics.margin.md,
  },
  subtitle: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: metrics.fontSize.lg * 1.4,
    marginTop: metrics.margin.md,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: metrics.margin.lg,
  },
  label: {
    fontSize: metrics.fontSize.md,
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
    borderRadius: metrics.borderRadius.md,
    height: metrics.verticalScale(55),
    paddingHorizontal: metrics.padding.md,
  },
  inputIcon: {
    marginRight: metrics.margin.md,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    height: '100%',
    paddingVertical: metrics.padding.md,
    backgroundColor: 'transparent',
    opacity: 0.7,
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: metrics.padding.xs,
  },
  termsText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.inactive,
    marginBottom: metrics.margin.lg,
    lineHeight: metrics.fontSize.md * 1.4,
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    height: metrics.verticalScale(50),
    width: '90%',
    alignSelf: 'center',
    borderRadius: metrics.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.margin.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: metrics.scale(8),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(12),
    elevation: 8,
  },
  signUpButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
  },
  loginText: {
    fontSize: metrics.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  backButton: {
    padding: metrics.padding.xs,
  },
  errorText: {
    color: Colors.error,
    fontSize: metrics.fontSize.sm,
    marginTop: metrics.margin.xs,
    marginLeft: metrics.margin.xs,
  },
  inputError: {
    borderColor: Colors.error,
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default RegisterPassword;
