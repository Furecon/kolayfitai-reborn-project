# Google Play Billing Setup Guide

## Genel Bakış

KolayFit uygulaması için Google Play Billing entegrasyonu. İki abonelik planı:
- **Aylık**: 119.99 TRY (`monthly_119_99`)
- **Yıllık**: 1199.99 TRY (`yearly_1199_99`)

---

## 1. Google Play Console Kurulumu

### Adım 1.1: Uygulama Oluşturma
1. [Google Play Console](https://play.google.com/console) giriş yap
2. **Tüm uygulamalar** > **Uygulama oluştur**
3. Bilgiler:
   - Uygulama adı: **KolayFit**
   - Varsayılan dil: **Türkçe**
   - Paket adı: **com.kolayfit.app**

### Adım 1.2: Abonelik Ürünleri Oluşturma
1. Sol menü: **Monetizasyon** > **Ürünler** > **Abonelikler**
2. **Abonelik oluştur** tıkla

#### Aylık Abonelik:
- Ürün kimliği: `monthly_119_99`
- Ad: KolayFit Premium - Aylık
- Açıklama: Aylık premium abonelik
- Fiyat: 119.99 TRY
- Faturalandırma dönemi: 1 ay
- Ücretsiz deneme: 7 gün (opsiyonel)

#### Yıllık Abonelik:
- Ürün kimliği: `yearly_1199_99`
- Ad: KolayFit Premium - Yıllık
- Açıklama: Yıllık premium abonelik (%17 indirim)
- Fiyat: 1199.99 TRY
- Faturalandırma dönemi: 1 yıl
- Ücretsiz deneme: 14 gün (opsiyonel)

### Adım 1.3: License Key Alma
1. **Monetizasyon** > **Monetizasyon kurulumu**
2. **Base64 lisans anahtarı** bölümünü kopyala
3. Bu anahtarı kaydet (sonra kullanacağız)

---

## 2. Google Cloud Console Kurulumu

### Adım 2.1: Proje Oluşturma
1. [Google Cloud Console](https://console.cloud.google.com/) aç
2. Yeni proje oluştur
   - Proje adı: **KolayFit Billing**
   - Proje ID'yi kaydet

### Adım 2.2: Google Play Developer API Etkinleştirme
1. **APIs & Services** > **Library**
2. "Google Play Android Developer API" ara
3. **Enable** tıkla

### Adım 2.3: Service Account Oluşturma
1. **IAM & Admin** > **Service Accounts**
2. **CREATE SERVICE ACCOUNT** tıkla
3. Detaylar:
   - Service account name: `kolayfit-billing-service`
   - Service account ID: `kolayfit-billing-service`
   - Description: KolayFit billing validation service
4. **CREATE AND CONTINUE** tıkla
5. Role ekle: **Service Account User**
6. **DONE** tıkla

### Adım 2.4: JSON Key Oluşturma
1. Oluşturulan service account'a tıkla
2. **KEYS** tab'ına git
3. **ADD KEY** > **Create new key**
4. Tip: **JSON**
5. **CREATE** tıkla
6. İndirilen JSON dosyasını güvenli bir yere kaydet

### Adım 2.5: Service Account Email'i Alma
JSON dosyasında şu bilgiyi bul:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "kolayfit-billing-service@project-id.iam.gserviceaccount.com",
  ...
}
```

`client_email` değerini kaydet.

---

## 3. Service Account'u Google Play'e Bağlama

### Adım 3.1: Google Play Console'da İzin Verme
1. [Google Play Console](https://play.google.com/console) dön
2. **Kullanıcılar ve izinler** > **Yeni kullanıcıları davet et**
3. Email olarak **service account email'ini** gir
   - Örnek: `kolayfit-billing-service@project-id.iam.gserviceaccount.com`

### Adım 3.2: İzinleri Ayarlama
Şu izinleri ver:
- ✅ **Mali verileri görüntüleme** (View financial data)
- ✅ **Sipariş yönetimi** (Manage orders)
- ✅ **Uygulama içi ürün ve abonelik yönetimi** (Manage in-app products & subscriptions)

**NOT:** Uygulama erişimi için "KolayFit" uygulamasını seç.

### Adım 3.3: Daveti Onayla
1. **Davet et** tıkla
2. Service account otomatik kabul eder (email gerekmez)

---

## 4. Supabase Secrets Yapılandırması

### Adım 4.1: Supabase Dashboard'a Git
1. [Supabase Dashboard](https://supabase.com/dashboard) aç
2. KolayFit projesini seç
3. **Settings** > **Edge Functions**

### Adım 4.2: Secrets Ekle
Şu environment variable'ları ekle:

#### GOOGLE_PACKAGE_NAME
```
com.kolayfit.app
```

#### GOOGLE_PLAY_LICENSE_KEY
Google Play Console'dan aldığın Base64 license key'i yapıştır.

#### GOOGLE_SERVICE_ACCOUNT_EMAIL
```
kolayfit-billing-service@project-id.iam.gserviceaccount.com
```
(Kendi service account email'ini kullan)

#### GOOGLE_SERVICE_ACCOUNT_KEY
İndirdiğin JSON dosyasının **tamamını** tek satır olarak yapıştır.

**Örnek formatlama:**
```json
{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### Adım 4.3: Edge Function Deploy
Secrets ekledikten sonra edge function'ı yeniden deploy et:
```bash
supabase functions deploy subscription-manager
```

---

## 5. Test Etme

### Test 1: Mock Purchase (Web)
Web üzerinde test yapmak için:
```javascript
// PurchaseService.ts zaten mock mode destekliyor
await purchaseService.purchaseProduct('monthly_119_99', userId);
// Bu "mock_token_" ile başlayan token kullanır
```

### Test 2: Gerçek Android Purchase
1. Google Play Console'da **test kullanıcısı** ekle
2. Android uygulamayı internal test track'e yükle
3. Test cihazda uygulamayı aç
4. Abonelik satın al
5. Supabase logs'ta doğrulama mesajlarını kontrol et

### Test 3: Doğrulama Kontrolü
Supabase Dashboard > Logs:
```
✅ Google Play API validation successful
📊 Subscription data: {...}
💾 Creating subscription record...
✅ Subscription record created successfully
```

---

## 6. Sorun Giderme

### Hata: "Missing Google Play configuration"
**Çözüm:** Supabase secrets'ların doğru eklendiğinden emin ol.

### Hata: "Authentication failed"
**Çözüm:**
- Service account JSON key'in doğru yapılandırıldığından emin ol
- Google Cloud'da "Google Play Android Developer API" etkin mi kontrol et

### Hata: "Google Play API error: 401"
**Çözüm:**
- Service account email'in Google Play Console'da yetkisi var mı?
- İzinler doğru verilmiş mi? (Mali veriler, sipariş yönetimi)

### Hata: "Purchase already processed"
**Çözüm:** Bu normal - aynı purchase token tekrar kullanılamaz.

---

## 7. Üretim Kontrolü

Üretimde kullanmadan önce:

- [ ] Google Play Console'da abonelikler aktif
- [ ] Service account doğru izinlere sahip
- [ ] Supabase secrets hepsi eklenmiş
- [ ] Edge function deploy edilmiş
- [ ] Test kullanıcısı ile başarılı test yapılmış
- [ ] Logs'ta hata yok
- [ ] Database'de subscription kayıtları oluşuyor

---

## Güvenlik Notları

1. **Service Account Key'i asla paylaşma** - Git'e commit etme
2. **Supabase secrets** güvenli bir şekilde saklanır
3. **Purchase token'lar** bir kez kullanılabilir
4. **Mock mode** sadece development'ta aktif
5. **License key** gizli tutulmalı

---

## İletişim

Sorularınız için: [KolayFit Support](mailto:support@kolayfit.app)
