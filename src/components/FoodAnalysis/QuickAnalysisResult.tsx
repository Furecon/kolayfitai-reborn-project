
import React from 'react'
import { Button } from '@/components/ui/button'

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
  detectedFoods: FoodItem[]
  onSave: () => void
  onRetry: () => void
  loading?: boolean
}

export default function QuickAnalysisResult({ 
  detectedFoods, 
  onSave, 
  onRetry, 
  loading 
}: QuickAnalysisResultProps) {
  if (detectedFoods.length === 0) {
    return (
      <div className="text-center py-4 space-y-2">
        <p className="text-gray-600">Görüntüde yemek tespit edilemedi.</p>
        <Button
          onClick={onRetry}
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          Tekrar Dene
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-gray-700">
        Hızlı Analiz Sonuçları
      </h3>
      {detectedFoods.map((food, index) => (
        <div key={index} className="p-4 border border-gray-300 rounded-md">
          <h4 className="text-sm font-medium text-black">{food.name}</h4>
          <p className="text-xs text-gray-500">{food.estimatedAmount}</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-600">Kalori</p>
              <p className="text-sm font-semibold text-green-600">
                {Math.round(food.totalNutrition.calories)} kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Protein</p>
              <p className="text-sm font-semibold text-blue-600">
                {food.totalNutrition.protein.toFixed(1)} g
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Karbonhidrat</p>
              <p className="text-sm font-semibold text-orange-600">
                {food.totalNutrition.carbs.toFixed(1)} g
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Yağ</p>
              <p className="text-sm font-semibold text-red-600">
                {food.totalNutrition.fat.toFixed(1)} g
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Lif</p>
              <p className="text-sm font-semibold text-purple-600">
                {food.totalNutrition.fiber.toFixed(1)} g
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Şeker</p>
              <p className="text-sm font-semibold text-pink-600">
                {food.totalNutrition.sugar.toFixed(1)} g
              </p>
            </div>
          </div>
        </div>
      ))}
      <Button
        onClick={onSave}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white"
      >
        {loading ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </div>
  )
}
