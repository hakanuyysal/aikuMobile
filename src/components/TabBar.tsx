import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const TabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const iconMap: Record<string, string> = {
    Home: 'bicycle',
    Map: 'map',
    Cart: 'cart',
    Profile: 'account',
    Orders: 'clipboard-text',
  };

  return (
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
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[
              styles.tab,
              isFocused && styles.activeTab
            ]}>
            <Icon
              name={iconMap[route.name] || 'circle'}
              color={isFocused ? Colors.lightText : Colors.inactive}
              size={24}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.tabBarBackground,
    height: 60,
    paddingBottom: 8,
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    margin: 5,
    borderRadius: 15,
    transform: [{ skewX: '-5deg' }],
  }
});

export default TabBar; 