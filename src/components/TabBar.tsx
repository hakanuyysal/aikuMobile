import React from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';
import {useRoute} from '@react-navigation/native';
import {TabBarProps} from '../types';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const TabBar: React.FC<TabBarProps> = ({state, descriptors, navigation}) => {
  const route = useRoute();

  // ChatDetail ekranındaysa TabBar'ı gizle
  if (route.name === 'ChatDetail') {
    return null;
  }

  const iconMap: Record<string, string> = {
    Home: 'home-outline',
    Map: 'map-search',
    Cart: 'crown-outline',
    Profile: 'account-outline',
    Message: 'message-badge-outline',
  };

  const labelMap: Record<string, string> = {
    Home: 'Home',
    Map: 'Search',
    Cart: 'Premium',
    Profile: 'Profile',
    Message: 'Messages',
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['rgba(26, 30, 41, 0)', 'rgba(26, 30, 41, 0.95)', '#1A1E29']}
        style={styles.gradient}>
        <View style={styles.container}>
          {state.routes.map((route: any, index: number) => {
            const {options} = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              if (!isFocused) {
                navigation.navigate(route.name, {merge: true});
              }
            };

            return (
              <View key={index} style={styles.tabContainer}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? {selected: true} : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  style={[styles.tab]}>
                  {isFocused ? (
                    <View style={styles.activeIconContainer}>
                      <LinearGradient
                        colors={[Colors.primary, Colors.secondary]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.activeGradient}>
                        <Icon
                          name={iconMap[route.name] || 'circle'}
                          color={Colors.lightText}
                          size={24}
                        />
                      </LinearGradient>
                      <Text style={styles.activeLabel}>{labelMap[route.name]}</Text>
                    </View>
                  ) : (
                    <View style={styles.inactiveIconContainer}>
                      <Icon
                        name={iconMap[route.name] || 'circle'}
                        color={Colors.inactive}
                        size={24}
                      />
                      <Text style={styles.label}>{labelMap[route.name]}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: width,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  label: {
    color: Colors.inactive,
    fontSize: 12,
    marginTop: 4,
  },
});

export default TabBar;