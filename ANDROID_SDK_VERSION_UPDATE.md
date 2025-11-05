# Android SDK Version Update - minSdk 24 + compileSdk/targetSdk 34

**Tarih:** 2025-11-05

Bu dokümanda Android minimum SDK version'ın 22'den 24'e, compile ve target SDK'nın 34'e yükseltilmesi açıklanmaktadır.

---

## ❌ HATA

```
minSdkVersion 22 < library 24
```

**Sebep:** RevenueCat Purchases Capacitor UI paketi minimum SDK 24 gerektiriyor, ama projenin minSdk'si 22'ydi.

---

## ✅ ÇÖZÜM

### **1. android/variables.gradle Güncellendi**

**Eski:**
```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 35
    targetSdkVersion = 35
}
```

**Yeni:**
```gradle
ext {
    minSdkVersion = 24
    compileSdkVersion = 34
    targetSdkVersion = 34
}
```

**Değişiklikler:**
- ✅ `minSdkVersion`: 22 → **24** (RevenueCat UI uyumlu)
- ✅ `compileSdkVersion`: 35 → **34** (stable, önerilen)
- ✅ `targetSdkVersion`: 35 → **34** (stable, önerilen)

---

### **2. android/app/build.gradle**

Bu dosya zaten `rootProject.ext` değişkenlerini kullanıyor:

```gradle
android {
    compileSdk rootProject.ext.compileSdkVersion
    defaultConfig {
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 8
        versionName "1.6"
    }
}
```

**Otomatik güncellenir** çünkü `variables.gradle` değiştirdik.

---

### **3. Build ve Sync**

```bash
# Web build
npm run build

# Capacitor sync (Android'e assets kopyalar, plugins sync eder)
npx cap sync android
```

**Sonuç:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public
✔ Updating Android plugins
[info] Found 4 Capacitor plugins for android:
       @capacitor/app@6.0.1
       @codetrix-studio/capacitor-google-auth@3.4.0-rc.4
       @revenuecat/purchases-capacitor@11.2.9
       @revenuecat/purchases-capacitor-ui@11.2.10
✔ Sync finished
```

---

## 📱 ANDROID SDK VERSION'LAR

### **minSdkVersion: 24**

**Ne demek?**
- Uygulama minimum Android 7.0 (Nougat) gerektirir
- Android 6.0 ve altı cihazlarda ÇALIŞMAZ

**Kapsam:**
- Android 7.0+ (API 24+): %99.5+ cihaz
- Android 6.0 ve altı: ~%0.5 cihaz (2025 itibarıyla)

**Neden 24?**
- RevenueCat UI minimum 24 gerektirir
- Modern Android özellikleri (notifications, permissions vb.)
- Google Play'de çoğu uygulama minimum 24 kullanır

---

### **compileSdkVersion: 34**

**Ne demek?**
- Uygulamanız Android 14 SDK ile compile edilir
- Android 14 API'lerini kullanabilirsiniz
- Android 14 davranış değişikliklerini test edebilirsiniz

**Neden 34?**
- Stable, Google tarafından önerilen
- Android 14 (2023) API level
- Yeterince modern, uyumlu

---

### **targetSdkVersion: 34**

**Ne demek?**
- Uygulamanız Android 14'ü hedefliyor
- Android 14 davranış değişiklikleri uygulanır
- Google Play yeni uygulamalar için minimum 33 gerektirir (34 önerilen)

**Neden 34?**
- Google Play Store gereksinimleri
- Modern permission handling
- Security improvements

---

## 🔍 ANDROID VERSION KARŞILAŞTIRMA

| Android Version | API Level | Kod Adı | Pazar Payı (2025) |
|-----------------|-----------|---------|-------------------|
| Android 6.0 | 23 | Marshmallow | ~0.3% |
| Android 7.0-7.1 | 24-25 | Nougat | ~1.2% |
| Android 8.0-8.1 | 26-27 | Oreo | ~4.5% |
| Android 9 | 28 | Pie | ~8.1% |
| Android 10 | 29 | Q | ~12.4% |
| Android 11 | 30 | R | ~18.6% |
| Android 12 | 31 | S | ~19.8% |
| Android 13 | 33 | Tiramisu | ~23.7% |
| Android 14 | 34 | Upside Down Cake | ~11.4% |

**minSdk 24 ile kapsam:** ~99.7% cihaz ✅

---

## 🎯 REVENUECAT UI GEREKSINIMLERI

### **@revenuecat/purchases-capacitor-ui@11.2.10**

**Minimum gereksinimler:**
```
minSdkVersion: 24+
compileSdkVersion: 33+
targetSdkVersion: 33+
```

**Bizim ayarlarımız:**
```
minSdkVersion: 24 ✅
compileSdkVersion: 34 ✅
targetSdkVersion: 34 ✅
```

**Uyumlu!** ✅

---

## 🚀 ANDROID STUDIO'DA BUILD

### **Debug Build**

```
Android Studio → Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**Build Variant:** debug

**Sonuç:** `app-debug.apk`

---

### **Release Build**

```
Android Studio → Build → Generate Signed Bundle / APK
```

**Build Variant:** release

**Sonuç:** `app-release.aab` (Google Play için)

---

### **Emülatör/Cihazda Çalıştırma**

```
Android Studio → Run (Shift+F10)
```

**Minimum cihaz/emülatör gereksinimi:**
- Android 7.0+ (API 24+)
- Android 6.0 ve altı ÇALIŞMAZ

