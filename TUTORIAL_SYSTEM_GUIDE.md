# Tutorial / Coach Mark Sistemi - Kapsamlı Rehber

## Genel Bakış

KolayFit uygulamasına **global, modüler ve yeniden kullanılabilir** bir Tutorial/Coach Mark sistemi eklenmiştir. Bu sistem kullanıcılara uygulamanın özelliklerini keşfetmeleri için interaktif, adım adım rehberlik sağlar.

## Özellikler

### ✅ Temel Özellikler
- 🎯 **Dark Overlay & Spotlight**: Hedef elementi vurgular (%65 opacity)
- 🖱️ **Animasyonlu Pointer**: Parmak veya ok ikonu ile yönlendirme
- 💬 **Tooltip**: Başlık + açıklama + kontrol butonları
- ⌨️ **Keyboard Navigation**: ESC (atla) ve Enter (devam) desteği
- 🛡️ **Fallback Güvenlik**: Target bulunamazsa step atla, crash etme
- 🌍 **Çoklu Dil Desteği**: TR/EN hazır (şu anda TR aktif)
- 💾 **Persistent State**: localStorage + backend'e taşınabilir mimari

### 🎛️ Tetikleme Modları
1. **first_login**: İlk giriş/açılışta core walkthrough (5 adım)
2. **first_time_feature**: Bir özelliğe ilk girişte mini tutorial (1-3 adım)
3. **manual**: Ayarlar > Rehberler & İpuçları'ndan manuel başlatma

### 📊 State Yönetimi
Her tutorial için 5 durum:
- `never_shown`: Hiç gösterilmedi
- `shown`: Gösterim devam ediyor
- `completed`: Tamamlandı
- `skipped`: Atlandı
- `disabled`: "Bir daha gösterme" seçildi

## Mimari

### Dosya Yapısı

```
src/
├── lib/
│   ├── tutorialConfig.ts          # Tutorial yapılandırma ve data
│   └── tutorialStorage.ts         # State persistence (localStorage)
├── components/
│   └── Tutorial/
│       ├── TutorialProvider.tsx   # Context provider
│       ├── TutorialEngine.tsx     # Ana motor
│       ├── TutorialSpotlight.tsx  # Overlay & spotlight
│       ├── TutorialPointer.tsx    # Animasyonlu pointer
│       └── TutorialTooltip.tsx    # Tooltip UI
├── hooks/
│   ├── useTutorialTarget.ts       # Element register hook
│   └── useTutorialTrigger.ts      # Auto-trigger hook
└── components/Settings/
    └── TutorialsGuide.tsx         # Ayarlar ekranı
```

## Kullanım

### 1. Yeni Tutorial Ekleme

`src/lib/tutorialConfig.ts` dosyasına yeni tutorial ekleyin:

```typescript
{
  featureId: 'my_new_feature',
  title: 'Yeni Özellik',
  trigger: 'first_time_feature',
  steps: [
    {
      stepId: 's1',
      targetKey: 'MyTargetElement',  // Component'te ref key
      pointer: 'finger',              // 'finger' | 'arrow' | 'none'
      placement: 'bottom',            // 'top' | 'bottom' | 'left' | 'right'
      title: 'Adım başlığı',
      bodyTr: 'Türkçe açıklama',
      bodyEn: 'English description'
    }
  ]
}
```

### 2. Component'te Target Belirleme

Target elementi register etmek için `useTutorialTarget` hook kullanın:

```tsx
import { useTutorialTarget } from '@/hooks/useTutorialTarget'

function MyComponent() {
  const addButtonRef = useTutorialTarget('AddMealButton')

  return (
    <button ref={addButtonRef}>
      Yemek Ekle
    </button>
  )
}
```

### 3. Tutorial'ı Otomatik Tetikleme

Bir ekran/feature açıldığında otomatik tutorial başlatmak için:

```tsx
import { useTutorialTrigger } from '@/hooks/useTutorialTrigger'

function MyFeature() {
  // İlk açılışta tutorial başlatır
  useTutorialTrigger('my_new_feature', true)

  return (
    // ... component content
  )
}
```

### 4. Manuel Tutorial Başlatma

Programatik olarak tutorial başlatmak için:

```tsx
import { useTutorial } from '@/components/Tutorial/TutorialProvider'

function MyComponent() {
  const { startTutorial, stopTutorial } = useTutorial()

  const handleShowTutorial = () => {
    startTutorial('my_new_feature')
  }

  return (
    <button onClick={handleShowTutorial}>
      Rehberi Göster
    </button>
  )
}
```

## Mevcut Tutorial'lar

### 1. first_login_walkthrough (First Login)
İlk giriş walkthrough - 5 adım:
- AddMealButton: Yemek ekleme
- MacroRings: Makro takibi
- WaterWidget: Su takibi
- HistoryTab: Geçmiş öğünler
- SettingsButton: Ayarlar

