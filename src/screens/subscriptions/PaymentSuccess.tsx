import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';

type PaymentSuccessProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: {
    params: {
      message: string;
    };
  };
};

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({navigation, route}) => {
  const {message} = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="checkmark-circle" size={80} color={Colors.success} />
        </View>
        <Text style={styles.title}>Success!</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'Main'}],
            })
          }>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: metrics.padding.xl,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: metrics.margin.xl,
  },
  title: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.md,
  },
  message: {
    fontSize: metrics.fontSize.lg,
    color: Colors.inactive,
    textAlign: 'center',
    marginBottom: metrics.margin.xl,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: metrics.padding.lg,
    paddingHorizontal: metrics.padding.xxl,
    borderRadius: metrics.borderRadius.circle,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: 'bold',
  },
});

export default PaymentSuccess;