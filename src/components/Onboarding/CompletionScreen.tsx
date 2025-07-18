
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingData } from './OnboardingFlow'

interface CompletionScreenProps {
  data: OnboardingData
  onComplete: () => void
}

export function CompletionScreen({ data, onComplete }: CompletionScreenProps) {
  // Calculate BMR and daily calorie goal
  const calculateBMR = () => {
    if (!data.age || !data.weight || !data.height || !data.gender) return 2000
    
    if (data.gender === 'male') {
      return 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
    } else {
      return 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age)
    }
  }

  const getActivityMultiplier = () => {
    const multipliers: { [key: string]: number } = {
      'sedentary': 1.2,
      'moderately_active': 1.55,
      'very_active': 1.725
    }
    return multipliers[data.activityLevel || 'sedentary'] || 1.2
  }

  const getDietAdjustment = () => {
    const adjustments: { [key: string]: number } = {
      'lose': -500,
      'gain': 500,
      'maintain': 0
    }
    return adjustments[data.goal || 'maintain'] || 0
  }

  const bmr = calculateBMR()
  const activityMultiplier = getActivityMultiplier()
  const dietAdjustment = getDietAdjustment()
  const dailyCalorieGoal = Math.round((bmr * activityMultiplier) + dietAdjustment)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">Hedefini Hesapladık!</h2>
          <p className="text-gray-600 text-lg">
            Artık yemeklerini takip etmeye başlayabilirsin.
          </p>
        </div>

        {/* Calorie Goal */}
        <Card className="border-2 border-green-200 bg-green-50 mb-6">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {dailyCalorieGoal} kcal
            </div>
            <p className="text-green-800 font-medium">Günlük Hedef Kalorin</p>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-gray-200 mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Hesaplama Özeti:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bazal Metabolizma (BMR):</span>
                <span className="text-black font-medium">{Math.round(bmr)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aktivite Çarpanı:</span>
                <span className="text-black font-medium">x{activityMultiplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hedef Ayarı:</span>
                <span className="text-black font-medium">{dietAdjustment > 0 ? '+' : ''}{dietAdjustment} kcal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={onComplete}
          className="bg-green-500 hover:bg-green-600 text-white w-full py-4 text-lg rounded-lg mb-4"
        >
          Uygulamaya Başla
        </Button>

        {/* Email Note */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm text-center">
              💡 <strong>Not:</strong> E-posta adresini yalnızca şifre sıfırlama ve sana özel öneriler göndermek için istiyoruz. Doğrulama yapmana gerek yok.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
