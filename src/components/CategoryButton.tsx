import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
      <View style={styles.container}>
        <Text
          style={[
            styles.text,
            { 
              color:  Colors.lightText ,
              fontWeight: isActive ? '700' : '600',
            },
            
          ]}
        >
          {title}
        </Text>
         <MaterialCommunityIcons
                            name="chevron-double-down"
                            size={18}
                            color={Colors.lightText}
                            style={styles.divider} />
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
    marginBottom: 13,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
    divider: {
    marginTop: 5,
    marginHorizontal: 8,
    marginLeft: -3,
    opacity: 0.7,
  },
});

export default CategoryButton;