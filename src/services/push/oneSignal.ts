// Using dynamic import to prevent app crashes when OneSignal has native linking issues in some environments.
let OneSignal: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  OneSignal = require('react-native-onesignal').default;
  console.log('✅ OneSignal module loaded successfully');
} catch (_e) {
  console.warn('❌ OneSignal module not available:', _e);
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

// Check user's notification settings
async function checkNotificationSettings(): Promise<boolean> {
  try {
    const settings = await notificationService.getPushSettings();
    return settings.pushNotificationsEnabled;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    // Enable notifications by default in case of error
    return true;
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
    console.warn('OneSignal native module not available. Skipping init.');
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

  OneSignal.initialize(ENV.ONESIGNAL_APP_ID);

  // Check user's notification settings and configure OneSignal accordingly
  checkNotificationSettings().then(enabled => {
    if (enabled) {
      // Request permission for iOS and Android 13+
      OneSignal.Notifications.requestPermission(true);
    }
  });

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

      // Default behavior: show notification. Just logging it.
      console.log('OneSignal foreground notification:', notification);
    },
  );

  OneSignal.Notifications.addEventListener('click', (event: any) => {
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

  // Log Player ID and token on first launch
  OneSignal.User.pushSubscription.getId().then((id: any) => {
    console.log('OneSignal Player ID:', id);
  });
  OneSignal.User.pushSubscription.getToken().then((token: any) => {
    if (token) console.log('Push Token:', token);
  });
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
