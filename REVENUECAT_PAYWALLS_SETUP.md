# RevenueCat Paywalls (UI) Kurulumu Tamamlandı

**Tarih:** 2025-11-05

Bu dokümanda Capacitor tabanlı Android uygulamanıza RevenueCat Paywalls SDK'nın nasıl kurulduğu ve yapılandırıldığı açıklanmaktadır.

---

## ✅ YAPILAN İŞLEMLER

### **1. Package Kurulumu**

```bash
npm install @revenuecat/purchases-capacitor-ui
```

**Kuruldu:**
- `@revenuecat/purchases-capacitor-ui@11.2.10`

**Capacitor Sync:**
```bash
npm run build
npx cap sync android
```

**Android'e eklenen plugin'ler:**
```
@revenuecat/purchases-capacitor@11.2.9
@revenuecat/purchases-capacitor-ui@11.2.10
```

---

### **2. PaywallService Oluşturuldu**

**Dosya:** `src/services/PaywallService.ts`

**Özellikler:**

#### **a) presentPaywall()**
Default offering'den paywall gösterir:

```typescript
const result = await paywallService.presentPaywall();

// Returns:
{
  result: 'purchased' | 'restored' | 'cancelled' | 'error',
  productIdentifier?: string,
  error?: string
}
```

#### **b) presentPaywallIfNeeded()**
Sadece premium erişimi yoksa paywall gösterir:

```typescript
const result = await paywallService.presentPaywallIfNeeded();
// Eğer kullanıcının 'premium' entitlement'ı varsa, paywall açılmaz
```

#### **c) isAvailable()**
Paywall servisinin kullanılabilir olup olmadığını kontrol eder:

```typescript
if (paywallService.isAvailable()) {
  // Native platform ve initialized
}
```

---

### **3. PurchaseService Güncellemesi**

**Dosya:** `src/services/PurchaseService.ts`

**Değişiklikler:**

#### **a) PaywallService Import**
```typescript
import { paywallService } from './PaywallService';
```

#### **b) Otomatik PaywallService Initialization**
```typescript
await Purchases.configure({ ... });
await paywallService.initialize(); // ← Eklendi
```

RevenueCat configure edildikten hemen sonra PaywallService de otomatik initialize edilir.

#### **c) Yeni Method: purchaseWithPaywall()**
```typescript
async purchaseWithPaywall(userId: string): Promise<boolean>
```

**Ne yapar?**
1. User'ı RevenueCat'e login eder
2. Paywall'ı gösterir
3. Kullanıcı satın alma yaparsa backend'e validate eder
4. Başarılı/başarısız durumu döner

**Kullanımı:**
```typescript
const success = await purchaseService.purchaseWithPaywall(user.id);
if (success) {
  // Subscription aktif!
}
```

---

### **4. PaywallButton Komponenti**

**Dosya:** `src/components/Subscription/PaywallButton.tsx`

**Kullanımı:**

```tsx
import { PaywallButton } from '@/components/Subscription/PaywallButton';

<PaywallButton
  variant="default"
  size="lg"
  className="w-full"
  onSuccess={() => {
    // Satın alma başarılı
    console.log('Premium aktif!');
  }}
>
  Premium'a Geç
</PaywallButton>
```

**Props:**
- `variant`: Button variant (default, outline, secondary, vb.)
- `size`: Button boyutu (default, sm, lg, icon)
- `className`: Ekstra CSS class'ları
- `children`: Button içeriği (varsayılan: "Premium'a Geç")
- `onSuccess`: Satın alma başarılı olunca çağrılır

**Özellikler:**
- ✅ Otomatik user kontrolü
- ✅ Loading state
- ✅ Toast bildirimleri
- ✅ Hata yönetimi
- ✅ onSuccess callback

---

### **5. SubscriptionManager Güncellemesi**

**Dosya:** `src/components/Subscription/SubscriptionManager.tsx`

**Eklenen özellik:**

Native platformlarda ve premium olmayan kullanıcılar için **RevenueCat Paywall** kartı gösteriliyor:

