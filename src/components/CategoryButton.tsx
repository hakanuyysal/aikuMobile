import React from 'react';
import {TouchableOpacity, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from '../constants/colors';

type CategoryButtonProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

// Kategori ikonları
const iconMap: Record<string, string> = {
  All: 'grid',
  Road: 'bicycle',
  Path: 'roads',
  Mountain: 'image-filter-hdr',
  Helmet: 'help-circle-outline',
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  title,
  isActive = false,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.container,
          isActive ? styles.activeContainer : styles.inactiveContainer,
        ]}>
        <Icon
          name={iconMap[title] || 'circle'}
          size={30}
          color={isActive ? Colors.lightText : Colors.inactive}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 5,
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{skewY: '-5deg'}],
  },
  activeContainer: {
    backgroundColor: Colors.primary,
  },
  inactiveContainer: {
    backgroundColor: Colors.cardBackground,
  },
});

export default CategoryButton;
