
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingAge() {
  const { setCurrentStep, updateOnboardingData, onboardingData } = useOnboarding()
  const [age, setAge] = useState(onboardingData.age?.toString() || '')

  const handleNext = () => {
    const ageNum = parseInt(age)
    if (ageNum && ageNum >= 13 && ageNum <= 100) {
      updateOnboardingData({ age: ageNum })
      setCurrentStep(3)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(1)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-2/12"></div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-black">Kaç yaşındasın?</h2>
          
          <div className="space-y-4">
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Yaşını gir"
              className="text-center text-lg py-3 border-gray-300"
              min="13"
              max="100"
            />
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-black mb-2">Neden soruyoruz?</h3>
              <p className="text-gray-600 text-sm">
                Yaşın metabolizmanı ve kalori ihtiyacını doğrudan etkiler.
              </p>
            </CardContent>
          </Card>

          <Button 
            onClick={handleNext}
            disabled={!age || parseInt(age) < 13 || parseInt(age) > 100}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
          >
            Devam Et
          </Button>
        </div>
      </div>
    </div>
  )
}
