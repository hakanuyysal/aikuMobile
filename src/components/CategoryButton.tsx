import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
    <TouchableOpacity onPress={onPress} style={styles.buttonWrapper}>
      <LinearGradient
        colors={['white', '#4966A6']}
        locations={[0, 0.3, 0.4, 0.7]}
        start={{ x: 0, y: 0 }}
        end={{ x: 3, y: 5 }}
        style={[
          styles.container,
          { opacity: isActive ? 1 : 1 }, // İnaktif butonlar için opaklık
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isActive ? Colors.dark : Colors.inactive },
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    marginRight: 12,
  },
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoryButton;