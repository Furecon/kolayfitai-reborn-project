import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { usePlatform } from '@/hooks/usePlatform'
import GoogleAuth from '@/plugins/GoogleAuthPlugin'

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
      console.log(`Starting OAuth flow for ${provider} on platform: ${platform}`)

      // For native mobile, use native Google Auth plugin
      if (isNative && provider === 'google') {
        console.log('Using native Google Auth for mobile')

        try {
          const result = await GoogleAuth.signIn()
          console.log('Native Google sign in result:', result)

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
      const redirectTo = isNative
        ? 'com.kolayfitai.app://oauth-callback'
        : `${window.location.origin}/`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        toast({
          title: "Giriş Hatası",
          description: `${provider} girişi başarısız: ${error.message}`,
          variant: "destructive"
        })
        throw error
      }

      if (data.url) {
        console.log('Redirecting to OAuth provider:', data.url)
        window.location.href = data.url
      }

      console.log(`OAuth flow initiated successfully for ${provider}`)
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
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Çıkış Hatası",
        description: error.message,
        variant: "destructive"
      })
      throw error
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
