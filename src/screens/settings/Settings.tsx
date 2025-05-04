import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import AuthService from '../../services/AuthService';
import {useAuth} from '../../contexts/AuthContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../App';

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Settings'
>;

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
    _navigation.navigate('ContactUs');
  };

  return (
    <LinearGradient
      colors={[Colors.background, Colors.cardBackground]}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="dark-mode" size={24} color={Colors.primary} />
              <Text style={styles.settingText}>Dark Theme</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{false: Colors.border, true: Colors.primary}}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={24} color={Colors.primary} />
              <Text style={styles.settingText}>Enable Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{false: Colors.border, true: Colors.primary}}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLanguageSelect}>
            <View style={styles.settingLeft}>
              <Icon name="language" size={24} color={Colors.primary} />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={styles.languageSelector}>
              <Text style={styles.selectedLanguageText}>
                {languages.find(lang => lang.code === selectedLanguage)?.name}
              </Text>
              <Icon name="arrow-forward-ios" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.settingItem} onPress={handleFeedback}>
            <View style={styles.settingLeft}>
              <Icon name="feedback" size={24} color={Colors.primary} />
              <Text style={styles.settingText}>Send Feedback</Text>
            </View>
            <Icon name="chevron-right" size={24} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleContactUs}>
            <View style={styles.settingLeft}>
              <Icon name="contact-support" size={24} color={Colors.primary} />
              <Text style={styles.settingText}>Contact Us</Text>
            </View>
            <Icon name="chevron-right" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color={Colors.background} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: metrics.padding.lg,
    paddingBottom: metrics.padding.xl,
  },
  header: {
    marginBottom: metrics.margin.xl,
    alignItems: 'center',
  },
  headerTitle: {
    display: 'none',
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.lg,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginLeft: metrics.margin.md,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: metrics.padding.sm,
    paddingHorizontal: metrics.padding.lg,
    backgroundColor: Colors.error,
    borderRadius: metrics.borderRadius.md,
    marginTop: metrics.margin.xs,
    alignSelf: 'center',
    minWidth: 120,
  },
  logoutText: {
    marginLeft: metrics.margin.sm,
    fontSize: metrics.fontSize.md,
    color: Colors.background,
    fontWeight: '600',
  },
});

export default Settings;
