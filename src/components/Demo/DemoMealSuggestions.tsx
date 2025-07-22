
import React from 'react'
import { ScreenshotMode } from './ScreenshotMode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Users, ChefHat, Star, Heart } from 'lucide-react'
import { useDemoData } from './DemoDataProvider'

export function DemoMealSuggestions() {
  const { demoData } = useDemoData()

  return (
    <ScreenshotMode overlayType="suggestions">
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="text-gray-600 h-10 px-2">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Geri
            </Button>
            <h1 className="text-xl font-bold text-gray-900">AI Önerileri</h1>
            <div className="w-16" />
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Personalized Header */}
          <div className="text-center space-y-2 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Size Özel Tarifler</h2>
            <p className="text-gray-600">Günlük hedeflerinize uygun AI destekli öneriler</p>
            <div className="flex justify-center space-x-2 mt-3">
              <Badge className="bg-green-100 text-green-800">🎯 Hedef Odaklı</Badge>
              <Badge className="bg-purple-100 text-purple-800">🤖 AI Destekli</Badge>
            </div>
          </div>

          {/* Meal Suggestions Grid */}
          <div className="space-y-4">
            {demoData.mealSuggestions.map((meal, index) => (
              <Card key={meal.id} className="shadow-lg border-0 overflow-hidden">
                <div className="relative">
                  {/* Placeholder for meal image */}
                  <div className="h-48 bg-gradient-to-br from-orange-300 via-red-300 to-pink-300 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-white/70" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button size="sm" variant="secondary" className="rounded-full bg-white/20 backdrop-blur text-white border-white/30">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-white/90 text-gray-800 font-medium">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        AI Önerisi
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{meal.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{meal.description}</p>
                    </div>

                    {/* Nutrition Info */}
                    <div className="grid grid-cols-4 gap-4 py-4 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">{meal.calories}</div>
                        <div className="text-xs text-gray-500">kcal</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">{meal.protein}g</div>
                        <div className="text-xs text-gray-500">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-orange-600">{meal.carbs}g</div>
                        <div className="text-xs text-gray-500">Karb</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-purple-600">{meal.fat}g</div>
                        <div className="text-xs text-gray-500">Yağ</div>
                      </div>
                    </div>

                    {/* Recipe Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {meal.prepTime}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {meal.recipe.servings} Porsiyon
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {meal.difficulty}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button className="bg-green-500 hover:bg-green-600 font-semibold">
                        Tarifi Gör
                      </Button>
                      <Button variant="outline" className="font-semibold">
                        Favorile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center py-6">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 font-bold text-lg shadow-lg">
              Daha Fazla Öneri Al
            </Button>
          </div>
        </div>
      </div>
    </ScreenshotMode>
  )
}
