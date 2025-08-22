import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import {storage} from '../storage/mmkv';

interface PushPermissionPromptProps {
  visible: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

const PushPermissionPrompt: React.FC<PushPermissionPromptProps> = ({
  visible,
  onClose,
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);

    try {
      // Load OneSignal with dynamic import
      let OneSignal: any = null;
      
      // First try: check if OneSignal is already available globally
      if (typeof global !== 'undefined' && (global as any).OneSignal) {
        OneSignal = (global as any).OneSignal;
      } else {
        try {
          // Try different ways to load OneSignal
          const OneSignalModule = require('react-native-onesignal');
          
          // Try different export patterns
          OneSignal = OneSignalModule.default || OneSignalModule.OneSignal || OneSignalModule;
        } catch (_e) {
          console.warn('❌ OneSignal native module not available in PushPermissionPrompt');
          console.log('OneSignal not available, closing modal gracefully');
          onClose();
          setIsRequesting(false);
          return;
        }
      }

      // Check if OneSignal is null or undefined
      if (!OneSignal) {
        console.log('❌ OneSignal is null/undefined in PushPermissionPrompt, closing modal gracefully');
        onClose();
        setIsRequesting(false);
        return;
      }

      try {
        // Show system permission prompt
        const permission = await OneSignal.Notifications.requestPermission(true);

        if (permission) {
          console.log('Push notification permission granted');
          // Save to storage to prevent showing again
          storage.set('pushPromptShown', true);
          storage.set('pushPermissionStatus', 'granted');
          storage.delete('pushPromptNextShow'); // Clear any scheduled next show time
          storage.delete('pushPromptNeverAsk'); // Clear never ask flag since permission was granted
          console.log('✅ Push notification izni verildi, prompt bir daha gösterilmeyecek');
          onPermissionGranted?.();
          onClose();
        } else {
          console.log('Push notification permission denied');
          storage.set('pushPermissionStatus', 'denied');
          onPermissionDenied?.();
          Alert.alert(
            'Notification Permission Denied',
            'You need to grant permission from settings to receive notifications.',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Go to Settings',
                onPress: () => {
                  // Here we can redirect to system settings
                  // We can use Linking in React Native to go to settings
                },
              },
            ],
          );
        }
      } catch (permissionError) {
        console.error('Permission request failed:', permissionError);
        // If permission request fails, just close the modal gracefully
        storage.set('pushPermissionStatus', 'error');
        onPermissionDenied?.();
        onClose();
      }
    } catch (error) {
      console.error('Push permission request failed:', error);
      // Instead of showing error alert, just close the modal gracefully
      storage.set('pushPermissionStatus', 'error');
      onPermissionDenied?.();
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleMaybeLater = () => {
    // User selected "Maybe Later", show again after 3 days
    const nextShowTime = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days
    storage.set('pushPromptNextShow', nextShowTime);
    storage.set('pushPermissionStatus', 'postponed');
    console.log('✅ "Maybe Later" seçildi, push prompt 3 gün sonra tekrar gösterilecek');
    onPermissionDenied?.();
    onClose();
  };

  const handleNeverAsk = () => {
    // User selected "Don't Ask Again"
    storage.set('pushPromptShown', true);
    storage.set('pushPromptNeverAsk', true);
    storage.set('pushPermissionStatus', 'never');
    storage.delete('pushPromptNextShow'); // Clear any scheduled next show time
    console.log('✅ "Don\'t Ask Again" seçildi, push prompt bir daha gösterilmeyecek');
    onPermissionDenied?.();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isRequesting}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={Colors.lightText}
            />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="bell-ring"
              size={48}
              color={Colors.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Enable Notifications</Text>

          {/* Description */}
          <Text style={styles.description}>
            Stay up to date with AIKU! Enable notifications for personalized
            recommendations, new features and important updates.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.enableButton]}
              onPress={handleEnableNotifications}
              disabled={isRequesting}>
              <Text style={styles.enableButtonText}>
                {isRequesting
                  ? 'Requesting Permission...'
                  : 'Enable Notifications'}
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryButtonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleMaybeLater}
                disabled={isRequesting}>
                <Text style={styles.secondaryButtonText}>Maybe Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleNeverAsk}
                disabled={isRequesting}>
                <Text style={styles.secondaryButtonText}>Don't Ask Again</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer note */}
          <Text style={styles.footerText}>
            You can change it from settings anytime after giving permission.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: metrics.isTablet ? 480 : 360,
    backgroundColor: '#23283A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.xl,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    lineHeight: metrics.moderateScale(22, 0.4),
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: metrics.spacing.sm,
    paddingHorizontal: metrics.spacing.md,
    alignItems: 'center',
    marginBottom: 8,
  },
  enableButton: {
    backgroundColor: Colors.primary,
  },
  enableButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: metrics.fontSize.md,
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flex: 1,
  },
  secondaryButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    fontWeight: '600',
  },
  footerText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.xs,
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default PushPermissionPrompt;
