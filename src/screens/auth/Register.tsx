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
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
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
                        setErrors({...errors, firstName: ''});
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
                        setErrors({...errors, lastName: ''});
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
                        setErrors({...errors, email: ''});
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
    marginBottom: metrics.margin.xxl,
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: metrics.fontSize.sm,
    marginTop: metrics.margin.xs,
    marginLeft: metrics.margin.xs,
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
  continueButton: {
    backgroundColor: Colors.primary,
    height: metrics.verticalScale(50),
    borderRadius: metrics.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.margin.xl,
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
  continueButtonText: {
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
