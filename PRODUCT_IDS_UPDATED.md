# Product ID Güncellemesi - Google Play Console Entegrasyonu

**Güncelleme Tarihi:** 2025-11-05

## ✅ YAPILAN DEĞİŞİKLİKLER

Google Play Console'daki gerçek subscription ID'leri ile kodun senkronize edilmesi.

---

## 📋 YENİ PRODUCT ID'LERİ

### **Google Play Console'dan Alınan Bilgiler:**

#### **Aylık Premium Abonelik:**
```
Subscription ID: monthly_premium
Base Plan ID: monthly-premium
Fiyat: 149,99 ₺
Dönem: 1 ay
```

#### **Yıllık Premium Abonelik:**
```
Subscription ID: yearly_premium
Base Plan ID: yearly-premium
Fiyat: 1.499,99 ₺
Dönem: 1 yıl
```

---

## 🔄 ESKİ → YENİ MAPPING

| Özellik | Eski ID | Yeni ID | Durum |
|---------|---------|---------|-------|
| Aylık Plan | `monthly_249_99` | `monthly_premium` | ✅ Güncellendi |
| Yıllık Plan | `yearly_2499_99` | `yearly_premium` | ✅ Güncellendi |

**ÖNEMLİ:** Artık tüm kodda `monthly_premium` ve `yearly_premium` kullanılıyor!

---

## 📂 GÜNCELLENENDoSYALAR

### **1. Frontend - SubscriptionManager.tsx**

**Dosya:** `src/components/Subscription/SubscriptionManager.tsx`

**Değişiklikler:**
```typescript
// Eski
currentPlan?: 'monthly_249_99' | 'yearly_2499_99' | null

// Yeni
currentPlan?: 'monthly_premium' | 'yearly_premium' | null
```

```typescript
// Eski
onClick={() => purchaseSubscription('monthly_249_99')}
onClick={() => purchaseSubscription('yearly_2499_99')}

// Yeni
onClick={() => purchaseSubscription('monthly_premium')}
onClick={() => purchaseSubscription('yearly_premium')}
```

---

### **2. Backend - subscription-manager Edge Function**

**Dosya:** `supabase/functions/subscription-manager/index.ts`

**Değişiklikler:**
```typescript
// Eski
if (productId === 'monthly_249_99') {
  // ...
} else if (productId === 'yearly_2499_99') {
  // ...
}

// Yeni
if (productId === 'monthly_premium') {
  // ...
} else if (productId === 'yearly_premium') {
  // ...
}
```

```typescript
// Eski
currentPlan: subscription?.plan_type ?
  `${subscription.plan_type === 'monthly' ? 'monthly_249_99' : 'yearly_2499_99'}` : null

// Yeni
currentPlan: subscription?.plan_type ?
  `${subscription.plan_type === 'monthly' ? 'monthly_premium' : 'yearly_premium'}` : null
```

---

### **3. PurchaseService**

**Dosya:** `src/services/PurchaseService.ts`

**Değişiklikler:**
```typescript
// Fallback products güncellendi
private loadFallbackProducts(): void {
  this.products = [
    {
      productIdentifier: 'monthly_premium',  // ✅ Güncellendi
      title: 'KolayFit Premium - Aylık',
      // ...
    },
    {
      productIdentifier: 'yearly_premium',   // ✅ Güncellendi
      title: 'KolayFit Premium - Yıllık',
      // ...
    }
  ];
}
```

---

## 🎯 REVENUECAT YAPILAN GEREKEN

RevenueCat Dashboard'da product'ları yeni ID'ler ile yapılandırın:

### **Adım 1: Products**

RevenueCat Dashboard → **Products** → **+ New**

#### **Product 1: Aylık**
```
Product ID: monthly_premium          ← YENİ ID!
Store: Google Play
Type: Subscription
Title: KolayFit Premium - Aylık
Price: 149,99 TRY
Period: 1 month
```

