
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Target, Camera, User, Settings } from 'lucide-react'
import CalorieCalculator from './CalorieCalculator'

interface DashboardStats {
  dailyCalories: number
  calorieGoal: number
  protein: number
  proteinGoal: number
  carbs: number
  carbsGoal: number
  fat: number
  fatGoal: number
  streak: number
  weight: number
}

export default function Dashboard() {
  const [stats] = useState<DashboardStats>({
    dailyCalories: 1450,
    calorieGoal: 2000,
    protein: 85,
    proteinGoal: 120,
    carbs: 180,
    carbsGoal: 250,
    fat: 55,
    fatGoal: 80,
    streak: 7,
    weight: 68.5
  })

  // User profile for calorie calculation
  const userProfile = {
    age: 32,
    weight: 86, // kg
    height: 183, // cm
    gender: 'male' as const,
    activityLevel: 'moderate' as const // Orta aktif
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and user name */}
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-3">
                  <img 
                    src="/lovable-uploads/317535ce-569b-46f4-9335-cbf575700142.png" 
                    alt="KolayfitAi" 
                    className="h-8 w-8"
                  />
                  <h1 className="text-xl font-bold text-gray-900">KolayfitAi</h1>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-11">Furkan Aydemir</p>
              </div>
            </div>

            {/* Right side - Profile info and settings */}
            <div className="flex items-center space-x-6">
              {/* Profile Stats */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Yaş</div>
                  <div className="text-sm font-semibold text-gray-900">32</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Boy</div>
                  <div className="text-sm font-semibold text-gray-900">183 cm</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Kilo</div>
                  <div className="text-sm font-semibold text-gray-900">86 kg</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Hedef</div>
                  <div className="text-xs font-semibold text-gray-900">Kilo vermek</div>
                </div>
              </div>

              {/* Profile and Settings Icons */}
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Main Photo Button */}
          <div className="flex justify-center">
            <Button className="h-14 px-8 bg-[#28C76F] hover:bg-[#239a5b] text-white font-medium rounded-xl flex items-center justify-center gap-3">
              <Camera className="h-5 w-5" />
              Fotoğraf Çek
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Macro Stats */}
            <div className="space-y-4">
              {/* Calorie Calculator with Mifflin-St Jeor formula */}
              <CalorieCalculator 
                profile={userProfile}
                currentIntake={stats.dailyCalories}
                goalCalories={stats.calorieGoal}
              />

              {/* Macro Cards Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Protein - Blue */}
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Protein</div>
                  <div className="text-xl font-bold text-gray-900">{stats.protein}g</div>
                  <div className="text-xs text-gray-500 mt-1">Günlük alım</div>
                  <div className="text-xs text-gray-400">Hedef: {stats.proteinGoal}g</div>
                </div>

                {/* Karbonhidrat - Orange */}
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Karbonhidrat</div>
                  <div className="text-xl font-bold text-gray-900">{stats.carbs}g</div>
                  <div className="text-xs text-gray-500 mt-1">Günlük alım</div>
                  <div className="text-xs text-gray-400">Hedef: {stats.carbsGoal}g</div>
                </div>

                {/* Yağ - Purple */}
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Yağ</div>
                  <div className="text-xl font-bold text-gray-900">{stats.fat}g</div>
                  <div className="text-xs text-gray-500 mt-1">Günlük alım</div>
                  <div className="text-xs text-gray-400">Hedef: {stats.fatGoal}g</div>
                </div>
              </div>
            </div>

            {/* Right Column - Daily Meals */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Bugünkü Öğünler</h3>
                <Button size="sm" className="w-8 h-8 bg-[#28C76F] hover:bg-[#239a5b] text-white rounded-lg p-0">
                  +
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#28C76F] rounded-lg flex items-center justify-center">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Kahvaltı</div>
                      <div className="text-sm text-gray-500">08:30</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">350 kcal</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#28C76F] rounded-lg flex items-center justify-center">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Öğle Yemeği</div>
                      <div className="text-sm text-gray-500">13:15</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">650 kcal</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#28C76F] rounded-lg flex items-center justify-center">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Atıştırmalık</div>
                      <div className="text-sm text-gray-500">16:45</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">250 kcal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
