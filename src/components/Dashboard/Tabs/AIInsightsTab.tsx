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
    <div className="pb-20 pt-4">
      <div className="px-3 sm:px-4 lg:px-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Analiz ve Değerlendirme</h1>
        <p className="text-sm text-gray-600 mt-1">Kişisel beslenme analiziniz ve önerileriniz</p>
      </div>

      <div data-tutorial="macro-charts">
        <AIInsights dailyStats={dailyStats} />
      </div>
    </div>
  )
}
