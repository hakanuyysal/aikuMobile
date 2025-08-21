import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import AuthService from '../services/AuthService';

interface AuthMethodModalProps {
  visible: boolean;
  onClose: () => void;
  authMethod: string;
  email: string;
  onLoginSuccess?: () => void;
}

const {width: screenWidth} = Dimensions.get('window');

const AuthMethodModal: React.FC<AuthMethodModalProps> = ({
  visible,
  onClose,
  authMethod,
  email,
  onLoginSuccess,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const getAuthMethodText = (method: string) => {
    switch (method.toLowerCase()) {
      case 'google':
        return 'Google';
      case 'linkedin':
        return 'LinkedIn';
      case 'facebook':
        return 'Facebook';
      case 'apple':
        return 'Apple';
      default:
        return method;
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      // Burada verification code ile login API'si çağrılacak
      const response = await AuthService.verifyCode(email, verificationCode);
      if (response?.success) {
        Alert.alert('Success', 'Login successful!');
        onLoginSuccess?.();
        onClose();
      } else {
        Alert.alert('Error', response?.message || 'Invalid verification code');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Verification failed',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await AuthService.resendVerificationCode(email);
      Alert.alert('Success', 'Verification code has been resent to your email');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to resend code',
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={metrics.scale(48)}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.message}>
            You previously signed in with {getAuthMethodText(authMethod)}, so a
            verification code has been sent to your email address. Please enter
            the code below to continue.
          </Text>

          <Text style={styles.emailText}>{email}</Text>

          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter 6-digit code"
              placeholderTextColor={Colors.inactive}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
              selectionColor={Colors.primary}
            />
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={isResending}>
              {isResending ? (
                <ActivityIndicator color={Colors.primary} size="small" />
              ) : (
                <Text style={styles.resendButtonText}>Resend Code</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.disabledButton]}
              onPress={handleClose}>
              <Text style={styles.verifyButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.disabledButton]}
              onPress={handleVerifyCode}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Colors.lightText} size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    margin: metrics.margin.lg,
    width: screenWidth * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  iconContainer: {
    width: metrics.scale(60),
    height: metrics.scale(60),
    borderRadius: metrics.scale(30),
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  title: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: metrics.fontSize.lg * 1.3,
    marginBottom: metrics.margin.md,
  },
  emailText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: metrics.margin.md,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: metrics.padding.xl,
    paddingVertical: metrics.padding.md,
    borderRadius: metrics.borderRadius.circle,
    minWidth: 120,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: metrics.margin.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: metrics.margin.sm,
  },
  codeLabel: {
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
  },
  codeInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.sm,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    textAlign: 'center',
    letterSpacing: 2,
    height: metrics.verticalScale(45),
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.sm * 1.2,
    borderRadius: metrics.borderRadius.circle,
    minWidth: 130,
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  verifyButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  resendButton: {
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.xs,
    alignSelf: 'flex-end',
    marginTop: metrics.margin.xs,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: metrics.fontSize.sm,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default AuthMethodModal;
