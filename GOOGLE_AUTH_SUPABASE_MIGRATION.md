# Google Auth Migrasyonu - Native SDK'dan Supabase OAuth'a

## Sorun

iOS'ta Google Sign-In çalışmıyordu çünkü:
- **İki farklı OAuth sistemi** aynı anda vardı
- Native Google SDK (`@codetrix-studio/capacitor-google-auth`)
- Supabase OAuth (Google provider)
- Bu iki sistem birbiriyle **çakışıyordu** ve iOS'ta hatalara neden oluyordu

## Çözüm

Native Google SDK'yı tamamen kaldırdık ve **tüm platformlarda Supabase OAuth** kullanıyoruz.

## Yapılan Değişiklikler

### 1. Kaldırılan Dosyalar
- ❌ `src/plugins/GoogleAuthPlugin.ts`
- ❌ `scripts/patch-google-auth.cjs`

### 2. Güncellenen Dosyalar

#### `package.json`
```diff
- "@codetrix-studio/capacitor-google-auth": "^3.4.0-rc.4"
- "postinstall": "node scripts/patch-google-auth.cjs"
```

#### `src/main.tsx`
```diff
- import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
- GoogleAuth.initialize({ ... })
```

#### `src/components/Auth/AuthProvider.tsx`
```diff
- import GoogleAuth from '@/plugins/GoogleAuthPlugin'
- // Native Google Auth kod bloğu (78 satır) kaldırıldı

+ // Tüm platformlarda Supabase OAuth
+ await supabase.auth.signInWithOAuth({
+   provider: 'google',
+   options: { redirectTo }
+ })
```

#### `ios/App/Podfile`
```diff
- pod 'CodetrixStudioCapacitorGoogleAuth', ...
- pod 'GoogleSignIn', '~> 7.1'
- # GoogleSignIn 7.1+ patch kodu kaldırıldı
```

#### `codemagic.yaml`
```diff
- name: Patch Google Auth in node_modules
-   node scripts/patch-google-auth.cjs
- name: Patch GoogleAuth in Pods
-   node scripts/patch-google-auth.cjs
```

### 3. Otomatik Temizlenen Dosyalar
- `android/capacitor.settings.gradle` - Google Auth referansı kaldırıldı
- `node_modules/@codetrix-studio/capacitor-google-auth` - Paket kaldırıldı

## Yeni Mimari

### Web
```
User → Google Sign-In → Browser → Supabase → Redirect to App
```

### iOS
```
User → Google Sign-In → Safari/Chrome → Deep Link → App
                                         ↓
                       com.kolayfit.app://oauth-callback
```

### Android
```
User → Google Sign-In → Chrome Custom Tabs → Deep Link → App
                                              ↓
                          com.kolayfit.app://oauth-callback
```

## Avantajları

1. ✅ **Tek OAuth Sistemi** - Karışıklık yok
2. ✅ **Daha Basit Kod** - Native SDK bağımlılığı yok
3. ✅ **Supabase Standart** - Önerilen yöntem
4. ✅ **Kolay Bakım** - Patch script'lerine gerek yok
5. ✅ **Cross-platform** - Web ve native aynı kod
6. ✅ **Apple Uyumlu** - iOS Privacy Manifest sorunları yok

## Supabase'de OAuth Ayarları

Supabase Dashboard'da şu ayarların yapılmış olması gerekiyor:

### Google OAuth Provider
1. **Google Cloud Console** → OAuth 2.0 Client ID
2. **Supabase Dashboard** → Authentication → Providers → Google
   - Client ID: `680638175809-ud31fspsid283q4tt7s9etok0nrb9e2g.apps.googleusercontent.com`
   - Client Secret: (Supabase'de kayıtlı)

### Redirect URLs
**Authorized redirect URIs (Google Cloud Console):**
```
https://[SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
```

**Site URL (Supabase Dashboard):**
```
https://kolayfit.app
com.kolayfit.app://oauth-callback
```

**Redirect URLs (Supabase Dashboard):**
```
https://kolayfit.app/*
com.kolayfit.app://**
```

## Test Adımları

### 1. Web'de Test
```bash
npm run build
npm run dev
```
- Login sayfasına git
- "Google ile Giriş Yap" butonuna tıkla
- Google hesabı seç
- Redirect ile geri dön

### 2. iOS'ta Test
```bash
npm run build
npx cap sync ios
```
- Xcode'da çalıştır veya Codemagic'te build et
- Google Sign-In'i test et
- Deep link redirect'i kontrol et

### 3. Android'de Test
```bash
npm run build
npx cap sync android
```
- Android Studio'da çalıştır veya Codemagic'te build et
- Google Sign-In'i test et
- Deep link redirect'i kontrol et

## Codemagic Build

iOS build artık şu adımları izliyor:

1. ✅ `npm install` - Bağımlılıkları yükle
2. ✅ `npm run build` - Web assets'i build et
3. ✅ `npx cap sync ios` - iOS'a sync et
4. ✅ `pod install` - CocoaPods bağımlılıklarını yükle
5. ✅ `xcodebuild` - iOS app'i build et

**Artık patch script'leri yok!**

## Sonuç

Google Sign-In artık **tüm platformlarda (web, iOS, Android)** aynı şekilde çalışıyor:
- ✅ Supabase OAuth kullanıyor
- ✅ Native SDK çakışması yok
- ✅ Apple uyumlu
- ✅ Daha basit ve sürdürülebilir

## Migrasyon Tarihi
**19 Aralık 2025** - Native Google SDK'dan Supabase OAuth'a tamamen geçildi.
