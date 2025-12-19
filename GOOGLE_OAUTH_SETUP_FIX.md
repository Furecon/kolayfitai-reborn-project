# Google OAuth Safari Hatası Düzeltme

## Sorun
iOS'ta Google ile giriş yaparken Safari "bu adresi tanımıyor" hatası veriyor.

## Neden Oldu?
1. ❌ iOS Info.plist'te URL Scheme tanımlı değildi
2. ❌ Supabase Dashboard'da redirect URL'leri eksik veya yanlış
3. ❌ Google Cloud Console'da authorized redirect URIs eksik

## Yapılan Düzeltmeler (iOS Tarafı)

### 1. iOS URL Scheme Eklendi
**Dosya:** `ios/App/App/Info.plist`

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.kolayfit.app</string>
        </array>
        <key>CFBundleURLName</key>
        <string>com.kolayfit.app</string>
    </dict>
</array>
```

### 2. Capacitor Config Temizlendi
**Dosya:** `capacitor.config.ts`

```diff
- GoogleAuth: {
-   scopes: ['profile', 'email'],
-   serverClientId: '...',
-   forceCodeForRefreshToken: true
- }
```

## YAPMAN GEREKENLER (Supabase & Google Cloud)

### 1. Supabase Dashboard Ayarları

**Adres:** https://supabase.com/dashboard/project/acsqneuzkukmvtfmbphb/auth/url-configuration

#### A. Site URL
```
https://kolayfit.app
```

#### B. Redirect URLs (Her satır ayrı bir entry olacak)
```
https://kolayfit.app/*
https://kolayfit.app/**
com.kolayfit.app://**
com.kolayfit.app://oauth-callback
```

#### C. Additional Redirect URLs (varsa)
```
http://localhost:5173/*
http://localhost:5173/**
```

**ÖNEMLI:**
- Her URL'i ayrı satıra gir
- Wildcard (`*` ve `**`) kullanmayı unutma
- Hem `http://` hem `https://` versiyonlarını ekle (geliştirme için)

---

### 2. Google Cloud Console Ayarları

**Adres:** https://console.cloud.google.com/apis/credentials

#### OAuth 2.0 Client ID Ayarları

**Client ID:** `680638175809-ud31fspsid283q4tt7s9etok0nrb9e2g.apps.googleusercontent.com`

#### Authorized redirect URIs (Her satır ayrı bir entry)
```
https://acsqneuzkukmvtfmbphb.supabase.co/auth/v1/callback
https://kolayfit.app
https://kolayfit.app/
http://localhost:5173
http://localhost:5173/
```

**ÖNEMLI:**
- Supabase callback URL'i MUTLAKA olmalı: `https://acsqneuzkukmvtfmbphb.supabase.co/auth/v1/callback`
- Hem slash (`/`) ile hem de slashsız versiyonları ekle

---

### 3. Supabase Authentication Providers

**Adres:** https://supabase.com/dashboard/project/acsqneuzkukmvtfmbphb/auth/providers

#### Google Provider Ayarları

- ✅ **Enable** açık olmalı
- **Client ID:** `680638175809-ud31fspsid283q4tt7s9etok0nrb9e2g.apps.googleusercontent.com`
- **Client Secret:** (Supabase'de kayıtlı olmalı)
- **Authorized Client IDs:** Boş bırak veya web client ID ekle

---

## Kontrol Listesi

### iOS Tarafı (Tamamlandı ✅)
- [x] Info.plist'e CFBundleURLTypes eklendi
- [x] capacitor.config.ts'den eski GoogleAuth config'i silindi
- [x] AuthProvider'da Supabase OAuth kullanılıyor
- [x] Android'de intent-filter zaten var

### Supabase Dashboard (SENIN YAPMAN GEREK ⚠️)
- [ ] Site URL ayarlandı: `https://kolayfit.app`
- [ ] Redirect URLs eklendi (4 URL)
- [ ] Google Provider aktif ve yapılandırılmış

### Google Cloud Console (SENIN YAPMAN GEREK ⚠️)
- [ ] Authorized redirect URIs eklendi (5 URL)
- [ ] Supabase callback URL eklendi

---

## Test Adımları

### 1. Ayarları Yaptıktan Sonra
```bash
npm run build
npx cap sync ios
```

### 2. Codemagic'te Yeni Build
- Codemagic Dashboard'a git
- iOS workflow'u başlat
- Build tamamlandıktan sonra TestFlight'a yükle

### 3. iPhone'da Test
1. TestFlight'tan uygulamayı indir/güncelle
2. Login ekranında "Google ile Giriş Yap"
3. Google hesabını seç
4. Safari'de OAuth onayı ver
5. **Otomatik olarak uygulamaya dönmeli** (`com.kolayfit.app://oauth-callback` üzerinden)

### 4. Hata Durumları

#### "Bu adresi tanımıyor" (Safari)
- ✅ ÇÖZÜLDÜ - Info.plist'e URL scheme eklendi
- Yeni build al ve test et

#### "Redirect URI Mismatch" (Google)
- ⚠️ Google Cloud Console'da authorized redirect URIs kontrol et
- `https://acsqneuzkukmvtfmbphb.supabase.co/auth/v1/callback` mutlaka olmalı

#### "Invalid Redirect URI" (Supabase)
- ⚠️ Supabase Dashboard'da redirect URLs kontrol et
- `com.kolayfit.app://**` ve `com.kolayfit.app://oauth-callback` mutlaka olmalı

---

## OAuth Flow

### iOS Akışı
```
1. User → "Google ile Giriş Yap" butonuna tıkla
2. App → Supabase → Google OAuth sayfasına yönlendir
3. User → Safari'de Google hesabını seç
4. Google → Supabase callback'e yönlendir
5. Supabase → Deep link ile uygulamaya dön: com.kolayfit.app://oauth-callback
6. App → Session'ı al ve Dashboard'a yönlendir
```

### Android Akışı
```
1. User → "Google ile Giriş Yap" butonuna tıkla
2. App → Supabase → Google OAuth sayfasına yönlendir
3. User → Chrome Custom Tabs'de Google hesabını seç
4. Google → Supabase callback'e yönlendir
5. Supabase → Deep link ile uygulamaya dön: com.kolayfit.app://oauth-callback
6. App → Session'ı al ve Dashboard'a yönlendir
```

### Web Akışı
```
1. User → "Google ile Giriş Yap" butonuna tıkla
2. App → Supabase → Google OAuth sayfasına yönlendir
3. User → Aynı tarayıcı sekmesinde Google hesabını seç
4. Google → Supabase callback'e yönlendir
5. Supabase → https://kolayfit.app'e yönlendir
6. App → Session'ı al ve Dashboard'a yönlendir
```

---

## Özet

### Kod Tarafı ✅
- iOS URL scheme eklendi
- Eski Google Auth config temizlendi
- Tüm platformlarda Supabase OAuth kullanılıyor

### Dashboard Tarafı ⚠️ (SENIN YAPMAN GEREK)
- Supabase Dashboard'da redirect URLs ayarla
- Google Cloud Console'da authorized redirect URIs ayarla

### Sonraki Adım
1. ✅ Kod değişiklikleri yapıldı
2. ⚠️ Supabase ve Google Cloud ayarlarını yap
3. 🔄 Yeni build al (Codemagic)
4. 📱 iPhone'da test et

Ayarları yaptıktan sonra yeni build alman gerekiyor!
