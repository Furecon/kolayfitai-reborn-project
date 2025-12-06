# iOS Build Kurulum Rehberi - Codemagic

Bu rehber, Kolayfit uygulamasını Codemagic üzerinden iOS için build etmek ve App Store'a yüklemek için gereken adımları içerir.

## 📋 Ön Hazırlık

### Gerekli Hesaplar
1. **Apple Developer Account** (Ücretli - $99/yıl)
2. **Codemagic Account** (Ücretsiz başlangıç planı mevcut)
3. **GitHub/GitLab/Bitbucket** hesabı (kod repository için)

## 🍎 Adım 1: Apple Developer Hazırlıkları

### 1.1 Apple Developer Portal
1. [Apple Developer](https://developer.apple.com) hesabınıza giriş yapın
2. Ücretli üyeliği aktif edin ($99/yıl)

### 1.2 App Store Connect API Key Oluşturma
1. [App Store Connect](https://appstoreconnect.apple.com) 'e gidin
2. **Users and Access** > **Keys** sekmesine tıklayın
3. **App Store Connect API** altında **Generate API Key** tıklayın
4. İsim verin (örn: "Codemagic")
5. Access: **Admin** veya **App Manager** seçin
6. **Generate** tıklayın
7. **Download API Key** ile `.p8` dosyasını indirin
8. **Issuer ID** ve **Key ID**'yi not alın (bunlar tekrar gösterilmeyecek)

⚠️ **ÖNEMLİ**: `.p8` dosyasını güvenli bir yerde saklayın, sadece bir kez indirilebilir!

### 1.3 Bundle ID Oluşturma
1. [Apple Developer Portal](https://developer.apple.com/account) > **Certificates, IDs & Profiles**
2. **Identifiers** > **+** butonuna tıklayın
3. **App IDs** seçin ve **Continue**
4. **App** seçin ve **Continue**
5. Bundle ID: `com.kolayfit.app` girin
6. Capabilities ekleyin:
   - **Push Notifications** ✓
   - **Sign in with Apple** (eğer kullanıyorsanız)
7. **Continue** ve **Register**

### 1.4 App Store Connect'te Uygulama Oluşturma
1. [App Store Connect](https://appstoreconnect.apple.com) 'e gidin
2. **My Apps** > **+** > **New App**
3. Bilgileri doldurun:
   - **Platform**: iOS
   - **Name**: Kolayfit
   - **Primary Language**: Turkish
   - **Bundle ID**: com.kolayfit.app (az önce oluşturduğunuz)
   - **SKU**: kolayfit-app (benzersiz bir ID)
4. **Create** tıklayın

## 🚀 Adım 2: Codemagic Kurulumu

### 2.1 Codemagic Hesabı
1. [Codemagic](https://codemagic.io) 'e gidin
2. GitHub/GitLab/Bitbucket ile giriş yapın
3. Ücretsiz planla başlayabilirsiniz

### 2.2 Projeyi Ekleyin
1. **Add application** tıklayın
2. Repository provider seçin (GitHub/GitLab/Bitbucket)
3. **Kolayfit** projesini seçin
4. Codemagic'in projenize erişim izni verin

### 2.3 iOS Code Signing (İmzalama) Ayarları

#### Otomatik Yöntem (Önerilen)
1. Codemagic'te projenizi açın
2. **Settings** > **Code signing identities**
3. **iOS** sekmesine gidin
4. **Automatic** seçeneğini seçin
5. Apple ID kimlik bilgilerinizi girin
6. Codemagic otomatik olarak certificate ve provisioning profile oluşturacak

#### Manuel Yöntem
1. **Manual** seçeneğini seçin
2. Certificate (.p12) ve Provisioning Profile (.mobileprovision) dosyalarınızı yükleyin
3. Certificate password'ünü girin

### 2.4 App Store Connect API Anahtarını Ekleyin
1. **Settings** > **Integrations** > **App Store Connect**
2. **Add key** tıklayın
3. Doldurulacak alanlar:
   - **Key name**: Bir isim verin (örn: "Kolayfit iOS")
   - **Issuer ID**: Adım 1.2'den aldığınız Issuer ID
   - **Key ID**: Adım 1.2'den aldığınız Key ID
   - **Private Key**: `.p8` dosyasının içeriğini yapıştırın
4. **Save** tıklayın

### 2.5 Environment Variables (Ortam Değişkenleri)
1. **Settings** > **Environment variables**
2. Eklenecek değişkenler:
   ```
   APP_STORE_APPLE_ID: [App Store Connect'teki Apple ID'niz]
   MATCH_PASSWORD: [Certificate için şifreniz - eğer varsa]
   ```

## 🔧 Adım 3: codemagic.yaml Yapılandırması

Proje kökündeki `codemagic.yaml` dosyasını güncelleyin:

```yaml
workflows:
  ios-workflow:
    name: iOS Production Build
    # ... (dosya zaten hazır)
```

### Önemli Değişiklikler:
1. `YOUR_EMAIL@example.com` → Gerçek email adresiniz
2. `YOUR_APPLE_ID` → Apple ID'niz (numara, örn: 1234567890)

## ▶️ Adım 4: İlk Build'i Başlatın

### 4.1 Manuel Build
1. Codemagic'te projenizi açın
2. **Start new build** tıklayın
3. **Workflow**: `ios-workflow` seçin
4. **Branch**: `main` veya çalıştığınız branch
5. **Start build** tıklayın

### 4.2 Otomatik Build (Git Push)
1. Kod değişikliği yapın
2. Git'e commit edin:
   ```bash
   git add .
   git commit -m "iOS build için hazırlandı"
   git push origin main
   ```
3. Codemagic otomatik olarak build'i başlatacak

## 📱 Adım 5: TestFlight ve App Store

### Build Başarılı Olursa:
1. Build tamamlandığında otomatik olarak TestFlight'a yüklenecek
2. App Store Connect'te **TestFlight** sekmesinden kontrol edin
3. İç test kullanıcıları ekleyin ve test edin

### App Store'a Gönderme:
1. `codemagic.yaml`'da `submit_to_app_store: true` yapın
2. App Store Connect'te uygulama bilgilerini doldurun:
   - Screenshots
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL
3. Yeni build başlatın
4. Review için gönderin

## 🛠️ Sorun Giderme

### Build Hatası: "No matching provisioning profile"
**Çözüm**:
- Code signing ayarlarını kontrol edin
- Bundle ID'nin eşleştiğinden emin olun
- Certificate ve provisioning profile'ın geçerli olduğunu kontrol edin

### Build Hatası: "Command failed: pod install"
**Çözüm**:
```bash
# Yerel olarak test edin
cd ios/App
pod install
```

### Build Hatası: "App Store Connect API authentication failed"
**Çözüm**:
- API Key bilgilerinin doğru olduğundan emin olun
- `.p8` dosyasının tam içeriğini kopyaladığınızdan emin olun
- Key'in aktif olduğunu Apple Developer'da kontrol edin

### Build Çok Uzun Sürüyor
**Çözüm**:
- `max_build_duration` değerini artırın
- Instance type'ı `mac_mini_m2`'ye yükseltin (daha hızlı)

## 📊 Build Durumunu İzleme

### Codemagic Dashboard
- **Builds**: Tüm build geçmişi
- **Logs**: Detaylı build logları
- **Artifacts**: Oluşturulan .ipa dosyaları
- **Email Notifications**: Build başarı/başarısızlık bildirimleri

### App Store Connect
- **TestFlight**: Test builds
- **App Store**: Production builds
- **Analytics**: İndirme ve kullanım istatistikleri

## 🎯 Sonraki Adımlar

1. ✅ İlk successful build'i alın
2. ✅ TestFlight'ta test edin
3. ✅ Beta kullanıcılarla test edin
4. ✅ App Store review için gönderin
5. ✅ App Store'da yayınlayın

## 📚 Faydalı Linkler

- [Codemagic Docs](https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/)
- [Apple Developer](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)

## 🆘 Destek

Herhangi bir sorun yaşarsanız:
1. Codemagic loglarını kontrol edin
2. [Codemagic Slack](https://codemagic-slack.herokuapp.com/) community'sine katılın
3. [Codemagic Support](https://codemagic.io/support/) 'a ticket açın

---

**Not**: İlk build 20-30 dakika sürebilir. Sabırlı olun! 🚀
