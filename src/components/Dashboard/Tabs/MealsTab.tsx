import { useState } from 'react'
import { MealsList } from '../MealsList'
import { HistoryMeals } from '../HistoryMeals'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart, Camera } from 'lucide-react'
import { MealSuggestions } from '../../MealSuggestions/MealSuggestions'
import { FavoriteMeals } from '../../MealSuggestions/FavoriteMeals'

interface MealsTabProps {
  onAddMeal: () => void
  refreshTrigger: number
  dailyStats: {
    totalCalories: number
    goalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    proteinGoal: number
    carbsGoal: number
    fatGoal: number
  }
}

type MealsView = 'today' | 'suggestions' | 'favorites'

export function MealsTab({ onAddMeal, refreshTrigger, dailyStats }: MealsTabProps) {
  const [currentView, setCurrentView] = useState<MealsView>('today')

  const handleMealAdded = () => {
    setCurrentView('today')
  }

  if (currentView === 'suggestions') {
    return (
      <div className="pb-20 w-full">
        <MealSuggestions
          onBack={() => setCurrentView('today')}
          onMealAdded={handleMealAdded}
          dailyStats={dailyStats}
        />
      </div>
    )
  }

  if (currentView === 'favorites') {
    return (
      <div className="pb-20 w-full">
        <FavoriteMeals
          onBack={() => setCurrentView('today')}
          onMealAdded={handleMealAdded}
        />
      </div>
    )
  }

  return (
    <div className="pb-20 pt-4 w-full">
      <div className="w-full px-4 sm:px-6 mb-4">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Öğünler ve Favoriler</h1>
          <p className="text-sm text-gray-600 mt-1">Bugünkü öğünleriniz ve favori tarifleriniz</p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 pb-3 sm:pb-4">
        <div className="max-w-screen-2xl mx-auto">
        <Button
          onClick={onAddMeal}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold shadow-lg mb-4"
        >
          <Camera className="h-6 w-6 mr-3" />
          Öğün Ekle
        </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => setCurrentView('suggestions')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 h-auto min-h-[4rem]"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-semibold text-sm sm:text-base">AI Önerileri</div>
                <div className="text-xs opacity-90 truncate">Kişisel öğün önerileri</div>
              </div>
            </Button>

            <Button
              onClick={() => setCurrentView('favorites')}
              variant="outline"
              className="py-3 h-auto min-h-[4rem] border-pink-200 hover:bg-pink-50"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-pink-500 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-semibold text-sm sm:text-base">Favorilerim</div>
                <div className="text-xs text-gray-500 truncate">Sevdiğim tarifler</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div>
        <MealsList
          onAddMeal={onAddMeal}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <HistoryMeals />
    </div>
  )
}
