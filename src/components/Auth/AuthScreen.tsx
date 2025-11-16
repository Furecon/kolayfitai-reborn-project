
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { useNavigation } from '@/hooks/useNavigation'

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)

  // Allow app exit on auth screen
  useNavigation({
    enableHardwareBackButton: true,
    customBackHandler: () => {
      // Always allow exit from auth screen
      return false
    }
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png" 
              alt="KolayfitAi" 
              className="h-20 mx-auto mb-4"
            />
          </div>
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>

      {/* Legal Footer */}
      <footer className="bg-muted/30 border-t border-border/40 py-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link 
              to="/legal/privacy" 
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Gizlilik Politikası
            </Link>
            <span>•</span>
            <Link 
              to="/legal/terms" 
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Kullanım Şartları
            </Link>
            <span>•</span>
            <Link 
              to="/legal/contact" 
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              İletişim
            </Link>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              © 2024 KolayfitAi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
