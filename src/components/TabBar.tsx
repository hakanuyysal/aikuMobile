import React from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';
import {useRoute} from '@react-navigation/native';
import {TabBarProps} from '../types';

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
      <View style={styles.topShadow} />
      <View style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
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
                style={[styles.tab, isFocused && styles.activeTab]}>
                {isFocused ? (
                  <View style={styles.activeIconContainer}>
                    <Icon
                      name={iconMap[route.name] || 'circle'}
                      color={Colors.lightText}
                      size={25}
                    />
                  </View>
                ) : (
                  <>
                    <Icon
                      name={iconMap[route.name] || 'circle'}
                      color={Colors.inactive}
                      size={25}
                    />
                    <Text style={styles.label}>{labelMap[route.name]}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#1A1E29', // Changed to fully opaque color
    paddingTop: 10,
    paddingBottom: 15,
    width: width,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  topShadow: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#1A1E29', // Match outerContainer to prevent transparency
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    position: 'relative',
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: -20,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  activeIconContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{skewX: '8deg'}],
  },
  label: {
    color: Colors.inactive,
    fontSize: 12,
    marginTop: 4,
  },
});

export default TabBar;