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
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/317535ce-569b-46f4-9335-cbf575700142.png" 
              alt="KolayfitAI" 
              className="h-8 w-8"
            />
            <h1 className="text-2xl font-bold gradient-text">KolayfitAI</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldin!</h2>
          <p className="text-gray-600">Bugün nasıl hissediyorsun? Hedeflerine ulaşman için buradayız.</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Calories Card */}
          <Card className="card-glass col-span-1 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Flame className="h-5 w-5 text-orange-500" />
                Günlük Kalori Hedefi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {stats.dailyCalories}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.calorieGoal - stats.dailyCalories} kalori kaldı
                  </div>
                </div>
                <Progress 
                  value={caloriePercentage} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0</span>
                  <span>{stats.calorieGoal} kcal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="card-glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-secondary" />
                Profil Bilgilerin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mevcut Kilo</span>
                <span className="font-semibold">{stats.weight} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Süreklilik</span>
                <Badge className="bg-gradient-primary text-white">
                  <Award className="h-3 w-3 mr-1" />
                  {stats.streak} gün
                </Badge>
              </div>
              <Button className="w-full btn-gradient">
                Kişiselleştirilmiş Öneriler
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Macro Nutrients */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Target className="h-5 w-5 text-accent" />
              Makro Besin Takibi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              <ProgressCircle
                percentage={proteinPercentage}
                label="Protein"
                current={stats.protein}
                goal={stats.proteinGoal}
                unit="g"
                color="#10B981"
              />
              <ProgressCircle
                percentage={carbsPercentage}
                label="Karbonhidrat"
                current={stats.carbs}
                goal={stats.carbsGoal}
                unit="g"
                color="#3B82F6"
              />
              <ProgressCircle
                percentage={fatPercentage}
                label="Yağ"
                current={stats.fat}
                goal={stats.fatGoal}
                unit="g"
                color="#F59E0B"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-primary rounded-full">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Yemek Fotoğrafı Çek</h3>
                  <p className="text-sm text-gray-600">AI ile anlık kalori analizi</p>
                </div>
                <Button className="btn-gradient">
                  Başla
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-secondary rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">İlerleme Raporu</h3>
                  <p className="text-sm text-gray-600">Haftalık başarı analizi</p>
                </div>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                  Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}