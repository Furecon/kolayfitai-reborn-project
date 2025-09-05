import { useState, useEffect } from 'react'
import { useNavigation } from '@/hooks/useNavigation'
import { DashboardHeader } from './DashboardHeader'
import { CalorieCards } from './CalorieCards'
import { MealsList } from './MealsList'
import { AIInsights } from './AIInsights'
import { HistoryMeals } from './HistoryMeals'
import { MealMethodSelection } from './MealMethodSelection'
import { TutorialOverlay } from '../Tutorial/TutorialOverlay'
import { useTutorial, useTutorialAutoShow } from '@/context/TutorialContext'
import FoodAnalysis from '../FoodAnalysis'
import ManualFoodEntry from '../FoodAnalysis/ManualFoodEntry'
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner'
import { BarcodeResult } from '../BarcodeScanner/BarcodeResult'
import { BarcodeFromImage } from '../BarcodeScanner/BarcodeFromImage'
import { FileImageSelector } from '../FoodAnalysis/FileImageSelector'
import { ImageCropEditor } from '../FoodAnalysis/ImageCropEditor'
import ProfileSetup from '../Profile/ProfileSetup'
import ProgressTracker from '../Profile/ProgressTracker'
import { ContactPage } from '../Support/ContactPage'
import { ResourcesPage } from '../Support/ResourcesPage'
import { PoliciesPage } from '../Support/PoliciesPage'
import { FAQPage } from '../Support/FAQPage'

import { MealSuggestions } from '../MealSuggestions/MealSuggestions'
import { FavoriteMeals } from '../MealSuggestions/FavoriteMeals'
import { SubscriptionManager } from '../Subscription/SubscriptionManager'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart, TrendingUp, ArrowLeft } from 'lucide-react'

type View = 'dashboard' | 'meal-selection' | 'camera' | 'manual-entry' | 'barcode-scanner' | 'barcode-result' | 'file-image' | 'crop-image' | 'barcode-from-image' | 'profile' | 'progress' | 'suggestions' | 'favorites' | 'subscription' | 'contact' | 'resources' | 'policies' | 'faq'

