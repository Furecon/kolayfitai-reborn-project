import { useState, useEffect } from 'react'
import { useNavigation } from '@/hooks/useNavigation'
import { DashboardHeader } from './DashboardHeader'
import { MealMethodSelection } from './MealMethodSelection'
import FoodAnalysis from '../FoodAnalysis'
import ManualFoodEntry from '../FoodAnalysis/ManualFoodEntry'
import { FileImageSelector } from '../FoodAnalysis/FileImageSelector'
import { ImageCropEditor } from '../FoodAnalysis/ImageCropEditor'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { BottomTabNav, TabType } from '../Navigation/BottomTabNav'
import { HomeTab } from './Tabs/HomeTab'
import { AIInsightsTab } from './Tabs/AIInsightsTab'
import { ProgressTab } from './Tabs/ProgressTab'
import { MealsTab } from './Tabs/MealsTab'
import { SettingsTab } from './Tabs/SettingsTab'
import { paywallService } from '@/services/PaywallService'
import { useToast } from '@/hooks/use-toast'

type View = 'dashboard' | 'meal-selection' | 'camera' | 'manual-entry' | 'file-image' | 'crop-image'

interface DashboardProps {
  openSubscriptionSettings?: boolean
  onSubscriptionSettingsClosed?: () => void
}

