import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';
import {useRoute} from '@react-navigation/native';
import {TabBarProps} from '../types';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import metrics from '../constants/aikuMetric';

const TabBar: React.FC<TabBarProps> = ({state, descriptors, navigation}) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();

  if (route.name === 'ChatDetail') {
    return null;
  }

  const iconMap: Record<string, string> = {
    Home: 'home-outline',
    Map: 'layers-search-outline',
    Cart: 'crown-outline',
    Profile: 'account-outline',
    Message: 'message-cog-outline',
  };

  const labelMap: Record<string, string> = {
    Home: 'Home',
    Map: 'Search',
    Cart: 'Premium',
    Profile: 'Profile',
    Message: 'Messages',
  };

  return (
    <View style={[styles.outerContainer, {paddingBottom: insets.bottom}]}>
      <LinearGradient
        colors={[
          'rgba(26, 30, 41, 0.03)',
          'rgba(26, 30, 41, 1)',
          'rgba(26, 30, 41, 1)',
          '#1A1E29',
        ]}
        locations={[0, 0.5, 0.8, 1]}
        style={[
          styles.gradient,
          {
            marginBottom: metrics.tabBar.marginBottom,
            paddingTop: metrics.spacing.md * -2,
          },
        ]}>
        <View
          style={[
            styles.container,
            {paddingBottom: metrics.tabBar.paddingBottom},
          ]}>
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
                          size={metrics.tabBar.iconSize}
                        />
                      </LinearGradient>
                      <Text style={styles.activeLabel}>
                        {labelMap[route.name]}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.inactiveIconContainer}>
                      <Icon
                        name={iconMap[route.name] || 'circle'}
                        color={Colors.inactive}
                        size={metrics.tabBar.iconSize}
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
    width: metrics.WIDTH,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: metrics.tabBar.paddingHorizontal,
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
    padding: metrics.spacing.xs,
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
    width: metrics.tabBar.activeIconSize,
    height: metrics.tabBar.activeIconSize,
    borderRadius: metrics.tabBar.activeIconSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: metrics.spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  activeLabel: {
    color: Colors.primary,
    fontSize: metrics.fontSize.sm,
    fontWeight: '600',
    marginTop: metrics.spacing.xs,
  },
  label: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
    marginTop: metrics.spacing.xs,
  },
});

export default TabBar;
