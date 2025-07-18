import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, Target, Award, TrendingUp, Camera, User, Settings } from 'lucide-react'

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

  const caloriePercentage = (stats.dailyCalories / stats.calorieGoal) * 100
  const proteinPercentage = (stats.protein / stats.proteinGoal) * 100
  const carbsPercentage = (stats.carbs / stats.carbsGoal) * 100
  const fatPercentage = (stats.fat / stats.fatGoal) * 100

  const ProgressCircle = ({ 
    percentage, 
    label, 
    current, 
    goal, 
    unit, 
    color 
  }: {
    percentage: number
    label: string
    current: number
    goal: number
    unit: string
    color: string
  }) => {
    const circumference = 2 * Math.PI * 45
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-600">{current}{unit} / {goal}{unit}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-md space-y-6">
        {/* Header */}
        <div className="text-center pt-6">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/317535ce-569b-46f4-9335-cbf575700142.png" 
              alt="KolayfitAI" 
              className="h-8 w-8 mr-2"
            />
            <h1 className="text-2xl font-bold text-gray-900">KolayfitAI</h1>
          </div>
          <h2 className="text-lg text-gray-700">Hoş geldin, Furkan Aydemir!</h2>
        </div>

        {/* Main Photo Button */}
        <Button 
          className="w-full h-14 bg-[#28C76F] hover:bg-[#239a5b] text-white font-medium rounded-xl flex items-center justify-center gap-3"
        >
          <Camera className="h-5 w-5" />
          Fotoğraf Çek
        </Button>

        {/* Profile Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Yaş</div>
              <div className="text-lg font-semibold text-gray-900">32</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Boy</div>
              <div className="text-lg font-semibold text-gray-900">183 cm</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Kilo</div>
              <div className="text-lg font-semibold text-gray-900">86 kg</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Hedef</div>
              <div className="text-xs font-semibold text-gray-900">Kilo vermek</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          {/* Kalori Card - Green */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#28C76F] rounded-lg flex items-center justify-center">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-gray-600">Bugünkü Kalori</span>
              </div>
              <div className="text-sm text-gray-500">Günlük alım</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.dailyCalories}
            </div>
            <div className="text-xs text-gray-500">/ {stats.calorieGoal} hedef</div>
          </div>

          {/* Macro Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Protein - Blue */}
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm text-gray-600 mb-1">Protein</div>
              <div className="text-lg font-bold text-gray-900">{stats.protein}g</div>
              <div className="text-xs text-gray-500">Günlük alım</div>
              <div className="text-xs text-gray-400">Hedef: {stats.proteinGoal}g</div>
            </div>

            {/* Karbonhidrat - Orange */}
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm text-gray-600 mb-1">Karbonhidrat</div>
              <div className="text-lg font-bold text-gray-900">{stats.carbs}g</div>
              <div className="text-xs text-gray-500">Günlük alım</div>
              <div className="text-xs text-gray-400">Hedef: {stats.carbsGoal}g</div>
            </div>

            {/* Yağ - Purple */}
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm text-gray-600 mb-1">Yağ</div>
              <div className="text-lg font-bold text-gray-900">{stats.fat}g</div>
              <div className="text-xs text-gray-500">Günlük alım</div>
              <div className="text-xs text-gray-400">Hedef: {stats.fatGoal}g</div>
            </div>
          </div>
        </div>

        {/* Daily Meals */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bugünkü Öğünler</h3>
            <Button size="sm" className="w-8 h-8 bg-[#28C76F] hover:bg-[#239a5b] text-white rounded-lg p-0">
              +
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
  )
}