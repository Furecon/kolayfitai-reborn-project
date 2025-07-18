
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CalorieCardsProps {
  totalCalories: number
  goalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export function CalorieCards({ 
  totalCalories, 
  goalCalories, 
  totalProtein, 
  totalCarbs, 
  totalFat 
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

      {/* Macro Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold text-green-600">{totalProtein}g</h3>
            <p className="text-xs text-gray-600">Protein</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold text-blue-600">{totalCarbs}g</h3>
            <p className="text-xs text-gray-600">Karbonhidrat</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold text-orange-600">{totalFat}g</h3>
            <p className="text-xs text-gray-600">Yağ</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
