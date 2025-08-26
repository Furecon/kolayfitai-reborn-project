import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Info, 
  Star, 
  Copy, 
  Plus,
  Clock,
  AlertCircle,
  Search,
  Heart
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface ManualFoodEntryProps {
  mealType: string
  onSave?: (foods: any[]) => Promise<void>
  onBack: () => void
  loading?: boolean
  onMealSaved?: () => void
  cameraPermissionDenied?: boolean
}

interface FavoriteMeal {
  id: string
  meal_name: string
  meal_type: string
  recipe: any
  created_at: string
}

interface YesterdayMeal {
  id: string
  meal_type: string
  food_items: any[]
  total_calories: number
  created_at: string
}

interface QuickSuggestion {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  amount_value: number
  amount_unit: string
  source: 'favorite' | 'recent' | 'database'
}

const MEAL_TYPE_OPTIONS = [
  { value: 'kahvaltı', label: 'Kahvaltı' },
  { value: 'öğle', label: 'Öğle Yemeği' },
  { value: 'akşam', label: 'Akşam Yemeği' },
  { value: 'atıştırmalık', label: 'Atıştırmalık' }
]

const COOKING_METHODS = [
  'Haşlama', 'Fırın', 'Izgara', 'Kızartma', 'Buharda', 'Çiğ'
]

const QUICK_PORTIONS = [
  { label: '1 porsiyon', value: 150, unit: 'g' },
  { label: '1/2 porsiyon', value: 75, unit: 'g' },
  { label: '100 g', value: 100, unit: 'g' },
  { label: '150 g', value: 150, unit: 'g' }
]

