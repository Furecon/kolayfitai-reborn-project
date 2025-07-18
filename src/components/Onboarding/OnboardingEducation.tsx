
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, Calculator, Target, Brain } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingEducation() {
  const { setCurrentStep } = useOnboarding()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(7)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-8/12"></div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-black">Bu bilgileri neden doğru vermelisin?</h2>
          
          <div className="space-y-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4 text-left">
                <div className="flex items-start space-x-3">
                  <Calculator className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">BMR Hesaplama</h3>
                    <p className="text-gray-600 text-sm">
                      Vücudunun dinlenirken harcadığı kaloriyi öğrenmek için.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4 text-left">
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Günlük Hedef Belirleme</h3>
                    <p className="text-gray-600 text-sm">
                      Günlük tüketmen gereken kalori miktarını hesaplamak için.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4 text-left">
                <div className="flex items-start space-x-3">
                  <Brain className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Yapay Zeka Önerileri</h3>
                    <p className="text-gray-600 text-sm">
                      Senin verilerine uygun yemek önerileri ve tarifler sunabilmemiz için.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium text-sm">
              Yanlış bilgi → Yanlış hedef
            </p>
          </div>

          <Button 
            onClick={() => setCurrentStep(9)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
          >
            Anladım, Devam Et
          </Button>
        </div>
      </div>
    </div>
  )
}
