
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, AlertCircle, CheckCircle, Expand, Zap, Droplets } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

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
}

export default function QuickAnalysisResult({ 
  capturedImage,
  mealType = 'öğün',
  onSave, 
  onRetry, 
  loading 
}: QuickAnalysisResultProps) {
  const { toast } = useToast()
  const [detectedFoods, setDetectedFoods] = useState<FoodItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const [suggestions, setSuggestions] = useState<string>('')

  useEffect(() => {
    if (capturedImage && !hasAnalyzed) {
      analyzeImage()
    }
  }, [capturedImage, hasAnalyzed])

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    setError(null)
    
    try {
      console.log('Starting food analysis...')
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          imageUrl: capturedImage,
          mealType: mealType,
          analysisType: 'quick'
        }
      })

      if (error) {
        console.error('Supabase function error:', error)
        throw new Error(error.message)
      }

      console.log('Analysis result:', data)

      if (data.error) {
        throw new Error(data.error)
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

  const handleSave = () => {
    if (detectedFoods.length > 0) {
      onSave(detectedFoods)
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
          <h3 className="text-lg font-semibold text-gray-900">AI Analiz Ediyor...</h3>
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
          <span className="text-sm font-medium text-gray-700">AI Doğruluk Oranı:</span>
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
          <h4 className="font-medium text-blue-800 mb-2">💡 AI Önerileri:</h4>
          <p className="text-sm text-blue-700">{suggestions}</p>
        </div>
      )}

      {/* Low Confidence Warning */}
      {confidence < 0.7 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Dikkat!</span>
          </div>
          <p className="text-sm text-yellow-700">
            AI doğruluk oranı %70'in altında. Sonuçları kontrol etmenizi öneriyoruz.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {detectedFoods.map((food, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      <div className="space-y-3">
        <Button
          onClick={handleSave}
          disabled={loading || detectedFoods.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Devam Et
            </>
          )}
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={analyzeImage}
            variant="outline"
            className="py-3"
            disabled={isAnalyzing}
          >
            🔄 Tekrar Analiz Et
          </Button>
          <Button
            onClick={handleRetry}
            variant="outline"
            className="py-3"
          >
            📷 Yeni Fotoğraf
          </Button>
        </div>
      </div>
    </div>
  )
}
