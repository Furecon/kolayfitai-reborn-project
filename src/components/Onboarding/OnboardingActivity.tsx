
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingActivity() {
  const { setCurrentStep, updateOnboardingData, onboardingData } = useOnboarding()

  const handleActivitySelect = (activityLevel: 'sedanter' | 'az_aktif' | 'orta_aktif' | 'çok_aktif' | 'extra_aktif') => {
    updateOnboardingData({ activityLevel })
    setCurrentStep(8)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(6)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-7/12"></div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-black">Günlük hareket seviyeni seç:</h2>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleActivitySelect('sedanter')}
              variant={onboardingData.activityLevel === 'sedanter' ? 'default' : 'outline'}
              className="w-full py-6 min-h-[80px] text-lg border-gray-300 flex flex-col items-center justify-center text-center"
            >
              <span className="font-semibold">Hareketsiz</span>
              <span className="text-sm text-gray-600 mt-1">Masa başı işi</span>
            </Button>
            <Button
              onClick={() => handleActivitySelect('az_aktif')}
              variant={onboardingData.activityLevel === 'az_aktif' ? 'default' : 'outline'}
              className="w-full py-6 min-h-[80px] text-lg border-gray-300 flex flex-col items-center justify-center text-center"
            >
              <span className="font-semibold">Az Aktif</span>
              <span className="text-sm text-gray-600 mt-1">Haftada 1-3 gün egzersiz</span>
            </Button>
            <Button
              onClick={() => handleActivitySelect('orta_aktif')}
              variant={onboardingData.activityLevel === 'orta_aktif' ? 'default' : 'outline'}
              className="w-full py-6 min-h-[80px] text-lg border-gray-300 flex flex-col items-center justify-center text-center"
            >
              <span className="font-semibold">Orta Aktif</span>
              <span className="text-sm text-gray-600 mt-1">Haftada 3-5 gün egzersiz</span>
            </Button>
            <Button
              onClick={() => handleActivitySelect('çok_aktif')}
              variant={onboardingData.activityLevel === 'çok_aktif' ? 'default' : 'outline'}
              className="w-full py-6 min-h-[80px] text-lg border-gray-300 flex flex-col items-center justify-center text-center"
            >
              <span className="font-semibold">Çok Aktif</span>
              <span className="text-sm text-gray-600 mt-1">Haftada 6-7 gün egzersiz</span>
            </Button>
            <Button
              onClick={() => handleActivitySelect('extra_aktif')}
              variant={onboardingData.activityLevel === 'extra_aktif' ? 'default' : 'outline'}
              className="w-full py-6 min-h-[80px] text-lg border-gray-300 flex flex-col items-center justify-center text-center"
            >
              <span className="font-semibold">Aşırı Aktif</span>
              <span className="text-sm text-gray-600 mt-1">Günde 2x egzersiz</span>
            </Button>
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-black mb-2">Neden soruyoruz?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Hareket seviyen, günlük kalori ihtiyacını etkiler. Daha aktif olan vücut daha fazla enerji harcar.
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="flex justify-between mb-1">
                  <span>Hareketsiz:</span>
                  <span className="font-medium">~1800 kcal</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Az Aktif:</span>
                  <span className="font-medium">~2000 kcal</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Orta Aktif:</span>
                  <span className="font-medium">~2200 kcal</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Çok Aktif:</span>
                  <span className="font-medium">~2500 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Aşırı Aktif:</span>
                  <span className="font-medium">~2800 kcal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
