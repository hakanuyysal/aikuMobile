import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const { width } = Dimensions.get('window');

const TabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const iconMap: Record<string, string> = {
    Home: 'bicycle',
    Map: 'map-marker-outline',
    Cart: 'cart-outline',
    Profile: 'account-outline',
    Orders: 'clipboard-outline',
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.topShadow} />
      <View style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          return (
            <View key={index} style={styles.tabContainer}>
              {isFocused && <View style={styles.activeShadow} />}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={[
                  styles.tab,
                  isFocused && styles.activeTab
                ]}>
                {isFocused ? (
                  <View style={styles.activeIconContainer}>
                    <Icon
                      name={iconMap[route.name] || 'circle'}
                      color={Colors.lightText}
                      size={28}
                    />
                  </View>
                ) : (
                  <Icon
                    name={iconMap[route.name] || 'circle'}
                    color={Colors.inactive}
                    size={24}
                  />
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
    backgroundColor: 'rgba(26, 30, 41, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    paddingBottom: 25,
    width: width,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    transform: [{ perspective: 1000 }, { skewY: '-2deg' }],
  },
  topShadow: {
    position: 'absolute',
    top: -15,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
    transform: [{ skewY: '2deg' }],
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    position: 'relative',
  },
  activeShadow: {
    position: 'absolute',
    top: -20,
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'transparent',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 30,
    transform: [{ skewX: '-15deg' }],
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    marginTop: -25,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      { translateY: -5 }, 
      { scale: 1.1 }, 
      { skewX: '-15deg' },
    ],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 15,
    overflow: 'hidden',
  },
  activeIconContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ skewX: '15deg' }],
  }
});

export default TabBar; 