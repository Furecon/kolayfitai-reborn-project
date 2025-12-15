# iOS Build (Mac Olmadan)

Mac cihazın yoksa, iOS build almak için birkaç seçeneğin var:

## Seçenek 1: Codemagic (Önerilen ✅)

**Avantajları:**
- ✅ Otomatik certificate yönetimi
- ✅ Mac gerekmez
- ✅ App Store Connect entegrasyonu hazır
- ✅ Certificate'leri Codemagic yönetiyor

**Güncelleme Yapıldı:**
- Cache tamamen devre dışı bırakıldı
- Daha agresif temizlik scriptleri eklendi
- Her build'de package-lock.json yenileniyor

### Nasıl Kullanılır:

1. **Codemagic'te zaten kurulu:**
   - App Store Connect bağlı (integration name: "Codemagic")
   - Certificate'ler otomatik yönetiliyor
   - Email bildirimleri aktif

2. **Build başlatmak:**
   ```bash
   git add .
   git commit -m "Fix Xcode 26.1 compatibility"
   git push
   ```

   Codemagic otomatik başlayacak.

3. **Manuel trigger:**
   - Codemagic dashboard → Start new build

### Sorun Çözüm:

Eğer hala cache sorunu olursa:

1. **Codemagic dashboard'da:**
   - Build settings → Advanced → Clear cache
   - Sonra yeni build başlat

2. **Ya da script'e ekle:**
   ```yaml
   - name: Force clean everything
     script: |
       # Nuclear option - her şeyi temizle
       cd $CM_BUILD_DIR
       git clean -fdx
       rm -rf node_modules package-lock.json
       npm cache clean --force
   ```

---

## Seçenek 2: GitHub Actions (Mac Gerekmez - Cloud Mac Kullanır)

GitHub Actions'ın kendi Mac sunucuları var, ama **certificate yönetimi manuel**.

### Gereksinimler:

Certificate ve provisioning profile oluşturmak için **bir kere Mac'e erişim** gerekiyor:

**Nerede bulabilirsin:**
- Arkadaş/aile Mac'i (30 dakika yeter)
- Apple Store (Mac dene)
- Internet cafe / co-working space
- Mac kiralama servisleri (online)

**Tek seferlik işlem:**
1. Apple Developer → Certificates → Create Distribution Certificate
2. Keychain'den export (.p12)
3. Provisioning profile download
4. GitHub secrets'a yükle

Sonra GitHub Actions her zaman çalışır.

---

## Seçenek 3: Windows/Linux'ta Fastlane Match

**Fastlane Match** certificate'leri Git repo'da saklıyor.

### Kurulum:

```bash
# Fastlane kur (Windows/Linux)
gem install fastlane

# Match setup
cd ios
fastlane match init

# Certificate'leri Git'e kaydet
fastlane match appstore
```

**Sorun:** İlk certificate oluşturmak için gene Mac gerekiyor.

---

## Seçenek 4: EAS Build (Expo)

Expo Application Services - iOS build servisi:

```bash
npm install -g eas-cli
eas build --platform ios
```

**Durum:** Capacitor projeleri için uyumlu ama setup karmaşık.

---

## Seçenek 5: Appcircle

Codemagic'e alternatif:
- https://appcircle.io
- Ücretsiz plan: 25 dakika/ay (sınırlı)
- Otomatik certificate yönetimi var

---

## Seçenek 6: Mac Kiralama Servisleri

**MacinCloud** veya **MacStadium**:
- Saatlik Mac kiralama
- Uzaktan erişim (VNC/RDP)
- Sadece certificate oluşturmak için kullan
- Maliyet: ~$20-30/ay

---

## Önerim (Senin için):

### Kısa Vadede: Codemagic

**Neden:**
- ✅ Zaten kurulu
- ✅ Certificate'ler hazır
- ✅ Hiçbir şey yapman gerekmez
- ✅ Cache sorunu çözüldü (yukarıdaki değişikliklerle)

**Yapman gereken:**
```bash
git add codemagic.yaml
git commit -m "Disable cache for Xcode 26.1"
git push
```

Codemagic otomatik build alacak.

### Uzun Vadede: GitHub Actions

**Eğer:**
- Daha fazla kontrol istersen
- Ücretsiz dakika avantajı (2000 vs 500)
- Build süreleri önemliyse

**Ama önce:**
- Bir kere Mac'e erişip certificate oluştur
- Veya mevcut Codemagic certificate'lerini export et

---

## Sıkça Sorulan Sorular

### Q: Certificate olmadan iOS build alabilir miyim?
**A:** Hayır. Apple, tüm iOS uygulamalarının certificate ile imzalanmasını zorunlu tutuyor.

### Q: Windows'ta Xcode kullanabilir miyim?
**A:** Hayır. Xcode sadece macOS'te çalışıyor.

### Q: Emulator'de test edebilir miyim?
**A:** Web preview: `npm run dev`
Android emulator: ✅ Windows'ta çalışır
iOS simulator: ❌ macOS gerekir

### Q: TestFlight'a yüklemek için ne gerekir?
**A:**
1. Signed IPA (certificate ile)
2. App Store Connect hesabı
3. Upload tool (Codemagic otomatik yapıyor)

---

## Sonuç

**Şimdilik Codemagic kullanmaya devam et.**

Cache sorununu çözdük:
- ✅ Cache devre dışı
- ✅ Agresif temizlik
- ✅ Fresh install garantili

**Commit ve push yap, hemen test edelim!**

```bash
git add codemagic.yaml IOS_BUILD_WITHOUT_MAC.md
git commit -m "Disable Codemagic cache for Xcode 26.1"
git push
```
