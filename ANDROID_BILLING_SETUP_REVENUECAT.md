# 🚀 Android Google Play Billing Kurulumu (RevenueCat ile)

## Tarih: 3 Kasım 2025
## Version: 1.6 (versionCode 8)

---

## ⚠️ NEDEN KREDİ KARTI İSTEMİYORDU?

**Sorun:** Play Store'dan indirilen Version 81'de abonelik butonu kredi kartı sormuyordu.

**Nedenleri:**
1. ❌ **Google Play Billing Library eksikti** - Uygulama gerçek ödeme yapamıyordu
2. ❌ **RevenueCat plugin yoktu** - Native satın alma mekanizması kurulmamıştı
3. ❌ **Eski fiyatlar** - 299,99 ₺ yerine 249,99 ₺ olmalıydı

**Çözüm:**
✅ RevenueCat Purchases plugin kuruldu (`@revenuecat/purchases-capacitor`)
✅ PurchaseService native billing desteği ile yeniden yazıldı
✅ Fiyatlar güncellendi: 249,99 ₺ (aylık), 2.499,99 ₺ (yıllık)
✅ Android version artırıldı: **versionCode 8**, versionName **1.6**

---

## 📋 ŞİMDİ NE YAPMALISINIZ?

### 1. RevenueCat Hesabı Oluşturun

1. **RevenueCat'e kaydolun:** https://app.revenuecat.com/
2. **Create new app** tıklayın
3. Bilgileri girin:
   - App name: **KolayFit**
   - Platform: **Android**
   - Bundle ID: **com.kolayfit.app**

### 2. Google Play Console Entegrasyonu

**RevenueCat Dashboard'da:**

1. **Settings** → **Integration** → **Google Play**
2. **Service Account** oluşturmak için yönlendirmeyi takip edin

**Google Cloud Console'da:**

1. https://console.cloud.google.com/ → Proje oluşturun
2. **APIs & Services** → **Library** → "Google Play Android Developer API" enable edin
3. **IAM & Admin** → **Service Accounts** → Create service account
   - Name: `kolayfit-revenuecat`
   - Role: **Service Account User**
4. Service account'a tıklayın → **Keys** → **Add Key** → **JSON**
5. İndirilen JSON dosyasını RevenueCat'e yükleyin

**Google Play Console'da:**

1. https://play.google.com/console
2. **Users and permissions** → **Invite new users**
3. Service account email'ini ekleyin (JSON dosyasından `client_email`)
4. İzinler:
   - ✅ View financial data
   - ✅ Manage orders
   - ✅ Manage in-app products & subscriptions
5. **Invite user** tıklayın

### 3. RevenueCat'te Ürünleri Yapılandırın

**RevenueCat Dashboard → Products:**

1. **Create Product** tıklayın

**Aylık Abonelik:**
- Product ID: `monthly_249_99`
- Type: **Subscription**
- Duration: **1 month**

**Yıllık Abonelik:**
- Product ID: `yearly_2499_99`
- Type: **Subscription**
- Duration: **12 months**

### 4. Google Play Console'da Ürünleri Oluşturun

**Play Console → Monetization → Products → Subscriptions:**

**Aylık Plan:**
```
Product ID: monthly_249_99
Name: KolayFit Premium - Aylık
Description: Sınırsız yemek analizi ve AI destekli beslenme önerileri
Price: 249,99 TRY
Billing period: 1 month
Free trial: 3 days (optional)
```

**Yıllık Plan:**
```
Product ID: yearly_2499_99
Name: KolayFit Premium - Yıllık
Description: Yıllık premium abonelik (%17 indirim)
Price: 2.499,99 TRY
Billing period: 12 months
Free trial: 3 days (optional)
```

**ÖNEM LÜ:** Product ID'ler RevenueCat'tekilerle **TAM OLARAK AYNI** olmalı!

### 5. RevenueCat Offerings Oluşturun

**RevenueCat Dashboard → Offerings:**

1. **Create Offering** → Name: `default`
2. **Add Package:**
   - Package ID: `monthly`
   - Product: `monthly_249_99`
3. **Add Package:**
   - Package ID: `yearly`
   - Product: `yearly_2499_99`
4. **Make current** tıklayın

### 6. RevenueCat API Key'i Alın

**RevenueCat Dashboard → API Keys:**

