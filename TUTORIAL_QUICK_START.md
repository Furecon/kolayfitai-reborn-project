# Tutorial Sistemi - Quick Start

## Hızlı Başlangıç (5 Dakika)

Tutorial sistemini projeye entegre etmek için bu adımları takip edin.

---

## ✅ 1. Tutorial Sistemi Hazır!

Tutorial sistemi zaten kuruldu ve çalışıyor:

### Yüklü Componentler:
- ✅ `TutorialProvider` (App.tsx'te aktif)
- ✅ `TutorialEngine` (Core motor)
- ✅ `TutorialSpotlight`, `TutorialPointer`, `TutorialTooltip`
- ✅ Ayarlar > Rehberler & İpuçları ekranı

### Hazır 10 Tutorial:
1. `first_login_walkthrough` - İlk giriş (5 adım)
2. `add_meal` - Yemek ekleme (2 adım)
3. `analysis_choice` - Analiz seçimi (2 adım)
4. `macro_screen` - Makro ekranı (2 adım)
5. `meal_history` - Geçmiş öğünler (3 adım)
6. `settings_profile` - Ayarlar (2 adım)
7. `subscription` - Abonelik (3 adım)
8. `diet_plan` - Diyet planı (3 adım)
9. `water_tracking` - Su takibi (3 adım)
10. `notifications` - Bildirimler (3 adım)

---

## 🎯 2. İlk Tutorial'ını Ekle (3 Adım)

### Adım 1: Config'e Tutorial Ekle

`src/lib/tutorialConfig.ts` dosyasını aç ve `tutorials` array'ine ekle:

```typescript
{
  featureId: 'my_first_tutorial',
  title: 'İlk Tutorial',
  trigger: 'first_time_feature',
  steps: [
    {
      stepId: 's1',
      targetKey: 'MyButton',
      pointer: 'finger',
      placement: 'bottom',
      title: 'Butona bas',
      bodyTr: 'Bu butona basarak işlem yapabilirsin.',
      bodyEn: 'Press this button to perform action.'
    }
  ]
}
```

### Adım 2: Component'te Target Belirle

Component'ini aç ve target element'i işaretle:

```tsx
import { useTutorialTarget } from '@/hooks/useTutorialTarget'

export function MyComponent() {
  // Target'ı register et
  const buttonRef = useTutorialTarget('MyButton')

  return (
    <button ref={buttonRef}>
      Bana Tıkla
    </button>
  )
}
```

### Adım 3: Tutorial'ı Tetikle

Component mount olduğunda tutorial otomatik başlasın:

```tsx
import { useTutorialTrigger } from '@/hooks/useTutorialTrigger'

export function MyComponent() {
  // Tutorial'ı otomatik tetikle
  useTutorialTrigger('my_first_tutorial')

  const buttonRef = useTutorialTarget('MyButton')

  return (
    <button ref={buttonRef}>
      Bana Tıkla
    </button>
  )
}
```

**TAMAMDIR!** 🎉

---

## 🧪 3. Test Et

### Manuel Test

1. **Ayarlar > Rehberler & İpuçları**'na git
2. "İlk Tutorial" kartını bul
3. **"Başlat"** butonuna bas
4. Tutorial'ı izle ve test et

### Otomatik Test

1. localStorage'ı temizle:
   ```javascript
   // Browser console'da
   localStorage.removeItem('tutorial_state_v1')
   ```

2. Sayfayı yenile
3. Component'e git - tutorial otomatik başlamalı

---

## 📝 4. Mevcut Tutorial'ları Aktive Et

Hazır tutorial'lar var ama target'ları henüz işaretlenmemiş. İşte nasıl aktive edebileceğin:

### Örnek: Dashboard Tutorial'ı

#### 1. Dashboard'a Target'ları Ekle

```tsx
// src/components/Dashboard/Dashboard.tsx
import { useTutorialTarget } from '@/hooks/useTutorialTarget'
import { useTutorialTrigger } from '@/hooks/useTutorialTrigger'

export function Dashboard() {
  // İlk giriş tutorial'ı
  useTutorialTrigger('first_login_walkthrough')

  return (
    <div>
      {/* ... existing code ... */}
    </div>
  )
}
```

#### 2. CalorieCards'a Add Button Target'ı Ekle

```tsx
// src/components/Dashboard/CalorieCards.tsx
import { useTutorialTarget } from '@/hooks/useTutorialTarget'

export function CalorieCards({ onCameraClick }: Props) {
  const addButtonRef = useTutorialTarget('AddMealButton')

  return (
    <div>
      <button ref={addButtonRef} onClick={onCameraClick}>
        Yemek Ekle
      </button>
    </div>
  )
}
```

#### 3. MacroChart'a Target Ekle

```tsx
// src/components/Dashboard/CircularMacroChart.tsx veya CalorieCards.tsx
const macroContainerRef = useTutorialTarget('MacroRings')

return (
  <div ref={macroContainerRef}>
    {/* Macro charts */}
  </div>
)
```

#### 4. WaterTracker'a Target Ekle

```tsx
// src/components/Dashboard/WaterTracker.tsx
const waterWidgetRef = useTutorialTarget('WaterWidget')
const addWaterRef = useTutorialTarget('AddWaterButton')

return (
  <Card ref={waterWidgetRef}>
    <Button ref={addWaterRef}>Su Ekle</Button>
  </Card>
)
```

#### 5. Settings Button Target'ı Ekle

```tsx
// BottomTabNav.tsx veya Dashboard.tsx
const settingsRef = useTutorialTarget('SettingsButton')

<button ref={settingsRef}>
  Ayarlar
</button>
```

---

## 🎨 5. Tutorial Görünümünü Özelleştir

### Overlay Opacity Değiştir

```typescript
// src/lib/tutorialConfig.ts
{
  settings: {
    overlayOpacity: 0.75,  // 0.65'ten 0.75'e
    // ...
  }
}
```

### Button Metinlerini Değiştir

```typescript
{
  settings: {
    controls: {
      primaryNext: 'İleri',      // 'Devam' yerine
      primaryDone: 'Tamamla',    // 'Başla' yerine
      skip: 'Geç'                // 'Atla' yerine
    }
  }
}
```

---

## 🔧 6. Tutorial State'i Kontrol Et

### State Sorgula

```typescript
import { tutorialStorage } from '@/lib/tutorialStorage'

// Tutorial gösterildi mi?
const shouldShow = tutorialStorage.shouldShowTutorial('my_tutorial')

// Tutorial disabled mi?
const isDisabled = tutorialStorage.isDisabled('my_tutorial')

// Tutorial durumu
const state = tutorialStorage.getState('my_tutorial')
console.log(state.status) // 'never_shown' | 'shown' | 'completed' | 'skipped' | 'disabled'
```

### State Güncelle

```typescript
// Tutorial'ı tamamlandı olarak işaretle
tutorialStorage.markAsCompleted('my_tutorial')

// Tutorial'ı resetle
tutorialStorage.resetTutorial('my_tutorial')

// Tüm tutorial'ları resetle
tutorialStorage.resetAllTutorials()
```

---

## 📚 7. Daha Fazla Bilgi

### Detaylı Dokümantasyon
- `TUTORIAL_SYSTEM_GUIDE.md` - Kapsamlı sistem rehberi
- `TUTORIAL_IMPLEMENTATION_EXAMPLES.md` - 10 farklı implementation örneği

### API Referansı

#### useTutorial Hook
```typescript
const {
  startTutorial,     // Tutorial başlat
  stopTutorial,      // Tutorial durdur
  isActive,          // Tutorial aktif mi?
  currentFeatureId   // Aktif tutorial ID
} = useTutorial()
```

#### useTutorialTarget Hook
```typescript
const ref = useTutorialTarget('TargetKey')
// Component'e ref={ref} ile bağla
```

#### useTutorialTrigger Hook
```typescript
useTutorialTrigger('featureId', enabled)
// Mount'ta otomatik tutorial başlat
```

---

## 🐛 Troubleshooting

### Tutorial Başlamıyor?

**1. Target element render ediliyor mu?**
```tsx
useEffect(() => {
  console.log('Element:', document.querySelector('[data-target="MyButton"]'))
}, [])
```

**2. Tutorial disabled mi?**
```tsx
console.log(tutorialStorage.getState('my_tutorial'))
// status: 'disabled' ise resetle
tutorialStorage.resetTutorial('my_tutorial')
```

**3. Provider eklenmiş mi?**
```tsx
// App.tsx içinde olmalı
<TutorialProvider>
  <Routes />
</TutorialProvider>
```

### Target Bulunamıyor?

```tsx
// Component'te debug
const ref = useTutorialTarget('MyTarget')

useEffect(() => {
  console.log('Ref current:', ref.current)
}, [ref])
```

---

## ✨ Best Practices

### ✅ DO
- Kısa ve öz metinler kullan (max 2 satır)
- Açıklayıcı targetKey isimleri ver
- Max 5 adım per tutorial
- İlk step action başlatan element olmalı

### ❌ DON'T
- Uzun metinler yazma
- Critical flow'larda tutorial gösterme (ödeme vs.)
- Nested tutorial başlatma
- Generic targetKey kullanma ('btn1', 'div2' vs.)

---

## 🚀 Sonraki Adımlar

1. ✅ Mevcut tutorial'ları aktive et (target'ları ekle)
2. ✅ Her feature için tutorial ekle
3. ✅ Test et (localStorage temizle, ilk açılış simüle et)
4. ✅ Kullanıcı feedback'i topla
5. ✅ Analytics ekle (completion rate, skip rate)

---

## 💡 Pro Tips

### Tip 1: localStorage'ı Temizle
```javascript
// Browser console
localStorage.removeItem('tutorial_state_v1')
```

### Tip 2: Tüm Tutorial'ları Resetle
Ayarlar > Rehberler & İpuçları > "Tümünü Sıfırla"

### Tip 3: Keyboard Shortcuts
- **ESC**: Tutorial'ı atla
- **Enter**: Sonraki adım

### Tip 4: Manual Start
```tsx
import { useTutorial } from '@/components/Tutorial/TutorialProvider'

const { startTutorial } = useTutorial()

<Button onClick={() => startTutorial('my_tutorial')}>
  Rehberi Göster
</Button>
```

---

## 📞 Destek

Sorun yaşarsan veya yeni feature istersen:
- `TUTORIAL_SYSTEM_GUIDE.md` - Detaylı döküman
- `TUTORIAL_IMPLEMENTATION_EXAMPLES.md` - Kod örnekleri
- Console logları kontrol et (tutorial debug mesajları var)

---

**Hazırsın!** Tutorial sistemini kullanmaya başlayabilirsin. 🎉
