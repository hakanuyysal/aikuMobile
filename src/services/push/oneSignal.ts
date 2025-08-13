// OneSignal bazı ortamlarda native link sorunu yaşarsa uygulamanın çökmesini
// engellemek için dinamik import kullanıyoruz.
let OneSignal: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  OneSignal = require('react-native-onesignal').default;
} catch (_e) {
  OneSignal = null;
}
import { Platform } from 'react-native';
import { ENV } from '../../config/env';

export async function getOneSignalPlayerId(): Promise<string | null> {
  try {
    const id = await OneSignal.User.pushSubscription.getId();
    return id ?? null;
  } catch (error) {
    return null;
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
      try { OneSignal.Debug.setLogLevel(6); } catch {} 
    }
  }

  OneSignal.initialize(ENV.ONESIGNAL_APP_ID);

  // iOS ve Android 13+ için izin iste
  OneSignal.Notifications.requestPermission(true);

  OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
    const notification = event.getNotification();
    // Varsayılan davranış: bildirimi göster. Sadece logluyoruz.
    console.log('OneSignal foreground notification:', notification);
  });

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


