# RevenueCat Kurulum Rehberi - KolayFit

Bu dosya, RevenueCat'in doğru şekilde yapılandırılması için adım adım rehberdir.

## ❌ MEVCUT HATA

```
product monthly_249_99 not found in offerings
product yearly_2499_99 not found in offerings
```

**Neden Oluyor?**
RevenueCat Dashboard'da Products ve Offerings düzgün yapılandırılmamış.

---

## ✅ ÇÖZÜM ADIMLARI

### **ADIM 1: RevenueCat Dashboard'a Giriş**

1. https://app.revenuecat.com/ adresine gidin
2. Google hesabınızla giriş yapın
3. **KolayFit** projesini seçin

---

### **ADIM 2: Google Play Store Entegrasyonu**

1. Sol menüden **"Project Settings"** → **"Service Credentials"** seçin
2. **"Google Play"** sekmesine tıklayın
3. **"Add Credentials"** butonuna tıklayın

**Gerekli Bilgiler:**
- **Package Name:** `com.kolayfit.app`
- **Service Account JSON:** Google Cloud Console'dan aldığınız JSON key

**JSON Key Alma:**
1. https://console.cloud.google.com/ gidin
2. **"IAM & Admin"** → **"Service Accounts"** seçin
3. Mevcut service account'u seçin veya yeni oluşturun
4. **"Keys"** sekmesine gidin
5. **"Add Key"** → **"Create new key"** → **JSON** formatı seçin
6. İndirilen JSON dosyasının içeriğini RevenueCat'e yapıştırın

---

### **ADIM 3: Products Oluşturma**

1. Sol menüden **"Products"** seçin
2. **"+ New"** butonuna tıklayın

#### **Product 1: Aylık Plan**

```
Product ID: monthly_249_99
Store: Google Play
Type: Subscription
Title: KolayFit Premium - Aylık
Description: Aylık premium abonelik
Price: 149,99 TRY
Subscription Period: 1 month
```

**Önemli:**
- ✅ Product ID **AYNEN** `monthly_249_99` olmalı
- ✅ Type **Subscription** seçilmeli
- ✅ Google Play Store'da aynı ID ile product oluşturulmuş olmalı

#### **Product 2: Yıllık Plan**

```
Product ID: yearly_2499_99
Store: Google Play
Type: Subscription
Title: KolayFit Premium - Yıllık
Description: Yıllık premium abonelik (%17 indirim)
Price: 1.499,99 TRY
Subscription Period: 1 year
```

**Önemli:**
- ✅ Product ID **AYNEN** `yearly_2499_99` olmalı
- ✅ Type **Subscription** seçilmeli
- ✅ Google Play Store'da aynı ID ile product oluşturulmuş olmalı

---

### **ADIM 4: Offerings Oluşturma**

Offerings, kullanıcılara gösterilecek paketleri gruplandırır.

1. Sol menüden **"Offerings"** seçin
2. **"+ New Offering"** butonuna tıklayın

#### **Default Offering:**

```
Offering ID: default
Display Name: KolayFit Premium Plans
Description: Premium abonelik planları
Make this the current offering: ✅ (İşaretle)
```

#### **Packages Ekleme:**

**Package 1: Monthly**
```
Identifier: monthly
Package Type: Monthly
Product: monthly_249_99 (seçin)
```

**Package 2: Annual**
```
Identifier: annual
Package Type: Annual
Product: yearly_2499_99 (seçin)
```

3. **"Save"** butonuna tıklayın

---

### **ADIM 5: Google Play Console'da Products Oluşturma**

RevenueCat'in çalışması için Google Play Console'da da aynı product'lar oluşturulmalı!

1. https://play.google.com/console/ gidin
2. **KolayFit** uygulamasını seçin
3. Sol menüden **"Monetize"** → **"Subscriptions"** seçin
4. **"Create subscription"** butonuna tıklayın

#### **Subscription 1: Aylık**

