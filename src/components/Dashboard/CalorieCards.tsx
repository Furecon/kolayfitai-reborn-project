
import { Card, CardContent } from '@/components/ui/card'
import { CircularMacroChart } from './CircularMacroChart'
import { Flame, Beef, Wheat, Droplets } from 'lucide-react'

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

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Main Macro Nutrients Card */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-center text-black mb-6">Günlük Besin Değerleri</h2>
          
          {/* Kalori - Büyük ve üstte tek başına */}
          <div className="flex justify-center mb-8">
            <CircularMacroChart
              current={totalCalories}
              goal={goalCalories}
              label="Kalori"
              color="#ef4444"
              unit="kcal"
              icon={Flame}
              size="large"
            />
          </div>
          
          {/* Makrolar - Alt kısımda yan yana */}
          <div className="grid grid-cols-3 gap-4">
            {/* Protein */}
            <div className="flex justify-center">
              <CircularMacroChart
                current={totalProtein}
                goal={proteinGoal}
                label="Protein"
                color="#10b981"
                unit="g"
                icon={Beef}
                size="normal"
              />
            </div>
            
            {/* Karbonhidrat */}
            <div className="flex justify-center">
              <CircularMacroChart
                current={totalCarbs}
                goal={carbsGoal}
                label="Karbonhidrat"
                color="#3b82f6"
                unit="g"
                icon={Wheat}
                size="normal"
              />
            </div>
            
            {/* Yağ */}
            <div className="flex justify-center">
              <CircularMacroChart
                current={totalFat}
                goal={fatGoal}
                label="Yağ"
                color="#f59e0b"
                unit="g"
                icon={Droplets}
                size="normal"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Nutrition Info - Simplified */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-black mb-4 text-center">Diğer Besin Değerleri</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                <span className="text-2xl font-bold text-purple-600">{totalFiber.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-600">Lif (g)</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-2">
                <span className="text-2xl font-bold text-pink-600">{totalSugar.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-600">Şeker (g)</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
                <span className="text-xl font-bold text-red-600">{Math.round(totalSodium)}</span>
              </div>
              <div className="text-sm text-gray-600">Sodyum (mg)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
