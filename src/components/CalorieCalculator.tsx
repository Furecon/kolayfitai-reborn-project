import { Calculator, Flame } from 'lucide-react'

interface UserProfile {
  age: number
  weight: number // kg
  height: number // cm
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
}

interface CalorieCalculatorProps {
  profile: UserProfile
  currentIntake: number
  goalCalories: number
}

export default function CalorieCalculator({ profile, currentIntake, goalCalories }: CalorieCalculatorProps) {
  
  // Mifflin-St Jeor BMR calculation
  const calculateBMR = (): number => {
    const { weight, height, age, gender } = profile
    
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  }
  
  // Activity multipliers
  const getActivityMultiplier = (): number => {
    switch (profile.activityLevel) {
      case 'sedentary': return 1.2
      case 'light': return 1.375
      case 'moderate': return 1.55
      case 'active': return 1.725
      case 'very_active': return 1.9
      default: return 1.2
    }
  }
  
  const getActivityLabel = (): string => {
    switch (profile.activityLevel) {
      case 'sedentary': return 'Hareketsiz'
      case 'light': return 'Az aktif'
      case 'moderate': return 'Orta aktif'
      case 'active': return 'Çok aktif'
      case 'very_active': return 'Aşırı aktif'
      default: return 'Hareketsiz'
    }
  }
  
  const bmr = calculateBMR()
  const dailyCalorieNeeds = Math.round(bmr * getActivityMultiplier())
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#28C76F] rounded-lg flex items-center justify-center">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="text-gray-600">Kalori Analizi</span>
        </div>
        <Calculator className="h-4 w-4 text-gray-400" />
      </div>
      
      {/* Current Intake vs Daily Needs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Bugünkü Alım</div>
          <div className="text-2xl font-bold text-gray-900">{currentIntake}</div>
          <div className="text-xs text-gray-400">kcal</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-1">Günlük İhtiyaç</div>
          <div className="text-2xl font-bold text-[#28C76F]">{dailyCalorieNeeds}</div>
          <div className="text-xs text-gray-400">kcal</div>
        </div>
      </div>
      
      {/* BMR Information */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Bazal Metabolizma (BMR):</span>
          <span className="font-medium text-gray-900">{Math.round(bmr)} kcal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Aktivite Seviyesi:</span>
          <span className="font-medium text-gray-900">{getActivityLabel()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Aktivite Katsayısı:</span>
          <span className="font-medium text-gray-900">× {getActivityMultiplier()}</span>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>İlerleme</span>
          <span>{Math.round((currentIntake / dailyCalorieNeeds) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#28C76F] h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((currentIntake / dailyCalorieNeeds) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}