```
Product ID: monthly_249_99
Name: KolayFit Premium - Aylık
Description: Aylık premium abonelik

Base Plan:
- ID: monthly-base
- Billing Period: 1 month
- Price: 149,99 TRY
- Auto-renewing: Yes

Free Trial (İsteğe bağlı):
- Duration: 3 days
```

#### **Subscription 2: Yıllık**

```
Product ID: yearly_2499_99
Name: KolayFit Premium - Yıllık
Description: Yıllık premium abonelik (%17 indirim)

Base Plan:
- ID: yearly-base
- Billing Period: 1 year
- Price: 1.499,99 TRY
- Auto-renewing: Yes

Free Trial (İsteğe bağlı):
- Duration: 3 days
```

5. Her iki subscription için **"Activate"** butonuna tıklayın

---

### **ADIM 6: Test Lisans Tester Ekleme**

Google Play'de test edebilmek için tester eklemeniz gerekir.

1. Google Play Console'da **"Testing"** → **"Internal testing"** veya **"Closed testing"** seçin
2. **"Testers"** sekmesine gidin
3. **"Create email list"** butonuna tıklayın
4. Test email adreslerinizi ekleyin
5. **"Save"** butonuna tıklayın

**ÖNEMLİ:** Test yapacağınız Google hesabını mutlaka tester olarak ekleyin!

---

### **ADIM 7: RevenueCat Test Modu**

1. RevenueCat Dashboard → **"Project Settings"**
2. **"Sandbox"** sekmesine gidin
3. Test cihazınızın Google hesabını ekleyin

Bu sayede gerçek ödeme yapmadan test edebilirsiniz.

---

## 🧪 TEST ADIMLARI

### **1. Build ve Sync:**

```bash
# Frontend build
npm run build

# Capacitor sync
npx cap sync android

# Android Studio'da aç
npx cap open android
```

### **2. APK Oluştur:**

Android Studio'da:
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. APK başarıyla build edildikten sonra **"locate"** butonuna tıklayın
3. APK'yı cihaza yükleyin veya Internal Test Track'e upload edin

### **3. Test Et:**

1. Test cihazında uygulamayı açın
2. Giriş yapın
3. **Dashboard** → **"Premium'a Geç"** butonuna tıklayın
4. **"Aylık Plana Geç"** veya **"Yıllık Plana Geç"** butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Google Play ödeme ekranı açılmalı
- ✅ Fiyat görünmeli: 149,99 ₺ veya 1.499,99 ₺
- ✅ "Test" veya "Sandbox" badge görünmeli (test modunda)
- ✅ Satın alma başarılı olmalı

---

## 📊 DEBUG LOGLARI

Uygulama çalışırken logları kontrol edin:

**Android Studio → Logcat:**

```
Filtre: tag:Purchases OR tag:Purchase OR tag:RevenueCat
```

**Beklenen Loglar:**

```
✅ RevenueCat Purchases plugin loaded
🚀 Initializing purchase service for native platform
✅ RevenueCat configured successfully
📦 Loading products from RevenueCat...
📦 Offerings: {...}
✅ User logged in to RevenueCat
🛍️ Purchasing via package: monthly
✅ Purchase successful
```

**Hata Durumunda:**

```
❌ product monthly_249_99 not found in offerings
→ RevenueCat Dashboard'da Offerings yapılandırması eksik

❌ Google Play API error: 401
→ Service Account credentials hatalı

❌ Product not found in Google Play
→ Google Play Console'da subscription oluşturulmamış
```

---

## 🔧 SORUN GİDERME

### **Hata 1: "No offerings available"**

**Çözüm:**
1. RevenueCat Dashboard → Offerings
2. "default" offering'in **"Current"** olarak işaretli olduğundan emin olun
3. Offerings içinde en az 1 package olduğundan emin olun

### **Hata 2: "Product not found in Google Play"**

**Çözüm:**
1. Google Play Console'da subscription'ların **"Active"** durumda olduğundan emin olun
2. Product ID'lerin **AYNEN** eşleştiğinden emin olun:
   - `monthly_249_99`
   - `yearly_2499_99`

### **Hata 3: "Purchase token invalid"**

