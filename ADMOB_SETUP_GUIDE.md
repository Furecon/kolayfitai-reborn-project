# Google AdMob Setup Guide - KolayFit

Bu doküman, KolayFit uygulamasında Google AdMob entegrasyonunun nasıl yapıldığını ve production ortamına nasıl geçileceğini açıklar.

## 📋 İçindekiler

1. [Kurulum Özeti](#kurulum-özeti)
2. [Google AdMob Hesabı Oluşturma](#google-admob-hesabı-oluşturma)
3. [Production ID'lerini Güncelleme](#production-idlerini-güncelleme)
4. [Test Modu](#test-modu)
5. [Reklam Türleri](#reklam-türleri)
6. [Sorun Giderme](#sorun-giderme)

---

## 🎯 Kurulum Özeti

KolayFit'te AdMob entegrasyonu **FAZ 3** ile tamamlanmıştır:

### ✅ Tamamlanan İşlemler

1. **@capacitor-community/admob** plugin kurulumu
2. **AdMobService** - Rewarded ad yönetimi
3. **iOS Info.plist** konfigürasyonu
4. **Android Manifest** konfigürasyonu
5. **AdRewardDialog** güncelleme
6. **App.tsx** initialization

### 🔧 Kullanılan Dosyalar

- `src/services/AdMobService.ts` - Ana reklam servisi
- `src/components/Ads/AdRewardDialog.tsx` - Reklam dialog UI
- `ios/App/App/Info.plist` - iOS konfigürasyon
- `android/app/src/main/AndroidManifest.xml` - Android konfigürasyon
- `src/App.tsx` - AdMob initialization

---

## 🆕 Google AdMob Hesabı Oluşturma

### Adım 1: AdMob Hesabı Oluşturun

1. [Google AdMob Console](https://apps.admob.com/) adresine gidin
2. Google hesabınızla giriş yapın
3. "Get Started" tıklayın
4. Hesap bilgilerinizi doldurun

### Adım 2: Uygulama Ekleyin

#### iOS Uygulaması

1. AdMob Console'da "Apps" > "Add App" tıklayın
2. Platform: **iOS**
3. App Store'da mı?: **Evet** (eğer zaten yayındaysa)
4. Bundle ID: `com.kolayfit.app`
5. App name: `KolayFit`

**iOS App ID:** `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`

#### Android Uygulaması

1. AdMob Console'da "Apps" > "Add App" tıklayın
2. Platform: **Android**
3. Google Play'de mi?: **Evet** (eğer zaten yayındaysa)
4. Package name: `com.kolayfit.app`
5. App name: `KolayFit`

**Android App ID:** `ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ`

### Adım 3: Rewarded Ad Unit Oluşturun

1. AdMob Console'da uygulama sayfasına gidin
2. "Ad units" > "Add ad unit" tıklayın
3. Format: **Rewarded**
4. Ad unit name: `KolayFit Rewarded Ad`

**iOS Rewarded Ad Unit ID:** `ca-app-pub-XXXXXXXXXXXXXXXX/1111111111`

**Android Rewarded Ad Unit ID:** `ca-app-pub-XXXXXXXXXXXXXXXX/2222222222`

---

## 🔐 Production ID'lerini Güncelleme

### 1. AdMobService.ts'yi Güncelleyin

Dosya: `src/services/AdMobService.ts`

```typescript
const AD_CONFIGS: { ios: AdMobConfig; android: AdMobConfig } = {
  ios: {
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', // iOS App ID
    rewardedAdUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/1111111111', // iOS Rewarded Ad Unit ID
    testMode: false, // PRODUCTION'da false yapın
  },
  android: {
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ', // Android App ID
    rewardedAdUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/2222222222', // Android Rewarded Ad Unit ID
    testMode: false, // PRODUCTION'da false yapın
  },
};
```

### 2. iOS Info.plist'i Güncelleyin

Dosya: `ios/App/App/Info.plist`

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

### 3. Android Manifest'i Güncelleyin

Dosya: `android/app/src/main/AndroidManifest.xml`

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ" />
```

---

## 🧪 Test Modu

### Mevcut Durum

Şu anda **Test Mode AÇIK**:
- Google'ın test reklam ID'leri kullanılıyor
- Gerçek para kazanılmıyor
- Reklamlar hemen yükleniyor

### Test ID'leri

```typescript
// iOS Test IDs
appId: 'ca-app-pub-3940256099942544~1458002511'
rewardedAdUnitId: 'ca-app-pub-3940256099942544/1712485313'

// Android Test IDs
appId: 'ca-app-pub-3940256099942544~3347511713'
rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917'
```

### Test Cihazı Ekleme

Eğer gerçek ID'lerle test yapmak istiyorsanız:

1. Uygulamayı cihazda çalıştırın
2. Logları kontrol edin, AdMob test cihaz ID'sini göreceksiniz:
   ```
   To get test ads on this device, set: AdMobPlugin.addTestDeviceId('DEVICE_ID_HERE')
   ```

3. `AdMobService.ts`'de test cihazı ekleyin:

```typescript
await AdMob.initialize({
  requestTrackingAuthorization: true,
  testingDevices: ['YOUR_DEVICE_ID_HERE'],
  initializeForTesting: config.testMode,
});
```

---

## 📺 Reklam Türleri

### Rewarded Video Ads (Kullanımda)

- Kullanıcı reklamı izlediğinde ödül kazanır
- KolayFit'te kullanım limitleri açmak için kullanılıyor
- **Kullanım Yerleri:**
  - Photo Analysis (3/gün)
  - Detailed Analysis (her biri 1 reklam)
  - Diet Plan (1/hafta)

### Flow

1. Kullanıcı özellik kullanmak ister
2. `AdRewardService.checkAdLimit()` kontrolü
3. Limit doluysa `AdRewardDialog` açılır
4. `AdMobService.showRewardedAd()` çağrılır
5. Reklam izlendikten sonra ödül verilir
6. `AdRewardService.recordAdWatch()` ile kaydedilir
7. Özellik unlock edilir

---

## 🐛 Sorun Giderme

### iOS Build Hataları

**Hata:** "AdMob framework not found"

**Çözüm:**
```bash
cd ios/App
pod install
```

### Android Build Hataları

**Hata:** "Google Play Services version conflict"

**Çözüm:**
`android/build.gradle` dosyasına ekleyin:
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

### Reklam Yüklenmiyor

**Kontrol Listesi:**
1. Internet bağlantısı var mı?
2. AdMob hesabınız aktif mi?
3. Test mode açık mı?
4. App ID ve Ad Unit ID doğru mu?
5. iOS'ta App Tracking Transparency izni verildi mi?

**Log Kontrolü:**
```bash
# iOS
npx cap run ios

# Android
npx cap run android
```

### iOS App Tracking Transparency

iOS 14.5+ için kullanıcıdan izin istenir:

```typescript
await AdMob.initialize({
  requestTrackingAuthorization: true, // Bu önemli!
});
```

Kullanıcı izin vermezse:
- Kişiselleştirilmemiş reklamlar gösterilir
- Kazanç düşebilir
- Yine de reklamlar çalışır

---

## 📊 Revenue & Analytics

### AdMob Console'da İzleme

1. [AdMob Console](https://apps.admob.com/) > Apps
2. KolayFit uygulamasını seçin
3. Dashboard'da görecekleriniz:
   - **Impressions:** Gösterilen reklam sayısı
   - **Estimated earnings:** Tahmini kazanç
   - **eCPM:** 1000 gösterim başına kazanç
   - **Fill rate:** Reklam doldurulma oranı

### Database Analytics

KolayFit'te reklam verileri `ad_watch_history` tablosunda:

```sql
SELECT
  ad_type,
  COUNT(*) as total_watches,
  SUM(CASE WHEN reward_granted THEN 1 ELSE 0 END) as completed_watches,
  AVG(ad_duration_seconds) as avg_duration
FROM ad_watch_history
WHERE watched_at > NOW() - INTERVAL '30 days'
GROUP BY ad_type;
```

---

## 🚀 Production Checklist

- [ ] Google AdMob hesabı oluşturuldu
- [ ] iOS ve Android uygulamaları eklendi
- [ ] Rewarded Ad Units oluşturuldu
- [ ] Production ID'leri `AdMobService.ts`'de güncellendi
- [ ] iOS `Info.plist` güncellendi
- [ ] Android `AndroidManifest.xml` güncellendi
- [ ] `testMode: false` yapıldı
- [ ] Test cihazları eklendi (gerekirse)
- [ ] iOS ve Android'de test edildi
- [ ] AdMob Console'da reklamlar görünüyor
- [ ] Revenue tracking çalışıyor

---

## 📞 Destek

Sorular için:
- AdMob Dokümanları: https://developers.google.com/admob
- Capacitor Plugin: https://github.com/capacitor-community/admob
- KolayFit Geliştirici: [İletişim bilgisi]

---

**Son Güncelleme:** 2024-12-24
**Versiyon:** FAZ 3 - v1.0
