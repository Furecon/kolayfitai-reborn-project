
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Capacitor } from '@capacitor/core'

// Dynamic import for Google Auth to handle potential missing dependency
let GoogleAuth: any = null
if (Capacitor.isNativePlatform()) {
  try {
    import('@capacitor/google-auth').then((module) => {
      GoogleAuth = module.GoogleAuth
    })
  } catch (error) {
    console.warn('Google Auth plugin not available:', error)
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'facebook' | 'apple') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize Google Auth for native platforms
    if (Capacitor.isNativePlatform() && GoogleAuth) {
      GoogleAuth.initialize()
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      if (provider === 'google' && Capacitor.isNativePlatform() && GoogleAuth) {
        // Native Android Google Auth
        const result = await GoogleAuth.signIn()
        
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: result.authentication.idToken,
        })

        if (error) {
          toast({
            title: "Giriş Hatası",
            description: error.message,
            variant: "destructive"
          })
          throw error
        }
      } else {
        // Web OAuth flow (fallback)
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/`
          }
        })

        if (error) {
          toast({
            title: "Giriş Hatası",
            description: error.message,
            variant: "destructive"
          })
          throw error
        }
      }
    } catch (error: any) {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
