import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import Icon from 'react-native-vector-icons/Ionicons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';

type PaymentErrorProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: {
    params: {
      message: string;
    };
  };
};

const PaymentError: React.FC<PaymentErrorProps> = ({navigation, route}) => {
  const {message} = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="close-circle" size={80} color={Colors.error} />
        </View>
        <Text style={styles.title}>Hata!</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Tekrar Dene</Text>
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

export default PaymentError; 