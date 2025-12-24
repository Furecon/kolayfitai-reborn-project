# app-ads.txt Kurulum Rehberi

## 📋 app-ads.txt Nedir?

**app-ads.txt** (Authorized Digital Sellers for Apps), IAB Tech Lab tarafından belirlenen ve mobil uygulamalardaki reklam dolandırıcılığını önlemek için kullanılan bir standarttır.

Bu dosya, hangi reklam ağlarının uygulamanızda reklam satma yetkisine sahip olduğunu açıkça belirtir.

---

## 🎯 Neden Gerekli?

### AdMob Gereksinimleri

Google AdMob, gelir paylaşımında şeffaflık ve güvenlik için **app-ads.txt** dosyası gerektirir:

- ✅ Reklam dolandırıcılığını önler
- ✅ Reklam gelirlerinizi korur
- ✅ Google AdMob tarafından doğrulanmanızı sağlar
- ✅ Daha yüksek eCPM oranları sağlayabilir

### Olmadığında Ne Olur?

- ⚠️ AdMob Console'da uyarı görürsünüz
- ⚠️ Reklam gelirleriniz etkilenebilir
- ⚠️ Bazı premium reklamverenler reklamlarını göstermeyebilir

---

## 📁 Dosya İçeriği

Projenizde `app-ads.txt` dosyası oluşturuldu:

```
google.com, pub-8309637989312333, DIRECT, f08c47fec0942fa0
```

### Parametreler

- **google.com** - Reklam ağı (Google AdMob)
- **pub-8309637989312333** - Sizin AdMob Publisher ID'niz
- **DIRECT** - Doğrudan ilişki
- **f08c47fec0942fa0** - Google'ın Seller Account ID'si

---

## 🌐 Nereye Koyulmalı?

### Developer Website'in Root'una

app-ads.txt dosyası, **developer website**'inizin root dizinine konulmalıdır.

### Örnekler

Eğer developer website'iniz:
- `kolayfit.com` ise → `https://kolayfit.com/app-ads.txt`
- `www.kolayfit.com` ise → `https://www.kolayfit.com/app-ads.txt`
- `kolayfit.app` ise → `https://kolayfit.app/app-ads.txt`

---

## 📱 Developer Website Nedir?

### Google Play Store

Google Play Console'da belirttiğiniz **Developer website** alanı:

1. [Google Play Console](https://play.google.com/console) → Apps
2. KolayFit uygulamasını seçin
3. **Store presence** → **Store settings** → **Contact details**
4. **Website** alanına bakın

Bu domain'e app-ads.txt dosyasını koymalısınız.

### Apple App Store

App Store Connect'te belirttiğiniz **Marketing URL** veya **Support URL**:

1. [App Store Connect](https://appstoreconnect.apple.com) → Apps
2. KolayFit uygulamasını seçin
3. **App Information** → **Marketing URL** veya **Support URL**
4. Bu domain'e app-ads.txt dosyasını koymalısınız

---

## 🚀 Kurulum Adımları

### 1️⃣ Developer Website'inizi Belirleyin

Önce hangi domain'i kullandığınızı kontrol edin:

```bash
# Google Play Store'da
# Store settings > Contact details > Website

# Örnek: https://kolayfit.com
```

### 2️⃣ Dosyayı Yükleyin

#### Seçenek A: Web Hosting Kontrolünüz Varsa

1. `app-ads.txt` dosyasını indirin (proje root'unda)
2. FTP/SFTP ile sitenizin root dizinine yükleyin
3. Doğru konumda olduğundan emin olun:
   ```
   https://yourdomain.com/app-ads.txt
   ```

#### Seçenek B: Statik Site (GitHub Pages, Netlify, Vercel)

**GitHub Pages:**
```bash
# Repository root'una koyun
cp app-ads.txt /path/to/your/website-repo/app-ads.txt
git add app-ads.txt
git commit -m "Add app-ads.txt for AdMob"
git push
```

**Netlify:**
```bash
# public/ veya root dizinine koyun
cp app-ads.txt /path/to/your/website/public/app-ads.txt
# Deploy edin
```

**Vercel:**
```bash
# public/ dizinine koyun
cp app-ads.txt /path/to/your/website/public/app-ads.txt
# Deploy edin
```

#### Seçenek C: WordPress

1. WordPress Admin → **Plugins** → **Add New**
2. "Insert Headers and Footers" veya "WP Add Custom CSS and JS" gibi bir plugin yükleyin
3. Veya FTP ile `/public_html/app-ads.txt` dosyasını oluşturun

#### Seçenek D: Henüz Website Yoksa

Eğer developer website'iniz yoksa:

1. Basit bir landing page oluşturun (GitHub Pages ücretsiz)
2. app-ads.txt dosyasını oraya koyun
3. Google Play ve App Store'da bu domain'i güncelleyin

---

## ✅ Doğrulama

### 1️⃣ Manuel Test

Tarayıcınızda şu URL'yi açın:
```
https://yourdomain.com/app-ads.txt
```

Görmeniz gereken:
```
google.com, pub-8309637989312333, DIRECT, f08c47fec0942fa0
```

### 2️⃣ AdMob Console Doğrulaması

1. [AdMob Console](https://apps.admob.com/) → Settings
2. **Account information** → **Manage app-ads.txt**
3. "Crawl your app-ads.txt file" butonuna tıklayın
4. Doğrulamanın tamamlanmasını bekleyin (birkaç dakika - birkaç saat)

### 3️⃣ Google Validator

Google'ın doğrulama aracını kullanın:
```
https://adstxt.guru/validator/?domain=yourdomain.com
```

---

## 🔧 Sorun Giderme

### ❌ "app-ads.txt not found"

**Sorun:** Dosya bulunamıyor

**Çözümler:**
1. Dosyanın tam olarak root dizinde olduğundan emin olun
2. Dosya isminin **tam olarak** `app-ads.txt` olduğunu kontrol edin (büyük/küçük harf önemli değil ama `.txt` uzantısı olmalı)
3. Sunucunuzda `.txt` dosyalarının doğru MIME type ile sunulduğundan emin olun

### ❌ "Format error"

**Sorun:** Dosya formatı hatalı

**Çözümler:**
1. Dosyada sadece AdMob satırı olmalı, fazladan boşluk veya karakter olmamalı
2. Her satır tam olarak şu formatta olmalı:
   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
3. Satır sonlarında `\n` (Unix) kullanın, `\r\n` (Windows) kullanmayın

### ❌ "Domain mismatch"

**Sorun:** Google Play/App Store'daki domain ile app-ads.txt'nin domain'i eşleşmiyor

**Çözümler:**
1. Google Play Console ve App Store Connect'teki domain'leri kontrol edin
2. Subdomain farkına dikkat edin (`kolayfit.com` vs `www.kolayfit.com`)
3. Her iki domainde de dosyayı barındırın (redirect ile)

### ⏳ "Verification pending"

**Sorun:** Doğrulama beklemede

**Çözüm:**
- Google'ın crawler'ının siteyi ziyaret etmesi gerekiyor
- 24-48 saat bekleyin
- Siteye erişilebildiğinden emin olun (robots.txt engellememiş olmalı)

---

## 📊 robots.txt Kontrolü

app-ads.txt'in taranabilmesi için `robots.txt` dosyanızın engellemediğinden emin olun:

```txt
# robots.txt
User-agent: *
Allow: /app-ads.txt
```

Veya hiç robots.txt yoksa sorun olmaz.

---

## 🔒 HTTPS Zorunlu mu?

Hayır, ama önerilir:
- HTTP: `http://yourdomain.com/app-ads.txt` ✅ Çalışır
- HTTPS: `https://yourdomain.com/app-ads.txt` ✅ Daha güvenli

Google her ikisini de kontrol eder.

---

## 📝 Örnek Senaryolar

### Senaryo 1: GitHub Pages ile

```bash
# 1. GitHub Pages repo'nuza gidin
cd my-website

# 2. app-ads.txt'i kopyalayın
cp /path/to/kolayfit/app-ads.txt ./app-ads.txt

# 3. Commit ve push
git add app-ads.txt
git commit -m "Add app-ads.txt for AdMob verification"
git push origin main

# 4. 5-10 dakika sonra kontrol edin
curl https://yourusername.github.io/app-ads.txt
```

### Senaryo 2: Netlify ile

```bash
# 1. Website repo'nuza gidin
cd my-website

# 2. public dizinine kopyalayın
cp /path/to/kolayfit/app-ads.txt ./public/app-ads.txt

# 3. Commit ve Netlify otomatik deploy eder
git add public/app-ads.txt
git commit -m "Add app-ads.txt for AdMob"
git push origin main

# 4. Deploy tamamlanınca kontrol edin
curl https://yoursite.netlify.app/app-ads.txt
```

### Senaryo 3: cPanel ile

1. cPanel'e giriş yapın
2. **File Manager** → **public_html** dizinine gidin
3. **Upload** → `app-ads.txt` dosyasını yükleyin
4. Dosyanın `public_html/app-ads.txt` konumunda olduğunu doğrulayın
5. Tarayıcıda test edin: `https://yourdomain.com/app-ads.txt`

---

## 🎯 Checklist

Kurulumdan önce kontrol edin:

- [ ] Developer website domain'inizi biliyorsunuz
- [ ] Google Play/App Store'da bu domain doğru yazılmış
- [ ] Website'inize erişim yetkisi var
- [ ] `app-ads.txt` dosyası hazır
- [ ] AdMob Publisher ID doğru (`pub-8309637989312333`)

Kurulumdan sonra kontrol edin:

- [ ] Dosya browser'da açılıyor: `https://yourdomain.com/app-ads.txt`
- [ ] İçeriği doğru görünüyor
- [ ] robots.txt engellememiş
- [ ] AdMob Console'da "Crawl" butonuna tıkladınız
- [ ] 24-48 saat sonra doğrulama tamamlandı

---

## 💡 Önemli Notlar

### Birden Fazla Reklam Ağı

Eğer gelecekte başka reklam ağları da eklerseniz (örn: Unity Ads, Meta Audience Network), onların satırlarını da ekleyin:

```txt
google.com, pub-8309637989312333, DIRECT, f08c47fec0942fa0
unity.com, 1234567, DIRECT, 96cabb5fbdde37a7
facebook.com, 1234567890, DIRECT, c3e20eee3f780d68
```

### Domain Değişikliği

Developer website domain'inizi değiştirirseniz:
1. Yeni domainde app-ads.txt'i ayarlayın
2. Google Play/App Store'da domain'i güncelleyin
3. AdMob Console'da yeniden doğrulayın

### Alt Domain

Eğer `play.kolayfit.com` gibi bir alt domain kullanıyorsanız:
- Ana domainde (`kolayfit.com`) olması yeterli
- Veya her ikisinde de olabilir

---

## 📞 Yardım

app-ads.txt ile ilgili sorularınız için:

- **IAB Tech Lab:** https://iabtechlab.com/ads-txt/
- **Google AdMob Help:** https://support.google.com/admob/answer/9785333
- **Validator:** https://adstxt.guru/

---

## 🎉 Tamamlandı mı?

Doğrulama tamamlandığında:
- ✅ AdMob Console'da "Verified" görürsünüz
- ✅ Uyarı mesajları kaybolur
- ✅ Reklam gelirleriniz optimize olur

---

**Developer Website'inizi Belirleyin ve app-ads.txt'i Yükleyin!**

**Dosya Konumu:** `/tmp/cc-agent/57467391/project/app-ads.txt`

**İçerik:**
```
google.com, pub-8309637989312333, DIRECT, f08c47fec0942fa0
```

**Hedef URL:**
```
https://YOUR-DEVELOPER-WEBSITE.com/app-ads.txt
```
