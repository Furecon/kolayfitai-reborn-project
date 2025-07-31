
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { supabase } from '@/integrations/supabase/client'

export function useOAuthRedirect() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleAppUrlOpen = async (data: { url: string }) => {
      console.log('Deep link received:', data.url)
      
      // Check if this is an OAuth callback
      if (data.url.includes('oauth-callback')) {
        console.log('Processing OAuth callback...')
        try {
          // Use exchangeCodeForSession to handle the OAuth callback
          const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(data.url)
          
          if (error) {
            console.error('OAuth callback error:', error)
          } else {
            console.log('OAuth callback successful, session created:', sessionData.session ? 'yes' : 'no')
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error)
        }
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
