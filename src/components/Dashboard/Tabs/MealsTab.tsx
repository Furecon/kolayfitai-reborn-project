import { useState } from 'react'
import { MealsList } from '../MealsList'
import { HistoryMeals } from '../HistoryMeals'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart } from 'lucide-react'
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
      <div className="pb-20">
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
      <div className="pb-20">
        <FavoriteMeals
          onBack={() => setCurrentView('today')}
          onMealAdded={handleMealAdded}
        />
      </div>
    )
  }

  return (
    <div className="pb-20 pt-4">
      <div className="px-3 sm:px-4 lg:px-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Öğünler ve Favoriler</h1>
        <p className="text-sm text-gray-600 mt-1">Bugünkü öğünleriniz ve favori tarifleriniz</p>
      </div>

      <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
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

      <div data-tutorial="meal-history">
        <MealsList
          onAddMeal={onAddMeal}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <HistoryMeals />
    </div>
  )
}
