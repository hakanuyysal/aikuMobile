// Using dynamic import to prevent app crashes when OneSignal has native linking issues in some environments.
let OneSignal: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OneSignalModule = require('react-native-onesignal');
  console.log('🔍 OneSignalModule:', OneSignalModule);
  console.log('🔍 OneSignalModule keys:', Object.keys(OneSignalModule || {}));
  
  // Try different export patterns
  OneSignal = OneSignalModule.default || OneSignalModule.OneSignal || OneSignalModule;
  console.log('✅ OneSignal module loaded successfully');
  console.log('🔍 OneSignal type:', typeof OneSignal);
  console.log('🔍 OneSignal value:', OneSignal);
} catch (_e) {
  console.warn('❌ OneSignal module not available:', _e);
  OneSignal = null;
}
import {ENV} from '../../config/env';
import notificationService from '../notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getOneSignalPlayerId(): Promise<string | null> {
  try {
    // Try different API methods for getting Player ID
    if (OneSignal.User && OneSignal.User.pushSubscription) {
      if (typeof OneSignal.User.pushSubscription.getIdAsync === 'function') {
        const id = await OneSignal.User.pushSubscription.getIdAsync();
        return id ?? null;
      } else if (typeof OneSignal.User.pushSubscription.getId === 'function') {
        const id = await OneSignal.User.pushSubscription.getId();
        return id ?? null;
      } else if (typeof OneSignal.User.pushSubscription.getPushSubscriptionId === 'function') {
        const id = await OneSignal.User.pushSubscription.getPushSubscriptionId();
        return id ?? null;
      } else {
        console.log('🔍 OneSignal.User.pushSubscription methods:', Object.keys(OneSignal.User.pushSubscription || {}));
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting OneSignal Player ID:', error);
    return null;
  }
}

// Check user's notification settings
async function checkNotificationSettings(): Promise<boolean> {
  try {
    // Önce token kontrolü yap
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('🔒 Token bulunamadı, bildirim ayarları kontrol edilmiyor');
      return false;
    }

    const settings = await notificationService.getPushSettings();
    return settings.pushNotificationsEnabled;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    // Token yoksa veya hata varsa bildirimleri kapalı kabul et
    return false;
  }
}

// Enable or disable OneSignal
async function toggleOneSignal(enabled: boolean): Promise<void> {
  if (!OneSignal) return;

  try {
    if (enabled) {
      // Enable OneSignal
      await OneSignal.Notifications.requestPermission(true);
      console.log('OneSignal notifications enabled');
    } else {
      // Disable OneSignal - just clear current notifications
      await OneSignal.Notifications.clearAll();
      console.log('OneSignal notifications disabled');
    }
  } catch (error) {
    console.error('Error changing OneSignal status:', error);
  }
}

