import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import metrics from '../../constants/aikuMetric';
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const TermsOfService = ({navigation}: any) => {
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={Colors.lightText} />
            </TouchableOpacity>
            <Text style={styles.title}>Terms of Service</Text>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.text}>
              Welcome to Aiku AI Platform ("Platform", "we", "us", or "our"). These Terms of Service ("Terms") establish the legally binding conditions for the use of all services ("Services") provided through the Platform. By using our Platform, you accept these Terms.
            </Text>

            <Text style={styles.sectionTitle}>2. Use of Services</Text>
            <Text style={styles.subSectionTitle}>2.1 Account Creation</Text>
            <Text style={styles.text}>
              To access certain features of our Platform, you may need to create an account. When registering, you agree to provide accurate, complete, and current information. You are responsible for the security of your account and all activities that occur under your account.
            </Text>

            {/* Add the rest of the terms content here */}
          </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.lg,
  },
  backButton: {
    padding: metrics.padding.xs,
  },
  title: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginLeft: metrics.margin.md,
  },
  content: {
    flex: 1,
    padding: metrics.padding.lg,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.md,
    marginTop: metrics.margin.lg,
  },
  subSectionTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
    marginTop: metrics.margin.md,
  },
  text: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: metrics.fontSize.lg * 1.4,
    marginBottom: metrics.margin.md,
  },
});

export default TermsOfService; 