// import React from 'react';
// import { TouchableOpacity, StyleSheet, View } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { Colors } from '../constants/colors';

// type SearchButtonProps = {
//   onPress: () => void;
// };

// const SearchButton: React.FC<SearchButtonProps> = ({ onPress }) => {
//   return (
//     <TouchableOpacity style={styles.outerContainer} onPress={onPress}>
//       <View style={styles.container}>
//         <Icon 
//           name="search" 
//           size={24} 
//           color={Colors.lightText} 
//           style={styles.icon}
//         />
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   outerContainer: {
//     width: 48,
//     height: 48,
//   },
//   container: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//     backgroundColor: Colors.searchBackground,
//     justifyContent: 'center',
//     alignItems: 'center',
//     transform: [{ skewX: '-5deg' }],
//   },
//   icon: {
//     transform: [{ skewX: '5deg' }], // Ters skew uygulayarak ikonun düz görünmesini sağlıyoruz
//   }
// });

// export default SearchButton; 