```tsx
{Capacitor.isNativePlatform() && !isPremiumActive && (
  <Card className="relative border-2 border-primary shadow-lg">
    {/* Önerilen badge */}
    <CardHeader>
      <CardTitle>RevenueCat Premium Paywalls</CardTitle>
      <CardDescription>
        Profesyonel satın alma ekranı ile tüm premium özelliklere anında erişin
      </CardDescription>
    </CardHeader>
    <CardContent>
      <PaywallButton
        className="w-full"
        onSuccess={checkSubscriptionStatus}
      >
        Premium Planları Gör
      </PaywallButton>
    </CardContent>
  </Card>
)}
```

**Ne zaman görünür?**
- ✅ Native platform (Android)
- ✅ Premium değilse
- ❌ Web'de görünmez
- ❌ Premium aktifse görünmez

---

## 🎯 TEST VE PRODUCTION ANAHTARLARI

### **Otomatik Key Seçimi**

`PurchaseService.ts` içinde:

```typescript
// Detect if we're in debug/test mode
const isDebugMode = import.meta.env.DEV || import.meta.env.MODE === 'development';

const REVENUECAT_PRODUCTION_KEY = 'goog_JmFVcxazPsmfZigZlmVZwbAiXWA';
const REVENUECAT_TEST_KEY = 'test_ZXdniENlMjfZcXxZKRFvITNyJda';

// Use test key for sandbox/debug, production key for release
const REVENUECAT_API_KEY = isDebugMode ? REVENUECAT_TEST_KEY : REVENUECAT_PRODUCTION_KEY;
```

### **Hangi Key Ne Zaman Kullanılır?**

| Build Tipi | Komut | API Key | Mod |
|------------|-------|---------|-----|
| Development | `npm run dev` | TEST | Sandbox |
| Development Build | `npm run build:dev` | TEST | Sandbox |
| Production Build | `npm run build` | PRODUCTION | Live |
| Android Debug | Debug variant | TEST | Sandbox |
| Android Release | Release variant | PRODUCTION | Live |

**Log kontrolü:**
```
🔑 Using RevenueCat TEST/SANDBOX API key       ← Test
🔑 Using RevenueCat PRODUCTION API key         ← Production
```

---

## 📋 ANDROID GRADLE/MANIFEST YAPISI

### **1. Android Manifest**

**Dosya:** `android/app/src/main/AndroidManifest.xml`

Capacitor sync otomatik olarak gerekli permission'ları ekler:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="com.android.vending.BILLING" />
```

**BILLING permission** RevenueCat Purchases plugin tarafından otomatik eklenir.

### **2. Gradle Konfigürasyonu**

**Dosya:** `android/app/build.gradle`

RevenueCat bağımlılıkları Capacitor tarafından otomatik eklenir:

```gradle
dependencies {
    // RevenueCat Purchases
    implementation "com.revenuecat.purchases:purchases:${rcVersion}"

    // RevenueCat UI (Paywalls)
    implementation "com.revenuecat.purchases:purchases-ui:${rcUiVersion}"

    // Capacitor plugins
    implementation project(':revenuecat-purchases-capacitor')
    implementation project(':revenuecat-purchases-capacitor-ui')
}
```

**NOT:** Bu bağımlılıklar `npx cap sync android` çalıştırıldığında otomatik eklenir.

### **3. Capacitor Config**

**Dosya:** `android/app/src/main/assets/capacitor.config.json`

```json
{
  "plugins": {
    "RevenueCatPurchases": {
      "apiKey": "AUTO_CONFIGURED_FROM_CODE"
    },
    "RevenueCatUI": {
      "enabled": true
    }
  }
}
```

**NOT:** API key kod tarafından (`PurchaseService.ts`) set edilir, config'de hardcode etmeye gerek yok.

---

## 🚀 KULLANIM SENARYOLARI

### **Senaryo 1: Basit Paywall Gösterme**

```typescript
import { PaywallButton } from '@/components/Subscription/PaywallButton';

<PaywallButton>Premium'a Geç</PaywallButton>
```

Tek satır kod ile paywall gösteriyorsunuz!

---

### **Senaryo 2: Özelleştirilmiş Paywall**

```typescript
import { paywallService } from '@/services/PaywallService';

