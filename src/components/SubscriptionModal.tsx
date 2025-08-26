import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText: string;
  cancelText?: string;
  isFreeTrial?: boolean;
  planDetails?: {
    plan: string;
    price: string;
    billing: string;
    autoRenewal: string;
    cancelAnytime: string;
    nextBilling: string;
  };
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText = 'Cancel',
  isFreeTrial = false,
  planDetails,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={isFreeTrial ? 'star' : 'crown'}
                  size={32}
                  color={isFreeTrial ? Colors.star : Colors.primary}
                />
              </View>
              <Text style={styles.modalTitle}>{title}</Text>
            </View>

            {/* Important Info */}
            <View style={styles.importantInfoContainer}>
              <Text style={styles.importantInfoText}>
                This subscription will automatically renew unless cancelled. You can manage your subscription in your account settings.
              </Text>
            </View>

            {/* Subscription Details Grid */}
            {planDetails && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailBackground}>
                      <Text style={styles.detailLabel}>Plan</Text>
                      <Text style={styles.detailValue}>{planDetails.plan}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailBackground}>
                      <Text style={styles.detailLabel}>Price</Text>
                      <Text style={styles.detailValue}>{planDetails.price}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailBackground}>
                      <Text style={styles.detailLabel}>Billing</Text>
                      <Text style={styles.detailValue}>{planDetails.billing}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailBackground}>
                      <Text style={styles.detailLabel}>Auto-renewal</Text>
                      <Text style={styles.detailValue}>{planDetails.autoRenewal}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailBackground}>
                      <Text style={styles.detailLabel}>Cancel anytime</Text>
                      <Text style={styles.detailValue}>{planDetails.cancelAnytime}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailBackground}>
                      <Text style={styles.detailLabel}>Next billing</Text>
                      <Text style={styles.detailValue}>{planDetails.nextBilling}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}>
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: metrics.getWidthPercentage(85),
    maxWidth: 350,
    maxHeight: '70%',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.xl,
    padding: metrics.padding.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  modalTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    textAlign: 'center',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: metrics.margin.md,
  },
  button: {
    flex: 1,
    paddingVertical: metrics.padding.md,
    borderRadius: metrics.borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: metrics.margin.lg,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: metrics.margin.sm,
    gap: metrics.margin.sm,
  },
  detailItem: {
    flex: 1,
  },
  detailBackground: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  detailLabel: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.7,
    marginBottom: metrics.margin.xs,
  },
  detailValue: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    fontWeight: '600',
  },
  importantInfoContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.padding.md,
    marginBottom: metrics.margin.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  importantInfoText: {
    fontSize: metrics.fontSize.sm,
    color: '#FFC107',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});

export default SubscriptionModal;
