
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Camera, Plus } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'

interface DashboardStats {
  totalCalories: number
  goalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export function MainDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalCalories: 0,
    goalCalories: 2000,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  })
  const [todaysMeals, setTodaysMeals] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    // Fetch user's calorie goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_calorie_goal')
      .eq('user_id', user.id)
      .single()

    // Fetch today's meals
    const { data: meals } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false })

    if (meals) {
      setTodaysMeals(meals)
      
      const totals = meals.reduce(
        (acc, meal) => ({
          totalCalories: acc.totalCalories + (meal.total_calories || 0),
          totalProtein: acc.totalProtein + (meal.total_protein || 0),
          totalCarbs: acc.totalCarbs + (meal.total_carbs || 0),
          totalFat: acc.totalFat + (meal.total_fat || 0)
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
      )

      setStats({
        ...totals,
        totalCalories: Math.round(totals.totalCalories),
        totalProtein: Math.round(totals.totalProtein * 10) / 10,
        totalCarbs: Math.round(totals.totalCarbs * 10) / 10,
        totalFat: Math.round(totals.totalFat * 10) / 10,
        goalCalories: profile?.daily_calorie_goal || 2000
      })
    }
  }

  const remainingCalories = Math.max(0, stats.goalCalories - stats.totalCalories)
  const progress = Math.min(100, (stats.totalCalories / stats.goalCalories) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-black">Ana Sayfa</h1>
        <p className="text-gray-600">Günlük kalori takibin</p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Daily Calorie Goal - Circular Progress */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="#10B981"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-black">{stats.totalCalories}</span>
                  <span className="text-sm text-gray-600">/{stats.goalCalories}</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-black">Günlük Kalori Hedefi</h2>
                <p className="text-sm text-gray-600">{remainingCalories} kalori kaldı</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macro Nutrients */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold text-green-600">{stats.totalProtein}g</h3>
              <p className="text-xs text-gray-600">Protein</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold text-blue-600">{stats.totalCarbs}g</h3>
              <p className="text-xs text-gray-600">Karbonhidrat</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold text-orange-600">{stats.totalFat}g</h3>
              <p className="text-xs text-gray-600">Yağ</p>
            </CardContent>
          </Card>
        </div>

        {/* Photo Capture Button */}
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg rounded-lg"
          onClick={() => {
            // This will be connected to the food analysis component later
            console.log('Fotoğraf çek ve yemek tanı')
          }}
        >
          <Camera className="mr-2 h-6 w-6" />
          Fotoğraf Çek ve Yemek Tanı
        </Button>

        {/* Today's Meals */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black flex items-center justify-between">
              Bugünkü Öğünler
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Henüz öğün eklemedin</p>
                <p className="text-sm text-gray-400">İlk öğününü eklemek için yukarıdaki butonu kullan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysMeals.map((meal) => (
                  <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-black">{meal.meal_type}</h4>
                      <p className="text-sm text-gray-600">
                        {meal.total_calories} kcal • {meal.total_protein}g protein
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(meal.created_at).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
