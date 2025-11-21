import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { ArrowLeft, Target, Flame } from 'lucide-react'

interface DailyGoalsSettingsProps {
  onBack?: () => void
}

export function DailyGoalsSettings({ onBack }: DailyGoalsSettingsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [goals, setGoals] = useState({
    daily_protein_goal: 0,
    daily_carbs_goal: 0,
    daily_fat_goal: 0,
    daily_calorie_goal: 0,
    diet_goal: '',
    activity_level: ''
  })

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('daily_protein_goal, daily_carbs_goal, daily_fat_goal, daily_calorie_goal, diet_goal, activity_level')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching goals:', error)
    } else if (data) {
      setGoals({
        daily_protein_goal: data.daily_protein_goal || 0,
        daily_carbs_goal: data.daily_carbs_goal || 0,
        daily_fat_goal: data.daily_fat_goal || 0,
        daily_calorie_goal: data.daily_calorie_goal || 0,
        diet_goal: data.diet_goal || '',
        activity_level: data.activity_level || ''
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_protein_goal: goals.daily_protein_goal,
          daily_carbs_goal: goals.daily_carbs_goal,
          daily_fat_goal: goals.daily_fat_goal,
          daily_calorie_goal: goals.daily_calorie_goal,
          diet_goal: goals.diet_goal,
          activity_level: goals.activity_level,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Başarılı!',
        description: 'Günlük hedefleriniz güncellendi.'
      })

      if (onBack) onBack()
    } catch (error) {
      console.error('Error saving goals:', error)
      toast({
        title: 'Hata',
        description: 'Hedefler kaydedilirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const totalCalories = (goals.daily_protein_goal * 4) + (goals.daily_carbs_goal * 4) + (goals.daily_fat_goal * 9)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 mb-2 h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-semibold">Günlük Hedefler</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">Kalori ve makro hedeflerinizi ayarlayın</p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-6">
        <div className="max-w-screen-2xl mx-auto space-y-6">

          {/* Current Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Mevcut Hedefler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Kalori</p>
                  <p className="text-2xl font-bold text-red-600">{Math.round(totalCalories)}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Protein</p>
                  <p className="text-2xl font-bold text-blue-600">{goals.daily_protein_goal}</p>
                  <p className="text-xs text-gray-500">gram</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Karbonhidrat</p>
                  <p className="text-2xl font-bold text-orange-600">{goals.daily_carbs_goal}</p>
                  <p className="text-xs text-gray-500">gram</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Yağ</p>
                  <p className="text-2xl font-bold text-green-600">{goals.daily_fat_goal}</p>
                  <p className="text-xs text-gray-500">gram</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktivite Seviyesi</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={goals.activity_level}
                onValueChange={(value) => setGoals({ ...goals, activity_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aktivite seviyenizi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedanter">Sedanter (Hareketsiz)</SelectItem>
                  <SelectItem value="az_aktif">Az Aktif (Haftada 1-3 gün)</SelectItem>
                  <SelectItem value="orta_aktif">Orta Aktif (Haftada 3-5 gün)</SelectItem>
                  <SelectItem value="çok_aktif">Çok Aktif (Haftada 6-7 gün)</SelectItem>
                  <SelectItem value="extra_aktif">Extra Aktif (Günde 2 kez)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Diet Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diyet Hedefi</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={goals.diet_goal}
                onValueChange={(value) => setGoals({ ...goals, diet_goal: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hedefinizi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kilo_ver">Kilo Vermek</SelectItem>
                  <SelectItem value="koru">Mevcut Kilonu Korumak</SelectItem>
                  <SelectItem value="kilo_al">Kilo Almak</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Macro Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Makro Besin Hedefleri</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Günlük makro hedeflerinizi gram cinsinden girin</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (gram)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={goals.daily_protein_goal || ''}
                  onChange={(e) => setGoals({ ...goals, daily_protein_goal: parseInt(e.target.value) || 0 })}
                  placeholder="Örn: 150"
                />
                <p className="text-xs text-gray-500">Önerilen: Vücut ağırlığınızın 1.6-2.2 katı (kg başına)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs">Karbonhidrat (gram)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={goals.daily_carbs_goal || ''}
                  onChange={(e) => setGoals({ ...goals, daily_carbs_goal: parseInt(e.target.value) || 0 })}
                  placeholder="Örn: 200"
                />
                <p className="text-xs text-gray-500">Önerilen: Günlük kalorinin %40-50'si</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat">Yağ (gram)</Label>
                <Input
                  id="fat"
                  type="number"
                  value={goals.daily_fat_goal || ''}
                  onChange={(e) => setGoals({ ...goals, daily_fat_goal: parseInt(e.target.value) || 0 })}
                  placeholder="Örn: 60"
                />
                <p className="text-xs text-gray-500">Önerilen: Günlük kalorinin %25-35'i</p>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-800">
                💡 <strong>İpucu:</strong> Girdiğiniz makro değerlere göre toplam kalori hesaplanır:
                Protein ve Karbonhidrat 4 kcal/g, Yağ 9 kcal/g olarak hesaplanır.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-20 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg font-semibold"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
