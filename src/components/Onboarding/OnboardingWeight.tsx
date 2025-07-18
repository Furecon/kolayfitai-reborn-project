
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingWeight() {
  const { setCurrentStep, updateOnboardingData, onboardingData } = useOnboarding()
  const [weight, setWeight] = useState(onboardingData.weight?.toString() || '')

  const handleNext = () => {
    const weightNum = parseFloat(weight)
    if (weightNum && weightNum >= 30 && weightNum <= 300) {
      updateOnboardingData({ weight: weightNum })
      setCurrentStep(6)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(4)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-5/12"></div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-black">Kilonu gir (kg):</h2>
          
          <div className="space-y-4">
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Kilonu gir"
              className="text-center text-lg py-3 border-gray-300"
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-black mb-2">Neden soruyoruz?</h3>
              <p className="text-gray-600 text-sm">
                Kilon, kalori hedefini belirlemek için önemlidir. Yanlış bilgi verirsen yanlış hedef belirleriz.
              </p>
            </CardContent>
          </Card>

          <Button 
            onClick={handleNext}
            disabled={!weight || parseFloat(weight) < 30 || parseFloat(weight) > 300}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
          >
            Devam Et
          </Button>
        </div>
      </div>
    </div>
  )
}
