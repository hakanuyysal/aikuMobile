import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LinkedInAuthService {
  private authPromise: Promise<any> | null = null;
  private resolveAuth: ((value: any) => void) | null = null;
  private rejectAuth: ((error: any) => void) | null = null;
  private readonly STATE_EXPIRY = 15 * 60 * 1000; // 15 dakika

  /**
   * LinkedIn kimlik doğrulama URL'sini oluşturur (Supabase ile doğrudan)
   */
  async getLinkedInAuthURL() {
    try {
      const state = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      const authState = {
        state,
        timestamp: Date.now(),
        platform: 'mobile',
      };
      await AsyncStorage.setItem('linkedin_auth_state', JSON.stringify(authState));
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: 'testapp://lms/',
          queryParams: {
            prompt: 'consent',
            state: `${state}|mobile`,
            scope: 'r_liteprofile r_emailaddress',
          },
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Auth URL alınamadı');
      return data.url;
    } catch (error) {
      console.error('LinkedIn auth URL oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * LinkedIn ile giriş işlemini başlatır (Promise yönetimi)
   */
  async signInWithLinkedIn(): Promise<any> {
    if (this.authPromise) {
      return this.authPromise;
    }
    this.authPromise = new Promise((resolve, reject) => {
      this.resolveAuth = resolve;
      this.rejectAuth = reject;
    });
    return this.authPromise;
  }

  /**
   * LinkedIn callback'ini işler (Supabase ile doğrudan kodu exchange eder)
   */
  async handleCallback(code: string, state: string) {
    try {
      console.log('Callbackte gelen state:', state);
      const storedStateStr = await AsyncStorage.getItem('linkedin_auth_state');
      console.log("AsyncStorage'daki state:", storedStateStr);
      if (!storedStateStr) {
        throw new Error('State bilgisi bulunamadı');
      }
      const storedState = JSON.parse(storedStateStr);
      if (Date.now() - storedState.timestamp > this.STATE_EXPIRY) {
        throw new Error('State süresi dolmuş');
      }
      if (state !== storedState.state) {
        throw new Error('State uyuşmazlığı');
      }
      // Supabase ile oturum değişimi
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      if (this.resolveAuth) {
        this.resolveAuth(data);
      }
      return data;
    } catch (error) {
      if (this.rejectAuth) {
        this.rejectAuth(error);
      }
      throw error;
    } finally {
      this.clearAuthPromise();
      await AsyncStorage.removeItem('linkedin_auth_state');
    }
  }

  /**
   * LinkedIn profil bilgilerini çeker
   */
  private async fetchLinkedInProfile(accessToken: string | undefined) {
    if (!accessToken) {
      throw new Error('Access token bulunamadı');
    }

    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!response.ok) {
        throw new Error('LinkedIn profil bilgileri alınamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('LinkedIn profil bilgisi alma hatası:', error);
      throw error;
    }
  }

  /**
   * LinkedIn verilerini analiz eder
   */
  async analyzeLinkedInData(linkedInData: any) {
    try {
      const response = await fetch(`${ 'https://api.aikuaiplatform.com/api'}/analyze-linkedin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        },
        body: JSON.stringify(linkedInData),
      });

      if (!response.ok) {
        throw new Error('LinkedIn veri analizi başarısız');
      }

      return await response.json();
    } catch (error) {
      console.error('LinkedIn veri analizi hatası:', error);
      throw error;
    }
  }

  private clearAuthPromise() {
    this.authPromise = null;
    this.resolveAuth = null;
    this.rejectAuth = null;
  }
}

export default new LinkedInAuthService(); 