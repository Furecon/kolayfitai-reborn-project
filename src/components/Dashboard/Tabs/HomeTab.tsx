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
    <div className="pb-20 w-full">
      <div data-tutorial="calorie-cards">
        <CalorieCards
          {...dailyStats}
          onCameraClick={onCameraClick}
        />
      </div>

      <div className="w-full px-4 sm:px-6 pb-3 sm:pb-4">
        <div className="max-w-screen-2xl mx-auto">
          <TrialUsageCard onUpgradeClick={onUpgradeClick} />
        </div>
      </div>
    </div>
  )
}
