# Bildirim Debug Rehberi

## 🔍 Logcat'te Notification Loglarını Görme

Android Studio'da Logcat penceresinde filtreleme yapın:

### 1. Console/Capacitor Logları
Filtre: `Capacitor/Console`

Göreceğiniz loglar:
```
🔔 Initializing notifications for user: xxx
📋 Current permission status: {...}
✅ User preferences loaded, scheduling notifications
📊 Total pending notifications: X
```

### 2. JavaScript Console Logları
Filtre: `chromium:CONSOLE`

Göreceğiniz loglar:
```
[INFO:CONSOLE] "🔔 Initializing notifications for user: xxx"
[INFO:CONSOLE] "📅 Scheduling notification: meal_reminder at 2025-12-02T12:30:00"
```

### 3. Hızlı Test

Uygulama açıldığında Dashboard'da şu logları görmelisiniz:

1. **Permission kontrolü:**
```
🔔 Requesting notification permissions...
✅ Notification permissions granted
```

2. **Notification initialize:**
```
🔔 Initializing notifications for user: xxx
✅ User preferences loaded, scheduling notifications
```

3. **Scheduled notifications:**
```
📅 Scheduling notification: meal_reminder at [zaman]
✅ Notification scheduled successfully: meal_reminder (ID: 1001)
📊 Total pending notifications: 2
```

## 🧪 Test Bildirimi ile Kontrol

Settings > Bildirimler sayfasında "Test Bildirimi Gönder" butonuna basın.

**Başarılı test logları:**
```
🧪 Scheduling test notification...
✅ Test notification scheduled for: 2025-12-02T17:15:00
```

**Permission sorunu varsa:**
```
⚠️ No notification permissions
```

## ⚠️ Olası Sorunlar

### Sorun 1: Permission verilmemiş
**Log:** `⚠️ Notification permissions denied`

**Çözüm:**
1. Cihaz Settings > Apps > KolayFit
2. Notifications > Allow all

### Sorun 2: Bildirimler planlanmıyor
**Log:** `🚫 Notifications not supported on this platform`

**Çözüm:**
- Web'de mi çalışıyorsunuz? Sadece mobilde çalışır
- Android Studio emulator yerine gerçek cihazda test edin

### Sorun 3: Kullanıcı app içinde
**Log:** `⏭️ Notification skipped: meal_reminder`

**Normal davranış:** Kullanıcı uygulamada iken bildirim gönderilmez.

### Sorun 4: Quiet hours
**Log:** `⏭️ Notification skipped: [type]`

**Kontrol:** Settings'de Sessiz Saatler kontrolü yapın.

## 📱 Test Senaryoları

### Senaryo 1: İlk Kurulum
1. Uygulamayı ilk kez aç
2. Dashboard yüklensin
3. Logcat'te "Initializing notifications" görülmeli
4. Permission dialog çıkmalı (Android 13+)

### Senaryo 2: Meal Reminder
1. Settings > Bildirimler
2. Öğün Hatırlatmaları: AÇIK
3. Öğle Yemeği saati: 5 dakika sonrası
4. Kaydet
5. 5 dakika bekle
6. Bildirim gelmeli

### Senaryo 3: Test Notification
1. Settings > Bildirimler
2. "🧪 Test Bildirimi Gönder"
3. Toast: "5 saniye içinde..."
4. 5 saniye sonra bildirim gelmeli

## 🔧 Advanced Debugging

### Permission Status Kontrolü
```javascript
// Chrome DevTools Console'da
const status = await Capacitor.Plugins.LocalNotifications.checkPermissions()
console.log(status)
// Beklenen: {display: 'granted'}
```

### Pending Notifications Kontrolü
```javascript
const pending = await Capacitor.Plugins.LocalNotifications.getPending()
console.log('Pending:', pending.notifications.length)
pending.notifications.forEach(n => {
  console.log(`ID: ${n.id}, Title: ${n.title}, Schedule: ${n.schedule}`)
})
```

### Manuel Test Notification
```javascript
await Capacitor.Plugins.LocalNotifications.schedule({
  notifications: [{
    id: 99999,
    title: 'Manuel Test',
    body: 'Bu bir test bildirimidir',
    schedule: { at: new Date(Date.now() + 3000) }
  }]
})
```

## 📊 Normal Log Akışı

Başarılı bir bildirim kurulumu şöyle görünür:

```
[Console] 📱 Running on native platform, checking notification support
[Console] 🔔 Requesting notification permissions...
[Console] 🔔 Permission status: {display: 'granted'}
[Console] ✅ Notification permissions granted
[Console] 🔔 Initializing notifications for user: abc123
[Console] 📋 Current permission status: {display: 'granted'}
[Console] 📝 No preferences found, creating defaults
[Console] ✅ User preferences loaded, scheduling notifications
[Console] 📅 Scheduling notification: meal_reminder at 2025-12-02T12:30:00.000Z
[Console]    Title: 🍽️ Öğle Yemeği Zamanı
[Console]    Body: Öğününüzü kaydederek günlük takibinizi yapın
[Console] ✅ Notification scheduled successfully: meal_reminder (ID: 1001)
[Console] 📅 Scheduling notification: water_reminder at 2025-12-02T14:30:00.000Z
[Console]    Title: 💧 Su İçmeyi Unutma
[Console]    Body: Günlük su hedefiniz için bir bardak su için
[Console] ✅ Notification scheduled successfully: water_reminder (ID: 2001)
[Console] 📊 Total pending notifications: 2
[Console]    - ID: 1001, Title: 🍽️ Öğle Yemeği Zamanı, Schedule: {...}
[Console]    - ID: 2001, Title: 💧 Su İçmeyi Unutma, Schedule: {...}
```
