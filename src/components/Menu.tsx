import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import {useProfileStore} from '../store/profileStore';

interface MenuProps {
  user: {
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    email?: string;
    role?: string;
  } | null;
  onClose: () => void;
  mainViewRef: Animated.AnimatedValue;
  scaleRef: Animated.AnimatedValue;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.8;
const SCALE = 0.9;

const Menu: React.FC<MenuProps> = ({user, onClose, mainViewRef, scaleRef}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {profile} = useProfileStore();
  const slideAnim = useMemo(() => mainViewRef, [mainViewRef]);
  const scaleAnim = useMemo(() => scaleRef, [scaleRef]);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const menuSlideAnim = useMemo(() => new Animated.Value(MENU_WIDTH), []);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH * 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: SCALE,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, menuSlideAnim, scaleAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: MENU_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleMenuItemPress = (title: string) => {
    if (title === 'Resources') {
      setExpandedSection(expandedSection === 'Resources' ? null : 'Resources');
      return;
    }

    handleClose();
    setTimeout(() => {
      if (title === 'Personal Details') {
        navigation.navigate({ name: 'UpdateProfile', params: undefined });
      } else if (title === 'Subscription Details') {
        navigation.navigate({ name: 'SubscriptionDetails', params: undefined });
      } else if (title === 'Favorites') {
        navigation.navigate({ name: 'Favorites', params: undefined });
      } else if (title === 'Company Details') {
        navigation.navigate({ name: 'CompanyDetails', params: undefined });
      } else if (title === 'Product Details') {
        navigation.navigate({ name: 'ProductDetails', params: { id: '' } });
      } else if (title === 'Investment Details') {
        navigation.navigate({ name: 'InvestmentDetails', params: undefined });
      } else if (title === 'Settings') {
        navigation.navigate({ name: 'Settings', params: undefined });
      } else if (title === 'Talent Pool') {
        navigation.navigate({ name: 'TalentPool', params: undefined });
      } else if (title === 'Investment Opportunities') {
        navigation.navigate({ name: 'InvestmentDetails', params: undefined });
      } else if (title === 'How It Works') {
        navigation.navigate({ name: 'HowItWorks', params: undefined });
      } else {
        console.log(`${title} pressed`);
      }
    }, 300);
  };

  const menuItems = [
    {title: 'Personal Details', icon: 'account-outline'},
    {title: 'Favorites', icon: 'heart-outline'},
    {title: 'Subscription Details', icon: 'crown-outline'},
    {title: 'Company Details', icon: 'domain'},
    {title: 'Product Details', icon: 'view-grid-outline'},
    {title: 'Investment Details', icon: 'cash-multiple'},
    {title: 'Resources', icon: 'folder-outline', isSection: true},
    {title: 'Settings', icon: 'cog'},
  ];

  const resourceItems = [
    {title: 'Talent Pool', icon: 'account-group-outline'},
    {title: 'Investment Opportunities', icon: 'trending-up'},
    {title: 'How It Works', icon: 'help-circle-outline'},
  ];

  const openSocialMedia = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening link:', err);
      Alert.alert('Error', 'Could not open link');
    });
  };

  const getProfilePhoto = () => {
    if (profile.photoURL) {
      if (profile.photoURL.startsWith('http')) {
        return profile.photoURL;
      }
      return `https://api.aikuaiplatform.com${profile.photoURL}`;
    }
    return null;
  };
  const profilePhoto = getProfilePhoto();

  return (
    <TouchableWithoutFeedback onPress={handleClose}>
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <TouchableWithoutFeedback>
          <Animated.View 
            style={[
              styles.menuContent,
              {
                transform: [{translateX: menuSlideAnim}],
              },
            ]}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={metrics.scale(24)}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  {profilePhoto ? (
                    <Image source={{uri: profilePhoto}} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <MaterialCommunityIcons
                        name="account"
                        size={metrics.scale(40)}
                        color={Colors.lightText}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeText}>Welcome</Text>
                  <Text style={styles.userName}>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'Murat Tanrıyakul'}
                  </Text>
                  {user?.email && (
                    <Text style={styles.userEmail}>{user.email}</Text>
                  )}
                  <View style={styles.planContainer}>
                    <MaterialCommunityIcons name="crown-outline" size={metrics.scale(18)} color={Colors.primary} />
                    <Text style={styles.planText}>Startup Plan</Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      item.title === 'Resources' && styles.sectionHeader,
                      item.title === 'Settings' && styles.settingsItem
                    ]}
                    onPress={() => handleMenuItemPress(item.title)}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={metrics.scale(24)}
                      color={Colors.primary}
                    />
                    <Text style={[
                      styles.menuItemText,
                      item.title === 'Resources' && styles.sectionHeaderText
                    ]}>{item.title}</Text>
                    {item.title === 'Resources' && (
                      <MaterialCommunityIcons
                        name={expandedSection === 'Resources' ? 'chevron-up' : 'chevron-down'}
                        size={metrics.scale(24)}
                        color={Colors.primary}
                        style={styles.expandIcon}
                      />
                    )}
                  </TouchableOpacity>
                  
                  {item.title === 'Resources' && expandedSection === 'Resources' && (
                    <View style={styles.subMenuContainer}>
                      {resourceItems.map((subItem, subIndex) => (
                        <TouchableOpacity
                          key={subIndex}
                          style={styles.subMenuItem}
                          onPress={() => handleMenuItemPress(subItem.title)}>
                          <MaterialCommunityIcons
                            name={subItem.icon}
                            size={metrics.scale(20)}
                            color={Colors.primary}
                          />
                          <Text style={styles.subMenuItemText}>{subItem.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </React.Fragment>
              ))}

              <View style={styles.socialSection}>
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() =>
                      openSocialMedia('https://www.instagram.com/aikuai_platform/')
                    }>
                    <FontAwesome name="instagram" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() =>
                      openSocialMedia('https://www.linkedin.com/company/aiku-ai-platform/')
                    }>
                    <FontAwesome name="linkedin-square" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.brandText}>Aiku</Text>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 2,
  },
  menuContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    paddingBottom: metrics.padding.xl,
  },
  header: {
    padding: metrics.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'transparent',
    paddingTop: metrics.padding.xxl * 1.5,
  },
  closeButton: {
    position: 'absolute',
    top: metrics.padding.xxl * 2,
    right: metrics.padding.md,
    zIndex: 1,
    padding: metrics.padding.xs,
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.circle,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
    marginTop: metrics.margin.xxl,
  },
  avatarContainer: {
    marginRight: metrics.margin.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  avatar: {
    width: metrics.scale(70),
    height: metrics.scale(70),
    borderRadius: metrics.scale(35),
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: metrics.scale(70),
    height: metrics.scale(70),
    borderRadius: metrics.scale(35),
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    opacity: 0.7,
    marginBottom: metrics.spacing.xs,
  },
  userName: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.xs,
  },
  userEmail: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.7,
    marginBottom: metrics.margin.xs,
  },
  planContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.margin.xs,
  },
  planText: {
    fontSize: metrics.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  menuItems: {
    paddingTop: metrics.padding.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}50`,
    backgroundColor: Colors.background,
  },
  menuItemText: {
    marginLeft: metrics.margin.md,
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '500',
  },
  logoutItem: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: `${Colors.border}50`,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '600',
  },
  socialSection: {
    marginTop: metrics.margin.xl,
    alignItems: 'center',
    paddingBottom: metrics.padding.xl,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: metrics.margin.xl,
    marginBottom: metrics.margin.md,
  },
  socialButton: {
    padding: metrics.padding.sm,
  },
  brandText: {
    fontSize: metrics.fontSize.xl,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: metrics.margin.xs,
  },
  versionText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.7,
  },
  sectionHeader: {
    backgroundColor: '#1A1E29',
  },
  sectionHeaderText: {
    fontWeight: '600',
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    backgroundColor: Colors.background,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.md,
    paddingLeft: metrics.padding.xl * 2,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}30`,
  },
  subMenuItemText: {
    marginLeft: metrics.margin.md,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
  },
  settingsItem: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: `${Colors.border}50`,
  },
});

export default Menu;
