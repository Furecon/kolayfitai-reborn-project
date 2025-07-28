
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Check } from 'lucide-react'

interface MealSelectionAfterAnalysisProps {
  detectedFoods: any[]
  onSubmit: (mealType: string, foods: any[]) => void
  onBack: () => void
  loading?: boolean
}

const mealOptions = [
  { value: 'Kahvaltı', label: 'Kahvaltı', emoji: '🌅' },
  { value: 'Öğle', label: 'Öğle Yemeği', emoji: '☀️' },
  { value: 'Akşam', label: 'Akşam Yemeği', emoji: '🌙' },
  { value: 'Atıştırmalık', label: 'Atıştırmalık', emoji: '🍎' },
  { value: 'İçecek', label: 'İçecek', emoji: '🥤' },
]

export default function MealSelectionAfterAnalysis({ 
  detectedFoods, 
  onSubmit, 
  onBack, 
  loading 
}: MealSelectionAfterAnalysisProps) {
  const [selectedMealType, setSelectedMealType] = useState<string>('')

  const handleSubmit = () => {
    if (selectedMealType) {
      onSubmit(selectedMealType, detectedFoods)
    }
  }

  const getTotalCalories = () => {
    return detectedFoods.reduce((total, food) => total + (food.totalNutrition?.calories || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 h-10 px-2"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Geri
        </Button>
        <h2 className="text-xl font-semibold text-gray-900">Öğün Seçimi</h2>
      </div>

      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-green-800 mb-2">✅ Analiz Tamamlandı!</h3>
        <p className="text-sm text-green-700">
          {detectedFoods.length} yemek tespit edildi • Toplam: {Math.round(getTotalCalories())} kcal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Bu analizi hangi öğüne kaydetmek istiyorsunuz?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {mealOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMealType === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMealType(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  {selectedMealType === option.value && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Tespit Edilen Yemekler:</h4>
            <div className="space-y-2">
              {detectedFoods.map((food, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{food.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(food.totalNutrition?.calories || 0)} kcal
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedMealType || loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-semibold"
          >
            {loading ? 'Kaydediliyor...' : 'Devam Et'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
