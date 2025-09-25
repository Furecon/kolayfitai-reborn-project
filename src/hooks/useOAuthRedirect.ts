
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useOAuthRedirect() {
  useEffect(() => {
    // Handle OAuth redirects for web platform
    const handleHashChange = async () => {
      const hash = window.location.hash
      
      if (hash && hash.includes('access_token')) {
        console.log('Processing OAuth callback from URL hash...')
        
        try {
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('OAuth session error:', error)
          } else if (data.session) {
            console.log('OAuth session established successfully')
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error)
        }
      }
    }

    // Handle URL parameters for OAuth
    const handleUrlParams = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      
      if (urlParams.has('code')) {
        console.log('Processing OAuth code from URL params...')
        
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          
          if (error) {
            console.error('OAuth code exchange error:', error)
          } else {
            console.log('OAuth session established successfully')
            // Clear the URL parameters
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch (error) {
          console.error('Error processing OAuth code:', error)
        }
      }
    }

    // Check for OAuth callback on component mount
    handleHashChange()
    handleUrlParams()
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])
}
