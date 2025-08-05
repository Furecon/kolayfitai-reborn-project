
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useToast } from '@/components/ui/use-toast'

interface ProfileData {
  name: string
  age: number | null
  gender: string | null
  height: number | null
  weight: number | null
  activity_level: string | null
  diet_goal: string | null
  daily_protein_goal: number | null
  daily_carbs_goal: number | null
  daily_fat_goal: number | null
}

export function ProfileSetup() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: null,
    gender: null,
    height: null,
    weight: null,
    activity_level: null,
    diet_goal: null,
    daily_protein_goal: null,
    daily_carbs_goal: null,
    daily_fat_goal: null
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setProfile({
        name: data.name || '',
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        activity_level: data.activity_level,
        diet_goal: (data as any).diet_goal || null,
        daily_protein_goal: data.daily_protein_goal,
        daily_carbs_goal: data.daily_carbs_goal,
        daily_fat_goal: data.daily_fat_goal
      })
    }
  }

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
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extremely_active': 1.9
    }
    return multipliers[activityLevel] || 1.2
  }

  const getDietAdjustment = (dietGoal: string) => {
    const adjustments: { [key: string]: number } = {
      'lose': -500,
      'gain': 500,
      'maintain': 0
    }
    return adjustments[dietGoal] || 0
  }

  const calculateMacroGoals = (calories: number) => {
    return {
      protein: Math.round((calories * 0.30) / 4), // 30% of calories from protein (4 cal/g)
      carbs: Math.round((calories * 0.40) / 4),   // 40% of calories from carbs (4 cal/g)
      fat: Math.round((calories * 0.30) / 9)      // 30% of calories from fat (9 cal/g)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    console.log('Starting profile update for user:', user.id)
    console.log('Profile data:', profile)
    setLoading(true)

    try {
      // Calculate BMR and daily calorie goal
      const bmr = calculateBMR(
        profile.gender!,
        profile.weight!,
        profile.height!,
        profile.age!
      )
      
      const activityMultiplier = getActivityMultiplier(profile.activity_level!)
      const dietAdjustment = getDietAdjustment(profile.diet_goal!)
      const dailyCalorieGoal = Math.round((bmr * activityMultiplier) + dietAdjustment)

      // Calculate macro goals
      const macroGoals = calculateMacroGoals(dailyCalorieGoal)

      const updateData: any = {
        user_id: user.id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activity_level: profile.activity_level,
        daily_calorie_goal: dailyCalorieGoal,
        daily_protein_goal: macroGoals.protein,
        daily_carbs_goal: macroGoals.carbs,
        daily_fat_goal: macroGoals.fat,
        updated_at: new Date().toISOString()
      }

      // Add diet_goal if it exists
      if (profile.diet_goal) {
        updateData.diet_goal = profile.diet_goal
      }

      console.log('Updating profile with data:', updateData)
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updateData)

      console.log('Profile update result:', { error })
      if (error) throw error

      toast({
        title: "Başarılı!",
        description: "Profil bilgileriniz ve makro hedefleriniz kaydedildi."
      })

    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Hata",
        description: "Profil güncellenirken hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-black">Profil Bilgileri</CardTitle>
          <p className="text-gray-600">
            Kişiselleştirilmiş kalori ve makro hedefleri için bilgilerinizi girin
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Yaş</Label>
                <Input
                  id="age"
                  type="number"
                  min="10"
                  max="100"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                  required
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Cinsiyet</Label>
                <Select value={profile.gender || ''} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Boy (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || null })}
                  required
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Kilo (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || null })}
                  required
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity_level">Aktivite Seviyesi</Label>
                <Select value={profile.activity_level || ''} onValueChange={(value) => setProfile({ ...profile, activity_level: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Aktivite seviyesi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Hareketsiz (Masa başı işi)</SelectItem>
                    <SelectItem value="lightly_active">Az Aktif (Haftada 1-3 gün egzersiz)</SelectItem>
                    <SelectItem value="moderately_active">Orta Aktif (Haftada 3-5 gün egzersiz)</SelectItem>
                    <SelectItem value="very_active">Çok Aktif (Haftada 6-7 gün egzersiz)</SelectItem>
                    <SelectItem value="extremely_active">Aşırı Aktif (Günde 2x egzersiz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet_goal">Hedef</Label>
              <Select value={profile.diet_goal || ''} onValueChange={(value) => setProfile({ ...profile, diet_goal: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Hedefinizi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Kilo Vermek (-500 kalori/gün)</SelectItem>
                  <SelectItem value="maintain">Kiloyu Korumak</SelectItem>
                  <SelectItem value="gain">Kilo Almak (+500 kalori/gün)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Profili Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
