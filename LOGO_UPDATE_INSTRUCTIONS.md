# KolayFit Android Logo Güncelleme Rehberi

## Sorun
Android uygulama icon'u varsayılan Capacitor logosuyla (mavi X) görünüyor. Doğru KolayFit logosu kullanılmalı.

## Çözüm

### Yöntem 1: Android Asset Studio (Önerilen) ⭐

1. **Logo Dosyasını Hazırlayın:**
   - Logo: `/public/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png`
   - Bu yeşil-mavi KolayFit logosu

2. **Android Asset Studio Kullanın:**
   - https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html adresine gidin
   - "Source" bölümünde "Image" seçin
   - KolayFit logosunu yükleyin
   - "Foreground" için:
     - Trim: Yes
     - Padding: %10-20 arası
     - Background Color: Beyaz (#FFFFFF)
   - "Download" ile icon'ları indirin

3. **Icon'ları Android Projesine Kopyalayın:**
   ```bash
   # İndirilen zip'i açın ve şu klasörlere kopyalayın:
   cp res/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/
   cp res/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/
   cp res/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/
   cp res/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/
   cp res/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/

   # Round icon'lar için:
   cp res/mipmap-mdpi/ic_launcher_round.png android/app/src/main/res/mipmap-mdpi/
   cp res/mipmap-hdpi/ic_launcher_round.png android/app/src/main/res/mipmap-hdpi/
   cp res/mipmap-xhdpi/ic_launcher_round.png android/app/src/main/res/mipmap-xhdpi/
   cp res/mipmap-xxhdpi/ic_launcher_round.png android/app/src/main/res/mipmap-xxhdpi/
   cp res/mipmap-xxxhdpi/ic_launcher_round.png android/app/src/main/res/mipmap-xxxhdpi/
   ```

### Yöntem 2: Capacitor Assets (Daha Hızlı) ⚡

Capacitor'ın kendi asset oluşturma aracını kullanın:

1. **Logo Dosyasını Kopyalayın:**
   ```bash
   cp public/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png resources/icon.png
   ```

2. **Capacitor Assets Çalıştırın:**
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate --android
   ```

3. **Projeyi Sync Edin:**
   ```bash
   npm run cap:sync:android
   ```

### Yöntem 3: Manuel Güncelleme (ImageMagick ile)

Eğer ImageMagick kuruluysa:

```bash
# Logo dosyasını değişkene atayın
LOGO="public/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png"

# Farklı boyutlarda icon'lar oluşturun
convert "$LOGO" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert "$LOGO" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert "$LOGO" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert "$LOGO" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert "$LOGO" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Round icon'lar için aynı boyutlarda
convert "$LOGO" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
convert "$LOGO" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
convert "$LOGO" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
convert "$LOGO" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
convert "$LOGO" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# Foreground icon'lar için (Adaptive Icons)
convert "$LOGO" -resize 108x108 android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
convert "$LOGO" -resize 162x162 android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
convert "$LOGO" -resize 216x216 android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
convert "$LOGO" -resize 324x324 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
convert "$LOGO" -resize 432x432 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
```

## İcon Boyutları

Android farklı ekran yoğunlukları için farklı boyutlarda icon'lar gerektirir:

| Yoğunluk | Boyut (px) | Klasör |
|----------|-----------|---------|
| mdpi | 48x48 | mipmap-mdpi |
| hdpi | 72x72 | mipmap-hdpi |
| xhdpi | 96x96 | mipmap-xhdpi |
| xxhdpi | 144x144 | mipmap-xxhdpi |
| xxxhdpi | 192x192 | mipmap-xxxhdpi |

**Foreground (Adaptive Icon):**
- mdpi: 108x108
- hdpi: 162x162
- xhdpi: 216x216
- xxhdpi: 324x324
- xxxhdpi: 432x432

## Son Adımlar

1. **Projeyi Sync Edin:**
   ```bash
   npm run cap:sync:android
   ```

2. **APK/AAB Oluşturun:**
   ```bash
   cd android
   ./gradlew assembleRelease
   # veya
   ./gradlew bundleRelease
   ```

3. **Uygulamayı Test Edin:**
   - Uygulamayı telefondan kaldırın
   - Yeni APK'yı yükleyin
   - Ana ekranda logo kontrol edin

## Sorun Giderme

### Logo Hala Eskiyse:
1. Android Studio'da Build → Clean Project
2. Build → Rebuild Project
3. Uygulamayı telefondan tamamen kaldırın
4. Yeniden yükleyin

### Cache Temizleme:
```bash
cd android
./gradlew clean
cd ..
npm run cap:sync:android
```

## Not
Logo güncellemesi için uygulamanın yeniden build edilmesi ve kullanıcıların yeni versiyonu indirmesi gerekir. Google Play Store'da mevcut kullanıcılar güncellemeyi aldıktan sonra yeni logoyu görecekler.
