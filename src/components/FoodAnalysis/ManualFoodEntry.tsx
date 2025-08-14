
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Search, Plus, Trash2, Brain, Database } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface FoodItem {
  name: string
  nameEn: string
  estimatedAmount: string
  nutritionPer100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }
  totalNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }
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

interface SelectedFood {
  name: string
  nameEn: string
  category: string
  portionSize: number
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  source?: 'ai' | 'database'
}

interface AnalysisResult {
  recognized_name: string
  foods: {
    name: string
    amount: number
    unit: string
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }[]
  confidence: number
  suggestions: string[]
  notes: string
}

export default function ManualFoodEntry({ mealType, onSave, onBack, loading }: ManualFoodEntryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('ai')
  
  // AI-related state
  const [foodInput, setFoodInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  
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

  // AI Analysis Function
  const analyzeFoodByName = async (foodName: string) => {
    if (!foodName.trim()) return

    setIsAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food-by-name', {
        body: { foodName: foodName.trim(), mealType }
      })

      if (error) throw error

      setAnalysisResult(data)
      toast({
        title: "Analiz Tamamlandı",
        description: `${data.foods.length} yemek tanımlandı`,
      })
    } catch (error) {
      console.error('AI analiz hatası:', error)
      toast({
        title: "Analiz Hatası",
        description: "AI analizi sırasında hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      analyzeFoodByName(foodInput)
    }
  }

  const addFoodToSelection = (searchResult: SearchResult) => {
    const newFood: SelectedFood = {
      name: searchResult.name,
      nameEn: searchResult.name_en || '',
      category: searchResult.category,
      portionSize: 100, // Default portion size
      caloriesPer100g: searchResult.calories_per_100g,
      proteinPer100g: searchResult.protein_per_100g,
      carbsPer100g: searchResult.carbs_per_100g,
      fatPer100g: searchResult.fat_per_100g,
      source: 'database'
    }

    setSelectedFoods([...selectedFoods, newFood])
    setSearchTerm('')
    setSearchResults([])
  }

  const addAIFoodToSelection = (food: AnalysisResult['foods'][0]) => {
    const newFood: SelectedFood = {
      name: food.name,
      nameEn: '',
      category: 'AI Tanımlı',
      portionSize: food.amount,
      caloriesPer100g: Math.round((food.calories / food.amount) * 100),
      proteinPer100g: Math.round((food.protein / food.amount) * 100 * 10) / 10,
      carbsPer100g: Math.round((food.carbs / food.amount) * 100 * 10) / 10,
      fatPer100g: Math.round((food.fat / food.amount) * 100 * 10) / 10,
      source: 'ai'
    }

    setSelectedFoods([...selectedFoods, newFood])
  }

  const updateFoodPortion = (index: number, portionSize: number) => {
    const updated = [...selectedFoods]
    updated[index] = { ...updated[index], portionSize }
    setSelectedFoods(updated)
  }

  const removeFoodFromSelection = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index))
  }

  const convertToFoodItems = (foods: SelectedFood[]): FoodItem[] => {
    return foods.map(food => {
      const multiplier = food.portionSize / 100
      const totalCalories = Math.round(food.caloriesPer100g * multiplier)
      const totalProtein = Math.round(food.proteinPer100g * multiplier * 10) / 10
      const totalCarbs = Math.round(food.carbsPer100g * multiplier * 10) / 10
      const totalFat = Math.round(food.fatPer100g * multiplier * 10) / 10

      return {
        name: food.name,
        nameEn: food.nameEn,
        estimatedAmount: `${food.portionSize}g`,
        nutritionPer100g: {
          calories: food.caloriesPer100g,
          protein: food.proteinPer100g,
          carbs: food.carbsPer100g,
          fat: food.fatPer100g,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        totalNutrition: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      }
    })
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

    const foodItems = convertToFoodItems(selectedFoods)
    onSave(foodItems)
  }

  const getTotalNutrition = () => {
    return selectedFoods.reduce(
      (total, food) => {
        const multiplier = food.portionSize / 100
        return {
          calories: total.calories + (food.caloriesPer100g * multiplier),
          protein: total.protein + (food.proteinPer100g * multiplier),
          carbs: total.carbs + (food.carbsPer100g * multiplier),
          fat: total.fat + (food.fatPer100g * multiplier)
        }
      },
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI ile Hızlı Giriş
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Veritabanından Ara
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Brain className="h-5 w-5 text-green-500" />
                  AI ile Yemek Girişi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Yemek adınızı yazın (örn: döner, mercimek çorbası, tavuk şiş)"
                    value={foodInput}
                    onChange={(e) => setFoodInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full"
                    disabled={isAnalyzing}
                  />
                  {isAnalyzing && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => analyzeFoodByName(foodInput)}
                    disabled={!foodInput.trim() || isAnalyzing}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {isAnalyzing ? "Analiz Ediliyor..." : "Analiz Et"}
                  </Button>
                </div>

                {/* Quick suggestions */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Hızlı öneriler:</p>
                  <div className="flex flex-wrap gap-2">
                    {['döner', 'mercimek çorbası', 'tavuk şiş', 'adana kebap', 'kuru fasulye', 'pilav'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFoodInput(suggestion)
                          analyzeFoodByName(suggestion)
                        }}
                        disabled={isAnalyzing}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {analysisResult && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-medium mb-3">AI Analiz Sonucu</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Tanımlanan: <span className="font-medium">{analysisResult.recognized_name}</span>
                      {analysisResult.confidence && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          %{Math.round(analysisResult.confidence * 100)} güven
                        </span>
                      )}
                    </p>
                    
                    <div className="space-y-2">
                      {analysisResult.foods.map((food, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <p className="font-medium">{food.name}</p>
                            <p className="text-sm text-gray-500">
                              {food.amount} {food.unit} • {food.calories} kcal
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addAIFoodToSelection(food)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ekle
                          </Button>
                        </div>
                      ))}
                    </div>

                    {analysisResult.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        {analysisResult.notes}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Search className="h-5 w-5 text-green-500" />
                  Veritabanından Yemek Arayın
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
          </TabsContent>
        </Tabs>

        {selectedFoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Seçilen Yemekler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFoods.map((food, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{food.name}</h4>
                      {food.source && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          food.source === 'ai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {food.source === 'ai' ? 'AI Tanımlı' : 'Veritabanı'}
                        </span>
                      )}
                    </div>
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
                      <p><span className="font-medium">{Math.round(food.caloriesPer100g * food.portionSize / 100)}</span> kcal</p>
                      <p>P: {Math.round(food.proteinPer100g * food.portionSize / 100 * 10) / 10}g • K: {Math.round(food.carbsPer100g * food.portionSize / 100 * 10) / 10}g • Y: {Math.round(food.fatPer100g * food.portionSize / 100 * 10) / 10}g</p>
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
