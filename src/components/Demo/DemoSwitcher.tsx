
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Smartphone, Camera, Heart, Target, Zap } from 'lucide-react'
import { DemoDashboard } from './DemoDashboard'
import { DemoMealSuggestions } from './DemoMealSuggestions'
import { DemoCameraAnalysis } from './DemoCameraAnalysis'

type DemoScreen = 'selector' | 'dashboard' | 'camera' | 'suggestions' | 'onboarding'

export function DemoSwitcher() {
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>('selector')

  const screens = [
    {
      id: 'dashboard',
      title: 'Ana Dashboard',
      description: 'Günlük kalori takibi ve makro dağılım',
      icon: <Target className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-500',
      overlayType: 'dashboard' as const
    },
    {
      id: 'camera',
      title: 'AI Fotoğraf Analizi',
      description: 'Yemek fotoğrafı çekme ve analiz',
      icon: <Camera className="h-8 w-8" />,
      color: 'from-purple-500 to-pink-500',
      overlayType: 'camera' as const
    },
    {
      id: 'suggestions',
      title: 'Öğün Önerileri',
      description: 'AI destekli kişisel yemek tarifleri',
      icon: <Heart className="h-8 w-8" />,
      color: 'from-orange-500 to-red-500',
      overlayType: 'suggestions' as const
    }
  ]

  if (currentScreen === 'dashboard') {
    return <DemoDashboard overlayType="dashboard" />
  }

  if (currentScreen === 'camera') {
    return <DemoCameraAnalysis />
  }

  if (currentScreen === 'suggestions') {
    return <DemoMealSuggestions />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Monitor className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Screenshot Demo</h1>
            <p className="text-gray-600">Google Play Store için ekran görüntüleri</p>
          </div>
          <Badge className="bg-green-100 text-green-800 text-sm font-medium">
            🎯 Mağaza Hazır
          </Badge>
        </div>

        {/* Screen Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">Ekran Seç</h3>
          
          {screens.map((screen) => (
            <Card 
              key={screen.id} 
              className="shadow-lg border-0 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
              onClick={() => setCurrentScreen(screen.id as DemoScreen)}
            >
              <div className={`h-2 bg-gradient-to-r ${screen.color}`} />
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${screen.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {screen.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{screen.title}</h4>
                    <p className="text-sm text-gray-600">{screen.description}</p>
                  </div>
                  <div className="text-gray-400">
                    <Smartphone className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="h-6 w-6 text-amber-500" />
              <h4 className="font-bold text-gray-900">Kullanım Talimatları</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📱 Bir ekran seçin ve demo verilerini görün</p>
              <p>📸 Tarayıcının ekran görüntüsü özelliğini kullanın</p>
              <p>🎨 Marketing overlay'leri otomatik olarak eklenir</p>
              <p>📱 1080x1920 (9:16) oranında çekin</p>
            </div>
          </CardContent>
        </Card>

        {/* Feature List */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Badge variant="outline" className="justify-center py-2">🤖 AI Destekli</Badge>
          <Badge variant="outline" className="justify-center py-2">📊 Kalori Takibi</Badge>
          <Badge variant="outline" className="justify-center py-2">🍽️ Öğün Önerileri</Badge>
          <Badge variant="outline" className="justify-center py-2">🇹🇷 Türkçe</Badge>
        </div>
      </div>
    </div>
  )
}
