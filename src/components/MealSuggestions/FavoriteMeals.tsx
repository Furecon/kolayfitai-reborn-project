
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Clock, Users, Trash2, Plus, ArrowLeft } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface FavoriteMeal {
  id: string
  meal_name: string
  meal_type: string
  recipe: any
  created_at: string
}

interface FavoriteMealsProps {
  onBack: () => void
  onMealAdded: () => void
}

export function FavoriteMeals({ onBack, onMealAdded }: FavoriteMealsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchFavorites = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('favorite_meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setFavorites(data || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast({
        title: "Hata",
        description: "Favori yemekler yüklenirken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_meals')
        .delete()
        .eq('id', id)

      if (error) throw error

      setFavorites(favorites.filter(fav => fav.id !== id))
      
      toast({
        title: "Silindi",
        description: "Favori yemek başarıyla silindi"
      })
    } catch (error) {
      console.error('Error deleting favorite:', error)
      toast({
        title: "Hata",
        description: "Favori silinirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const addFavoriteToLog = async (favorite: FavoriteMeal) => {
    if (!user) return

    try {
      const recipe = favorite.recipe
      
      // Use the meal_type from the favorite (already in Turkish from database)
      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_type: favorite.meal_type, // This is already in Turkish format
          food_items: [
            {
              name: favorite.meal_name,
              amount: 1,
              unit: 'porsiyon',
              calories: recipe.calories,
              protein: recipe.protein,
              carbs: recipe.carbs,
              fat: recipe.fat
            }
          ],
          total_calories: recipe.calories,
          total_protein: recipe.protein,
          total_carbs: recipe.carbs,
          total_fat: recipe.fat,
          notes: `Favori yemek: ${recipe.description || ''}`
        })

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: `${favorite.meal_name} günlük takibinize eklendi`
      })

      onMealAdded()
    } catch (error) {
      console.error('Error adding favorite to log:', error)
      toast({
        title: "Hata",
        description: "Öğün eklenirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const getMealTypeInTurkish = (mealType: string) => {
    const translations = {
      'breakfast': 'Kahvaltı',
      'lunch': 'Öğle Yemeği',
      'dinner': 'Akşam Yemeği',
      'snack': 'Atıştırmalık'
    }
    return translations[mealType as keyof typeof translations] || mealType
  }

  const getMealTypeIcon = (mealType: string) => {
    const icons = {
      'breakfast': '🌅',
      'lunch': '☀️',
      'dinner': '🌙',
      'snack': '🍎'
    }
    return icons[mealType as keyof typeof icons] || '🍽️'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-4 bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold text-black">Favori Yemekler</h1>
        </div>
      </div>

      <div className="p-4">
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                Henüz favori yemek yok
              </h2>
              <p className="text-gray-500">
                AI önerilerinden beğendiğiniz yemekleri favorilerinize ekleyin
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getMealTypeIcon(favorite.meal_type)}
                      </span>
                      <div>
                        <CardTitle className="text-lg">{favorite.meal_name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {getMealTypeInTurkish(favorite.meal_type)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFavorite(favorite.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {favorite.recipe && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {favorite.recipe.prepTime} dk
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {favorite.recipe.servings} porsiyon
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">
                            {favorite.recipe.calories}
                          </div>
                          <div className="text-xs text-gray-500">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">
                            {favorite.recipe.protein}g
                          </div>
                          <div className="text-xs text-gray-500">Protein</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">
                            {favorite.recipe.carbs}g
                          </div>
                          <div className="text-xs text-gray-500">Karb.</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">
                            {favorite.recipe.fat}g
                          </div>
                          <div className="text-xs text-gray-500">Yağ</div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={() => addFavoriteToLog(favorite)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Öğünü Ekle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
