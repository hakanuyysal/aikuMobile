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
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {RootStackParamList} from '../../types';
import AuthService from '../../services/AuthService';

type Props = NativeStackScreenProps<AuthStackParamList & RootStackParamList, 'ForgotPassword'>;

const ForgotPassword = ({navigation}: Props) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
      setCodeSent(true);
      Alert.alert('Success', 'Verification code has been sent to your email');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(email, code, newPassword);
      Alert.alert('Success', 'Password has been reset successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color={Colors.lightText} />
              </TouchableOpacity>
              <Text style={styles.title}>Reset Password</Text>
            </View>
            <Text style={styles.subtitle}>
              Enter your email to receive a verification code and reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="mail-outline"
                  size={22}
                  color={Colors.inactive}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.inactive}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor={Colors.primary}
                  editable={!codeSent}
                />
              </View>
            </View>

            {!codeSent ? (
              <TouchableOpacity 
                style={styles.sendCodeButton}
                onPress={handleSendCode}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.lightText} />
                ) : (
                  <Text style={styles.sendCodeButtonText}>Send Verification Code</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Verification Code</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="key-outline"
                      size={22}
                      color={Colors.inactive}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={Colors.inactive}
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      selectionColor={Colors.primary}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="lock-closed-outline"
                      size={22}
                      color={Colors.inactive}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Enter new password"
                      placeholderTextColor={Colors.inactive}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      selectionColor={Colors.primary}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}>
                      <Icon
                        name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={22}
                        color={Colors.inactive}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Icon
                      name="lock-closed-outline"
                      size={22}
                      color={Colors.inactive}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Confirm new password"
                      placeholderTextColor={Colors.inactive}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      selectionColor={Colors.primary}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}>
                      <Icon
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={22}
                        color={Colors.inactive}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={Colors.lightText} />
                  ) : (
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
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
    marginTop: -2,
  },
  header: {
    marginTop: metrics.margin.xl,
    marginBottom: metrics.margin.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  backButton: {
    marginRight: metrics.margin.md,
  },
  title: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: '700',
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
  },
  subtitle: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: metrics.fontSize.md * 1.4,
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
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: metrics.padding.md,
    height: metrics.verticalScale(50),
  },
  inputIcon: {
    marginRight: metrics.margin.sm,
  },
  input: {
    flex: 1,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  passwordInput: {
    paddingRight: metrics.padding.xl,
  },
  eyeIcon: {
    position: 'absolute',
    right: metrics.padding.md,
  },
  sendCodeButton: {
    backgroundColor: Colors.primary,
    height: metrics.verticalScale(50),
    borderRadius: metrics.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.margin.xxl,
    marginTop: metrics.margin.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: metrics.scale(8),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(12),
    elevation: 8,
  },
  sendCodeButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    height: metrics.verticalScale(50),
    borderRadius: metrics.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.margin.xxl,
    marginTop: metrics.margin.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: metrics.scale(8),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(12),
    elevation: 8,
  },
  resetButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: '700',
  },
});

export default ForgotPassword;