#### **Product 2: Yıllık**
```
Product ID: yearly_premium           ← YENİ ID!
Store: Google Play
Type: Subscription
Title: KolayFit Premium - Yıllık
Price: 1.499,99 TRY
Period: 1 year
```

---

### **Adım 2: Offerings**

RevenueCat Dashboard → **Offerings** → **+ New Offering**

```
Offering ID: default
Display Name: KolayFit Premium Plans
Make current: ✅

Packages:
  1. monthly
     - Product: monthly_premium     ← YENİ ID!
     - Type: Monthly

  2. annual
     - Product: yearly_premium      ← YENİ ID!
     - Type: Annual
```

---

## ✅ GOOGLE PLAY CONSOLE KONTROL

Google Play Console'da subscription'ların doğru tanımlandığından emin olun:

### **Subscription 1: Aylık**
```
✅ Subscription ID: monthly_premium
✅ Base Plan ID: monthly-premium
✅ Status: Active
✅ Price: 149,99 TRY
✅ Billing Period: 1 month
```

### **Subscription 2: Yıllık**
```
✅ Subscription ID: yearly_premium
✅ Base Plan ID: yearly-premium
✅ Status: Active
✅ Price: 1.499,99 TRY
✅ Billing Period: 1 year
```

---

## 🧪 TEST ADIMLARI

### **1. Build ve Sync**

```bash
# Production build
npm run build

# Capacitor sync
npx cap sync android

# Android Studio'da aç
npx cap open android
```

### **2. Logları Kontrol Et**

**Android Studio → Logcat:**

```
Filter: tag:Purchase OR tag:RevenueCat
```

**Beklenen loglar:**

```
✅ RevenueCat configured successfully
📦 Loading products from RevenueCat...
📦 Offerings: {current: {...}}

// Product bilgileri
productIdentifier: monthly_premium   ← YENİ ID görünmeli!
productIdentifier: yearly_premium    ← YENİ ID görünmeli!
```

### **3. Satın Alma Testi**

1. Uygulamayı çalıştırın
2. Giriş yapın
3. **Dashboard** → **Premium'a Geç**
4. **Aylık Plana Geç** butonuna tıklayın

**Logda göreceksiniz:**

```
🛒 Starting purchase process: { productId: 'monthly_premium', userId: '...' }
🛍️ Purchasing via package: monthly
✅ Purchase successful
```

**Eğer eski ID kullanılıyorsa HATA alırsınız!**

---

## 📊 VERİTABANI ETKİSİ

Database'de `subscriptions` tablosunda hiçbir değişiklik yapılmadı.

**Database columns:**
- `plan_type`: 'monthly' veya 'yearly' (değişmedi)
- `price_amount`: 149.99 veya 1499.99 (değişmedi)

**Product ID sadece:**
- Frontend'te (kullanıcı arayüzü)
- RevenueCat'te (product tanımları)
- Google Play Console'da (subscription ID'ler)

kullanılıyor. Database'de `plan_type` kullanılıyor ve bu değişmedi.

---

## 🔍 SORUN GİDERME

### **Hata 1: "product monthly_premium not found in offerings"**

**Sebep:** RevenueCat'te yeni product ID'ler ile offerings yapılandırılmamış.

**Çözüm:**
1. RevenueCat Dashboard → Products
2. `monthly_premium` ve `yearly_premium` product'larını ekleyin
3. Offerings → default offering'e packages ekleyin

---

### **Hata 2: "Invalid product ID"**

**Sebep:** Backend'e eski ID gönderiliyor.

**Çözüm:**
1. Frontend kod güncel mi kontrol edin
2. Browser cache temizleyin
3. Uygulamayı yeniden build edin
4. Log'larda hangi product ID'nin gönderildiğini kontrol edin

---

### **Hata 3: "Product not found in Google Play"**

**Sebep:** Google Play Console'da subscription ID'ler yanlış.

**Çözüm:**
1. Google Play Console → Monetize → Subscriptions
2. Subscription ID'lerin AYNEN `monthly_premium` ve `yearly_premium` olduğundan emin olun
3. Status: Active olmalı
4. Base plan oluşturulmuş olmalı

