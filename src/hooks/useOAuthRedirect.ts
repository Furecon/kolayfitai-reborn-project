
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
      
      // Check if this is an OAuth callback
      if (data.url.includes('oauth-callback')) {
        console.log('Processing OAuth callback...')
        
        // Close the browser first with a small delay
        setTimeout(async () => {
          try {
            await Browser.close()
            console.log('Browser closed successfully')
          } catch (closeError) {
            console.log('Browser close error (might already be closed):', closeError)
          }
        }, 100)

        try {
          // Parse URL to check for tokens or authorization code
          const url = new URL(data.url)
          const fragment = url.hash.substring(1) // Remove the #
          const searchParams = new URLSearchParams(url.search)
          
          console.log('URL search params:', url.search)
          console.log('URL hash fragment:', url.hash)
          
          // Check if we have an access token in the fragment (implicit flow)
          if (fragment && fragment.includes('access_token')) {
            console.log('Found access token in fragment, using setSession')
            const fragmentParams = new URLSearchParams(fragment)
            const accessToken = fragmentParams.get('access_token')
            const refreshToken = fragmentParams.get('refresh_token')
            const tokenType = fragmentParams.get('token_type') || 'bearer'
            
            if (accessToken) {
              const { data: sessionData, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              })
              
              if (error) {
                console.error('Set session error:', error)
              } else {
                console.log('Session set successfully via access token!')
                console.log('Session created:', !!sessionData.session)
                console.log('User data:', !!sessionData.user)
              }
            }
          }
          // Check if we have an authorization code (PKCE flow)
          else if (searchParams.has('code')) {
            console.log('Found authorization code, using exchangeCodeForSession')
            const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(data.url)
            
            if (error) {
              console.error('Exchange code error:', error)
              console.error('Full error object:', JSON.stringify(error, null, 2))
            } else {
              console.log('Session created successfully via code exchange!')
              console.log('Session created:', !!sessionData.session)
              console.log('User data:', !!sessionData.user)
            }
          }
          // Fallback: try to extract session from URL manually
          else {
            console.log('No access token or code found, trying manual URL parsing')
            console.log('Full URL for manual parsing:', data.url)
            
            // Try using Supabase's getSessionFromUrl method
            const { data: sessionData, error } = await supabase.auth.getSession()
            if (sessionData.session) {
              console.log('Existing session found!')
            } else {
              console.log('No existing session, OAuth might have failed')
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
