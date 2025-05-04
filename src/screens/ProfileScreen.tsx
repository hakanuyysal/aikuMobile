import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
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

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const {user} = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const menuItems = [
    {
      icon: 'account-outline',
      title: 'Personal Details',
      subtitle: 'Name, email and profile information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('UpdateProfile'),
    },
    {
      icon: 'favorite-outline',
      title: 'Favorites',
      subtitle: 'Your favorite AI solutions',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      icon: 'crown-outline',
      title: 'Subscription Details',
      subtitle: 'Plan and subscription information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('SubscriptionDetails'),
    },
    {
      icon: 'domain',
      title: 'Company Details',
      subtitle: 'Your company information',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('CompanyDetails'),
    },
    {
      icon: 'view-grid-outline',
      title: 'Product Details',
      subtitle: 'AI product information',
      iconType: 'MaterialCommunityIcons',
      onPress: () => navigation.navigate('ProductDetails'),
    },
    {
      icon: 'settings',
      title: 'Settings',
      subtitle: 'App preferences',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{uri: user.photoURL}} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="person" size={metrics.scale(32)} color={Colors.lightText} />
                </View>
              )}
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('UpdateProfile')}>
                <Icon name="edit" size={14} color={Colors.background} />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Murat Tanrıyakul'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleContainer}>
                <MaterialCommunityIcons name="crown" size={16} color={Colors.primary} />
                <Text style={styles.roleText}>Startup Plan</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}>
              <View style={styles.menuItemIcon}>
                {item.iconType === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={Colors.primary}
                  />
                ) : (
                  <Icon
                    name={item.icon}
                    size={24}
                    color={Colors.primary}
                  />
                )}
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: metrics.padding.lg,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: metrics.scale(80),
    height: metrics.scale(80),
    borderRadius: metrics.scale(40),
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: metrics.scale(80),
    height: metrics.scale(80),
    borderRadius: metrics.scale(40),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: metrics.scale(28),
    height: metrics.scale(28),
    borderRadius: metrics.scale(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userInfo: {
    flex: 1,
    marginLeft: metrics.margin.lg,
  },
  userName: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.xxs,
  },
  userEmail: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    opacity: 0.7,
    marginBottom: metrics.margin.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.xs,
    borderRadius: metrics.borderRadius.circle,
    alignSelf: 'flex-start',
    gap: metrics.margin.xs,
  },
  roleText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '20',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width: metrics.scale(48),
    height: metrics.scale(48),
    borderRadius: metrics.scale(24),
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: metrics.margin.lg,
  },
  menuItemTitle: {
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
    fontWeight: '600',
    marginBottom: metrics.margin.xxs,
  },
  menuItemSubtitle: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.6,
  },
});

export default ProfileScreen;