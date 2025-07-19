
import { useState, useEffect } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { CalorieCards } from './CalorieCards'
import { MealsList } from './MealsList'
import FoodAnalysis from '../FoodAnalysis'
import { ProfileSetup } from '../Profile/ProfileSetup'
import { AIAssistant } from '../AI/AIAssistant'
import { MealSuggestions } from '../MealSuggestions/MealSuggestions'
import { FavoriteMeals } from '../MealSuggestions/FavoriteMeals'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { MessageCircle, X, Sparkles, Heart } from 'lucide-react'

type View = 'dashboard' | 'camera' | 'profile' | 'assistant' | 'suggestions' | 'favorites'

export function Dashboard() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
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
  const [showAssistant, setShowAssistant] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDailyStats()
    }
  }, [user, refreshTrigger])

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
      .single()

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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onCameraClick={() => setCurrentView('camera')}
        onProfileClick={() => setCurrentView('profile')}
      />
      
      <CalorieCards {...dailyStats} />
      
      {/* Quick Action Buttons */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setCurrentView('suggestions')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 h-auto"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">AI Önerileri</div>
              <div className="text-xs opacity-90">Kişisel öğün önerileri</div>
            </div>
          </Button>
          
          <Button
            onClick={() => setCurrentView('favorites')}
            variant="outline"
            className="py-3 h-auto border-pink-200 hover:bg-pink-50"
          >
            <Heart className="h-5 w-5 mr-2 text-pink-500" />
            <div className="text-left">
              <div className="font-semibold">Favorilerim</div>
              <div className="text-xs text-gray-500">Sevdiğim tarifler</div>
            </div>
          </Button>
        </div>
      </div>
      
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
