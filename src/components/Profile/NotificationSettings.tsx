import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Bell, Clock, Calendar, Plus, Trash2, Droplet } from 'lucide-react'

interface MealReminders {
  breakfast: boolean
  lunch: boolean
  dinner: boolean
}

interface WaterReminderTime {
  id: string
  time: string
}

interface NotificationPreferences {
  notification_settings: {
    meal_reminders: boolean
    water_reminders: boolean
    goal_notifications: boolean
    weekly_summary: boolean
  }
  reminder_times: {
    breakfast: string
    lunch: string
    dinner: string
  }
  meal_reminders_enabled: MealReminders
  water_reminder_times: WaterReminderTime[]
  water_reminder_interval: number
  quiet_hours_start: string
  quiet_hours_end: string
  weekend_notifications_enabled: boolean
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!data) {
        const defaultPrefs: NotificationPreferences = {
          notification_settings: {
            meal_reminders: true,
            water_reminders: true,
            goal_notifications: true,
            weekly_summary: true
          },
          reminder_times: {
            breakfast: '08:00',
            lunch: '12:30',
            dinner: '19:00'
          },
          meal_reminders_enabled: {
            breakfast: true,
            lunch: true,
            dinner: true
          },
          water_reminder_times: [
            { id: '1', time: '09:00' },
            { id: '2', time: '12:00' },
            { id: '3', time: '15:00' },
            { id: '4', time: '18:00' }
          ],
          water_reminder_interval: 0,
          quiet_hours_start: '22:00',
          quiet_hours_end: '07:00',
          weekend_notifications_enabled: true
        }
        setPreferences(defaultPrefs)
      } else {
        setPreferences({
          notification_settings: data.notification_settings as any,
          reminder_times: data.reminder_times as any,
          meal_reminders_enabled: data.meal_reminders_enabled || { breakfast: true, lunch: true, dinner: true },
          water_reminder_times: Array.isArray(data.water_reminder_times)
            ? data.water_reminder_times
            : [{ id: '1', time: '14:30' }],
          water_reminder_interval: data.water_reminder_interval || 0,
          quiet_hours_start: data.quiet_hours_start || '22:00',
          quiet_hours_end: data.quiet_hours_end || '07:00',
          weekend_notifications_enabled: data.weekend_notifications_enabled ?? true
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast({
        title: 'Hata',
        description: 'Bildirim ayarları yüklenemedi',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!preferences) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          notification_settings: preferences.notification_settings,
          reminder_times: preferences.reminder_times,
          meal_reminders_enabled: preferences.meal_reminders_enabled,
          water_reminder_times: preferences.water_reminder_times,
          water_reminder_interval: preferences.water_reminder_interval,
          quiet_hours_start: preferences.quiet_hours_start,
          quiet_hours_end: preferences.quiet_hours_end,
          weekend_notifications_enabled: preferences.weekend_notifications_enabled
        })

      if (error) throw error

      toast({
        title: 'Başarılı',
        description: 'Bildirim ayarlarınız kaydedildi'
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilemedi',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationSetting = (key: keyof typeof preferences.notification_settings, value: boolean) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      notification_settings: {
        ...preferences.notification_settings,
        [key]: value
      }
    })
  }

  const updateMealReminder = (meal: keyof MealReminders, enabled: boolean) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      meal_reminders_enabled: {
        ...preferences.meal_reminders_enabled,
        [meal]: enabled
      }
    })
  }

  const updateReminderTime = (meal: keyof typeof preferences.reminder_times, time: string) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      reminder_times: {
        ...preferences.reminder_times,
        [meal]: time
      }
    })
  }

  const addWaterReminder = () => {
    if (!preferences) return
    const newId = Date.now().toString()
    setPreferences({
      ...preferences,
      water_reminder_times: [
        ...preferences.water_reminder_times,
        { id: newId, time: '14:00' }
      ]
    })
  }

  const removeWaterReminder = (id: string) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      water_reminder_times: preferences.water_reminder_times.filter(r => r.id !== id)
    })
  }

  const updateWaterReminderTime = (id: string, time: string) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      water_reminder_times: preferences.water_reminder_times.map(r =>
        r.id === id ? { ...r, time } : r
      )
    })
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(time)
      }
    }
    return options
  }

  if (loading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Ayarları</CardTitle>
          <CardDescription>Yükleniyor...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Öğün Hatırlatmaları</CardTitle>
          </div>
          <CardDescription>
            Hangi öğünler için hatırlatma almak istediğinizi seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="meal-reminders">Öğün Hatırlatmalarını Aç/Kapat</Label>
              <p className="text-sm text-muted-foreground">
                Tüm öğün hatırlatmalarını toplu olarak açıp kapatın
              </p>
            </div>
            <Switch
              id="meal-reminders"
              checked={preferences.notification_settings.meal_reminders}
              onCheckedChange={(checked) => updateNotificationSetting('meal_reminders', checked)}
            />
          </div>

          {preferences.notification_settings.meal_reminders && (
            <div className="space-y-4 ml-6 border-l-2 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <Label>Kahvaltı</Label>
                    <p className="text-sm text-muted-foreground">
                      {preferences.reminder_times.breakfast}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={preferences.reminder_times.breakfast}
                    onValueChange={(value) => updateReminderTime('breakfast', value)}
                    disabled={!preferences.meal_reminders_enabled.breakfast}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={preferences.meal_reminders_enabled.breakfast}
                    onCheckedChange={(checked) => updateMealReminder('breakfast', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <Label>Öğle Yemeği</Label>
                    <p className="text-sm text-muted-foreground">
                      {preferences.reminder_times.lunch}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={preferences.reminder_times.lunch}
                    onValueChange={(value) => updateReminderTime('lunch', value)}
                    disabled={!preferences.meal_reminders_enabled.lunch}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={preferences.meal_reminders_enabled.lunch}
                    onCheckedChange={(checked) => updateMealReminder('lunch', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <Label>Akşam Yemeği</Label>
                    <p className="text-sm text-muted-foreground">
                      {preferences.reminder_times.dinner}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={preferences.reminder_times.dinner}
                    onValueChange={(value) => updateReminderTime('dinner', value)}
                    disabled={!preferences.meal_reminders_enabled.dinner}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={preferences.meal_reminders_enabled.dinner}
                    onCheckedChange={(checked) => updateMealReminder('dinner', checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            <CardTitle>Su İçme Hatırlatmaları</CardTitle>
          </div>
          <CardDescription>
            İstediğiniz saatlerde su içme hatırlatmaları ekleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="water-reminders">Su Hatırlatmalarını Aç/Kapat</Label>
              <p className="text-sm text-muted-foreground">
                Tüm su hatırlatmalarını toplu olarak açıp kapatın
              </p>
            </div>
            <Switch
              id="water-reminders"
              checked={preferences.notification_settings.water_reminders}
              onCheckedChange={(checked) => updateNotificationSetting('water_reminders', checked)}
            />
          </div>

          {preferences.notification_settings.water_reminders && (
            <div className="space-y-4 ml-6 border-l-2 pl-4">
              <div className="space-y-3">
                {preferences.water_reminder_times.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-2">
                    <Select
                      value={reminder.time}
                      onValueChange={(value) => updateWaterReminderTime(reminder.id, value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWaterReminder(reminder.id)}
                      disabled={preferences.water_reminder_times.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={addWaterReminder}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Su Hatırlatması Ekle
              </Button>

              <div className="pt-4 border-t">
                <Label>Veya Otomatik Aralıklarla Hatırlat</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  0 = Kapalı, Yukarıdaki saatleri kullan
                </p>
                <Select
                  value={preferences.water_reminder_interval.toString()}
                  onValueChange={(value) => setPreferences({ ...preferences, water_reminder_interval: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Kapalı (Manuel saatler)</SelectItem>
                    <SelectItem value="1">Her 1 saatte</SelectItem>
                    <SelectItem value="2">Her 2 saatte</SelectItem>
                    <SelectItem value="3">Her 3 saatte</SelectItem>
                    <SelectItem value="4">Her 4 saatte</SelectItem>
                  </SelectContent>
                </Select>
                {preferences.water_reminder_interval > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Otomatik mod aktif: Yukarıdaki manuel saatler kullanılmayacak
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Diğer Bildirimler</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="goal-notifications">Hedef Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Kalori hedeflerinde önemli durumlar
              </p>
            </div>
            <Switch
              id="goal-notifications"
              checked={preferences.notification_settings.goal_notifications}
              onCheckedChange={(checked) => updateNotificationSetting('goal_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-summary">Haftalık Özet</Label>
              <p className="text-sm text-muted-foreground">
                Pazar akşamları ilerleme raporu
              </p>
            </div>
            <Switch
              id="weekly-summary"
              checked={preferences.notification_settings.weekly_summary}
              onCheckedChange={(checked) => updateNotificationSetting('weekly_summary', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Sessiz Saatler</CardTitle>
          </div>
          <CardDescription>
            Bu saatler arasında bildirim almayacaksınız
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Başlangıç</Label>
            <Select
              value={preferences.quiet_hours_start}
              onValueChange={(value) => setPreferences({ ...preferences, quiet_hours_start: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateTimeOptions().map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Bitiş</Label>
            <Select
              value={preferences.quiet_hours_end}
              onValueChange={(value) => setPreferences({ ...preferences, quiet_hours_end: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateTimeOptions().map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Hafta Sonu Ayarları</CardTitle>
          </div>
          <CardDescription>
            Cumartesi ve Pazar için bildirim tercihleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekend-notifications">Hafta Sonu Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Hafta sonları da bildirim almak istiyorum
              </p>
            </div>
            <Switch
              id="weekend-notifications"
              checked={preferences.weekend_notifications_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, weekend_notifications_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadPreferences} disabled={saving}>
          İptal
        </Button>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
