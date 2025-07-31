
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { supabase } from '@/integrations/supabase/client'

export function useOAuthRedirect() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleAppUrlOpen = async (data: { url: string }) => {
      console.log('Deep link received:', data.url)
      console.log('Current URL params:', new URLSearchParams(data.url.split('?')[1] || '').toString())
      
      // Check if this is an OAuth callback
      if (data.url.includes('oauth-callback')) {
        console.log('Processing OAuth callback...')
        try {
          // Close the browser first with a small delay to ensure it's properly opened
          setTimeout(async () => {
            try {
              await Browser.close()
              console.log('Browser closed successfully')
            } catch (closeError) {
              console.log('Browser close error (might already be closed):', closeError)
            }
          }, 100)
          
          // Use exchangeCodeForSession to handle the OAuth callback
          const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(data.url)
          
          if (error) {
            console.error('OAuth callback error:', error)
            console.error('Full error object:', JSON.stringify(error, null, 2))
          } else {
            console.log('OAuth callback successful!')
            console.log('Session created:', sessionData.session ? 'yes' : 'no')
            console.log('User data:', sessionData.user ? 'available' : 'not available')
            if (sessionData.session) {
              console.log('Access token available:', !!sessionData.session.access_token)
              console.log('Refresh token available:', !!sessionData.session.refresh_token)
            }
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error)
          console.error('Full error object:', JSON.stringify(error, null, 2))
        }
      } else {
        console.log('Deep link received but not an OAuth callback')
      }
    }

    // Listen for app URL opens (deep links)
    const setupListener = async () => {
      const listener = await App.addListener('appUrlOpen', handleAppUrlOpen)
      return listener
    }

    let listenerHandle: any = null
    
    setupListener().then(handle => {
      listenerHandle = handle
    })

    return () => {
      if (listenerHandle) {
        listenerHandle.remove()
      }
    }
  }, [])
}
