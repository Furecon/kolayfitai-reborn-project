# AdMob Production Configuration

## 🎯 Hızlı Başlangıç: Test'ten Production'a Geçiş

### 1️⃣ Google AdMob Console'dan ID'leri Alın

**Gerekli ID'ler:**
- iOS App ID
- iOS Rewarded Ad Unit ID
- Android App ID
- Android Rewarded Ad Unit ID

### 2️⃣ 3 Dosyayı Güncelleyin

#### A) `src/services/AdMobService.ts`

**Değiştirin:**
```typescript
const AD_CONFIGS: { ios: AdMobConfig; android: AdMobConfig } = {
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511', // ❌ TEST ID
    rewardedAdUnitId: 'ca-app-pub-3940256099942544/1712485313', // ❌ TEST ID
    testMode: true, // ❌ TEST MODE
  },
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713', // ❌ TEST ID
    rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917', // ❌ TEST ID
    testMode: true, // ❌ TEST MODE
  },
};
```

**Şu şekilde:**
```typescript
const AD_CONFIGS: { ios: AdMobConfig; android: AdMobConfig } = {
  ios: {
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', // ✅ GERÇEK iOS App ID
    rewardedAdUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/1111111111', // ✅ GERÇEK iOS Rewarded Ad Unit ID
    testMode: false, // ✅ PRODUCTION MODE
  },
  android: {
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ', // ✅ GERÇEK Android App ID
    rewardedAdUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/2222222222', // ✅ GERÇEK Android Rewarded Ad Unit ID
    testMode: false, // ✅ PRODUCTION MODE
  },
};
```

---

#### B) `ios/App/App/Info.plist`

**Bulun (satır 59):**
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string> ❌ TEST ID
```

**Değiştirin:**
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string> ✅ GERÇEK iOS App ID
```

---

#### C) `android/app/src/main/AndroidManifest.xml`

**Bulun (satır 51-54):**
```xml
<!-- AdMob App ID -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713" /> ❌ TEST ID
```

**Değiştirin:**
```xml
<!-- AdMob App ID -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ" /> ✅ GERÇEK Android App ID
```

---

## ✅ Kontrol Listesi

Değişikliklerden sonra kontrol edin:

- [ ] **AdMobService.ts**
  - [ ] iOS appId değişti
  - [ ] iOS rewardedAdUnitId değişti
  - [ ] iOS testMode = false
  - [ ] Android appId değişti
  - [ ] Android rewardedAdUnitId değişti
  - [ ] Android testMode = false

- [ ] **Info.plist (iOS)**
  - [ ] GADApplicationIdentifier değişti

- [ ] **AndroidManifest.xml (Android)**
  - [ ] com.google.android.gms.ads.APPLICATION_ID değişti

---

## 🧪 Test Etme

### Capacitor Sync

```bash
npm run build
npx cap sync
```

### iOS Test

```bash
npx cap open ios
# Xcode'da gerçek cihazda çalıştırın
```

### Android Test

```bash
npx cap open android
# Android Studio'da gerçek cihazda çalıştırın
```

---

## 📊 Doğrulama

### 1. Uygulama Logları

**Başarılı Initialize:**
```
[AdMob] Initializing with config: { platform: 'ios', appId: 'ca-app-pub-XXX...', testMode: false }
[AdMob] Initialized successfully
[AdMob] Preloading rewarded ad...
[AdMob] Rewarded ad loaded
```

**Hatalı Initialize:**
```
[AdMob] Initialization failed: Invalid app ID
```

### 2. AdMob Console

1. [AdMob Console](https://apps.admob.com/) > Apps
2. KolayFit seçin
3. 24 saat içinde ilk impression'ları görmelisiniz

---

## ⚠️ Önemli Notlar

### Test Cihazları

Production'da kendi cihazınızda test yaparken, test cihazı olarak ekleyin:

```typescript
await AdMob.initialize({
  requestTrackingAuthorization: true,
  testingDevices: ['YOUR_DEVICE_ID'], // Kendi cihaz ID'niz
  initializeForTesting: false, // Production modunda false
});
```

### İlk Reklamlar

- İlk reklamların gösterilmesi **1-2 saat** sürebilir
- AdMob'un sisteminizi tanıması gerekir
- İlk günlerde fill rate düşük olabilir

### Policy Compliance

AdMob kullanırken:
- Reklamların yanlışlıkla tıklanmasını önleyin
- Kullanıcıları reklamlara tıklamaya zorlamayın
- Gizlilik politikanızda reklamlardan bahsedin
- Çocuk odaklı içerikse COPPA uyumlu olun

---

## 🔄 Test Moduna Geri Dönme

Geliştirme sırasında test moduna dönmek için:

### AdMobService.ts

```typescript
testMode: true, // Test mode'a geri dön
```

Veya dynamic olarak:

```typescript
// App startup'ta
if (import.meta.env.DEV) {
  AdMobService.updateTestMode(true);
}
```

---

## 🚨 Sorun Giderme

### "Invalid AdMob App ID"

- ID'yi doğru kopyaladığınızdan emin olun
- `ca-app-pub-` ile başlamalı
- iOS ve Android ID'leri farklıdır

### "Ad failed to load"

- Internet bağlantısını kontrol edin
- AdMob hesabınızın aktif olduğundan emin olun
- İlk reklamların gelmesi 1-2 saat sürebilir

### "No fill"

- Normal bir durumdur, her zaman reklam olmayabilir
- Fill rate'i AdMob Console'dan izleyin
- Mediation ekleyerek fill rate'i artırabilirsiniz

---

## 📞 İletişim

AdMob desteği için:
- https://support.google.com/admob

KolayFit geliştirme için:
- [İletişim bilgisi]

---

**Önemli:** Production ID'lerini değiştirdikten sonra mutlaka gerçek cihazda test edin!
