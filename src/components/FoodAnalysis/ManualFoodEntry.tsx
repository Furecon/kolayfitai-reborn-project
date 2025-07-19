import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface FoodItem {
  name: string
  nameEn: string
  category: string
  portionSize: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface ManualFoodEntryProps {
  mealType: string
  onSave: (foods: FoodItem[]) => Promise<void>
  onBack: () => void
  loading: boolean
}

interface SearchResult {
  id: string
  name: string
  name_en: string
  category: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

export default function ManualFoodEntry({ mealType, onSave, onBack, loading }: ManualFoodEntryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const searchFoods = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase.rpc('search_foods', { search_term: term })
      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Food search error:', error)
      toast({
        title: "Arama Hatası",
        description: "Yemek arama sırasında hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const addFoodToSelection = (searchResult: SearchResult) => {
    const newFood: FoodItem = {
      name: searchResult.name,
      nameEn: searchResult.name_en || '',
      category: searchResult.category,
      portionSize: 100, // Default portion size
      calories: Math.round(searchResult.calories_per_100g),
      protein: Math.round(searchResult.protein_per_100g * 10) / 10,
      carbs: Math.round(searchResult.carbs_per_100g * 10) / 10,
      fat: Math.round(searchResult.fat_per_100g * 10) / 10
    }

    setSelectedFoods([...selectedFoods, newFood])
    setSearchTerm('')
    setSearchResults([])
  }

  const updateFoodPortion = (index: number, portionSize: number) => {
    const updated = [...selectedFoods]
    const food = { ...updated[index] }
    const multiplier = portionSize / 100
    
    // Recalculate nutrition based on new portion size
    const baseCalories = food.calories / (food.portionSize / 100)
    const baseProtein = food.protein / (food.portionSize / 100)
    const baseCarbs = food.carbs / (food.portionSize / 100)
    const baseFat = food.fat / (food.portionSize / 100)

    food.portionSize = portionSize
    food.calories = Math.round(baseCalories * multiplier)
    food.protein = Math.round(baseProtein * multiplier * 10) / 10
    food.carbs = Math.round(baseCarbs * multiplier * 10) / 10
    food.fat = Math.round(baseFat * multiplier * 10) / 10

    updated[index] = food
    setSelectedFoods(updated)
  }

  const removeFoodFromSelection = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (selectedFoods.length === 0) {
      toast({
        title: "Yemek Seçin",
        description: "En az bir yemek eklemelisiniz.",
        variant: "destructive"
      })
      return
    }

    onSave(selectedFoods)
  }

  const getTotalNutrition = () => {
    return selectedFoods.reduce(
      (total, food) => ({
        calories: total.calories + food.calories,
        protein: total.protein + food.protein,
        carbs: total.carbs + food.carbs,
        fat: total.fat + food.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const totalNutrition = getTotalNutrition()

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold text-black">Manuel Yemek Girişi</h1>
          <span className="text-sm text-gray-500">({mealType})</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Search className="h-5 w-5 text-green-500" />
              Yemek Arayın
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Yemek adı yazın (örn: tavuk döner, mercimek çorbası)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map((food) => (
                  <div
                    key={food.id}
                    className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                    onClick={() => addFoodToSelection(food)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{food.name}</h4>
                        <p className="text-sm text-gray-500">{food.category}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{Math.round(food.calories_per_100g)} kcal/100g</p>
                        <Button size="sm" className="mt-1">
                          <Plus className="h-3 w-3 mr-1" />
                          Ekle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedFoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Seçilen Yemekler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFoods.map((food, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{food.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFoodFromSelection(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Porsiyon (gram)</Label>
                      <Input
                        type="number"
                        value={food.portionSize}
                        onChange={(e) => updateFoodPortion(index, parseInt(e.target.value) || 0)}
                        className="h-8"
                        min="1"
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">{food.calories}</span> kcal</p>
                      <p>P: {food.protein}g • K: {food.carbs}g • Y: {food.fat}g</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold mb-3">Toplam Besin Değerleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(totalNutrition.calories)}
                    </p>
                    <p className="text-sm text-muted-foreground">Kalori</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(totalNutrition.protein * 10) / 10}g
                    </p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(totalNutrition.carbs * 10) / 10}g
                    </p>
                    <p className="text-sm text-muted-foreground">Karbonhidrat</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(totalNutrition.fat * 10) / 10}g
                    </p>
                    <p className="text-sm text-muted-foreground">Yağ</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Devam Et"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
