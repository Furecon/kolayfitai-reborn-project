# Bildirim Kontrolü - Hızlı Test

## 🚀 Test Adımları:

### 1. Logcat Filtresi Ayarla
Android Studio > Logcat > Filter kutusuna yazın:
```
Capacitor|chromium:CONSOLE
```

### 2. Uygulamayı Başlat
- Android Studio'dan Run (Shift+F10)
- Dashboard açılacak

### 3. Logları Kontrol Et

**Görmesi gerekenler:**
```
[Capacitor] 📱 Running on native platform
[Capacitor] 🔔 Requesting notification permissions...
[Capacitor] ✅ Notification permissions granted
[Capacitor] 🔔 Initializing notifications for user: xxx
```

**Eğer göremiyorsanız:**

#### A) Web'de mi çalışıyorsunuz?
Tarayıcıda değil, **Android cihazda/emulator'da** test edin!

#### B) Console.log çalışmıyor mu?
Chrome DevTools'u açın:
1. Chrome'da: `chrome://inspect`
2. Cihazınızı bulun
3. "Inspect" tıklayın
4. Console'u göreceksiniz

#### C) Permission verilmemiş mi?
Cihazda:
```
Settings > Apps > KolayFit > Notifications
```
Tüm bildirimleri AÇIK yapın.

### 4. Test Bildirimi Gönder

Uygulamada:
1. Settings > Bildirimler
2. "🧪 Test Bildirimi Gönder" butonuna bas
3. 5 saniye bekle
4. Bildirim gelecek!

**Test başarısız olursa:**
- Toast'ta hata mesajı göreceksiniz
- Logcat'te "⚠️ No notification permissions" yazacak

### 5. Manual Debug (DevTools'da)

Chrome DevTools Console'da çalıştırın:

```javascript
// Permission kontrol
const perm = await Capacitor.Plugins.LocalNotifications.checkPermissions()
console.log('Permission:', perm)

// Pending notifications
const pending = await Capacitor.Plugins.LocalNotifications.getPending()
console.log('Pending notifications:', pending.notifications.length)

// Test notification schedule
await Capacitor.Plugins.LocalNotifications.schedule({
  notifications: [{
    id: 88888,
    title: 'DevTools Test',
    body: 'Manual test notification',
    schedule: { at: new Date(Date.now() + 3000) }
  }]
})
console.log('Scheduled! Wait 3 seconds...')
```

## ⚠️ Sık Karşılaşılan Sorunlar

### Sorun 1: "Hiçbir log göremiyorum"
**Sebep:** Web'de çalışıyorsunuz
**Çözüm:** Android cihaz/emulator kullanın

### Sorun 2: "Permission denied"
**Sebep:** Uygulama izni yok
**Çözüm:** 
```
Cihaz Settings > Apps > KolayFit > Notifications > AÇIK
```

### Sorun 3: "Bildirim gelmiyor ama log başarılı"
**Sebep:** Uygulama açık
**Çözüm:** Uygulamayı kapat, home'a git, bekle

### Sorun 4: "Test butonu hata veriyor"
**Sebep:** LocalNotifications plugin yüklü değil
**Çözüm:**
```bash
npx cap sync android
```

## 📊 Beklenen Log Çıktısı

```
[INFO:CONSOLE] "📱 Running on native platform, checking notification support"
[INFO:CONSOLE] "🔔 Requesting notification permissions..."
[INFO:CONSOLE] "🔔 Permission status: {display: 'granted'}"
[INFO:CONSOLE] "✅ Notification permissions granted"
[INFO:CONSOLE] "🔔 Initializing notifications for user: abc-123"
[INFO:CONSOLE] "📋 Current permission status: {display: 'granted'}"
[INFO:CONSOLE] "✅ User preferences loaded, scheduling notifications"
[INFO:CONSOLE] "📅 Scheduling notification: meal_reminder at 2025-12-02T12:30:00.000Z"
[INFO:CONSOLE] "   Title: 🍽️ Öğle Yemeği Zamanı"
[INFO:CONSOLE] "   Body: Öğününüzü kaydederek günlük takibinizi yapın"
[INFO:CONSOLE] "✅ Notification scheduled successfully: meal_reminder (ID: 1001)"
[INFO:CONSOLE] "📊 Total pending notifications: 2"
[INFO:CONSOLE] "   - ID: 1001, Title: 🍽️ Öğle Yemeği Zamanı"
[INFO:CONSOLE] "   - ID: 2001, Title: 💧 Su İçmeyi Unutma"
```

## ✅ Başarı Kriterleri

1. ✅ Logcat'te initialization logları görünüyor
2. ✅ Permission status: 'granted'
3. ✅ Pending notifications > 0
4. ✅ Test notification çalışıyor (5 saniye sonra geliyor)
5. ✅ Schedule edilen bildirimler zamanında geliyor

Hepsi tamam ise: **Bildirimler çalışıyor!** 🎉
