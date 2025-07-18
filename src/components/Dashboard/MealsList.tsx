
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Camera, Utensils, Clock } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'

interface MealLog {
  id: string
  meal_type: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  food_items: any[]
  photo_url?: string
  created_at: string
}

interface MealsListProps {
  onAddMeal: () => void
  refreshTrigger: number
}

export function MealsList({ onAddMeal, refreshTrigger }: MealsListProps) {
  const { user } = useAuth()
  const [meals, setMeals] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTodaysMeals()
    }
  }, [user, refreshTrigger])

  const fetchTodaysMeals = async () => {
    if (!user) return

    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMeals(data?.map(meal => ({
        ...meal,
        food_items: Array.isArray(meal.food_items) ? meal.food_items : []
      })) || [])
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'kahvaltı':
        return '🌅'
      case 'öğle':
        return '☀️'
      case 'akşam':
        return '🌙'
      case 'atıştırmalık':
        return '🍎'
      default:
        return '🍽️'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMealTypeInTurkish = (mealType: string) => {
    const translations = {
      'breakfast': 'Kahvaltı',
      'lunch': 'Öğle Yemeği',
      'dinner': 'Akşam Yemeği',
      'snack': 'Atıştırmalık',
      'kahvaltı': 'Kahvaltı',
      'öğle': 'Öğle Yemeği',
      'akşam': 'Akşam Yemeği',
      'atıştırmalık': 'Atıştırmalık'
    }
    return translations[mealType.toLowerCase() as keyof typeof translations] || mealType
  }

  if (loading) {
    return (
      <div className="px-4 pb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 pb-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-black">
              Bugünkü Öğünler
            </CardTitle>
            <Button
              onClick={onAddMeal}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Öğün Ekle
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {meals.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Henüz bugün için öğün eklenmemiş</p>
              <Button
                onClick={onAddMeal}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                İlk Öğününü Ekle
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getMealIcon(meal.meal_type)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-black">
                          {getMealTypeInTurkish(meal.meal_type)}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(meal.created_at)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {meal.food_items.length > 0 
                          ? `${meal.food_items.length} yemek türü`
                          : 'Detay yok'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {Math.round(meal.total_calories)} kcal
                    </p>
                    <p className="text-xs text-gray-500">
                      P: {meal.total_protein?.toFixed(1)}g • 
                      K: {meal.total_carbs?.toFixed(1)}g • 
                      Y: {meal.total_fat?.toFixed(1)}g
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
