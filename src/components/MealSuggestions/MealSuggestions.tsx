import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Users, ChefHat, Heart, Plus, ArrowLeft } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { RecipeDetail } from './RecipeDetail'

interface MealSuggestion {
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  prepTime: number
  difficulty: string
  ingredients: string[]
  instructions: string[]
  category: string
  servings: number
}

interface MealSuggestionsProps {
  onBack: () => void
  onMealAdded: () => void
  dailyStats: {
    totalCalories: number
    goalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    proteinGoal: number
    carbsGoal: number
    fatGoal: number
  }
}

export function MealSuggestions({ onBack, onMealAdded, dailyStats }: MealSuggestionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast')
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<MealSuggestion | null>(null)

  const mealTypes = [
    { key: 'breakfast', label: 'Kahvaltı', icon: '🌅' },
    { key: 'lunch', label: 'Öğle', icon: '☀️' },
    { key: 'dinner', label: 'Akşam', icon: '🌙' },
    { key: 'snack', label: 'Atıştırmalık', icon: '🍎' }
  ]

  const mapMealTypeToTurkish = (englishMealType: string): string => {
    const mapping: { [key: string]: string } = {
      'breakfast': 'kahvaltı',
      'lunch': 'öğle',
      'dinner': 'akşam',
      'snack': 'atıştırmalık'
    }
    return mapping[englishMealType] || englishMealType
  }

  const getSuggestions = async (mealType: string) => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('meal-suggestions', {
        body: {
          mealType,
          userGoals: {
            goalCalories: dailyStats.goalCalories,
            proteinGoal: dailyStats.proteinGoal,
            carbsGoal: dailyStats.carbsGoal,
            fatGoal: dailyStats.fatGoal
          },
          todayIntake: {
            totalCalories: dailyStats.totalCalories,
            totalProtein: dailyStats.totalProtein,
            totalCarbs: dailyStats.totalCarbs,
            totalFat: dailyStats.totalFat
          }
        }
      })

      if (error) throw error

      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error getting suggestions:', error)
      toast({
        title: "Hata",
        description: "Öğün önerileri alınırken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addMealToLog = async (suggestion: MealSuggestion) => {
    if (!user) return

    try {
      const turkishMealType = mapMealTypeToTurkish(selectedMealType)
      
      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_type: turkishMealType,
          food_items: [
            {
              name: suggestion.name,
              amount: 1,
              unit: 'porsiyon',
              calories: suggestion.calories,
              protein: suggestion.protein,
              carbs: suggestion.carbs,
              fat: suggestion.fat
            }
          ],
          total_calories: suggestion.calories,
          total_protein: suggestion.protein,
          total_carbs: suggestion.carbs,
          total_fat: suggestion.fat,
          notes: `Ai önerisi: ${suggestion.description}`
        })

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: `${suggestion.name} günlük takibinize eklendi`
      })

      onMealAdded()
    } catch (error) {
      console.error('Error adding meal:', error)
      toast({
        title: "Hata",
        description: "Öğün eklenirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const saveFavoriteMeal = async (suggestion: MealSuggestion) => {
    if (!user) return

    try {
      const turkishMealType = mapMealTypeToTurkish(selectedMealType)
      
      const { error } = await supabase
        .from('favorite_meals')
        .insert({
          user_id: user.id,
          meal_name: suggestion.name,
          meal_type: turkishMealType,
          recipe: {
            ...suggestion,
            meal_type: turkishMealType
          }
        })

      if (error) throw error

      toast({
        title: "Favorilere Eklendi!",
        description: `${suggestion.name} favorilerinize kaydedildi`
      })
    } catch (error) {
      console.error('Error saving favorite:', error)
      toast({
        title: "Hata",
        description: "Favori kaydedilirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'kolay': return 'bg-green-100 text-green-800'
      case 'orta': return 'bg-yellow-100 text-yellow-800'
      case 'zor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        onAddMeal={() => addMealToLog(selectedRecipe)}
        onSaveFavorite={() => saveFavoriteMeal(selectedRecipe)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 bg-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 h-8 w-8 sm:h-10 sm:w-auto p-0 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Geri</span>
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold text-black truncate">Ai Öğün Önerileri</h1>
        </div>
      </div>

      {/* Content Container - Responsive padding */}
      <div className="p-3 sm:p-4 max-w-4xl mx-auto">
        <Tabs value={selectedMealType} onValueChange={setSelectedMealType}>
          {/* Tabs List - Responsive */}
          <TabsList className="grid grid-cols-4 mb-4 sm:mb-6 w-full h-auto">
            {mealTypes.map((type) => (
              <TabsTrigger 
                key={type.key} 
                value={type.key} 
                className="text-xs sm:text-sm p-2 sm:p-3 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 h-auto min-h-[3rem] sm:min-h-[2.5rem]"
              >
                <span className="text-base sm:text-lg">{type.icon}</span>
                <span className="truncate">{type.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {mealTypes.map((type) => (
            <TabsContent key={type.key} value={type.key}>
              <div className="space-y-3 sm:space-y-4">
                {/* Info Card - Responsive */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center">
                      <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                        <span className="text-xl sm:text-2xl mr-2">{type.icon}</span>
                        {type.label} Önerileri
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 px-2">
                        Günlük hedeflerinize uygun Ai destekli öğün önerileri
                      </p>
                      <Button
                        onClick={() => getSuggestions(type.key)}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                      >
                        {loading ? 'Öneriler Hazırlanıyor...' : 'Öneriler Getir'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggestions Grid - Responsive */}
                {suggestions.length > 0 && (
                  <div className="grid gap-3 sm:gap-4">
                    {suggestions.map((suggestion, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base sm:text-lg leading-tight break-words">
                                {suggestion.name}
                              </CardTitle>
                              <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed break-words">
                                {suggestion.description}
                              </p>
                            </div>
                            <Badge className={`${getDifficultyColor(suggestion.difficulty)} flex-shrink-0 text-xs`}>
                              {suggestion.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 space-y-3 sm:space-y-4">
                          {/* Time and Servings - Responsive */}
                          <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{suggestion.prepTime} dk</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{suggestion.servings} porsiyon</span>
                            </div>
                          </div>

                          {/* Nutrition Grid - Responsive */}
                          <div className="grid grid-cols-4 gap-1 sm:gap-2">
                            <div className="text-center p-2 sm:p-3 bg-green-50 rounded">
                              <div className="font-semibold text-green-600 text-sm sm:text-base">
                                {suggestion.calories}
                              </div>
                              <div className="text-xs text-gray-500">kcal</div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded">
                              <div className="font-semibold text-blue-600 text-sm sm:text-base">
                                {suggestion.protein}g
                              </div>
                              <div className="text-xs text-gray-500">Protein</div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-orange-50 rounded">
                              <div className="font-semibold text-orange-600 text-sm sm:text-base">
                                {suggestion.carbs}g
                              </div>
                              <div className="text-xs text-gray-500">Karb.</div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-purple-50 rounded">
                              <div className="font-semibold text-purple-600 text-sm sm:text-base">
                                {suggestion.fat}g
                              </div>
                              <div className="text-xs text-gray-500">Yağ</div>
                            </div>
                          </div>

                          {/* Action Buttons - Responsive */}
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button
                              onClick={() => setSelectedRecipe(suggestion)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                            >
                              <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="truncate">Tarifi Gör</span>
                            </Button>
                            <Button
                              onClick={() => saveFavoriteMeal(suggestion)}
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto px-3 text-xs sm:text-sm h-9 sm:h-10"
                            >
                              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              onClick={() => addMealToLog(suggestion)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white flex-1 text-xs sm:text-sm h-9 sm:h-10"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="truncate">Öğünü Ekle</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
