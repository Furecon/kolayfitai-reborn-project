
import { AuthProvider } from '@/components/Auth/AuthProvider'
import { AuthScreen } from '@/components/Auth/AuthScreen'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { useAuth } from '@/components/Auth/AuthProvider'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
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