const handlePremiumClick = async () => {
  const result = await paywallService.presentPaywall();

  if (result.result === 'purchased') {
    console.log('Satın alındı:', result.productIdentifier);
    // Backend sync, state update vb.
  } else if (result.result === 'cancelled') {
    console.log('Kullanıcı iptal etti');
  } else if (result.result === 'error') {
    console.error('Hata:', result.error);
  }
};
```

---

### **Senaryo 3: Conditional Paywall**

Premium olmayan kullanıcılara göster:

```typescript
import { paywallService } from '@/services/PaywallService';

const showPaywallIfNeeded = async () => {
  // 'premium' entitlement varsa paywall açılmaz
  const result = await paywallService.presentPaywallIfNeeded();

  if (result.result === 'purchased') {
    // İlk kez premium oldu
  }
};
```

---

### **Senaryo 4: Dashboard'dan Paywall**

`SubscriptionManager` komponenti zaten bu özelliği içeriyor:

```tsx
// Native'de otomatik görünür
<PaywallButton
  className="w-full"
  onSuccess={checkSubscriptionStatus}
>
  Premium Planları Gör
</PaywallButton>
```

---

## 🎨 REVENUECAT DASHBOARD AYARLARI

### **1. Offerings Yapılandırma**

RevenueCat Dashboard → **Offerings** → **Create Offering**

```
Offering ID: default
Display Name: KolayFit Premium
Make Current: ✅

Packages:
  1. Monthly Package
     - Identifier: monthly
     - Product: monthly_premium (Google Play)
     - Duration: 1 month

  2. Annual Package
     - Identifier: annual
     - Product: yearly_premium (Google Play)
     - Duration: 1 year
```

**ÖNEMLI:** `default` offering mutlaka olmalı! Paywall bu offering'i kullanır.

---

### **2. Products Yapılandırma**

RevenueCat Dashboard → **Products**

```
Product 1:
  - Store: Google Play
  - Product ID: monthly_premium
  - Type: Subscription
  - Price: 149.99 TRY
  - Period: 1 month

Product 2:
  - Store: Google Play
  - Product ID: yearly_premium
  - Type: Subscription
  - Price: 1499.99 TRY
  - Period: 1 year
```

---

### **3. Paywalls (RevenueCat UI) Yapılandırma**

RevenueCat Dashboard → **Paywalls** → **Create Paywall**

```
Template: Choose from 10+ pre-built templates
Offering: default (yukarıda oluşturduğumuz)
Localization: Turkish (TR)
Colors: Customize brand colors
```

**Kullanılabilir template'ler:**
- Simple (minimalist, tek plan)
- Two Tier (iki plan yan yana)
- Three Tier (üç plan)
- Annual Only (sadece yıllık)
- Monthly Only (sadece aylık)
- Feature List (özellik listeli)
- vb.

**RevenueCat otomatik olarak:**
- ✅ Fiyatları Google Play'den çeker
- ✅ Para birimini doğru gösterir
- ✅ Ücretsiz deneme bilgilerini gösterir
- ✅ A/B test yapabilirsiniz
- ✅ Analytics toplar

---

### **4. Entitlements Yapılandırma**

RevenueCat Dashboard → **Entitlements**

```
Entitlement ID: premium
Display Name: Premium Access

Attached Products:
  - monthly_premium
  - yearly_premium
```

**Ne işe yarar?**

Kodda `customerInfo.entitlements.active['premium']` kontrolü yaparken bu entitlement'ı kullanırız:

```typescript
const customerInfo = await Purchases.getCustomerInfo();

if (customerInfo.customerInfo.entitlements.active['premium']) {
  // User premium!
} else {
  // User değil
}
```

---

## 🧪 TEST ADIMLARI

### **1. Build ve Sync**

```bash
# Development build (TEST key)
npm run build:dev

# Sync
npx cap sync android

