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
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
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

const Settings: React.FC<SettingsProps> = ({navigation}) => {
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
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }, 1000);
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
    navigation.navigate('ContactUs');
  };

  const settingsItems = [
    {
      icon: 'dark-mode',
      title: 'Dark Theme',
      subtitle: 'Switch between light and dark mode',
      iconType: 'MaterialIcons',
      gradient: ['#4F46E5', '#7C3AED'],
      rightElement: (
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          trackColor={{false: Colors.border, true: Colors.primary}}
          ios_backgroundColor={Colors.border}
        />
      ),
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      iconType: 'MaterialIcons',
      gradient: ['#EC4899', '#D946EF'],
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{false: Colors.border, true: Colors.primary}}
          ios_backgroundColor={Colors.border}
        />
      ),
    },
    {
      icon: 'language',
      title: 'Language',
      subtitle: 'Choose your preferred language',
      iconType: 'MaterialIcons',
      gradient: ['#F59E0B', '#EF4444'],
      rightElement: (
        <View style={styles.languageSelector}>
          <Text style={styles.selectedLanguageText}>
            {languages.find(lang => lang.code === selectedLanguage)?.name}
          </Text>
          <Icon name="arrow-forward-ios" size={16} color={Colors.primary} />
        </View>
      ),
      onPress: handleLanguageSelect,
    },
    {
      icon: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve our service',
      iconType: 'MaterialIcons',
      gradient: ['#10B981', '#3B82F6'],
      onPress: handleFeedback,
    },
    {
      icon: 'contact-support',
      title: 'Contact Us',
      subtitle: 'Get in touch with our support team',
      iconType: 'MaterialIcons',
      gradient: ['#6366F1', '#8B5CF6'],
      onPress: handleContactUs,
    },
  ];

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
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => console.log('Add new setting')}>
            <Icon name="add-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.menuContainer}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                disabled={!item.onPress}
                activeOpacity={0.7}>
                <LinearGradient
                  colors={item.gradient}
                  style={styles.menuItemIcon}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}>
                  <Icon name={item.icon} size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                {item.rightElement ? (
                  item.rightElement
                ) : (
                  <View style={styles.menuItemArrow}>
                    <Icon
                      name="chevron-right"
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF4B4B', '#FF0000']}
                style={styles.logoutGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <View style={styles.logoutContent}>
                  <Icon
                    name="logout"
                    size={22}
                    color={Colors.lightText}
                    style={styles.logoutIcon}
                  />
                  <Text style={styles.logoutText}>Logout</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
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
  addButton: {
    position: 'absolute',
    right: metrics.margin.lg,
    top: metrics.margin.lg,
    zIndex: 1,
    display: 'none',
  },
  contentContainer: {
    padding: metrics.padding.lg,
    paddingBottom: metrics.padding.xl * 2,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  menuContainer: {
    paddingTop: metrics.padding.lg,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: metrics.borderRadius.lg,
    marginBottom: metrics.margin.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItemIcon: {
    width: metrics.scale(48),
    height: metrics.scale(48),
    borderRadius: metrics.scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: metrics.margin.lg,
  },
  menuItemTitle: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '600',
    marginBottom: metrics.margin.xxs,
  },
  menuItemSubtitle: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.6,
  },
  menuItemArrow: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: metrics.padding.xs,
    borderRadius: metrics.borderRadius.circle,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: metrics.padding.sm,
    paddingVertical: metrics.padding.xs,
    borderRadius: metrics.borderRadius.circle,
  },
  selectedLanguageText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    marginRight: metrics.margin.sm,
  },
  logoutContainer: {
    paddingHorizontal: metrics.padding.xxl * 0.8,
    paddingVertical: metrics.padding.xs,
    marginLeft: -metrics.margin.xl ,
  },
  logoutButton: {
    width: '110%',
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutGradient: {
    borderRadius: metrics.borderRadius.lg,
    overflow: 'hidden',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: metrics.padding.md,
  },
  logoutIcon: {
    marginRight: metrics.margin.sm,
  },
  logoutText: {
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
    color: Colors.lightText,
    letterSpacing: 0.5,
  },
});

export default Settings;
