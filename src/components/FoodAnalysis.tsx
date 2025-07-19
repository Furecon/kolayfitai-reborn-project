import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Camera, Upload, AlertCircle } from 'lucide-react'
import Webcam from 'react-webcam'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FoodItem {
  [key: string]: any; // Add index signature for Json compatibility
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

interface FoodAnalysisProps {
  onMealAdded: () => void
  onBack: () => void
}

export default function FoodAnalysis({ onMealAdded, onBack }: FoodAnalysisProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    detectedFoods: FoodItem[]
    confidence: number
    suggestions: string
  } | null>(null)
  const [mealType, setMealType] = useState('öğün')
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [fiber, setFiber] = useState('')
  const [sugar, setSugar] = useState('')
  const [sodium, setSodium] = useState('')
  const [manuallyAdding, setManuallyAdding] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isHttps, setIsHttps] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if we're on HTTPS
    setIsHttps(window.location.protocol === 'https:')
    console.log('Current protocol:', window.location.protocol)
    console.log('Is HTTPS:', window.location.protocol === 'https:')
  }, [])

  useEffect(() => {
    if (!photoUrl) return

    console.log('Photo captured, starting analysis...')
    analyzeImage(photoUrl)
  }, [photoUrl])

  const checkCameraPermissions = async () => {
    try {
      console.log('Checking camera permissions...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      console.log('Camera permission granted')
      stream.getTracks().forEach(track => track.stop()) // Clean up
      return true
    } catch (error: any) {
      console.error('Camera permission error:', error)
      setCameraError(`Kamera erişimi hatası: ${error.message}`)
      return false
    }
  }

  const capture = async () => {
    console.log('Capture button clicked!')
    
    try {
      // Check HTTPS requirement
      if (!isHttps) {
        toast({
          title: "HTTPS Gerekli",
          description: "Kamera erişimi için HTTPS bağlantısı gereklidir. Lütfen güvenli bağlantı kullanın.",
          variant: "destructive"
        })
        return
      }

      // Check camera permissions first
      const hasPermission = await checkCameraPermissions()
      if (!hasPermission) {
        toast({
          title: "Kamera İzni Gerekli",
          description: "Lütfen tarayıcınızdan kamera erişim izni verin.",
          variant: "destructive"
        })
        return
      }

      console.log('Attempting to capture image from webcam...')
      const imageSrc = webcamRef.current?.getScreenshot()
      
      if (!imageSrc) {
        console.error('Failed to capture image from webcam')
        toast({
          title: "Fotoğraf Çekilemedi",
          description: "Kameradan fotoğraf çekilemedi. Lütfen tekrar deneyin.",
          variant: "destructive"
        })
        return
      }

      console.log('Image captured successfully, length:', imageSrc.length)
      setPhotoUrl(imageSrc)
      setAnalysisResult(null)
      setCameraError(null)

    } catch (error: any) {
      console.error('Error during capture:', error)
      setCameraError(error.message)
      toast({
        title: "Hata",
        description: "Fotoğraf çekme sırasında hata oluştu: " + error.message,
        variant: "destructive"
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered')
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name, file.type, file.size)

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz Dosya",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      console.log('File converted to base64, length:', result.length)
      setPhotoUrl(result)
      setAnalysisResult(null)
      setCameraError(null)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (imageUrl: string) => {
    if (!imageUrl) return

    setAnalyzing(true)
    console.log('Starting food analysis with image:', imageUrl.substring(0, 50) + '...')
    console.log('Meal type:', mealType)
    
    try {
      console.log('Calling supabase function: analyze-food')
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { 
          imageUrl: imageUrl,
          mealType: mealType 
        }
      })

      console.log('Supabase function response:', { data, error })

      if (error) {
        console.error('Supabase function error:', error)
        throw new Error(error.message || 'Analiz sırasında hata oluştu')
      }

      if (!data) {
        console.error('No data received from analysis')
        throw new Error('Analiz sonucu alınamadı')
      }

      // Check if this is an error response
      if (data.error) {
        console.error('Analysis returned error:', data.error)
        throw new Error(data.error)
      }

      console.log('Analysis result:', data)
      setAnalysisResult(data)

      if (data.detectedFoods && data.detectedFoods.length > 0) {
        toast({
          title: "Başarılı!",
          description: `${data.detectedFoods.length} yemek tespit edildi.`,
        })
      } else {
        toast({
          title: "Yemek Bulunamadı",
          description: data.suggestions || "Görüntüde yemek tespit edilemedi. Manuel olarak ekleyebilirsiniz.",
        })
      }

    } catch (error: any) {
      console.error('Failed to analyze image:', error)
      
      toast({
        title: "Analiz Hatası",
        description: error.message || "Yemek analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
      
      // Provide fallback state
      setAnalysisResult({
        detectedFoods: [],
        confidence: 0,
        suggestions: "Görüntü analizi sırasında hata oluştu. Lütfen manuel olarak yemek bilgilerini girin."
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAddManually = () => {
    console.log('Switching to manual entry mode')
    setManuallyAdding(true)
    setAnalysisResult(null)
  }

  const handleSaveManualEntry = () => {
    if (!foodName || !calories || !protein || !carbs || !fat) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun (Yemek adı, Kalori, Protein, Karbonhidrat, Yağ).",
        variant: "destructive"
      })
      return
    }

    const newFoodItem: FoodItem = {
      name: foodName,
      nameEn: foodName,
      estimatedAmount: '1 porsiyon',
      nutritionPer100g: {
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        fiber: parseFloat(fiber) || 0,
        sugar: parseFloat(sugar) || 0,
        sodium: parseFloat(sodium) || 0
      },
      totalNutrition: {
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        fiber: parseFloat(fiber) || 0,
        sugar: parseFloat(sugar) || 0,
        sodium: parseFloat(sodium) || 0
      }
    }

    saveMealLog([newFoodItem], mealType)
  }

  const saveMealLog = async (foods: FoodItem[], mealType: string) => {
    if (!user) return

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
        calories: 0, 
        protein: 0, 
        carbs: 0, 
        fat: 0, 
        fiber: 0, 
        sugar: 0, 
        sodium: 0 
      })

      console.log('Saving meal log:', { foods, totalNutrition, mealType })

      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_type: mealType,
          food_items: foods as any, // Cast to any to satisfy Json type
          total_calories: totalNutrition.calories,
          total_protein: totalNutrition.protein,
          total_carbs: totalNutrition.carbs,
          total_fat: totalNutrition.fat,
          total_fiber: totalNutrition.fiber,
          total_sugar: totalNutrition.sugar,
          total_sodium: totalNutrition.sodium,
          photo_url: photoUrl,
          date: new Date().toISOString().split('T')[0]
        })

      if (error) {
        console.error('Error saving meal:', error)
        throw error
      }

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
    }
  }

  const retryAnalysis = () => {
    console.log('Retrying analysis...')
    if (photoUrl) {
      setAnalysisResult(null)
      analyzeImage(photoUrl)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-4">
        <Button
          variant="ghost"
          onClick={onBack}
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
            {!isHttps && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  Kamera için HTTPS bağlantısı gereklidir
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {!photoUrl && !manuallyAdding && (
              <div className="space-y-2">
                {isHttps ? (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="rounded-md"
                      onUserMediaError={(error) => {
                        console.error('Webcam error:', error)
                        setCameraError(error.toString())
                      }}
                    />
                    {cameraError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">{cameraError}</p>
                      </div>
                    )}
                    <Button
                      onClick={capture}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      disabled={!!cameraError}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Fotoğraf Çek
                    </Button>
                  </>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Kamera HTTPS bağlantısı gerektiriyor
                    </p>
                  </div>
                )}
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">veya</span>
                </div>
                
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
                  className="w-full text-gray-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Dosyadan Yükle
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddManually}
                  className="w-full text-gray-600"
                >
                  Manuel Ekle
                </Button>
              </div>
            )}

            {manuallyAdding && (
              <div className="space-y-4">
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

                <Label htmlFor="foodName">Yemek Adı *</Label>
                <Input
                  id="foodName"
                  type="text"
                  placeholder="Yemek adı"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="border-gray-300"
                />

                <Label htmlFor="calories">Kalori *</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="Kalori"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="border-gray-300"
                />

                <Label htmlFor="protein">Protein (g) *</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="Protein"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="border-gray-300"
                />

                <Label htmlFor="carbs">Karbonhidrat (g) *</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="Karbonhidrat"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="border-gray-300"
                />

                <Label htmlFor="fat">Yağ (g) *</Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="Yağ"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="border-gray-300"
                />

                <Label htmlFor="fiber">Lif (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  placeholder="Lif"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className="border-gray-300"
                />

                <Label htmlFor="sugar">Şeker (g)</Label>
                <Input
                  id="sugar"
                  type="number"
                  placeholder="Şeker"
                  value={sugar}
                  onChange={(e) => setSugar(e.target.value)}
                  className="border-gray-300"
                />

                <Label htmlFor="sodium">Sodyum (mg)</Label>
                <Input
                  id="sodium"
                  type="number"
                  placeholder="Sodyum"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  className="border-gray-300"
                />

                <Button
                  onClick={handleSaveManualEntry}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Kaydet
                </Button>
              </div>
            )}

            {photoUrl && !manuallyAdding && (
              <div className="space-y-4">
                <div className="relative">
                  <img src={photoUrl} alt="Captured Food" className="rounded-md" />
                  {analyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-sm">Analiz ediliyor...</p>
                      </div>
                    </div>
                  )}
                </div>

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

                {analysisResult && analysisResult.detectedFoods.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-md font-semibold text-gray-700">
                      Analiz Sonuçları
                    </h3>
                    {analysisResult.detectedFoods.map((food, index) => (
                      <div key={index} className="p-4 border border-gray-300 rounded-md">
                        <h4 className="text-sm font-medium text-black">{food.name}</h4>
                        <p className="text-xs text-gray-500">{food.estimatedAmount}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-gray-600">Kalori</p>
                            <p className="text-sm font-semibold text-green-600">{Math.round(food.totalNutrition.calories)} kcal</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Protein</p>
                            <p className="text-sm font-semibold text-blue-600">{food.totalNutrition.protein.toFixed(1)} g</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Karbonhidrat</p>
                            <p className="text-sm font-semibold text-orange-600">{food.totalNutrition.carbs.toFixed(1)} g</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Yağ</p>
                            <p className="text-sm font-semibold text-red-600">{food.totalNutrition.fat.toFixed(1)} g</p>
                          </div>
                           <div>
                            <p className="text-xs text-gray-600">Lif</p>
                            <p className="text-sm font-semibold text-purple-600">{food.totalNutrition.fiber.toFixed(1)} g</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Şeker</p>
                            <p className="text-sm font-semibold text-pink-600">{food.totalNutrition.sugar.toFixed(1)} g</p>
                          </div>
                           <div>
                            <p className="text-xs text-gray-600">Sodyum</p>
                            <p className="text-sm font-semibold text-indigo-600">{Math.round(food.totalNutrition.sodium)} mg</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => saveMealLog(analysisResult.detectedFoods, mealType)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      Kaydet
                    </Button>
                  </div>
                ) : analysisResult ? (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-gray-600">{analysisResult.suggestions}</p>
                    <Button
                      onClick={retryAnalysis}
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      Tekrar Dene
                    </Button>
                    <Button
                      onClick={handleAddManually}
                      variant="outline"
                      className="w-full mt-2"
                    >
                      Manuel Ekle
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
