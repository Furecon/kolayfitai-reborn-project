
import React, { useState } from 'react'
import { ScreenshotMode } from './ScreenshotMode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Camera, Zap, CheckCircle, Sparkles } from 'lucide-react'

export function DemoCameraAnalysis() {
  const [analysisStep, setAnalysisStep] = useState<'capture' | 'analyzing' | 'results'>('capture')

  const demoAnalysisResults = {
    detectedFoods: [
      { name: 'Izgara Tavuk Göğsü', amount: '120g', calories: 198, protein: 37, carbs: 0, fat: 4.3, confidence: 95 },
      { name: 'Bulgur Pilavı', amount: '80g', calories: 280, protein: 8, carbs: 56, fat: 2.2, confidence: 92 },
      { name: 'Çoban Salatası', amount: '100g', calories: 30, protein: 1.5, carbs: 6, fat: 1, confidence: 88 }
    ],
    totalCalories: 508,
    totalProtein: 46.5,
    totalCarbs: 62,
    totalFat: 7.5,
    aiConfidence: 92
  }

  return (
    <ScreenshotMode overlayType="camera">
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="text-gray-600 h-10 px-2">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Geri
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Yemek Analizi</h1>
            <div className="w-16" />
          </div>
        </div>

        <div className="px-4 py-6">
          {analysisStep === 'capture' && (
            <div className="space-y-6">
              {/* Camera Preview */}
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white space-y-4">
                      <Camera className="h-20 w-20 mx-auto opacity-60" />
                      <p className="text-lg font-medium">Yemeğinizi kameraya tutun</p>
                      <p className="text-sm opacity-75">AI anında analiz edecek</p>
                    </div>
                  </div>
                  
                  {/* Camera overlay grid */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                  
                  {/* Focus indicators */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-24 h-24 rounded-full border-2 border-green-400 shadow-lg animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <Sparkles className="h-8 w-8 text-blue-500 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-900">AI Nasıl Çalışır?</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>✨ Fotoğrafınızı çektiğinizde AI hemen analiz başlar</p>
                      <p>🔍 Yemekler otomatik olarak tanınır</p>
                      <p>📊 Kalori ve besin değerleri hesaplanır</p>
                      <p>✅ Sonuçları onaylayıp kaydedebilirsiniz</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-bold shadow-lg"
                  onClick={() => setAnalysisStep('analyzing')}
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Fotoğraf Çek
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full py-4 text-lg font-bold"
                >
                  Galeriden Seç
                </Button>
              </div>
            </div>
          )}

          {analysisStep === 'analyzing' && (
            <div className="space-y-6 text-center py-12">
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl shadow-2xl animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">AI Analiz Ediyor...</h3>
                <p className="text-gray-600">Yemeğinizin besin değerleri hesaplanıyor</p>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Yemekler tanınıyor</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Besin değerleri hesaplanıyor</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="mt-8 bg-purple-500 hover:bg-purple-600 text-white px-8"
                onClick={() => setAnalysisStep('results')}
              >
                Sonuçları Göster (Demo)
              </Button>
            </div>
          )}

          {analysisStep === 'results' && (
            <div className="space-y-6">
              {/* AI Confidence */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">AI Analiz Sonucu</h3>
                    <Badge className="bg-green-100 text-green-800 text-sm font-medium">
                      %{demoAnalysisResults.aiConfidence} Güven
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                    <div className="text-center">
                      <div className="font-bold text-xl text-green-600">{demoAnalysisResults.totalCalories}</div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-blue-600">{demoAnalysisResults.totalProtein}g</div>
                      <div className="text-xs text-gray-500">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-orange-600">{demoAnalysisResults.totalCarbs}g</div>
                      <div className="text-xs text-gray-500">Karb</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-purple-600">{demoAnalysisResults.totalFat}g</div>
                      <div className="text-xs text-gray-500">Yağ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detected Foods */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tespit Edilen Yemekler</h3>
                  <div className="space-y-3">
                    {demoAnalysisResults.detectedFoods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{food.name}</h4>
                            <Badge variant="outline" className="text-xs">%{food.confidence}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{food.amount} • {food.calories} kcal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-bold">
                  Sonucu Kaydet
                </Button>
                <Button size="lg" variant="outline" className="w-full py-4 text-lg font-bold">
                  Düzenle
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenshotMode>
  )
}
