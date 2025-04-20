import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';

type CategoryButtonProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  title,
  isActive = false,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.outerContainer} onPress={onPress}>
      <View style={[
        styles.container,
        isActive ? styles.activeContainer : styles.inactiveContainer,
      ]}>
        <Text
          style={[
            styles.text,
            isActive ? styles.activeText : styles.inactiveText,
          ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginRight: 8,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    transform: [{ skewX: '-5deg' }],
  },
  activeContainer: {
    backgroundColor: Colors.primary,
  },
  inactiveContainer: {
    backgroundColor: Colors.cardBackground,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    transform: [{ skewX: '5deg' }],
  },
  activeText: {
    color: Colors.lightText,
  },
  inactiveText: {
    color: Colors.inactive,
  },
});

export default CategoryButton; 