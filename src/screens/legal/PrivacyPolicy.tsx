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
              At Aiku AI Platform ("we", "us", or "our platform"), we are committed to protecting your privacy. This Privacy Policy explains how your personal data is collected, used, shared, and protected when you use our platform.{'\n\n'}
              We recommend that you read this policy carefully. By using our platform, you accept the data processing practices described in this policy.
            </Text>

            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.text}>
              We may collect the following categories of personal information through our platform:{'\n\n'}
              • Account Information: Name, email address, phone number, username, and password required to create and manage your account.{'\n'}
              • Profile Information: Profile picture, occupation, education, experience, and other information you choose to display on your profile.{'\n'}
              • Payment Information: Credit card number, billing address, tax number, and other information needed to process payment transactions.{'\n'}
              • Usage Data: Information about your interactions with our platform, pages visited, links clicked, and time spent on the platform.{'\n'}
              • Device and Browser Information: IP address, browser type, device ID, operating system, and other technical information.{'\n'}
              • Content Data: Content you share on the platform, comments, messages, and other interactions.
            </Text>

            <Text style={styles.sectionTitle}>3. Use of Information</Text>
            <Text style={styles.text}>
              We use the information we collect for the following purposes:{'\n\n'}
              • To provide, maintain, and improve our platform{'\n'}
              • To create and manage your account{'\n'}
              • To process payment transactions{'\n'}
              • To communicate with you about our services{'\n'}
              • To provide technical support and customer service{'\n'}
              • To secure the platform and prevent fraudulent activities{'\n'}
              • To analyze platform usage and improve the experience{'\n'}
              • To provide personalized content and recommendations{'\n'}
              • To fulfill our legal obligations
            </Text>

            <Text style={styles.sectionTitle}>4. Sharing of Information</Text>
            <Text style={styles.text}>
              We may share your personal information with third parties in the following situations:{'\n\n'}
              • Service Providers: Cloud services, payment processors, analytics tools, and other service providers we use to operate and improve our platform.{'\n'}
              • Business Partners: Companies we collaborate with to offer joint services or promotions.{'\n'}
              • Legal Requirements: When required by laws, regulations, legal processes, or government requests.{'\n'}
              • Corporate Transactions: In the event of a merger, acquisition, asset sale, bankruptcy, or similar situation.{'\n'}
              • Security and Protection: To protect our rights, property, security, and the rights of others.{'\n'}
              • With Your Consent: In other situations where you have given your explicit consent.
            </Text>

            <Text style={styles.sectionTitle}>5. Data Security</Text>
            <Text style={styles.text}>
              We take appropriate technical and organizational measures to protect your personal information. These measures include encryption, secure servers, and regular security assessments. However, please note that no transmission of data over the internet or electronic storage is 100% secure.
            </Text>

            <Text style={styles.sectionTitle}>6. Cookies and Similar Technologies</Text>
            <Text style={styles.text}>
              Our platform uses cookies and similar technologies to improve your experience, analyze usage, and personalize our services. For more information about these technologies and how to manage your preferences, please refer to our Cookie Policy.
            </Text>

            <Text style={styles.sectionTitle}>7. User Rights</Text>
            <Text style={styles.text}>
              You have the following rights regarding your personal data:{'\n\n'}
              • Request access to your personal data{'\n'}
              • Request correction or updating of your personal data{'\n'}
              • Request deletion of your personal data{'\n'}
              • Object to processing of your personal data{'\n'}
              • Request restriction of processing your personal data{'\n'}
              • Request data portability{'\n'}
              • Withdraw any consent you have given{'\n\n'}
              To exercise these rights, please contact us at info@aikuaiplatform.com.
            </Text>

            <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
            <Text style={styles.text}>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from individuals under 18 years of age. If we become aware that we have collected personal data from a person under the age of 18, we will endeavor to delete this information as quickly as possible.
            </Text>

            <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
            <Text style={styles.text}>
              Our platform operates globally, and your personal data may be stored and processed in servers outside the country where you live. We transfer your data only to countries that provide an adequate level of protection or where we have taken appropriate measures to ensure the protection of your data.
            </Text>

            <Text style={styles.sectionTitle}>10. Changes to the Privacy Policy</Text>
            <Text style={styles.text}>
              We may update this Privacy Policy from time to time. In case of any changes, we will post the updated policy on our platform and notify you when necessary. Your continued use of the platform means you accept the updated policy.
            </Text>

            <Text style={styles.sectionTitle}>11. Contact</Text>
            <Text style={styles.text}>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at info@aikuaiplatform.com.
            </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    marginTop: metrics.margin.xl,
  },
  text: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: metrics.fontSize.lg * 1.6,
    marginBottom: metrics.margin.lg,
    textAlign: 'justify',
  },
});

export default PrivacyPolicy; 