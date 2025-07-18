
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingData } from './OnboardingFlow'

interface GoalScreenProps {
  data: OnboardingData
  onUpdate: (updates: Partial<OnboardingData>) => void
  onNext: () => void
}

export function GoalScreen({ data, onUpdate, onNext }: GoalScreenProps) {
  const handleSelect = (goal: string) => {
    onUpdate({ goal })
    setTimeout(onNext, 300)
  }

  const goals = [
    { id: 'lose', label: 'Kilo Vermek', emoji: '📉', desc: 'Günlük -500 kalori açığı' },
    { id: 'maintain', label: 'Kilomu Korumak', emoji: '⚖️', desc: 'Mevcut kilonı koru' },
    { id: 'gain', label: 'Kilo Almak', emoji: '📈', desc: 'Günlük +500 kalori fazlası' }
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Adım 5/6</span>
            <span>%83</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">Hedefin nedir?</h2>
          
          <div className="space-y-4">
            {goals.map((goal) => (
              <Button
                key={goal.id}
                onClick={() => handleSelect(goal.id)}
                variant="outline"
                className={`w-full p-6 text-left border-2 ${
                  data.goal === goal.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{goal.emoji}</span>
                  <div>
                    <div className="text-lg font-semibold text-black">{goal.label}</div>
                    <div className="text-sm text-gray-600">{goal.desc}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Info */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm text-center">
              Hedefine uygun kişisel kalori ve makro planını belirleyeceğiz.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
