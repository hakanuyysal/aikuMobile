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

const PersonalDataProtection = ({navigation}: any) => {
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
            <Text style={styles.title}>Personal Data Protection Notice</Text>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.lastUpdated}>Last Updated: March 27, 2024</Text>

            <Text style={styles.sectionTitle}>1. Data Controller</Text>
            <Text style={styles.text}>
              This notice has been prepared in accordance with the Personal Data Protection Law No. 6698 ("PDPL") of Turkey and the General Data Protection Regulation (GDPR) of the European Union, by Aiku AI Platform ("Company") regarding the processing of your personal data. The Company acts as the "Data Controller" as defined in the PDPL and GDPR with respect to the processing of your personal data.
            </Text>

            <Text style={styles.sectionTitle}>2. Categories of Personal Data Processed</Text>
            <Text style={styles.text}>
              The personal data we may process during your use of our Platform may fall into the following categories:{'\n\n'}
              • Identity Information: Name, surname, ID number (only if required for billing information){'\n'}
              • Contact Information: Email address, phone number, address{'\n'}
              • Account Information: Username, password{'\n'}
              • Financial Information: Bank account details, credit card information (only during payment transactions and with necessary security measures){'\n'}
              • Corporate Information: Company name, tax number, tax office (for corporate users){'\n'}
              • Transaction Security Information: IP address, browser information, device information{'\n'}
              • Usage Data: Your activities on the Platform, your preferences{'\n'}
              • Customer Transaction Information: Purchase history, subscription information{'\n'}
              • Visual and Audio Records: Profile picture (if uploaded)
            </Text>

            <Text style={styles.sectionTitle}>3. Purposes of Processing Personal Data</Text>
            <Text style={styles.text}>
              Your personal data is processed for the following purposes:{'\n\n'}
              • Creating and managing your membership account{'\n'}
              • Providing and improving our products and services{'\n'}
              • Processing orders and payment transactions{'\n'}
              • Conducting billing operations{'\n'}
              • Evaluating and responding to your requests and complaints{'\n'}
              • Fulfilling our legal obligations{'\n'}
              • Ensuring the security of the Platform and preventing fraud{'\n'}
              • Managing legal processes and debt collection{'\n'}
              • Conducting marketing and analysis activities (with your explicit consent)
            </Text>

            <Text style={styles.sectionTitle}>4. Legal Basis for Processing Personal Data</Text>
            <Text style={styles.text}>
              Your personal data is processed based on the following legal grounds as specified in Article 5 and 6 of the PDPL and Article 6 of the GDPR:{'\n\n'}
              • Your explicit consent{'\n'}
              • Explicitly provided for by laws{'\n'}
              • Directly related to the establishment or performance of a contract{'\n'}
              • Necessary for compliance with a legal obligation{'\n'}
              • Necessary for the establishment, exercise, or protection of a right{'\n'}
              • Necessary for the legitimate interests pursued by the data controller, provided that it does not harm your fundamental rights and freedoms
            </Text>

            <Text style={styles.sectionTitle}>5. Transfer of Personal Data</Text>
            <Text style={styles.text}>
              Your personal data may be transferred to the following recipient groups in line with the purposes mentioned above and in accordance with Articles 8 and 9 of the PDPL and the relevant provisions of the GDPR:{'\n\n'}
              • Authorized public institutions and organizations as required by legal regulations{'\n'}
              • Business partners, suppliers, and service providers (payment systems, cloud services, hosting services, software services, etc.){'\n'}
              • Legal consultants and consulting firms for conducting legal processes{'\n'}
              • Financial advisors for tax and accounting operations{'\n\n'}
              When transferring your personal data abroad, we comply with the provisions stipulated in Article 9 of the PDPL and the relevant provisions of the GDPR.
            </Text>

            <Text style={styles.sectionTitle}>6. Retention Period of Personal Data</Text>
            <Text style={styles.text}>
              Your personal data is retained for the period required by the processing purposes and legal retention periods. When the reasons requiring the processing of your personal data are eliminated, your personal data will be deleted, destroyed, or anonymized.
            </Text>

            <Text style={styles.sectionTitle}>7. Rights of the Data Subject</Text>
            <Text style={styles.text}>
              In accordance with Article 11 of the PDPL and Article 15-21 of the GDPR, you have the following rights regarding your personal data:{'\n\n'}
              • To learn whether your personal data is being processed{'\n'}
              • To request information if your personal data has been processed{'\n'}
              • To learn the purpose of processing your personal data and whether it is used in accordance with this purpose{'\n'}
              • To know the third parties to whom your personal data is transferred within the country or abroad{'\n'}
              • To request the rectification of incomplete or inaccurate personal data{'\n'}
              • To request the erasure or destruction of your personal data under the conditions stipulated in the legislation{'\n'}
              • To request notification of the operations carried out for rectification, erasure or destruction to third parties to whom your personal data has been transferred{'\n'}
              • To object to a decision based solely on automated processing, including profiling{'\n'}
              • To claim compensation for damages arising from the unlawful processing of your personal data
            </Text>

            <Text style={styles.sectionTitle}>8. How to Exercise Your Rights</Text>
            <Text style={styles.text}>
              You can exercise your rights mentioned above by applying through the following methods:{'\n\n'}
              • By Email: By sending an email from your registered email address to info@aikuaiplatform.com{'\n'}
              • In Writing: By submitting a signed petition to "[Company address]"{'\n'}
              • With Electronic Signature: By sending with a secure electronic signature or mobile signature to our registered electronic mail (REM) address [REM address]{'\n\n'}
              Your application must include information that will identify you, such as name-surname, email address, phone number, address, and explanations regarding your request.{'\n\n'}
              Your application will be concluded free of charge as soon as possible and within 30 days at the latest, depending on the nature of the request. However, if the transaction requires an additional cost, a fee may be charged according to the tariff determined by the Personal Data Protection Board.
            </Text>

            <Text style={styles.sectionTitle}>9. Data Security</Text>
            <Text style={styles.text}>
              Our company takes all technical and administrative measures to ensure the security of your personal data, taking into account technological possibilities and implementation costs. In this context, necessary efforts are made to prevent unlawful processing of personal data, unlawful access to personal data, and to ensure the appropriate level of security for the protection of personal data.
            </Text>

            <Text style={styles.sectionTitle}>10. Changes to this Notice</Text>
            <Text style={styles.text}>
              Any changes to this notice will be published on our platform. The changes will be effective from the date of publication.
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
    fontWeight: '400',
    color: Colors.lightText,
    marginLeft: metrics.margin.md,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: metrics.padding.lg,
  },
  lastUpdated: {
    fontSize: metrics.fontSize.md,
    color: Colors.inactive,
    marginBottom: metrics.margin.lg,
    fontStyle: 'italic',
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

export default PersonalDataProtection; 