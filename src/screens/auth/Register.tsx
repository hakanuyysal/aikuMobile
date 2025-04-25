import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import metrics from '../../constants/aikuMetric';
import {Colors} from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const Register = ({navigation}: any) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Join the Future of AI Innovation!</Text>
              <Text style={styles.subtitle}>
                Be part of a thriving AI startup ecosystem. Connect with like-minded
                innovators, collaborate, and scale your projects. Sign up now!
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.nameContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>First Name</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="person-outline" size={20} color={Colors.inactive} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your first name"
                      placeholderTextColor={Colors.inactive}
                      value={firstName}
                      onChangeText={setFirstName}
                      selectionColor={Colors.primary}
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="person-outline" size={20} color={Colors.inactive} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your last name"
                      placeholderTextColor={Colors.inactive}
                      value={lastName}
                      onChangeText={setLastName}
                      selectionColor={Colors.primary}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="mail-outline" size={20} color={Colors.inactive} style={styles.inputIcon} />
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
                  <Icon name="lock-closed-outline" size={20} color={Colors.inactive} style={styles.inputIcon} />
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
                      size={20}
                      color={Colors.inactive}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock-closed-outline" size={20} color={Colors.inactive} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirm your password"
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
                      size={20}
                      color={Colors.inactive}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.termsText}>
                By clicking "Sign Up", you agree to our Terms of Service and Privacy
                Policy and acknowledge our Personal Data Protection Notice.
              </Text>

              <TouchableOpacity style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginText}>Login!</Text>
                </TouchableOpacity>
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
  content: {
    padding: metrics.padding.lg,
  },
  header: {
    marginTop: metrics.margin.xl,
    marginBottom: metrics.margin.xl,
  },
  title: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: metrics.margin.sm,
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: metrics.margin.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: metrics.margin.lg,
  },
  label: {
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
    marginBottom: metrics.margin.xs,
    color: Colors.lightText,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: metrics.verticalScale(50),
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: metrics.borderRadius.sm,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: metrics.padding.md,
  },
  inputIcon: {
    marginRight: metrics.margin.sm,
  },
  input: {
    flex: 1,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    height: '100%',
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
    borderRadius: metrics.borderRadius.circle,
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
});

export default Register; 