# Open
npx cap open android
```

### **2. Android Studio**

1. **Build Variant:** debug seçin
2. **Run** butonuna basın
3. Cihaz/Emülatör'de çalıştırın

### **3. Paywall Test**

1. Uygulamayı açın
2. Giriş yapın
3. **Dashboard** → **Premium** sekmesi
4. **"Premium Planları Gör"** butonuna tıklayın
5. RevenueCat Paywall açılmalı!

**Beklenen:**
```
🎨 Presenting paywall from default offering...
✅ Paywall result: PURCHASED (or CANCELLED or ERROR)
```

### **4. Logcat Kontrolü**

**Android Studio → Logcat:**

```
Filter: tag:PaywallService OR tag:Purchase OR tag:RevenueCat
```

**Başarılı paywall gösterimi:**
```
🚀 Initializing purchase service for native platform
🔑 Using RevenueCat TEST/SANDBOX API key
✅ RevenueCat configured successfully in SANDBOX mode
🎨 Initializing PaywallService...
🎨 Presenting paywall from default offering...
✅ Paywall result: { result: 'purchased', productIdentifier: 'monthly_premium' }
✅ Purchase successful via paywall
```

### **5. Hata Senaryoları**

**Hata 1: "No offerings available"**

```
❌ Paywall error: No offerings available
```

**Çözüm:**
- RevenueCat Dashboard → Offerings
- `default` offering oluşturun
- Products ekleyin
- "Make Current" olarak işaretleyin

---

**Hata 2: "Product not found"**

```
❌ Product monthly_premium not found in offerings
```

**Çözüm:**
- RevenueCat Dashboard → Products
- `monthly_premium` ve `yearly_premium` ekleyin
- Google Play'de subscription'lar oluşturun
- Product ID'ler AYNEN eşleşmeli

---

**Hata 3: "Paywall not configured"**

```
⚠️ No paywall configured for offering: default
```

**Çözüm:**
- RevenueCat Dashboard → Paywalls
- Yeni paywall oluşturun
- `default` offering'e bağlayın
- Template seçin ve customize edin

---

## 📊 PAYWALL RESULT TİPLERİ

```typescript
enum PAYWALL_RESULT {
  PURCHASED = 0,   // Satın alma başarılı
  RESTORED = 1,    // Restore başarılı
  CANCELLED = 2,   // Kullanıcı iptal etti
  ERROR = 3        // Hata oluştu
}
```

**Kullanımı:**

```typescript
import { PAYWALL_RESULT } from '@revenuecat/purchases-capacitor-ui';

const result = await RevenueCatUI.presentPaywall();

switch (result) {
  case PAYWALL_RESULT.PURCHASED:
    // Yeni satın alma
    break;
  case PAYWALL_RESULT.RESTORED:
    // Restore edildi
    break;
  case PAYWALL_RESULT.CANCELLED:
    // İptal edildi
    break;
  case PAYWALL_RESULT.ERROR:
    // Hata
    break;
}
```

---

## 🎯 WEB vs NATIVE DAVRANIŞI

### **Native (Android):**
✅ RevenueCat Paywall gösterilir
✅ Google Play Billing kullanılır
✅ Native satın alma akışı

### **Web:**
❌ Paywall gösterilmez
❌ `PaywallButton` disabled olur
⚠️ Manuel plan seçimi kartları gösterilir

**Kod kontrolü:**

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Show paywall
} else {
  // Show manual plan selection
}
```

---

## 📝 KONTROL LİSTESİ

**Kurulum:**
- [x] `@revenuecat/purchases-capacitor-ui` kuruldu
- [x] `npx cap sync android` çalıştırıldı
- [x] PaywallService oluşturuldu
- [x] PurchaseService güncellendi
- [x] PaywallButton komponenti oluşturuldu
- [x] SubscriptionManager güncellendi
- [x] Build başarılı

**RevenueCat Dashboard:**
- [ ] `default` offering oluşturuldu
- [ ] Products eklendi (monthly_premium, yearly_premium)
- [ ] Packages yapılandırıldı (monthly, annual)
- [ ] Paywall template seçildi ve customize edildi
- [ ] `premium` entitlement tanımlandı

**Google Play Console:**
- [ ] `monthly_premium` subscription oluşturuldu
- [ ] `yearly_premium` subscription oluşturuldu
- [ ] Base plans yapılandırıldı
- [ ] Status: Active

