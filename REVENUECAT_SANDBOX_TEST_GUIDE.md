# RevenueCat Sandbox Test Rehberi

Bu dosya, RevenueCat ile sandbox/test modunda nasıl test yapılacağını açıklar.

## 🔑 API KEY YÖNETİMİ (OTOMATIK)

Sistem artık otomatik olarak doğru API key'i kullanıyor:

### **Akıllı Key Seçimi:**

```typescript
// Debug/Development Build → TEST KEY
const REVENUECAT_TEST_KEY = 'test_ZXdniENlMjfZcXxZKRFvITNyJda';

// Release/Production Build → PRODUCTION KEY
const REVENUECAT_PRODUCTION_KEY = 'goog_JmFVcxazPsmfZigZlmVZwbAiXWA';
```

### **Nasıl Çalışır?**

| Build Tipi | API Key Kullanılır | Mod | Test mi? |
|------------|-------------------|-----|----------|
| `npm run dev` | TEST key | Sandbox | ✅ Evet |
| `npm run build:dev` | TEST key | Sandbox | ✅ Evet |
| `npm run build` (production) | PRODUCTION key | Production | ❌ Hayır |
| Android Studio Debug Build | TEST key | Sandbox | ✅ Evet |
| Android Studio Release Build | PRODUCTION key | Production | ❌ Hayır |

**ÖNEMLİ:** Manuel olarak key değiştirmenize gerek YOK! Sistem otomatik karar veriyor.

---

## 🧪 SANDBOX TEST NASIL YAPILIR?

### **ADIM 1: Debug Build Oluştur**

```bash
# Development build (TEST key kullanır)
npm run build:dev

# Capacitor sync
npx cap sync android

# Android Studio'da aç
npx cap open android
```

### **ADIM 2: Android Studio'da Debug Build**

1. Android Studio'da **Build** → **Select Build Variant**
2. **"debug"** seçin (release DEĞİL!)
3. **Run** butonuna basın veya **Shift+F10**

**Bu şekilde TEST key kullanılacak!**

---

## 📊 LOG KONTROL

Uygulamayı açtığınızda logları kontrol edin:

**Android Studio → Logcat:**

```
Filter: tag:Purchase
```

**Sandbox Modunda Beklenen Log:**

```
🚀 Initializing purchase service for native platform
🔑 Using RevenueCat TEST/SANDBOX API key
✅ RevenueCat configured successfully in SANDBOX mode
```

**Production Modunda Beklenen Log:**

```
🚀 Initializing purchase service for native platform
🔑 Using RevenueCat PRODUCTION API key
✅ RevenueCat configured successfully in PRODUCTION mode
```

**Bu log'u mutlaka kontrol edin!** Hangi key'in kullanıldığını gösterir.

---

## 🎯 SANDBOX VS PRODUCTION FARKLARI

### **Sandbox Mode (Test):**

✅ **Avantajlar:**
- Gerçek para ödenmez
- Test purchases otomatik approve edilir
- Hızlı test iterasyonu
- Subscription'lar hızlı expire olur (test için)
- Google Play tester listesinde olmanız yeterli

❌ **Dezavantajlar:**
- Gerçek ödeme akışını test edemezsiniz
- Bazı edge case'ler farklı davranabilir

### **Production Mode (Canlı):**

✅ **Avantajlar:**
- Gerçek ödeme akışı
- Gerçek kullanıcı deneyimi
- Tüm Google Play özellikleri

❌ **Dezavantajlar:**
- Gerçek para ödenir (test hesapları bile)
- Refund işlemi gerekebilir
- Yavaş test süreci

---

## 🔧 TEST SENARYOLARI

### **Senaryo 1: Aylık Abonelik Test**

1. Uygulamayı debug modda çalıştırın
2. Giriş yapın
3. **Dashboard** → **Premium'a Geç**
4. **Aylık Plana Geç** butonuna tıklayın
5. Google Play ödeme ekranı açılmalı
6. Fiyat: **149,99 ₺** görünmeli
7. "Test" badge veya "Sandbox" göstergesi olmalı
8. Satın almayı tamamlayın

**Beklenen:**
- ✅ Gerçek para ödenmez
- ✅ Subscription hemen aktif olur
- ✅ Database'e yazılır
- ✅ User premium olur

### **Senaryo 2: Yıllık Abonelik Test**

Aynı adımlar, fakat **Yıllık Plana Geç** butonuna tıklayın.

**Beklenen fiyat:** 1.499,99 ₺

### **Senaryo 3: Offerings Test**

RevenueCat Dashboard'da offerings yapılandırması varsa:

```
🛍️ Purchasing via package: monthly
✅ Purchase successful
```

Offerings yoksa fallback:

```
⚠️ No offerings available, trying direct purchase...
🔄 Attempting direct product purchase with ID: monthly_249_99
✅ Direct purchase successful
```

---

## ⚙️ MANUEL KEY DEĞİŞTİRME (GEREKİRSE)

Eğer manuel olarak test key kullanmak isterseniz:

### **Yöntem 1: Build Komutu**

```bash
# Test key için
npm run build:dev

# Production key için
npm run build
```

### **Yöntem 2: Kod Değişikliği (Tavsiye Edilmez)**

`src/services/PurchaseService.ts` dosyasında:

```typescript
// Test modunu zorla
const isDebugMode = true; // Her zaman test key kullan

// Production modunu zorla
const isDebugMode = false; // Her zaman production key kullan
```

**NOT:** Bu yöntemi sadece debug için kullanın, commit etmeyin!

