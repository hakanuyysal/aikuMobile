import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('Hata', 'Lütfen mesajınızı yazın.');
      return;
    }

    Alert.alert('Başarılı', 'Mesajınız başarıyla gönderildi.');
    setMessage('');
  };

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

        <View style={styles.content}>
          <View style={styles.messageContainer}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Write your message here..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              textAlignVertical="top"
              numberOfLines={6}
            />
          </View>

          <View style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.7}>
              <View style={styles.submitContent}>
                <IoniconsIcon
                  name="paper-plane"
                  size={24}
                  color="#FFFFFF"
                  style={styles.submitIcon}
                />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.contactInfoContainer}>
            <TouchableOpacity
              style={styles.socialItemContainer}
              onPress={handlePhonePress}
              activeOpacity={0.7}>
              <View style={styles.socialIconContainer}>
                <MaterialIcons name="phone" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.socialText}>+90 850 757 94 27</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialItemContainer}
              onPress={handleEmailPress}
              activeOpacity={0.7}>
              <View style={styles.socialIconContainer}>
                <MaterialIcons name="email" size={24} color={Colors.primary} />
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
                  size={24}
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
                  size={24}
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
  content: {
    padding: metrics.padding.lg,
  },
  messageContainer: {
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    marginTop: metrics.margin.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  messageInput: {
    flex: 1,
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    lineHeight: metrics.fontSize.md * 1.5,
    textAlignVertical: 'top',
    padding: metrics.padding.lg,
  },
  submitButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: metrics.margin.xl,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.md,
    paddingVertical: metrics.padding.md,
    paddingHorizontal: metrics.padding.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    width: '90%',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitIcon: {
    marginRight: metrics.margin.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contactInfoContainer: {
    marginTop: metrics.margin.xl * 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  socialItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: metrics.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  socialIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: metrics.margin.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  socialText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    opacity: 0.9,
  },
});

export default ContactUs;
