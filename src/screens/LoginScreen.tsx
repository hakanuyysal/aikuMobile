import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import LinkedInLogin from '../components/LinkedInLogin';

const LoginScreen = () => {
  const handleLinkedInSuccess = (data) => {
    // Başarılı giriş sonrası yapılacak işlemler
    console.log('LinkedIn girişi başarılı:', data);
    // Token'ı kaydet ve ana sayfaya yönlendir
    Alert.alert('Başarılı', 'LinkedIn ile giriş başarılı!');
  };

  const handleLinkedInError = (error) => {
    console.error('LinkedIn girişi hatası:', error);
    Alert.alert('Hata', 'LinkedIn girişi sırasında bir hata oluştu: ' + error);
  };

  return (
    <View style={styles.container}>
      <LinkedInLogin
        onSuccess={handleLinkedInSuccess}
        onError={handleLinkedInError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LoginScreen; 