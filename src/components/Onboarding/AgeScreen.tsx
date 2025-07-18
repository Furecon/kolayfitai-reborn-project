
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingData } from './OnboardingFlow'

interface AgeScreenProps {
  data: OnboardingData
  onUpdate: (updates: Partial<OnboardingData>) => void
  onNext: () => void
}

export function AgeScreen({ data, onUpdate, onNext }: AgeScreenProps) {
  const [age, setAge] = useState(data.age?.toString() || '')

  const handleNext = () => {
    const ageNumber = parseInt(age)
    if (ageNumber >= 10 && ageNumber <= 100) {
      onUpdate({ age: ageNumber })
      onNext()
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Adım 1/6</span>
            <span>%17</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '17%' }}></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Kaç yaşındasın?</h2>
          
          <div className="mb-6">
            <Input
              type="number"
              placeholder="Yaşınızı girin"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="text-center text-xl border-gray-300 py-3"
              min="10"
              max="100"
            />
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-gray-200 mb-8">
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
              Yaşın metabolizmanı ve kalori ihtiyacını doğrudan etkiler. Genç vücutlar daha hızlı metabolizmaya sahiptir.
            </p>
          </CardContent>
        </Card>

        <Button 
          onClick={handleNext}
          disabled={!age || parseInt(age) < 10 || parseInt(age) > 100}
          className="bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-lg disabled:bg-gray-300"
        >
          Devam Et
        </Button>
      </div>
    </div>
  )
}