### 2. add_meal (First Time Feature)
Yemek ekleme - 2 adım:
- AddMealButton: Fotoğraf çekme
- ManualEntryLink: Manuel giriş

### 3. analysis_choice (First Time Feature)
Analiz seçimi - 2 adım:
- NormalAnalysisCard: Hızlı analiz
- DetailedAnalysisCard: Detaylı analiz

### 4. macro_screen (First Time Feature)
Makro ekranı - 2 adım:
- MacroRings: Makro görünümü
- RemainingCalories: Kalan kalori

### 5. meal_history (First Time Feature)
Geçmiş öğünler - 3 adım:
- HistoryTab: Geçmiş tab
- HistoryFilter: Filtreleme
- HistoryMealItem: Detay görünümü

### 6. settings_profile (First Time Feature)
Ayarlar - 2 adım:
- SettingsButton: Ayarlar açma
- BodyInfoSection: Vücut bilgileri

### 7. subscription (First Time Feature)
Abonelik - 3 adım:
- PremiumBenefitsList: Faydalar
- SubscribeButton: Abone ol
- RestorePurchases: Geri yükleme

### 8. diet_plan (First Time Feature)
Diyet planı - 3 adım:
- CreatePlanButton: Plan oluştur
- GoalSelector: Hedef seç
- GeneratePlanCTA: Plan üret

### 9. water_tracking (First Time Feature)
Su takibi - 3 adım:
- WaterWidget: Su widget
- AddWaterButton: Su ekle
- WaterGoalSettings: Hedef ayarla

### 10. notifications (First Time Feature)
Bildirimler - 3 adım:
- EnableNotificationsCTA: Bildirimleri aç
- NotificationSchedule: Saatleri ayarla
- NotificationTypes: Bildirim tipleri

## Ayarlar Ekranı

**Erişim:** Ayarlar > Rehberler & İpuçları

### Özellikler:
- ✅ Tüm tutorial'ların listesi
- 📊 Her tutorial'ın durumu (badge ile)
- ▶️ "Başlat" butonu - Tutorial'ı manuel başlat
- 🔄 "Sıfırla" butonu - Tutorial'ı tekrar göster
- 🔃 "Tümünü Sıfırla" butonu - Tüm tutorial'ları sıfırla

### Durum Badge'leri:
- 🕐 **Görülmedi**: Hiç açılmadı
- ✅ **Tamamlandı**: Başarıyla tamamlandı
- ❌ **Atlandı**: Kullanıcı atladı
- 🚫 **Devre Dışı**: "Bir daha gösterme" seçildi
- ▶️ **Devam Ediyor**: Yarıda kaldı

## API Referansı

### useTutorial Hook

```typescript
const {
  startTutorial,    // (featureId: string) => void
  stopTutorial,     // () => void
  registerTarget,   // (key: string, element: HTMLElement | null) => void
  unregisterTarget, // (key: string) => void
  isActive,         // boolean
  currentFeatureId  // string | null
} = useTutorial()
```

### useTutorialTarget Hook

```typescript
const ref = useTutorialTarget(targetKey: string)
// React ref - Component'e ref={ref} ile bağlanır
```

### useTutorialTrigger Hook

```typescript
useTutorialTrigger(featureId: string, enabled?: boolean)
// Mount'ta otomatik tetikleme için
```

### tutorialStorage API

```typescript
import { tutorialStorage } from '@/lib/tutorialStorage'

// State sorgulama
tutorialStorage.getState(featureId)
tutorialStorage.shouldShowTutorial(featureId)
tutorialStorage.isDisabled(featureId)

// State güncelleme
tutorialStorage.markAsShown(featureId, currentStep)
tutorialStorage.markAsCompleted(featureId)
tutorialStorage.markAsSkipped(featureId)
tutorialStorage.markAsDisabled(featureId)

// Reset
tutorialStorage.resetTutorial(featureId)
tutorialStorage.resetAllTutorials()

// Import/Export (backend sync için)
const state = tutorialStorage.exportState()
tutorialStorage.importState(state)
```

## Özelleştirme

### Ayarlar Değiştirme

`src/lib/tutorialConfig.ts` içindeki `settings` objesini düzenleyin:

```typescript
{
  overlayOpacity: 0.65,              // 0-1 arası
  animation: {
    tooltip: 'fade-slide-up',        // Tailwind animasyonu
    pointer: 'pulse',                // CSS animasyonu
    spotlight: 'smooth'              // Geçiş efekti
  },
  controls: {
    showSkip: true,                  // "Atla" butonu göster
    showDontShowAgain: true,         // "Bir daha gösterme" göster
    primaryNext: 'Devam',            // Devam butonu metni
    primaryDone: 'Başla',            // Tamamla butonu metni
    skip: 'Atla'                     // Atla butonu metni
  },
  storageKey: 'tutorial_state_v1'    // localStorage key
}
```

### Stil Özelleştirme

