
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingHeight() {
  const { setCurrentStep, updateOnboardingData, onboardingData } = useOnboarding()
  const [height, setHeight] = useState(onboardingData.height?.toString() || '')

  const handleNext = () => {
    const heightNum = parseInt(height)
    if (heightNum && heightNum >= 120 && heightNum <= 250) {
      updateOnboardingData({ height: heightNum })
      setCurrentStep(5)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(3)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-4/12"></div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-black">Boyunu gir (cm):</h2>
          
          <div className="space-y-4">
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Boyunu gir"
              className="text-center text-lg py-3 border-gray-300"
              min="120"
              max="250"
            />
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-black mb-2">Neden soruyoruz?</h3>
              <p className="text-gray-600 text-sm">
                Boyun, vücudunun günlük enerji ihtiyacını etkileyen faktörlerden biridir.
              </p>
            </CardContent>
          </Card>

          <Button 
            onClick={handleNext}
            disabled={!height || parseInt(height) < 120 || parseInt(height) > 250}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
          >
            Devam Et
          </Button>
        </div>
      </div>
    </div>
  )
}
