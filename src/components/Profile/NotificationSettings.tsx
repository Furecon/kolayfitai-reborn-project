import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TimePickerDialog } from '@/components/ui/time-picker-dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Bell, Clock, Calendar, Plus, Trash2, Droplet } from 'lucide-react'
import { notificationManager } from '@/lib/notificationManager'

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
  notification_alert_style: 'sound' | 'vibrate'
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingNotification, setTestingNotification] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [timePickerOpen, setTimePickerOpen] = useState(false)
  const [editingTime, setEditingTime] = useState<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'water' | 'quiet_start' | 'quiet_end'
    waterId?: string
    value: string
  } | null>(null)
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
          weekend_notifications_enabled: true,
          notification_alert_style: 'vibrate'
        }
        setPreferences(defaultPrefs)
      } else {
        console.log('📥 Loaded from DB:', JSON.stringify({
          reminder_times: data.reminder_times,
          water_reminder_times: data.water_reminder_times,
          water_reminder_times_type: typeof data.water_reminder_times,
          water_reminder_times_length: Array.isArray(data.water_reminder_times) ? data.water_reminder_times.length : 'not array',
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end
        }))

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
          weekend_notifications_enabled: data.weekend_notifications_enabled ?? true,
          notification_alert_style: data.notification_alert_style || 'vibrate'
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

      console.log('💾 Saving preferences:', JSON.stringify({
        reminder_times: preferences.reminder_times,
        water_reminder_times: preferences.water_reminder_times,
        quiet_hours_start: preferences.quiet_hours_start,
        quiet_hours_end: preferences.quiet_hours_end
      }))

      const { data: upsertData, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            notification_settings: preferences.notification_settings,
            reminder_times: preferences.reminder_times,
            meal_reminders_enabled: preferences.meal_reminders_enabled,
            water_reminder_times: preferences.water_reminder_times,
            water_reminder_interval: preferences.water_reminder_interval,
            quiet_hours_start: preferences.quiet_hours_start,
            quiet_hours_end: preferences.quiet_hours_end,
            weekend_notifications_enabled: preferences.weekend_notifications_enabled,
            notification_alert_style: preferences.notification_alert_style
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        )
        .select()

      console.log('✅ Upsert result:', JSON.stringify({ data: upsertData, error }))

      if (error) {
        console.error('❌ Upsert error:', error)
        throw error
      }

      // Bildirimleri yeniden planla
      console.log('📲 Initializing notifications for user:', user.id)
      await notificationManager.initializeNotifications(user.id)
      console.log('✅ Notifications initialized successfully')

      // Database'den güncel değerleri yeniden yükle
      await loadPreferences()

      toast({
        title: 'Başarılı',
        description: 'Bildirim ayarlarınız kaydedildi ve bildirimler yeniden planlandı'
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

  const testNotification = async () => {
    setTestingNotification(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const success = await notificationManager.sendTestNotification(user.id)

      if (success) {
        toast({
          title: 'Test Bildirimi Gönderildi',
          description: '5 saniye içinde bir test bildirimi alacaksınız'
        })
      } else {
        toast({
          title: 'Hata',
          description: 'Bildirim izinleri verilmemiş. Lütfen cihaz ayarlarından bildirim izinlerini kontrol edin.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error testing notification:', error)
      toast({
        title: 'Hata',
        description: 'Test bildirimi gönderilemedi',
        variant: 'destructive'
      })
    } finally {
      setTestingNotification(false)
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
    const updatedTimes = preferences.water_reminder_times.map(r =>
      r.id === id ? { ...r, time } : r
    )

    setPreferences({
      ...preferences,
      water_reminder_times: updatedTimes
    })
  }

  const openTimePicker = (
    type: 'breakfast' | 'lunch' | 'dinner' | 'water' | 'quiet_start' | 'quiet_end',
    waterId?: string
  ) => {
    if (!preferences) return

    let value = '14:00'
    if (type === 'breakfast' || type === 'lunch' || type === 'dinner') {
      value = preferences.reminder_times[type]
    } else if (type === 'water' && waterId) {
      const reminder = preferences.water_reminder_times.find(r => r.id === waterId)
      value = reminder?.time || '14:00'
    } else if (type === 'quiet_start') {
      value = preferences.quiet_hours_start
    } else if (type === 'quiet_end') {
      value = preferences.quiet_hours_end
    }

    setEditingTime({ type, waterId, value })
    setTimePickerOpen(true)
  }

  const handleTimeConfirm = (time: string) => {
    if (!editingTime || !preferences) return

    const { type, waterId } = editingTime
    console.log('⏰ Time confirmed:', JSON.stringify({ type, waterId, time }))

    if (type === 'breakfast' || type === 'lunch' || type === 'dinner') {
      const newPrefs = {
        ...preferences,
        reminder_times: {
          ...preferences.reminder_times,
          [type]: time
        }
      }
      console.log('🍽️ Updated meal time:', JSON.stringify({ type, time, newTimes: newPrefs.reminder_times }))
      setPreferences(newPrefs)
    } else if (type === 'water' && waterId) {
      updateWaterReminderTime(waterId, time)
      console.log('💧 Updated water time:', JSON.stringify({ waterId, time }))
    } else if (type === 'quiet_start') {
      const newPrefs = { ...preferences, quiet_hours_start: time }
      console.log('🌙 Updated quiet start:', JSON.stringify({ time }))
      setPreferences(newPrefs)
    } else if (type === 'quiet_end') {
      const newPrefs = { ...preferences, quiet_hours_end: time }
      console.log('☀️ Updated quiet end:', JSON.stringify({ time }))
      setPreferences(newPrefs)
    }

    setEditingTime(null)
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
                  <Label>Kahvaltı</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openTimePicker('breakfast')}
                    disabled={!preferences.meal_reminders_enabled.breakfast}
                    className="w-24 font-mono"
                  >
                    {preferences.reminder_times.breakfast}
                  </Button>
                  <Switch
                    checked={preferences.meal_reminders_enabled.breakfast}
                    onCheckedChange={(checked) => updateMealReminder('breakfast', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label>Öğle Yemeği</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openTimePicker('lunch')}
                    disabled={!preferences.meal_reminders_enabled.lunch}
                    className="w-24 font-mono"
                  >
                    {preferences.reminder_times.lunch}
                  </Button>
                  <Switch
                    checked={preferences.meal_reminders_enabled.lunch}
                    onCheckedChange={(checked) => updateMealReminder('lunch', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label>Akşam Yemeği</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openTimePicker('dinner')}
                    disabled={!preferences.meal_reminders_enabled.dinner}
                    className="w-24 font-mono"
                  >
                    {preferences.reminder_times.dinner}
                  </Button>
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
                    <Button
                      variant="outline"
                      onClick={() => openTimePicker('water', reminder.id)}
                      className="flex-1 font-mono"
                    >
                      {reminder.time}
                    </Button>
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
                <Label>Otomatik Aralıklarla Hatırlat</Label>
                <Select
                  value={preferences.water_reminder_interval.toString()}
                  onValueChange={(value) => setPreferences({ ...preferences, water_reminder_interval: parseInt(value) })}
                  className="mt-2"
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
            <Button
              variant="outline"
              onClick={() => openTimePicker('quiet_start')}
              className="w-24 font-mono"
            >
              {preferences.quiet_hours_start}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Label>Bitiş</Label>
            <Button
              variant="outline"
              onClick={() => openTimePicker('quiet_end')}
              className="w-24 font-mono"
            >
              {preferences.quiet_hours_end}
            </Button>
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration">Titreşim</Label>
              <p className="text-sm text-muted-foreground">
                Bildirimler geldiğinde titreşim olsun
              </p>
            </div>
            <Switch
              id="vibration"
              checked={preferences.notification_alert_style !== 'sound'}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, notification_alert_style: checked ? 'vibrate' : 'sound' })
              }
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

      <TimePickerDialog
        open={timePickerOpen}
        onOpenChange={setTimePickerOpen}
        value={editingTime?.value || '14:00'}
        onConfirm={handleTimeConfirm}
        title="Saat Seçin"
      />
    </div>
  )
}
