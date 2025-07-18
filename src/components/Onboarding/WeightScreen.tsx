
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingData } from './OnboardingFlow'

interface WeightScreenProps {
  data: OnboardingData
  onUpdate: (updates: Partial<OnboardingData>) => void
  onNext: () => void
}

export function WeightScreen({ data, onUpdate, onNext }: WeightScreenProps) {
  const [weight, setWeight] = useState(data.weight?.toString() || '')

  const handleNext = () => {
    const weightNumber = parseFloat(weight)
    if (weightNumber >= 30 && weightNumber <= 300) {
      onUpdate({ weight: weightNumber })
      onNext()
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Adım 4/6</span>
            <span>%67</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">Kilonu gir (kg)</h2>
          
          <div className="mb-6">
            <Input
              type="number"
              placeholder="Kilo (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="text-center text-xl border-gray-300 py-3"
              min="30"
              max="300"
              step="0.1"
            />
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-gray-200 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-black flex items-center">
              <div className="w-6 h-6 bg-red-100 rounded-full mr-3 flex items-center justify-center">
                <span className="text-red-500 text-sm">!</span>
              </div>
              Önemli!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-600">
              Kilon, kalori hedefini belirlemek için önemlidir. <strong>Yanlış bilgi verirsen yanlış hedef belirleriz.</strong>
            </p>
          </CardContent>
        </Card>

        <Button 
          onClick={handleNext}
          disabled={!weight || parseFloat(weight) < 30 || parseFloat(weight) > 300}
          className="bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-lg disabled:bg-gray-300"
        >
          Devam Et
        </Button>
      </div>
    </div>
  )
}
