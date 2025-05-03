import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Colors} from '../../src/constants/colors';
import metrics from '../../src/constants/aikuMetric';
import AuthService from '../../src/services/AuthService';
import {useAuth} from '../../src/contexts/AuthContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../navigation/AppNavigator';

type SettingsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Settings'>;

interface SettingsProps {
  navigation: SettingsScreenNavigationProp;
}

const Settings: React.FC<SettingsProps> = ({navigation: _navigation}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const {updateUser} = useAuth();

  const languages = [
    {code: 'tr', name: 'Turkish'},
    {code: 'en', name: 'English'},
  ];
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...languages.map(lang => lang.name), 'Cancel'],
          cancelButtonIndex: languages.length,
          title: 'Select Language',
        },
        buttonIndex => {
          if (buttonIndex !== languages.length) {
            setSelectedLanguage(languages[buttonIndex].code);
          }
        },
      );
    } else {
      // Android için Alert.alert kullanabiliriz
      Alert.alert(
        'Select Language',
        '',
        languages.map(lang => ({
          text: lang.name,
          onPress: () => setSelectedLanguage(lang.code),
        })),
        {cancelable: true},
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.logout();
            if (updateUser) {
              updateUser({} as any);
            }
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert(
              'Error',
              'An error occurred while logging out. Please try again.',
            );
          }
        },
      },
    ]);
  };

  const handleFeedback = () => {
    Alert.alert('Feedback', 'Coming soon!');
  };

  const handleContactUs = () => {
    Alert.alert('Contact Us', 'Coming soon!');
  };

  const openSocialMedia = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening link:', err);
      Alert.alert('Error', 'Could not open link');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dark Theme</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{false: Colors.border, true: Colors.primary}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{false: Colors.border, true: Colors.primary}}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={handleLanguageSelect}>
        <Text style={styles.settingText}>Language</Text>
        <View style={styles.languageSelector}>
          <Text style={styles.selectedLanguageText}>
            {languages.find(lang => lang.code === selectedLanguage)?.name}
          </Text>
          <Icon name="arrow-forward-ios" size={16} color={Colors.lightText} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleFeedback}>
        <Icon name="feedback" size={24} color={Colors.primary} />
        <Text style={styles.buttonText}>Send Feedback</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleContactUs}>
        <Icon name="contact-support" size={24} color={Colors.primary} />
        <Text style={styles.buttonText}>Contact Us</Text>
      </TouchableOpacity>

      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Social Media</Text>
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              openSocialMedia('https://www.instagram.com/aikuai_platform/')
            }>
            <FontAwesome name="instagram" size={24} color={Colors.primary} />
            <Text style={styles.socialText}>Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              openSocialMedia('https://www.linkedin.com/company/aiku-ai-platform/')
            }>
            <FontAwesome name="linkedin-square" size={24} color={Colors.primary} />
            <Text style={styles.socialText}>LinkedIn</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color={Colors.lightText} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: metrics.padding.lg,
    paddingBottom: metrics.padding.xl,
  },
  section: {
    marginBottom: metrics.margin.xl,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: metrics.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguageText: {
    fontSize: metrics.fontSize.md,
    color: Colors.primary,
    marginRight: metrics.margin.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.md,
    marginBottom: metrics.margin.md,
  },
  buttonText: {
    marginLeft: metrics.margin.md,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
  },
  socialSection: {
    marginTop: metrics.margin.xl,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: metrics.margin.xl,
  },
  socialButton: {
    alignItems: 'center',
    padding: metrics.padding.md,
  },
  socialText: {
    marginTop: metrics.margin.xs,
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.padding.lg,
    backgroundColor: Colors.error,
    borderRadius: metrics.borderRadius.md,
    marginTop: 'auto',
    marginBottom: metrics.margin.xl,
  },
  logoutText: {
    marginLeft: metrics.margin.md,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    fontWeight: '600',
  },
});

export default Settings; 