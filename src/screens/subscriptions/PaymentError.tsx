import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PaymentError = () => {
  const navigation = useNavigation<RootNavigationProp>();

  const handleTryAgain = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Icon name="close-circle" size={100} color="#FF4444" />
          <Text style={styles.title}>Payment Failed!</Text>
          <Text style={styles.subtitle}>
            An error occurred during the payment process.{'\n'}
            Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleTryAgain}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: metrics.padding.xl,
  },
  title: {
    fontSize: metrics.fontSize.xxxl,
    color: Colors.lightText,
    marginTop: metrics.margin.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: metrics.fontSize.lg,
    color: Colors.inactive,
    marginTop: metrics.margin.lg,
    textAlign: 'center',
    lineHeight: metrics.fontSize.lg * 1.5,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: metrics.padding.xxl,
    paddingVertical: metrics.padding.lg,
    borderRadius: metrics.borderRadius.lg,
    marginTop: metrics.margin.xxl,
    width: '80%',
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PaymentError; 