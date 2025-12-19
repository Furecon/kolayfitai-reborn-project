
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

console.log('[KolayFit] Starting application...')
console.log('[KolayFit] Platform:', Capacitor.getPlatform())
console.log('[KolayFit] Is Native:', Capacitor.isNativePlatform())

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
