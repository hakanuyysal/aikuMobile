// OneSignal bazı ortamlarda native link sorunu yaşarsa uygulamanın çökmesini
// engellemek için dinamik import kullanıyoruz.
let OneSignal: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  OneSignal = require('react-native-onesignal').default;
} catch (_e) {
  OneSignal = null;
}
import {Platform} from 'react-native';
import {ENV} from '../../config/env';
import notificationService from '../notificationService';

export async function getOneSignalPlayerId(): Promise<string | null> {
  try {
    const id = await OneSignal.User.pushSubscription.getId();
    return id ?? null;
  } catch (error) {
    return null;
  }
}

// Kullanıcının bildirim ayarlarını kontrol et
async function checkNotificationSettings(): Promise<boolean> {
  try {
    const settings = await notificationService.getPushSettings();
    return settings.pushNotificationsEnabled;
  } catch (error) {
    console.error('Bildirim ayarları kontrol edilirken hata:', error);
    // Hata durumunda varsayılan olarak bildirimleri etkinleştir
    return true;
  }
}

// OneSignal'ı etkinleştir veya devre dışı bırak
async function toggleOneSignal(enabled: boolean): Promise<void> {
  if (!OneSignal) return;

  try {
    if (enabled) {
      // OneSignal'ı etkinleştir
      await OneSignal.Notifications.requestPermission(true);
      console.log('OneSignal bildirimleri etkinleştirildi');
    } else {
      // OneSignal'ı devre dışı bırak - sadece mevcut bildirimleri temizle
      await OneSignal.Notifications.clearAll();
      console.log('OneSignal bildirimleri devre dışı bırakıldı');
    }
  } catch (error) {
    console.error('OneSignal durumu değiştirilirken hata:', error);
  }
}

export function initializePush(): void {
  if (!ENV.ONESIGNAL_APP_ID) {
    console.warn('OneSignal App ID missing. Set ENV.ONESIGNAL_APP_ID');
    return;
  }

  if (!OneSignal) {
    console.warn('OneSignal native module not available. Skipping init.');
    return;
  }

  if (__DEV__) {
    // 6: Verbose log level
    // OneSignal v5 log level API
    try {
      OneSignal.Debug.setLogLevel(OneSignal.LogLevel.Verbose);
    } catch (_e) {
      // Eski sürümlerde sayı ile de çalışır; yoksa pas geç.
      try {
        OneSignal.Debug.setLogLevel(6);
      } catch {}
    }
  }

  OneSignal.initialize(ENV.ONESIGNAL_APP_ID);

  // Kullanıcının bildirim ayarlarını kontrol et ve OneSignal'ı buna göre yapılandır
  checkNotificationSettings().then(enabled => {
    if (enabled) {
      // iOS ve Android 13+ için izin iste
      OneSignal.Notifications.requestPermission(true);
    }
  });

  OneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    async (event: any) => {
      const notification = event.getNotification();

      // Kullanıcının bildirim ayarlarını kontrol et
      const notificationsEnabled = await checkNotificationSettings();

      if (!notificationsEnabled) {
        // Kullanıcı bildirimleri kapattıysa bildirimi gösterme
        event.preventDefault();
        console.log('Bildirim kullanıcı ayarları nedeniyle engellendi');
        return;
      }

      // Varsayılan davranış: bildirimi göster. Sadece logluyoruz.
      console.log('OneSignal foreground notification:', notification);
    },
  );

  OneSignal.Notifications.addEventListener('click', event => {
    try {
      console.log('OneSignal notification opened:', JSON.stringify(event));
    } catch (e) {
      console.log('OneSignal notification opened');
    }
  });

  OneSignal.User.pushSubscription.addEventListener('change', async () => {
    const playerId = await OneSignal.User.pushSubscription.getId();
    console.log('OneSignal Player ID:', playerId);
  });

  // İlk açılışta Player ID ve token logla
  OneSignal.User.pushSubscription.getId().then(id => {
    console.log('OneSignal Player ID:', id);
  });
  OneSignal.User.pushSubscription.getToken().then(token => {
    if (token) console.log('Push Token:', token);
  });
}

// Bildirim ayarları değiştiğinde çağrılacak fonksiyon
export async function updateNotificationSettings(
  enabled: boolean,
): Promise<void> {
  await toggleOneSignal(enabled);
}

// Uygulama başlatıldığında bildirim ayarlarını kontrol et ve OneSignal'ı yapılandır
export async function configureNotificationsOnStartup(): Promise<void> {
  const enabled = await checkNotificationSettings();
  await toggleOneSignal(enabled);
}

// Test fonksiyonu - kullanıcı bildirim ayarlarını test etmek için
export async function testNotificationSettings(): Promise<{
  enabled: boolean;
  message: string;
}> {
  try {
    const enabled = await checkNotificationSettings();
    const message = enabled
      ? 'Bildirimler etkin - OneSignal çalışıyor'
      : 'Bildirimler devre dışı - OneSignal bildirimleri engelliyor';

    console.log('Test sonucu:', message);
    return {enabled, message};
  } catch (error) {
    console.error('Test hatası:', error);
    return {enabled: false, message: 'Test sırasında hata oluştu'};
  }
}
