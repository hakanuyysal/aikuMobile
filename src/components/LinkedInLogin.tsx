import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

const LINKEDIN_CLIENT_ID = '77sndgcd7twnio';
const LINKEDIN_REDIRECT_URI = 'http://localhost:8081/auth/social-callback';

interface LinkedInLoginProps {
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

interface NavigationState {
  url: string;
}

const LinkedInLogin: React.FC<LinkedInLoginProps> = ({ onSuccess, onError }) => {
  const getLinkedInAuthUrl = () => {
    const scope = 'r_liteprofile r_emailaddress';
    const state = Math.random().toString(36).substring(7);
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  };

  const handleNavigationStateChange = async (navState: NavigationState) => {
    const { url } = navState;
    
    // Callback URL'ini kontrol et
    if (url.includes('/auth/social-callback')) {
      try {
        // URL'den code parametresini al
        const code = url.split('code=')[1]?.split('&')[0];
        
        if (code) {
          // Backend'e code'u gönder
          const response = await fetch('https://api.aikuaiplatform.com/auth/linkedin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              code,
              client_id: LINKEDIN_CLIENT_ID,
              redirect_uri: LINKEDIN_REDIRECT_URI
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.token) {
            onSuccess(data);
          } else {
            onError('Giriş başarısız: Token alınamadı');
          }
        } else {
          onError('Giriş başarısız: Authorization code bulunamadı');
        }
      } catch (error) {
        console.error('LinkedIn giriş hatası:', error);
        onError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
      }
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: getLinkedInAuthUrl() }}
        onNavigationStateChange={handleNavigationStateChange}
        style={styles.webview}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          onError(`WebView hatası: ${nativeEvent.description}`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default LinkedInLogin; 