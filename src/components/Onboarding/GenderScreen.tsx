
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingData } from './OnboardingFlow'

interface GenderScreenProps {
  data: OnboardingData
  onUpdate: (updates: Partial<OnboardingData>) => void
  onNext: () => void
}

export function GenderScreen({ data, onUpdate, onNext }: GenderScreenProps) {
  const handleSelect = (gender: string) => {
    onUpdate({ gender })
    setTimeout(onNext, 300)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Adım 2/6</span>
            <span>%33</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">Cinsiyetin nedir?</h2>
          
          <div className="space-y-4">
            <Button
              onClick={() => handleSelect('male')}
              variant={data.gender === 'male' ? 'default' : 'outline'}
              className={`w-full py-4 text-lg ${
                data.gender === 'male' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'border-gray-300 hover:bg-gray-50 text-black'
              }`}
            >
              👨 Erkek
            </Button>
            
            <Button
              onClick={() => handleSelect('female')}
              variant={data.gender === 'female' ? 'default' : 'outline'}
              className={`w-full py-4 text-lg ${
                data.gender === 'female' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'border-gray-300 hover:bg-gray-50 text-black'
              }`}
            >
              👩 Kadın
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-black flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
                <span className="text-blue-500 text-sm">?</span>
              </div>
              Neden soruyoruz?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600">
              Cinsiyet, bazal metabolizma hızını (BMR) etkiler. Sana özel hedefler belirlemek için bilmemiz gerekiyor.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
