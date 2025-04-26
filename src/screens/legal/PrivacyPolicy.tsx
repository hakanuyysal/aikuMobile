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

const PrivacyPolicy = ({navigation}: any) => {
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
            <Text style={styles.title}>Privacy Policy</Text>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.text}>
              At Aiku AI Platform ("we", "us", or "our platform"), we are committed to protecting your privacy. This Privacy Policy explains how your personal data is collected, used, shared, and protected when you use our platform.
            </Text>

            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.text}>
              We may collect the following categories of personal information through our platform:
            </Text>

            {/* Add the rest of the privacy policy content here */}
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
  text: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: metrics.fontSize.lg * 1.4,
    marginBottom: metrics.margin.md,
  },
});

export default PrivacyPolicy; 