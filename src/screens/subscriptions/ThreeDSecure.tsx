import React from 'react';
import {View, ActivityIndicator, StyleSheet, TouchableOpacity, Text, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import {Colors} from '../../constants/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import Icon from 'react-native-vector-icons/Ionicons';
import metrics from '../../constants/aikuMetric';

type ThreeDSecureProps = NativeStackScreenProps<RootStackParamList, 'ThreeDSecure'>;

const ThreeDSecure: React.FC<ThreeDSecureProps> = ({navigation, route}) => {
  const {htmlContent, returnUrl} = route.params;

  const handleNavigationStateChange = (navState: any) => {
    const url = navState.url;
    
    if (url.includes('/payment/callback')) {
      const urlObj = new URL(url);
      const status = urlObj.searchParams.get('status');
      const message = urlObj.searchParams.get('message');

      if (status === 'success') {
        navigation.replace('PaymentSuccess', {
          message: message || 'Your payment was successfully completed!',
        });
      } else {
        navigation.replace('PaymentError', {
          message: message || 'An error occurred during the payment process.',
        });
      }
    }
  };

  const handleClose = () => {
    navigation.navigate('PaymentError', {
      message: 'Payment was cancelled.',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>3D Secure Payment</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="close" size={24} color={Colors.lightText} />
        </TouchableOpacity>
      </View>

      <WebView
        source={{html: htmlContent}}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: metrics.padding.md,
    paddingVertical: metrics.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  title: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: metrics.padding.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});

export default ThreeDSecure; 