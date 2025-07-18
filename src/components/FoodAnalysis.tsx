import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Camera, Upload, Edit3, Check, X, Sparkles } from 'lucide-react'
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

interface AnalysisResult {
  detectedFoods: any[]
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

export default function FoodAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedMealType, setSelectedMealType] = useState('kahvaltı')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showManualEdit, setShowManualEdit] = useState(false)
  const [editingFoods, setEditingFoods] = useState<FoodItem[]>([])
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

  const analyzeFood = async (imageBase64: string) => {
    setIsAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          imageBase64,
          mealType: selectedMealType
        }
      })

      if (error) throw error

      setAnalysisResult(data)
      
      if (data.requiresManualReview) {
        setEditingFoods(data.nutritionalAnalysis.foodItems)
        setShowManualEdit(true)
        toast({
          title: "Manuel İnceleme Gerekli",
          description: "AI'nın güven skoru düşük. Lütfen sonuçları kontrol edin.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Analiz Tamamlandı!",
          description: `${data.nutritionalAnalysis.foodItems.length} yemek tespit edildi.`
        })
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        title: "Analiz Hatası",
        description: "Yemek analizi sırasında hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
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
      await analyzeFood(imageBase64)
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
    setShowManualEdit(false)
    toast({
      title: "Güncellendi!",
      description: "Besin değerleri başarıyla güncellendi."
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-2">AI Yemek Analizi</h2>
          <p className="text-gray-600">Fotoğrafını çek, besin değerlerini öğren</p>
        </div>

        <Card className="card-glass max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Destekli Analiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-type">Öğün Türü</Label>
            <Select value={selectedMealType} onValueChange={setSelectedMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kahvaltı">Kahvaltı</SelectItem>
                <SelectItem value="öğle">Öğle Yemeği</SelectItem>
                <SelectItem value="akşam">Akşam Yemeği</SelectItem>
                <SelectItem value="atıştırmalık">Atıştırmalık</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCameraCapture}
              disabled={isAnalyzing}
              className="flex-1 btn-gradient"
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

          {capturedImage && (
            <div className="mt-4">
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>AI yemeğinizi analiz ediyor...</span>
            </div>
          )}
        </CardContent>
      </Card>

            {analysisResult && (
        <Card className="card-glass max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <span>Analiz Sonuçları</span>
              {analysisResult.requiresManualReview && (
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

            {/* Food Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tespit Edilen Yemekler</Label>
                {!showManualEdit && analysisResult.requiresManualReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManualEdit(true)}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Düzenle
                  </Button>
                )}
              </div>

              {showManualEdit ? (
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
                    <Button variant="outline" onClick={() => setShowManualEdit(false)}>
                      <X className="mr-2 h-4 w-4" />
                      İptal
                    </Button>
                  </div>
                </div>
              ) : (
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
              )}
            </div>

            {/* Total Nutrition */}
            <div className="mt-6 p-6 bg-gradient-primary rounded-2xl text-white">
              <h3 className="font-semibold mb-4 text-center text-lg">Toplam Besin Değerleri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {analysisResult.nutritionalAnalysis.totalCalories}
                  </p>
                  <p className="text-white/80 text-sm">Kalori</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {analysisResult.nutritionalAnalysis.totalProtein}g
                  </p>
                  <p className="text-white/80 text-sm">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {analysisResult.nutritionalAnalysis.totalCarbs}g
                  </p>
                  <p className="text-white/80 text-sm">Karbonhidrat</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {analysisResult.nutritionalAnalysis.totalFat}g
                  </p>
                  <p className="text-white/80 text-sm">Yağ</p>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {analysisResult.aiSuggestions && (
              <Alert className="bg-accent/10 border-accent/20">
                <Sparkles className="h-4 w-4 text-accent" />
                <AlertDescription className="text-gray-700">
                  <strong>AI Önerileri:</strong> {analysisResult.aiSuggestions}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-gray-500 text-center">
              Analiz süresi: {analysisResult.processingTimeMs}ms
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}