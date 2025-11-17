import { useState, useEffect } from 'react'
import { useNavigation } from '@/hooks/useNavigation'
import { DashboardHeader } from './DashboardHeader'
import { MealMethodSelection } from './MealMethodSelection'
import { TutorialOverlay } from '../Tutorial/TutorialOverlay'
import { useTutorial, useTutorialAutoShow } from '@/context/TutorialContext'
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

type View = 'dashboard' | 'meal-selection' | 'camera' | 'manual-entry' | 'file-image' | 'crop-image'

export function Dashboard() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [selectedImageForAnalysis, setSelectedImageForAnalysis] = useState<string | null>(null)

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
  
  // Tutorial context
  const { isVisible: tutorialVisible, currentScreen, completeTutorial, hideTutorial, disableTutorialsPermanently } = useTutorial()
  const { autoShowTutorial } = useTutorialAutoShow()

  useEffect(() => {
    if (user) {
      fetchDailyStats()
      fetchProfile()
    }
  }, [user, refreshTrigger])

  // Auto-show tutorial for new users (only once when profile is first loaded)
  useEffect(() => {
    if (profile && currentView === 'dashboard' && user) {
      // Check if tutorial hasn't been seen yet
      const tutorialSeen = profile.tutorials_completed?.tutorial_seen
      if (!tutorialSeen) {
        autoShowTutorial('dashboard')
      }
    }
  }, [profile?.tutorials_completed?.tutorial_seen, currentView]) // Only depend on tutorial_seen status

  const fetchProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('tutorials_completed')
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

  const handleTutorialComplete = () => {
    if (currentScreen) {
      completeTutorial(currentScreen)
    }
  }

  const handleTutorialClose = () => {
    hideTutorial()
  }

  const handleShowTutorial = () => {
    const tutorial = useTutorial()
    tutorial.showTutorial('dashboard')
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
        onUpgradeClick={() => setCurrentView('subscription')}
      />
    )
  }


  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            dailyStats={dailyStats}
            onCameraClick={() => setCurrentView('meal-selection')}
            onUpgradeClick={() => setActiveTab('settings')}
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

      <TutorialOverlay
        isVisible={tutorialVisible}
        currentScreen={currentScreen}
        onComplete={handleTutorialComplete}
        onClose={handleTutorialClose}
        onDontShowAgain={disableTutorialsPermanently}
      />
    </div>
  )
}
