import React, { useRef, useEffect, useState } from 'react';
import { Modal, StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import linkedinAuthService from '../services/linkedinAuthService';

interface LinkedInWebViewProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

const LinkedInWebView: React.FC<LinkedInWebViewProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('LinkedInWebView useEffect visible:', visible);
    if (visible) {
      setIsLoading(true);
      setError(null);
      const fetchAuthUrl = async () => {
        try {
          const url = await linkedinAuthService.getLinkedInAuthURL();
          console.log('LinkedIn Auth URL alındı:', url);
          setAuthUrl(url);
        } catch (err: any) {
          console.log('LinkedIn Auth URL Hatası:', err);
          setError(err.message || 'Giriş URL\'si alınamadı');
          onError(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAuthUrl();
    } else {
      setAuthUrl(null);
    }
  }, [visible]);

  const handleNavigationStateChange = async (navState: any) => {
    const url = navState.url;
    console.log('WebView navigation state değişti, url:', url);
    
    if (url.includes('/auth/linkedin/callback')) {
      try {
        setIsLoading(true);
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const state = urlObj.searchParams.get('state');
        const error = urlObj.searchParams.get('error');

        console.log('Callback URL parametreleri:', { code, state, error });

        if (error) {
          console.log('Callback error parametresi:', error);
          throw new Error(error);
        }

        if (!code || !state) {
          console.log('Callback parametreleri eksik:', { code, state });
          throw new Error('Geçersiz callback parametreleri');
        }

        const data = await linkedinAuthService.handleCallback(code, state);
        console.log('LinkedIn handleCallback başarılı, data:', data);
        onSuccess(data);
        onClose();
      } catch (error: any) {
        console.log('LinkedIn handleCallback hatası:', error);
        setError(error.message || 'Bir hata oluştu');
        onError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    console.log('LinkedIn login tekrar denenecek.');
    setError(null);
    setIsLoading(true);
    setAuthUrl(null);
    const fetchAuthUrl = async () => {
      try {
        const url = await linkedinAuthService.getLinkedInAuthURL();
        console.log('LinkedIn Auth URL alındı (retry):', url);
        setAuthUrl(url);
      } catch (err: any) {
        console.log('LinkedIn Auth URL Hatası (retry):', err);
        setError(err.message || 'Giriş URL\'si alınamadı');
        onError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuthUrl();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.webViewContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>LinkedIn ile Giriş</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={authUrl ? { uri: authUrl } : { uri: 'about:blank' }}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0077B5" />
                  <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
              )}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              incognito={true}
              sharedCookiesEnabled={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  webViewContainer: {
    height: '80%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 40,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0077B5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LinkedInWebView; 