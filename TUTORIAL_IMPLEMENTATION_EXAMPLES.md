# Tutorial Sistemi - Implementation Örnekleri

## Örnek 1: Basit Feature Tutorial

### Senaryo
Kullanıcı "Favori Yemekler" ekranına ilk kez girdiğinde 2 adımlı tutorial göster.

### 1. Config Ekle

```typescript
// src/lib/tutorialConfig.ts
{
  featureId: 'favorite_meals',
  title: 'Favori Yemekler',
  trigger: 'first_time_feature',
  steps: [
    {
      stepId: 's1',
      targetKey: 'FavoriteMealCard',
      pointer: 'finger',
      placement: 'bottom',
      title: 'Favori ekle',
      bodyTr: 'Bir yemeğe dokun, favorilere ekle.',
      bodyEn: 'Tap a meal to add to favorites.'
    },
    {
      stepId: 's2',
      targetKey: 'FilterButton',
      pointer: 'arrow',
      placement: 'top',
      title: 'Filtrele',
      bodyTr: 'Favorilerini kategorilere göre filtrele.',
      bodyEn: 'Filter favorites by category.'
    }
  ]
}
```

### 2. Component Güncelleme

```tsx
// src/components/Meals/FavoriteMeals.tsx
import { useTutorialTarget } from '@/hooks/useTutorialTarget'
import { useTutorialTrigger } from '@/hooks/useTutorialTrigger'

export function FavoriteMeals() {
  // Tutorial trigger - ilk açılışta otomatik başlar
  useTutorialTrigger('favorite_meals')

  // Target'ları register et
  const mealCardRef = useTutorialTarget('FavoriteMealCard')
  const filterButtonRef = useTutorialTarget('FilterButton')

  return (
    <div>
      <div ref={filterButtonRef}>
        <Button>Filtrele</Button>
      </div>

      <div ref={mealCardRef}>
        <Card>Yemek 1</Card>
      </div>
    </div>
  )
}
```

---

## Örnek 2: Conditional Tutorial

### Senaryo
Tutorial'ı sadece premium kullanıcılar için göster.

```tsx
import { useTutorialTrigger } from '@/hooks/useTutorialTrigger'
import { useAuth } from '@/components/Auth/AuthProvider'
import { entitlementService } from '@/services/EntitlementService'
import { useState, useEffect } from 'react'

export function PremiumFeature() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const checkPremium = async () => {
      const status = await entitlementService.checkEntitlement()
      setIsPremium(status.isPremium)
    }
    checkPremium()
  }, [user])

  // Tutorial sadece premium kullanıcılar için
  useTutorialTrigger('premium_feature', isPremium)

  // ... rest of component
}
```

---

## Örnek 3: Multi-Step Complex Flow

### Senaryo
Yemek ekleme flow'u için kapsamlı tutorial.

### 1. Config

```typescript
{
  featureId: 'complete_meal_flow',
  title: 'Yemek Ekleme Rehberi',
  trigger: 'first_time_feature',
  steps: [
    {
      stepId: 's1',
      targetKey: 'CameraButton',
      pointer: 'finger',
      placement: 'bottom',
      title: 'Fotoğraf çek',
      bodyTr: 'Yemeğinin fotoğrafını çek.',
      bodyEn: 'Take a photo of your meal.'
    },
    {
      stepId: 's2',
      targetKey: 'AnalysisTypeSelector',
      pointer: 'arrow',
      placement: 'top',
      title: 'Analiz türü seç',
      bodyTr: 'Hızlı veya detaylı analiz seç.',
      bodyEn: 'Choose quick or detailed analysis.'
    },
    {
      stepId: 's3',
      targetKey: 'MealTypeDropdown',
      pointer: 'finger',
      placement: 'bottom',
      title: 'Öğün türü',
      bodyTr: 'Kahvaltı, öğle veya akşam seç.',
      bodyEn: 'Select breakfast, lunch or dinner.'
    },
    {
      stepId: 's4',
      targetKey: 'VerifyButton',
      pointer: 'finger',
      placement: 'top',
      title: 'Kontrol et',
      bodyTr: 'Besin değerlerini kontrol et, düzenle.',
      bodyEn: 'Review and edit nutrition values.'
    },
    {
      stepId: 's5',
      targetKey: 'SaveButton',
      pointer: 'finger',
      placement: 'bottom',
      title: 'Kaydet',
      bodyTr: 'Yemeğini günlük kaydına ekle.',
      bodyEn: 'Add meal to your daily log.'
    }
  ]
}
```

