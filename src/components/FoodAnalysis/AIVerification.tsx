
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, Edit3 } from 'lucide-react'

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
  nutritionalAnalysis: {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    foodItems: FoodItem[]
  }
  confidenceScores: {
    overall: number
    individual: { name: string; confidence: number }[]
  }
}

interface AIVerificationProps {
  analysisResult: AnalysisResult
  capturedImage?: string | null
  onConfirm: () => void
  onEdit: () => void
  onManualEntry: () => void
  onBack: () => void
}

export default function AIVerification({ 
  analysisResult, 
  capturedImage, 
  onConfirm, 
  onEdit, 
  onManualEntry, 
  onBack 
}: AIVerificationProps) {
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

  const overallConfidence = analysisResult.confidenceScores.overall
  const lowConfidenceItems = analysisResult.nutritionalAnalysis.foodItems.filter((_, index) => 
    analysisResult.confidenceScores.individual[index]?.confidence < 0.7
  )

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
          <h1 className="text-xl font-semibold text-black">AI Analiz Doğrulaması</h1>
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
              <span>AI'nın Tespit Ettiği Yemekler</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getConfidenceColor(overallConfidence)}`} />
                <Badge variant={overallConfidence >= 0.7 ? "default" : "destructive"}>
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
                AI şu yemekleri tespit etti. Doğru değilse düzenleyebilir veya manuel olarak girebilirsiniz.
              </p>
            </div>

            {lowConfidenceItems.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Dikkat!</span>
                </div>
                <p className="text-sm text-yellow-700">
                  {lowConfidenceItems.length} yemek için düşük güven skoru. 
                  Manuel kontrol önerilir.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {analysisResult.nutritionalAnalysis.foodItems.map((food, index) => {
                const confidence = analysisResult.confidenceScores.individual[index]?.confidence || 0
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{food.name}</h4>
                        <p className="text-sm text-gray-500">
                          {food.category} • {food.portionSize}g
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidence)}`} />
                          <span className="text-xs">%{Math.round(confidence * 100)}</span>
                        </div>
                        <p className="font-medium">{food.calories} kcal</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Protein: {food.protein}g • Karb: {food.carbs}g • Yağ: {food.fat}g
                    </div>
                  </div>
                )
              })}
            </div>

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

            <div className="space-y-3 pt-4">
              <Button
                onClick={onConfirm}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Doğru, Devam Et
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="w-full"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Düzenle
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
