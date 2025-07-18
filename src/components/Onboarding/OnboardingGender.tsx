
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingGender() {
  const { setCurrentStep, updateOnboardingData, onboardingData } = useOnboarding()

  const handleGenderSelect = (gender: 'erkek' | 'kadın') => {
    updateOnboardingData({ gender })
    setCurrentStep(4)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(2)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-3/12"></div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-black">Cinsiyetin nedir?</h2>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleGenderSelect('erkek')}
              variant={onboardingData.gender === 'erkek' ? 'default' : 'outline'}
              className="w-full py-4 text-lg border-gray-300"
            >
              Erkek
            </Button>
            <Button
              onClick={() => handleGenderSelect('kadın')}
              variant={onboardingData.gender === 'kadın' ? 'default' : 'outline'}
              className="w-full py-4 text-lg border-gray-300"
            >
              Kadın
            </Button>
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-black mb-2">Neden soruyoruz?</h3>
              <p className="text-gray-600 text-sm">
                Cinsiyet, bazal metabolizma hızını (BMR) etkiler. Sana özel hedefler belirlemek için bilmemiz gerekiyor.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
