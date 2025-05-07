// import React, { useState } from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// import Modal from 'react-native-modal';

// export default function App() {
//   const [isTooltipVisible, setIsTooltipVisible] = useState(true);

//   const closeTooltip = () => {
//     setIsTooltipVisible(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Ana Sayfa</Text>

//       {/* Tooltip */}
//       <Modal
//         isVisible={isTooltipVisible}
//         animationIn="fadeIn"
//         animationOut="fadeOut"
//         backdropOpacity={0.3}
//         onBackdropPress={closeTooltip}
//       >
//         <View style={styles.tooltip}>
//           <Image
//             source={require('./assets/Tooltipaihands.png')}
//             style={styles.image}
//           />
//           <Text style={styles.text}>
//             Bu, robotun eli. Size yardımcı olmak için burada!
//           </Text>
//           <TouchableOpacity style={styles.button} onPress={closeTooltip}>
//             <Text style={styles.buttonText}>Tamam</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   tooltip: {
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   image: {
//     width: 80,
//     height: 80,
//     marginBottom: 10,
//   },
//   text: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });