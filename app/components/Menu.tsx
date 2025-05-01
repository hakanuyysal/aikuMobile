import React, {useEffect, useMemo} from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../src/constants/colors';
import metrics from '../../src/constants/aikuMetric';
import AuthService from '../../src/services/AuthService';
import {useAuth} from '../../src/contexts/AuthContext';

interface MenuProps {
  user: {
    name: string;
    avatar?: string;
    email?: string;
    role?: string;
  };
  onClose: () => void;
}

const MENU_WIDTH = metrics.getWidthPercentage(70);

const Menu: React.FC<MenuProps> = ({user, onClose}) => {
  const {updateUser} = useAuth();
  const slideAnim = useMemo(() => new Animated.Value(MENU_WIDTH), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MENU_WIDTH,
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

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              updateUser({} as any);
              onClose();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          },
        },
      ],
    );
  };

  const handleMenuItemPress = (title: string) => {
    if (title === 'Logout') {
      handleLogout();
    } else {
      console.log(`${title} pressed`);
    }
  };

  const menuItems = [
    {title: 'Personal Details', icon: 'person'},
    {title: 'Favorites', icon: 'favorite'},
    {title: 'Subscription Details', icon: 'card-membership'},
    {title: 'Company Details', icon: 'business'},
    {title: 'Product Details', icon: 'inventory'},
    {title: 'Investment Details', icon: 'attach-money'},
    {title: 'Settings', icon: 'settings'},
    {title: 'Logout', icon: 'logout'},
  ];

  return (
    <TouchableWithoutFeedback onPress={handleClose}>
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{translateX: slideAnim}],
              },
            ]}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}>
                <Icon
                  name="close"
                  size={metrics.scale(24)}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image source={{uri: user.avatar}} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon
                        name="person"
                        size={metrics.scale(40)}
                        color={Colors.lightText}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeText}>Welcome</Text>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user.email && (
                    <Text style={styles.userEmail}>{user.email}</Text>
                  )}
                  {user.role && (
                    <Text style={styles.userRole}>{user.role}</Text>
                  )}
                </View>
              </View>
            </View>

            <ScrollView style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    item.title === 'Logout' && styles.logoutItem,
                  ]}
                  onPress={() => handleMenuItemPress(item.title)}>
                  <Icon
                    name={item.icon}
                    size={metrics.scale(24)}
                    color={item.title === 'Logout' ? Colors.error : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      item.title === 'Logout' && styles.logoutText,
                    ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
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
  container: {
    position: 'absolute',
    top: metrics.statusBarHeight + metrics.margin.md,
    right: 0,
    bottom: metrics.margin.md,
    width: MENU_WIDTH,
    backgroundColor: Colors.background,
    borderTopLeftRadius: metrics.borderRadius.xl,
    borderBottomLeftRadius: metrics.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    padding: metrics.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  closeButton: {
    position: 'absolute',
    top: metrics.padding.sm,
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
    marginTop: metrics.margin.lg,
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
    fontSize: metrics.fontSize.xxl,
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
  userRole: {
    fontSize: metrics.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: metrics.padding.sm,
    paddingVertical: metrics.spacing.xs,
    borderRadius: metrics.borderRadius.sm,
    alignSelf: 'flex-start',
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
});

export default Menu;
