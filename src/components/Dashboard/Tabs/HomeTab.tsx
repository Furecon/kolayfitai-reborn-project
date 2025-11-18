import { useEffect } from 'react'
import { CalorieCards } from '../CalorieCards'
import { TrialUsageCard } from '../TrialUsageCard'
import { Button } from '@/components/ui/button'
import { Plus, Camera } from 'lucide-react'
import { useTutorialAutoShow } from '@/context/TutorialContext'

interface HomeTabProps {
  dailyStats: {
    totalCalories: number
    goalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    totalFiber: number
    totalSugar: number
    totalSodium: number
    proteinGoal: number
    carbsGoal: number
    fatGoal: number
  }
  onCameraClick: () => void
  onUpgradeClick: () => void
}

export function HomeTab({ dailyStats, onCameraClick, onUpgradeClick }: HomeTabProps) {
  const { autoShowTutorial } = useTutorialAutoShow()

  useEffect(() => {
    autoShowTutorial('home')
  }, [])

  return (
    <div className="pb-20">
      <div data-tutorial="calorie-cards">
        <CalorieCards
          {...dailyStats}
          onCameraClick={onCameraClick}
        />
      </div>

      <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
        <TrialUsageCard onUpgradeClick={onUpgradeClick} />
      </div>

      <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
        <Button
          onClick={onCameraClick}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold shadow-lg"
          data-tutorial="add-meal-button-home"
        >
          <Camera className="h-6 w-6 mr-3" />
          Öğün Ekle
        </Button>
      </div>
    </div>
  )
}
