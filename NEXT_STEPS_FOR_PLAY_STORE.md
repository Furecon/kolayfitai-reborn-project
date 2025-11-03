# 🚀 Google Play Store'a Yeni Sürüm Yükleme Rehberi

## Hızlı Başlangıç

Logo güncellemesi tamamlandı! Şimdi Google Play Store'a yeni sürümü yüklemek için bu adımları izleyin.

## 📋 Adım Adım Rehber

### 1. Version Numarasını Artırın

`android/app/build.gradle` dosyasını açın:

```gradle
android {
    defaultConfig {
        // Bunu artırın (ör: 1 → 2, 2 → 3)
        versionCode 2

        // Bunu güncelleyin (ör: "1.0.0" → "1.0.1")
        versionName "1.0.1"
    }
}
```

**Önemli:**
- `versionCode` her yeni build'de artmalı (integer)
- `versionName` kullanıcılara görünen sürüm (string)

### 2. Release Build Oluşturun

#### Signing Key'iniz Varsa:

```bash
cd android
./gradlew bundleRelease
```

Bundle dosyası: `android/app/build/outputs/bundle/release/app-release.aab`

#### Signing Key'iniz Yoksa:

Önce signing key oluşturun:
```bash
keytool -genkey -v -keystore kolayfit-release-key.keystore \
  -alias kolayfit -keyalg RSA -keysize 2048 -validity 10000
```

Sonra `android/app/build.gradle`'a ekleyin:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../kolayfit-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'kolayfit'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Bundle'ı Test Edin

```bash
# Bundle bilgilerini kontrol edin
bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=kolayfit.apks

# Local device'a yükleyin
bundletool install-apks --apks=kolayfit.apks
```

### 4. Google Play Console'a Yükleyin

1. **Play Console'a Giriş:**
   - https://play.google.com/console
   - KolayFit uygulamasını seçin

2. **Production Track'e Git:**
   - Sol menüden: **Release → Production**
   - Sağ üstten: **Create new release**

3. **Bundle Yükleyin:**
   - "App bundles" bölümüne tıklayın
   - `app-release.aab` dosyasını sürükle-bırak
   - Otomatik olarak version code kontrol edilir

4. **Release Notes Ekleyin:**

**Türkçe:**
```
Bu güncellemede:
• Uygulama logosu yenilendi
• Performans iyileştirmeleri
```

**İngilizce:**
```
What's new:
• Updated app icon
• Performance improvements
```

5. **İncelemeye Gönderin:**
   - "Review release" butonuna tıklayın
   - Tüm bilgileri kontrol edin
   - "Start rollout to Production" tıklayın

### 5. Review Sürecini Bekleyin

- ⏱️ **Ortalama Süre:** 1-3 gün
- 📧 **Bildirim:** Email ile onay/red bildirimi gelir
- ✅ **Onaylanınca:** Kullanıcılar güncellemeyi görür

## 🔍 Build Öncesi Kontrol Listesi

- [ ] Logo değişikliği doğrulandı
- [ ] Version code artırıldı
- [ ] Version name güncellendi
- [ ] Signing key hazır
- [ ] Release notes hazırlandı
- [ ] Test build oluşturuldu
- [ ] Local device'da test edildi

## 📱 Kullanıcı Deneyimi

### Mevcut Kullanıcılar:
1. Play Store'dan "Güncelle" bildirimi alır
2. Güncellemeyi yükler
3. Yeni logo ana ekranda görünür

### Yeni Kullanıcılar:
- Direkt yeni logoyla indirirler

## 🐛 Sık Karşılaşılan Sorunlar

### "You cannot rollout this release because it does not allow any existing users to upgrade"

**Çözüm:** Version code yeterince artırılmamış
```gradle
// Eski sürüm: versionCode 1
// Yeni sürüm: versionCode 2 (veya daha fazla)
```

### "Upload failed: You need to use a different version code"

**Çözüm:** Bu version code zaten kullanılmış
```gradle
// Her yeni upload için farklı versionCode kullanın
versionCode 3  // Önceki: 2
```

### "The APK or Android App Bundle was not signed"

**Çözüm:** Signing configuration eksik
- Release keystore oluşturun
- build.gradle'da signingConfigs tanımlayın

## 📊 Rollout Stratejisi

### Staged Rollout (Önerilen):

İlk yükleme yerine kademeli dağıtım:

1. **%10:** 1000 kullanıcıdan 100'üne
2. **%50:** Sorun yoksa genişlet
3. **%100:** Tam rollout

**Avantaj:** Büyük bir sorun varsa hızlı geri dönüş

**Play Console'da:**
- Release → "Start rollout" yerine
- "Managed rollout" seçin
- Yüzdeyi ayarlayın

## 🔐 Güvenlik Notları

### Keystore Yedekleme:
```bash
# Keystore'u güvenli bir yere kopyalayın
cp android/kolayfit-release-key.keystore ~/secure-backup/

# Şifreyi güvenli tutun
# ASLA GitHub'a commit etmeyin!
```

**Önemli:** Keystore kaybedilirse uygulamayı güncelleyemezsiniz!

### .gitignore Kontrolü:
```
# Bunlar GitHub'a gitmemeli:
*.keystore
*.jks
key.properties
google-services.json (민감한 bilgiler varsa)
```

## 📈 Post-Launch

### İlk 24 Saat:
- [ ] Crash raporlarını kontrol edin (Play Console → Quality)
- [ ] User reviews okuyun
- [ ] ANR (Application Not Responding) sayısına bakın

### İlk Hafta:
- [ ] Update adoption rate'i izleyin
- [ ] Performance metrics kontrol edin
- [ ] User feedback'e cevap verin

## 🆘 Acil Durum

### Kritik Bug Bulunursa:

1. **Rollout'u Durdurun:**
   - Play Console → Production → "Halt rollout"

2. **Hotfix Hazırlayın:**
   ```bash
   # Version code'u artırın
   versionCode 3
   versionName "1.0.2-hotfix"

   # Bug'ı düzeltin
   # Yeni build oluşturun
   ./gradlew bundleRelease
   ```

3. **Acil Update Yükleyin:**
   - Yeni release oluşturun
   - "Priority update" seçin
   - Kullanıcılar hızlıca zorlanır

## ✅ Başarı Metrikleri

Yeni logo versiyonu başarılı sayılır:
- Crash rate artmadı
- Update adoption >80% (7 gün içinde)
- Negative reviews artmadı
- App store rating korundu

---

**Son Güncelleme:** 3 Kasım 2025
**Hazırlayan:** KolayFit Development Team
**Build Tools:** Gradle 8.x, AGP 8.x, Capacitor 6.x
