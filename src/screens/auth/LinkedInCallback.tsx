import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import linkedinAuthService from '../../services/linkedinAuthService';
import { supabase } from '../../config/supabase';
import LinkedInAuth from '../../components/LinkedInAuth';

const LinkedInCallback = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL parametrelerini al
        const params = route.params as { code?: string; state?: string };
        const code = params?.code;
        const state = params?.state;
        const storedState = await AsyncStorage.getItem('linkedin_state');

        // State kontrolü
        if (state !== storedState) {
          throw new Error('Güvenlik doğrulaması başarısız oldu');
        }

        // State'i kullandıktan sonra sil
        await AsyncStorage.removeItem('linkedin_state');

        if (code) {
          // Supabase session'ı kontrol et
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            // Zaten oturum açılmış
            navigation.navigate('Profile' as never);
            return;
          }

          // LinkedIn code değeriyle token al
          const authData = await linkedinAuthService.signInWithLinkedIn(code);

          // Kullanıcı bilgilerini AsyncStorage'a kaydet
          await AsyncStorage.setItem('user', JSON.stringify(authData.user));

          // Kullanıcıyı profil sayfasına yönlendir
          navigation.navigate('Profile' as never);
        } else {
          throw new Error('LinkedIn kimlik doğrulama kodu bulunamadı');
        }
      } catch (error) {
        console.error('LinkedIn kimlik doğrulama hatası:', error);
        setError(error instanceof Error ? error.message : 'Bir hata oluştu');
        setTimeout(() => navigation.navigate('Login' as never), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigation, route]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0077B5" />
        <Text style={styles.text}>LinkedIn ile giriş yapılıyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>⚠️ Hata</Text>
        <Text style={styles.text}>{error}</Text>
        <Text style={styles.subText}>Giriş sayfasına yönlendiriliyorsunuz...</Text>
      </View>
    );
  }

  return (
    <LinkedInAuth
      onSuccess={() => navigation.navigate('Profile')}
      onError={(error) => Alert.alert('Hata', error.message)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 24,
    color: '#ff4444',
    marginBottom: 16,
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});

export default LinkedInCallback; 