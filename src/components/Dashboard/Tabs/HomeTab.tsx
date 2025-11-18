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
    <div className="pb-20 w-full">
      <div>
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
