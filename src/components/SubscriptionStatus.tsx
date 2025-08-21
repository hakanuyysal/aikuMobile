import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSubscription } from '../hooks/useSubscription';
import { Colors } from '../constants/colors';
import metrics from '../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
  showUpgradeButton?: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  onUpgrade, 
  showUpgradeButton = true 
}) => {
  const { isActive, planName, expirationDate, isTrial, loading, error, refreshSubscription } = useSubscription();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Abonelik durumu kontrol ediliyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Icon name="warning" size={24} color={Colors.warning} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshSubscription}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isActive) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <Icon name="checkmark-circle" size={24} color={Colors.success} />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Aktif Abonelik</Text>
            <Text style={styles.planName}>{planName}</Text>
            {expirationDate && (
              <Text style={styles.expirationDate}>
                Bitiş: {new Date(expirationDate).toLocaleDateString('tr-TR')}
              </Text>
            )}
            {isTrial && (
              <Text style={styles.trialText}>⭐️ Ücretsiz Deneme</Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Icon name="information-circle" size={24} color={Colors.inactive} />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusTitle}>Aktif Abonelik Yok</Text>
          <Text style={styles.noSubscriptionText}>
            Premium özelliklere erişmek için abonelik alın
          </Text>
        </View>
      </View>
      
      {showUpgradeButton && onUpgrade && (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.upgradeButtonText}>Abonelik Al</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginVertical: metrics.margin.sm,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statusTextContainer: {
    marginLeft: metrics.margin.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
  },
  planName: {
    fontSize: metrics.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: metrics.margin.xs,
  },
  expirationDate: {
    fontSize: metrics.fontSize.sm,
    color: Colors.inactive,
    marginBottom: metrics.margin.xs,
  },
  trialText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.star,
    fontWeight: 'bold',
  },
  noSubscriptionText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.inactive,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.circle,
    paddingVertical: metrics.padding.md,
    paddingHorizontal: metrics.padding.xl,
    marginTop: metrics.margin.md,
  },
  upgradeButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    fontWeight: '700',
  },
  loadingText: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
    marginTop: metrics.margin.sm,
  },
  errorText: {
    color: Colors.warning,
    fontSize: metrics.fontSize.sm,
    marginTop: metrics.margin.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.circle,
    paddingVertical: metrics.padding.sm,
    paddingHorizontal: metrics.padding.lg,
    marginTop: metrics.margin.md,
  },
  retryButtonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    fontWeight: '600',
  },
});

export default SubscriptionStatus;
