import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Camera, Sparkles, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrialUsage {
  subscriptionStatus: string
  photoAnalysisCount: number
  photoAnalysisLimit: number
  mealSuggestionCount: number
  mealSuggestionLimit: number
  trialEndDate: string | null
}

export function TrialUsageCard() {
  const { user } = useAuth()
  const [usage, setUsage] = useState<TrialUsage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTrialUsage()
    }
  }, [user])

  const fetchTrialUsage = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, trial_photo_analysis_count, trial_photo_analysis_limit, trial_meal_suggestion_count, trial_meal_suggestion_limit, trial_end_date')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setUsage({
        subscriptionStatus: data.subscription_status,
        photoAnalysisCount: data.trial_photo_analysis_count,
        photoAnalysisLimit: data.trial_photo_analysis_limit,
        mealSuggestionCount: data.trial_meal_suggestion_count,
        mealSuggestionLimit: data.trial_meal_suggestion_limit,
        trialEndDate: data.trial_end_date
      })
    }
    setLoading(false)
  }

  if (loading || !usage || usage.subscriptionStatus !== 'trial') {
    return null
  }

  const photoPercentage = (usage.photoAnalysisCount / usage.photoAnalysisLimit) * 100
  const mealPercentage = (usage.mealSuggestionCount / usage.mealSuggestionLimit) * 100

  const remainingPhotos = usage.photoAnalysisLimit - usage.photoAnalysisCount
  const remainingMeals = usage.mealSuggestionLimit - usage.mealSuggestionCount

  const daysRemaining = usage.trialEndDate
    ? Math.max(0, Math.ceil((new Date(usage.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="h-5 w-5 text-orange-500" />
          Ücretsiz Deneme Sürümü
        </CardTitle>
        <p className="text-sm text-gray-600">
          {daysRemaining} gün kaldı
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" />
              <span>Fotoğraf Analizi</span>
            </div>
            <span className="font-medium">
              {remainingPhotos}/{usage.photoAnalysisLimit}
            </span>
          </div>
          <Progress value={photoPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>AI Yemek Önerisi</span>
            </div>
            <span className="font-medium">
              {remainingMeals}/{usage.mealSuggestionLimit}
            </span>
          </div>
          <Progress value={mealPercentage} className="h-2" />
        </div>

        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          onClick={() => window.location.href = '#subscription'}
        >
          <Crown className="mr-2 h-4 w-4" />
          Premium'a Geç
        </Button>
      </CardContent>
    </Card>
  )
}