1. **Public app-specific key** bölümünü bulun
2. **Android** key'ini kopyalayın
3. Bu key'i kaydedin

### 7. PurchaseService'e API Key Ekleyin

**Dosya:** `src/services/PurchaseService.ts`

Satır 55'i güncelleyin:
```typescript
// ❌ Eski:
const REVENUECAT_ANDROID_KEY = 'YOUR_REVENUECAT_ANDROID_KEY_HERE';

// ✅ Yeni:
const REVENUECAT_ANDROID_KEY = 'sk_xxxxxxxxxxxxxxxxxxxxx'; // RevenueCat'ten aldığınız key
```

**ÖNEMLİ:** Bu key'i `.env` dosyasına taşımak daha güvenli olur:

```env
VITE_REVENUECAT_ANDROID_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
```

Sonra kod'da:
```typescript
const REVENUECAT_ANDROID_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
```

### 8. Yeni APK Build Edin

```bash
# Web build
npm run build

# Android sync
npx cap sync android

# Android Studio'da aç
npx cap open android

# Android Studio'da:
# 1. Build → Generate Signed Bundle / APK
# 2. Android App Bundle seçin
# 3. Release variant seçin
# 4. Sign edin
# 5. Build/outputs/bundle/release/app-release.aab dosyası oluşur
```

### 9. Google Play Console'a Yükleyin

**Play Console → Testing → Internal testing:**

1. **Create new release**
2. AAB dosyasını yükleyin
3. Release notes:
```
Version 1.6 (Build 8)
- Google Play Billing entegrasyonu eklendi (RevenueCat ile)
- Abonelik satın alma düzeltildi - artık kredi kartı bilgisi isteniyor
- Fiyatlar güncellendi: Aylık 249,99 ₺, Yıllık 2.499,99 ₺
- Icon padding düzeltildi
- Web çıkış yapma hatası düzeltildi
```
4. **Save** → **Review release** → **Start rollout**

### 10. Test Edin!

**Internal test track'e katılın:**
1. Play Console → **Setup** → **Internal testing**
2. Test link'ini kopyalayın
3. Telefonunuzda bu link'i açın
4. **Download** tıklayın

**Satın Alma Testi:**
1. Uygulamayı açın
2. Giriş yapın
3. **Abonelik Yönetimi** → **Aylık Plan**
4. ✅ Google Play ödeme ekranı açılmalı
5. ✅ Kredi kartı bilgisi istenmeli
6. Test kartı ile ödeme yapın
7. ✅ Abonelik aktif olmalı

**Test Kartları:**
- Google Play test kartı otomatik eklenmiş olmalı
- Gerçek ücret alınmaz (test mode)

---

## 📁 YAPILAN DEĞİŞİKLİKLER

### 1. ✅ RevenueCat Plugin Kuruldu
```bash
npm install @revenuecat/purchases-capacitor
```

### 2. ✅ PurchaseService Yeniden Yazıldı
**Dosya:** `src/services/PurchaseService.ts`

**Özellikler:**
- ✅ Native Android billing desteği
- ✅ RevenueCat entegrasyonu
- ✅ Web platform mock mode (test için)
- ✅ Automatic product loading from RevenueCat
- ✅ Restore purchases fonksiyonu
- ✅ Backend validation

### 3. ✅ Android Version Güncellendi
**Dosya:** `android/app/build.gradle`
```gradle
versionCode 8    // 7 → 8
versionName "1.6"  // 1.5 → 1.6
```

### 4. ✅ Fiyatlar Düzeltildi

| Plan | Product ID | Fiyat |
|------|-----------|-------|
| Aylık | `monthly_249_99` | 249,99 ₺ |
| Yıllık | `yearly_2499_99` | 2.499,99 ₺ |

---

## 🧪 TEST KONTROL LİSTESİ

Build etmeden önce:

- [ ] RevenueCat hesabı oluşturuldu
- [ ] Google Cloud Service Account oluşturuldu
- [ ] Play Console'da izinler verildi
- [ ] RevenueCat'te products oluşturuldu (`monthly_249_99`, `yearly_2499_99`)
- [ ] Play Console'da subscriptions oluşturuldu (aynı ID'ler)
- [ ] RevenueCat offerings yapılandırıldı
- [ ] RevenueCat Android API key alındı
- [ ] PurchaseService'e API key eklendi
- [ ] Web build yapıldı (`npm run build`)
- [ ] Capacitor sync yapıldı (`npx cap sync android`)