Tutorial component'leri Tailwind CSS kullanır. İhtiyaca göre düzenleyebilirsiniz:

- **TutorialSpotlight.tsx**: Overlay ve spotlight efekti
- **TutorialPointer.tsx**: Pointer animasyonları
- **TutorialTooltip.tsx**: Tooltip kartı ve butonlar

## Keyboard Shortcuts

Aktif tutorial varken:
- **ESC**: Tutorial'ı atla
- **Enter**: Sonraki adıma geç

## Best Practices

### ✅ Yapılması Gerekenler

1. **Target Key'leri Açıklayıcı Olsun**
   ```typescript
   targetKey: 'AddMealButton'  // ✅ İyi
   targetKey: 'btn1'            // ❌ Kötü
   ```

2. **Kısa ve Öz Metinler**
   - Başlık: Max 5-6 kelime
   - Açıklama: Max 2 satır (15-20 kelime)

3. **Logical Step Sırası**
   - İlk step: Action başlatan element
   - Son step: Tamamlama veya confirmation

4. **Placement Dikkatli Seçin**
   - Mobile: `bottom` veya `top` tercih edin
   - Desktop: Tüm placement'lar kullanılabilir

### ❌ Kaçınılması Gerekenler

1. **Çok Fazla Adım**: Max 5 step per tutorial
2. **Uzun Metinler**: Kullanıcı okumayı bırakır
3. **Nested Tutorial**: Bir tutorial içinde başka tutorial tetikleme
4. **Critical Flow'da Tutorial**: Checkout, ödeme gibi kritik akışlarda kullanma

## Backend Entegrasyonu (İleride)

State şu anda localStorage'da saklanıyor. Backend'e taşımak için:

### 1. Supabase Migration

```sql
CREATE TABLE tutorial_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id text NOT NULL,
  status text NOT NULL,
  last_shown timestamptz,
  current_step int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_id)
);

ALTER TABLE tutorial_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tutorial states"
  ON tutorial_states
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 2. Storage Adapter Güncelleme

`src/lib/tutorialStorage.ts` içinde `saveState` ve `loadState` fonksiyonlarını güncelleyin:

```typescript
private async saveState(): Promise<void> {
  // localStorage'a kaydet
  localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))

  // Supabase'e sync et (optional)
  if (user) {
    await syncToBackend(this.state)
  }
}

private async loadState(): Promise<void> {
  // Önce backend'den çek
  if (user) {
    const backendState = await fetchFromBackend()
    if (backendState) {
      this.state = backendState
      return
    }
  }

  // Fallback: localStorage'dan oku
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    this.state = JSON.parse(stored)
  }
}
```

## Troubleshooting

### Tutorial Başlamıyor?

1. **Target element var mı?**
   ```typescript
   console.log('Registry:', targetRegistry.current)
   ```

2. **Tutorial disabled mi?**
   ```typescript
   console.log(tutorialStorage.getState('featureId'))
   ```

3. **Provider eklenmiş mi?**
   - `App.tsx` içinde `<TutorialProvider>` var mı kontrol edin

### Target Element Bulunamıyor?

1. Element render ediliyor mu? (useEffect içinde kontrol)
2. `useTutorialTarget` hook doğru kullanılmış mı?
3. `targetKey` config ile eşleşiyor mu?

### Spotlight Hatalı?

1. Target element scroll viewport içinde mi?
2. Element'in `position: fixed/absolute` var mı?
3. Z-index çakışması var mı?

## Performans

### Optimizasyonlar

- ✅ Target registry `Map` kullanır (O(1) lookup)
- ✅ Minimal re-render (context split edilebilir)
- ✅ Lazy tutorial loading (on-demand)
- ✅ Debounced scroll/resize handlers

### Bundle Size

Tutorial sistemi ekler:
- ~15KB minified
- ~5KB gzipped

## Gelecek Geliştirmeler

### Planlanan Özellikler

- [ ] Video tutorial desteği
- [ ] Interactive sandbox mode
- [ ] Tutorial analytics (completion rate, skip rate)
- [ ] A/B testing desteği
- [ ] Custom animation themes
- [ ] Voice-over desteği
- [ ] Gamification (badges, achievements)

## Lisans & Credits

Tutorial sistemi KolayFit uygulaması için özel geliştirilmiştir.

**Kullanılan Teknolojiler:**
- React Context API
- Tailwind CSS
- Lucide Icons
- localStorage API

---

## Hızlı Başlangıç Checklist

Yeni bir feature'a tutorial eklemek için:

1. [ ] `tutorialConfig.ts`'e tutorial ekle
2. [ ] Component'te `useTutorialTarget` ile target'ları işaretle
3. [ ] `useTutorialTrigger` ile otomatik tetikleme ekle
4. [ ] Test et (localStorage'ı temizle, ilk açılışı simüle et)
5. [ ] Ayarlar > Rehberler'den manuel test yap

Hazır! 🎉
