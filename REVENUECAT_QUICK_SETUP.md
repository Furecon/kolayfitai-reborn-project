# 🚀 RevenueCat Hızlı Kurulum Rehberi

## ✅ Mevcut Service Account Kullanımı

Zaten `play-billing-verifier@kolayfitai-v2.iam.gserviceaccount.com` service account'ınız var!

**YENİ SERVICE ACCOUNT AÇMANIZA GEREK YOK!** ✅

---

## 📋 ADIM ADIM KURULUM

### 1️⃣ RevenueCat Hesabı Oluşturun (5 dakika)

1. https://app.revenuecat.com/ → **Sign Up**
2. Email ile kaydolun
3. **Create a new project** → İsim: `KolayFit`

### 2️⃣ RevenueCat'te App Oluşturun (3 dakika)

1. **Apps** → **+ New App**
2. Bilgileri girin:
   ```
   App Name: KolayFit
   Platform: Android
   Bundle ID: com.kolayfit.app
   ```
3. **Create App** tıklayın

### 3️⃣ Google Play Entegrasyonu (10 dakika)

**RevenueCat Dashboard'da:**

1. Sol menü → **Settings** (⚙️)
2. **Integrations** → **Google Play**
3. **Connect** tıklayın

**Google Cloud Console'da Service Account Key Alın:**

1. https://console.cloud.google.com/ → Projenizi seçin (`kolayfitai-v2`)
2. Sol menü → **IAM & Admin** → **Service Accounts**
3. `play-billing-verifier@kolayfitai-v2.iam.gserviceaccount.com` satırını bulun
4. Sağ tarafta **⋮** (3 nokta) → **Manage keys**
5. **ADD KEY** → **Create new key**
6. Type: **JSON** seçin
7. **CREATE** tıklayın
8. JSON dosyası indirilir (örn: `kolayfitai-v2-xxxxx.json`)

**RevenueCat'e Yükleyin:**

1. RevenueCat'e dön
2. **Upload** tıklayın
3. İndirdiğiniz JSON dosyasını seçin
4. **Connect** tıklayın
5. ✅ "Successfully connected to Google Play" mesajı görmelisiniz

### 4️⃣ Play Console'da İzinleri Kontrol Edin (5 dakika)

**Google Play Console:**

1. https://play.google.com/console → Projenizi açın
2. Sol menü → **Users and permissions**
3. `play-billing-verifier@kolayfitai-v2.iam.gserviceaccount.com` arayın

**Eğer listede YOKSA:**

1. **Invite new users** tıklayın
2. Email: `play-billing-verifier@kolayfitai-v2.iam.gserviceaccount.com`
3. App access → **KolayFit** seçin
4. Permissions:
   - ✅ **View financial data**
   - ✅ **Manage orders and subscriptions**
   - ✅ **Manage Store presence** (opsiyonel)
5. **Invite user** tıklayın

**Eğer listede VARSA:**

- İzinleri kontrol edin (yukarıdaki 3 izin olmalı)
- Eksik varsa **Edit access** ile ekleyin

### 5️⃣ RevenueCat'te Products Oluşturun (5 dakika)

**Products Sayfası:**

1. Sol menü → **Products** → **+ New**

**Aylık Abonelik:**
```
Product Identifier: monthly_249_99
Type: Subscription
Duration: 1 month
Description: Aylık premium abonelik
```
**Save** tıklayın

**Yıllık Abonelik:**
```
Product Identifier: yearly_2499_99
Type: Subscription
Duration: 12 months
Description: Yıllık premium abonelik
```
**Save** tıklayın

### 6️⃣ Play Console'da Products Kontrol/Oluşturun (10 dakika)

**Google Play Console:**

1. https://play.google.com/console → **KolayFit** uygulamasını açın
2. Sol menü → **Monetization** → **Products** → **Subscriptions**

**Kontrol Edin:**

`monthly_249_99` ve `yearly_2499_99` var mı?

**VARSA:**
- Fiyatları kontrol edin:
  - `monthly_249_99`: 249,99 TRY
  - `yearly_2499_99`: 2.499,99 TRY
- Status: **Active** olmalı
- ✅ İyi durumda, devam edin!

**YOKSA veya FİYATLAR FARKLI İSE:**

**Aylık Abonelik Oluşturun:**
```
Product ID: monthly_249_99
Name: KolayFit Premium - Aylık
Description: Sınırsız yemek analizi, AI önerileri, kişiselleştirilmiş menüler
Status: Active
```

**Pricing:**
```
Country: Turkey
Price: 249,99 TRY
Billing period: 1 month (recurring)
Free trial: 3 days (opsiyonel)
Grace period: 3 days (önerilen)
```