**Çözüm:**
1. Test cihazının **tester listesinde** olduğundan emin olun
2. RevenueCat Sandbox modunda test cihazınızı ekleyin
3. Uygulamayı temiz install edin (uninstall → reinstall)

### **Hata 4: "Authentication failed"**

**Çözüm:**
1. Google Cloud Console'da Service Account'un **"Android Publisher"** rolüne sahip olduğundan emin olun
2. Service Account JSON key'i doğru şekilde RevenueCat'e eklendiğinden emin olun
3. Package name'in doğru olduğundan emin olun: `com.kolayfit.app`

---

## ✅ KONTROL LİSTESİ

Tüm adımları tamamladıktan sonra bu listeyi kontrol edin:

- [ ] RevenueCat Dashboard'da Google Play credentials eklendi
- [ ] RevenueCat'te `monthly_249_99` product'u oluşturuldu
- [ ] RevenueCat'te `yearly_2499_99` product'u oluşturuldu
- [ ] RevenueCat'te "default" offering oluşturuldu
- [ ] Default offering "Current" olarak işaretlendi
- [ ] Default offering içinde "monthly" package eklendi
- [ ] Default offering içinde "annual" package eklendi
- [ ] Google Play Console'da `monthly_249_99` subscription oluşturuldu
- [ ] Google Play Console'da `yearly_2499_99` subscription oluşturuldu
- [ ] Her iki subscription "Active" durumda
- [ ] Test cihazının Google hesabı tester olarak eklendi
- [ ] APK build edildi ve test cihazına yüklendi
- [ ] Satın alma akışı test edildi

---

## 📱 GELİŞTİRİCİ NOTLARI

### **Kod Akışı:**

```typescript
// 1. User clicks "Premium'a Geç"
SubscriptionManager → purchaseSubscription(productId)

// 2. PurchaseService çağrılır
PurchaseService → purchaseProduct(productId, userId)

// 3. RevenueCat'e giriş yapılır
Purchases.logIn({ appUserID: userId })

// 4. Offerings alınır
Purchases.getOfferings()

// 5. Product bulunur ve satın alınır
Purchases.purchasePackage({ aPackage: pkg })
// VEYA (fallback)
Purchases.purchaseStoreProduct({ product: productId })

// 6. Backend'e gönderilir
supabase.functions.invoke('subscription-manager', {
  action: 'validate_purchase',
  productId,
  receiptData
})

// 7. Backend Google Play'i validate eder
// 8. Database'e yazılır
// 9. User premium olur ✅
```

### **Product ID Mapping:**

| Frontend | Backend | Database | Google Play |
|----------|---------|----------|-------------|
| monthly_249_99 | monthly_249_99 | plan_type: 'monthly' | monthly_249_99 |
| yearly_2499_99 | yearly_2499_99 | plan_type: 'yearly' | yearly_2499_99 |

### **Fiyat Tutarlılığı:**

| Platform | Aylık | Yıllık |
|----------|-------|--------|
| Frontend UI | 149,99 ₺ | 1.499,99 ₺ |
| PurchaseService (fallback) | 149,99 ₺ | 1.499,99 ₺ |
| Backend Edge Function | 149.99 | 1499.99 |
| Google Play Console | 149,99 TRY | 1.499,99 TRY |
| RevenueCat | Google Play'den çeker | Google Play'den çeker |

---

## 🎯 SONUÇ

Bu adımları tamamladıktan sonra:

1. ✅ RevenueCat tam entegre olacak
2. ✅ Offerings düzgün çalışacak
3. ✅ "Product not found" hatası düzelecek
4. ✅ Satın alma akışı sorunsuz çalışacak
5. ✅ Test ve production ortamları hazır olacak

**ŞUNU UNUTMAYIN:**
- RevenueCat Dashboard yapılandırması **ŞART**!
- Google Play Console'da product'lar **AYNI ID** ile oluşturulmalı!
- Test için mutlaka **tester listesine** eklenmelisiniz!

İyi çalışmalar! 🚀
