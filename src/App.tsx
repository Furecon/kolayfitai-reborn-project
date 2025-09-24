import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from 'next-themes'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import { PrivacyPolicy } from '@/components/Legal/PrivacyPolicy'
import { TermsOfService } from '@/components/Legal/TermsOfService'
import { ContactUs } from '@/components/Legal/ContactUs'
import './App.css'
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/contact" element={<ContactUs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </TooltipProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
