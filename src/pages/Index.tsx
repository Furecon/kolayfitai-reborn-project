import { useState } from 'react'
import { AuthProvider } from '@/components/Auth/AuthProvider'
import { AuthScreen } from '@/components/Auth/AuthScreen'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { OnboardingFlow } from '@/components/Onboarding/OnboardingFlow'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useOAuthRedirect } from '@/hooks/useOAuthRedirect'
import { RatingDialog } from '@/components/StoreRating/RatingDialog'
import { TrialExpiredDialog } from '@/components/Subscription/TrialExpiredDialog'
import { SubscriptionManager } from '@/components/Subscription/SubscriptionManager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

function AppContent() {
  const { user, loading } = useAuth()
  const [openSubscriptionSettings, setOpenSubscriptionSettings] = useState(false)

  // Initialize OAuth redirect handler for mobile deep links
  useOAuthRedirect()

  // Fetch user profile to check onboarding status
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        throw error
      }

      console.log('Profile data loaded:', data)
      return data
    },
    enabled: !!user,
    staleTime: 0,
    gcTime: 0
  })


  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <img
            src="/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png"
            alt="KolayfitAi"
            className="h-16 mx-auto"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  if (!profile || profile.onboarding_completed !== true) {
    return <OnboardingFlow />
  }

  // Show subscription manager if opened
  if (openSubscriptionSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-6">
          <Button
            onClick={() => setOpenSubscriptionSettings(false)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <SubscriptionManager />
        </div>
      </div>
    )
  }

  return (
    <>
      <Dashboard />
      <TrialExpiredDialog
        onManageSubscription={() => setOpenSubscriptionSettings(true)}
      />
    </>
  )
}

export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
      <RatingDialog />
    </AuthProvider>
  )
}
