# RevenueCat Entegrasyonu Kurulum Rehberi

## 📋 Genel Bakış

Bu proje RevenueCat entegrasyonu ile abonelik yönetimi yapmaktadır. RevenueCat, iOS ve Android için in-app purchase yönetimini kolaylaştıran bir platformdur.

## 🚀 Kurulum Adımları

### 1. RevenueCat Hesabı Oluşturma

1. [RevenueCat Dashboard](https://app.revenuecat.com/) adresine gidin
2. Yeni bir proje oluşturun
3. iOS ve Android uygulamalarınızı ekleyin

### 2. API Key'leri Alma

#### iOS için:
1. RevenueCat Dashboard'da iOS uygulamanızı seçin
2. "API Keys" sekmesine gidin
3. `appl_` ile başlayan API key'i kopyalayın

#### Android için:
1. RevenueCat Dashboard'da Android uygulamanızı seçin
2. "API Keys" sekmesine gidin
3. `goog_` ile başlayan API key'i kopyalayın

### 3. Konfigürasyon

#### Environment Variables (.env dosyası oluşturun):

```bash
# RevenueCat API Keys
REVENUECAT_IOS_API_KEY=appl_YOUR_IOS_API_KEY
REVENUECAT_ANDROID_API_KEY=goog_YOUR_ANDROID_API_KEY

# API URL
API_URL=https://api.aikuaiplatform.com/api
```

#### Veya Config.ts dosyasını güncelleyin:

```typescript
// src/config/Config.ts
const AppConfig = {
  API_URL: 'https://api.aikuaiplatform.com',
  
  // RevenueCat API Keys
  REVENUECAT_IOS_API_KEY: 'appl_YOUR_IOS_API_KEY',
  REVENUECAT_ANDROID_API_KEY: 'goog_YOUR_ANDROID_API_KEY',
};
```

### 4. App Store Connect / Google Play Console Kurulumu

#### iOS (App Store Connect):
1. App Store Connect'te uygulamanızı açın
2. "Features" > "In-App Purchases" bölümüne gidin
3. Aşağıdaki ürünleri oluşturun:

```
startup_monthly
- Product ID: startup_monthly
- Type: Auto-Renewable Subscription
- Price: $49.99

startup_yearly
- Product ID: startup_yearly
- Type: Auto-Renewable Subscription
- Price: $529.99

business_monthly
- Product ID: business_monthly
- Type: Auto-Renewable Subscription
- Price: $74.99

business_yearly
- Product ID: business_yearly
- Type: Auto-Renewable Subscription
- Price: $809.99

investor_monthly
- Product ID: investor_monthly
- Type: Auto-Renewable Subscription
- Price: $99.99

investor_yearly
- Product ID: investor_yearly
- Type: Auto-Renewable Subscription
- Price: $1069.99
```

#### Android (Google Play Console):
1. Google Play Console'da uygulamanızı açın
2. "Monetize" > "Products" > "Subscriptions" bölümüne gidin
3. Aynı ürün ID'leri ile abonelikler oluşturun

### 5. RevenueCat Dashboard'da Ürünleri Ekleme

1. RevenueCat Dashboard'da projenizi açın
2. "Products" sekmesine gidin
3. "Add Product" butonuna tıklayın
4. Her ürün için:
   - Product ID'yi girin (örn: startup_monthly)
   - Store'u seçin (App Store / Google Play)
   - Ürün adını ve açıklamasını girin

### 6. Entitlements Oluşturma

RevenueCat Dashboard'da "Entitlements" sekmesinde:

1. "Add Entitlement" butonuna tıklayın
2. Entitlement adını girin (örn: "premium_access")
3. Ürünleri bu entitlement'a bağlayın

## 🔧 Kod Entegrasyonu

### Mevcut Dosyalar:

1. **src/config/revenueCat.ts** - RevenueCat konfigürasyonu
2. **src/services/RevenueCatService.ts** - RevenueCat servis fonksiyonları
3. **src/hooks/useSubscription.ts** - Abonelik durumu hook'u
4. **src/components/SubscriptionStatus.tsx** - Abonelik durumu bileşeni
5. **src/screens/subscriptions/CartScreen.tsx** - Abonelik planları sayfası

### Kullanım Örnekleri:

#### Abonelik Durumu Kontrolü:
```typescript
import { useSubscription } from '../hooks/useSubscription';

const MyComponent = () => {
  const { isActive, planName, loading } = useSubscription();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <View>
      {isActive ? (
        <Text>Aktif abonelik: {planName}</Text>
      ) : (
        <Text>Abonelik yok</Text>
      )}
    </View>
  );
};
```

#### Abonelik Satın Alma:
```typescript
import RevenueCatService from '../services/RevenueCatService';

const handlePurchase = async () => {
  try {
    const packages = await RevenueCatService.getRevenueCatPackages();
    const packageToPurchase = packages.find(pkg => pkg.identifier === 'startup_monthly');
    
    if (packageToPurchase) {
      const result = await RevenueCatService.purchasePackage(packageToPurchase);
      if (result.success) {
        console.log('Satın alma başarılı!');
      }
    }
  } catch (error) {
    console.error('Satın alma hatası:', error);
  }
};
```

## 🧪 Test Etme

### Sandbox Test:
1. iOS için: TestFlight kullanın
2. Android için: Internal testing kullanın
3. Test kullanıcıları oluşturun

### Test Kullanıcıları:
- iOS: App Store Connect'te "Users and Access" > "Sandbox Testers"
- Android: Google Play Console'da "Setup" > "License Testing"

## 📱 Platform Özel Notlar

### iOS:
- StoreKit framework'ü otomatik olarak entegre edilir
- Sandbox testleri için gerçek cihaz gerekli
- TestFlight üzerinden test edin

### Android:
- Google Play Billing Library otomatik olarak entegre edilir
- Emulator'da test edilebilir
- Internal testing ile test edin

## 🔍 Debug ve Loglama

### RevenueCat Debug:
```typescript
// Debug modunu aktifleştir
import Purchases from 'react-native-purchases';

if (__DEV__) {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
}
```

### Logları İzleme:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

## 🚨 Yaygın Sorunlar ve Çözümler

### 1. "Product not found" Hatası:
- Ürün ID'lerinin doğru olduğundan emin olun
- App Store Connect / Google Play Console'da ürünlerin onaylandığından emin olun
- RevenueCat Dashboard'da ürünlerin eklendiğinden emin olun

### 2. "User not found" Hatası:
- Kullanıcı ID'sinin doğru set edildiğinden emin olun
- AuthContext'te RevenueCat User ID set etme kodunu kontrol edin

### 3. "Network error" Hatası:
- İnternet bağlantısını kontrol edin
- API key'lerin doğru olduğundan emin olun
- RevenueCat servisinin çalışır durumda olduğundan emin olun

## 📞 Destek

Sorun yaşarsanız:
1. RevenueCat [Dokümantasyon](https://docs.revenuecat.com/) sayfasını kontrol edin
2. RevenueCat [Discord](https://discord.gg/RevenueCat) kanalına katılın
3. Proje maintainer'ı ile iletişime geçin

## 🔄 Güncellemeler

RevenueCat SDK'sını güncellemek için:
```bash
yarn upgrade react-native-purchases
```

## 📝 Notlar

- RevenueCat ücretsiz planında aylık 2500 kullanıcı sınırı vardır
- Production'da gerçek API key'leri kullanın
- Test ortamında sandbox API key'leri kullanın
- Abonelik durumunu düzenli olarak kontrol edin
