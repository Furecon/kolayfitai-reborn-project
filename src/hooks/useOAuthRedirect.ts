
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { supabase } from '@/integrations/supabase/client'

export function useOAuthRedirect() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleAppUrlOpen = async (data: { url: string }) => {
      console.log('App URL opened:', data.url)
      
      // Check if this is an OAuth callback
      if (data.url.includes('oauth-callback')) {
        try {
          // Extract the URL fragments/query parameters
          const url = new URL(data.url)
          const fragment = url.hash || url.search
          
          if (fragment) {
            // Handle the OAuth callback
            const { error } = await supabase.auth.getSessionFromUrl({
              url: data.url,
              storeSession: true
            })
            
            if (error) {
              console.error('OAuth callback error:', error)
            } else {
              console.log('OAuth callback successful')
            }
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error)
        }
      }
    }

    // Listen for app URL opens (deep links)
    const listener = App.addListener('appUrlOpen', handleAppUrlOpen)

    return () => {
      listener.remove()
    }
  }, [])
}
