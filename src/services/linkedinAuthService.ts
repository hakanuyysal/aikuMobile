import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';



class LinkedInAuthService {
  /**
   * LinkedIn kimlik doğrulama URL'sini oluşturur
   */
  getLinkedInAuthURL() {
    const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI || 'aikuaiplatform://auth/social-callback'; // Deep link URL'i
    
    // Client ID'nin tanımlı olduğundan emin olalım
    if (!clientId) {
      console.error('LinkedIn Client ID is not defined in environment variables.');
      throw new Error('LinkedIn Client ID configuration error.');
    }

    const scope = 'r_liteprofile r_emailaddress';
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // State değerini AsyncStorage'a kaydet
    AsyncStorage.setItem('linkedin_state', state);
    
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  }

  /**
   * LinkedIn code değerini kullanarak token alır
   * @param {string} code - LinkedIn callback'ten alınan code değeri
   */
  async getTokenFromCode(code: string) {
    try {
      // Auth code'u ile Supabase'e istekte bulun
      // Not: Bu kısım, aslında backend tarafında yapılır ve token doğrudan Supabase'e gönderilir
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'linkedin',
        token: code,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('LinkedIn token alma hatası:', error);
      throw error;
    }
  }

  /**
   * Token kullanarak LinkedIn kullanıcı bilgilerini alır
   * @param {string} accessToken - LinkedIn access token
   */
  async getUserInfo(accessToken: string | object | undefined) {
    try {
      // Bu kısım normalde backend tarafında yapılır,
      // ancak Supabase kullanıldığında bu adıma gerek yoktur çünkü
      // Supabase doğrudan user bilgilerini döndürür
      return accessToken; // Supabase zaten kullanıcı bilgilerini içerecektir
    } catch (error) {
     //  console.error('LinkedIn kullanıcı bilgisi alma hatası:', error);
      throw error;
    }
  }

  /**
   * LinkedIn bilgileriyle Supabase'e giriş yapar veya yeni kullanıcı oluşturur
   * @param {string} code - LinkedIn'den alınan code değeri
   */
  async signInWithLinkedIn(code: string) {
    try {
      // LinkedIn OAuth işlemini Supabase üzerinden başlat
      // Supabase, LinkedIn doğrulamasını otomatik olarak yönetir
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: 'aikuaiplatform://auth/social-callback',
          queryParams: {
            code: code
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('LinkedIn ile giriş hatası:', error);
      throw error;
    }
  }
}

export default new LinkedInAuthService(); 