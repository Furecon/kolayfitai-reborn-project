
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useOAuthRedirect() {
  useEffect(() => {
    const processOAuthCallback = async () => {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)

      console.log('Checking for OAuth callback...')
      console.log('Hash:', hash)
      console.log('Search params:', window.location.search)

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

    const handleHashChange = () => {
      processOAuthCallback()
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])
}
