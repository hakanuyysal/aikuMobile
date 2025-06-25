import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {Colors} from '../../constants/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';

type ThreeDSecureProps = NativeStackScreenProps<RootStackParamList, 'ThreeDSecure'>;

const ThreeDSecure: React.FC<ThreeDSecureProps> = ({navigation, route}) => {
  const {htmlContent, returnUrl} = route.params;

  const handleNavigationStateChange = (navState: any) => {
    // URL'de ödeme sonucu parametrelerini kontrol et
    const url = new URL(navState.url);
    
    if (url.pathname.includes('/payment/callback')) {
      const mdStatus = url.searchParams.get('mdStatus');
      
      if (mdStatus === '1') {
        // Başarılı ödeme
        navigation.navigate('PaymentSuccess', {
          message: 'Your payment was successfully completed!'
        });
      } else {
        // Başarısız ödeme
        navigation.navigate('PaymentError', {
          message: 'Payment verification failed. Please try again.'
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{html: htmlContent, baseUrl: returnUrl}}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ThreeDSecure; 