---

## 🐛 SORUN GİDERME

### **Hata 1: "Test purchases not working"**

**Çözüm:**
1. Log'larda `TEST/SANDBOX API key` yazıyor mu kontrol edin
2. Android Studio'da **debug** build variant seçili mi kontrol edin
3. Google Play'de test hesabı tester listesinde mi kontrol edin
4. RevenueCat Dashboard → Settings → Sandbox → Test user ekleyin

### **Hata 2: "Production key is being used instead of test key"**

**Çözüm:**
1. `npm run build:dev` komutu ile build edin
2. Android Studio'da **debug** variant seçin
3. `import.meta.env.DEV` veya `import.meta.env.MODE === 'development'` true mu kontrol edin

### **Hata 3: "Real money is being charged"**

**ÖNEMLİ:** Bu durumda HEMEN DURUN!

**Çözüm:**
1. Uygulamayı kapatın
2. Log'larda hangi key kullanıldığını kontrol edin
3. Eğer PRODUCTION key kullanılıyorsa, debug build yapın
4. Google Play Console'da refund isteyin

---

## 📋 TEST KONTROL LİSTESİ

Test öncesi bu listeyi kontrol edin:

**Build Kontrolleri:**
- [ ] `npm run build:dev` komutu çalıştırıldı
- [ ] `npx cap sync android` yapıldı
- [ ] Android Studio'da **debug** variant seçildi
- [ ] APK debug modda build edildi

**RevenueCat Kontrolleri:**
- [ ] Test API key doğru: `test_ZXdniENlMjfZcXxZKRFvITNyJda`
- [ ] Production API key doğru: `goog_JmFVcxazPsmfZigZlmVZwbAiXWA`
- [ ] RevenueCat Dashboard'da test user eklendi (kendi email'iniz)

**Google Play Kontrolleri:**
- [ ] Test hesabı tester listesinde
- [ ] Subscriptions oluşturuldu: `monthly_249_99`, `yearly_2499_99`
- [ ] Her iki subscription "Active" durumda

**Log Kontrolleri:**
- [ ] `🔑 Using RevenueCat TEST/SANDBOX API key` yazıyor
- [ ] `✅ RevenueCat configured successfully in SANDBOX mode` yazıyor
- [ ] Hata mesajı YOK

**Test Kontrolleri:**
- [ ] Satın alma ekranı açılıyor
- [ ] Fiyat doğru görünüyor (149,99 ₺ veya 1.499,99 ₺)
- [ ] "Test" veya "Sandbox" badge görünüyor
- [ ] Gerçek para ÖDENMİYOR
- [ ] Satın alma başarılı oluyor
- [ ] User premium oluyor
- [ ] Database'e yazılıyor

---

## 🎓 İPUÇLARI

### **1. Her Zaman Debug Build İle Test Edin**

Production build sadece canlıya çıkacağınız zaman!

### **2. Log'ları Takip Edin**

Hangi key'in kullanıldığını log'lardan anlayabilirsiniz:

```
🔑 Using RevenueCat TEST/SANDBOX API key  ← Bu olmalı!
```

### **3. Test Hesabı Mutlaka Tester Listesinde Olmalı**

Google Play Console → Testing → Internal/Closed Testing → Testers

Test email'inizi ekleyin, yoksa sandbox çalışmaz!

### **4. RevenueCat Dashboard'da Test User Ekleyin**

RevenueCat Dashboard → Project Settings → Sandbox → Test Users

Kendi email'inizi ekleyin.

### **5. Clear Data Yapın**

Eğer sorun yaşıyorsanız:

1. Uygulamayı uninstall edin
2. RevenueCat Dashboard'da user'ı reset edin
3. Uygulamayı tekrar install edin

---

## 🚀 PRODUCTION'A ÇIKMADAN ÖNCE

Production build yapmadan önce:

1. ✅ Tüm sandbox testler başarılı
2. ✅ Google Play Console'da app yayında
3. ✅ RevenueCat'te offerings yapılandırıldı
4. ✅ Fiyatlar son kez kontrol edildi
5. ✅ Backend production'da çalışıyor
6. ✅ Database production'da hazır

**Sonra:**

```bash
# Production build
npm run build

# Sync
npx cap sync android

# Android Studio'da RELEASE variant seç
# Build → Generate Signed Bundle/APK
```

**Bu şekilde PRODUCTION key kullanılacak ve gerçek ödemeler alacaksınız!**

---

## 📞 DESTEK

Sorun yaşıyorsanız:

1. **Log'ları kontrol edin** - En önemli adım!
2. **RevenueCat Dashboard'da debug logs** açık mı kontrol edin
3. **Google Play Console'da test hesabı** doğru mu kontrol edin
4. **Bu dokümandaki kontrol listesini** tekrar gözden geçirin

**KEY NOTLAR:**
- Test key: `test_ZXdniENlMjfZcXxZKRFvITNyJda` ✅
- Production key: `goog_JmFVcxazPsmfZigZlmVZwbAiXWA` ✅
- Sistem otomatik seçiyor, manuel değiştirmeyin!

---

## ✅ ÖZET

**Debug Build:**
```bash
npm run build:dev  →  TEST KEY  →  Sandbox Mode  →  Gerçek para ödenmez ✅
```

**Production Build:**
```bash
npm run build  →  PRODUCTION KEY  →  Live Mode  →  Gerçek para ödenir ⚠️
```

**Sistem otomatik karar veriyor, siz sadece doğru build komutunu çalıştırın!**

İyi testler! 🧪