export function Dashboard() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  
  // Enhanced navigation with hardware back button support
  const { goBack } = useNavigation({
    enableHardwareBackButton: true,
    customBackHandler: () => {
      // If we're in a sub-view, go back to dashboard
      if (currentView !== 'dashboard') {
        setCurrentView('dashboard')
      }
      // Otherwise let the system handle it (app exit or previous route)
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
  const { isVisible: tutorialVisible, currentScreen, completeTutorial, hideTutorial } = useTutorial()
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
        onSelectBarcode={() => setCurrentView('barcode-scanner')}
        onSelectPhotoFromFile={() => setCurrentView('file-image')}
        onSelectBarcodeFromImage={() => setCurrentView('barcode-from-image')}
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
      />
    )
  }

  if (currentView === 'crop-image') {
    return (
      <ImageCropEditor
        imageUrl={localStorage.getItem('selectedImageForCrop') || ''}
        onCropComplete={(croppedImageUrl) => {
          localStorage.removeItem('selectedImageForCrop')
          localStorage.setItem('croppedImage', croppedImageUrl)
          setCurrentView('camera')
        }}
        onCancel={() => {
          localStorage.removeItem('selectedImageForCrop')
          setCurrentView('file-image')
        }}
      />
    )
  }

  if (currentView === 'barcode-from-image') {
    return (
      <BarcodeFromImage
        onBarcodeDetected={(barcode) => {
          localStorage.setItem('scannedBarcode', barcode)
          setCurrentView('barcode-result')
        }}
        onBack={() => setCurrentView('meal-selection')}
      />
    )
  }

  if (currentView === 'barcode-scanner') {
    return (
      <BarcodeScanner
        onBack={() => setCurrentView('meal-selection')}
        onBarcodeScanned={(barcode) => {
          // Store scanned barcode and go to result screen
          localStorage.setItem('scannedBarcode', barcode)
          setCurrentView('barcode-result')
        }}
        onManualFallback={() => setCurrentView('manual-entry')}
      />
    )
  }

  if (currentView === 'barcode-result') {
    return (
      <BarcodeResult
        barcode={localStorage.getItem('scannedBarcode') || ''}
        onBack={() => setCurrentView('barcode-scanner')}
        onMealSaved={handleMealAdded}
        onManualEntry={() => setCurrentView('manual-entry')}
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
        onBack={() => setCurrentView('dashboard')}
      />
    )
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-white">
        <ProfileSetup onBack={() => setCurrentView('dashboard')} />
      </div>
    )
  }

  if (currentView === 'progress') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-3 sm:px-4 py-3 sm:py-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('dashboard')}
            className="text-gray-600 h-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold mt-2">Gelişim Takibi</h1>
        </div>
        <div className="p-4">
          <ProgressTracker />
        </div>
      </div>
    )
  }

  if (currentView === 'contact') {
    return (
      <ContactPage onBack={() => setCurrentView('dashboard')} />
    )
  }

  if (currentView === 'resources') {
    return (
      <ResourcesPage onBack={() => setCurrentView('dashboard')} />
    )
  }

  if (currentView === 'policies') {
    return (
      <PoliciesPage onBack={() => setCurrentView('dashboard')} />
    )
  }

  if (currentView === 'faq') {
    return (
      <FAQPage onBack={() => setCurrentView('dashboard')} />
    )
  }

  if (currentView === 'suggestions') {
    return (
      <MealSuggestions
        onBack={() => setCurrentView('dashboard')}
        onMealAdded={handleMealAdded}
        dailyStats={dailyStats}
      />
    )
  }

  if (currentView === 'favorites') {
    return (
      <FavoriteMeals
        onBack={() => setCurrentView('dashboard')}
        onMealAdded={handleMealAdded}
      />
    )
  }

  if (currentView === 'subscription') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-3 sm:px-4 py-3 sm:py-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('dashboard')}
            className="text-gray-600 h-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold mt-2">Abonelik Yönetimi</h1>
        </div>
        <div className="p-4">
          <SubscriptionManager />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onCameraClick={() => setCurrentView('meal-selection')}
        onProfileClick={() => setCurrentView('profile')}
        onContactClick={() => setCurrentView('contact')}
        onResourcesClick={() => setCurrentView('resources')}
        onPoliciesClick={() => setCurrentView('policies')}
        onFAQClick={() => setCurrentView('faq')}
        onSubscriptionClick={() => setCurrentView('subscription')}
        
      />
      
      <div data-tutorial="calorie-cards">
        <CalorieCards 
          {...dailyStats} 
          onCameraClick={() => setCurrentView('meal-selection')}
        />
      </div>
      
      {/* Quick Action Buttons - Responsive Grid */}
      <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            onClick={() => setCurrentView('suggestions')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 h-auto min-h-[4rem] sm:min-h-[3.5rem]"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-semibold text-sm sm:text-base">Ai Önerileri</div>
              <div className="text-xs opacity-90 truncate">Kişisel öğün önerileri</div>
            </div>
          </Button>
          
          <Button
            onClick={() => setCurrentView('favorites')}
            variant="outline"
            className="py-3 h-auto min-h-[4rem] sm:min-h-[3.5rem] border-pink-200 hover:bg-pink-50"
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-pink-500 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-semibold text-sm sm:text-base">Favorilerim</div>
              <div className="text-xs text-gray-500 truncate">Sevdiğim tarifler</div>
            </div>
          </Button>

          <Button
            onClick={() => setCurrentView('progress')}
            variant="outline"
            className="py-3 h-auto min-h-[4rem] sm:min-h-[3.5rem] border-blue-200 hover:bg-blue-50 sm:col-span-2 lg:col-span-1"
          >
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-semibold text-sm sm:text-base">Gelişim Takibi</div>
              <div className="text-xs text-gray-500 truncate">AI değerlendirmeleri</div>
            </div>
          </Button>
        </div>
      </div>
      
      <div data-tutorial="meal-history">
        <MealsList
          onAddMeal={() => setCurrentView('meal-selection')}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <div data-tutorial="macro-charts">
        <AIInsights dailyStats={dailyStats} />
      </div>
      
      <HistoryMeals />

      <TutorialOverlay
        isVisible={tutorialVisible}
        currentScreen={currentScreen}
        onComplete={handleTutorialComplete}
        onClose={handleTutorialClose}
      />
    </div>
  )
}
