import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScreenshotDashboard } from './ScreenshotDashboard'
import { ScreenshotFoodAnalysis } from './ScreenshotFoodAnalysis'
import { ScreenshotMealSuggestions } from './ScreenshotMealSuggestions'
import { ScreenshotOnboarding } from './ScreenshotOnboarding'

type ScreenshotView = 'dashboard' | 'analysis' | 'suggestions' | 'onboarding'

export function ScreenshotMode() {
  const [currentView, setCurrentView] = useState<ScreenshotView>('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ScreenshotDashboard />
      case 'analysis':
        return <ScreenshotFoodAnalysis />
      case 'suggestions':
        return <ScreenshotMealSuggestions />
      case 'onboarding':
        return <ScreenshotOnboarding />
      default:
        return <ScreenshotDashboard />
    }
  }

  // If in production, just show the current view
  if (window.location.hostname !== 'localhost') {
    return renderView()
  }

  // In development, show the navigation
  return (
    <div className="min-h-screen bg-background">
      {/* Development Navigation */}
      <Card className="m-4 p-4">
        <h2 className="text-lg font-semibold mb-4">Screenshot Mode - Google Play Store</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentView('dashboard')}
            className="text-xs"
          >
            Ana Dashboard
          </Button>
          <Button 
            variant={currentView === 'analysis' ? 'default' : 'outline'}
            onClick={() => setCurrentView('analysis')}
            className="text-xs"
          >
            Yemek Analizi
          </Button>
          <Button 
            variant={currentView === 'suggestions' ? 'default' : 'outline'}
            onClick={() => setCurrentView('suggestions')}
            className="text-xs"
          >
            AI Öneriler
          </Button>
          <Button 
            variant={currentView === 'onboarding' ? 'default' : 'outline'}
            onClick={() => setCurrentView('onboarding')}
            className="text-xs"
          >
            Kayıt Anketi
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          📱 Responsive: Telefon (360px), Tablet (768px), Desktop (1440px+)
        </p>
      </Card>

      {/* Current View */}
      <div>
        {renderView()}
      </div>
    </div>
  )
}