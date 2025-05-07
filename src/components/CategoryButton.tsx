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
              color: isActive ? Colors.lightText : 'rgba(255,255,255,0.7)',
              fontWeight: isActive ? '700' : '600',
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
    minWidth: 100,
  },
  container: {
    paddingVertical: 8, // Reduced vertical padding
    paddingHorizontal: 12, // More horizontal padding
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeContainer: {
    backgroundColor: 'rgba(59, 130, 247, 0.2)', // Daha belirgin mavi tonu
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 247, 0.3)',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoryButton;