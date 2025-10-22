import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export function useOAuthRedirect() {
  useEffect(() => {
    const processOAuthCallback = async (url?: string) => {
      const targetUrl = url || window.location.href
      const hash = url ? '' : window.location.hash
      const searchParams = new URLSearchParams(url ? new URL(url).search : window.location.search)

      console.log('Checking for OAuth callback...', { targetUrl, hash })

      if (hash && hash.includes('access_token')) {
        console.log('Processing OAuth callback from URL hash...')

        try {
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error('OAuth session error:', error)
          } else if (data.session) {
            console.log('OAuth session established successfully:', data.session.user.email)
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error)
        }
      } else if (searchParams.has('code')) {
        console.log('Processing OAuth code from URL params...')

        try {
          const code = searchParams.get('code')
          console.log('Exchanging code for session...')

          const { data, error } = await supabase.auth.exchangeCodeForSession(code!)

          if (error) {
            console.error('OAuth code exchange error:', error)
          } else if (data.session) {
            console.log('OAuth session established successfully:', data.session.user.email)
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch (error) {
          console.error('Error processing OAuth code:', error)
        }
      }
    }

    processOAuthCallback()

    if (Capacitor.isNativePlatform()) {
      console.log('Setting up mobile deep link listener...')

      const listener = CapacitorApp.addListener('appUrlOpen', (event) => {
        console.log('Deep link received:', event.url)

        if (event.url.includes('oauth-callback')) {
          console.log('OAuth callback deep link detected')
          processOAuthCallback(event.url)
        }
      })

      return () => {
        listener.then(l => l.remove())
      }
    } else {
      const handleHashChange = () => {
        processOAuthCallback()
      }

      window.addEventListener('hashchange', handleHashChange)

      return () => {
        window.removeEventListener('hashchange', handleHashChange)
      }
    }
  }, [])
}
