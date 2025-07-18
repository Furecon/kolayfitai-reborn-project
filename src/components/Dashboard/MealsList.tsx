
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Clock, Trash2, Edit } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MealLog {
  id: string
  meal_type: string
  total_calories: number
  created_at: string
  food_items: any[]
  photo_url?: string
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
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching meals:', error)
    } else {
      setMeals(data || [])
    }
    setLoading(false)
  }

  const deleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealId)

    if (error) {
      console.error('Error deleting meal:', error)
    } else {
      setMeals(meals.filter(meal => meal.id !== mealId))
    }
  }

  const getMealTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      'kahvaltı': 'Kahvaltı',
      'öğle': 'Öğle Yemeği',
      'akşam': 'Akşam Yemeği',
      'atıştırmalık': 'Atıştırmalık'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="px-4 py-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Öğünler yükleniyor...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-black">Bugünkü Öğünler</CardTitle>
            <Button
              onClick={onAddMeal}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Öğün Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {meals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Henüz öğün eklenmemiş</p>
              <Button
                onClick={onAddMeal}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Öğününüzü Ekleyin
              </Button>
            </div>
          ) : (
            meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {meal.photo_url && (
                    <img
                      src={meal.photo_url}
                      alt="Meal"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-black">
                      {getMealTypeDisplay(meal.meal_type)}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(meal.created_at), 'HH:mm', { locale: tr })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-semibold text-black">
                      {Math.round(meal.total_calories)} kcal
                    </p>
                    <p className="text-xs text-gray-600">
                      {meal.food_items.length} yemek
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMeal(meal.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