export default function ManualFoodEntry({ 
  mealType, 
  onSave, 
  onBack, 
  loading = false, 
  onMealSaved,
  cameraPermissionDenied = false
}: ManualFoodEntryProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    mealName: '',
    category: mealType || '',
    portionAmount: '',
    portionUnit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    cookingMethod: '',
    notes: ''
  })

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // UX state
  const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMeal[]>([])
  const [yesterdayMeals, setYesterdayMeals] = useState<YesterdayMeal[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)
  const [loadingYesterday, setLoadingYesterday] = useState(false)

  // Quick search state
  const [searchQuery, setSearchQuery] = useState('')
  const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (user) {
      loadFavoriteMeals()
      loadYesterdayMeals()
    }
  }, [user])

  // Search suggestions when user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchSuggestions(searchQuery.trim())
      } else {
        setQuickSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const loadFavoriteMeals = async () => {
    if (!user) return
    
    setLoadingFavorites(true)
    try {
      const { data, error } = await supabase
        .from('favorite_meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setFavoriteMeals(data || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  const loadYesterdayMeals = async () => {
    if (!user) return

    setLoadingYesterday(true)
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', yesterdayStr)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      
      // Type cast and ensure food_items is an array
      const processedData = data?.map(meal => ({
        ...meal,
        food_items: Array.isArray(meal.food_items) ? meal.food_items : []
      })) || []
      
      setYesterdayMeals(processedData)
    } catch (error) {
      console.error('Error loading yesterday meals:', error)
    } finally {
      setLoadingYesterday(false)
    }
  }

  const searchSuggestions = async (query: string) => {
    if (!user) return

    setIsSearching(true)
    try {
      // Search in favorites
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', `%${query}%`)
        .limit(3)

      // Search in recent meals
      const { data: recentMeals, error: recentError } = await supabase
        .from('meal_logs')
        .select('meal_name, total_calories, total_protein, total_carbs, total_fat, amount_value, amount_unit')
        .eq('user_id', user.id)
        .not('meal_name', 'is', null)
        .ilike('meal_name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(3)

      // Search in foods database
      const { data: foodsData, error: foodsError } = await supabase.rpc('search_foods', { 
        search_term: query 
      })

      if (favError) console.error('Favorites search error:', favError)
      if (recentError) console.error('Recent meals search error:', recentError)
      if (foodsError) console.error('Foods search error:', foodsError)

      const suggestions: QuickSuggestion[] = []

      // Add favorites
      if (favorites) {
        favorites.forEach(fav => {
          suggestions.push({
            id: fav.id,
            name: fav.name,
            calories: fav.default_calories,
            protein: fav.default_protein || 0,
            carbs: fav.default_carbs || 0,
            fat: fav.default_fat || 0,
            amount_value: fav.default_amount_value || 100,
            amount_unit: fav.default_amount_unit || 'g',
            source: 'favorite'
          })
        })
      }

      // Add recent meals
      if (recentMeals) {
        recentMeals.forEach(meal => {
          if (meal.meal_name) {
            suggestions.push({
              id: `recent-${meal.meal_name}`,
              name: meal.meal_name,
              calories: meal.total_calories || 0,
              protein: meal.total_protein || 0,
              carbs: meal.total_carbs || 0,
              fat: meal.total_fat || 0,
              amount_value: meal.amount_value || 100,
              amount_unit: meal.amount_unit || 'g',
              source: 'recent'
            })
          }
        })
      }

      // Add foods database results
      if (foodsData) {
        foodsData.slice(0, 2).forEach(food => {
          suggestions.push({
            id: `food-${food.id}`,
            name: food.name,
            calories: food.calories_per_100g,
            protein: food.protein_per_100g || 0,
            carbs: food.carbs_per_100g || 0,
            fat: food.fat_per_100g || 0,
            amount_value: 100,
            amount_unit: 'g',
            source: 'database'
          })
        })
      }

      setQuickSuggestions(suggestions.slice(0, 8)) // Limit to 8 suggestions
      setShowSuggestions(suggestions.length > 0)
    } catch (error) {
      console.error('Error searching suggestions:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // If updating meal name, trigger search
    if (field === 'mealName') {
      setSearchQuery(value)
    }
  }

  const selectSuggestion = (suggestion: QuickSuggestion) => {
    setFormData(prev => ({
      ...prev,
      mealName: suggestion.name,
      calories: suggestion.calories.toString(),
      protein: suggestion.protein.toString(),
      carbs: suggestion.carbs.toString(),
      fat: suggestion.fat.toString(),
      portionAmount: suggestion.amount_value.toString(),
      portionUnit: suggestion.amount_unit
    }))
    
    setSearchQuery('')
    setShowSuggestions(false)
    
    toast({
      title: "Seçildi",
      description: `${suggestion.name} bilgileri forma aktarıldı.`,
    })
  }

  const handleQuickPortion = (portion: typeof QUICK_PORTIONS[0]) => {
    setFormData(prev => ({
      ...prev,
      portionAmount: portion.value.toString(),
      portionUnit: portion.unit
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz Dosya",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `meal-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(filePath)

      setPhotoUrl(publicUrl)
      toast({
        title: "Başarılı!",
        description: "Fotoğraf yüklendi.",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenirken hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyFavoriteMeal = (meal: FavoriteMeal) => {
    const recipe = meal.recipe
    setFormData({
      mealName: meal.meal_name,
      category: meal.meal_type,
      portionAmount: recipe.portion_amount?.toString() || '',
      portionUnit: recipe.portion_unit || 'g',
      calories: recipe.calories?.toString() || '',
      protein: recipe.protein?.toString() || '',
      carbs: recipe.carbs?.toString() || '',
      fat: recipe.fat?.toString() || '',
      cookingMethod: recipe.cooking_method || '',
      notes: recipe.notes || ''
    })
    toast({
      title: "Kopyalandı",
      description: "Favori öğün bilgileri forma kopyalandı.",
    })
  }

  const copyYesterdayMeal = (meal: YesterdayMeal) => {
    if (meal.food_items.length > 0) {
      const firstItem = meal.food_items[0]
      setFormData({
        mealName: firstItem.name || 'Dünkü Öğün',
        category: meal.meal_type,
        portionAmount: firstItem.estimatedAmount?.replace(/[^\d]/g, '') || '',
        portionUnit: 'g',
        calories: Math.round(meal.total_calories).toString(),
        protein: firstItem.totalNutrition?.protein?.toString() || '',
        carbs: firstItem.totalNutrition?.carbs?.toString() || '',
        fat: firstItem.totalNutrition?.fat?.toString() || '',
        cookingMethod: '',
        notes: 'Dünkü öğünden kopyalandı'
      })
      toast({
        title: "Kopyalandı",
        description: "Dünkü öğün bilgileri forma kopyalandı.",
      })
    }
  }

  const validateForm = () => {
    if (!formData.mealName.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Öğün adı zorunludur.",
        variant: "destructive"
      })
      return false
    }

    if (!formData.category) {
      toast({
        title: "Eksik Bilgi", 
        description: "Kategori seçimi zorunludur.",
        variant: "destructive"
      })
      return false
    }

    if (!formData.calories || isNaN(Number(formData.calories))) {
      toast({
        title: "Eksik Bilgi",
        description: "Geçerli bir kalori değeri giriniz.",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || !user) return

    setIsSaving(true)
    try {
      const foodItem = {
        name: formData.mealName,
        nameEn: '',
        estimatedAmount: `${formData.portionAmount} ${formData.portionUnit}`,
        nutritionPer100g: {
          calories: Math.round((Number(formData.calories) / Number(formData.portionAmount || 100)) * 100),
          protein: Number(formData.protein) || 0,
          carbs: Number(formData.carbs) || 0,
          fat: Number(formData.fat) || 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        totalNutrition: {
          calories: Number(formData.calories),
          protein: Number(formData.protein) || 0,
          carbs: Number(formData.carbs) || 0,
          fat: Number(formData.fat) || 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        cookingMethod: formData.cookingMethod,
        notes: formData.notes
      }

      const mealLogData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        meal_type: formData.category,
        food_items: [foodItem],
        total_calories: Number(formData.calories),
        total_protein: Number(formData.protein) || 0,
        total_carbs: Number(formData.carbs) || 0,
        total_fat: Number(formData.fat) || 0,
        total_fiber: 0,
        total_sugar: 0,
        total_sodium: 0,
        photo_url: photoUrl,
        notes: formData.notes
      }

      const { error } = await supabase
        .from('meal_logs')
        .insert([mealLogData])

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: "Öğün başarıyla kaydedildi ve günlük toplamlar güncellendi.",
      })

      // Reset form
      setFormData({
        mealName: '',
        category: mealType || '',
        portionAmount: '',
        portionUnit: 'g',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        cookingMethod: '',
        notes: ''
      })
      setPhotoUrl(null)

      // Trigger refresh if callback provided
      if (onMealSaved) {
        onMealSaved()
      }

      // Call onSave if provided (for compatibility)
      if (onSave) {
        await onSave([foodItem])
      }

    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Hata",
        description: "Öğün kaydedilirken hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const saveToFavorites = async () => {
    if (!user || !formData.mealName || !formData.calories) {
      toast({
        title: "Eksik Bilgi",
        description: "Favorilere kaydetmek için öğün adı ve kalori bilgisi gerekli.",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          name: formData.mealName,
          default_calories: Number(formData.calories),
          default_protein: Number(formData.protein) || 0,
          default_carbs: Number(formData.carbs) || 0,
          default_fat: Number(formData.fat) || 0,
          default_amount_value: Number(formData.portionAmount) || 100,
          default_amount_unit: formData.portionUnit,
          default_cooking_method: formData.cookingMethod
        }])

      if (error) throw error

      toast({
        title: "Favorilere Eklendi",
        description: `${formData.mealName} favorilerinize eklendi.`,
      })

      // Refresh favorites
      loadFavoriteMeals()
    } catch (error) {
      console.error('Save to favorites error:', error)
      toast({
        title: "Hata",
        description: "Favorilere eklenirken hata oluştu.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-foreground">Manuel Öğün Girişi</h1>
          <Badge variant="secondary">{mealType}</Badge>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {cameraPermissionDenied 
              ? "Kamera iznini sonradan Ayarlar'dan açabilirsiniz. Bu arada manuel ekleme yapabilirsiniz."
              : "Fotoğraf eklemek zorunlu değildir. İsterseniz direkt bilgileri kaydedebilirsiniz."
            }
          </AlertDescription>
        </Alert>

        {/* Favorites Section */}
        {favoriteMeals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                Sık Kullanılanlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {favoriteMeals.map((meal) => (
                  <Button
                    key={meal.id}
                    variant="outline"
                    size="sm"
                    onClick={() => copyFavoriteMeal(meal)}
                    disabled={loadingFavorites}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {meal.meal_name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Yesterday's Meals */}
        {yesterdayMeals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Copy className="h-4 w-4 text-blue-500" />
                Dünkü Öğünleriniz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {yesterdayMeals.map((meal) => (
                  <Button
                    key={meal.id}
                    variant="outline"
                    size="sm"
                    onClick={() => copyYesterdayMeal(meal)}
                    disabled={loadingYesterday}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {meal.meal_type} ({Math.round(meal.total_calories)} kcal)
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Upload - Optional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fotoğraf Ekle (Opsiyonel)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photoUrl ? (
              <div className="space-y-2">
                <img src={photoUrl} alt="Meal" className="w-full h-48 object-cover rounded-md" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhotoUrl(null)}
                >
                  Fotoğrafı Kaldır
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-success mr-2"></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Fotoğraf Seç
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Öğün Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Search */}
            <div className="space-y-2">
              <Label htmlFor="quickSearch">
                <Search className="h-4 w-4 inline mr-1" />
                Hızlı Arama
              </Label>
              <div className="relative">
                <Input
                  id="quickSearch"
                  placeholder="Öğün ara ve hızlı doldur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(quickSuggestions.length > 0)}
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-success"></div>
                  </div>
                )}
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {quickSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{suggestion.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {suggestion.calories} kcal • {suggestion.amount_value}{suggestion.amount_unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {suggestion.source === 'favorite' && (
                              <Star className="h-3 w-3 text-yellow-500" />
                            )}
                            {suggestion.source === 'recent' && (
                              <Clock className="h-3 w-3 text-blue-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {suggestion.source === 'favorite' ? 'Favori' : 
                               suggestion.source === 'recent' ? 'Son' : 'DB'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Meal Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="mealName">
                Öğün Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mealName"
                placeholder="Örn: Tavuk Döner, Mercimek Çorbası"
                value={formData.mealName}
                onChange={(e) => handleInputChange('mealName', e.target.value)}
              />
            </div>

            {/* Category - Required */}
            <div className="space-y-2">
              <Label>
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Öğün kategorisi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Portion Size */}
            <div className="space-y-2">
              <Label>Miktar</Label>
              
              {/* Quick Options */}
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_PORTIONS.map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPortion(option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Manual Input */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Miktar"
                  value={formData.portionAmount}
                  onChange={(e) => handleInputChange('portionAmount', e.target.value)}
                  className="flex-1"
                />
                <Select value={formData.portionUnit} onValueChange={(value) => handleInputChange('portionUnit', value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">gram</SelectItem>
                    <SelectItem value="porsiyon">porsiyon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Calories - Required */}
            <div className="space-y-2">
              <Label htmlFor="calories">
                Kalori (kcal) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="calories"
                type="number"
                placeholder="Örn: 350"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
              />
            </div>

            {/* Macros - Optional */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="0"
                  value={formData.protein}
                  onChange={(e) => handleInputChange('protein', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Karbonhidrat (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={(e) => handleInputChange('carbs', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Yağ (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="0"
                  value={formData.fat}
                  onChange={(e) => handleInputChange('fat', e.target.value)}
                />
              </div>
            </div>

            {/* Cooking Method - Optional */}
            <div className="space-y-2">
              <Label>Pişirme Yöntemi (Opsiyonel)</Label>
              <Select value={formData.cookingMethod} onValueChange={(value) => handleInputChange('cookingMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pişirme yöntemi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {COOKING_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes - Optional */}
            <div className="space-y-2">
              <Label htmlFor="notes">Not/Etiket (Opsiyonel)</Label>
              <Textarea
                id="notes"
                placeholder="Örn: Az tuzlu, evde yapılan..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSaving || loading}
            className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            size="lg"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-success-foreground mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              'Öğünü Kaydet'
            )}
          </Button>
          
          {formData.mealName && formData.calories && (
            <Button
              onClick={saveToFavorites}
              variant="outline"
              size="lg"
              className="border-success text-success hover:bg-success-muted"
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}