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

            <Text style={styles.subSectionTitle}>2.2 Payments and Subscriptions</Text>
            <Text style={styles.text}>
              The Platform offers paid services. When making a payment, you agree to provide correct and complete payment information. Subscription fees are charged monthly or annually based on the selected plan. Subscriptions automatically renew until you cancel them.
            </Text>

            <Text style={styles.sectionTitle}>3. Intellectual Property Rights</Text>
            <Text style={styles.text}>
              The Platform and its content (software, text, graphics, user interfaces, logos, trademarks, designs, and other content) are owned by Aiku AI Platform or its licensors and are protected by copyright, trademark, and other intellectual property laws.{'\n\n'}
              For content uploaded by users, you grant our platform the right to publish, distribute, and use this content; however, the ownership of this content remains with our users.
            </Text>

            <Text style={styles.sectionTitle}>4. User Content and Behavior Rules</Text>
            <Text style={styles.subSectionTitle}>4.1 User Content</Text>
            <Text style={styles.text}>
              By uploading content to our Platform, you guarantee that this content is legal and does not violate the rights of third parties.
            </Text>

            <Text style={styles.subSectionTitle}>4.2 Prohibited Behaviors</Text>
            <Text style={styles.text}>
              The following behaviors are strictly prohibited on our platform:{'\n\n'}
              • Sharing illegal, harmful, threatening, harassing, racist, or otherwise objectionable content{'\n'}
              • Sharing content that infringes on the intellectual property rights of others{'\n'}
              • Disrupting the normal operation of the Platform or compromising its security{'\n'}
              • Spreading malware or viruses{'\n'}
              • Collecting personal information of other users without permission
            </Text>

            <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
            <Text style={styles.text}>
              The Platform and our services are provided "as is" and "as available." We do not guarantee that our Platform will operate continuously, uninterrupted, or error-free.{'\n\n'}
              To the maximum extent permitted by law, Aiku AI Platform, its representatives, employees, or partners cannot be held liable for direct, indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use the Platform.
            </Text>

            <Text style={styles.sectionTitle}>6. Third-Party Services and Links</Text>
            <Text style={styles.text}>
              Our Platform may contain links to and integrations with third-party services. The use of these third-party services is subject to their own terms and conditions. We are not responsible for the content or privacy practices of third-party services.
            </Text>

            <Text style={styles.sectionTitle}>7. Changes and Termination</Text>
            <Text style={styles.subSectionTitle}>7.1 Changes to Terms</Text>
            <Text style={styles.text}>
              We reserve the right to modify these Terms at any time. The changes will be effective after they are posted on this page. Your continued use of the Platform means you accept the modified Terms.
            </Text>

            <Text style={styles.subSectionTitle}>7.2 Account Termination</Text>
            <Text style={styles.text}>
              We reserve the right to terminate or suspend your account at any time and for any reason, at our sole discretion. You may terminate your account at any time.
            </Text>

            <Text style={styles.sectionTitle}>8. Applicable Law and Dispute Resolution</Text>
            <Text style={styles.text}>
              These Terms are governed by and construed in accordance with the laws of the Republic of Turkey. Any dispute related to these Terms or the use of the Platform will be resolved in the competent courts of the Republic of Turkey.
            </Text>

            <Text style={styles.sectionTitle}>9. Contact</Text>
            <Text style={styles.text}>
              If you have any questions or feedback about these Terms, please contact us at info@aikuaiplatform.com.
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
  subSectionTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
    color: Colors.lightText,
    marginBottom: metrics.margin.sm,
    marginTop: metrics.margin.lg,
  },
  text: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    lineHeight: metrics.fontSize.lg * 1.6,
    marginBottom: metrics.margin.lg,
    textAlign: 'justify',
  },
});

export default TermsOfService; 