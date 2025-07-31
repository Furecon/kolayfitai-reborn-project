import { AuthProvider } from '@/components/Auth/AuthProvider'
import { AuthScreen } from '@/components/Auth/AuthScreen'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { OnboardingFlow } from '@/components/Onboarding/OnboardingFlow'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useOAuthRedirect } from '@/hooks/useOAuthRedirect'

function AppContent() {
  const { user, loading } = useAuth()
  
  // Initialize OAuth redirect handler for mobile deep links
  useOAuthRedirect()

  // Fetch user profile to check onboarding status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (error) throw error
      return data
    },
    enabled: !!user
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

  if (!profile?.onboarding_completed) {
    return <OnboardingFlow />
  }

  return <Dashboard />
}

export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
