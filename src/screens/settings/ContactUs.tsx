import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

const ContactUs = ({navigation}: Props) => {
  const handleInstagramPress = () => {
    Linking.openURL('https://www.instagram.com/aikuai_platform/');
  };

  const handleLinkedinPress = () => {
    Linking.openURL('https://www.linkedin.com/company/aiku-ai-platform/');
  };

  const handleEmailPress = async () => {
    try {
      const url = 'mailto:info@aikuaiplatform.com';
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Mail app can not started');
      }
    } catch (error) {
      Alert.alert('Error', 'Mail app can not started');
    }
  };

  const handlePhonePress = async () => {
    try {
      const phoneNumber = Platform.select({
        ios: 'telprompt:+908507579427',
        android: 'tel:+908507579427',
      });

      if (phoneNumber) {
        const canOpen = await Linking.canOpenURL(phoneNumber);

        if (canOpen) {
          await Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Error', 'Telephone app cannot started');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Telephone app cannot started');
    }
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <IoniconsIcon
              name="chevron-back"
              size={24}
              color={Colors.lightText}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
        </View>

        <View style={styles.infoContent}>
          <View style={styles.contactInfoContainer}>
            <TouchableOpacity
              style={styles.socialItemContainer}
              onPress={handlePhonePress}
              activeOpacity={0.7}>
              <View style={styles.socialIconContainer}>
                <MaterialIcons name="phone" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.socialText}>+90 850 757 94 27</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialItemContainer}
              onPress={handleEmailPress}
              activeOpacity={0.7}>
              <View style={styles.socialIconContainer}>
                <MaterialIcons name="email" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.socialText}>info@aikuaiplatform.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialItemContainer}
              onPress={handleLinkedinPress}
              activeOpacity={0.7}>
              <View style={styles.socialIconContainer}>
                <FontAwesome
                  name="linkedin-square"
                  size={28}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.socialText}>aiku-ai-platform</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialItemContainer, styles.noBorder]}
              onPress={handleInstagramPress}
              activeOpacity={0.7}>
              <View style={styles.socialIconContainer}>
                <FontAwesome
                  name="instagram"
                  size={28}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.socialText}>@aikuai_platform</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: metrics.padding.md,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: metrics.margin.lg,
    top: metrics.margin.md,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl * 1.1,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: -metrics.margin.sm,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: metrics.padding.xl,
  },
  contactInfoContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: metrics.borderRadius.xl,
    padding: metrics.padding.xl * 1.2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  socialItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: metrics.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.13)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  socialIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: metrics.margin.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  socialText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg * 1.05,
    opacity: 0.95,
    fontWeight: '500',
  },
});

export default ContactUs;
