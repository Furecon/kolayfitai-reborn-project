
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import CameraCapture from './FoodAnalysis/CameraCapture'
import AnalysisTypeSelection from './FoodAnalysis/AnalysisTypeSelection'
import DetailedAnalysisForm from './FoodAnalysis/DetailedAnalysisForm'
import QuickAnalysisResult from './FoodAnalysis/QuickAnalysisResult'
import ManualFoodEntry from './FoodAnalysis/ManualFoodEntry'

interface FoodItem {
  [key: string]: any
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

interface AnalysisResult {
  detectedFoods: FoodItem[]
  confidence: number
  suggestions: string
}

interface DetailedAnalysisData {
  foodSource: 'homemade' | 'packaged' | ''
  hiddenIngredients: string
  noHiddenIngredients: boolean
  cookingMethod: 'boiled' | 'oven' | 'grilled' | 'fried' | 'steamed' | 'raw' | ''
  consumedAmount: string
  mealType: 'single' | 'mixed' | ''
}

type Step = 'capture' | 'analysis-type' | 'quick-result' | 'detailed-form' | 'detailed-result' | 'manual'

interface FoodAnalysisProps {
  onMealAdded: () => void
  onBack: () => void
}

export default function FoodAnalysis({ onMealAdded, onBack }: FoodAnalysisProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // States
  const [currentStep, setCurrentStep] = useState<Step>('capture')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [mealType, setMealType] = useState('öğün')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [saving, setSaving] = useState(false)

  const handleImageCaptured = (imageUrl: string) => {
    console.log('Image captured, moving to analysis type selection')
    setCapturedImage(imageUrl)
    setCurrentStep('analysis-type')
  }

  const handleAnalysisTypeSelected = (type: 'quick' | 'detailed' | 'manual') => {
    console.log('Analysis type selected:', type)
    
    if (type === 'manual') {
      setCurrentStep('manual')
    } else if (type === 'quick') {
      performQuickAnalysis()
    } else if (type === 'detailed') {
      setCurrentStep('detailed-form')
    }
  }

  const performQuickAnalysis = async () => {
    if (!capturedImage) return

    setAnalyzing(true)
    setCurrentStep('quick-result')
    
    try {
      console.log('Starting quick analysis...')
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { 
          imageUrl: capturedImage,
          mealType: mealType,
          analysisType: 'quick'
        }
      })

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)

      console.log('Quick analysis result:', data)
      setAnalysisResult(data)

