import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useOnboarding } from './OnboardingProvider'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'

export function OnboardingComplete() {
  const { onboardingData, calculateDailyCalories } = useOnboarding()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const dailyCalories = calculateDailyCalories()

  const handleComplete = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('Starting onboarding completion for user:', user.id)
      console.log('Onboarding data:', onboardingData)
      console.log('Daily calories calculated:', dailyCalories)

      // Use UPSERT to handle cases where profile doesn't exist or needs update
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          age: onboardingData.age,
          gender: onboardingData.gender,
          height: onboardingData.height,
          weight: onboardingData.weight,
          activity_level: onboardingData.activityLevel,
          daily_calorie_goal: dailyCalories,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Profile upsert error:', error)
        throw error
      }

      console.log('Profile successfully saved/updated')

      // Invalidate the profile query to trigger immediate refetch
      await queryClient.invalidateQueries({
        queryKey: ['profile', user.id]
      })

      toast({
        title: "Başarılı!",
        description: "Profilin oluşturuldu. Dashboard'a yönlendiriliyorsun!"
      })

      // Small delay for smooth transition
      setTimeout(() => {
        // The profile query invalidation will automatically trigger the redirect
        // since Index.tsx checks onboarding_completed status
      }, 500)

    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast({
        title: "Hata",
        description: "Profil kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-green-500 rounded-full h-2"></div>
        </div>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-black">Hedefini Hesapladık!</h1>
            <p className="text-gray-600">
              Artık yemeklerini takip etmeye başlayabilirsin.
            </p>
          </div>

          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {dailyCalories}
                </div>
                <div className="text-lg text-green-800 font-medium">
                  Günlük Kalori Hedefin
                </div>
                <div className="text-sm text-green-600 mt-1">
                  kcal/gün
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Yaş:</span>
              <span className="font-medium">{onboardingData.age}</span>
            </div>
            <div className="flex justify-between">
              <span>Cinsiyet:</span>
              <span className="font-medium capitalize">{onboardingData.gender}</span>
            </div>
            <div className="flex justify-between">
              <span>Boy:</span>
              <span className="font-medium">{onboardingData.height} cm</span>
            </div>
            <div className="flex justify-between">
              <span>Kilo:</span>
              <span className="font-medium">{onboardingData.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span>Hedef:</span>
              <span className="font-medium">
                {onboardingData.goal === 'lose' ? 'Kilo Vermek' : 
                 onboardingData.goal === 'gain' ? 'Kilo Almak' : 'Kilomu Korumak'}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleComplete}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg"
          >
            {loading ? 'Kaydediliyor...' : 'Uygulamaya Başla'}
          </Button>
        </div>
      </div>
    </div>
  )
}
