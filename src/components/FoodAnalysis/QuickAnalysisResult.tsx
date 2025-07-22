
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, AlertCircle } from 'lucide-react'

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
          mealType: mealType
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
        setHasAnalyzed(true)
        
        if (data.detectedFoods.length > 0) {
          toast({
            title: "Analiz Tamamlandı!",
            description: `${data.detectedFoods.length} yemek tespit edildi.`,
          })
        } else {
          toast({
            title: "Yemek Tespit Edilemedi",
            description: "Görüntüde net bir yemek bulunamadı.",
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
    onRetry()
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

      <div className="space-y-4">
        {detectedFoods.map((food, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
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
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Protein</p>
                <p className="text-lg font-bold text-blue-700">
                  {food.totalNutrition.protein.toFixed(1)}g
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 font-medium">Karbonhidrat</p>
                <p className="text-lg font-bold text-orange-700">
                  {food.totalNutrition.carbs.toFixed(1)}g
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium">Yağ</p>
                <p className="text-lg font-bold text-red-700">
                  {food.totalNutrition.fat.toFixed(1)}g
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 font-medium">Lif</p>
                <p className="text-lg font-bold text-purple-700">
                  {food.totalNutrition.fiber.toFixed(1)}g
                </p>
              </div>
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
            '✅ Sonuçları Kaydet'
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
