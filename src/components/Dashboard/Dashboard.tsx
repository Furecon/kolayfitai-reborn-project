
import { useState, useEffect } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { CalorieCards } from './CalorieCards'
import { MealsList } from './MealsList'
import { MainDashboard } from './MainDashboard'
import FoodAnalysis from '../FoodAnalysis'
import { ProfileSetup } from '../Profile/ProfileSetup'
import { AIAssistant } from '../AI/AIAssistant'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'

type View = 'dashboard' | 'camera' | 'profile' | 'assistant'

export function Dashboard() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [dailyStats, setDailyStats] = useState({
    totalCalories: 0,
    goalCalories: 2000,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAssistant, setShowAssistant] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    if (user) {
      checkUserProfile()
    }
  }, [user])

  useEffect(() => {
    if (user && hasProfile) {
      fetchDailyStats()
    }
  }, [user, refreshTrigger, hasProfile])

  const checkUserProfile = async () => {
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_calorie_goal, age, gender, height, weight')
      .eq('user_id', user.id)
      .single()

    // Check if user has completed onboarding (has all required data)
    const isComplete = profile && 
      profile.daily_calorie_goal && 
      profile.age && 
      profile.gender && 
      profile.height && 
      profile.weight

    setHasProfile(!!isComplete)
  }

  const fetchDailyStats = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    // Fetch today's meals
    const { data: meals } = await supabase
      .from('meal_logs')
      .select('total_calories, total_protein, total_carbs, total_fat')
      .eq('user_id', user.id)
      .eq('date', today)

    // Fetch user's calorie goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_calorie_goal')
      .eq('user_id', user.id)
      .single()

    if (meals) {
      const totals = meals.reduce(
        (acc, meal) => ({
          totalCalories: acc.totalCalories + (meal.total_calories || 0),
          totalProtein: acc.totalProtein + (meal.total_protein || 0),
          totalCarbs: acc.totalCarbs + (meal.total_carbs || 0),
          totalFat: acc.totalFat + (meal.total_fat || 0)
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
      )

      setDailyStats({
        ...totals,
        totalCalories: Math.round(totals.totalCalories),
        totalProtein: Math.round(totals.totalProtein * 10) / 10,
        totalCarbs: Math.round(totals.totalCarbs * 10) / 10,
        totalFat: Math.round(totals.totalFat * 10) / 10,
        goalCalories: profile?.daily_calorie_goal || 2000
      })
    }
  }

  const handleMealAdded = () => {
    setRefreshTrigger(prev => prev + 1)
    setCurrentView('dashboard')
  }

  // If user hasn't completed profile setup, show the main dashboard with basic functionality
  if (!hasProfile) {
    return <MainDashboard />
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
        <div className="border-b border-gray-200 px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('dashboard')}
            className="text-gray-600"
          >
            ← Geri
          </Button>
        </div>
        <ProfileSetup />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onCameraClick={() => setCurrentView('camera')}
        onProfileClick={() => setCurrentView('profile')}
      />
      
      <CalorieCards {...dailyStats} />
      
      <MealsList
        onAddMeal={() => setCurrentView('camera')}
        refreshTrigger={refreshTrigger}
      />

      {/* AI Assistant Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setShowAssistant(!showAssistant)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg"
        >
          {showAssistant ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* AI Assistant Panel */}
      {showAssistant && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <AIAssistant onClose={() => setShowAssistant(false)} />
        </div>
      )}
    </div>
  )
}
