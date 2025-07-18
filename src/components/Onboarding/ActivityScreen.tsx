
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingData } from './OnboardingFlow'

interface ActivityScreenProps {
  data: OnboardingData
  onUpdate: (updates: Partial<OnboardingData>) => void
  onNext: () => void
}

export function ActivityScreen({ data, onUpdate, onNext }: ActivityScreenProps) {
  const handleSelect = (activityLevel: string) => {
    onUpdate({ activityLevel })
    setTimeout(onNext, 300)
  }

  const activities = [
    { 
      id: 'sedentary', 
      label: 'Hareketsiz', 
      desc: 'Masa başı işi, az hareket',
      calories: '1800 kcal',
      emoji: '🪑'
    },
    { 
      id: 'moderately_active', 
      label: 'Orta Aktif', 
      desc: 'Haftada 3-4 gün egzersiz',
      calories: '2200 kcal',
      emoji: '🚶'
    },
    { 
      id: 'very_active', 
      label: 'Aktif', 
      desc: 'Günlük egzersiz veya aktif iş',
      calories: '2500 kcal',
      emoji: '🏃'
    }
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Adım 6/6</span>
            <span>%100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">Günlük hareket seviyeni seç</h2>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <Button
                key={activity.id}
                onClick={() => handleSelect(activity.id)}
                variant="outline"
                className={`w-full p-6 text-left border-2 ${
                  data.activityLevel === activity.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">{activity.emoji}</span>
                    <div>
                      <div className="text-lg font-semibold text-black">{activity.label}</div>
                      <div className="text-sm text-gray-600">{activity.desc}</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">{activity.calories}</div>
                </div>
              </Button>
            ))}
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
              Hareket seviyen, günlük kalori ihtiyacını etkiler. Daha aktif olan vücut daha fazla enerji harcar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