### 2. Component Implementation

```tsx
import { useTutorialTarget } from '@/hooks/useTutorialTarget'

export function FoodAnalysisFlow() {
  const [step, setStep] = useState<'camera' | 'analysis' | 'verify'>('camera')

  // Register all targets
  const cameraRef = useTutorialTarget('CameraButton')
  const analysisRef = useTutorialTarget('AnalysisTypeSelector')
  const mealTypeRef = useTutorialTarget('MealTypeDropdown')
  const verifyRef = useTutorialTarget('VerifyButton')
  const saveRef = useTutorialTarget('SaveButton')

  return (
    <>
      {step === 'camera' && (
        <button ref={cameraRef}>Fotoğraf Çek</button>
      )}

      {step === 'analysis' && (
        <>
          <div ref={analysisRef}>
            <AnalysisTypeSelector />
          </div>
          <select ref={mealTypeRef}>
            <option>Kahvaltı</option>
          </select>
        </>
      )}

      {step === 'verify' && (
        <>
          <button ref={verifyRef}>Kontrol Et</button>
          <button ref={saveRef}>Kaydet</button>
        </>
      )}
    </>
  )
}
```

---

## Örnek 4: Programmatic Control

### Senaryo
Belirli bir action'dan sonra tutorial başlat.

```tsx
import { useTutorial } from '@/components/Tutorial/TutorialProvider'
import { Button } from '@/components/ui/button'

export function OnboardingComplete() {
  const { startTutorial } = useTutorial()
  const navigate = useNavigate()

  const handleFinishOnboarding = async () => {
    // Onboarding'i tamamla
    await completeOnboarding()

    // Dashboard'a git
    navigate('/dashboard')

    // 500ms sonra dashboard tutorial'ı başlat
    setTimeout(() => {
      startTutorial('first_login_walkthrough')
    }, 500)
  }

  return (
    <Button onClick={handleFinishOnboarding}>
      Başla
    </Button>
  )
}
```

---

## Örnek 5: Dynamic Target Registration

### Senaryo
Liste item'larından birine tutorial göster (dinamik liste).

```tsx
import { useTutorial } from '@/components/Tutorial/TutorialProvider'
import { useEffect } from 'react'

export function MealsList({ meals }: { meals: Meal[] }) {
  const { registerTarget, unregisterTarget } = useTutorial()

  useEffect(() => {
    // İlk meal item'ı target olarak register et
    if (meals.length > 0) {
      const firstMealElement = document.getElementById(`meal-${meals[0].id}`)
      if (firstMealElement) {
        registerTarget('HistoryMealItem', firstMealElement as HTMLElement)
      }
    }

    return () => {
      unregisterTarget('HistoryMealItem')
    }
  }, [meals, registerTarget, unregisterTarget])

  return (
    <div>
      {meals.map((meal, index) => (
        <div
          key={meal.id}
          id={`meal-${meal.id}`}
          className={index === 0 ? 'tutorial-target' : ''}
        >
          {meal.name}
        </div>
      ))}
    </div>
  )
}
```

---

## Örnek 6: Tutorial State Management

### Senaryo
Tutorial durumunu kontrol et ve ona göre UI göster.

```tsx
import { tutorialStorage } from '@/lib/tutorialStorage'
import { Badge } from '@/components/ui/badge'

export function FeatureCard({ featureId }: { featureId: string }) {
  const state = tutorialStorage.getState(featureId)
  const isNew = state.status === 'never_shown'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Yeni Özellik</CardTitle>
          {isNew && <Badge variant="default">Yeni!</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {isNew && (
          <Button onClick={() => startTutorial(featureId)}>
            Rehberi Göster
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Örnek 7: Nested Component Targets

### Senaryo
Nested component içindeki elementi target yap.

```tsx
// ParentComponent.tsx
export function Dashboard() {
  return (
    <div>
      <WaterTracker />
    </div>
  )
}

// ChildComponent.tsx
import { useTutorialTarget } from '@/hooks/useTutorialTarget'