      if (data.detectedFoods && data.detectedFoods.length > 0) {
        toast({
          title: "Başarılı!",
          description: `${data.detectedFoods.length} yemek tespit edildi.`,
        })
      }
    } catch (error: any) {
      console.error('Quick analysis failed:', error)
      toast({
        title: "Analiz Hatası",
        description: error.message || "Analiz sırasında hata oluştu",
        variant: "destructive"
      })
      setAnalysisResult({
        detectedFoods: [],
        confidence: 0,
        suggestions: "Analiz sırasında hata oluştu. Lütfen tekrar deneyin."
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDetailedAnalysisSubmit = async (formData: DetailedAnalysisData) => {
    if (!capturedImage) return

    setAnalyzing(true)
    setCurrentStep('detailed-result')
    
    try {
      console.log('Starting detailed analysis with form data:', formData)
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { 
          imageUrl: capturedImage,
          mealType: mealType,
          analysisType: 'detailed',
          detailedData: formData
        }
      })

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)

      console.log('Detailed analysis result:', data)
      setAnalysisResult(data)

      toast({
        title: "Detaylı Analiz Tamamlandı!",
        description: "Daha hassas sonuçlar elde edildi."
      })
    } catch (error: any) {
      console.error('Detailed analysis failed:', error)
      toast({
        title: "Analiz Hatası",
        description: error.message || "Detaylı analiz sırasında hata oluştu",
        variant: "destructive"
      })
      setAnalysisResult({
        detectedFoods: [],
        confidence: 0,
        suggestions: "Detaylı analiz sırasında hata oluştu. Lütfen tekrar deneyin."
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const saveMealLog = async (foods: FoodItem[]) => {
    if (!user || foods.length === 0) return

    setSaving(true)
    try {
      const totalNutrition = foods.reduce((acc, food) => ({
        calories: acc.calories + food.totalNutrition.calories,
        protein: acc.protein + food.totalNutrition.protein,
        carbs: acc.carbs + food.totalNutrition.carbs,
        fat: acc.fat + food.totalNutrition.fat,
        fiber: acc.fiber + (food.totalNutrition.fiber || 0),
        sugar: acc.sugar + (food.totalNutrition.sugar || 0),
        sodium: acc.sodium + (food.totalNutrition.sodium || 0)
      }), { 
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 
      })

      console.log('Saving meal log:', { foods, totalNutrition, mealType })

      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_type: mealType,
          food_items: foods as any,
          total_calories: totalNutrition.calories,
          total_protein: totalNutrition.protein,
          total_carbs: totalNutrition.carbs,
          total_fat: totalNutrition.fat,
          total_fiber: totalNutrition.fiber,
          total_sugar: totalNutrition.sugar,
          total_sodium: totalNutrition.sodium,
          photo_url: capturedImage,
          date: new Date().toISOString().split('T')[0]
        })

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: "Öğün kaydedildi."
      })

      onMealAdded()
    } catch (error) {
      console.error('Error saving meal:', error)
      toast({
        title: "Hata",
        description: "Öğün kaydedilirken hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveResults = () => {
    if (analysisResult?.detectedFoods) {
      saveMealLog(analysisResult.detectedFoods)
    }
  }

  const handleRetryAnalysis = () => {
    setAnalysisResult(null)
    setCurrentStep('analysis-type')
  }

  const goBackToCapture = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
    setCurrentStep('capture')
  }

  const goBackToAnalysisType = () => {
    setAnalysisResult(null)
    setCurrentStep('analysis-type')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-4">
        <Button
          variant="ghost"
          onClick={currentStep === 'capture' ? onBack : goBackToCapture}
          className="text-gray-600"
        >
          ← Geri
        </Button>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 my-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-black">
              Yemek Analizi
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Meal Type Selection - Show on all steps except capture */}
            {currentStep !== 'capture' && (
              <div className="space-y-2">
                <Label htmlFor="mealType">Öğün Tipi</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Öğün seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kahvaltı">Kahvaltı</SelectItem>
                    <SelectItem value="öğle">Öğle Yemeği</SelectItem>
                    <SelectItem value="akşam">Akşam Yemeği</SelectItem>
                    <SelectItem value="atıştırmalık">Atıştırmalık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step Content */}
            {currentStep === 'capture' && (
              <CameraCapture
                onImageCaptured={handleImageCaptured}
                onFileUploaded={handleImageCaptured}
              />
            )}

            {currentStep === 'analysis-type' && capturedImage && (
              <AnalysisTypeSelection
                onSelectType={handleAnalysisTypeSelected}
                onBack={goBackToCapture}
                capturedImage={capturedImage}
              />
            )}

            {currentStep === 'detailed-form' && (
              <DetailedAnalysisForm
                onSubmit={handleDetailedAnalysisSubmit}
                onBack={goBackToAnalysisType}
                loading={analyzing}
              />
            )}

            {(currentStep === 'quick-result' || currentStep === 'detailed-result') && (
              <div className="space-y-4">
                {capturedImage && (
                  <div className="relative">
                    <img src={capturedImage} alt="Captured Food" className="rounded-md w-full" />
                    {analyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-sm">Analiz ediliyor...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!analyzing && analysisResult && (
                  <QuickAnalysisResult
                    detectedFoods={analysisResult.detectedFoods}
                    onSave={handleSaveResults}
                    onRetry={handleRetryAnalysis}
                    loading={saving}
                  />
                )}
              </div>
            )}

            {currentStep === 'manual' && (
              <ManualFoodEntry
                mealType={mealType}
                onSave={saveMealLog}
                onBack={goBackToAnalysisType}
                loading={saving}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
