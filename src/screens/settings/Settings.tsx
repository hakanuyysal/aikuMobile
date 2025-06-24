import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const {updateUser} = useAuth();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
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

  const handleContactUs = () => {
    navigation.navigate('ContactUs');
  };

  const settingsItems = [
    {
      icon: 'bell-outline',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
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
      icon: 'email-outline',
      title: 'Contact Us',
      subtitle: 'Get in touch with our support team',
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
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={24}
              color={Colors.primary}
            />
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
                  <MaterialCommunityIcons name={item.icon} size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                {item.rightElement ? (
                  item.rightElement
                ) : (
                  <View style={styles.menuItemArrow}>
                    <MaterialCommunityIcons
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
                  <MaterialCommunityIcons
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