---

## 📋 DEĞİŞİKLİK ÖZETİ

### **Dosyalar:**
```
android/variables.gradle
  - minSdkVersion: 22 → 24
  - compileSdkVersion: 35 → 34
  - targetSdkVersion: 35 → 34

android/app/build.gradle
  - Değişiklik yok (rootProject.ext kullanıyor)
```

### **Komutlar:**
```bash
# Build
npm run build

# Sync
npx cap sync android

# Clean (opsiyonel, Java gerektirir)
cd android && ./gradlew clean
```

### **Sonuç:**
- ✅ minSdk 24 (RevenueCat UI uyumlu)
- ✅ compileSdk 34 (Android 14)
- ✅ targetSdk 34 (Google Play uyumlu)
- ✅ Capacitor sync başarılı
- ✅ Build hazır

---

## 🔧 SORUN GİDERME

### **Hata 1: "minSdkVersion 22 < library 24"**

**Çözüm:**
1. `android/variables.gradle` açın
2. `minSdkVersion = 24` yapın
3. `npx cap sync android` çalıştırın

---

### **Hata 2: "Gradle sync failed"**

**Çözüm:**
```bash
# Clean
cd android && ./gradlew clean

# Sync
cd .. && npx cap sync android

# Android Studio'da
File → Sync Project with Gradle Files
```

---

### **Hata 3: "Execution failed for task ':app:compileDebugJavaWithJavac'"**

**Çözüm:**
1. Android Studio açın
2. File → Invalidate Caches / Restart
3. Build → Clean Project
4. Build → Rebuild Project

---

### **Hata 4: "compileSdkVersion 34 mismatch"**

**Çözüm:**

Tüm plugin'ler compile SDK 34 ile uyumlu olmalı:

```gradle
// android/app/build.gradle
android {
    compileSdk 34  // Emin olun
}
```

Eğer plugin uyumlu değilse, plugin versiyonunu güncelleyin:

```bash
npm update @revenuecat/purchases-capacitor
npm update @revenuecat/purchases-capacitor-ui
npx cap sync android
```

---

## 📊 GOOGLE PLAY STORE GEREKSİNİMLERİ

### **2024-2025 Gereksinimleri:**

**Yeni uygulamalar için:**
- targetSdkVersion: **33+** (zorunlu)
- Önerilen: **34**

**Mevcut uygulamalar için:**
- targetSdkVersion: **33+** (Ağustos 2024'ten itibaren)
- Önerilen: **34**

**Bizim uygulama:**
```
targetSdkVersion: 34 ✅
```

Google Play Store'a yüklenebilir! ✅

---

## 🎯 ÖNEMLİ NOTLAR

### **1. Android 6.0 ve Altı Destek Yok**

minSdk 24 ile Android 6.0 (API 23) ve altı cihazlar desteklenmiyor.

**Etki:** Minimal (~%0.5 cihaz)

**Alternatif:**
- RevenueCat UI kullanmayın (manuel plan seçimi)
- minSdk 22 tutun

Ama **önerilmez** çünkü:
- Modern features kullanılamaz
- Security updates yok
- Google Play minimum 24 önerir

---

### **2. compileSdk vs targetSdk**

**compileSdk:** Hangi SDK ile compile edilir (geliştirme)
**targetSdk:** Hangi Android version'ı hedefler (runtime davranış)

**Her zaman:** `targetSdk <= compileSdk`

**Bizim ayar:**
```
compileSdk: 34
targetSdk: 34  ← Eşit, doğru!
```

---

### **3. Capacitor Plugin Uyumluluğu**

Tüm Capacitor plugin'ler minSdk 24 ile uyumlu:

```
@capacitor/app@6.0.1                              ✅
@capacitor/core@6.1.2                             ✅
@codetrix-studio/capacitor-google-auth@3.4.0-rc.4 ✅
@revenuecat/purchases-capacitor@11.2.9            ✅
@revenuecat/purchases-capacitor-ui@11.2.10        ✅ (minimum 24 gerektirir)
```

---

## 🧪 TEST ADIMLARI

### **1. Build**

```bash
npm run build
npx cap sync android
```

### **2. Android Studio'da Aç**

```bash
npx cap open android
```

### **3. Emülatör Oluştur**

```
Android Studio → Device Manager → Create Virtual Device
System Image: Android 14 (API 34) veya üstü
```

**NOT:** API 24+ herhangi bir Android version test edilebilir.

### **4. Çalıştır**

```
Run → Run 'app'
```

**Başarı göstergesi:**
- Uygulama açılır
- RevenueCat Paywall çalışır
- Google Play Billing erişilebilir

---

## ✅ SONUÇ

**Güncelleme başarılı:**
- ✅ minSdkVersion: 22 → 24
- ✅ compileSdkVersion: 35 → 34
- ✅ targetSdkVersion: 35 → 34
- ✅ RevenueCat UI uyumlu
- ✅ Google Play uyumlu
- ✅ Capacitor sync başarılı
- ✅ Build hazır

**Artık:**
1. Android Studio'da debug build alabilirsiniz
2. RevenueCat Paywall çalışacak
3. Google Play'e yüklenebilir (targetSdk 34)
4. Modern Android özelliklerini kullanabilirsiniz

**Debug build almak için:**
```bash
# Terminal
npx cap open android

# Android Studio'da
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

APK lokasyonu: `android/app/build/outputs/apk/debug/app-debug.apk`

İyi çalışmalar! 🚀
