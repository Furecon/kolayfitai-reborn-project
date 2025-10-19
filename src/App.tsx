import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import { PrivacyPolicy } from '@/components/Legal/PrivacyPolicy'
import { TermsOfService } from '@/components/Legal/TermsOfService'
import { ContactUs } from '@/components/Legal/ContactUs'
import { useOAuthRedirect } from '@/hooks/useOAuthRedirect'
import './App.css'
const queryClient = new QueryClient()

function OAuthCallbackHandler() {
  useOAuthRedirect()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 1000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Giriş yapılıyor...</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  useOAuthRedirect()

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth/callback" element={<OAuthCallbackHandler />} />
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/terms" element={<TermsOfService />} />
      <Route path="/legal/contact" element={<ContactUs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