export function WaterTracker() {
  const widgetRef = useTutorialTarget('WaterWidget')
  const addButtonRef = useTutorialTarget('AddWaterButton')

  return (
    <Card ref={widgetRef}>
      <CardHeader>Su Takibi</CardHeader>
      <CardContent>
        <Button ref={addButtonRef}>Su Ekle</Button>
      </CardContent>
    </Card>
  )
}
```

---

## Örnek 8: Delayed Tutorial

### Senaryo
Page load'dan 2 saniye sonra tutorial başlat.

```tsx
import { useTutorial } from '@/components/Tutorial/TutorialProvider'
import { useEffect } from 'react'
import { tutorialStorage } from '@/lib/tutorialStorage'

export function FeaturePage() {
  const { startTutorial } = useTutorial()

  useEffect(() => {
    const shouldShow = tutorialStorage.shouldShowTutorial('my_feature')

    if (shouldShow) {
      const timer = setTimeout(() => {
        startTutorial('my_feature')
      }, 2000) // 2 saniye bekle

      return () => clearTimeout(timer)
    }
  }, [startTutorial])

  return <div>Feature Content</div>
}
```

---

## Örnek 9: Tutorial Skip Handler

### Senaryo
Tutorial skip edildiğinde özel action yap.

```tsx
import { useTutorial } from '@/components/Tutorial/TutorialProvider'
import { tutorialStorage } from '@/lib/tutorialStorage'
import { useEffect } from 'react'

export function AnalyticsWrapper() {
  const { currentFeatureId, isActive } = useTutorial()

  useEffect(() => {
    if (currentFeatureId) {
      const state = tutorialStorage.getState(currentFeatureId)

      if (state.status === 'skipped') {
        // Analytics event gönder
        trackEvent('tutorial_skipped', {
          featureId: currentFeatureId,
          step: state.currentStep
        })
      } else if (state.status === 'completed') {
        // Tamamlama event'i
        trackEvent('tutorial_completed', {
          featureId: currentFeatureId
        })
      }
    }
  }, [currentFeatureId, isActive])

  return null
}
```

---

## Örnek 10: Custom Tutorial Controls

### Senaryo
Kendi custom butonunla tutorial'ı kontrol et.

```tsx
import { useTutorial } from '@/components/Tutorial/TutorialProvider'
import { Button } from '@/components/ui/button'
import { HelpCircle, XCircle } from 'lucide-react'

export function CustomTutorialControls() {
  const { startTutorial, stopTutorial, isActive, currentFeatureId } = useTutorial()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isActive ? (
        <Button
          size="icon"
          variant="destructive"
          onClick={stopTutorial}
        >
          <XCircle className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          size="icon"
          variant="outline"
          onClick={() => startTutorial('current_page_tutorial')}
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
```

---

## Debugging Tips

### Console Logging

```tsx
import { tutorialStorage } from '@/lib/tutorialStorage'

// Tüm tutorial state'lerini logla
console.log('All tutorial states:', tutorialStorage.getAllStates())

// Belirli bir tutorial state'i
console.log('Feature state:', tutorialStorage.getState('my_feature'))

// Target registry kontrol
import { useTutorial } from '@/components/Tutorial/TutorialProvider'

const { registerTarget } = useTutorial()
console.log('Registered targets:', targetRegistry)
```

### Force Reset

```tsx
// localStorage'ı temizle ve tüm tutorial'ları resetle
import { tutorialStorage } from '@/lib/tutorialStorage'

const handleResetAll = () => {
  tutorialStorage.resetAllTutorials()
  window.location.reload()
}
```

---

## Common Patterns

### Pattern 1: Feature Flag + Tutorial

```tsx
const featureEnabled = useFeatureFlag('new_feature')
useTutorialTrigger('new_feature_tutorial', featureEnabled)
```

### Pattern 2: Post-Action Tutorial

```tsx
const handleActionComplete = async () => {
  await performAction()
  startTutorial('post_action_tutorial')
}
```

### Pattern 3: Conditional Step Skip

```tsx
// Config'de step'i conditional yapma, component'te kontrol et
const isPremium = usePremiumStatus()

return (
  <>
    <div ref={useTutorialTarget('Step1')}>Basic Feature</div>
    {isPremium && (
      <div ref={useTutorialTarget('Step2Premium')}>Premium Feature</div>
    )}
  </>
)
```

---

Bu örnekler tutorial sistemini projeye entegre etmenin farklı yollarını gösterir. İhtiyacına göre kombinleyip özelleştirebilirsin!
