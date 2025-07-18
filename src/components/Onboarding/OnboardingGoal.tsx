
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingGoal() {
  const { setCurrentStep, updateOnboardingData, onboardingData } = useOnboarding()

  const handleGoalSelect = (goal: 'lose' | 'maintain' | 'gain') => {
    updateOnboardingData({ goal })
    setCurrentStep(7)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(5)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-6/12"></div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-black">Hedefin nedir?</h2>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleGoalSelect('lose')}
              variant={onboardingData.goal === 'lose' ? 'default' : 'outline'}
              className="w-full py-4 text-lg border-gray-300"
            >
              Kilo Vermek
            </Button>
            <Button
              onClick={() => handleGoalSelect('maintain')}
              variant={onboardingData.goal === 'maintain' ? 'default' : 'outline'}
              className="w-full py-4 text-lg border-gray-300"
            >
              Kilomu Korumak
            </Button>
            <Button
              onClick={() => handleGoalSelect('gain')}
              variant={onboardingData.goal === 'gain' ? 'default' : 'outline'}
              className="w-full py-4 text-lg border-gray-300"
            >
              Kilo Almak
            </Button>
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <p className="text-gray-600 text-sm">
                Hedefine uygun kişisel kalori ve makro planını belirleyeceğiz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
