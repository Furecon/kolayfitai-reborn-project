
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CircleCheck as CheckCircle, Circle as XCircle, CreditCard as Edit3, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface AnalysisResult {
  detectedFoods: FoodItem[]
  confidence: number
  suggestions: string
  mealType: string
}

interface AIVerificationProps {
  analysisResult: AnalysisResult | null
  capturedImage?: string | null
  onConfirm: (foods: FoodItem[]) => void
  onEdit: () => void
  onManualEntry: () => void
  onBack: () => void
}

export default function AIVerification({ 
  const { toast } = useToast()
  analysisResult, 
  capturedImage, 
  onConfirm, 
  onEdit, 
  onManualEntry, 
  onBack 
}: AIVerificationProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedFoods, setEditedFoods] = useState<FoodItem[]>(analysisResult?.detectedFoods || [])

  // Handle case where analysisResult is null or undefined
  if (!analysisResult || !analysisResult.detectedFoods) {
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
          <h1 className="text-xl font-semibold text-black">Ai Analiz Doğrulaması</h1>
        </div>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-medium text-gray-900">Analiz Sonucu Bulunamadı</h3>
                <p className="text-gray-600">Ai analizi tamamlanamadı veya sonuç alınamadı.</p>
                <div className="space-y-2">
                  <Button onClick={onManualEntry} className="w-full">
                    Manuel Giriş Yap
                  </Button>
                  <Button variant="outline" onClick={onBack} className="w-full">
                    Tekrar Dene
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Yüksek Güven'
    if (confidence >= 0.6) return 'Orta Güven'
    return 'Düşük Güven'
  }

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return 'default'
    if (confidence >= 0.6) return 'secondary'
    return 'destructive'
  }

  const overallConfidence = analysisResult.confidence || 0
  const lowConfidenceItems = editedFoods.filter(() => overallConfidence < 0.7)

  const handleEditFood = (index: number) => {
    setEditingIndex(index)
  }

  const handleSaveEdit = (index: number, updatedFood: Partial<FoodItem>) => {
    const updated = [...editedFoods]
    updated[index] = { ...updated[index], ...updatedFood }
    setEditedFoods(updated)
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const getTotalNutrition = () => {
    return editedFoods.reduce(
      (total, food) => ({
        totalCalories: total.totalCalories + (food.totalNutrition?.calories || 0),
        totalProtein: total.totalProtein + (food.totalNutrition?.protein || 0),
        totalCarbs: total.totalCarbs + (food.totalNutrition?.carbs || 0),
        totalFat: total.totalFat + (food.totalNutrition?.fat || 0),
        totalFiber: total.totalFiber + (food.totalNutrition?.fiber || 0),
        totalSugar: total.totalSugar + (food.totalNutrition?.sugar || 0),
        totalSodium: total.totalSodium + (food.totalNutrition?.sodium || 0)
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalSugar: 0, totalSodium: 0 }
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
          <h1 className="text-xl font-semibold text-black">Ai Analiz Doğrulaması</h1>
        </div>

        {capturedImage && (
          <div className="mb-6">
            <img
              src={capturedImage}
              alt="Captured food"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-black">
              <span>Ai Analiz Sonuçları</span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    %{Math.round(overallConfidence * 100)}
                  </div>
                  <div className="text-xs text-muted-foreground">Doğruluk</div>
                </div>
                <div className={`w-4 h-4 rounded-full ${getConfidenceColor(overallConfidence)}`} />
                <Badge variant={getConfidenceBadgeVariant(overallConfidence)}>
                  {getConfidenceText(overallConfidence)}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Bu sonuçlar doğru mu?
              </h3>
              <p className="text-sm text-blue-700">
                Ai %{Math.round(overallConfidence * 100)} doğruluk oranıyla bu yemekleri tespit etti. 
                Yanlış olanları düzenleyebilirsiniz.
              </p>
            </div>

            {lowConfidenceItems.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Dikkat!</span>
                </div>
                <p className="text-sm text-yellow-700">
                  {lowConfidenceItems.length} yemek için düşük güven skoru (%70'in altı). 
                  Bu yemekleri kontrol etmenizi öneriyoruz.
                </p>
              </div>
            )}

            {analysisResult.suggestions && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Ai Önerileri:</h4>
                <p className="text-sm text-green-700">{analysisResult.suggestions}</p>
              </div>
            )}

            <div className="space-y-3">
              {editedFoods.map((food, index) => {
                const isEditing = editingIndex === index
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    {!isEditing ? (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{food.name}</h4>
                            <p className="text-sm text-gray-500">
                              {food.estimatedAmount}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div className="text-center">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(overallConfidence)}`} />
                                <span className="text-sm font-medium">%{Math.round(overallConfidence * 100)}</span>
                              </div>
                              <p className="font-medium">{food.totalNutrition?.calories || 0} kcal</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditFood(index)}
                              className="ml-2"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Protein: {food.totalNutrition?.protein || 0}g • 
                          Karb: {food.totalNutrition?.carbs || 0}g • 
                          Yağ: {food.totalNutrition?.fat || 0}g
                        </div>
                      </>
                    ) : (
                      <EditFoodForm
                        food={food}
                        onSave={(updatedFood) => handleSaveEdit(index, updatedFood)}
                        onCancel={handleCancelEdit}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold mb-3">Toplam Besin Değerleri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {Math.round(totalNutrition.totalCalories)}
                  </p>
                  <p className="text-sm text-muted-foreground">Kalori</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(totalNutrition.totalProtein)}g
                  </p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(totalNutrition.totalCarbs)}g
                  </p>
                  <p className="text-sm text-muted-foreground">Karbonhidrat</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(totalNutrition.totalFat)}g
                  </p>
                  <p className="text-sm text-muted-foreground">Yağ</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => onConfirm(editedFoods)}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Öğünü Kaydet
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="w-full"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Yemek Ekle/Çıkar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onManualEntry}
                  className="w-full"
                >
                  Manuel Giriş
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface EditFoodFormProps {
  food: FoodItem
  onSave: (updatedFood: Partial<FoodItem>) => void
  onCancel: () => void
}

function EditFoodForm({ food, onSave, onCancel }: EditFoodFormProps) {
  const [editedFood, setEditedFood] = useState({
    name: food.name,
    estimatedAmount: food.estimatedAmount,
    totalNutrition: {
      calories: food.totalNutrition?.calories || 0,
      protein: food.totalNutrition?.protein || 0,
      carbs: food.totalNutrition?.carbs || 0,
      fat: food.totalNutrition?.fat || 0,
      fiber: food.totalNutrition?.fiber || 0,
      sugar: food.totalNutrition?.sugar || 0,
      sodium: food.totalNutrition?.sodium || 0
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(editedFood)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Yemek Bilgilerini Düzenle</h4>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600">
            <Save className="h-3 w-3 mr-1" />
            Kaydet
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor="name" className="text-xs">Yemek Adı</Label>
          <Input
            id="name"
            value={editedFood.name}
            onChange={(e) => setEditedFood({ ...editedFood, name: e.target.value })}
            className="h-8"
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="amount" className="text-xs">Miktar</Label>
          <Input
            id="amount"
            value={editedFood.estimatedAmount}
            onChange={(e) => setEditedFood({ ...editedFood, estimatedAmount: e.target.value })}
            className="h-8"
          />
        </div>
        
        <div>
          <Label htmlFor="calories" className="text-xs">Kalori</Label>
          <Input
            id="calories"
            type="number"
            value={editedFood.totalNutrition.calories}
            onChange={(e) => setEditedFood({ 
              ...editedFood, 
              totalNutrition: { ...editedFood.totalNutrition, calories: parseInt(e.target.value) || 0 }
            })}
            className="h-8"
          />
        </div>
        
        <div>
          <Label htmlFor="protein" className="text-xs">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            value={editedFood.totalNutrition.protein}
            onChange={(e) => setEditedFood({ 
              ...editedFood, 
              totalNutrition: { ...editedFood.totalNutrition, protein: parseFloat(e.target.value) || 0 }
            })}
            className="h-8"
          />
        </div>
        
        <div>
          <Label htmlFor="carbs" className="text-xs">Karbonhidrat (g)</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            value={editedFood.totalNutrition.carbs}
            onChange={(e) => setEditedFood({ 
              ...editedFood, 
              totalNutrition: { ...editedFood.totalNutrition, carbs: parseFloat(e.target.value) || 0 }
            })}
            className="h-8"
          />
        </div>
        
        <div>
          <Label htmlFor="fat" className="text-xs">Yağ (g)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            value={editedFood.totalNutrition.fat}
            onChange={(e) => setEditedFood({ 
              ...editedFood, 
              totalNutrition: { ...editedFood.totalNutrition, fat: parseFloat(e.target.value) || 0 }
            })}
            className="h-8"
          />
        </div>
      </div>
    </form>
  )
}
