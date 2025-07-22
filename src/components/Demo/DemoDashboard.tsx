
import React from 'react'
import { ScreenshotMode } from './ScreenshotMode'
import { DashboardHeader } from '../Dashboard/DashboardHeader'
import { CalorieCards } from '../Dashboard/CalorieCards'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Utensils, Sparkles, Heart, TrendingUp, Target } from 'lucide-react'
import { useDemoData } from './DemoDataProvider'

interface DemoDashboardProps {
  overlayType?: 'hero' | 'dashboard' | 'camera' | 'suggestions' | 'tracking' | 'onboarding' | 'none'
}

export function DemoDashboard({ overlayType = 'dashboard' }: DemoDashboardProps) {
  const { demoData } = useDemoData()

  return (
    <ScreenshotMode overlayType={overlayType}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          onCameraClick={() => console.log('Camera clicked')}
          onProfileClick={() => console.log('Profile clicked')}
          onContactClick={() => console.log('Contact clicked')}
          onResourcesClick={() => console.log('Resources clicked')}
          onPoliciesClick={() => console.log('Policies clicked')}
          onFAQClick={() => console.log('FAQ clicked')}
        />
        
        <CalorieCards 
          {...demoData.dailyStats}
          onCameraClick={() => console.log('Camera clicked')}
        />
        
        {/* Quick Action Buttons - Enhanced for Screenshots */}
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 h-auto min-h-[4rem] shadow-lg">
              <Sparkles className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-bold text-base">AI Önerileri</div>
                <div className="text-xs opacity-90">Kişisel öğün önerileri</div>
              </div>
            </Button>
            
            <Button variant="outline" className="py-4 h-auto min-h-[4rem] border-pink-200 hover:bg-pink-50 shadow-lg">
              <Heart className="h-5 w-5 mr-2 text-pink-500" />
              <div className="text-left">
                <div className="font-bold text-base">Favorilerim</div>
                <div className="text-xs text-gray-500">Sevdiğim tarifler</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Today's Meals - Enhanced */}
        <div className="px-4 pb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Utensils className="h-6 w-6 mr-2 text-green-500" />
                  Bugünkü Öğünler
                </h3>
                <Badge className="bg-green-100 text-green-800 text-sm font-medium">
                  3/5 Tamamlandı
                </Badge>
              </div>
              
              <div className="space-y-4">
                {demoData.todaysMeals.map((meal, index) => (
                  <div key={meal.id} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{meal.mealType}</h4>
                          <p className="text-sm text-gray-600">{meal.time} • {meal.foodItems.length} yemek</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">{meal.totalCalories}</div>
                          <div className="text-xs text-gray-500">kcal</div>
                        </div>
                      </div>
                      <div className="flex space-x-4 mt-2 text-xs text-gray-600">
                        <span>P: {meal.totalProtein.toFixed(1)}g</span>
                        <span>C: {meal.totalCarbs.toFixed(1)}g</span>
                        <span>F: {meal.totalFat.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights - Enhanced */}
        <div className="px-4 pb-6">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Analizi</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Harika gidiyorsun! 🎯</p>
                    <p className="text-sm text-gray-600">Protein hedefine %79 ulaştın. Akşam için 25g daha ekleyebilirsin.</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Önerim: Somon Tarifi 🐟</p>
                    <p className="text-sm text-gray-600">Omega-3 ve protein için ideal. AI önerilerinde seni bekliyor!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScreenshotMode>
  )
}
