
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader as Loader2, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Expand, Zap, Droplets, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/components/Auth/AuthProvider'
import { updateWaterFromFood } from '@/lib/waterCalculation'

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

interface QuickAnalysisResultProps {
  capturedImage: string
  mealType?: string
  onSave: (foods: FoodItem[]) => void
  onRetry: () => void
  loading?: boolean
  analysisType?: 'quick' | 'detailed'
  detailsData?: any
  onUpgradeClick?: () => void
}

export default function QuickAnalysisResult({
  capturedImage,
  mealType = 'öğün',
  onSave,
  onRetry,
  loading,
  analysisType = 'quick',
  detailsData,
  onUpgradeClick
}: QuickAnalysisResultProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [detectedFoods, setDetectedFoods] = useState<FoodItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const [suggestions, setSuggestions] = useState<string>('')
  const [selectedMealType, setSelectedMealType] = useState<string>('snack')
  const [isSaving, setIsSaving] = useState(false)
  const [showHelp, setShowHelp] = useState<boolean | null>(null)
  const [isLoadingHelpPreference, setIsLoadingHelpPreference] = useState(true)

  useEffect(() => {
    if (capturedImage && !hasAnalyzed) {
      analyzeImage()
    }
  }, [capturedImage, hasAnalyzed])

  // Load help preference from user profile
  useEffect(() => {
    const loadHelpPreference = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('show_analysis_help')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error loading help preference:', error)
          setShowHelp(true) // Default to showing help
        } else {
          setShowHelp(data?.show_analysis_help ?? true)
        }
      } catch (error) {
        console.error('Error loading help preference:', error)
        setShowHelp(true)
      } finally {
        setIsLoadingHelpPreference(false)
      }
    }

    loadHelpPreference()
  }, [user?.id])

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('Starting food analysis...')

      console.log('Calling API for food analysis...')

      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Validate image size before sending
      const imageSizeKB = Math.round(capturedImage.length / 1024)
      console.log('Image size to send:', imageSizeKB, 'KB')

      if (imageSizeKB > 500) {
        console.warn('Image too large, may cause issues:', imageSizeKB, 'KB')
      }

      // Prepare request body
      const requestBody = {
        imageUrl: capturedImage,
        mealType: mealType,
        analysisType: analysisType,
        detailsData: detailsData
      }

      console.log('Preparing to send request...')
      console.log('Request body size:', JSON.stringify(requestBody).length, 'chars')

      // Use fetch directly with proper timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error('Request timeout after 90 seconds')
        controller.abort()
      }, 90000) // 90 second timeout

      // Use hardcoded values as fallback for mobile builds
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://acsqneuzkukmvtfmbphb.supabase.co'
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3FuZXV6a3VrbXZ0Zm1icGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTc3MzQsImV4cCI6MjA2ODIzMzczNH0.YPi7bwjLsvEzqa8tBH05DU3yN0yPSH-qHNnEqKI2BR8'

      const apiUrl = `${supabaseUrl}/functions/v1/analyze-food`
      console.log('Sending request to:', apiUrl)
      console.log('Using Supabase URL:', supabaseUrl)
      console.log('Auth token present:', !!session.access_token)
      console.log('Anon key present:', !!supabaseAnonKey)

      let response
      try {
        response = await fetch(
          apiUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': supabaseAnonKey
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          }
        )
      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.error('Fetch error:', fetchError)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.')
        }
        throw new Error(`Ağ hatası: ${fetchError instanceof Error ? fetchError.message : 'Bilinmeyen hata'}`)
      }

      clearTimeout(timeoutId)
      console.log('Response received, status:', response.status)

      if (!response.ok) {
        console.error('Response not OK, status:', response.status)
        let errorText = 'No error text'
        try {
          errorText = await response.text()
          console.error('Edge function error response:', errorText)
        } catch (readError) {
          console.error('Could not read error response:', readError)
        }
        throw new Error(`İstek başarısız: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      // Parse response with better error handling
      let data
      let responseText = ''
      try {
        console.log('Reading response text...')
        responseText = await response.text()
        console.log('Response status:', response.status)
        console.log('Response content-type:', response.headers.get('content-type'))
        console.log('Response text length:', responseText.length)

        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Sunucu boş yanıt döndürdü')
        }

        console.log('Raw response (first 500 chars):', responseText.substring(0, 500))
        console.log('Raw response (last 100 chars):', responseText.substring(Math.max(0, responseText.length - 100)))

        console.log('Parsing JSON...')
        data = JSON.parse(responseText)
        console.log('JSON parsed successfully')
      } catch (parseError) {
        console.error('Failed to parse response')
        console.error('Parse error type:', parseError instanceof Error ? parseError.name : typeof parseError)
        console.error('Parse error message:', parseError instanceof Error ? parseError.message : String(parseError))

        if (responseText) {
          console.error('Response text sample:', responseText.substring(0, 200))
        }

        throw new Error(`Sunucudan geçersiz yanıt alındı. ${parseError instanceof Error ? parseError.message : 'JSON parse hatası'}`)
      }

      console.log('Analysis result:', data)

      if (data.error) {
        // Show user-friendly error messages from backend
        if (data.message) {
          toast({
            title: "Analiz Hatası",
            description: data.message,
            variant: "destructive"
          })
        }
        throw new Error(data.message || data.error)
      }

      if (data.detectedFoods && Array.isArray(data.detectedFoods)) {
        setDetectedFoods(data.detectedFoods)
        setConfidence(data.confidence || 0)
        setSuggestions(data.suggestions || '')
        setHasAnalyzed(true)

        if (data.detectedFoods.length > 0) {
          toast({
            title: "Analiz Tamamlandı!",
            description: `${data.detectedFoods.length} yemek tespit edildi. Doğruluk oranı: %${Math.round((data.confidence || 0) * 100)}`,
          })
        } else {
          toast({
            title: "Yemek Tespit Edilemedi",
            description: "Görüntüde net bir yemek bulunamadı. Lütfen daha net bir fotoğraf çekin.",
            variant: "destructive"
          })
        }
      } else {
        throw new Error('Geçersiz analiz sonucu')
      }

    } catch (error: any) {
      console.error('Analysis error:', error)
      setError(error.message || 'Analiz sırasında hata oluştu')
      toast({
        title: "Analiz Hatası",
        description: error.message || "Fotoğraf analiz edilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveMeal = async () => {
    if (detectedFoods.length === 0) return

    setIsSaving(true)
    try {
      const totalNutrition = detectedFoods.reduce((total, food) => ({
        totalCalories: total.totalCalories + (food.totalNutrition?.calories || 0),
        totalProtein: total.totalProtein + (food.totalNutrition?.protein || 0),
        totalCarbs: total.totalCarbs + (food.totalNutrition?.carbs || 0),
        totalFat: total.totalFat + (food.totalNutrition?.fat || 0),
        totalFiber: total.totalFiber + (food.totalNutrition?.fiber || 0),
        totalSugar: total.totalSugar + (food.totalNutrition?.sugar || 0),
        totalSodium: total.totalSodium + (food.totalNutrition?.sodium || 0)
      }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalSugar: 0, totalSodium: 0 })

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const mealData = {
        user_id: user.id,
        meal_type: selectedMealType,
        food_items: detectedFoods.map(food => ({
          name: food.name,
          nameEn: food.nameEn || food.name,
          estimatedAmount: food.estimatedAmount,
          nutritionPer100g: food.nutritionPer100g,
          totalNutrition: food.totalNutrition
        })),
        total_calories: totalNutrition.totalCalories,
        total_protein: totalNutrition.totalProtein,
        total_carbs: totalNutrition.totalCarbs,
        total_fat: totalNutrition.totalFat,
        total_fiber: totalNutrition.totalFiber,
        total_sugar: totalNutrition.totalSugar,
        total_sodium: totalNutrition.totalSodium,
        photo_url: capturedImage,
        date: new Date().toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('meal_logs')
        .insert([mealData])

      if (error) {
        console.error('Error saving meal:', error)
        throw error
      }

      // Update water intake from food items
      for (const food of detectedFoods) {
        const portionMatch = food.estimatedAmount.match(/(\d+)/);
        const portionGrams = portionMatch ? parseInt(portionMatch[0]) : 100;
        await updateWaterFromFood(supabase, user.id, food.name, portionGrams);
      }

      toast({
        title: "Başarılı!",
        description: "Öğün kaydedildi."
      })

      // Call the original onSave callback to trigger parent component updates
      onSave(detectedFoods)
    } catch (error) {
      console.error('Failed to save meal:', error)
      toast({
        title: "Hata",
        description: "Öğün kaydedilirken hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = () => {
    setHasAnalyzed(false)
    setDetectedFoods([])
    setError(null)
    setConfidence(0)
    setSuggestions('')
    onRetry()
  }

  const handleDismissHelp = async () => {
    if (!user?.id) return

    try {
      setShowHelp(false)

      const { error } = await supabase
        .from('profiles')
        .update({ show_analysis_help: false })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving help preference:', error)
      }
    } catch (error) {
      console.error('Error dismissing help:', error)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Yüksek Doğruluk'
    if (confidence >= 0.6) return 'Orta Doğruluk'
    return 'Düşük Doğruluk'
  }

  const getNutritionIcon = (type: string) => {
    switch (type) {
      case 'calories': return '🔥'
      case 'protein': return '🥩'
      case 'carbs': return '🍞'
      case 'fat': return '🥑'
      case 'fiber': return '🌾'
      case 'sugar': return '🍯'
      case 'sodium': return '🧂'
      default: return '📊'
    }
  }

  const getNutritionColor = (type: string) => {
    switch (type) {
      case 'calories': return 'bg-red-50 text-red-700'
      case 'protein': return 'bg-blue-50 text-blue-700'
      case 'carbs': return 'bg-orange-50 text-orange-700'
      case 'fat': return 'bg-green-50 text-green-700'
      case 'fiber': return 'bg-purple-50 text-purple-700'
      case 'sugar': return 'bg-yellow-50 text-yellow-700'
      case 'sodium': return 'bg-gray-50 text-gray-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const getNutritionUnit = (type: string) => {
    switch (type) {
      case 'calories': return 'kcal'
      case 'sodium': return 'mg'
      default: return 'g'
    }
  }

  if (isAnalyzing) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ai Analiz Ediyor...</h3>
          <p className="text-gray-600">Fotoğrafınızdaki yemekler tanınıyor</p>
        </div>
      </div>
    )
  }

  if (error && !detectedFoods.length) {
    return (
      <div className="text-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analiz Hatası</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={analyzeImage}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Tekrar Analiz Et
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full"
            >
              Yeni Fotoğraf Çek
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (detectedFoods.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Yemek Tespit Edilemedi</h3>
          <p className="text-gray-600 mb-4">
            Fotoğrafta net bir yemek görüntüsü bulunamadı. 
            Lütfen yemeği daha net bir şekilde çekmeyi deneyin.
          </p>
          <div className="space-y-2">
            <Button
              onClick={handleRetry}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Yeni Fotoğraf Çek
            </Button>
            <Button
              onClick={analyzeImage}
              variant="outline"
              className="w-full"
            >
              Tekrar Analiz Et
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎉 Analiz Tamamlandı!
        </h3>
        <p className="text-gray-600">
          {detectedFoods.length} yemek tespit edildi
        </p>
      </div>

      {/* Captured Image Display */}
      {capturedImage && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">📸 Çekilen Fotoğraf</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Expand className="h-4 w-4 mr-1" />
                  Büyüt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <img 
                  src={capturedImage} 
                  alt="Çekilen yemek fotoğrafı"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Çekilen yemek fotoğrafı"
              className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            />
          </div>
        </div>
      )}

      {/* Confidence Score */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Ai Doğruluk Oranı:</span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
              %{Math.round(confidence * 100)}
            </span>
            <span className={`text-xs ${getConfidenceColor(confidence)}`}>
              {getConfidenceText(confidence)}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              confidence >= 0.8 ? 'bg-green-500' : 
              confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 Ai Önerileri:</h4>
          <p className="text-sm text-blue-700">{suggestions}</p>
        </div>
      )}

      {/* Usage Help Card */}
      {showHelp && !isLoadingHelpPreference && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900">💡 Kullanım İpuçları</h4>
            <button
              onClick={handleDismissHelp}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Bir daha gösterme
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• <strong>Öğün seçimi:</strong> Aşağıda hangi öğüne kaydedeceğinizi seçin (Kahvaltı, Öğle, Akşam, Atıştırmalık, İçecek).</p>
            <p>• <strong>Kaydetme:</strong> Tüm değişiklikleri yaptıktan sonra "Öğünü Kaydet" butonuna basın.</p>
            <p>• <strong>Yanlış tanıma:</strong> Yemek yanlış hesaplandıysa, "Yeni Fotoğraf" butonuna basıp "Detaylı Analiz" seçeneğini kullanın.</p>
          </div>
        </div>
      )}

      {/* Low Confidence or Wrong Detection Warning */}
      {confidence < 0.7 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Doğruluk Oranı Düşük</span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            AI doğruluk oranı %70'in altında. Yemek yanlış tanımlanmış veya hesaplamalar yanlış olabilir.
          </p>
          <div className="bg-white rounded-md p-3 border border-yellow-200">
            <p className="text-xs font-medium text-gray-900 mb-1">💡 Çözüm:</p>
            <p className="text-xs text-gray-700">
              Daha doğru sonuçlar için <strong>"Yeni Fotoğraf"</strong> butonuna basıp <strong>"Detaylı Analiz"</strong> seçeneğini kullanın.
              Yemeğin içinde yapay zekanın doğrudan göremeyeceği bilgileri (malzemeler, marka, porsiyon vb.) yazabilirsiniz.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {detectedFoods.map((food, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{food.name}</h4>
                <p className="text-sm text-gray-500">{food.estimatedAmount}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  {Math.round(food.totalNutrition.calories)} kcal
                </p>
              </div>
            </div>

            {/* Detailed Nutrition Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {Object.entries(food.totalNutrition).map(([key, value]) => {
                if (key === 'calories') return null // Already shown above
                return (
                  <div key={key} className={`rounded-lg p-3 ${getNutritionColor(key)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getNutritionIcon(key)}</span>
                      <p className="text-xs font-medium capitalize">
                        {key === 'carbs' ? 'Karbonhidrat' : 
                         key === 'protein' ? 'Protein' :
                         key === 'fat' ? 'Yağ' :
                         key === 'fiber' ? 'Lif' :
                         key === 'sugar' ? 'Şeker' :
                         key === 'sodium' ? 'Sodyum' : key}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      {typeof value === 'number' ? 
                        (key === 'sodium' ? Math.round(value) : value.toFixed(1)) : 
                        value
                      }{getNutritionUnit(key)}
                    </p>
                  </div>
                )
              })}
            </div>

          </div>
        ))}
      </div>

      {/* Info box about detailed analysis */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">
              Yemek yanlış hesaplandı mı veya tanımlandı mı?
            </p>
            <p className="text-xs text-blue-800">
              Daha doğru sonuçlar için <strong>"Yeni Fotoğraf"</strong> butonuna basıp <strong>"Detaylı Analiz"</strong> seçeneğini kullanın.
              Detaylı analizde yemeğin ismini, malzemelerini, markasını ve porsiyon bilgilerini yazabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Meal Type Selection */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-center">
          Bu analizi hangi öğüne kaydetmek istiyorsunuz?
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { value: 'breakfast', label: 'Kahvaltı', emoji: '🌅' },
            { value: 'lunch', label: 'Öğle Yemeği', emoji: '☀️' },
            { value: 'dinner', label: 'Akşam Yemeği', emoji: '🌙' },
            { value: 'snack', label: 'Atıştırmalık', emoji: '🍎' },
            { value: 'drink', label: 'İçecek', emoji: '🥤' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedMealType(option.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedMealType === option.value
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleSaveMeal}
          disabled={isSaving || detectedFoods.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-semibold"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Öğünü Kaydet
            </>
          )}
        </Button>

        <Button
          onClick={handleRetry}
          variant="outline"
          className="w-full py-3"
        >
          📷 Yeni Fotoğraf
        </Button>
      </div>
    </div>
  )
}
