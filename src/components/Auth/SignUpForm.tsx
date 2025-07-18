
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from './AuthProvider'
import { OnboardingFlow, OnboardingData } from '../Onboarding/OnboardingFlow'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signUp(email, password, fullName)
      setShowOnboarding(true)
    } catch (error) {
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setOnboardingData(data)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Calculate BMR and daily calorie goal
        const calculateBMR = (gender: string, weight: number, height: number, age: number) => {
          if (gender === 'male') {
            return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
          } else {
            return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
          }
        }

        const getActivityMultiplier = (activityLevel: string) => {
          const multipliers: { [key: string]: number } = {
            'sedentary': 1.2,
            'moderately_active': 1.55,
            'very_active': 1.725
          }
          return multipliers[activityLevel] || 1.2
        }

        const getDietAdjustment = (goal: string) => {
          const adjustments: { [key: string]: number } = {
            'lose': -500,
            'gain': 500,
            'maintain': 0
          }
          return adjustments[goal] || 0
        }

        const bmr = calculateBMR(data.gender!, data.weight!, data.height!, data.age!)
        const activityMultiplier = getActivityMultiplier(data.activityLevel!)
        const dietAdjustment = getDietAdjustment(data.goal!)
        const dailyCalorieGoal = Math.round((bmr * activityMultiplier) + dietAdjustment)

        // Save profile data
        const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            name: fullName,
            age: data.age,
            gender: data.gender,
            height: data.height,
            weight: data.weight,
            activity_level: data.activityLevel,
            daily_calorie_goal: dailyCalorieGoal,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Profile save error:', error)
          toast({
            title: "Hata",
            description: "Profil bilgileri kaydedilirken hata oluştu.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Hoş Geldin!",
            description: "Hesabın başarıyla oluşturuldu ve profil bilgilerin kaydedildi."
          })
        }
      }
    } catch (error) {
      console.error('Profile setup error:', error)
      toast({
        title: "Hata",
        description: "Profil kurulumu sırasında hata oluştu.",
        variant: "destructive"
      })
    }
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-black">Hesap Oluştur</CardTitle>
        <p className="text-center text-gray-600">KolayfitAI'ye hoş geldin!</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="Şifre (en az 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-gray-300"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={loading}
          >
            {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Zaten hesabın var mı?{' '}
            <button
              onClick={onToggleMode}
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