Build ettikten sonra:

- [ ] APK/AAB imzalandı
- [ ] Version 1.6 olarak Play Console'a yüklendi
- [ ] Internal test track'e release yapıldı
- [ ] Test cihazda uygulama indirildi
- [ ] Giriş yapıldı
- [ ] Abonelik sayfası açıldı
- [ ] ✅ "Aylık Plana Geç" butonu Google Play ödeme ekranını açıyor
- [ ] ✅ Kredi kartı bilgisi isteniyor
- [ ] ✅ Test satın alma başarılı
- [ ] ✅ Profile premium status verildi
- [ ] ✅ Supabase database'de subscription kaydı oluştu

---

## 🐛 SORUN GİDERME

### Hata: "RevenueCat API key not configured"
**Çözüm:** `src/services/PurchaseService.ts` dosyasında satır 55'e RevenueCat key'inizi ekleyin.

### Hata: "No offerings available"
**Çözüm:**
- RevenueCat Dashboard → Offerings → `default` offering `current` olarak işaretli mi?
- Products doğru yapılandırıldı mı?
- Google Play Console'da subscriptions oluşturuldu mu?

### Hata: "Product not found in offerings"
**Çözüm:**
- RevenueCat products ID'leri: `monthly_249_99`, `yearly_2499_99`
- Play Console products ID'leri ile aynı olmalı
- Offering'de bu products ekli mi?

### Hata: Kredi kartı hala istemiyor
**Çözüm:**
- Uygulamayı tam olarak kapatıp yeniden açın
- Google Play Store cache'i temizleyin
- Telefonun internet bağlantısını kontrol edin
- Internal test track'ten mi indirdiniz? (Play Store'dan değil)

### Hata: "Purchase cancelled"
**Normal:** Kullanıcı ödeme ekranını kapattı. Hata değil.

---

## 💡 ÖNEMLİ NOTLAR

### RevenueCat vs Direct Google Play Billing

Bu projede **RevenueCat** kullanıyoruz çünkü:
- ✅ Daha kolay entegrasyon
- ✅ Cross-platform destek (iOS için de hazır)
- ✅ Webhook'lar ve analytics dahili
- ✅ Subscription yönetimi basitleştirilmiş
- ✅ Customer support kolaylaştırılmış

**Alternatif:** Direkt Google Play Billing Library kullanmak mümkün ama daha karmaşık.

### Güvenlik

- ✅ RevenueCat API key client-side'da kullanılıyor (public key)
- ✅ Secret key asla app'e konulmaz
- ✅ Backend validation Supabase edge function'da
- ✅ Purchase token'lar RevenueCat tarafından yönetiliyor

### Test Mode

- Web'de mock purchase flow kullanılıyor (gerçek ödeme yok)
- Android'de RevenueCat test mode otomatik aktif
- Internal test track'te gerçek ücret alınmaz

### Production Checklist

Production'a geçmeden:

- [ ] RevenueCat API key doğru
- [ ] Google Play Console products published
- [ ] Internal test başarılı
- [ ] Closed beta test başarılı
- [ ] Backend edge function test edildi
- [ ] Webhook'lar (varsa) test edildi
- [ ] Privacy policy ve terms güncellendi
- [ ] Subscription cancellation flow test edildi

---

## 📚 KAYNAKLAR

- [RevenueCat Documentation](https://www.revenuecat.com/docs/)
- [RevenueCat Capacitor Plugin](https://github.com/RevenueCat/purchases-capacitor)
- [Google Play Billing Overview](https://developer.android.com/google/play/billing/integrate)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 📞 DESTEK

Sorularınız için:
- RevenueCat Support: https://www.revenuecat.com/support
- Google Play Support: https://support.google.com/googleplay/android-developer

---

**✅ SONUÇ:** Yeni build (Version 1.6) alıp Play Console'a yükledikten sonra, artık Android uygulamanızda gerçek Google Play Billing çalışacak ve kullanıcılardan kredi kartı bilgisi istenecek!

**Bir sonraki adım:** RevenueCat hesabı oluşturup API key almak, sonra yeni APK build edip test etmek.
