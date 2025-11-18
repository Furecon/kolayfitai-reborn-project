import { CalorieCards } from '../CalorieCards'
import { TrialUsageCard } from '../TrialUsageCard'

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
    </div>
  )
}
