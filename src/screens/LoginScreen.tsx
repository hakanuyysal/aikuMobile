import React from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import LinkedInLogin from '../components/LinkedInLogin';

const LoginScreen = ({ navigation }: any) => {
  const handleLinkedInSuccess = (data: any) => {
    // Başarılı giriş sonrası yapılacak işlemler
    console.log('LinkedIn girişi başarılı:', data);
    // Token'ı kaydet ve ana sayfaya yönlendir
    Alert.alert('Başarılı', 'LinkedIn ile giriş başarılı!');
  };

  const handleLinkedInError = (error: any) => {
    console.error('LinkedIn girişi hatası:', error);
    Alert.alert('Hata', 'LinkedIn girişi sırasında bir hata oluştu: ' + error);
  };

  return (
    <View style={styles.container}>
      <LinkedInLogin
        onSuccess={handleLinkedInSuccess}
        onError={handleLinkedInError}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          By continuing, you accept our{' '}
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    color: '#3B82F7',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default LoginScreen; 