import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import {useAuth} from '../contexts/AuthContext';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import LinearGradient from 'react-native-linear-gradient';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const {user} = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [metrics.scale(200), metrics.scale(150)],
    extrapolate: 'clamp',
  });

  const menuItems = [
    {
      icon: 'account-outline',
      title: 'Personal Details',
      subtitle: 'Your personal information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('UpdateProfile'),
      gradient: ['#4F46E5', '#7C3AED'],
    },
    {
      icon: 'favorite-outline',
      title: 'Favorites',
      subtitle: 'Your favorite companies',
      iconType: 'MaterialIcons',
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
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('CompanyDetails'),
      gradient: ['#10B981', '#3B82F6'],
    },
    {
      icon: 'view-grid-outline',
      title: 'Product Details',
      subtitle: 'Product information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('ProductDetails'),
      gradient: ['#6366F1', '#8B5CF6'],
    },
  ];

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
              {user?.photoURL ? (
                <Image source={{uri: user.photoURL}} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={['#2A2D3E', '#424867']}
                  style={styles.avatarPlaceholder}>
                  <Icon
                    name="person"
                    size={metrics.scale(32)}
                    color={Colors.lightText}
                  />
                </LinearGradient>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('UpdateProfile')}>
                <Icon name="edit" size={14} color={Colors.background} />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userInfoHeader}>
                <View>
                  <Text style={styles.userName}>
                    {user?.name || 'Murat Tanrıyakul'}
                  </Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
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
                  <Icon name="settings" size={24} color={Colors.lightText} />
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
                  {item.iconType === 'MaterialCommunityIcons' ? (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color="#FFF"
                    />
                  ) : (
                    <Icon name={item.icon} size={24} color="#FFF" />
                  )}
                </LinearGradient>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.menuItemArrow}>
                  <Icon name="chevron-right" size={24} color={Colors.primary} />
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
    alignItems: 'flex-start',
    width: '100%',
  },
  settingsButton: {
    padding: metrics.padding.xs,
    borderRadius: metrics.borderRadius.circle,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  userName: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.xxs,
  },
  userEmail: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    opacity: 0.7,
    marginBottom: metrics.margin.sm,
  },
  roleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: metrics.margin.xs,
    backgroundColor: Colors.background,
    paddingHorizontal: metrics.padding.xs,
    paddingVertical: metrics.padding.xxs,
    borderRadius: metrics.borderRadius.circle,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
  },
  roleIcon: {
    marginRight: 6,
    fontWeight: '900',
  },
  roleText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    fontWeight: '800',
  },
  menuContainer: {
    paddingHorizontal: metrics.padding.lg,
    paddingTop: metrics.padding.lg,
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
});

export default ProfileScreen;
