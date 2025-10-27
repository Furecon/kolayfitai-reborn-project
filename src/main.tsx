
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'

console.log('[KolayFit] Starting application...')

// Initialize Google Auth for web
if (typeof window !== 'undefined') {
  GoogleAuth.initialize({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  })
}

window.addEventListener('error', (event) => {
  console.error('[KolayFit] Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[KolayFit] Unhandled promise rejection:', event.reason)
})

const container = document.getElementById('root')
if (!container) {
  console.error('[KolayFit] Root element not found!')
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Root element not found. Check console.</div>'
  throw new Error('Root element not found')
}

console.log('[KolayFit] Root element found, initializing React...')

try {
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  console.log('[KolayFit] React app rendered successfully')
} catch (error) {
  console.error('[KolayFit] Error rendering app:', error)
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error}</div>`
}