---

## 📝 KONTROL LİSTESİ

Güncelleme sonrası bu listeyi kontrol edin:

**Kod Güncellemeleri:**
- [x] SubscriptionManager.tsx güncellendi
- [x] subscription-manager edge function güncellendi
- [x] PurchaseService.ts güncellendi
- [x] Build başarılı

**Google Play Console:**
- [ ] `monthly_premium` subscription oluşturuldu
- [ ] `yearly_premium` subscription oluşturuldu
- [ ] Base plan'lar oluşturuldu
- [ ] Her iki subscription "Active" durumda

**RevenueCat:**
- [ ] `monthly_premium` product eklendi
- [ ] `yearly_premium` product eklendi
- [ ] Default offering oluşturuldu
- [ ] Packages eklendi (monthly, annual)
- [ ] Default offering "Current" olarak işaretlendi

**Test:**
- [ ] Build ve sync yapıldı
- [ ] Log'larda yeni product ID'ler görünüyor
- [ ] Satın alma akışı test edildi
- [ ] Backend'e doğru product ID gönderiliyor
- [ ] Subscription başarıyla aktif oluyor

---

## 🚀 ÖNEMLİ HATIRLATMALAR

### **1. Google Play Console ID'leri ŞART!**

RevenueCat ve kodunuz ne kadar doğru olursa olsun, Google Play Console'da subscription'lar yoksa ÇALIŞMAZ!

**Mutlaka yapılmalı:**
- Google Play Console → Subscriptions
- ID'ler: `monthly_premium`, `yearly_premium`
- Status: Active
- Base plans configured

### **2. ID'ler AYNEN Eşleşmeli**

```
✅ DOĞRU:
Google Play Console: monthly_premium
RevenueCat Product: monthly_premium
Frontend Code: monthly_premium

❌ YANLIŞ:
Google Play Console: monthly_premium
RevenueCat Product: monthly-premium  ← Tire (-) yerine alt çizgi (_)!
Frontend Code: monthlyPremium        ← camelCase farklı!
```

**Küçük/büyük harf, tire, alt çizgi - HER ŞEY AYNEN AYNI OLMALI!**

### **3. Fallback Products**

Eğer RevenueCat offerings yapılandırılmazsa, kod fallback product'ları kullanır:

```typescript
// Bu ID'ler artık güncel!
productIdentifier: 'monthly_premium'
productIdentifier: 'yearly_premium'
```

Ama **en iyi yöntem** RevenueCat'te offerings yapılandırmak!

---

## 📞 DESTEK

Sorun yaşıyorsanız:

1. **Log'ları kontrol edin** (en önemli!)
   ```
   Android Studio → Logcat → tag:Purchase
   ```

2. **Product ID'leri karşılaştırın**
   - Google Play Console
   - RevenueCat Dashboard
   - Frontend kod
   - Backend kod

3. **Build temiz mi?**
   ```bash
   rm -rf dist
   npm run build
   npx cap sync android
   ```

---

## ✅ ÖZET

**ESKİ Product ID'ler (ARTIK KULLANILMIYOR!):**
- ❌ `monthly_249_99`
- ❌ `yearly_2499_99`

**YENİ Product ID'ler (ARTIK BUNLAR KULLANILIYOR!):**
- ✅ `monthly_premium`
- ✅ `yearly_premium`

**Bu ID'ler aşağıdaki yerlerde güncellendi:**
1. ✅ Frontend - SubscriptionManager.tsx
2. ✅ Backend - subscription-manager edge function
3. ✅ PurchaseService fallback products
4. ✅ Build başarılı

**Yapılması gereken:**
1. ⚠️ Google Play Console'da subscriptions oluştur
2. ⚠️ RevenueCat'te products ve offerings yapılandır
3. ⚠️ Test et!

**Artık tüm gelecek build'lerde yeni ID'ler kullanılacak!** ✅

İyi çalışmalar! 🚀