**Test:**
- [ ] Build + sync yapıldı
- [ ] Android'de test edildi
- [ ] Paywall açılıyor
- [ ] Satın alma çalışıyor
- [ ] Log'lar doğru

---

## 🚀 PRODUCTION CHECKLIST

Production'a çıkmadan önce:

**1. RevenueCat:**
- [ ] Production API key doğru: `goog_JmFVcxazPsmfZigZlmVZwbAiXWA`
- [ ] `default` offering "Current" olarak işaretli
- [ ] Paywall live ve test edilmiş
- [ ] A/B test (opsiyonel) yapılandırılmış

**2. Google Play:**
- [ ] Subscriptions yayında
- [ ] Base plans aktif
- [ ] Pricing doğru (149.99 TRY, 1499.99 TRY)

**3. Kod:**
- [ ] `npm run build` (production) çalıştırıldı
- [ ] Production key kullanılıyor (log'da kontrol et)
- [ ] Test key koddan kaldırılmadı (otomatik seçim)

**4. Test:**
- [ ] Release APK/AAB test edildi
- [ ] Gerçek ödeme test edildi (dikkatli!)
- [ ] Subscription backend'e yazılıyor
- [ ] User premium oluyor

---

## 📚 REFERANSLAR

**Dokümantasyon:**
- [RevenueCat Paywalls - Installation](https://www.revenuecat.com/docs/tools/paywalls/installation)
- [RevenueCat Paywalls - Displaying](https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls)
- [RevenueCat Capacitor Install](https://www.revenuecat.com/docs/getting-started/installation/capacitor)
- [RevenueCat SDK Config](https://www.revenuecat.com/docs/getting-started/configuring-sdk)
- [Capacitor UI Package](https://www.npmjs.com/package/@revenuecat/purchases-capacitor-ui)

**İlgili Dosyalar:**
- `PRODUCT_IDS_UPDATED.md` - Product ID güncellemeleri
- `REVENUECAT_SANDBOX_TEST_GUIDE.md` - Sandbox test rehberi
- `REVENUECAT_SETUP_COMPLETE.md` - RevenueCat genel kurulum

---

## 💡 İPUÇLARI

### **1. Paywall Template Seçimi**

RevenueCat 10+ hazır template sunuyor. Öneriler:

- **Simple:** Tek plan, minimalist (trial için ideal)
- **Two Tier:** İki plan yan yana (monthly + annual)
- **Feature List:** Özellik listeli, detaylı

Test edin ve conversion'ı yüksek olanı seçin!

### **2. A/B Testing**

RevenueCat Dashboard'da A/B test yapabilirsiniz:

```
Experiment 1:
  - Variant A: Simple template (50% traffic)
  - Variant B: Two Tier template (50% traffic)

Metric: Conversion rate
Winner: Auto-select after 1000 impressions
```

### **3. Localization**

Paywalls otomatik Türkçe gösterir (cihaz diline göre):

```
RevenueCat Dashboard → Paywalls → Localization
- Turkish (TR)
- English (EN)
- vb.
```

### **4. Analytics**

RevenueCat Dashboard → Analytics:

- Paywall views
- Conversion rate
- Revenue
- Trial starts
- Cancellations

---

## ✅ ÖZET

**Kurulum tamamlandı:**
1. ✅ `@revenuecat/purchases-capacitor-ui` package kuruldu
2. ✅ PaywallService oluşturuldu
3. ✅ PurchaseService'e entegre edildi
4. ✅ PaywallButton komponenti eklendi
5. ✅ SubscriptionManager güncellendi
6. ✅ Test/Production key otomatik seçimi aktif
7. ✅ Android Gradle/Manifest otomatik yapılandırıldı
8. ✅ Build başarılı

**Yapılması gerekenler:**
1. ⚠️ RevenueCat Dashboard'da `default` offering oluştur
2. ⚠️ Paywall template seç ve customize et
3. ⚠️ Google Play'de subscriptions oluştur
4. ⚠️ Test et!

**Kullanımı çok basit:**
```tsx
<PaywallButton>Premium'a Geç</PaywallButton>
```

Bu kadar! 🎉

İyi satışlar! 💰
