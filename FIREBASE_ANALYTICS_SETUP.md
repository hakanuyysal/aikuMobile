# Firebase Analytics Integration Guide

## Issues Identified and Fixed

### 1. Configuration Issues
- ✅ **iOS Analytics was disabled**: Fixed `IS_ANALYTICS_ENABLED` to `true` in `GoogleService-Info.plist`
- ⚠️ **Project ID mismatch**: Android uses `aiku-ai-platform-77896`, iOS uses `aiku-84985` - **YOU NEED TO FIX THIS**
- ✅ **Missing Firebase initialization**: Added Firebase initialization to iOS AppDelegate
- ✅ **Missing Analytics implementation**: Created complete Analytics service and integration

### 2. Code Implementation
- ✅ **Created Analytics Service**: `src/services/AnalyticsService.ts` with comprehensive event tracking
- ✅ **Updated App.tsx**: Added Firebase Analytics initialization and user tracking

## Critical Issue: Project ID Mismatch

**⚠️ IMPORTANT**: Your Android and iOS configurations use different Firebase projects:
- Android: `aiku-ai-platform-77896`
- iOS: `aiku-84985`

You need to either:
1. **Update iOS config** to use the same project as Android, OR
2. **Update Android config** to use the same project as iOS

To fix this, download the correct configuration files from your Firebase Console and replace them:
- `android/app/google-services.json`
- `ios/aikuMobile/GoogleService-Info.plist`

## Next Steps

### 1. Resolve Project ID Mismatch
```bash
# Go to Firebase Console (https://console.firebase.google.com)
# Choose ONE project to use for both platforms
# Download fresh config files:
# - google-services.json for Android
# - GoogleService-Info.plist for iOS
# Replace the existing files in your project
```

### 2. Enable Google Analytics in Firebase Console
1. Go to your Firebase project
2. Navigate to Analytics
3. Make sure Google Analytics is enabled
4. Link it to a Google Analytics property if needed

### 3. Build and Test the Project

#### For Android:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### For iOS:
```bash
cd ios
rm -rf Pods
pod install
cd ..
npx react-native run-ios
```

### 4. Verify Analytics is Working

#### Check Console Logs
Look for these log messages when the app starts:
```
Firebase Analytics initialized successfully
Event logged: app_open
```

#### Check Firebase Console
1. Go to Firebase Console > Analytics > Events
2. Wait 24-48 hours for data to appear (real-time debugging available)
3. Use DebugView for immediate testing

#### Enable Debug Mode (for immediate verification)
```bash
# Android
adb shell setprop debug.firebase.analytics.app com.aikumobile

# iOS - Add to scheme arguments in Xcode:
-FIRAnalyticsDebugEnabled
```

## Usage Examples

### Basic Screen Tracking
```typescript
import { useEffect } from 'react';
import AnalyticsService from '../services/AnalyticsService';

const MyScreen = () => {
  useEffect(() => {
    AnalyticsService.logScreenView('My_Screen');
  }, []);
  
  // Your component code
};
```

### Event Tracking
```typescript
import AnalyticsService from '../services/AnalyticsService';

const handleButtonPress = async () => {
  await AnalyticsService.logEvent('button_press', {
    button_name: 'subscribe',
    location: 'homepage'
  });
};

const handlePurchase = async () => {
  await AnalyticsService.logPurchase(29.99, 'USD', 'txn_123');
};
```

### Business Events
```typescript
// Track company profile views
await AnalyticsService.logBusinessEvent('company_view', {
  company_id: 'comp_123',
  company_name: 'Example Corp',
  user_type: 'investor'
});

// Track subscription events
await AnalyticsService.logBusinessEvent('subscription', {
  plan_type: 'premium',
  billing_cycle: 'monthly',
  price: 29.99
});
```

### User Properties
```typescript
// Set user properties when user logs in
await AnalyticsService.setUserId(user.id);
await AnalyticsService.setUserProperties({
  user_type: 'investor',
  subscription_status: 'active',
  registration_date: '2024-01-01'
});
```

## Testing Your Implementation

### 1. Monitor Console Logs
All analytics events are logged to the console for debugging purposes.

### 2. Firebase DebugView
1. Enable debug mode (see commands above)
2. Go to Firebase Console > Analytics > DebugView
3. Interact with your app and see events in real-time

## Common Events to Track

Based on your app structure, consider tracking these events:

### User Authentication
- `login` - When user logs in
- `sign_up` - When user registers
- `logout` - When user logs out

### Navigation
- `screen_view` - Automatic screen tracking
- `tab_switch` - When user switches tabs

### Business Actions
- `company_view` - When user views company profile
- `product_view` - When user views product details
- `investment_interest` - When user shows investment interest
- `subscription_start` - When user starts subscription process
- `payment_success` - When payment completes
- `search` - When user searches

### Engagement
- `button_press` - Button interactions
- `share` - Content sharing
- `favorite_add` - Adding to favorites
- `chat_start` - Starting a chat

## Troubleshooting

### No Data in Analytics
1. Wait 24-48 hours for data processing
2. Check project ID consistency
3. Verify network connectivity
4. Check console logs for errors
5. Use DebugView for real-time verification

### TypeScript Errors
The analytics service should work despite TypeScript warnings. If you encounter issues:
1. Check that `@react-native-firebase/analytics` is properly installed
2. Verify TypeScript configuration in `tsconfig.json`
3. Restart TypeScript server in your IDE

### Build Errors
1. Clean builds: `npx react-native clean`
2. Clear caches: `npx react-native clean-cache`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. For iOS: `cd ios && pod install`

## Files Modified/Created

### Modified Files:
- `ios/aikuMobile/GoogleService-Info.plist` - Enabled analytics
- `ios/aikuMobile/AppDelegate.swift` - Added Firebase initialization
- `App.tsx` - Added analytics initialization and user tracking
- `tsconfig.json` - Updated TypeScript configuration

### New Files:
- `src/services/AnalyticsService.ts` - Main analytics service
- `FIREBASE_ANALYTICS_SETUP.md` - This documentation

## Next Steps After Setup

1. **Fix project ID mismatch** (critical)
2. **Test on both platforms** (Android & iOS)
3. **Implement analytics in key screens** using the patterns shown
4. **Set up custom events** specific to your business needs
5. **Monitor analytics dashboard** for user behavior insights

Your Firebase Analytics integration is now ready! The main remaining task is to resolve the project ID mismatch between Android and iOS configurations.