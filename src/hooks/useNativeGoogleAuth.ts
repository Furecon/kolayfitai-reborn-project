import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export function useNativeGoogleAuth() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const signInWithGoogle = async () => {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Native Google Auth only works on mobile platforms')
    }

    setLoading(true)
    try {
      console.log('Starting native Google Auth...')
      
      // Initialize Google Auth if needed
      await GoogleAuth.initialize()
      
      // Sign in with Google
      const result = await GoogleAuth.signIn()
      console.log('Google Auth result:', result)

      if (!result.authentication?.idToken) {
        throw new Error('No ID token received from Google')
      }

      // Sign in to Supabase with the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.authentication.idToken,
        access_token: result.authentication.accessToken
      })

      if (error) {
        console.error('Supabase auth error:', error)
        throw error
      }

      console.log('Successfully signed in with native Google Auth')
      toast({
        title: "Başarılı!",
        description: "Google hesabınızla giriş yaptınız."
      })

      return data
    } catch (error: any) {
      console.error('Native Google Auth error:', error)
      toast({
        title: "Giriş Hatası",
        description: error.message || "Google girişi başarısız",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { signInWithGoogle, loading }
}