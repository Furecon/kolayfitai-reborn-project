
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Sparkles, Target, TrendingUp, Heart, Zap } from 'lucide-react'

interface ScreenshotModeProps {
  children: React.ReactNode
  overlayType?: 'hero' | 'dashboard' | 'camera' | 'suggestions' | 'tracking' | 'onboarding' | 'none'
}

const overlayContent = {
  hero: {
    title: "AI Destekli Beslenme Asistanınız",
    subtitle: "Fotoğraf çek, kalori ve besin değerlerini öğren!",
    icon: <Sparkles className="h-8 w-8" />,
    gradient: "from-green-500 to-emerald-600"
  },
  dashboard: {
    title: "Günlük Hedeflerinizi Takip Edin",
    subtitle: "Makro besinler ve kalori takibi artık çok kolay",
    icon: <Target className="h-8 w-8" />,
    gradient: "from-blue-500 to-cyan-600"
  },
  camera: {
    title: "Fotoğraf Çek, AI Analiz Etsin! 📸",
    subtitle: "Yemeğinizin besin değerlerini anında öğrenin",
    icon: <Camera className="h-8 w-8" />,
    gradient: "from-purple-500 to-pink-600"
  },
  suggestions: {
    title: "Kişisel Öğün Önerileri 🍽️",
    subtitle: "Size özel AI destekli yemek tarifleri",
    icon: <Heart className="h-8 w-8" />,
    gradient: "from-orange-500 to-red-600"
  },
  tracking: {
    title: "Detaylı Beslenme Analizi 📊",
    subtitle: "İlerlemenizi grafik ve raporlarla takip edin",
    icon: <TrendingUp className="h-8 w-8" />,
    gradient: "from-indigo-500 to-purple-600"
  },
  onboarding: {
    title: "Hemen Başlayın! ⚡",
    subtitle: "3 dakikada profilinizi oluşturun",
    icon: <Zap className="h-8 w-8" />,
    gradient: "from-green-500 to-teal-600"
  }
}

export function ScreenshotMode({ children, overlayType = 'none' }: ScreenshotModeProps) {
  const [showOverlay, setShowOverlay] = useState(overlayType !== 'none')
  
  const overlay = overlayType !== 'none' ? overlayContent[overlayType] : null

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content with Screenshot Optimizations */}
      <div className="screenshot-optimized">
        {children}
      </div>

      {/* Marketing Overlay */}
      {showOverlay && overlay && (
        <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
          <div className={`bg-gradient-to-r ${overlay.gradient} text-white p-4 shadow-lg`}>
            <div className="max-w-md mx-auto flex items-center space-x-3">
              <div className="flex-shrink-0 text-white/90">
                {overlay.icon}
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{overlay.title}</h2>
                <p className="text-sm text-white/90 leading-tight">{overlay.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Badges */}
      {showOverlay && (
        <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
          <div className="max-w-md mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs font-medium">
                🤖 AI Destekli
              </Badge>
              <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs font-medium">
                📱 Kolay Kullanım
              </Badge>
              <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs font-medium">
                🎯 Kişisel Hedefler
              </Badge>
              <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs font-medium">
                🇹🇷 Türkçe
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Control Panel - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50">
          <Card className="w-48">
            <CardContent className="p-3">
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant={showOverlay ? "default" : "outline"}
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="w-full text-xs"
                >
                  {showOverlay ? 'Overlay Gizle' : 'Overlay Göster'}
                </Button>
                <div className="text-xs text-gray-500 text-center">
                  Screenshot Mode
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Screenshot Optimizations CSS */}
      <style jsx global>{`
        .screenshot-optimized {
          /* Larger fonts for better readability in screenshots */
          font-size: 1.1em;
        }
        
        .screenshot-optimized .text-xs {
          font-size: 0.8rem;
        }
        
        .screenshot-optimized .text-sm {
          font-size: 0.9rem;
        }
        
        .screenshot-optimized .text-base {
          font-size: 1.1rem;
        }
        
        .screenshot-optimized .text-lg {
          font-size: 1.3rem;
        }
        
        .screenshot-optimized .text-xl {
          font-size: 1.4rem;
        }
        
        /* Enhanced button visibility */
        .screenshot-optimized button {
          font-weight: 600;
          letter-spacing: 0.025em;
        }
        
        /* Better contrast for cards */
        .screenshot-optimized .bg-white {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Enhanced spacing */
        .screenshot-optimized .space-y-3 > * + * {
          margin-top: 1rem;
        }
        
        .screenshot-optimized .space-y-4 > * + * {
          margin-top: 1.25rem;
        }
      `}</style>
    </div>
  )
}
