import { AIInsights } from '../AIInsights'

interface AIInsightsTabProps {
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

export function AIInsightsTab({ dailyStats }: AIInsightsTabProps) {

  return (
    <div className="pb-20 pt-4 w-full">
      <div className="w-full px-4 sm:px-6 mb-4">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">AI Analiz ve Değerlendirme</h1>
          <p className="text-sm text-gray-600 mt-1">Kişisel beslenme analiziniz ve önerileriniz</p>
        </div>
      </div>

      <div>
        <AIInsights dailyStats={dailyStats} />
      </div>
    </div>
  )
}
