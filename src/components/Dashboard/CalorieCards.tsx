
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
    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
      {/* Main Macro Nutrients Card */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-center text-black mb-4 sm:mb-6">Günlük İlerleme</h2>
          
          {/* Kalori - Büyük ve üstte tek başına */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <CircularMacroChart
              current={totalCalories}
              goal={goalCalories}
              label="Kalori"
              color="#22c55e"
              unit="kcal"
              icon={Flame}
              size="large"
            />
          </div>
          
          {/* Makrolar - Alt kısımda responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Protein */}
            <div className="flex justify-center">
              <CircularMacroChart
                current={totalProtein}
                goal={proteinGoal}
                label="Protein"
                color="#3b82f6"
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
                color="#f97316"
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
                color="#a855f7"
                unit="g"
                icon={Droplets}
                size="normal"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Nutrition Info - Responsive grid */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4 text-center">Diğer Besin Değerleri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-2">
                <span className="text-lg sm:text-xl font-bold text-purple-600">{totalFiber.toFixed(1)}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Lif (g)</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-pink-100 rounded-full mb-2">
                <span className="text-lg sm:text-xl font-bold text-pink-600">{totalSugar.toFixed(1)}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Şeker (g)</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full mb-2">
                <span className="text-sm sm:text-lg font-bold text-red-600">{Math.round(totalSodium)}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Sodyum (mg)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
