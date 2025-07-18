import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Camera, Edit3, Check, X, ArrowLeft } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from './Auth/AuthProvider'
import AnalysisTypeSelection from './FoodAnalysis/AnalysisTypeSelection'
import DetailedAnalysisForm from './FoodAnalysis/DetailedAnalysisForm'
import MealTypeSelection from './FoodAnalysis/MealTypeSelection'
import ManualFoodEntry from './FoodAnalysis/ManualFoodEntry'
import AIVerification from './FoodAnalysis/AIVerification'

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

interface AnalysisResult {
  detectedFoods: any[]
  analysisType: 'quick' | 'detailed' | 'manual'
  detailedData: any
  confidenceScores: {
    overall: number
    individual: { name: string; confidence: number }[]
  }
  nutritionalAnalysis: {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    foodItems: FoodItem[]
  }
  aiSuggestions: string
  requiresManualReview: boolean
  processingTimeMs: number
}

interface FoodAnalysisProps {
  onMealAdded?: () => void
  onBack?: () => void
}

type Screen = 'capture' | 'analysisType' | 'detailedForm' | 'manualEntry' | 'analyzing' | 'aiVerification' | 'results' | 'editResults' | 'mealType' | 'saving'

export default function FoodAnalysis({ onMealAdded, onBack }: FoodAnalysisProps) {
  const { user } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('capture')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [editingFoods, setEditingFoods] = useState<FoodItem[]>([])
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'quick' | 'detailed' | 'manual'>('quick')
  const [detailedFormData, setDetailedFormData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [manualFoods, setManualFoods] = useState<FoodItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageCapture = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        const base64Data = base64.split(',')[1]
        setCapturedImage(base64)
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const analyzeFood = async (imageBase64: string, analysisType: 'quick' | 'detailed', detailedData?: any) => {
    setCurrentScreen('analyzing')
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          imageBase64,
          analysisType,
          detailedData
        }
      })

      if (error) throw error

      // Check if AI analysis failed and fallback to manual is suggested
      if (data.fallbackToManual) {
        toast({
          title: "AI Analiz Hatası",
          description: data.message || "AI analizi başarısız oldu. Manuel giriş yapabilirsiniz.",
          variant: "destructive"
        })
        setCurrentScreen('manualEntry')
        setIsLoading(false)
        return
      }

      setAnalysisResult(data)
      
      // Always show verification screen first
      setCurrentScreen('aiVerification')
      setIsLoading(false)
      
    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        title: "Analiz Hatası",
        description: "Yemek analizi sırasında hata oluştu. Manuel giriş yapmayı deneyin.",
        variant: "destructive"
      })
      setCurrentScreen('manualEntry')
      setIsLoading(false)
    }
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

    try {
      const imageBase64 = await handleImageCapture(file)
      setCurrentScreen('analysisType')
    } catch (error) {
      toast({
        title: "Dosya Hatası",
        description: "Resim yüklenirken hata oluştu.",
        variant: "destructive"
      })
    }
  }

  const handleCameraCapture = () => {
    fileInputRef.current?.click()
  }

  const handleAnalysisTypeSelection = async (type: 'quick' | 'detailed' | 'manual') => {
    setSelectedAnalysisType(type)
    
    if (type === 'manual') {
      setCurrentScreen('manualEntry')
    } else if (type === 'quick') {
      const imageBase64 = capturedImage?.split(',')[1]
      if (imageBase64) {
        await analyzeFood(imageBase64, 'quick')
      }
    } else {
      setCurrentScreen('detailedForm')
    }
  }

  const handleDetailedFormSubmit = async (formData: any) => {
    setDetailedFormData(formData)
    const imageBase64 = capturedImage?.split(',')[1]
    if (imageBase64) {
      await analyzeFood(imageBase64, 'detailed', formData)
    }
  }

  const handleManualFoodEntry = (foods: FoodItem[]) => {
    setManualFoods(foods)
    
    // Create mock analysis result from manual foods
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)
    const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0)
    const totalCarbs = foods.reduce((sum, food) => sum + food.carbs, 0)
    const totalFat = foods.reduce((sum, food) => sum + food.fat, 0)

    const mockAnalysisResult: AnalysisResult = {
      detectedFoods: [],
      analysisType: 'manual' as any,
      detailedData: null,
      confidenceScores: {
        overall: 1.0,
        individual: foods.map(food => ({ name: food.name, confidence: 1.0 }))
      },
      nutritionalAnalysis: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        foodItems: foods
      },
      aiSuggestions: 'Manuel giriş yapıldı.',
      requiresManualReview: false,
      processingTimeMs: 0
    }

    setAnalysisResult(mockAnalysisResult)
    setCurrentScreen('results')
  }

  const handleAIVerificationConfirm = () => {
    setCurrentScreen('results')
  }

  const handleAIVerificationEdit = () => {
    if (analysisResult) {
      setEditingFoods(analysisResult.nutritionalAnalysis.foodItems)
      setCurrentScreen('editResults')
    }
  }

  const handleAIVerificationManualEntry = () => {
    setCurrentScreen('manualEntry')
  }

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const updated = [...editingFoods]
    updated[index] = { ...updated[index], [field]: value }
    setEditingFoods(updated)
  }

  const recalculateNutrition = () => {
    const totalCalories = editingFoods.reduce((sum, food) => sum + food.calories, 0)
    const totalProtein = editingFoods.reduce((sum, food) => sum + food.protein, 0)
    const totalCarbs = editingFoods.reduce((sum, food) => sum + food.carbs, 0)
    const totalFat = editingFoods.reduce((sum, food) => sum + food.fat, 0)

    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        nutritionalAnalysis: {
          ...analysisResult.nutritionalAnalysis,
          totalCalories: Math.round(totalCalories),
          totalProtein: Math.round(totalProtein * 10) / 10,
          totalCarbs: Math.round(totalCarbs * 10) / 10,
          totalFat: Math.round(totalFat * 10) / 10,
          foodItems: editingFoods
        },
        requiresManualReview: false
      })
    }
    setCurrentScreen('results')
    toast({
      title: "Güncellendi!",
      description: "Besin değerleri başarıyla güncellendi."
    })
  }

  const handleMealTypeSave = async (mealType: string) => {
    if (!analysisResult || !user) return

    setCurrentScreen('saving')
    setIsLoading(true)
    try {
      // Upload image to storage if exists
      let photoUrl = null
      if (capturedImage) {
        const fileName = `meal-${Date.now()}.jpg`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('meal-photos')
          .upload(fileName, dataURItoBlob(capturedImage), {
            contentType: 'image/jpeg'
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('meal-photos')
            .getPublicUrl(uploadData.path)
          photoUrl = urlData.publicUrl
        }
      }

      // Convert FoodItem[] to Json format
      const foodItemsJson = JSON.parse(JSON.stringify(analysisResult.nutritionalAnalysis.foodItems))

      // Save meal log
      const { data: mealData, error: mealError } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_type: mealType,
          food_items: foodItemsJson,
          total_calories: analysisResult.nutritionalAnalysis.totalCalories,
          total_protein: analysisResult.nutritionalAnalysis.totalProtein,
          total_carbs: analysisResult.nutritionalAnalysis.totalCarbs,
          total_fat: analysisResult.nutritionalAnalysis.totalFat,
          photo_url: photoUrl,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (mealError) throw mealError

      // Save AI analysis with proper Json formatting
      if (mealData) {
        const nutritionalAnalysisJson = {
          totalCalories: analysisResult.nutritionalAnalysis.totalCalories,
          totalProtein: analysisResult.nutritionalAnalysis.totalProtein,
          totalCarbs: analysisResult.nutritionalAnalysis.totalCarbs,
          totalFat: analysisResult.nutritionalAnalysis.totalFat,
          foodItems: foodItemsJson
        }

        await supabase
          .from('ai_analysis')
          .insert({
            meal_log_id: mealData.id,
            detected_foods: JSON.parse(JSON.stringify(analysisResult.detectedFoods)),
            confidence_scores: JSON.parse(JSON.stringify(analysisResult.confidenceScores)),
            nutritional_analysis: nutritionalAnalysisJson,
            ai_suggestions: analysisResult.aiSuggestions,
            requires_manual_review: analysisResult.requiresManualReview,
            processing_time_ms: analysisResult.processingTimeMs
          })
      }

      toast({
        title: "Başarılı!",
        description: "Öğün başarıyla kaydedildi."
      })

      // Reset form
      setAnalysisResult(null)
      setCapturedImage(null)
      setCurrentScreen('capture')
      setEditingFoods([])
      setDetailedFormData(null)
      setIsLoading(false)

      if (onMealAdded) {
        onMealAdded()
      }

    } catch (error) {
      console.error('Save meal error:', error)
      setCurrentScreen('results')
      setIsLoading(false)
      toast({
        title: "Kayıt Hatası",
        description: "Öğün kaydedilirken hata oluştu.",
        variant: "destructive"
      })
    }
  }

  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1])
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeString })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const resetToCapture = () => {
    setCurrentScreen('capture')
    setAnalysisResult(null)
    setCapturedImage(null)
    setEditingFoods([])
    setDetailedFormData(null)
    setIsLoading(false)
  }

  // Screen routing
  if (currentScreen === 'analysisType') {
    return (
      <AnalysisTypeSelection
        onSelectType={handleAnalysisTypeSelection}
        onBack={() => setCurrentScreen('capture')}
        capturedImage={capturedImage || ''}
      />
    )
  }

  if (currentScreen === 'detailedForm') {
    return (
      <DetailedAnalysisForm
        onSubmit={handleDetailedFormSubmit}
        onBack={() => setCurrentScreen('analysisType')}
        loading={isLoading}
      />
    )
  }

  if (currentScreen === 'manualEntry') {
    return (
      <ManualFoodEntry
        onSubmit={handleManualFoodEntry}
        onBack={() => setCurrentScreen('analysisType')}
        capturedImage={capturedImage}
      />
    )
  }

  if (currentScreen === 'aiVerification' && analysisResult) {
    return (
      <AIVerification
        analysisResult={analysisResult}
        capturedImage={capturedImage}
        onConfirm={handleAIVerificationConfirm}
        onEdit={handleAIVerificationEdit}
        onManualEntry={handleAIVerificationManualEntry}
        onBack={() => setCurrentScreen('analysisType')}
      />
    )
  }

  if (currentScreen === 'mealType') {
    return (
      <MealTypeSelection
        onSubmit={handleMealTypeSave}
        onBack={() => setCurrentScreen('results')}
        loading={isLoading}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {onBack && (
        <div className="border-b border-gray-200 px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {currentScreen === 'capture' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Camera className="h-5 w-5 text-green-500" />
                AI Yemek Analizi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleCameraCapture}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Fotoğraf Çek / Yükle
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        )}

        {currentScreen === 'analyzing' && (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-500" />
                <div>
                  <h3 className="text-lg font-medium text-black">AI Analiz Ediyor</h3>
                  <p className="text-gray-600">
                    {selectedAnalysisType === 'detailed' ? 'Detaylı analiz yapılıyor...' : 'Hızlı analiz yapılıyor...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(currentScreen === 'results' || currentScreen === 'editResults') && analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-black">
                <span>
                  Analiz Sonuçları 
                  {analysisResult.analysisType === 'detailed' && 
                    <Badge variant="secondary" className="ml-2">Detaylı Analiz</Badge>
                  }
                </span>
                {analysisResult.requiresManualReview && currentScreen !== 'editResults' && (
                  <Badge variant="destructive">Manuel İnceleme Gerekli</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Confidence Scores */}
              <div className="space-y-2">
                <Label>Güven Skorları</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Genel:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getConfidenceColor(analysisResult.confidenceScores.overall)}`} />
                    <span className="text-sm font-medium">
                      %{Math.round(analysisResult.confidenceScores.overall * 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Food Items - Edit Mode */}
              {currentScreen === 'editResults' ? (
                <div className="space-y-3">
                  <Label>Tespit Edilen Yemekler - Düzenleme</Label>
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    {editingFoods.map((food, index) => (
                      <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <div>
                          <Label className="text-xs">Yemek Adı</Label>
                          <Input
                            value={food.name}
                            onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Porsiyon (g)</Label>
                          <Input
                            type="number"
                            value={food.portionSize}
                            onChange={(e) => updateFoodItem(index, 'portionSize', parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Kalori</Label>
                          <Input
                            type="number"
                            value={food.calories}
                            onChange={(e) => updateFoodItem(index, 'calories', parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Protein (g)</Label>
                          <Input
                            type="number"
                            value={food.protein}
                            onChange={(e) => updateFoodItem(index, 'protein', parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Karb. (g)</Label>
                          <Input
                            type="number"
                            value={food.carbs}
                            onChange={(e) => updateFoodItem(index, 'carbs', parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Yağ (g)</Label>
                          <Input
                            type="number"
                            value={food.fat}
                            onChange={(e) => updateFoodItem(index, 'fat', parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={recalculateNutrition} className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        Kaydet
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentScreen('results')}>
                        <X className="mr-2 h-4 w-4" />
                        İptal
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Tespit Edilen Yemekler</Label>
                    {analysisResult.requiresManualReview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFoods(analysisResult.nutritionalAnalysis.foodItems)
                          setCurrentScreen('editResults')
                        }}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Düzenle
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {analysisResult.nutritionalAnalysis.foodItems.map((food, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{food.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {food.category} • {food.portionSize}g
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{food.calories} kcal</p>
                          <p className="text-xs text-muted-foreground">
                            P: {food.protein}g • K: {food.carbs}g • Y: {food.fat}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Nutrition */}
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold mb-3">Toplam Besin Değerleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {analysisResult.nutritionalAnalysis.totalCalories}
                    </p>
                    <p className="text-sm text-muted-foreground">Kalori</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {analysisResult.nutritionalAnalysis.totalProtein}g
                    </p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {analysisResult.nutritionalAnalysis.totalCarbs}g
                    </p>
                    <p className="text-sm text-muted-foreground">Karbonhidrat</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {analysisResult.nutritionalAnalysis.totalFat}g
                    </p>
                    <p className="text-sm text-muted-foreground">Yağ</p>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              {analysisResult.aiSuggestions && (
                <Alert>
                  <AlertDescription>
                    <strong>AI Önerileri:</strong> {analysisResult.aiSuggestions}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setCurrentScreen('mealType')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Devam Et
                </Button>
                <Button
                  variant="outline"
                  onClick={resetToCapture}
                >
                  Yeniden Çek
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Analiz süresi: {analysisResult.processingTimeMs}ms
                {analysisResult.analysisType === 'detailed' && ' • Detaylı Analiz'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
