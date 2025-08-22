# OneSignal Bildirim Ayarları

Bu dokümantasyon, uygulamada OneSignal bildirimlerinin kullanıcı ayarlarına göre nasıl kontrol edildiğini açıklar.

## Özellikler

### 1. Kullanıcı Bildirim Ayarları
- Kullanıcılar Settings ekranından bildirim tercihlerini değiştirebilir
- Bildirim ayarları backend'de saklanır
- Uygulama başlatıldığında ayarlar kontrol edilir

### 2. OneSignal Entegrasyonu
- OneSignal, kullanıcının bildirim ayarlarına göre çalışır
- Kullanıcı bildirimleri kapattığında OneSignal bildirimleri engeller
- Kullanıcı bildirimleri açtığında OneSignal normal çalışır

### 3. Test Fonksiyonu
- Settings ekranında "Test Notifications" butonu bulunur
- Bu buton ile kullanıcı bildirim ayarlarını test edebilir

## Dosya Yapısı

```
src/
├── services/
│   ├── push/
│   │   └── oneSignal.ts          # OneSignal konfigürasyonu
│   └── notificationService.ts    # Bildirim ayarları API'si
├── screens/
│   └── settings/
│       └── Settings.tsx          # Ayarlar ekranı
└── index.js                      # Uygulama başlatma
```

## Kullanım

### 1. Bildirim Ayarlarını Değiştirme
1. Settings ekranına git
2. "Push Notifications" toggle'ını kullan
3. Ayarlar otomatik olarak kaydedilir ve OneSignal güncellenir

### 2. Bildirim Ayarlarını Test Etme
1. Settings ekranına git
2. "Test Notifications" butonuna tıkla
3. Mevcut ayarların durumunu gör

### 3. Uygulama Başlatma
- Uygulama başlatıldığında bildirim ayarları otomatik kontrol edilir
- OneSignal buna göre yapılandırılır

## API Endpoints

### Bildirim Ayarları
- `GET /api/notifications/push-settings` - Mevcut ayarları getir
- `PUT /api/notifications/push-settings` - Ayarları güncelle

### Response Format
```json
{
  "success": true,
  "data": {
    "pushNotificationsEnabled": true
  }
}
```

## Teknik Detaylar

### OneSignal Event Handling
- `foregroundWillDisplay`: Bildirim gösterilmeden önce kontrol edilir
- Kullanıcı ayarları kontrol edilir
- Gerekirse bildirim engellenir

### Error Handling
- API hatalarında varsayılan değerler kullanılır
- OneSignal hatalarında uygulama çökmez
- Hata durumları loglanır

## Geliştirme Notları

### Yeni Özellik Ekleme
1. `notificationService.ts`'e yeni endpoint ekle
2. `oneSignal.ts`'e gerekli fonksiyonları ekle
3. Settings ekranına UI ekle

### Test Etme
- Farklı bildirim ayarları ile test et
- API hatalarını simüle et
- OneSignal'ın doğru çalıştığını doğrula

## Sorun Giderme

### Bildirimler Gelmiyor
1. Settings'te bildirimlerin açık olduğunu kontrol et
2. Test butonunu kullan
3. Console loglarını kontrol et

### API Hataları
1. Network bağlantısını kontrol et
2. Token'ın geçerli olduğunu kontrol et
3. Backend endpoint'lerinin çalıştığını kontrol et
