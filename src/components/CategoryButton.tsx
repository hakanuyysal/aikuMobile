import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';

type CategoryButtonProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  title,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonWrapper}>
      <View style={[styles.container, isActive && styles.activeContainer]}>
        <Text
          style={[
            styles.text,
            { 
              color: isActive ? Colors.lightText : Colors.lightText,
            },
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    // No margin, spacing handled by parent
  },
  container: {
    paddingVertical: 8, // Reduced vertical padding
    paddingHorizontal: 8, // Reduced horizontal padding to fit better
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Subtle background for active state
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoryButton;