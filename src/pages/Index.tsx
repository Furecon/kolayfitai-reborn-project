import { AuthProvider } from '@/components/Auth/AuthProvider'
import { AuthScreen } from '@/components/Auth/AuthScreen'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { OnboardingFlow } from '@/components/Onboarding/OnboardingFlow'
import { DemoSwitcher } from '@/components/Demo/DemoSwitcher'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Monitor } from 'lucide-react'
import { useState } from 'react'

function AppContent() {
  const { user, loading } = useAuth()
  const [showDemo, setShowDemo] = useState(false)

  // Fetch user profile to check onboarding status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!user
  })

  // Demo mode for screenshots
  if (showDemo) {
    return (
      <div className="relative">
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setShowDemo(false)}
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur"
          >
            Normal Moda Dön
          </Button>
        </div>
        <DemoSwitcher />
      </div>
    )
  }

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
          
          {/* Demo Mode Button */}
          <div className="pt-8">
            <Button
              onClick={() => setShowDemo(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Demo Mode (Screenshots)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={() => setShowDemo(true)}
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Demo
          </Button>
        </div>
        <AuthScreen />
      </div>
    )
  }

  if (!profile?.onboarding_completed) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={() => setShowDemo(true)}
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Demo
          </Button>
        </div>
        <OnboardingFlow />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={() => setShowDemo(true)}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur"
        >
          <Monitor className="h-4 w-4 mr-2" />
          Demo
        </Button>
      </div>
      <Dashboard />
    </div>
  )
}

export default function Index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
