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
import { useEffect } from 'react'
import { notificationManager } from '@/lib/notificationManager'

function AppContent() {
  const { user, loading } = useAuth()

  // Initialize OAuth redirect handler for mobile deep links
  useOAuthRedirect()

  // Initialize notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      notificationManager.initializeNotifications(user.id).catch(error => {
        console.error('Failed to initialize notifications:', error)
      })
    }
  }, [user?.id])

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

  return <Dashboard />
}

export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
      <RatingDialog />
      <TrialExpiredDialog />
    </AuthProvider>
  )
}
