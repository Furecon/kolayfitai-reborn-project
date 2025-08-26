import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Camera, Utensils, Clock, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()
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

  const deleteMeal = async (mealId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id) // Extra security check

      if (error) throw error

      // Remove meal from local state
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId))
      
      // Refresh the data to update parent components
      await fetchTodaysMeals()

      toast({
        title: "Öğün silindi",
        description: "Öğün başarıyla silindi ve günlük toplamlar güncellendi.",
      })
    } catch (error) {
      console.error('Error deleting meal:', error)
      toast({
        title: "Hata",
        description: "Öğün silinirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-green-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-black">
              Bugünkü Öğünler
            </CardTitle>
            <Button
              onClick={onAddMeal}
              className="bg-green-500 hover:bg-green-600 text-white h-9 sm:h-10"
              size="sm"
              data-tutorial="add-meal-button"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="text-sm">Öğün Ekle</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {meals.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Utensils className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">Henüz bugün için öğün eklenmemiş</p>
              <Button
                onClick={onAddMeal}
                className="bg-green-500 hover:bg-green-600 text-white h-10 sm:h-11"
              >
                <Camera className="h-4 w-4 mr-2" />
                İlk Öğününü Ekle
              </Button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4"
                >
                  {/* Delete Button - Top Right Corner */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Öğünü Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu öğünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve günlük toplamlarınız otomatik olarak güncellenecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMeal(meal.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl flex-shrink-0 mt-0.5 sm:mt-0">
                      {getMealIcon(meal.meal_type)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-medium text-black truncate">
                          {getMealTypeInTurkish(meal.meal_type)}
                        </h3>
                        <Badge variant="secondary" className="text-xs self-start sm:self-auto flex-shrink-0 h-5">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {formatTime(meal.created_at)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {meal.food_items.length > 0 
                          ? `${meal.food_items.length} yemek türü`
                          : 'Detay yok'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0 flex-shrink-0">
                    <p className="text-sm sm:text-base font-semibold text-green-600">
                      {Math.round(meal.total_calories)} kcal
                    </p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      P:{meal.total_protein?.toFixed(0)}g • 
                      K:{meal.total_carbs?.toFixed(0)}g • 
                      Y:{meal.total_fat?.toFixed(0)}g
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
