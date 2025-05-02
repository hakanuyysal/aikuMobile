import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../src/constants/colors';
import metrics from '../../src/constants/aikuMetric';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SubscriptionDetails = () => {
  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Icon
            name="card-membership"
            size={metrics.scale(32)}
            color={Colors.lightText}
          />
          <Text style={styles.headerTitle}>Abonelik Detayları</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mevcut Plan</Text>
            <View style={styles.planDetails}>
              <Text style={styles.planName}>Premium Üyelik</Text>
              <Text style={styles.planPrice}>₺199.99/ay</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Üyelik Özellikleri</Text>
            {[
              'Sınırsız Mesajlaşma',
              'Özel İçerikler',
              'Reklamsız Deneyim',
              '7/24 Öncelikli Destek',
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon
                  name="check-circle"
                  size={metrics.scale(24)}
                  color={Colors.primary}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Fatura Bilgileri</Text>
            <View style={styles.billingInfo}>
              <Text style={styles.billingLabel}>Sonraki Ödeme:</Text>
              <Text style={styles.billingValue}>15 Mayıs 2024</Text>
            </View>
            <View style={styles.billingInfo}>
              <Text style={styles.billingLabel}>Ödeme Yöntemi:</Text>
              <Text style={styles.billingValue}>**** **** **** 4242</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.lightText}20`,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginLeft: metrics.margin.md,
  },
  content: {
    flex: 1,
    padding: metrics.padding.md,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.md,
  },
  planDetails: {
    backgroundColor: `${Colors.primary}15`,
    padding: metrics.padding.md,
    borderRadius: metrics.borderRadius.md,
  },
  planName: {
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: metrics.margin.xs,
  },
  planPrice: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
  },
  featureText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginLeft: metrics.margin.sm,
  },
  billingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.margin.sm,
  },
  billingLabel: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    opacity: 0.7,
  },
  billingValue: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    fontWeight: '500',
  },
});

export default SubscriptionDetails; 