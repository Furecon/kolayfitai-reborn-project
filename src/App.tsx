import React, { Component, ErrorInfo, ReactNode } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'
import { PrivacyPolicy } from '@/components/Legal/PrivacyPolicy'
import { TermsOfService } from '@/components/Legal/TermsOfService'
import { ContactUs } from '@/components/Legal/ContactUs'
import { useOAuthRedirect } from '@/hooks/useOAuthRedirect'
import { usePlatform } from '@/hooks/usePlatform'
import { TutorialProvider } from '@/components/Tutorial/TutorialProvider'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

console.log('[KolayFit] App.tsx loaded')

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KolayFit] Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          color: '#c00',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          <h2>Uygulama Hatası</h2>
          <p>{this.state.error?.message}</p>
          <pre>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()}>Yeniden Yükle</button>
        </div>
      )
    }

    return this.props.children
  }
}

function AppRoutes() {
  useOAuthRedirect()
  const { isNative } = usePlatform()

  return (
    <Routes>
      <Route
        path="/"
        element={isNative ? <Navigate to="/app" replace /> : <Landing />}
      />
      <Route path="/app" element={<Index />} />
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/terms" element={<TermsOfService />} />
      <Route path="/legal/contact" element={<ContactUs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  console.log('[KolayFit] App component rendering...')

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <TooltipProvider>
            <TutorialProvider>
              <AppRoutes />
              <Toaster />
            </TutorialProvider>
          </TooltipProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
