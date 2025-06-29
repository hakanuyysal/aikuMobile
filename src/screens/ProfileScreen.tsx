import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import {useAuth} from '../contexts/AuthContext';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import LinearGradient from 'react-native-linear-gradient';
import {useProfileStore} from '../store/profileStore';
import AuthService from '../services/AuthService';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const {user} = useAuth();
  const {profile, updateProfile} = useProfileStore();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const isFocused = useIsFocused();
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (isFocused) {
        try {
          console.log('Profil ekranı odakta, güncel veri çekiliyor...');
          const latestProfile = await AuthService.getCurrentUser();
          if (latestProfile) {
            updateProfile(latestProfile);
            console.log('Profil verisi güncellendi.');
          }
        } catch (error) {
          console.error('Profil verisi çekilirken hata:', error);
        }
      }
    };

    fetchLatestProfile();
  }, [isFocused, updateProfile]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [metrics.scale(200), metrics.scale(150)],
    extrapolate: 'clamp',
  });

  const menuItems: {
    icon: string;
    title: string;
    subtitle: string;
    iconType: string;
    onPress: () => void;
    gradient: string[];
  }[] = [
    {
      icon: 'account-outline',
      title: 'Personal Details',
      subtitle: 'Your personal information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('UpdateProfile'),
      gradient: ['#4F46E5', '#7C3AED'],
    },
    {
      icon: 'heart-outline',
      title: 'Favorites',
      subtitle: 'Your favorite companies',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('Favorites'),
      gradient: ['#EC4899', '#D946EF'],
    },
    {
      icon: 'crown-outline',
      title: 'Subscription Details',
      subtitle: 'Subscription information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('SubscriptionDetails'),
      gradient: ['#F59E0B', '#EF4444'],
    },
    {
      icon: 'domain',
      title: 'Company Details',
      subtitle: 'Company information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('CompanyDetails'),
      gradient: ['#10B981', '#3B82F6'],
    },
    {
      icon: 'view-grid-outline',
      title: 'Product Details',
      subtitle: 'Product information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('ProductDetails', { id: '' }),
      gradient: ['#6366F1', '#8B5CF6'],
    },
  ];

  const getProfilePhoto = () => {
    // Öncelik sırası: photoURL > profilePhoto
    const url = profile.photoURL || profile.profilePhoto;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `https://api.aikuaiplatform.com${url}`;
    return null;
  };
  const profilePhoto = getProfilePhoto();
  console.log('ProfileScreen profilePhoto:', profilePhoto);

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, {height: headerHeight}]}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {profilePhoto ? (
                <Image
                  source={{uri: profilePhoto}}
                  style={styles.avatar}
                  onError={e => console.log('Profile image load error:', e.nativeEvent)}
                />
              ) : (
                <LinearGradient
                  colors={['#2A2D3E', '#424867']}
                  style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons
                    name="account"
                    size={metrics.scale(32)}
                    color={Colors.lightText}
                  />
                </LinearGradient>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('UpdateProfile')}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={14}
                  color={Colors.background}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userInfoHeader}>
                <View>
                  <Text style={styles.userName}>
                    {profile.firstName && profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : user?.name || 'User Name'}
                  </Text>
                  <Text style={styles.userEmail}>{profile.email || user?.email}</Text>
                  <View style={styles.roleWrapper}>
                    <MaterialCommunityIcons
                      name="crown"
                      size={20}
                      color="#FFD700"
                      style={styles.roleIcon}
                    />
                    <Text style={styles.roleText}>Startup Plan</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => navigation.navigate('Settings')}>
                  <MaterialCommunityIcons
                    name="cog"
                    size={24}
                    color={Colors.lightText}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={16}>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}>
                <LinearGradient
                  colors={item.gradient}
                  style={styles.menuItemIcon}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="#FFF"
                  />
                </LinearGradient>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.menuItemArrow}>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={Colors.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.ScrollView>
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
  header: {
    paddingHorizontal: metrics.padding.lg,
    justifyContent: 'flex-end',
    paddingBottom: metrics.padding.md,
    marginTop: -metrics.padding.xxl * 1.5,
    marginBottom: metrics.margin.sm,
  },
  container: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: metrics.scale(90),
    height: metrics.scale(90),
    borderRadius: metrics.scale(45),
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: metrics.scale(80),
    height: metrics.scale(80),
    borderRadius: metrics.scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: metrics.scale(32),
    height: metrics.scale(32),
    borderRadius: metrics.scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  userInfo: {
    marginLeft: metrics.margin.lg,
    flex: 1,
  },
  userInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  userEmail: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    opacity: 0.7,
    marginTop: metrics.margin.xxs,
  },
  settingsButton: {
    // Ayarlar butonu için stil
  },
  menuContainer: {
    paddingHorizontal: metrics.padding.lg,
    paddingTop: metrics.padding.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.md,
    marginBottom: metrics.margin.md,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: metrics.margin.md,
  },
  menuItemTitle: {
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  menuItemSubtitle: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.7,
    marginTop: 2,
  },
  menuItemArrow: {
    // Ok ikonu için stil
  },
  roleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: metrics.margin.sm,
    alignSelf: 'flex-start',
  },
  roleIcon: {
    marginRight: 4,
  },
  roleText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: metrics.fontSize.xs,
  },
});

export default ProfileScreen;