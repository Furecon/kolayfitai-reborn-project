
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CircularMacroChart } from './CircularMacroChart'

interface CalorieCardsProps {
  totalCalories: number
  goalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber?: number
  totalSugar?: number
  totalSodium?: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
}

export function CalorieCards({ 
  totalCalories, 
  goalCalories, 
  totalProtein, 
  totalCarbs, 
  totalFat,
  totalFiber = 0,
  totalSugar = 0,
  totalSodium = 0,
  proteinGoal = 125,
  carbsGoal = 200,
  fatGoal = 67
}: CalorieCardsProps) {
  const remainingCalories = Math.max(0, goalCalories - totalCalories)
  const progress = Math.min(100, (totalCalories / goalCalories) * 100)

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Main Calorie Card */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-black">{totalCalories}</h2>
              <p className="text-sm text-gray-600">Alınan Kalori</p>
            </div>
            
            <Progress value={progress} className="h-3" />
            
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <p className="font-semibold text-black">{remainingCalories}</p>
                <p className="text-gray-600">Kalan</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-black">{goalCalories}</p>
                <p className="text-gray-600">Hedef</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circular Macro Charts */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-black mb-4 text-center">Makro Besinler</h3>
          <div className="flex justify-around items-center">
            <CircularMacroChart
              current={totalProtein}
              goal={proteinGoal}
              label="Protein"
              color="#10b981"
              unit="g"
            />
            <CircularMacroChart
              current={totalCarbs}
              goal={carbsGoal}
              label="Karbonhidrat"
              color="#3b82f6"
              unit="g"
            />
            <CircularMacroChart
              current={totalFat}
              goal={fatGoal}
              label="Yağ"
              color="#f59e0b"
              unit="g"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Nutrition Info */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-black mb-4 text-center">Diğer Besin Değerleri</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalFiber.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Lif (g)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{totalSugar.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Şeker (g)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{Math.round(totalSodium)}</div>
              <div className="text-sm text-gray-600">Sodyum (mg)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
