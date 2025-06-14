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
import {RootStackParamList} from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList & RootStackParamList, 'Login'>;

interface LoginResponse {
  user: any;
  success?: boolean;
  error?: string;
}

const Login = ({navigation}: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {login, loading, googleLogin, linkedInLogin} = useAuth();

  const handleLogin = async () => {
    try {
      const response = await login(email, password) as LoginResponse;
      if (response?.user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await googleLogin();
      console.error('Google Login Response:', response);
      if (response?.success && response?.user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      } else {
        console.error('Google Login Error:', response?.error);
        Alert.alert('Google Giriş Hatası', response?.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google Login Exception:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Google login failed');
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      const response = await linkedInLogin();
      if (response?.user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'LinkedIn login failed');
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
            <Text style={styles.title}>Welcome to Aiku!</Text>
            <Text style={styles.subtitle}>
              Connect with AI entrepreneurs, investors, and industry leaders.
              Login to grow your projects and be part of the future of
              innovation!
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
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
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
                  onChangeText={setPassword}
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
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.lightText} />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>
                Sign in with social accounts
              </Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={loading}>
                <Icon
                  name="logo-google"
                  size={20}
                  color={Colors.lightText}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleLinkedInLogin}
                disabled={loading}>
                <Icon
                  name="logo-linkedin"
                  size={20}
                  color={Colors.lightText}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialButtonText}>
                  Sign in with LinkedIn
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpText}>Sign Up!</Text>
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
    marginTop: metrics.margin.xl,
    marginBottom: metrics.margin.xxl,
  },
  title: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: metrics.margin.md,
    color: Colors.lightText,
  },
  subtitle: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: metrics.fontSize.lg * 1.4,
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
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.lg,
  },
  loginButton: {
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
  loginButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.xxl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: metrics.margin.md,
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
  },
  socialButtons: {
    gap: metrics.margin.md,
  },
  socialButton: {
    flexDirection: 'row',
    height: metrics.verticalScale(50),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: metrics.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    opacity: 1.5,
    shadowColor: 'rgba(255,255,255,0.1)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    marginRight: metrics.margin.sm,
  },
  socialButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: metrics.margin.xl,
  },
  footerText: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
  },
  signUpText: {
    fontSize: metrics.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default Login;
