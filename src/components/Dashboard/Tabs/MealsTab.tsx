import { useState } from 'react'
import { MealsList } from '../MealsList'
import { HistoryMeals } from '../HistoryMeals'
import { Button } from '@/components/ui/button'
import { Heart, Camera } from 'lucide-react'
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

type MealsView = 'today' | 'favorites'

export function MealsTab({ onAddMeal, refreshTrigger, dailyStats }: MealsTabProps) {
  const [currentView, setCurrentView] = useState<MealsView>('today')

  const handleMealAdded = () => {
    setCurrentView('today')
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
        <div className="max-w-screen-2xl mx-auto space-y-3">
          <Button
            onClick={onAddMeal}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold shadow-lg"
          >
            <Camera className="h-6 w-6 mr-3" />
            Öğün Ekle
          </Button>

          <Button
            onClick={() => setCurrentView('favorites')}
            variant="outline"
            className="w-full py-4 h-auto border-pink-200 hover:bg-pink-50"
          >
            <Heart className="h-5 w-5 mr-2 text-pink-500 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-semibold text-base">Favorilerim</div>
              <div className="text-xs text-gray-500">Sevdiğim tarifler</div>
            </div>
          </Button>
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
