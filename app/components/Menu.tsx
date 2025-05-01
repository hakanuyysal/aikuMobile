import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../src/constants/colors';
import metrics from '../../src/constants/aikuMetric';

interface MenuProps {
  user: {
    name: string;
    avatar?: string;
  };
  onClose: () => void;
}

const MENU_WIDTH = metrics.getWidthPercentage(80); // Ekranın %80'i kadar genişlik

const Menu: React.FC<MenuProps> = ({user, onClose}) => {
  const slideAnim = useMemo(() => new Animated.Value(-MENU_WIDTH), []);
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
        toValue: -MENU_WIDTH,
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
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Icon name="close" size={metrics.scale(24)} color={Colors.primary} />
              </TouchableOpacity>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image source={{uri: user.avatar}} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="person" size={metrics.scale(40)} color={Colors.lightText} />
                    </View>
                  )}
                </View>
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeText}>Welcome</Text>
                  <Text style={styles.userName}>{user.name}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.visitProfile}>
                <Text style={styles.visitProfileText}>Visit your profile</Text>
                <Icon name="chevron-right" size={metrics.scale(24)} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => console.log(`${item.title} pressed`)}>
                  <Icon name={item.icon} size={metrics.scale(24)} color={Colors.primary} />
                  <Text style={styles.menuItemText}>{item.title}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: Colors.background,
    borderTopRightRadius: metrics.borderRadius.lg,
    borderBottomRightRadius: metrics.borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    padding: metrics.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    position: 'absolute',
    top: metrics.padding.md,
    right: metrics.padding.md,
    zIndex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.sm,
    marginTop: metrics.margin.xl,
  },
  avatarContainer: {
    marginRight: metrics.margin.sm,
  },
  avatar: {
    width: metrics.scale(60),
    height: metrics.scale(60),
    borderRadius: metrics.scale(30),
  },
  avatarPlaceholder: {
    width: metrics.scale(60),
    height: metrics.scale(60),
    borderRadius: metrics.scale(30),
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
  },
  userName: {
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.lightText,
  },
  visitProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: metrics.padding.xs,
  },
  visitProfileText: {
    fontSize: metrics.fontSize.md,
    color: Colors.primary,
  },
  menuItems: {
    paddingTop: metrics.padding.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemText: {
    marginLeft: metrics.margin.sm,
    fontSize: metrics.fontSize.md,
    color: Colors.lightText,
  },
});

export default Menu; 