export function Dashboard({ openSubscriptionSettings, onSubscriptionSettingsClosed }: DashboardProps = {}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [selectedImageForAnalysis, setSelectedImageForAnalysis] = useState<string | null>(null)

  // Watch for openSubscriptionSettings changes
  useEffect(() => {
    if (openSubscriptionSettings) {
      setCurrentView('dashboard')
      setActiveTab('settings')
      onSubscriptionSettingsClosed?.()
    }
  }, [openSubscriptionSettings, onSubscriptionSettingsClosed])

  // Enhanced navigation with hardware back button support
  useNavigation({
    enableHardwareBackButton: true,
    customBackHandler: () => {
      // If we're in a sub-view, go back to dashboard
      if (currentView !== 'dashboard') {
        setCurrentView('dashboard')
        return true // Prevent app exit
      }
      // If on dashboard, allow app exit
      return false
    }
  })
  const [dailyStats, setDailyStats] = useState({
    totalCalories: 0,
    goalCalories: 2000,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalSodium: 0,
    proteinGoal: 125,
    carbsGoal: 200,
    fatGoal: 67
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchDailyStats()
      fetchProfile()
    }
  }, [user, refreshTrigger])

  const fetchProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('user_id, weight')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  const fetchDailyStats = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    // Fetch today's meals with new nutrition fields
    const { data: meals } = await supabase
      .from('meal_logs')
      .select(`
        total_calories, 
        total_protein, 
        total_carbs, 
        total_fat,
        total_fiber,
        total_sugar,
        total_sodium
      `)
      .eq('user_id', user.id)
      .eq('date', today)

    // Fetch user's goals including macro goals
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        daily_calorie_goal,
        daily_protein_goal,
        daily_carbs_goal,
        daily_fat_goal
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (meals) {
      const totals = meals.reduce(
        (acc, meal) => ({
          totalCalories: acc.totalCalories + (meal.total_calories || 0),
          totalProtein: acc.totalProtein + (meal.total_protein || 0),
          totalCarbs: acc.totalCarbs + (meal.total_carbs || 0),
          totalFat: acc.totalFat + (meal.total_fat || 0),
          totalFiber: acc.totalFiber + (meal.total_fiber || 0),
          totalSugar: acc.totalSugar + (meal.total_sugar || 0),
          totalSodium: acc.totalSodium + (meal.total_sodium || 0)
        }),
        { 
          totalCalories: 0, 
          totalProtein: 0, 
          totalCarbs: 0, 
          totalFat: 0,
          totalFiber: 0,
          totalSugar: 0,
          totalSodium: 0
        }
      )

      setDailyStats({
        totalCalories: Math.round(totals.totalCalories),
        totalProtein: Math.round(totals.totalProtein * 10) / 10,
        totalCarbs: Math.round(totals.totalCarbs * 10) / 10,
        totalFat: Math.round(totals.totalFat * 10) / 10,
        totalFiber: Math.round(totals.totalFiber * 10) / 10,
        totalSugar: Math.round(totals.totalSugar * 10) / 10,
        totalSodium: Math.round(totals.totalSodium),
        goalCalories: profile?.daily_calorie_goal || 2000,
        proteinGoal: profile?.daily_protein_goal || 125,
        carbsGoal: profile?.daily_carbs_goal || 200,
        fatGoal: profile?.daily_fat_goal || 67
      })
    }
  }

  const handleMealAdded = () => {
    setRefreshTrigger(prev => prev + 1)
    setCurrentView('dashboard')
    setActiveTab('home')
  }

  const handleUpgrade = async () => {
    try {
      console.log('🚀 Opening paywall...')
      const result = await paywallService.presentPaywall()

      if (result.result === 'purchased') {
        toast({
          title: "Abonelik Başarılı!",
          description: "Premium özelliklerinin keyfini çıkarın!",
        })
        // Refresh stats to update trial usage
        setRefreshTrigger(prev => prev + 1)
      } else if (result.result === 'restored') {
        toast({
          title: "Abonelik Geri Yüklendi!",
          description: "Premium özellikleriniz aktif edildi.",
        })
        setRefreshTrigger(prev => prev + 1)
      } else if (result.result === 'cancelled') {
        toast({
          title: "İşlem İptal Edildi",
          description: "Satın alma işlemi iptal edildi.",
        })
      } else if (result.result === 'error') {
        // Check if it's web platform error
        if (result.error?.includes('mobile apps')) {
          toast({
            title: "Mobil Uygulama Gerekli",
            description: "Abonelik satın alma işlemi sadece mobil uygulamada yapılabilir. Lütfen Android veya iOS uygulamasını kullanın.",
            variant: "destructive",
            duration: 5000
          })
        } else {
          toast({
            title: "Hata",
            description: result.error || "Abonelik işlemi başarısız oldu.",
            variant: "destructive"
          })
        }
      }
    } catch (error: any) {
      console.error('Error opening paywall:', error)
      toast({
        title: "Hata",
        description: "Abonelik sayfası açılamadı.",
        variant: "destructive"
      })
    }
  }


  if (currentView === 'meal-selection') {
    return (
      <MealMethodSelection
        onBack={() => setCurrentView('dashboard')}
        onSelectPhoto={() => setCurrentView('camera')}
        onSelectManual={() => setCurrentView('manual-entry')}
        onSelectPhotoFromFile={() => setCurrentView('file-image')}
        onForceManual={() => setCurrentView('manual-entry')}
      />
    )
  }

  if (currentView === 'file-image') {
    return (
      <FileImageSelector
        onImageSelected={(imageUrl) => {
          setCurrentView('crop-image')
          // Store image for cropping
          localStorage.setItem('selectedImageForCrop', imageUrl)
        }}
        onError={() => setCurrentView('meal-selection')}
        onBack={() => setCurrentView('meal-selection')}
      />
    )
  }

  if (currentView === 'crop-image') {
    return (
      <ImageCropEditor
        imageUrl={localStorage.getItem('selectedImageForCrop') || ''}
        onCropComplete={(croppedImageUrl) => {
          localStorage.removeItem('selectedImageForCrop')
          setSelectedImageForAnalysis(croppedImageUrl)
          setCurrentView('camera')
        }}
        onCancel={() => {
          localStorage.removeItem('selectedImageForCrop')
          setCurrentView('file-image')
        }}
      />
    )
  }


  if (currentView === 'manual-entry') {
    return (
      <ManualFoodEntry
        mealType=""
        onBack={() => setCurrentView('meal-selection')}
        onMealSaved={handleMealAdded}
        cameraPermissionDenied={false} // We'll pass this from method selection if needed
      />
    )
  }

  if (currentView === 'camera') {
    return (
      <FoodAnalysis
        onMealAdded={handleMealAdded}
        onBack={() => {
          setSelectedImageForAnalysis(null)
          setCurrentView('dashboard')
        }}
        initialImage={selectedImageForAnalysis}
        skipCameraStep={!!selectedImageForAnalysis}
        autoOpenCamera={!selectedImageForAnalysis}
        onUpgradeClick={handleUpgrade}
      />
    )
  }


  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            dailyStats={dailyStats}
            userWeight={profile?.weight}
            onCameraClick={() => setCurrentView('meal-selection')}
            onUpgradeClick={handleUpgrade}
          />
        )
      case 'ai-insights':
        return <AIInsightsTab dailyStats={dailyStats} />
      case 'progress':
        return <ProgressTab />
      case 'meals':
        return (
          <MealsTab
            onAddMeal={() => setCurrentView('meal-selection')}
            refreshTrigger={refreshTrigger}
            dailyStats={dailyStats}
          />
        )
      case 'settings':
        return (
          <SettingsTab
            onRefreshNeeded={() => setRefreshTrigger(prev => prev + 1)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <DashboardHeader
        onCameraClick={() => setCurrentView('meal-selection')}
      />

      <div className="w-full">
        {renderTabContent()}
      </div>

      <BottomTabNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
