import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import metrics from '../../constants/aikuMetric';
import {Colors} from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const EmailVerification = ({navigation}: any) => {
  const handleResendEmail = () => {
    // TODO: API call for resending verification email
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
            <View style={styles.titleRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color={Colors.lightText} />
              </TouchableOpacity>
              <Text style={styles.title}>Check Your Email</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="mail" size={80} color={Colors.primary} />
            </View>

            <Text style={styles.mainText}>
              We've sent you an email with a verification link. Please check
              your inbox and click the link to verify your account.
            </Text>

            <Text style={styles.subText}>
              If you don't see the email, check your spam folder.
            </Text>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendEmail}>
              <Text style={styles.resendButtonText}>Resend Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Back to Login</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: metrics.padding.lg,
  },
  iconContainer: {
    marginBottom: metrics.margin.xxl,
    marginTop: metrics.margin.xl,
  },
  mainText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    textAlign: 'center',
    marginBottom: metrics.margin.lg,
    lineHeight: metrics.fontSize.xl,
  },
  subText: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    textAlign: 'center',
    marginBottom: metrics.margin.xxl,
  },
  resendButton: {
    backgroundColor: Colors.primary,
    height: metrics.verticalScale(50),
    borderRadius: metrics.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: metrics.margin.lg,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: metrics.scale(8),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(12),
    elevation: 8,
  },
  resendButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: '700',
  },
  loginButton: {
    height: metrics.verticalScale(50),
    borderRadius: metrics.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
  },
  backButton: {
    padding: metrics.padding.xs,
  },
});

export default EmailVerification;