**Save** → **Activate** tıklayın

**Yıllık Abonelik Oluşturun:**
```
Product ID: yearly_2499_99
Name: KolayFit Premium - Yıllık
Description: Yıllık premium abonelik, %17 indirimli
Status: Active
```

**Pricing:**
```
Country: Turkey
Price: 2.499,99 TRY
Billing period: 12 months (recurring)
Free trial: 3 days (opsiyonel)
Grace period: 3 days (önerilen)
```

**Save** → **Activate** tıklayın

**⚠️ ÖNEMLİ:** Product ID'ler RevenueCat'tekilerle **TAM OLARAK AYNI** olmalı!

### 7️⃣ RevenueCat'te Offerings Oluşturun (3 dakika)

**Offerings Sayfası:**

1. Sol menü → **Offerings** → **+ New Offering**
2. Bilgileri girin:
   ```
   Identifier: default
   Description: Default subscription offering
   ```
3. **Create** tıklayın

**Packages Ekleyin:**

1. **+ Add Package**
   ```
   Identifier: monthly
   Product: monthly_249_99
   ```
   **Add** tıklayın

2. **+ Add Package**
   ```
   Identifier: yearly
   Product: yearly_2499_99
   ```
   **Add** tıklayın

3. Sağ üstte **Make Current** tıklayın
4. ✅ "default" offering artık aktif!

### 8️⃣ RevenueCat API Key Alın (2 dakika)

**API Keys Sayfası:**

1. Sol menü → **API Keys**
2. **Public app-specific key** bölümünü bulun
3. **Android** altındaki key'i kopyalayın
   - Format: `goog_xxxxxxxxxxxxxxxxx` veya `rcb_xxxxxxxxxxxxxxxxx`
4. Bu key'i kaydedin (sonra kullanacağız)

### 9️⃣ PurchaseService'e API Key Ekleyin (1 dakika)

**Dosya:** `src/services/PurchaseService.ts`

**Satır 55'i bulun:**
```typescript
const REVENUECAT_ANDROID_KEY = 'YOUR_REVENUECAT_ANDROID_KEY_HERE';
```

**Değiştirin:**
```typescript
const REVENUECAT_ANDROID_KEY = 'goog_xxxxxxxxxxxxxxxxx'; // RevenueCat'ten kopyaladığınız key
```

**Kaydedin!**

**🔒 Daha Güvenli Yol (Önerilen):**

`.env` dosyasına ekleyin:
```env
VITE_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxx
```

`PurchaseService.ts`'de:
```typescript
const REVENUECAT_ANDROID_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_KEY || 'YOUR_REVENUECAT_ANDROID_KEY_HERE';
```

### 🔟 Yeni Build Edin (5 dakika)

```bash
# Web assets build et
npm run build

# Android'e sync et
npx cap sync android

# Android Studio'da aç
npx cap open android
```

**Android Studio'da:**

1. **Build** → **Generate Signed Bundle / APK**
2. **Android App Bundle** seçin
3. **Next**
4. Keystore bilgilerinizi girin (varsa)
5. **release** variant seçin
6. **Finish**
7. Build tamamlanınca:
   - `android/app/build/outputs/bundle/release/app-release.aab`

### 1️⃣1️⃣ Play Console'a Yükleyin (5 dakika)

**Internal Testing:**

1. https://play.google.com/console → **KolayFit**
2. Sol menü → **Testing** → **Internal testing**
3. **Create new release**
4. **Upload** → `app-release.aab` seçin
5. Release notes:
   ```
   Version 1.6 (Build 8)

   ✅ Google Play Billing entegrasyonu eklendi (RevenueCat)
   ✅ Abonelik satın alma artık çalışıyor
   ✅ Kredi kartı bilgisi isteniyor
   ✅ Fiyatlar: 249,99 ₺ (aylık), 2.499,99 ₺ (yıllık)
   ✅ Web platform çıkış hatası düzeltildi
   ```
6. **Save** → **Review release** → **Start rollout to Internal testing**

### 1️⃣2️⃣ Test Edin! (10 dakika)

**Internal Test Link:**

1. Play Console → **Internal testing** sayfasında
2. **Copy link** tıklayın (internal test link)
3. Bu link'i telefonunuzda açın
4. **Download** tıklayın
5. Uygulamayı yükleyin

**Satın Alma Testi:**

1. Uygulamayı açın
2. Giriş yapın
3. Menü → **Abonelik Yönetimi**
4. **Aylık Plana Geç** tıklayın