export function initializePush(): void {
  if (!ENV.ONESIGNAL_APP_ID) {
    console.warn('OneSignal App ID missing. Set ENV.ONESIGNAL_APP_ID');
    return;
  }

  if (!OneSignal) {
    console.warn('❌ OneSignal is null or undefined. Skipping initialization.');
    return;
  }

  if (!OneSignal.Notifications || !OneSignal.User) {
    console.warn('❌ OneSignal native interfaces (Notifications/User) not available. Skipping initialization.');
    return;
  }

  if (__DEV__) {
    // 6: Verbose log level
    // OneSignal v5 log level API
    try {
      OneSignal.Debug.setLogLevel(OneSignal.LogLevel.Verbose);
    } catch (_e) {
      // Older versions also work with numbers; skip if not available.
      try {
        OneSignal.Debug.setLogLevel(6);
      } catch {}
    }
  }

  try {
    OneSignal.initialize(ENV.ONESIGNAL_APP_ID);
    console.log('✅ OneSignal initialized successfully');
  } catch (error) {
    console.error('❌ OneSignal initialization failed:', error);
    return;
  }

  // Event listener'ları ekle ama permission request yapma
  OneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    async (event: any) => {
      const notification = event.getNotification();

      // Check user's notification settings
      const notificationsEnabled = await checkNotificationSettings();

      if (!notificationsEnabled) {
        // Don't show notification if user has disabled them
        event.preventDefault();
        console.log('Notification blocked due to user settings');
        return;
      }

      // Show notification in foreground
      console.log('OneSignal foreground notification:', notification);
      
      // Don't prevent default - let OneSignal show the notification
      // event.preventDefault(); // Remove this line to allow notifications to show
    },
  );

  OneSignal.Notifications.addEventListener('click', (event: any) => {
    try {
      console.log('OneSignal notification opened:', JSON.stringify(event));
    } catch (e) {
      console.log('OneSignal notification opened');
    }
  });

  // Handle background notifications
  OneSignal.Notifications.addEventListener('permissionChange', (event: any) => {
    console.log('OneSignal permission changed:', event);
  });

  // Handle notification display
  OneSignal.Notifications.addEventListener('display', (event: any) => {
    console.log('OneSignal notification displayed:', event);
  });

  OneSignal.User.pushSubscription.addEventListener('change', async () => {
    const playerId = await getOneSignalPlayerId();
    console.log('OneSignal Player ID:', playerId);
  });

  // Log Player ID and token on first launch
  getOneSignalPlayerId().then((id: any) => {
    console.log('OneSignal Player ID:', id);
  });
  
  // Try to get push token
  try {
    if (OneSignal.User.pushSubscription) {
      OneSignal.User.pushSubscription.getPushSubscriptionId().then((token: any) => {
        console.log('OneSignal Push Token:', token);
      });
    }
  } catch (error) {
    console.log('OneSignal push token error:', error);
  }
}

// Yeni fonksiyon: Login sonrası bildirim ayarlarını kontrol et ve permission request yap
export async function configureNotificationsAfterLogin(): Promise<void> {
  try {
    console.log('🔔 Login sonrası bildirim ayarları kontrol ediliyor...');
    
    // Token kontrolü yap
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('🔒 Token bulunamadı, bildirim ayarları yapılandırılmıyor');
      return;
    }

    // Kullanıcı bilgisi kontrolü yap
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) {
      console.log('🔒 Kullanıcı bilgisi bulunamadı, bildirim ayarları yapılandırılmıyor');
      return;
    }
    
    // Kullanıcının bildirim ayarlarını kontrol et
    const enabled = await checkNotificationSettings();
    
    if (enabled && OneSignal && OneSignal.Notifications) {
      try {
        // Permission request yap
        const permission = await OneSignal.Notifications.requestPermission(true);
        console.log('✅ OneSignal permission requested after login:', permission);
      } catch (error) {
        console.error('❌ OneSignal permission request failed after login:', error);
      }
    } else {
      console.log('📱 Bildirimler kapalı veya OneSignal mevcut değil');
    }
  } catch (error) {
    console.error('❌ Login sonrası bildirim ayarları kontrol hatası:', error);
  }
}

// Function to call when notification settings change
export async function updateNotificationSettings(
  enabled: boolean,
): Promise<void> {
  await toggleOneSignal(enabled);
}

// Check notification settings and configure OneSignal on app startup
export async function configureNotificationsOnStartup(): Promise<void> {
  const enabled = await checkNotificationSettings();
  await toggleOneSignal(enabled);
}

// Test function - to test user notification settings
export async function testNotificationSettings(): Promise<{
  enabled: boolean;
  message: string;
}> {
  try {
    const enabled = await checkNotificationSettings();
    const message = enabled
      ? 'Notifications enabled - OneSignal working'
      : 'Notifications disabled - OneSignal blocking notifications';

    console.log('Test result:', message);
    return {enabled, message};
  } catch (error) {
    console.error('Test error:', error);
    return {enabled: false, message: 'Error occurred during test'};
  }
}
