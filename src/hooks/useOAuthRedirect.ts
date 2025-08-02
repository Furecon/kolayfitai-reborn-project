
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
        
        // Immediate browser close attempt
        try {
          await Browser.close()
          console.log('Browser closed immediately')
        } catch (closeError) {
          console.log('Initial browser close failed:', closeError)
        }
        
        // Backup browser close with delay
        setTimeout(async () => {
          try {
            await Browser.close()
            console.log('Browser closed with delay')
          } catch (closeError) {
            console.log('Delayed browser close also failed:', closeError)
          }
        }, 500)

        try {
          // Parse URL to check for tokens or authorization code
          const url = new URL(data.url)
          const fragment = url.hash.substring(1) // Remove the #
          const searchParams = new URLSearchParams(url.search)
          
          console.log('=== OAuth Deep Link Debug ===')
          console.log('Full URL:', data.url)
          console.log('URL search params:', url.search)
          console.log('URL hash fragment:', url.hash)
          console.log('Search params keys:', Array.from(searchParams.keys()))
          console.log('Fragment length:', fragment.length)
          
          // Priority 1: Check for authorization code (PKCE flow - recommended)
          if (searchParams.has('code')) {
            console.log('🔑 Found authorization code, using exchangeCodeForSession')
            const code = searchParams.get('code')
            console.log('Code length:', code?.length)
            
            const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(data.url)
            
            if (error) {
              console.error('❌ Exchange code error:', error)
              console.error('Full error object:', JSON.stringify(error, null, 2))
            } else {
              console.log('✅ Session created successfully via code exchange!')
              console.log('Session exists:', !!sessionData.session)
              console.log('User exists:', !!sessionData.user)
              console.log('User email:', sessionData.user?.email)
            }
          }
          // Priority 2: Check for access token in fragment (implicit flow)
          else if (fragment && fragment.includes('access_token')) {
            console.log('🎫 Found access token in fragment, using setSession')
            const fragmentParams = new URLSearchParams(fragment)
            const accessToken = fragmentParams.get('access_token')
            const refreshToken = fragmentParams.get('refresh_token')
            
            console.log('Access token length:', accessToken?.length)
            console.log('Refresh token exists:', !!refreshToken)
            
            if (accessToken) {
              const { data: sessionData, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              })
              
              if (error) {
                console.error('❌ Set session error:', error)
              } else {
                console.log('✅ Session set successfully via access token!')
                console.log('Session exists:', !!sessionData.session)
                console.log('User exists:', !!sessionData.user)
                console.log('User email:', sessionData.user?.email)
              }
            }
          }
          // Priority 3: Check for error in URL
          else if (searchParams.has('error')) {
            const error = searchParams.get('error')
            const errorDescription = searchParams.get('error_description')
            console.error('🚫 OAuth error in URL:', error)
            console.error('Error description:', errorDescription)
          }
          // Priority 4: Fallback - check existing session
          else {
            console.log('⚠️ No code or token found, checking existing session')
            console.log('URL might be malformed or incomplete')
            
            const { data: sessionData, error } = await supabase.auth.getSession()
            if (sessionData.session) {
              console.log('✅ Existing session found!')
              console.log('User email:', sessionData.session.user?.email)
            } else {
              console.log('❌ No existing session, OAuth flow failed')
              if (error) console.error('Session error:', error)
            }
          }
          
        } catch (error) {
          console.error('💥 Critical error processing OAuth callback:', error)
          console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
          console.error('Error message:', error instanceof Error ? error.message : String(error))
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