**✅ BAŞARILI İSE:**
- Google Play ödeme ekranı açılır
- "249,99 ₺" fiyatı görünür
- Kredi kartı/ödeme yöntemi seçme ekranı gelir
- Test kartı ile ödeme yapabilirsiniz
- "Satın alma başarılı" mesajı gelir
- Profile "Premium" status verilir

**❌ BAŞARILI DEĞİLSE:**

**Hata: "No offerings available"**
- RevenueCat offerings `current` olarak işaretli mi?
- Bekleyin 10 dakika (cache yenilensin)

**Hata: "Product not found"**
- Play Console products active mi?
- Product ID'ler aynı mı? (`monthly_249_99`, `yearly_2499_99`)
- RevenueCat dashboard → Products → Sync edilmiş mi?

**Hata: Kredi kartı istemiyor (mock flow)**
- RevenueCat API key doğru mu?
- Build ettikten sonra `npx cap sync android` yaptınız mı?
- Uygulamayı tamamen kapatıp açmayı deneyin
- LogCat'te hata var mı? (Android Studio → Logcat)

---

## 📱 LogCat'te Bakmanız Gerekenler

Android Studio → Logcat → Filtreleme: `PurchaseService`

**Başarılı Flow:**
```
🚀 Initializing purchase service for native platform
✅ RevenueCat Purchases plugin loaded
✅ RevenueCat configured successfully
📦 Loading products from RevenueCat...
✅ Loaded products from RevenueCat: [...]
🛒 Starting purchase process: {productId: monthly_249_99, userId: ...}
📱 Starting native purchase flow...
✅ User logged in to RevenueCat
🛍️ Purchasing package: monthly
✅ Purchase successful: {...}
🔍 Validating purchase with backend...
✅ Purchase validation successful
```

**Başarısız Flow:**
```
⚠️ RevenueCat API key not configured!
📝 Please visit https://app.revenuecat.com/ to: ...
```
→ API key ekleyin!

```
❌ Failed to load products from RevenueCat: No offerings available
```
→ RevenueCat offerings kontrol edin!

---

## ✅ KONTROLLAR

**RevenueCat'te:**
- [ ] App oluşturuldu (KolayFit)
- [ ] Google Play entegre edildi (service account JSON yüklendi)
- [ ] Products oluşturuldu (`monthly_249_99`, `yearly_2499_99`)
- [ ] Offering oluşturuldu (`default`) ve `current` işaretlendi
- [ ] Android API key alındı

**Google Cloud'da:**
- [ ] Service account var (`play-billing-verifier@kolayfitai-v2`)
- [ ] JSON key indirildi
- [ ] Google Play Android Developer API enabled

**Play Console'da:**
- [ ] Service account izinleri var (View financial data, Manage orders)
- [ ] Subscriptions oluşturuldu (`monthly_249_99`: 249,99 TRY, `yearly_2499_99`: 2.499,99 TRY)
- [ ] Subscriptions active

**Kod'da:**
- [ ] RevenueCat plugin kuruldu (`@revenuecat/purchases-capacitor`)
- [ ] PurchaseService'te API key eklendi
- [ ] Web build yapıldı (`npm run build`)
- [ ] Android sync yapıldı (`npx cap sync android`)
- [ ] Version artırıldı (versionCode 8, versionName 1.6)

**Play Console'da:**
- [ ] AAB yüklendi (Version 1.6)
- [ ] Internal testing'e release yapıldı

**Test:**
- [ ] Internal test link ile indirindi
- [ ] Giriş yapıldı
- [ ] Abonelik sayfası açıldı
- [ ] Google Play ödeme ekranı açıldı ✅
- [ ] Kredi kartı bilgisi istendi ✅

---

## 🎯 ÖZET

Mevcut service account'ınızı kullanarak:

1. ✅ RevenueCat hesabı → App → Google Play entegre et (JSON key yükle)
2. ✅ RevenueCat products + offerings oluştur
3. ✅ Play Console subscriptions kontrol et/oluştur (249,99 ve 2.499,99 TRY)
4. ✅ RevenueCat API key al
5. ✅ PurchaseService'e ekle
6. ✅ Build → Play Console → Test

**Toplam süre:** ~45 dakika

**Sonuç:** Android'de artık gerçek Google Play Billing çalışacak! 🎉

---

## 🆘 YARDIM

Sorun olursa:
- RevenueCat Docs: https://www.revenuecat.com/docs/
- RevenueCat Support: https://www.revenuecat.com/support
- Google Play Support: https://support.google.com/googleplay/android-developer

Veya konsol loglarını paylaşın!
