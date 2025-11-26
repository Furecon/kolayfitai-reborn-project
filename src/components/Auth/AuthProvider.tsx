import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { usePlatform } from '@/hooks/usePlatform'
import GoogleAuth from '@/plugins/GoogleAuthPlugin'
import { purchaseService } from '@/services/PurchaseService'
import { paywallService } from '@/services/PaywallService'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'facebook' | 'apple') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { platform, isNative, isAndroid } = usePlatform()

  useEffect(() => {
    console.log('AuthProvider initialized for platform:', platform)

    // Initialize purchase and paywall services on app start
    const initializeServices = async () => {
      try {
        await purchaseService.initialize()
        console.log('✅ Purchase service initialized')

        await paywallService.initialize()
        console.log('✅ Paywall service initialized')
      } catch (error) {
        console.error('Failed to initialize services:', error)
      }
    }

    initializeServices()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      console.log('Initial session loaded:', session ? 'authenticated' : 'not authenticated')
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'authenticated' : 'not authenticated')
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [platform])

  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      console.log(`[OAuth] Starting OAuth flow for ${provider}`)
      console.log(`[OAuth] Platform: ${platform}, isNative: ${isNative}`)
      console.log(`[OAuth] GoogleAuth available:`, typeof GoogleAuth !== 'undefined')

      // TEMPORARY: Force web OAuth until google-services.json is added
      const forceWebOAuth = true

      // For native mobile, use native Google Auth plugin
      if (isNative && provider === 'google' && !forceWebOAuth) {
        console.log('[OAuth] Using native Google Auth for mobile')

        if (!GoogleAuth || typeof GoogleAuth.signIn !== 'function') {
          console.error('[OAuth] GoogleAuth plugin not available!')
          throw new Error('Google Auth plugin yüklenmedi. Uygulamayı yeniden başlatın.')
        }

        try {
          console.log('[OAuth] Calling GoogleAuth.signIn()...')
          const result = await GoogleAuth.signIn()
          console.log('[OAuth] Native Google sign in result:', result)

          if (!result?.authentication?.idToken) {
            throw new Error('ID token bulunamadı. Google Auth yapılandırmanızı kontrol edin.')
          }

          // Sign in to Supabase with the ID token
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: result.authentication.idToken,
            nonce: result.authentication.nonce,
          })

          if (error) {
            console.error('Supabase sign in error:', error)
            console.error('Error details:', {
              message: error.message,
              status: error.status,
              name: error.name
            })

            let errorMessage = error.message
            if (error.message.includes('invalid') || error.message.includes('path')) {
              errorMessage = 'OAuth yapılandırması hatalı. Lütfen Supabase\'de Google OAuth provider\'ı kontrol edin ve redirect URL\'leri ekleyin.'
            }

            toast({
              title: "Giriş Hatası",
              description: errorMessage,
              variant: "destructive"
            })
            throw error
          }

          console.log('Successfully signed in with Google (native)', data)
          toast({
            title: "Başarılı",
            description: "Google ile giriş yapıldı",
          })
          return
        } catch (error: any) {
          console.error('Native Google Auth error:', error)
          console.error('Full error object:', JSON.stringify(error, null, 2))

          let errorMessage = error.message || "Google girişi başarısız oldu"
          if (error.error === 12501) {
            errorMessage = "Google girişi iptal edildi"
          } else if (error.error === 10) {
            errorMessage = "Google Play Services hatası. Cihazınızı kontrol edin."
          }

          toast({
            title: "Giriş Hatası",
            description: errorMessage,
            variant: "destructive"
          })
          throw error
        }
      }

      // For web or other providers, use standard OAuth flow
      console.log('[OAuth] Using web OAuth flow')
      console.log('[OAuth] isNative:', isNative, 'provider:', provider)

      const redirectTo = isNative
        ? 'com.kolayfit.app://oauth-callback'
        : `${window.location.origin}/`

      console.log('[OAuth] Redirect URL:', redirectTo)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo
        }
      })

      if (error) {
        console.error('[OAuth] Supabase OAuth error:', error)
        toast({
          title: "Giriş Hatası",
          description: `${provider} girişi başarısız: ${error.message}`,
          variant: "destructive"
        })
        throw error
      }

      if (data.url) {
        console.log('[OAuth] Redirecting to OAuth provider:', data.url)
        window.location.href = data.url
      }

      console.log(`[OAuth] OAuth flow initiated successfully for ${provider}`)
    } catch (error: any) {
      console.error('OAuth exception:', error)
      toast({
        title: "Giriş Hatası",
        description: error.message || "Bir hata oluştu",
        variant: "destructive"
      })
      throw error
    }
  }


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }

    toast({
      title: "Başarılı!",
      description: "Hesabınıza giriş yaptınız."
    })
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectTo = `${window.location.origin}/`

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }

    toast({
      title: "Başarılı!",
      description: "Hesabınız oluşturuldu. Lütfen e-postanızı kontrol edin."
    })
  }

  const signOut = async () => {
    try {
      // Check if there's an active session before attempting to sign out
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (!currentSession) {
        console.log('[SignOut] No active session, clearing local state')
        // Clear local state even if no server session
        setSession(null)
        setUser(null)
        toast({
          title: "Çıkış Yapıldı",
          description: "Başarıyla çıkış yaptınız."
        })
        return
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[SignOut] Error:', error)
        // If error is about missing session, still clear local state
        if (error.message.includes('session') || error.message.includes('Session')) {
          console.log('[SignOut] Session error, clearing local state anyway')
          setSession(null)
          setUser(null)
          toast({
            title: "Çıkış Yapıldı",
            description: "Başarıyla çıkış yaptınız."
          })
          return
        }

        toast({
          title: "Çıkış Hatası",
          description: error.message,
          variant: "destructive"
        })
        throw error
      }

      // Clear local state
      setSession(null)
      setUser(null)

      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız."
      })
    } catch (error: any) {
      console.error('[SignOut] Exception:', error)
      // Even on exception, try to clear local state
      setSession(null)
      setUser(null)

      toast({
        title: "Çıkış Yapıldı",
        description: "Oturum sonlandırıldı."
      })
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
