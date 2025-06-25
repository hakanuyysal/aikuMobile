import React, {useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {Colors} from '../../constants/colors';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThreeDSecureProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: {
    params: {
      redirectUrl: string;
      paymentData: {
        TURKPOS_RETVAL_Islem_ID: string;
        TURKPOS_RETVAL_Siparis_ID: string;
        UCD_MD: string;
        TURKPOS_RETVAL_Islem_GUID?: string;
        isRedirect: boolean;
        redirectUrl: string;
      };
    };
  };
};

const ThreeDSecure: React.FC<ThreeDSecureProps> = ({navigation, route}) => {
  const {redirectUrl, paymentData} = route.params;

  useEffect(() => {
    // 3D Secure verisini sakla
    const storeData = async () => {
      try {
        await AsyncStorage.setItem('param_islem_id', paymentData.TURKPOS_RETVAL_Islem_ID);
        await AsyncStorage.setItem('param_siparis_id', paymentData.TURKPOS_RETVAL_Siparis_ID);
        await AsyncStorage.setItem('param_ucd_md', paymentData.UCD_MD);

        if (paymentData.TURKPOS_RETVAL_Islem_GUID) {
          await AsyncStorage.setItem('param_islem_guid', paymentData.TURKPOS_RETVAL_Islem_GUID);
        }
      } catch (error) {
        console.error('3D Secure verisi saklanırken hata:', error);
      }
    };

    storeData();
  }, [paymentData]);

  const handleNavigationStateChange = (navState: any) => {
    // Başarılı ödeme callback'i
    if (navState.url.includes('/payment/success')) {
      navigation.navigate('PaymentSuccess', {
        message: 'Ödemeniz başarıyla gerçekleştirildi!',
      });
    }
    // Hatalı ödeme callback'i
    else if (navState.url.includes('/payment/error')) {
      navigation.navigate('PaymentError', {
        message: 'Ödeme işlemi sırasında bir hata oluştu.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{uri: redirectUrl}}
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