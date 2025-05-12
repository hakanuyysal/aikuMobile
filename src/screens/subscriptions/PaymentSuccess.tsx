import React, {useEffect} from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PaymentSuccess = () => {
  const navigation = useNavigation<RootNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Icon name="checkmark-circle" size={100} color="#4CAF50" />
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Your subscription has been activated successfully.{'\n'}
          </Text>
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
});

export default PaymentSuccess;